modules.define(
    'test',
    ['jquery', 'history', 'sinon'],
    function(provide, $, history, sinon) {

describe('history', function() {

    it('should have pushState method', function() {
        history.pushState.should.be.a('function');
    });

});

provide();

});
