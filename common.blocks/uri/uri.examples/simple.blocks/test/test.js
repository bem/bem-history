modules.define('test', ['i-bem__dom', 'uri'], function(provide, BEMDOM, Uri) {

provide(BEMDOM.decl({ block : this.name }, {
    onSetMod : {
        'js' : {
            'inited' : function() {
                var uri = Uri.parse(window.location.href);

                this.bindTo('click', function() {
                    var action = this.getMod('action');

                    uri
                        [action]('some', 1)
                        [action]('test', 2)
                        [action]('passed', 'true');

                    this.toggleMod('action', 'addParam', 'deleteParam');

                    var content = 'Current location has been changed to ' + uri.toString();

                    BEMDOM.update(this.domElem, content);
                });
            }
        }
    }

}));

});
