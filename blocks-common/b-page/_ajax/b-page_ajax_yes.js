BEM.DOM.decl({ name: 'b-page', modName: 'ajax', modVal: 'yes' }, {

    onSetMod: {

        js: function() {

            this._location = BEM.blocks['i-location'].get();

            this.__base.apply(this, arguments);

        }

    }

});
