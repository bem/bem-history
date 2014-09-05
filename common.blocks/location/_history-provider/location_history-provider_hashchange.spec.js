window.history = {};

modules.define('spec', ['uri', 'location', 'jquery'], function(provide, Uri, location, $) {

describe('location hashchange', function() {

    it('should change location by path', function() {
        location.change({ url : '/desktop.specs/history_provider_hashchange/location_history-provider_hashchange.html?test=a&ololo=123' });
        var u = Uri.parse(window.location.href);
        ('#' + u.getAnchor()).should.be.eql('#!/location_history-provider_hashchange.html?test=a&ololo=123');
    });

    it('should change location by params with forceParams flag', function() {
        location.change({ params : { test : [1, 2] }, forceParams : true });
        var u = Uri.parse(window.location.href);
        ('#' + u.getAnchor()).should.be.eql('#!/location_history-provider_hashchange.html?test=1&test=2');
    });

    it('should change location by params without forceParams flag', function() {
        location._state.params = { test : [1, 2] };
        location.change({ params : { param2 : [22] } });
        var u = Uri.parse(window.location.href);
        ('#' + u.getAnchor()).should.be.eql('#!/location_history-provider_hashchange.html?test=1&test=2&param2=22');
    });

});

provide();

});
