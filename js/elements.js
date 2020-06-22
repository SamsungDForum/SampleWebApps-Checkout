App = window.App || {};
App.Elements = (function Elements() {
    function createProductElement(product, index) {
        var productContainer = document.createElement('div');
        var productTitle = document.createElement('div');
        var productDesc = document.createElement('div');
        var productPrice = document.createElement('div');

        productContainer.classList.add('product-container');
        productContainer.setAttribute('data-index', index);
        productContainer.setAttribute('data-list-item', '');
        productTitle.innerHTML = '<b>' + (product.ItemTitle || 'N/A') + '<b>';
        productDesc.innerHTML = product.ItemDesc || 'N/A';
        productPrice.innerHTML = App.CheckoutUtils.isProductAlreadyOwned(product.ItemID)
            ? '<i>Product was already bought</i>'
            : '<i>' + App.CheckoutUtils.formatPrice(product.Price) + ' ' + product.CurrencyID + '</i>';

        productContainer.appendChild(productTitle);
        productContainer.appendChild(productDesc);
        productContainer.appendChild(productPrice);

        return productContainer;
    }

    function createDynamicProductElement(product, index) {
        var productContainer = document.createElement('div');
        var productTitle = document.createElement('div');
        var productDesc = document.createElement('div');
        var productPrice = document.createElement('div');

        productContainer.classList.add('product-container');
        productContainer.setAttribute('data-index', index);
        productContainer.setAttribute('data-list-item', '');
        productTitle.innerHTML = '<b>' + (product.title || 'N/A') + '<b>';
        productDesc.innerHTML = product.desc || 'N/A';
        productPrice.innerHTML = App.CheckoutUtils.isDynamicProductAlreadyOwned(product.customId)
            ? '<i>Product was already bought</i>'
            : '<i>' + App.CheckoutUtils.formatPrice(product.Price) + ' ' + product.CurrencyID + '</i>';

        productContainer.appendChild(productTitle);
        productContainer.appendChild(productDesc);
        productContainer.appendChild(productPrice);

        return productContainer;
    }

    function createSubscriptionElement(product, index) {
        var productContainer = document.createElement('div');
        var productTitle = document.createElement('div');
        var productDesc = document.createElement('div');
        var productPrice = document.createElement('div');
        var subscription = App.CheckoutUtils.getProductPurchase(product);

        productContainer.classList.add('product-container');
        productContainer.setAttribute('data-index', index);
        productContainer.setAttribute('data-list-item', '');
        productTitle.innerHTML = '<b>' + (product.ItemTitle || 'N/A') + '<b>';

        if (App.CheckoutUtils.isSubscriptionCancelled(subscription)) {
            productDesc.innerHTML = '<i>Subscription active until '
                    + App.CheckoutUtils.paymentTimeToDate(subscription.SubscriptionInfo.SubsEndTime).toLocaleString()
                    + '</i>';
            productPrice.innerHTML = 'CANCELLED';
        } else if (App.CheckoutUtils.isSubscriptionActive(subscription)) {
            productDesc.innerHTML = '<i>Subscription active until '
                    + App.CheckoutUtils.paymentTimeToDate(subscription.SubscriptionInfo.SubsEndTime).toLocaleString()
                    + '</i>';
            productPrice.innerHTML = 'UNSUBSCRIBE';
        } else {
            productDesc.innerHTML = '<i>'
                + App.CheckoutUtils.formatPrice(product.Price)
                + ' '
                + product.CurrencyID
                + ' for 1 '
                + App.CheckoutUtils.formatPaymentPeriod(product.SubscriptionInfo.PaymentCyclePeriod)
                + '</i>';
            productPrice.innerHTML = 'SUBSCRIBE';
        }

        productContainer.appendChild(productTitle);
        productContainer.appendChild(productDesc);
        productContainer.appendChild(productPrice);

        return productContainer;
    }

    return {
        createProductElement: createProductElement,
        createDynamicProductElement: createDynamicProductElement,
        createSubscriptionElement: createSubscriptionElement
    };
}());
