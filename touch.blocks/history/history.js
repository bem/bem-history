modules.define('history', ['inherit', 'jquery', 'uri__querystring'], function(provide, inherit, $, Querystring, Base) {

Base.hasNativeAPI = function() {
    var result = (window.history && 'pushState' in window.history);

    if(result) {
        var ua = navigator.userAgent,
            android = ua && ua.match(/Android\s*([\d\.]*)/),
            version = android && android[1];

        // Don't allow Androids with versions less than 3 and without version
        // to use native History API due to buggy realisation.
        if(android && (parseFloat(version) < 3 || !version)) {
            result = false;
        }
    }

    return result;
};

provide(Base);

});
