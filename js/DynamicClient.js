App = window.App || {};
App.DynamicClient = (function DynamicClient() {
    /**
     * Create instance of DynamicClient allowing to connect to server with dynamic products
     * @param {Object} config - contains information necessary to make valid requests
     * @param {String} config.UniqueCustomId - login UID
     * @param {String} config.countryCode - two letters country code eg. "DE" for Germany
     * @param {String} config.url - base url for dynamic server
     */
    function create(config) {
        function requestUserPurchases(onSuccess, onError) {
            App.Utils.httpPost(config.url + '/get-purchases', {
                userId: config.UniqueCustomId
            }, onSuccess, onError);
        }

        function requestProductsList(onSuccess, onError) {
            App.Utils.httpPost(config.url + '/get-products', {
                countryCode: config.countryCode
            }, onSuccess, onError);
        }

        function registerTransaction(item, onSuccess, onError) {
            App.Utils.httpPost(config.url + '/register-transaction', {
                ItemID: item.ItemID,
                ItemTitle: item.ItemTitle,
                Price: item.Price,
                CurrencyID: item.CurrencyID,
                customId: item.customId,
                userId: config.UniqueCustomId
            }, onSuccess, onError);
        }

        return {
            requestUserPurchases: requestUserPurchases,
            requestProductsList: requestProductsList,
            registerTransaction: registerTransaction
        };
    }

    return {
        create: create
    };
}());
