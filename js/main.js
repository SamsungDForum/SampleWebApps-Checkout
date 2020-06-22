App = window.App || {};

App.Main = (function Main() {
    var logger = App.Logger.create({
        loggerEl: document.querySelector('.logsContainer'),
        loggerName: 'Main',
        logLevel: App.Logger.logLevels.ALL
    });
    var basicMenu;
    var productsListEl;
    var UniqueCustomId;
    var countryCode;
    var DPIService = null;
    var DynamicClient = null;
    var smartTVServerType = null;
    var basicController = null;
    var dynamicController = null;
    var subscriptionController = null;

    basicMenu = App.Navigation.getMenu('Basic');

    function addButtonsHandlers() {
        var buttonsWithHandlers = [
            {
                elementSelector: '.show-products-list',
                handler: requireLogin(basicController.onShowProductsList)
            },
            {
                elementSelector: '.show-dynamic-products',
                handler: requireLogin(dynamicController.onShowDynamicProducts)
            },
            {
                elementSelector: '.show-subscription',
                handler: requireLogin(subscriptionController.onShowSubscriptions)
            }
        ];

        App.KeyHandler.addHandlersForButtons(buttonsWithHandlers);
    }

    /**
     * Billing - methods concerning strictly webapis.billing API
     */

    function buyItem(item) {
        var paymentDetails = {
            OrderItemID: item.ItemID,
            OrderTitle: item.ItemTitle,
            OrderTotal: item.Price.toString(),
            OrderCurrencyID: item.CurrencyID,
            OrderCustomID: UniqueCustomId
        };

        if (App.CheckoutUtils.isProductAlreadyOwned(item.ItemID)) {
            logger.log('[BuyItem] Product "' + item.ItemTitle + '" was already bought');
            return;
        }

        logger.log('[BuyItem] Purchase of "' + item.ItemTitle + '" has started');
        webapis.billing.buyItem(
            App.Config.getAppId(),
            DPIService.getServerType(),
            JSON.stringify(paymentDetails),
            onBuyItem,
            onBuyItemError
        );
    }

    function onBuyItem(data) {
        var statesHandlers = {
            SUCCESS: onBuyItemSuccess,
            FAILED: onBuyItemFailed,
            CANCEL: onBuyItemCancel
        };
        var stateHandler = statesHandlers[data.payResult];

        if (typeof stateHandler === 'function') {
            stateHandler(data);
        } else {
            logger.log('[onBuyItemUnknown]', data);
        }
    }

    function onBuyItemSuccess(data) {
        var payDetail = JSON.parse(data.payDetail);
        var message = 'Product "' + payDetail.OrderTitle + '" was successfully bought';
        logger.log('[BuyItem] ' + message);
        basicController.onShowProductsList();
    }

    function onBuyItemFailed(data) {
        var payDetail = JSON.parse(data.payDetail);
        var message = 'Purchase of "' + payDetail.OrderTitle + '" has failed';
        logger.log('[BuyItem] ' + message);
    }

    function onBuyItemCancel(data) {
        var payDetail = JSON.parse(data.payDetail);
        var message = 'Purchase of "' + payDetail.OrderTitle + '" was cancelled';
        logger.log('[BuyItem] ' + message);
    }

    function onBuyItemError(error) {
        logger.error('[onBuyItemError] status:['
            + error.code + '] errorName:[' + error.name + '] errorMessage:[' + error.message + ']');
    }

    function buyDynamicItem(item) {
        var paymentDetails = {
            OrderItemID: item.ItemID,
            OrderTitle: item.ItemTitle,
            OrderTotal: item.Price.toString(),
            OrderCurrencyID: item.CurrencyID,
            OrderCustomID: UniqueCustomId,
            DynmcProductID: item.customId
        };

        if (App.CheckoutUtils.isDynamicProductAlreadyOwned(item.customId)) {
            logger.log('[BuyDynamicItem] Product "' + item.title + '" was already bought');
            return;
        }

        logger.log(item);
        logger.log('[BuyDynamicItem] Purchase of "' + item.ItemTitle + '" has started');

        webapis.billing.buyItem(
            App.Config.getAppId(),
            DPIService.getServerType(),
            JSON.stringify(paymentDetails),
            function (data) {
                if (data.payResult === 'SUCCESS') {
                    DynamicClient.registerTransaction(item, function () {
                        onBuyDynamicItemSuccess(data);
                    }, logger.error);
                } else {
                    onBuyItem(data);
                }
            },
            onBuyItemError
        );
    }

    function onBuyDynamicItemSuccess(data) {
        var payDetail = JSON.parse(data.payDetail);
        var message = 'Product "' + payDetail.OrderTitle + '" was successfully bought';
        logger.log('[BuyItem] ' + message);
        dynamicController.onShowDynamicProducts();
    }

    function buySubscription(item) {
        var paymentDetails = {
            OrderItemID: item.ItemID,
            OrderTitle: item.ItemTitle,
            OrderTotal: item.Price.toString(),
            OrderCurrencyID: item.CurrencyID,
            OrderCustomID: UniqueCustomId
        };

        if (App.CheckoutUtils.isProductAlreadyOwned(item.ItemID)) {
            logger.log('[BuyItem] Product "' + item.ItemTitle + '" was already bought');
            return;
        }

        logger.log('[BuyItem] Purchase of "' + item.ItemTitle + '" has started');
        webapis.billing.buyItem(
            App.Config.getAppId(),
            DPIService.getServerType(),
            JSON.stringify(paymentDetails),
            onBuySubscription,
            onBuyItemError
        );
    }

    function onBuySubscription(data) {
        var statesHandlers = {
            SUCCESS: onBuySubscriptionSuccess,
            FAILED: onBuyItemFailed,
            CANCEL: onBuyItemCancel
        };
        var stateHandler = statesHandlers[data.payResult];

        if (typeof stateHandler === 'function') {
            stateHandler(data);
        } else {
            logger.log('[onBuyItemUnknown]', data);
        }
    }

    function onBuySubscriptionSuccess(data) {
        var payDetail = JSON.parse(data.payDetail);
        var message = 'Product "' + payDetail.OrderTitle + '" was successfully bought';
        logger.log('[BuyItem] ' + message);
        subscriptionController.onShowSubscriptions();
    }

    function unsubscribe(purchase) {
        DPIService.cancelSubscription(purchase.InvoiceID, subscriptionController.onSubscriptionCanceled, onError);
    }

    // ************************************************************************

    function getLoginUid() {
        var loginUid = null;

        try {
            loginUid = webapis.sso.getLoginUid();
        } catch (error) {
            logger.error('[SSO] ', error.message);
        }

        return loginUid;
    }

    function getCountryCode() {
        var codeOfCountry = null;

        try {
            codeOfCountry = webapis.productinfo.getSystemConfig(
                webapis.productinfo.ProductInfoConfigKey.CONFIG_KEY_SERVICE_COUNTRY
            );
        } catch (error) {
            logger.error('[CountryCode] ' + error.message);
        }

        return codeOfCountry;
    }

    function getSmartTVServerType() {
        var smartTVServer = null;

        try {
            smartTVServer = webapis.productinfo.getSmartTVServerType();
        } catch (error) {
            logger.error('[SmartTVServerType] ' + error.message);
        }

        return smartTVServer;
    }

    function showDPIServerType() {
        document.querySelector('.dpi-server-type').innerHTML = 'DPI server: ' + DPIService.getServerType();
    }

    function showSmartTVServerType() {
        if (smartTVServerType === 0) {
            document.querySelector('.smarttv-server-type').innerHTML = 'SmartTV server: production';
        } else if (smartTVServerType === 1) {
            document.querySelector('.smarttv-server-type').innerHTML = 'SmartTV server: development';
        } else {
            document.querySelector('.smarttv-server-type').innerHTML = 'SmartTV server: unknown';
        }
    }

    function requireLogin(onLogin) {
        return function () {
            if (!UniqueCustomId) {
                logger.error('[SSO] Only logged in users are allowed to purchase products!');
                return;
            }

            onLogin();
        };
    }

    function onError(error) {
        App.Navigation.enable();
        logger.error(error);
    }

    window.onload = function () {
        productsListEl = document.querySelector('#info-container');
        UniqueCustomId = getLoginUid();
        countryCode = getCountryCode();
        smartTVServerType = getSmartTVServerType();

        DPIService = App.DPIService.create({
            appId: App.Config.getAppId(),
            UniqueCustomId: UniqueCustomId,
            countryCode: countryCode,
            securityKey: App.Config.getSecurityKey(),
            serverType: smartTVServerType,
            useDummyServer: true // set to false to test real purchase wizard
        });

        DynamicClient = App.DynamicClient.create({
            UniqueCustomId: UniqueCustomId,
            url: App.Config.getBackendUrl(),
            countryCode: countryCode
        });

        basicController = App.BasicController.create({
            logger: logger,
            DPIService: DPIService,
            basicMenu: basicMenu,
            productsListEl: productsListEl
        });

        dynamicController = App.DynamicController.create({
            logger: logger,
            DynamicClient: DynamicClient,
            basicMenu: basicMenu,
            productsListEl: productsListEl
        });

        subscriptionController = App.SubscriptionController.create({
            logger: logger,
            DPIService: DPIService,
            basicMenu: basicMenu,
            productsListEl: productsListEl
        });

        addButtonsHandlers();
        showDPIServerType();
        showSmartTVServerType();
        App.KeyHandler.addHandlerForDelegated(
            '#info-container',
            function (element) {
                var index = element.dataset.index;
                var currentProduct = App.Data.getCurrentProductsList()[index];
                var currentProductPurchase = App.CheckoutUtils.getProductPurchase(currentProduct);

                if (currentProduct.ItemType === App.DPIService.ItemTypes.SUBSCRIPTION) {
                    if (App.CheckoutUtils.isSubscriptionActive(currentProductPurchase)) {
                        unsubscribe(currentProductPurchase);
                    } else if (!App.CheckoutUtils.isSubscriptionCancelled(currentProductPurchase)) {
                        buySubscription(currentProduct);
                    }
                } else if (currentProduct.customId) {
                    buyDynamicItem(currentProduct);
                } else {
                    buyItem(currentProduct);
                }
            }
        );
    };
}());
