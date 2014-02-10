modules.define('spec', ['jquery', 'history'], function(provide, $, History) {

describe('history', function() {
    
    var history = new History();
    
    it('should have pushState method', function() {
        history.pushState.should.be.a('function');
    });
    
    it('should have replaceState method', function() {
        history.replaceState.should.be.a('function');
    });
    
    it('should have changeState method', function() {
        history.changeState.should.be.a('function');
    });

});

provide();

});
