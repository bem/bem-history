modules.define('test', ['i-bem__dom', 'location'], function(provide, BEMDOM, location) {

provide(BEMDOM.decl({ block : this.name }, {
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.bindTo('click', function(){
                    (this.params.change === 'params') ? this.changeParams() : this.changeHref();
                });
            }
        }
    },

    changeParams : function() {
        var msg = 'Location has been changed!!! ' + window.location.href;

        location.change({ params : { location : 'param', has : 'changed' } });
        BEMDOM.update(this.domElem, msg);
    },

    changeHref : function() {
        location.change({ url : 'http://yandex.ru' });
        BEMDOM.update(this.domElem, 'See you later!');
    }

}));

});
