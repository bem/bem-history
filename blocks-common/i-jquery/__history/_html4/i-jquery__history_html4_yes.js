/**
 * History.js HTML4 Support
 * Depends on the HTML5 Support
 * @author Benjamin Arthur Lupton <contact@balupton.com>
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */

(function(window, undefined){
    "use strict";

    // Localise Globals
    var document = window.document, // Make sure we are using the correct document
        History = window.History = window.History || {}, // Public History Object
        $window = $(window);

    // ========================================================================
    // Initialise HTML4 Support

    History.initHtml4 = function() {
        // ====================================================================
        // Properties

        /**
         * History.enabled
         * Is History enabled?
         */
        History.enabled = true;


        // ====================================================================
        // Hash Storage

        /**
         * History.savedHashes
         * Store the hashes in an array
         */
        History.savedHashes = [];

        /**
         * History.isLastHash(newHash)
         * Checks if the hash is the last hash
         * @param {string} newHash
         * @return {boolean} true
         */
        History.isLastHash = function(newHash) {
            return newHash === History.getHashByIndex();
        };

        /**
         * History.saveHash(newHash)
         * Push a Hash
         * @param {string} newHash
         * @return {boolean} true
         */
        History.saveHash = function(newHash) {
            if (History.isLastHash(newHash))
                return false;

            History.savedHashes.push(newHash);

            return true;
        };

        /**
         * History.getHashByIndex()
         * Gets a hash by the index
         * @param {number} index
         * @return {string}
         */
        History.getHashByIndex = function(index) {
            var hash = null;

            if (typeof index === 'undefined') {
                // Get the last inserted
                hash = History.savedHashes[History.savedHashes.length - 1];
            } else if (index < 0) {
                // Get from the end
                hash = History.savedHashes[History.savedHashes.length + index];
            } else {
                // Get from the beginning
                hash = History.savedHashes[index];
            }

            return hash;
        };


        // ====================================================================
        // Discarded States

        /**
         * History.discardedHashes
         * A hashed array of discarded hashes
         */
        History.discardedHashes = {};

        /**
         * History.discardedStates
         * A hashed array of discarded states
         */
        History.discardedStates = {};

        /**
         * History.discardState(State)
         * Discards the state by ignoring it through History
         * @param {object} discardedState
         * @return {boolean}
         */
        History.discardState = function(discardedState, forwardState, backState) {
            History.debug('4: History.discardState', arguments);

            var discardedStateHash = History.getHashByState(discardedState),
                discardObject;

            discardObject = {
                discardedState: discardedState,
                backState: backState,
                forwardState: forwardState
            };

            History.discardedStates[discardedStateHash] = discardObject;

            return true;
        };

        /**
         * History.discardHash(hash)
         * Discards the hash by ignoring it through History
         * @param {string} discardedHash
         * @return {boolean}
         */
        History.discardHash = function(discardedHash, forwardState, backState){
            History.debug('4: History.discardState', arguments);

            History.discardedHashes[discardedHash] = {
                discardedHash: discardedHash,
                backState: backState,
                forwardState: forwardState
            };

            return true;
        };

        /**
         * History.discardState(State)
         * Checks to see if the state is discarded
         * @param {object} State
         * @return {boolean}
         */
        History.discardedState = function(State) {
            return History.discardedStates[History.getHashByState(State)] || false;
        };

        /**
         * History.discardedHash(hash)
         * Checks to see if the state is discarded
         * @param {string} hash
         * @return {boolean}
         */
        History.discardedHash = function(hash) {
            return History.discardedHashes[hash] || false;
        };

        /**
         * History.recycleState(State)
         * Allows a discarded state to be used again
         * @param {object} state
         * @return {boolean}
         */
        History.recycleState = function(state) {
            History.debug('4: History.recycleState', arguments);

            // Remove from DiscardedStates
            History.discardedState(state)
                && delete History.discardedStates[History.getHashByState(state)];

            return true;
        };


        // ====================================================================
        // HTML4 HashChange Support

        // ====================================================================
        // HTML5 State Support

        // Non-Native pushState Implementation
        if (History.emulated.pushState) {
            /*
             * We must emulate the HTML5 State Management by using HTML4 HashChange
             */

            /**
             * History.onHashChange(event)
             * Trigger HTML5's window.onpopstate via HTML4 HashChange Support
             */
            History.onHashChange = function(event) {
                History.debug('4: History.onHashChange', arguments);

                var currentUrl = ((event && event.newURL) || document.location.href),
                    currentHash = $.url.getHash(currentUrl),
                    currentState;

                // Check if we are the same state
                if (History.isLastHash(currentHash)) {
                    // There has been no change (just the page's hash has finally propagated)
                    History.debug('4: History.onHashChange: no change');
                    History.busy(false);
                    return false;
                }

                // Reset the double check
                History.doubleCheckComplete();

                // Store our location for use in detecting back/forward direction
                History.saveHash(currentHash);

                // Expand Hash
                if (currentHash && $.url.isTraditionalAnchor(currentHash)) {
                    History.debug('4: History.onHashChange: traditional anchor', currentHash);
                    // Traditional Anchor Hash
                    $window.trigger('anchorchange');
                    History.busy(false);
                    return false;
                }

                currentState = History.extractState($.url.getFull(currentHash || document.location.href), true);

                // Check if we are the same state
                if (History.isLastSavedState(currentState)) {
                    History.debug('4: History.onHashChange: no change');
                    // There has been no change (just the page's hash has finally propagated)
                    History.busy(false);
                    return false;
                }

                // Push the new HTML5 State
                History.debug('4: History.onHashChange: success hashchange');
                History.pushState(currentState.data, currentState.title, currentState.url, false);

                return true;
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
            History.pushState = function(data, title, url, queue){
                History.debug('4: History.pushState: called', arguments);

                if ($.url.getHash($.url.getShort(url))) {
                    throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
                }

                if ( queue !== false && History.busy() ) {
                    History._queue('pushState', args, queue);
                    return false;
                }

                History.busy(true);

                var newState = History.createStateObject(data, title, url),
                    newStateHash = History.getHashByState(newState),
                    oldState = History.getState(false),
                    oldStateHash = History.getHashByState(oldState),
                    html4Hash = $.url.getHash();

                // Store the newState
                History.storeState(newState);
                History.expectedStateId = newState.id;

                History.recycleState(newState);

                // Check if we are the same State
                if ((newStateHash === oldStateHash || $.url.unescape(newStateHash) === $.url.unescape(oldStateHash)) && $.isEmptyObject(newState.data)) {
                    History.debug('4: History.pushState: no change', newStateHash);
                    History.busy(false);
                    return false;
                }

                // Update HTML4 Hash
                if (newStateHash !== html4Hash && newStateHash !== $.url.getShort(document.location.href)) {
                    History.debug('4: History.pushState: update hash', newStateHash, html4Hash);
                    History.setHash(newStateHash, false);
                }

                // Update HTML5 State
                History.saveState(newState);

                // Fire HTML5 Event
                History.debug('4: History.pushState: trigger popstate');
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
            History.replaceState = function(data,title,url,queue){
                History.debug('4: History.replaceState: called', arguments);

                if ($.url.getHash($.url.getShort(url)))
                    throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');

                if (queue !== false && History.busy()) {
                    History._queue('replaceState', args, queue);
                    return false;
                }

                History.busy(true);

                var newState        = History.createStateObject(data, title, url),
                    oldState        = History.getState(false),
                    previousState   = History.getStateByIndex(-2);

                History.discardState(oldState, newState, previousState);

                History.pushState(newState.data, newState.title, newState.url, false);

                return true;
            };

        } // History.emulated.pushState

        $window.bind('hashchange', History.onHashChange);

        // Non-Native pushState Implementation
        // Ensure initial state is handled correctly
        History.emulated.pushState
            && $.url.getHash()
            && !History.emulated.hashChange
            && $(function() {
                $window.trigger('hashchange');
            });

    }; // History.initHtml4

    History.initHtml4();

})(window);