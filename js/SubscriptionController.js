App = window.App || {};
App.SubscriptionController = (function SubscriptionController() {
    /**
     * Creates dynamic products controller
     * @param {*} config
     * @param {Logger} config.logger
     * @param {DPIService} config.DPIService
     * @param {HTMLElement} config.productsListEl
     * @param {Menu} config.basicMenu
     */
    function create(config) {
        function onShowSubscriptions() {
            App.Navigation.disable();

            config.logger.log('[DynamicClient] Requested user purchases');
            config.DPIService.requestUserPurchases(onSubscriptionPurchasesReceived, onError);
        }

        function onSubscriptionPurchasesReceived(purchases) {
            App.Data.setPurchasesList(purchases);
            config.logger.log('[DynamicClient] Requested subscriptions list');
            config.DPIService.requestProductsList(onSubscriptionsListReceived, onError);
        }

        function onSubscriptionsListReceived(response) {
            var productsListEl = config.productsListEl;
            var basicMenu = config.basicMenu;

            App.Data.setCurrentProductsList(
                response.ItemDetails.filter(function (product) {
                    return product.ItemType === App.DPIService.ItemTypes.SUBSCRIPTION;
                })
            );
            App.Navigation.changeActiveMenu('Basic');
            App.Navigation.unregisterMenu('Products');
            productsListEl.innerHTML = '';

            App.Data.getCurrentProductsList()
                .forEach(function (product, index) {
                    productsListEl.appendChild(App.Elements.createSubscriptionElement(product, index));
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

        function onSubscriptionCanceled() {
            config.logger.log('[DPIService] Subscription successfully cancelled!');
            onShowSubscriptions();
        }

        function onError(error) {
            config.logger.error(error.message);
            App.Navigation.enable();
        }

        return {
            onShowSubscriptions: onShowSubscriptions,
            onSubscriptionCanceled: onSubscriptionCanceled
        };
    }

    return {
        create: create
    };
}());
