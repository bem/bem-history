modules.define('history', ['inherit', 'events', 'jquery'], function(provide, inherit, events, $) {

// Fallback for old browsers
/*
if (!history.pushState) {
    provide({
        pushState: function (state, title, url) {
            if (url) window.location.href = url;
        },
        replaceState: function (state, title, url) {
            if (url) window.location.href = url;
        }
    });
    return;
}*/


provide(inherit(events.Emitter, {
    
    __constructor: function() {
        
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
        // this.on('statechange', function() {
        //     console.log('\n\nstatechange');
        //     console.log('   data:   ', this.state.data);
        //     console.log('   title:  ', this.state.title);
        //     console.log('   url:    ', this.state.url);
        // });
        
        return this;
    },
    
    /**
     * Base method for url check and reset.
     * Method have to be extended in modificators.
     *
     * @returns {Object}
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
     */
    _removeHashbang: function(url) {
        var uri = new Uri(url),
            hashBangUri = new Uri(uri.anchor().replace(/^!/, ''));
        
        uri.anchor('');
        uri.query(hashBangUri.query());
        
        return uri.build();
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
        // null -> дефолтное состояние state, которые мы не хотим слушать
        // поэтому должны передавать либо undefined, либо пустой объект
        // но не null
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
    
}));

});
