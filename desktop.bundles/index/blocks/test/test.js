BEM.DOM.decl('test', {
    onSetMod: {
        js: function() {
            // window.history = {};
            
            var h = BEM.blocks['history'].getInstance();
            
            // h.pushState(undefined, '', '?test=a');
            console.log('\n\nhistory state', h.state);
            
            var l = BEM.blocks['location'].getInstance();
            
            l.change({ url: '/desktop.bundles/index/index.html?test=a&ololo=123' });
            console.log('\n\nhistory state', h.state);
            console.log('location _state', l._state);
            
            l.change({ params: { test: [1,2] }, forceParams: true });
            console.log('\n\nhistory state', h.state);
            console.log('location _state', l._state);
            
            l.change({ params: { param2: [22] } });
            console.log('\n\nhistory state', h.state);
            console.log('location _state', l._state);
        }
    }
});