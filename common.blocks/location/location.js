BEM.decl('location', {

    onSetMod: {

        js: function() {
            this._history = BEM.blocks.history.getInstance();

            this._syncState();
            this._history.on('statechange', this.changeThis(this._onStateChange));
        }

    },
    
    /**
     * Reaction for the history state change.
     *
     * @param {Object} event
     * @param {Object} event params
     */
    _onStateChange: function() {
        this._syncState();

        // Some browsers (like Chromium v36) emit "popstate" event when you return from other site
        // using back/forward buttons. But some doesn't (like FireFox v28). 
        // We don't want to track this "popstate" event like location change.
        if (this._state.referer === window.location.href) return;

        // Check that event isn't disabled.
        if (this._state.trigger !== false) {
            this.trigger('change', this._state);

            // Allows per block binding
            this._state.block &&
                this.channel(this._state.block)
                    .trigger('change');
        }
    },

    /**
     * Sync own state with the history block state.
     *
     * @returns {Object} location
     * @private
     */
    _syncState: function() {
        var state = this._history.state,
            uri = BEM.blocks.uri.parse(state.url);

        this._state = $.extend({}, state.data, {
            referer: this._state && this._state.url,// referer - previous url
            url: uri.build(),                       // full page URL –
            // http://yandex.ru/yandsearch?text=ololo&lr=213
            hostname: uri.host(),                   // page hostname - yandex.ru
            path: uri.path(),                       // path to the current page - /yandsearch
            params: uri.queryParams                 // search params – 
            // { text: ['ololo'], lr: ['213'] }
        });

        return this;
    },

    /**
     * Method for a state change.
     * @param {Object} data
     * @param {Object} data.params query params
     * @param {String} data.url new url
     * @param {Boolean} data.trigger trigger change event
     * @param {Boolean} data.history write history record or replace current
     */
    change: function(data) {
        var uri = BEM.blocks.uri.parse(data.url);
        
        if (data.url) {
            delete data.params;
        }

        data.url = uri.build();

        // Build a new url if the query params exists in data
        if (data.params) {
            var newUrl = BEM.blocks.uri.parse(),
                params = data.forceParams ? data.params : $.extend({}, this._state.params, data.params);

            Object.keys(params).forEach(function(key) {
                newUrl.addParam(key, params[key]);
            });
            data.url = newUrl.build();
        }

        // By default trigger change event
        data.trigger === false || (data.trigger = true);

        try {
            this._history.changeState(
                (data.history === false ? 'replace' : 'push'),
                {
                    data: data,
                    url: data.url
                }
            );
        } catch (e) {
            window.location.assign(data.url);
        }
    },
    
    /**
     * Returns current state.
     * @returns {Object} state
     */
    getState: function() {
        return $.extend(true, {}, this._state);
    },
    
    /**
     * Returns an Uri instance constructed from the current state url.
     * @returns {Object} uriInstance    
     */
    getUri: function() {
        return BEM.blocks.uri.parse(this._state.url);
    },
    
    /**
     * Returns previous url.
     * @returns {String} refererUrl    
     */
    getReferer: function() {
        return this._state.referer;
    }

}, {

    _instance: null,
    
    getInstance: function() {
        return this._instance || (this._instance = BEM.create('location'));
    }

});
