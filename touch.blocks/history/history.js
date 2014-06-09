/**
 * BEM wrap for History API.
 * @see https://developer.mozilla.org/en-US/docs/DOM/window.history
 *
 * @property {Object} state Current state.
 */
BEM.decl('history', {}, {

    hasNativeAPI: function() {
        var result = this.__base();

        if (result) {
            var ua = navigator.userAgent,
                android = ua && ua.match(/Android\s*([\d\.]*)/),
                version = android && android[1];

            // Don't allow Androids with versions less than 3 and without version
            // to use native History API due to buggy realisation.
            if (android && (parseFloat(version) < 3 || !version)) {
                result = false;
            }
        }

        return result;
    }

});
