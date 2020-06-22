App = window.App || {};
App.BasicController = (function BasicController() {
    /**
     * Creates basic products controller
     * @param {*} config
     * @param {Logger} config.logger
     * @param {DPIService} config.DPIService
     * @param {HTMLElement} config.productsListEl
     * @param {Menu} config.basicMenu
     */
    function create(config) {
        var logger = config.logger || console;

        function onShowProductsList() {
            logger.log('[DPI] Requested user purchases');
            App.Navigation.disable();

            config.DPIService.requestUserPurchases(onPurchasesReceived, onError);
        }

        function onPurchasesReceived(purchases) {
            App.Data.setPurchasesList(purchases);

            purchases
                .filter(App.Utils.negatePredicate(isApplied))
                .forEach(verifyPurchase);

            logger.log('[DPI] Requested products list');
            config.DPIService.requestProductsList(onProductsListReceived, onError);
        }

        function isApplied(purchase) {
            return purchase.AppliedStatus && config.DPIService.getServerType() === App.DPIService.ServerTypes.PRD;
        }

        function verifyPurchase(purchase) {
            config.DPIService.verifyPurchase(purchase.InvoiceID, onPurchaseVerification(purchase), logger.error);
        }

        function onPurchaseVerification(purchase) {
            return function (verification) {
                if (verification.CPResult === 'FAILED') {
                    logger.log('[DPI] Requested apply product for "' + purchase.InvoiceID + '"');
                    config.DPIService.applyPurchase(purchase.InvoiceID, onPurchaseApplied, logger.error);
                }
            };
        }

        function onPurchaseApplied(response) {
            var resultMessages = {
                100000: 'Product successfully applied',
                ErrorCode: 'Product couldn\'t be applied'
            };

            logger.log('[ApplyPurchase] '
                + resultMessages[response.CPStatus] || resultMessages.ErrorCode);
        }

        function onProductsListReceived(response) {
            var productsListEl = config.productsListEl;
            var basicMenu = config.basicMenu;
            var productsList = response.ItemDetails.filter(function (product) {
                return product.ItemType !== App.DPIService.ItemTypes.SUBSCRIPTION;
            });

            App.Data.setCurrentProductsList(productsList);
            App.Navigation.changeActiveMenu('Basic');
            App.Navigation.unregisterMenu('Products');
            productsListEl.innerHTML = '';
            productsList.forEach(function (product, index) {
                config.productsListEl.appendChild(App.Elements.createProductElement(product, index));
            });
            App.Navigation.registerMenu({
                name: 'Products',
                domEl: document.querySelector('#info-container'),
                alignment: 'vertical',
                onAfterLastItem: function () {
                    App.Navigation.changeActiveMenu('Basic');
                }
            });
            basicMenu.previousMenu = 'Products';
            App.Navigation.enable();
        }

        function onError(error) {
            logger.error(error.message || error);
            App.Navigation.enable();
        }

        return {
            onShowProductsList: onShowProductsList
        };
    }

    return {
        create: create
    };
}());
