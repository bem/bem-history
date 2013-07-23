/**
* History.js Core
* @author Benjamin Arthur Lupton <contact@balupton.com>
* @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
* @license New BSD License <http://creativecommons.org/licenses/BSD/>
*/

(function(window,$,undefined){
    "use strict";

    // ========================================================================
    // Initialise

    // Localise Globals
    var console = window.console || undefined, // Prevent a JSLint complain
        document = window.document, // Make sure we are using the correct document,
        location = document.location,
        navigator = window.navigator, // Make sure we are using the correct navigator
        $window = $(window),
        History = window.History = window.History || {}, // Public History Object
        history = window.history, // Old History Object
        hashBang = '#!';

    // ====================================================================
    // Options

    /**
     * History.options
     */
    History.options = History.options || {};

    /**
     * History.options.safariPollInterval
     * How long should the interval be before safari poll checks
     */
    History.options.safariPollInterval = History.options.safariPollInterval || 500;

    /**
     * History.options.doubleCheckInterval
     * How long should the interval be before we perform a double check
     */
    History.options.doubleCheckInterval = History.options.doubleCheckInterval || 500;

    /**
     * History.options.busyDelay
     * How long should we wait between busy events
     */
    History.options.busyDelay = History.options.busyDelay || 250;

    /**
     * History.options.debug
     * If true will enable debug messages to be logged
     */
    History.options.debug = History.options.debug || false;

    // ====================================================================
    // Interval record

    /**
     * History.intervalList
     * List of intervals set, to be cleared when document is unloaded.
     */
    History.intervalList = [];

    /**
     * History.clearAllIntervals
     * Clears all setInterval instances.
     */
    History.clearAllIntervals = function(){
        var il = History.intervalList,
            i, l;
        for (i = 0, l = il.length; i < l; i++) {
            clearInterval(il[i]);
        }
        History.intervalList = [];
    };

    /**
     * History.debug(message,...)
     * Logs the passed arguments if debug enabled
     */
    History.debug = function() {
        History.options.debug && History.log.apply(History, arguments);
    };

    /**
     * History.log(message,...)
     * Logs the passed arguments
     */
    History.log = function() {
        var args = Array.prototype.slice.call(arguments),
            message = args.shift();

        console.log(message, ' ', args);

        return true;
    };

    /**
     * History.getInternetExplorerMajorVersion()
     * Get's the major version of Internet Explorer
     * @return {number}
     */
    History.browserVersion = function() {
        return $.browser.version;
    };

    /**
     * History.isInternetExplorer()
     * Are we using Internet Explorer?
     */
    History.isMSIE = function() {
        return $.browser.msie;
    };

    /**
     * History.emulated
     * Which features require emulating?
     */
    History.emulated = {
        pushState: !Boolean(
            window.history && window.history.pushState && window.history.replaceState
                && !(
                (/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) /* disable for versions of iOS before version 4.3 (8F190) */
                    || (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
                    || (/Bada\/([\d.]+)/i).test(navigator.userAgent)
                    /*TODO раздебажить проблему: при тапе на ссылке, которая уводит с серпа, и возвращении на серп дальнейший аякс ломается (SERP-14010 ios5 only) */
                    || (/iPad.*OS\s5_/i).test(navigator.userAgent)
                )
        ),
        hashChange: Boolean(!(('onhashchange' in window) || ('onhashchange' in document))
            || (History.isMSIE() && History.browserVersion() < 8)
        )
    };

    /**
     * History.enabled
     * Is History enabled?
     */
    History.enabled = !History.emulated.pushState;

    /**
     * History.bugs
     * Which bugs are present
     */
    History.bugs = {
        //Safari 5 and Safari iOS 4 fail to return to the correct state once a hash is replaced by a `replaceState` call
        //https://bugs.webkit.org/show_bug.cgi?id=56249
        setHash: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

        // Safari 5 and Safari iOS 4 sometimes fail to apply the state change under busy conditions
        //https://bugs.webkit.org/show_bug.cgi?id=42940
        safariPoll: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),

        /**
         * MSIE 6 and 7 sometimes do not apply a hash even it was told to (requiring a second call to the apply function)
         */
        ieDoubleCheck: Boolean(History.isMSIE() && History.browserVersion() < 8)
    };

    /**
     * History.cloneObject(obj)
     * Clones a object and eliminate all references to the original contexts
     * @param {Object} obj
     * @return {Object}
     */
    History.cloneObject = function(obj) {
        return obj ? $.extend({}, obj) : {};
    };

    // ====================================================================
    // State Storage

    /**
     * History.store
     * The store for all session specific data
     */
    History.store = {};

    /**
     * History.idToState
     * 1-1: State ID to State Object
     */
    History.idToState = History.idToState || {};

    /**
     * History.stateToId
     * 1-1: State String to State ID
     */
    History.stateToId = History.stateToId || {};

    /**
     * History.urlToId
     * 1-1: State URL to State ID
     */
    History.urlToId = History.urlToId || {};

    /**
     * History.storedStates
     * Store the states in an array
     */
    History.storedStates = History.storedStates || [];

    /**
     * History.savedStates
     * Saved the states in an array
     */
    History.savedStates = History.savedStates || [];

    /**
     * History.noramlizeStore()
     * Noramlize the store by adding necessary values
     */
    History.normalizeStore = function(){
        History.store.idToState = History.store.idToState || {};
        History.store.urlToId = History.store.urlToId || {};
        History.store.stateToId = History.store.stateToId || {};
    };

    /**
     * History.getState()
     * Get an object containing the data, title and url of the current state
     * @param {Boolean} friendly
     * @param {Boolean} create
     * @return {Object} State
     */
    History.getState = function(friendly, create){

        var State = History.getLastSavedState();

        // Prepare
        typeof friendly === 'undefined' && ( friendly = true );
        typeof create === 'undefined' && ( create = true );

        !State && create
        && (State = History.createStateObject());

        // Adjust
        friendly && (State = History.cloneObject(State));

        // Return
        return State;

    };

    /**
     * History.getIdByState(State)
     * Gets a ID for a State
     * @param {object} newState
     * @return {string} id
     */
    History.getIdByState = function(newState) {

        // Find ID via State String
        var str = History.getStateString(newState),
            id;

        if (typeof History.stateToId[str] !== 'undefined') {
            id = History.stateToId[str];
        } else if (typeof History.store.stateToId[str] !== 'undefined') {
            id = History.store.stateToId[str];
        } else {
            while (true) {
                id = (new Date()).getTime() + ('' + Math.random()).replace(/\D/g, '');
                if (typeof History.idToState[id] === 'undefined' && typeof History.store.idToState[id] === 'undefined') {
                    break;
                }
            }
        }

        return id;
    };

    /**
     * History.normalizeState(State)
     * Expands a State Object
     * @param {object} state
     * @return {object}
     */
    History.normalizeState = function(state) {
        // Variables
        var newState;

        // Prepare
        if (!state || (typeof state !== 'object')) {
            state = {};
        }

        // Check
        if (typeof state.normalized !== 'undefined') {
            return state;
        }

        // Adjust
        if (!state.data || (typeof state.data !== 'object')) {
            state.data = {};
        }

        // ----------------------------------------------------------------

        // Create
        newState = {};
        newState.normalized = true;
        newState.title = state.title || '';
        newState.url = $.url.safeUnescape($.url.getFull(state.url || location.href));
        newState.hash = $.url.getShort(newState.url);
        newState.data = History.cloneObject(state.data);
        newState.id = History.getIdByState(newState);

        // ----------------------------------------------------------------

        // Update the URL if we have a duplicate
        if ((History.emulated.pushState || History.bugs.safariPoll) && History.hasUrlDuplicate(newState))
            newState.url = $.url.safeUnescape($.url.getFull(newState.hash));

        return newState;
    };

    /**
     * History.createStateObject(data,title,url)
     * Creates a object based on the data, title and url state params
     * @param {object} data
     * @param {string} title
     * @param {string} url
     * @return {object}
     */
    History.createStateObject = function(data, title, url) {
        return History.normalizeState({
            data: data,
            title: title,
            url: url
        });
    };

    /**
     * History.getStateById(id)
     * Get a state by it's UID
     * @param {String} id
     */
    History.getStateById = function(id) {
        return History.idToState[id]
            || History.store.idToState[id]
            || undefined;
    };

    /**
     * Get a State's String
     * @param {object} state
     */
    History.getStateString = function(state) {
        return JSON.stringify({
            data: state.data,
            title: state.title,
            url: state.url
        });
    };

    /**
     * Get a State's ID
     * @param {object} state
     * @return {string} id
     */
    History.getStateId = function(state) {
        return History.getNormalizedData(state, 'id');
    };

    /**
     * History.getStateByIndex()
     * Gets a state by the index
     * @param {number} index
     * @return {Object}
     */
    History.getStateByIndex = function(index){
        var State = null;

        if (typeof index === 'undefined') {
            // Get the last inserted
            State = History.savedStates[History.savedStates.length - 1];
        } else if (index < 0) {
            // Get from the end
            State = History.savedStates[History.savedStates.length + index];
        } else {
            // Get from the beginning
            State = History.savedStates[index];
        }

        return State;
    };

    /**
     * History.getHashByState(State)
     * Creates a Hash for the State Object
     * @param {object} state
     * @return {string} hash
     */
    History.getHashByState = function(state) {
        return History.getNormalizedData(state, 'hash');
    };

    History.getNormalizedData = function(state, key) {
        return History.normalizeState(state)[key];
    };

    History.saveInitialState = function() {

        var state = History.extractState($.url.safeUnescape(location.href), true);

        History
            .storeState(state)
            .saveState(state);

    };

    /**
     * History.extractState
     * Get a State by it's URL or Hash
     * @param {string} url_or_hash
     * @return {object}
     */
    History.extractState = function(url_or_hash, create) {

        var State,
            id,
            url;

        create = create || false;

        url = $.url.getFull(url_or_hash);

        id = History.getIdByUrl(url);
        id && (State = History.getStateById(id));

        if (!State && create && !$.url.isTraditionalAnchor(url_or_hash))
            State = History.createStateObject(null, null, url);

        return State;

    };

    /**
     * History.extractEventData(key,event,extra)
     * @param {string} key - key for the event data to extract
     * @param {string} event - custom and standard events
     * @param {Object} extra - a object of extra event data (optional)
     * @return {Object}
     */
    History.extractEventData = function(key, event, extra) {
        return (event && event.originalEvent && event.originalEvent[key]) || (extra && extra[key]) || undefined;
    };


    /**
     * History.getIdByUrl()
     * Get a State ID by a State URL
     */
    History.getIdByUrl = function(url) {
        return History.urlToId[url] || History.store.urlToId[url] || undefined;
    };

    /**
     * History.getLastSavedState()
     * Get an object containing the data, title and url of the current state
     * @return {Object} State
     */
    History.getLastSavedState = function(){
        return History.savedStates[History.savedStates.length-1] || undefined;
    };

    /**
     * History.getLastStoredState()
     * Get an object containing the data, title and url of the current state
     * @return {Object} State
     */
    History.getLastStoredState = function(){
        return History.storedStates[History.storedStates.length - 1] || undefined;
    };

    /**
     * History.hasUrlDuplicate
     * Checks if a Url will have a url conflict
     * @param {Object} newState
     * @return {Boolean} hasDuplicate
     */
    History.hasUrlDuplicate = function(newState) {
        var hasDuplicate,
            oldState;

        oldState = History.extractState(newState.url);

        hasDuplicate = oldState && oldState.id !== newState.id;

        return hasDuplicate;
    };

    /**
     * History.storeState
     * Store a State
     * @param {Object} newState
     * @return {Object} newState
     */
    History.storeState = function(newState) {

        var state = History.cloneObject(newState);

        History.stateToId[History.getStateString(newState)] = newState.id;
        History.urlToId[newState.url] = newState.id;

        // @TODO, sbmaxx: не очень понятная штука https://github.yandex-team.ru/serp-contribs/history/commit/47af22181b35da79b9df5b51288b8dcc90d1ccdf
        History.idToState[newState.id] = state;

        History.storedStates.push(state);

        return History;
    };

    /**
     * History.isLastSavedState(newState)
     * Tests to see if the state is the last state
     * @param {Object} newState
     * @return {boolean} isLast
     */
    History.isLastSavedState = function(newState){
        var isLast = false,
            newId, oldState, oldId;

        if (History.savedStates.length) {
            newId = newState.id;
            oldState = History.getLastSavedState();
            oldId = oldState.id;

            isLast = (newId === oldId);
        }

        return isLast;
    };

    /**
     * History.saveState
     * Push a State
     * @param {Object} newState
     * @return {boolean} changed
     */
    History.saveState = function(newState) {
        if (History.isLastSavedState(newState))
            return false;

        History.savedStates.push(History.cloneObject(newState));

        return true;
    };

    // ====================================================================
    // Hash Helpers

    /**
     * History.setHash(hash)
     * Sets the document hash
     * @param {string} hash
     * @return {History}
     */
    History.setHash = function(hash, queue) {
        var adjustedHash, State;

        if (queue !== false && History.busy()) {
            History._queue('setHash', args, queue);
            return false;
        }

        History.debug('History.setHash: called',hash);

        // @TODO, sbmaxx: SERP использует просто hash
        adjustedHash = $.url.unescapeHash(hash);

        History.busy(true);

        // Check if hash is a state
        State = History.extractState(hash, true);

        if (State && !History.emulated.pushState) {
            // Hash is a state so skip the setHash
            History.debug('History.setHash: Hash is a state so skipping the hash set with a direct pushState call', arguments);

            History.pushState(State.data, State.title, State.url, false);
        } else if (location.hash !== adjustedHash) {
            // Hash is a proper hash, so apply it
            if ( History.bugs.setHash ) {
                // Fix Safari Bug https://bugs.webkit.org/show_bug.cgi?id=56249
                History.pushState(null, null, $.url.getPage() + hashBang  + adjustedHash, false);
            } else {
                $.url.setHash(hashBang + hash);
            }
        }

        return History;
    };

    /**

     // ====================================================================
     // Queueing

     /**
     * History.queues
     * The list of queues to use
     * First In, First Out
     */
    History.queues = [];

    /**
     * History.busy(value)
     * @param {boolean} value [optional]
     * @return {boolean} busy
     */
    History.busy = function(value) {

        var delay = History.options.busyDelay,
            queues = History.queues;

        // Apply
        if (typeof value !== 'undefined')
            History.debug('History.busy: changing [' + (History.busy.flag || false) + '] to [' + (value || false) + ']', queues.length);
        else if (typeof History.busy.flag === 'undefined')
            value = false;

        History.busy.flag = value;

        // Queue
        if (!History.busy.flag) {

            // Execute the next item in the queue
            clearTimeout(History.busy.timeout);

            var fireNext = function() {
                var i,
                    queue;

                if (History.busy.flag)
                    return;

                for (i = queues.length - 1; i >= 0; --i) {
                    queue = queues[i];

                    if (!queue.length)
                        continue;

                    History.fireQueueItem(queue.shift());
                    History.busy.timeout = setTimeout(fireNext, delay);

                }

            };

            History.busy.timeout = setTimeout(fireNext, delay);
        }

        // Return
        return History.busy.flag;
    };

    /**
     * History.busy.flag
     */
    History.busy.flag = false;

    /**
     * History.fireQueueItem(item)
     * Fire a Queue Item
     * @param {Object} item
     * @return {Array} result
     */
    History.fireQueueItem = function(item) {
        return item.callback.apply(item.scope || History, item.args || []);
    };

    /**
     * History.pushQueue(callback,args)
     * Add an item to the queue
     * @param {Object} item [scope,callback,args,queue]
     */
    History.pushQueue = function(item) {
        var queue = item.queue || 0;

        History.queues[queue] || (History.queues[queue] = []);
        History.queues[queue].push(item);

        return History;
    };

    /**
     * History.queue (item,queue), (func,queue), (func), (item)
     * Either firs the item now if not busy, or adds it to the queue
     */
    History.queue = function(item,queue) {

        typeof item === 'function' && (item = { callback: item });
        typeof queue !== 'undefined' && (item.queue = queue);

        History.busy()
            ? History.pushQueue(item)
            : History.fireQueueItem(item);

        return History;

    };

    History._queue = function(method, args, queue) {
        History.debug('History.' + method + ': we must wait', arguments);

        History.pushQueue({
            scope: History,
            callback: History[method],
            args: args,
            queue: queue
        });
    };

    /**
     * History.clearQueue()
     * Clears the Queue
     */
    History.clearQueue = function() {
        History.busy.flag = false;
        History.queues = [];
        return History;
    };


    /**
     * History.stateChanged
     * States whether or not the state has changed since the last double check was initialised
     */
    History.stateChanged = false;

    /**
     * History.doubleChecker
     * Contains the timeout used for the double checks
     */
    History.doubleChecker = false;

    /**
     * History.doubleCheckComplete()
     * Complete a double check
     * @return {History}
     */
    History.doubleCheckComplete = function(){
        History.stateChanged = true;

        History.doubleCheckClear();

        return History;
    };

    /**
     * History.doubleCheckClear()
     * Clear a double check
     * @return {History}
     */
    History.doubleCheckClear = function() {
        if (History.doubleChecker) {
            clearTimeout(History.doubleChecker);
            History.doubleChecker = false;
        }

        return History;
    };

    /**
     * History.doubleCheck()
     * Create a double check
     * @return {History}
     */
    History.doubleCheck = function(tryAgain) {
        // Reset
        History.stateChanged = false;
        History.doubleCheckClear();

        // Fix IE6,IE7 bug where calling history.back or history.forward does not actually change the hash (whereas doing it manually does)
        // Fix Safari 5 bug where sometimes the state does not change: https://bugs.webkit.org/show_bug.cgi?id=42940
        if (History.bugs.ieDoubleCheck) {
            // Apply Check
            History.doubleChecker = setTimeout(function() {
                History.doubleCheckClear();
                if ( !History.stateChanged ) {
                    History.debug('History.doubleCheck: State has not yet changed, trying again', arguments);
                    // Re-Attempt
                    tryAgain();
                }
                return true;
            }, History.options.doubleCheckInterval);
        }

        return History;
    };


    // ====================================================================
    // Safari Bug Fix

    /**
     * History.safariStatePoll()
     * Poll the current state
     * @return {void}
     */
    History.safariStatePoll = function() {
        // Poll the URL

        // Get the Last State which has the new URL
        var urlState = History.extractState(location.href);

        // Check for a difference
        if (History.isLastSavedState(urlState))
            return;

        // Check if we have a state with that url
        // If not create it
        if (!urlState) {
            History.debug('History.safariStatePoll: new');
            History.createStateObject();
        }

        // Apply the New State
        History.debug('History.safariStatePoll: trigger');
        $window.trigger('popstate');
    };

    /**
     * History.onPopState(event,extra)
     * Refresh the Current State
     */
    History.onPopState = function(event,extra) {

        var stateId,
            newState = false,
            currentHash,
            currentState;

        // Reset the double check
        History.doubleCheckComplete();

        // Check for a Hash, and handle apporiatly
        currentHash	= $.url.getHash();

        if (currentHash) {
            // Expand Hash
            currentState = History.extractState(currentHash || location.href, true);
            if (currentState) {
                // We were able to parse it, it must be a State!
                // Let's forward to replaceState
                History.debug('History.onPopState: state anchor', currentHash, currentState);
                History.replaceState(currentState.data, currentState.title, currentState.url, false);
            } else {
                // Traditional Anchor
                History.debug('History.onPopState: traditional anchor', currentHash);
                $window.trigger('anchorchange');
                History.busy(false);
            }

            // We don't care for hashes
            History.expectedStateId = false;
            return false;
        }

        // Ensure
        stateId = History.extractEventData('state', event, extra);

        // Fetch State
        if (stateId) {
            // Vanilla: Back/forward button was used
            newState = History.getStateById(stateId);
        }  else if (History.expectedStateId) {
            // Vanilla: A new state was pushed, and popstate was called manually
            newState = History.getStateById(History.expectedStateId);
        } else {
            // Initial State
            newState = History.extractState(location.href);
        }

        // The State did not exist in our store
        if (!newState) {
            // Regenerate the State
            newState = History.createStateObject(null, null, location.href);
        }

        // Clean
        History.expectedStateId = false;

        // Check if we are the same state
        if (History.isLastSavedState(newState)) {
            // There has been no change (just the page's hash has finally propagated)
            History.debug('History.onPopState: no change', newState, History.savedStates);
            History.busy(false);
            return false;
        }

        // Store the State
        History.storeState(newState);
        History.saveState(newState);

        // Force update of the title

        $window.trigger('statechange');
        History.busy(false);

        return true;
    };

    /**
     * History.replaceState(data,title,url)
     * Replace the State and trigger onpopstate
     * We have to trigger for HTML4 compatibility
     * @param {object} data
     * @param {string} title
     * @param {string} url
     * @return {boolean}
     */
    History.replaceState = function(data, title, url, queue){
        return History.methodState('replaceState', data, title, url, queue);
    };

    /**
     * History.pushState(data,title,url)
     * Add a new State to the history object, become it, and trigger onpopstate
     * We have to trigger for HTML4 compatibility
     * @param {object} data
     * @param {string} title
     * @param {string} url
     * @return {boolean}
     */
    History.pushState = function(data, title, url, queue) {
        return History.methodState('pushState', data, title, url, queue);
    };

    History.methodState = function(method, data, title, url, queue) {
        History.debug('History.' + method + ' : called', arguments);

        // Check the State
        if ($.url.getHash(url) && History.emulated.pushState) {
            throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
        }

        // Handle Queueing
        if (queue !== false && History.busy()) {
            History._queue(method, args, queue);
            return false;
        }

        // Make Busy + Continue
        History.busy(true);

        // Create the newState
        var newState = History.createStateObject(data, title, url);

        // Check it
        if (History.isLastSavedState(newState)) {
            // Won't be a change
            History.busy(false);
        } else {
            // Store the newState
            History.storeState(newState);
            History.expectedStateId = newState.id;

            // Push the newState
            history[method](newState.id, newState.title, newState.url);

            // Fire HTML5 Event
            $window.trigger('popstate');
        }

        return true;
    };

    // Initialise History
    History.init = function() {

        if (History.emulated.pushState) {
            // Non-Native pushState Implementation, Provide Skeleton for HTML4 Browsers
            History.pushState = History.pushState || $.noop;
            History.replaceState = History.replaceState || $.noop;
        } else {
            // Native pushState Implementation, Use native HTML5 History API Implementation
            $window.bind('popstate', History.onPopState);
        }


        // Default Load
        History.store = {};
        History.normalizeStore();

        // Clear Intervals on exit to prevent memory leaks
        $window.bind('beforeunload unload', History.clearAllIntervals);

        // Create the initial State
        History.saveInitialState();

        // Non-Native pushState Implementation
        if (!History.emulated.pushState) {
            // Be aware, the following is only for native pushState implementations
            // If you are wanting to include something for all browsers
            // Then include it above this if block

            // Setup Safari Fix
            History.bugs.safariPoll
                && History.intervalList.push(setInterval(History.safariStatePoll, History.options.safariPollInterval));

            // Ensure Cross Browser Compatibility
            if (navigator.vendor === 'Apple Computer, Inc.' || (navigator.appCodeName || '') === 'Mozilla') {
                // Fix Safari HashChange Issue

                // Setup Alias
                $window.bind('hashchange', function() {
                    $window.trigger('popstate');
                });

                // Initialise Alias
                $.url.getHash() && $(function() {
                    $window.trigger('hashchange');
                });
            }
        }

    };

    // Try and Initialise History
    History.init();

})(window, jQuery);
