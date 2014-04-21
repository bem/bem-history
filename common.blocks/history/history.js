/**
 * BEM wrap for History API.
 * @see https://developer.mozilla.org/en-US/docs/DOM/window.history
 *
 * @property {Object} state Current state.
 */
BEM.decl('history', {

    onSetMod: {
        js: function() {
            if (!this.hasMod('provider')) {
                throw new Error('Use BEM.blocks[\'history\'].getInstance() instead of BEM.create(\'history\')');
            }

            this
                ._resetUrl()
                .bindEvents()
                .syncState();
        }
    },
    
    /**
     * Unbind events before destruct.
     */
    destruct: function() {
        this.unbindEvents();
        this.__base.apply(this, arguments);
    },

    /**
     * Adds new state to browsing history.
     *
     * @param {Object} data New state data.
     * @param {String} title Document title.
     * @param {String} [url] Location url.
     * @returns {Object}
     */
    pushState: function(data, title, url) {
        return this.changeState('push', this.normalizeState(data, title, url));
    },

    /**
     * Replaces current state.
     *
     * @param {Object} data New state data
     * @param {String} title Document title.
     * @param {String} [url] Location url.
     * @returns {Object}
     */
    replaceState: function (data, title, url) {
        return this.changeState('replace', this.normalizeState(data, title, url));
    },
    
    /**
     * Base method for an events binding.
     * Method have to be extended in modificators.
     *
     * @returns {Object}
     */
    bindEvents: function() {
        return this;
    },
    
    /**
     * Base method for url check and reset.
     * Method have to be extended in modificators.
     *
     * @returns {Object}
     * @private
     */
    _resetUrl: function() {
        return this;
    },
    
    /**
     * Removes hashbang from url.
     * /?p=1#!/?p=2 => /?p=2.
     *
     * @param {String} url
     * @returns {String}
     * @private
     */
    _removeHashbang: function(url) {
        var uri = BEM.blocks.uri,
            parsedUri = uri.parse(url);
        
        if (parsedUri.anchor() === '') { return url; }
        var hashbangUri = uri.parse(parsedUri.anchor().replace(/^!/, ''));
        
        parsedUri.anchor('');
        parsedUri.query(hashbangUri.query());
        
        return parsedUri.build();
    },
    
    /**
     * Base method for an events unbinding.
     * Method may be extended in modificators.
     *
     * @returns {Object}
     */
    unbindEvents: function() {
        return this;
    },
    
    /**
     * Base method for the initial state syncing with global history state.
     * Method may be extended in modificators.
     *
     * @returns {Object}
     */
    syncState: function() {
        this.state = this.normalizeState(undefined, document.title, window.location.href);
        return this;
    },
    
    /**
     * Normalizes state to the appropriate form.
     *
     * @param {Object} data
     * @param {String} title
     * @param {String} url
     * @returns {Object} normalized state
     */
    normalizeState: function(data, title, url) {
        // null -> default state, which we don't want to listen
        // so that data have to be undefined or an empty object
        // but not null
        return {
            data:   data === null ? undefined : data,
            title:  title,
            url:    url
        };
    },
    
    /**
     * Changes current state.
     * By default it performs simple page redirect.
     * Method may be extended in modificators.
     *
     * @param {String} method Push or Replace method.
     * @param {Object} state
     * @returns {Object}
     */
    changeState: function(method, state) {
        try {
            window.location.assign(state.url);
        } catch (e) {}
    }

}, {

    hasNativeAPI: function() {
        return (window.history && 'pushState' in window.history);
    },

    _instance: null,

    getInstance: function() {
        return this._instance || (this._instance = BEM.create({
            block: 'history',
            mods: {
                provider: this.hasNativeAPI() ? 'history-api' : 'hashchange'
            }
        }));
    }

});
