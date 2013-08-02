/**
 * Polyfill for History API.
 * @see https://developer.mozilla.org/en-US/docs/DOM/window.history
 *
 * @property {Object} state Current state.
 */
BEM.decl('history', {

    onSetMod: {
        js: function() {

            if (!this.hasMod('has-api')) {
                throw new Error('Use BEM.blocks[\'history\'].getInstance() instead');
            }

            this
                .bindEvents()
                .syncState();

        }
    },

    destruct: function () {
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
    pushState: function (data, title, url) {
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

    bindEvents: function() {

        this.on('statechange', function() {
            console.log('statechange');
            console.log('   data: ', this.state.data);
            console.log('   title: ', this.state.title);
            console.log('   url: ' , this.state.url);
        });
        return this;

    },

    unbindEvents: function() {
        return this;
    },

    syncState: function() {
        return this;
    },

    normalizeState: function(data, title, url) {

        // null -> дефолтное состояние state, которые мы не хотим слушать
        // поэтому должны передавать либо undefined, либо пустой объект
        // но не null
        data === null && (data = undefined);

        return {
            data: data,
            title: title,
            url: this.normalizeUrl(url)
        };

    },

    normalizeUrl: function(url) {
        return URI(url).normalize();
    },

    changeState: function(method, state) {

        this.state = state;
        this.trigger('statechange', state);

        return this;

    }

}, {

    instance: null,

    getInstance: function() {
        return this.instance || (this.instance = BEM.create({
            block: 'history',
            mods: {
                'provider': history.pushState
                    ? 'history-api'
                    : 'onhashchange' in window
                        ? 'hashchange'
                        : 'none'
            }
        }))
    }

});

BEM.decl({ block: 'history', modName: 'provider', modVal: 'history-api' }, {

    bindEvents: function() {

        this.__base();
        jQuery(window).on('popstate', this._onPopState.bind(this));

        return this;

    },

    unbindEvents: function() {

        this.__base();
        jQuery(window).off('popstate', this._onPopState);

        return this;

    },

    syncState: function() {

        this.__base();

        // replace null with undefined to catch initial popstate
        if (history.state === null) {
            history.replaceState(undefined, document.title);
        }

        return this;

    },

    /**
     * Changes current state.
     *
     * @param {String} method Push or replace method.
     * @param {Object} state
     * @returns {Object}
     * @private
     */
    changeState: function (method, state) {

        // нужно чтобы словить исключение перехода на другой домен
        try {
            history[method + 'State'](state.data, state.title, state.url);
            this.__base.apply(this, arguments);
        } catch (e) {
            this.trigger('error', {
                state: state,
                error: e
            });
        }

        return this;

    },

    /**
     * Reaction for popstate jQuery event.
     *
     */
    _onPopState: function (e) {
        var state = e.originalEvent.state;

        // ignore initial popstate
        if (state === null) {
            return;
        }

        this.state = this.normalizeState(state, document.title, location.href);

        this.trigger('statechange', this.state);

    }

});

BEM.decl({ block: 'history', modName: 'provider', modVal: 'hashchange' }, {

    changeState: function(method, state) {
        location.hash = state.url;
        this.__base.apply(this, arguments);
    }

});

BEM.decl({ block: 'history', modName: 'provider', modVal: 'none' }, {

    changeState: function(method, state) {
        try {
            location.assign(state.url);
            this.__base.apply(this, arguments);
        } catch(e) {}
    }

});
