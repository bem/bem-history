BEM.decl('location', {

    onSetMod: {

        js: function() {
            this._history = BEM.blocks.history.getInstance();

            this._syncState();
            this._history.on('statechange', this.changeThis(this._onStateChange));
        }

    },
    
    /**
     * Реакция на изменение состояния history
     *
     * @param {Object} event
     * @param {Object} event params
     */
    _onStateChange: function() {
        this._syncState();

        if (this._state.trigger !== false) {
            this.trigger('change', this._state);

            // Позволяем делать перблочную привязку
            this._state.block &&
                this.channel(this._state.block)
                    .trigger('change');
        }
    },

    /**
     * Синхронизируем внутренний state с блоком history
     *
     * @returns {Object} location
     * @private
     */
    _syncState: function() {
        var state = this._history.state,
            uri = BEM.blocks.uri.parse(state.url);

        this._state = $.extend({}, state.data, {
            referer: this._state && this._state.url,// реферер - предыдущий url
            url: uri.build(),                       // полный URL страницы –
            // http://yandex.com.tr/yandsearch?text=ololo&lr=213
            hostname: uri.host(),                   // домен страницы - yandex.ru
            path: uri.path(),                       // путь к текущей странице - /yandsearch
            params: uri.queryParams                 // хеш cgi параметров – 
            // { text: ['ololo'], lr: ['213'] }
        });

        return this;
    },

    /**
     * Метод позволяющий создать или изменить state
     * @param {object} data параметры:
     * @param {string} data.url новый url
     * @param {boolean} data.trigger необходимость триггерить событие
     * @param {boolean} data.history создавать новый state или заменять текущий
     */
    change: function(data) {
        var uri = BEM.blocks.uri.parse(data.url);
        
        if (data.url) {
            delete data.params;
        }

        data.url = uri.build();

        // Если есть параметры, то строим новый URL
        if (data.params) {
            var newUrl = BEM.blocks.uri.parse(),
                params = data.forceParams ? data.params : $.extend({}, this._state.params, data.params);

            Object.keys(params).forEach(function(key) {
                newUrl.addParam(key, params[key]);
            });
            data.url = newUrl.build();
        }

        // По умолчанию триггерим событие change
        data.trigger === false || (data.trigger = true);

        try {
            this._history.changeState(
                (data.history === false ? 'replace' : 'push'),
                {
                    data: data,
                    //title: data.title,
                    url: data.url
                }
            );
        } catch (e) {
            window.location.assign(data.url);
        }
    },
    
    /**
     * Возвращает текущий state
     * @returns {Object} state
     */
    getState: function() {
        // console.log('getState deprecated! Use getReferer and getUri instead');
        return $.extend(true, {}, this._state);
    },
    
    /**
     * Возвращает инстанс Uri из текущего url
     * @returns {Object} uriInstance    
     */
    getUri: function() {
        return BEM.blocks.uri.parse(this._state.url);
    },
    
    /**
     * Возвращает предыдущий url
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
