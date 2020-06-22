App = window.App || {};
App.CheckoutUtils = (function CheckoutUtils() {
    function isProductAlreadyOwned(itemId) {
        return App.Data.getPurchasesList().filter(function (item) {
            return itemId === item.ItemID && !item.CancelStatus;
        }).length > 0;
    }

    function formatPrice(price) {
        var decimals = price.toString().split('.')[1];

        return decimals.length === 1 ? price + '0' : price;
    }

    function isDynamicProductAlreadyOwned(customId) {
        return App.Data.getPurchasesList().filter(function (product) {
            return product.customId === customId;
        }).length;
    }

    function getProductPurchase(product) {
        return App.Data.getPurchasesList().filter(function (purchase) {
            return product.ItemID === purchase.ItemID;
        })[0];
    }

    function formatPaymentPeriod(periodUnit) {
        var units = {
            W: 'week',
            M: 'month'
        };

        return units[periodUnit];
    }

    function isSubscriptionActive(subscription) {
        return subscription
            && subscription.SubscriptionInfo.SubsStatus === '00';
    }

    function isSubscriptionCancelled(subscription) {
        return subscription
            && paymentTimeToDate(subscription.SubscriptionInfo.SubsEndTime).getTime() > new Date().getTime()
            // Status codes coresponding to subscription cancelation
            && ['02', '03', '04', '05'].indexOf(subscription.SubscriptionInfo.SubsStatus) > -1;
    }

    function paymentTimeToDate(paymentTime) {
        return new Date(
            paymentTime.slice(0, 4),
            parseInt(paymentTime.slice(4, 6), 10) - 1,
            paymentTime.slice(6, 8),
            paymentTime.slice(8, 10),
            paymentTime.slice(10, 12),
            paymentTime.slice(12, 14)
        );
    }

    return {
        isProductAlreadyOwned: isProductAlreadyOwned,
        formatPrice: formatPrice,
        isDynamicProductAlreadyOwned: isDynamicProductAlreadyOwned,
        getProductPurchase: getProductPurchase,
        formatPaymentPeriod: formatPaymentPeriod,
        isSubscriptionActive: isSubscriptionActive,
        isSubscriptionCancelled: isSubscriptionCancelled,
        paymentTimeToDate: paymentTimeToDate
    };
}());
