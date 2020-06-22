App = window.App || {};
App.Data = (function Data() {
    var currentProductsList = [];
    var purchasesList = [];

    function setCurrentProductsList(productsList) {
        currentProductsList = productsList;
    }

    function getCurrentProductsList() {
        return currentProductsList;
    }

    function setPurchasesList(purchases) {
        purchasesList = purchases;
    }

    function getPurchasesList() {
        return purchasesList;
    }

    return {
        setCurrentProductsList: setCurrentProductsList,
        getCurrentProductsList: getCurrentProductsList,
        setPurchasesList: setPurchasesList,
        getPurchasesList: getPurchasesList
    };
}());
