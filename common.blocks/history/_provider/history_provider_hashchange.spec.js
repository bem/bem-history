window.history = undefined;

modules.define('spec', ['history'], function(provide, History) {

describe('history hashchange', function() {

    var history = new History();

    it('should be able to generate hashbang from url', function() {
        var hashbang = history._generateHashbang('/desktop.bundles/index/index.html?test=a&ololo=123');
        hashbang.should.be.eql('!/index.html?test=a&ololo=123');
    });

    it('should have _onHashChange method', function() {
        history._onHashChange.should.be.a('function');
    });

    it('should throw a security exception when the origin does not match', function(done) {
        try {
            history.changeState('push', { data : {}, title : '', url : 'https://yandex.ru' });
        } catch (e) {
            done();
        }
    });

});

provide();

});
