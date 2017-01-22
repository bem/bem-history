modules.define('spec', ['history', 'uri__querystring'], function(provide, History, Querystring) {

describe('history native API', function() {

    var history = new History();

    it('should have _onPopState method', function() {
        history._onPopState.should.be.a('function');
    });

});

provide();

});
