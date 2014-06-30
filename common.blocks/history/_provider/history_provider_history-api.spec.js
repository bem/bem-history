modules.define('spec', ['history', 'uri'], function(provide, History, Uri) {

describe('history native API', function() {
    
    var history = new History();
    
    it('should be able to remove hashbang from url', function() {
        var url = history._removeHashbang('/desktop.bundles/index/index.html?ololo=trololo#!/index.html?test=a&ololo=123'),
            checkUrl = Uri.parse('/desktop.bundles/index/index.html?test=a&ololo=123');
        url.should.be.eql(checkUrl.build());
    });
    
    it('should have _onPopState method', function() {
        history._onPopState.should.be.a('function');
    });
    
});

provide();

});
