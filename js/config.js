App = window.App || {};

App.Config = (function Config() {
    var appId = ''; // ID of your application registered in DPI portal
    var securityKey = ''; // your security key from DPI portal
    var backendUrl = 'http://192.168.137.1:1337'; // URL of your backend server, e.g. 'http://www.example.com:1337'

    function getAppId() {
        return appId;
    }

    function getSecurityKey() {
        return securityKey;
    }

    function getBackendUrl() {
        return backendUrl;
    }

    return {
        getAppId: getAppId,
        getSecurityKey: getSecurityKey,
        getBackendUrl: getBackendUrl
    };
}());
