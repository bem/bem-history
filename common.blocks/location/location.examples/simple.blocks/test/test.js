modules.define('test', ['i-bem-dom', 'location'], function(provide, bemDom, location) {

provide(bemDom.declBlock(this.name, {
    onSetMod : {
        'js' : {
            'inited' : function() {
                this._domEvents().on('click', function() {
                    this.params.change === 'params' ?
                        this.changeParams() :
                        this.changeHref();
                });
            }
        }
    },

    changeParams : function() {
        var msg = 'Location has been changed!!! ' + window.location.href;

        location.change({ params : { location : 'param', has : 'changed' } });
        bemDom.update(this.domElem, msg);
    },

    changeHref : function() {
        location.change({ url : 'http://yandex.ru' });
        bemDom.update(this.domElem, 'See you later!');
    }

}));

});
