App = window.App || {};
App.DynamicController = (function DynamicController() {
    /**
     * Creates dynamic products controller
     * @param {*} config
     * @param {Logger} config.logger
     * @param {DynamicClient} config.DynamicClient
     * @param {HTMLElement} config.productsListEl
     * @param {Menu} config.basicMenu
     */
    function create(config) {
        function onShowDynamicProducts() {
            App.Navigation.disable();
            config.logger.log('[DynamicClient] Requested user purchases');
            config.DynamicClient.requestUserPurchases(onDynamicPurchasesReceived, onError);
        }

        function onDynamicPurchasesReceived(response) {
            App.Data.setPurchasesList(response.purchases);
            config.logger.log('[DynamicClient] Requested products list');
            config.DynamicClient.requestProductsList(onDynamicProductsListReceived, onError);
        }

        function onDynamicProductsListReceived(response) {
            var productsListEl = config.productsListEl;
            var basicMenu = config.basicMenu;

            App.Data.setCurrentProductsList(response.products);
            App.Navigation.enable();
            App.Navigation.changeActiveMenu('Basic');
            App.Navigation.unregisterMenu('Products');
            productsListEl.innerHTML = '';
            response.products.forEach(function (product, index) {
                config.productsListEl.appendChild(App.Elements.createDynamicProductElement(product, index));
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
            config.logger.error(error.message);
            App.Navigation.enable();
        }

        return {
            onShowDynamicProducts: onShowDynamicProducts
        };
    }

    return {
        create: create
    };
}());
