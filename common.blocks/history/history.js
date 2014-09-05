/**
 * BEM wrap for History API.
 * @module history
 */

modules.define('history', ['inherit', 'events', 'jquery', 'uri'], function(provide, inherit, events, $, Uri) {

/**
 * @class BEMHistory
 * @augments events:Emitter
 * @exports history
 */
var BEMHistory = inherit(events.Emitter, /** @lends BEMHistory.prototype */{
    /**
     * @constructor
     */
    __constructor : function() {
        this
            ._resetUrl()
            ._bindEvents()
            ._syncState();
    },

    /**
     * Adds new state to browsing history.
     *
     * @param {Object} data New state data.
     * @param {String} title Document title.
     * @param {String} [url] Location url.
     * @returns {Object}
     */
    pushState : function(data, title, url) {
        return this.changeState('push', this._normalizeState(data, title, url));
    },

    /**
     * Replaces current state.
     *
     * @param {Object} data New state data
     * @param {String} title Document title.
     * @param {String} [url] Location url.
     * @returns {Object}
     */
    replaceState : function(data, title, url) {
        return this.changeState('replace', this._normalizeState(data, title, url));
    },

    /**
     * Base method for an events binding.
     * Method have to be extended in modificators.
     *
     * @private
     * @returns {Object}
     */
    _bindEvents : function() {
        return this;
    },

    /**
     * Base method for url check and reset.
     * Method have to be extended in modificators.
     *
     * @private
     * @returns {Object}
     */
    _resetUrl : function() {
        return this;
    },

    /**
     * Removes hashbang from url.
     *
     * @private
     * @example
     * /?p=1#!/?p=2 => /?p=2.
     *
     * @param {String} url
     * @returns {String}
     */
    _removeHashbang : function(url) {
        var parsedUri = Uri.parse(url),
            hash = parsedUri.getAnchor();

        if(hash === '' || hash[0] !== '!') { return url; }
        var hashbangUri = Uri.parse(hash.replace(/^!/, ''));

        parsedUri
            .setAnchor('')
            .setQuery(hashbangUri.getQuery());

        return parsedUri.build();
    },

    /**
     * Base method for the state syncing with global history state.
     * Method may be extended in modificators.
     *
     * @private
     * @returns {Object}
     */
    _syncState : function() {
        this.state = this._normalizeState(undefined, document.title, window.location.href);
        return this;
    },

    /**
     * Normalizes state to the appropriate form.
     *
     * @private
     * @param {Object} data
     * @param {String} title
     * @param {String} url
     * @returns {Object} normalized state
     */
    _normalizeState : function(data, title, url) {
        // null -> default state, which we don't want to listen
        // so that data have to be undefined or an empty object
        // but not null
        return {
            data : data === null ? undefined : data,
            title : title,
            url : url
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
    changeState : function(method, state) {
        try {
            window.location.assign(state.url);
        } catch (e) {}
    }

});

BEMHistory.hasNativeAPI = function() {
    return (window.history && 'pushState' in window.history);
};

provide(BEMHistory);

});
