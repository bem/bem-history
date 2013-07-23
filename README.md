bem-history
===========

### Что это?

BEM обёртка для History API

### Сюда входит:
- сильно переработанный [HistoryJS](https://github.com/browserstate/History.js/) с поддержкой браузеров без HistoryAPI с деградацией до hashbang #! 
- плагин ``$.url``, включающий в себя кучу хелперов для работы с URL. Например ``$.url.parseUri``, ``$.url.setParams``, ``$.url.build``, ``$.url.unescape`` и др.
- BEM-блок ``i-location``, который нормализует DOM событие ``statechange`` → в BEM ``change``, которое могут ловить другие блоки
