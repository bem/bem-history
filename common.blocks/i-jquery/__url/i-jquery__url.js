(function() {

    // @TODO, sbmaxx: не вмержил т.к. у нас не воспроизводится
    // https://github.yandex-team.ru/serp-contribs/history/commit/56b1875a75b2f41e368f50419e7f14f6c851dd0f
    // About documentaion style: http://code.google.com/p/jsdoc-toolkit/


    // MSIE 6 requires the entire hash to be encoded for the hashes to trigger the onHashChange event
    var hashEscapeBug = $.browser.msie && $.browser.version < 7;

    var Url = {

        _hashBangRegEx : /\#!\//,
        _filter : [],
        _safeUnescapeParams: [],
        _validUrlRegEx : /^(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?$/,

        /**
         * Проверяет url на валидность
         * !!! Есть баг с кирилицей в урл, лучше пока не использовать !!!
         * @param {String} url исходная ссылка
         * @returns {Boolean} результат проверки
         */
        isValid : function(url) {

            return this._validUrlRegEx.test(url);

        },

        /**
         * Проверяет url на абсолютность
         * @param {String} url исходная ссылка
         * @returns {Boolean} результат проверки
         */
        isAbsolute : function(url) {

            var urlTrimmed = (url || location.href).trim().toLowerCase();
            return /([a-z:]*)?\/\//.test(urlTrimmed);

        },

        /**
         * Возвращает текущий корневой url
         * @returns {String} rootUrl
         */
        getRoot : function() {

            return location.protocol + '//' + (location.hostname || location.host) + (location.port ? ':' + location.port : '') + '/';

        },

        /**
         * Получает текущий адрес и добавляет / в конец, если нет такого
         * @param {String} [url=location.href] в конец которого надо добавить /
         * @returns {String} pageUrl
         */
        getPage : function(url) {
            url || (url = location.href);
            return url + url.charAt(url.length - 1) === '/' ? '' : '/';
        },

        /**
         * Возвращает урл директории для страницы ("http://mysite.com/dir/page.html?asd" -> "http://mysite.com/dir/")
         * @param {String} [url=location.href] из которого надо получить базовый адрес
         * @returns {String} basePageUrl
         */
        getBasePage : function(url) {
            url || (url = location.href);
            return this.clearHashSymbol(url)
                        .replace(/[^\/]+$/, '')
                        .replace(/\/+$/, '') + '/';
        },

        /**
         * Возвращает домен (hostname) из ссылки
         * @param {String} url - исходная ссылка (как абсолютная, так и относительная)
         * @returns {String} - домен сайта или пустая строка
         */
        getDomain : function(url) {

            return this.parseUri(url).host;

        },

        /**
         * Получаем полный урл из из доступных данных
         * @param {String} доступные данные (относительный путь, query string, hash, кусок урл)
         * @returns {String}
         */
        getFull : function(data) {

            var fullUrl = data,
                firstChar = data.charAt(0);

            if (!this.isAbsolute(data)) {
                switch(firstChar) {
                    case '/' :
                        fullUrl = Url.getRoot() + data.replace(/^\/+/, '');
                        break;
                    case '#' :
                        fullUrl = Url.getPage().replace(/#.*/, '') + data;
                        break;
                    case '?' :
                        fullUrl = Url.getPage().replace(/[\?#].*/, '') + data;
                        break;
                    default :
                        fullUrl = Url.getBasePage() + data.replace(/^(\.\/)+/, '');
                }
            }

            return fullUrl.replace(/\#$/, '');
        },

        /**
         * Возвращает относительный url
         * @param {String} url Абсолютный урл
         * @returns {String} url
         */
        getShort : function(url) {

            // Эмулируем поведение предыдущей либы
            if (!url)
                return '/';

            if (!this.isAbsolute(url))
                return url;

            var shortUrl = url,
                baseUrl = Url.getBasePage(),
                rootUrl = Url.getRoot();

            // Trim baseUrl
            // if ( History.emulated.pushState ) {
            //     // We are in a if statement as when pushState is not emulated
            //     // The actual url these short urls are relative to can change
            //     // So within the same session, we the url may end up somewhere different
            //     shortUrl = shortUrl.replace(baseUrl, '/');
            // }

            shortUrl = shortUrl.replace(rootUrl, '/');

            if (this.isTraditionalAnchor(shortUrl)) {
                shortUrl = '/' + shortUrl;
            }

            // Очищаем URL от:
            shortUrl = this.clearHashSymbol(        // #!/ - хэшбэнга
                shortUrl
                    .replace(/\#$/, '')             // последнего хэша (#) - якоря на странице
                    .replace('//', '/')             // задвоенного слеша
            );

            return shortUrl;

        },

        /**
         * Проверяем хэш это или нет
         * @param {String} url_or_hash
         * @returns {Boolean}
         */
        isTraditionalAnchor : function(url_or_hash) {
            return !(/[\/\?\.]/.test(url_or_hash));
        },

        /**
         * Устанавливаем параметры, которые надо декодировать один раз
         * @param {Array} параметры
         *
         */
        setSafeUnescapeParams: function(params) {
            if (!params)
                return;

            this._safeUnescapeParams = params;
        },

        /**
         * Декодирует строку, но некоторые параметры декодируются один раз
         * @param {String} [url=location.href]
         */
        safeUnescape: function(url) {

            url = url || location.href;

            var params = this.getParams(url, this._safeUnescapeParams);
            url = this.unescape(this.delParams(url, this._safeUnescapeParams));

            // $.each(params, function(param, value) {
            //     params[param] = $.decodeURIComponent(value);
            // }.bind(this));

            return this.setParams(url, params);

        },

        /**
         * Декодирует символы в строке
         * Unescape a string
         * @param {String} str Исходная строка для декодирования
         * @returns {String}
         */
        unescape : function(str) {

            var result = str, tmp;

            while (1) {
                tmp = $.decodeURI(result);

                if (tmp === result)
                    break;

                result = tmp;
            }

            return result;

        },

        /**
         * Декодирует и нормализовывает хэш
         * @param {String} [hash=location.hash] hash
         * @returns {String}
         */
        unescapeHash : function(hash) {

            return Url.unescape(Url.normalizeHash(hash));

        },

        /**
         * Нормализовывает хэш
         * @param {String} hash
         * @returns {String}
         */
        normalizeHash : function(hash) {

            return hash
                .replace(this._hashBangRegEx, '') // удалить хеш-бэнг
                .replace(/[^#]*/, '')  // удалить всё, что до хеша
                .replace(/(#|\/|\?|&)/g, ''); // удалить все спецсимволы из хеша (NERPA-1406 : Ссылки с анкорами в МН приводят к 404 странице)
        },

        /**
         * Возвращает дэкодированный и нормализованный хэш
         * @param {String} [hash=location.hash] hash
         * @returns {String}
         */
        getHash : function(url) {

            url || (url = location.href);
            /#/.test(url) || (url = '');
            return Url.unescapeHash(url);

        },

        /**
         * Устанавливает хэш
         * @param {String} hash
         */
        setHash : function(hash) {

            location.hash = hash.replace('#', '');

        },

        /**
         * Экранирует символы в хэше
         * @param {String} [hash=location.hash] hash
         * @returns {String}
         */
        escapeHash : function(hash) {

            var result = encodeURI(Url.normalizeHash(hash));

            hashEscapeBug ||
                // Восстанавливаем некоторые символы вручную
                // из-за бага с экранированием символов в ие6 и младше
                (result = result
                    .replace(/\%21/g, '!')
                    .replace(/\%26/g, '&')
                    .replace(/\%3D/g, '=')
                    .replace(/\%3F/g, '?'));

            return result;
        },

        /**
         * Удаляет хэшбэнг из ссылки
         *
         * Т.к. путь после хэшбэнга включает в себя полный path, то удаляем path до хэшбэнга
         *
         * ex.: www.yandex.ru/#!/yandsearch?text=bmw -> www.yandex.ru/yandsearch?text=bmw
         * ex.: yandex.ru/images#!/images/search?text=bmw -> yandex.ru/images/search?text=bmw
         *
         * @param {String} [url=location.href] url исходная ссылка
         * @returns {String} ссылка без символа хэша
         */
        clearHashSymbol : function(url) {

            return (url || location.href).replace(/[^\/]*\/?#!\//, '');

        },

        /**
         * Возвращает параметры из ссылки
         * @param {String} [url=location.href] url
         * @returns {Object} - объект, ключами которого являются cgi параметры, а значениям - массив их значений
         */
        parseParams : function(url) {

            url || (url = location.href);
            url = this.clearHashSymbol(url);
            var params = {};

            if (url.indexOf('?&') > -1)
                url = url.replace(/\?&/g, '?');

            (url = url.replace(/[^?]*\??/, '')) && url.replace(/(?:^|&|;)([^&=;]*)=?([^&;]*)/g, function($0, $1, $2) {
                if (!$1) return;
                if(!params[$1]) params[$1] = [];

                params[$1].push($.decodeURIComponent($2.replace(/\+/g, " ")));
            }.bind(this));

            return params;

        },

        /**
         * Нормализация URL'a к percentage encoding
         * @param {String} [url=location.href] url ссылка
         * @returns {String} нормализованная ссылка
         */
        normalize : function(url) {

            return (url || location.href).replace(/\+/g, '%20');

        },

        /**
         * Примердживает новые фильтры к уже существующим
         * @param {Array} названия параметров для фильтрации
         * @param {Array} результат мерджа
         */
        mergeFilters : function(filters) {

            return $.merge($.url._filter, filters);

        },

        /**
         * Фильтрация ссылки от параметров
         * @param {String} [url=location.href] url исходная ссылка
         * @param {Array} filter массив параметров для удаления
         * @returns {String} отфильтрованная сылка
         */
        filter : function(url, filter) {

            if (typeof filter === 'undefined' && url instanceof Array) {
                filter = url;
                url = location.href;
            }

            var params = this.parseParams(url);

            $.merge($.merge([], this._filter), filter || []).forEach(function(key) {
                params[key] && delete params[key];
            });

            return this.build(this.getPath(url), params);

        },

        /**
         * Строит относительную ссылку
         * @param {String} [path=location.href] path путь
         * @param {Object} params хэш с параметрами и их значениями
         * @returns {String} готовая ссылка
         */
        build : function(path, params) {

            if (typeof params === 'undefined' && typeof path === 'object') {
                params = path;
                path = location.href;
            }

            if (!(params && Object.keys(params).length))
                return path;

            // создаём новый объект параметров чтобы не удалять ничего
            if (params instanceof Array) {
                params = [].concat(params);
            } else {
                params = $.extend({}, params);
            }

            params = $.param(params, true);

            return this.normalize(path + '?' + params);

        },

        /**
         * Возвращает путь из ссылки
         * @param {String} [url=location.href] url исходная ссылка /yandsearch?text=bmw
         * @returns {String} путь /yandsearch
         */
        getPath : function(url) {

            return this.clearHashSymbol(url)
                        .match(/([^\?&]*)/)[0];

        },

        /**
         * Устанавливает/изменяет/удаляет параметр в ссылке
         * @param {String} [url=location.href] url Ссылка
         * @param {String} param Имя параметра
         * @param {String} value Значение параметра (при пустом значении параметр будет удалён)
         * @returns {String} ссылка с измененным параметром
         */
        setParam : function(url, param, value) {

            if (typeof param === 'undefined') {
                param = url;
                url = location.href;
            }

            var params = this.parseParams(url);

            typeof value === 'undefined' || value === '' ? delete params[param] : params[param] = value;

            return this.build(this.getPath(url), params);
        },

        /**
         * Устанавливает/изменяет/удаляет много параметров за раз
         * @param {String} [url=location.href] url Ссылка
         * @param {object} params Хэш со значениями параметров в формате имя: значение
         * @returns {String} Ссылка с измененными параметрами
         */
        setParams : function(url, params) {

            if (typeof url === 'object') {
                params = url;
                url = location.href;
            }

            var urlParams = $.extend({}, this.parseParams(url));

            $.each(params, function(k, v) {
                typeof v === 'undefined' ? delete urlParams[k] : (urlParams[k] = v);
            });

            return this.build(this.getPath(url), urlParams);

        },

        /**
         * Удаляет параметр в ссылке
         * @param {String} [url=location.href] url Ссылка
         * @param {String} param Имя параметра
         * @returns {String} ссылка с удалённым параметром
         */
        delParam : function(url, param) {

            return this.setParam(url, param);

        },

        /**
         * Удаляет много параметров за раз
         * @param {String} [url=location.href] url Ссылка
         * @param {Array} params Массив с именами параметров, которые надо удалить
         * @returns {String} Ссылка с удалёнными параметрами
         */
        delParams : function(url, params) {

            if (typeof params === 'undefined' && typeof url !== 'string') {
                params = url;
                url = location.href;
            }

            var emptyParams = {};
            params.forEach(function(val) {
                emptyParams[val] = undefined;
            });

            return this.setParams(url, emptyParams);

        },

        /**
        * Очищает все параметры в ссылке
        * @param {String} url Ссылка
        * @returns {String} Ссылка без параметров
        */
        clearFromParams : function(url) {

            return this.getPath(url);

        },

        /**
        * Возвращает значение одного параметра
        * @param {String} [url=location.href] url Ссылка
        * @param {String} name Имя параметра
        * @returns {String} Значение параметра
        */
        getParam : function(url, name) {

            if (typeof name == 'undefined' && typeof url === 'string') {
                name = url;
                url = location.href;
            }

            return this.parseParams(url)[name];

        },

        /**
        * Возвращает значения нескольких параметров
        * @param {String} [url=location.href] url Ссылка
        * @param {Array} names Массив имён параметров
        * @returns {Object} Хэш значений в формате имя: значение
        */
        getParams : function(url, names) {

            if (typeof withoutDecoding === 'undefined' && typeof names === 'boolean' && url instanceof Array) {
                withoutDecoding = names;
                names = url;
                url = location.href;
            }

            names || (names = []);

            var params = this.parseParams(url), values = {};
            names.forEach(function(name) {
                values[name] = params[name];
            });

            return values;

        },

        /**
        * Возвращает значения всех параметров
        * @param {String} [url=location.href] url Ссылка
        * @returns {Object} Хэш значений в формате имя: значение
        */
        getFlatParams : function(url) {

            var params = this.parseParams(url);

            $.each(params, function(k, v) {
                v[0] && (params[k] = v[0]);
            });

            return params;

        },

        // parseUri 1.2.2
        // (c) Steven Levithan <stevenlevithan.com>
        // MIT License
        parseUri : function(str) {

            var o = this.parseUriOptions,
                m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str),
                uri = {},
                i = 14;

            while (i--) uri[o.key[i]] = m[i] || '';

            uri[o.q.name] = {};
            uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                if ($1) uri[o.q.name][$1] = $2;
            });

            return uri;

        },

        parseUriOptions : {
            strictMode: false,
            key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'],
            q: {
                name: 'queryKey',
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        }

    };

    $.extend({ url: Url });

}());
