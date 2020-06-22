App = window.App || {};
App.DPIService = (function DPIService() {
    var ItemTypes = {
        NONCONSUMABLE: 1,
        ALL: 2,
        SUBSCRIPTION: 4
    };
    var ServerTypes = {
        DEV: 'DEV',
        DUMMY: 'DUMMY',
        PRD: 'PRD'
    };

    /**
     * Create instance of DPIService
     * @param {Object} config - contains information necessary to make valid requests
     * @param {String} config.appId - application identification number retrieved from DPI CMS
     * @param {String} config.UniqueCustomId - login UID
     * @param {String} config.countryCode - two letters country code eg. "DE" for Germany
     * @param {String} config.serverType - type of server to be used on DPI
     * @param {String} config.securityKey - security key provided by DPI server
     * @param {Boolean} [config.useDummyServer] - flag defining whether service should use dummy server or not
     */
    function create(config) {
        var serviceEnvironments = {
            0: {
                url: 'https://checkoutapi.samsungcheckout.com/openapi',
                serverType: ServerTypes.PRD
            },
            1: {
                url: 'https://sbox-checkoutapi.samsungcheckout.com/openapi',
                serverType: ServerTypes.DEV
            },
            DUMMY: {
                url: 'https://sbox-checkoutapi.samsungcheckout.com/openapi',
                serverType: ServerTypes.DUMMY
            }
        };
        var serviceEnvironment = config.useDummyServer ? serviceEnvironments.DUMMY
            : serviceEnvironments[config.serverType];

        /**
         * Request user purchases from DPI server
         * @param {Number} page - number of requested purchase page
         * @param {Function} onSuccess - callback called after successful request
         * @param {Function} onError - callback called after failed request
         */
        function requestUserPurchasesPage(page, onSuccess, onError) {
            var hash = window.CryptoJS.HmacSHA256(
                config.appId
                + config.UniqueCustomId
                + config.countryCode
                + ItemTypes.ALL
                + page,
                config.securityKey
            );
            var details = {
                AppID: config.appId,
                CustomID: config.UniqueCustomId,
                CountryCode: config.countryCode,
                ItemType: ItemTypes.ALL,
                PageNumber: page,
                CheckValue: window.CryptoJS.enc.Base64.stringify(hash)
            };

            App.Utils.httpPost(serviceEnvironment.url + '/invoice/list', details, onSuccess, onError);
        }

        function requestUserPurchases(onSuccess, onError) {
            var page = 1;
            var purchases = [];

            requestUserPurchasesPage(page, onUserPurchasePageReceived, onError);

            function onUserPurchasePageReceived(purchasesDetails) {
                purchases = purchases.concat(purchasesDetails.InvoiceDetails);

                // DPI result code '100000' means successful request result
                if (purchasesDetails.CPStatus !== '100000') {
                    onError(purchasesDetails.CPResult);
                    return;
                }

                if (purchasesDetails.CPResult === 'EOF' || purchasesDetails.CPResult === 'Your Invoice Not Found.') {
                    onSuccess(purchases);
                } else {
                    page += 1;
                    requestUserPurchasesPage(page, onUserPurchasePageReceived, onError);
                }
            }
        }


        /**
         * Request products list from DPI server
         * @param {Function} onSuccess - callback called after successful request
         * @param {Function} onError - callback called after failed request
         */
        function requestProductsList(onSuccess, onError) {
            var hash = window.CryptoJS.HmacSHA256(config.appId + config.countryCode, config.securityKey);
            var details = {
                AppID: config.appId,
                CountryCode: config.countryCode,
                CheckValue: window.CryptoJS.enc.Base64.stringify(hash)
            };

            App.Utils.httpPost(serviceEnvironment.url + '/cont/list', details, onSuccess, onError);
        }

        /**
         * Request purchase verification
         * @param {String} invoiceId - identification number of purchase to be verified
         * @param {Function} onSuccess - callback called after successful request
         * @param {Function} onError - callback called after failed request
         */
        function verifyPurchase(invoiceId, onSuccess, onError) {
            var details = {
                AppID: config.appId,
                InvoiceID: invoiceId,
                CustomID: config.UniqueCustomId,
                CountryCode: config.countryCode
            };

            App.Utils.httpPost(serviceEnvironment.url + '/invoice/verify', details, onSuccess, onError);
        }

        /**
         * Request purchase apply
         * @param {String} invoiceId - identification number of purchase to be applied
         * @param {Function} onSuccess - callback called after successful request
         * @param {Function} onError - callback called after failed request
         */
        function applyPurchase(invoiceId, onSuccess, onError) {
            var details = {
                AppID: config.appId,
                InvoiceID: invoiceId,
                CustomID: config.UniqueCustomId,
                CountryCode: config.countryCode
            };

            App.Utils.httpPost(serviceEnvironment.url + '/invoice/apply', details, onSuccess, onError);
        }

        function cancelSubscription(invoiceId, onSuccess, onError) {
            var details = {
                AppID: config.appId,
                InvoiceID: invoiceId,
                CustomID: config.UniqueCustomId,
                CountryCode: config.countryCode
            };

            App.Utils.httpPost(serviceEnvironment.url + '/subscription/cancel', details, onSuccess, onError);
        }

        function getServerType() {
            return serviceEnvironment.serverType;
        }

        return {
            requestUserPurchasesPage: requestUserPurchasesPage,
            requestUserPurchases: requestUserPurchases,
            requestProductsList: requestProductsList,
            verifyPurchase: verifyPurchase,
            applyPurchase: applyPurchase,
            cancelSubscription: cancelSubscription,
            getServerType: getServerType
        };
    }

    return {
        create: create,
        ServerTypes: ServerTypes,
        ItemTypes: ItemTypes
    };
}());
