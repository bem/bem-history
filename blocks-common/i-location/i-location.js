(function() {

    // i-location реализует Singleton
    var _instance;

    /**
     *
     */
    BEM.decl('i-location', {

        onSetMod : {

            js : function() {

                this._url = $.url;

                this._syncState();

                // слушаем кастомное событие History.js
                BEM.DOM.win.bind('statechange', this.changeThis(this._onStateChange)); // @TODO падает при передачи this третьим аргументом

            }

        },

        _onStateChange : function(e) {

            this._syncState();

            if (this._state.trigger !== false) {
                this.trigger('change', this._state);

                // позволяем делать перблочную привязку
                // @ TODO: пока общий state object. потом можно сделать отдельный для каждого object
                // BEM.blocks['i-location'].on('b-preview', function() {});
                this._state.block
                    && this.trigger(this._state.block, this._state);
            }

            // Всегда удаляем trigger, иначе back-button может не сработать
            delete this._state.trigger;

        },

        /**
         * Синхронизируем внутренний state с объектом History.js
         * @returns {i-location}
         * @private
         */
        _syncState : function() {

            var state = History.getState();

            this._state = $.extend(state.data, {
                referer: this._state && this._state.url,    // реферер - предыдущий url
                url: state.url,                             // полный URL страницы - http://yandex.com.tr/yandsearch?text=ololo
                domain: this._url.getDomain(state.url),     // домен страницы - yandex.ru
                path: this._url.getPath(state.hash),        // путь к текущей странице - /yandsearch
                params: this._url.parseParams(state.hash)   // хеш cgi параметров - { text: ['ololo'], lr: ['213'] }
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
        change : function(data) {

            if (data.url) {
                delete data.params;
            }

            data.url = this._url.normalize(data.url);
            data.domain = data.domain || this._url.getDomain(data.url) || this._url.getDomain(this._state.url);

            if (data.title) {
                // @TODO, sbmaxx: не очень понимаю зачем ставить title
                document.title = data.title;
            }

            // Если есть параметры, то строим новый URL
            data.params && (data.url = this._url.build(
                this._state.path,
                // ставим совсем новые параметры
                data.forceParams
                    ? data.params
                    : $.extend({}, this._state.params, data.params)
            ));

            // на другой домен уходим без аякса
            if (data.domain && data.domain !== this._state.domain) {
                window.location = data.url;
                return;
            }

            if (typeof data.trigger === 'undefined')
                $.each(data, function(item) {

                    if (item === 'url' && !data[item] || item === 'history')
                        return;

                    if (item !== 'title')
                        data.trigger = true;

                });

            // По умолчанию триггерим событие change
            data.trigger = typeof data.trigger === 'undefined'
                ? true
                : data.trigger;

            // Передаем в History.js только data и url. Об title заботимся сами
            History[(data.history !== false ? 'push' : 'replace') + 'State'](
                data,
                data.title, // @TODO, sbmaxx: это смысла не несет
                data.url
            );

        },

        /**
         * Возвращает текущий state
         * @returns {object} state
         */
        getState : function() {
            return this._state;
        }

    }, {

        get : function() {
            return _instance || (_instance = BEM.create('i-location'));
        }

    });

})();
