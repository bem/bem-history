modules.define('spec', ['jquery', 'history', 'uri'], function(provide, $, History, Uri) {

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
    
    it('should be able to remove hashbang from url', function() {
        var url = history._removeHashbang('/desktop.bundles/index/index.html?ololo=trololo#!/index.html?test=a&ololo=123'),
            checkUrl = Uri.parse('/desktop.bundles/index/index.html?test=a&ololo=123');
        url.should.be.eql(checkUrl.build());
    });
    
    it('should not remove anchor hash without #! from url', function() {
        var url = history._removeHashbang('/desktop.bundles/index/index.html?test=a&ololo=123#anchor');
        url.should.be.eql('/desktop.bundles/index/index.html?test=a&ololo=123#anchor');
    });

});

provide();

});
