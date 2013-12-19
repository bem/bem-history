/* globals Uri */

// @TODO
// 1.+ try {} catch {} при засовывании url в history, если падает -> redirect

BEM.decl('location', {

    onSetMod: {

        js: function() {
            this._history = BEM.blocks['history'].getInstance();

            this._syncState();
            this._history.on('statechange', this.changeThis(this._onStateChange));

            // слушаем кастомное событие History.js
            // BEM.DOM.win.bind('statechange', this.changeThis(this._onStateChange));
            // @TODO падает при передачи this третьим аргументом            
        }

    },
    
    /**
     * Реакция на изменение состояния history
     *
     * @param {Object} event
     * @param {Object} event params
     */
    _onStateChange: function() {
        // console.log('\n\n!!!!!!!!! location _onStateChange fired, event:', event);
        // console.log('params:', params);
        
        this._syncState();

        if (this._state.trigger !== false) {
            this.trigger('change', this._state);

            // позволяем делать перблочную привязку
            // @ TODO: пока общий state object. потом можно сделать отдельный для каждого object
            // BEM.blocks['location'].on('b-preview', function() {});
            // TODO @mishanga переделать на каналы
            // this._state.block &&
            //     this.trigger(this._state.block, this._state);
            this._state.block &&
                this.channel(this._state.block)
                    .trigger('change');
        }

        // Всегда удаляем trigger, иначе back-button может не сработать
        delete this._state.trigger;
    },

    /**
     * Синхронизируем внутренний state с блоком history
     *
     * @returns {Object} location
     * @private
     */
    _syncState: function() {
        // var state = BEM.blocks['history'].getInstance().state,
        var state = this._history.state,
            uri = new Uri(state.url);

        this._state = $.extend(state.data, {
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
        var uri = new Uri(data.url);
            // stateUri = new Uri(this._state.url); // TODO @mishanga подумать про кеширование
        
        if (data.url) {
            delete data.params;
        }

        data.url = uri.build();

        // Если есть параметры, то строим новый URL
        // console.log('data params', data.params);
        if (data.params) {
            var newUrl = new Uri(),
                params = data.forceParams ? data.params : $.extend({}, this._state.params, data.params);
                
            // console.log('\n\nparams', params);
            // console.log('state params', this._state.params);
            
            // newUrl.host(data.domain);
            Object.keys(params).forEach(function(key) {
                newUrl.addQueryParam(key, params[key]);
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
    
    // TODO Как используется getState, может имеет смысл заменить на getUri и getReferer
    /**
     * Возвращает текущий state
     * @returns {Object} state
     */
    getState: function() {
        return $.extend(true, {}, this._state);
    },
    
    /**
     * Возвращает инстанс Uri из текущего url
     * @returns {Object} uriInstance    
     */
    getUri: function() {
        return new Uri(this._state.url);
    }

}, {

    _instance: null,
    
    getInstance: function() {
        return this._instance || (this._instance = BEM.create('location'));
    }

});
