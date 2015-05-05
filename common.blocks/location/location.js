/**
 * @module location
 */

modules.define(
    'location',
    ['inherit', 'events', 'history', 'objects', 'uri'],
    function(provide, inherit, events, History, objects, Uri) {

/**
 * @class BEMLocation
 * @augments events:Emitter
 * @exports location
 */
var BEMLocation = inherit(events.Emitter, /** @lends BEMLocation.prototype */{
    /**
     * @constructor
     */
    __constructor : function() {
        this._history = new History();

        this._syncState();
        this._history.on('statechange', this._onStateChange, this);
    },

    /**
     * Reaction for the history state change.
     * @param {Object} event
     * @param {Object} event params
     * @private
     */
    _onStateChange : function() {
        this._syncState();

        // Some browsers (like Chromium v36) emit "popstate" event when you return from other site
        // using back/forward buttons. But some doesn't (like FireFox v28).
        // We don't want to track this "popstate" event like location change.
        if(this._state.referer === Uri.normalize(window.location.href)) return;

        if(this._state.silent !== true) {
            this.emit('change', this._state);
        }
    },

    /**
     * Sync own state with the history block state.
     * @returns {Object} location
     * @private
     */
    _syncState : function() {
        var state = this._history.state,
            uri = Uri.parse(state.url);

        this._state = objects.extend(state.data, {
            referer : this._state && this._state.url, // referer - previous url
            url : uri.build(),                        // full page URL –
            // http://yandex.ru/yandsearch?text=ololo&lr=213
            hostname : uri.getHost(),                 // page hostname - yandex.ru
            path : uri.getPath(),                     // path to the current page - /yandsearch
            params : uri.getParams()                  // search params –
            // { text: ['ololo'], lr: ['213'] }
        });

        return this;
    },

    /**
     * Method for a location change. It's possible to change location
     * by an exact url or a query params (params can be overwritten using the forceParams flag).
     * Method work depends on the provided data.
     * @param {Object} data
     * @param {Object} data.params query params
     * @param {String} data.url new url
     * @param {Boolean} [data.silent=false] do not trigger change event
     * @param {Boolean} data.forceParams flag to overwrite current params with new.
     *                                   By default new params are extended with old
     * @param {Boolean} data.replace write history record or replace current
     */
    change : function(data) {
        var uri = Uri.parse(data.url);

        if(data.url) {
            delete data.params;
        }

        data.url = uri.build();

        // Build a new url if the query params exists in data
        if(data.params) {
            var newUrl = new Uri(),
                params = data.forceParams ? data.params : objects.extend({}, this._state.params, data.params);

            objects.each(params, function(value, key) {
                newUrl.addParam(key, value);
            });
            data.url = newUrl.build();
        }

        // By default trigger change event
        data.silent || (data.silent = false);

        try {
            this._history.changeState(
                (data.replace ? 'replace' : 'push'),
                data
            );
        } catch (e) {
            window.location.assign(data.url);
        }
    },

    /**
     * Returns current state.
     * @returns {Object} state
     */
    getState : function() {
        return objects.extend({}, this._state);
    },

    /**
     * Returns an Uri instance constructed from the current state url.
     * @returns {uri}
     */
    getUri : function() {
        return Uri.parse(this._state.url);
    },

    /**
     * Returns previous url.
     * @returns {String} refererUrl
     */
    getReferer : function() {
        return this._state.referer;
    }

});

provide(new BEMLocation());

});
