BEM.DOM.decl('test', {
    onSetMod: {
        js: function() {
            var history = BEM.blocks['history'].getInstance();
            history.pushState(undefined, '', '?test=a');
        }
    }
});
