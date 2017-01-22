modules.define('test', ['i-bem-dom', 'uri__querystring'], function(provide, bemDom, Querystring) {

provide(bemDom.declBlock(this.name, {
    onSetMod : {
        'js' : {
            'inited' : function() {
                var uri = Querystring.Uri.parse(window.location.href);

                this._domEvents().on('click', function() {
                    var action = this.getMod('action');

                    uri
                        [action]('some', 1)
                        [action]('test', 2)
                        [action]('passed', 'true');

                    this.toggleMod('action', 'addParam', 'deleteParam');

                    var content = 'Current location has been changed to ' + uri.toString();

                    bemDom.update(this.domElem, content);
                });
            }
        }
    }

}));

});
