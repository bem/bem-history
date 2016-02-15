modules.define('spec', ['uri'], function(provide, Uri, sinon) {

describe('uri', function() {
    var u;

    beforeEach(function() {
        u = Uri.parse('http://test.com');
    });

    it('can replace protocol', function() {
        u.setProtocol('https');
        u.toString().should.be.eql('https://test.com');
    });

    it('can replace protocol with colon suffix', function() {
        u.setProtocol('https:');
        u.toString().should.be.eql('https://test.com');
    });

    it('can add a hostname to a relative path', function() {
        u = Uri.parse('/index.html');
        u.setHost('wherever.com');
        u.toString().should.be.eql('//wherever.com/index.html');
    });

    it('can change a hostname', function() {
        u.setHost('wherever.com');
        u.toString().should.be.eql('http://wherever.com');
    });

    it('should not add a port when there is no hostname', function() {
        u = Uri.parse('/index.html');
        u.setPort(8080);
        u.toString().should.be.eql('/index.html');
    });

    it('should change the port', function() {
        u.setPort(8080);
        u.toString().should.be.eql('http://test.com:8080');
    });

    it('should add a path to a domain', function() {
        u = Uri.parse('//test.com');
        u.setPath('/some/article.html');
        u.toString().should.be.eql('//test.com/some/article.html');
    });

    it('should change a path', function() {
        u.setPath('/some/article.html');
        u.toString().should.be.eql('http://test.com/some/article.html');
    });

    it('should delete a path', function() {
        u = Uri.parse('http://test.com/index.html');
        u.setPath(null);
        u.toString().should.be.eql('http://test.com');
    });

    it('should empty a path', function() {
        u = Uri.parse('http://test.com/index.html');
        u.setPath('');
        u.toString().should.be.eql('http://test.com');
    });
    
    it('should be able to parse query', function() {
        u = Uri.parse('http://test.com/index.html?param1=1&param2=21&param2=22');
        u.queryParams.should.be.eql({ param1 : ['1'], param2 : ['21', '22'] });
    });
    
    it('should differ ?param from ?param=', function() {
        u = Uri.parse('http://test.com/index.html?param1&param2=&param1');
        u.queryParams.should.be.eql({ param1 : [], param2 : [''] });
    });
    
    it('should add { param: [] } to query as ?param', function() {
        u = Uri.parse('http://test.com/index.html');
        u.addParam('param', []);
        u.toString().should.be.eql('http://test.com/index.html?param');
    });

    it('should encode empty param', function() {
        u = Uri.parse('http://test.com/index.html');
        u.addParam('param[]', []);
        u.toString().should.be.eql('http://test.com/index.html?param%5B%5D');
    });

    it('should add a query to nothing', function() {
        u = Uri.parse('');
        u.setQuery('this=that&something=else');
        u.toString().should.be.eql('?this=that&something=else');
    });

    it('should add a query to a relative path', function() {
        u = Uri.parse('/some/file.html');
        u.setQuery('this=that&something=else');
        u.toString().should.be.eql('/some/file.html?this=that&something=else');
    });

    it('should add a query to a domain', function() {
        u = Uri.parse('//test.com');
        u.setQuery('this=that&something=else');
        u.toString().should.be.eql('//test.com/?this=that&something=else');
    });

    it('should swap a query', function() {
        u = Uri.parse('//www.test.com?this=that&a=1&b=2c=3');
        u.setQuery('this=that&something=else');
        u.toString().should.be.eql('//www.test.com/?this=that&something=else');
    });

    it('should delete a query', function() {
        u = Uri.parse('//www.test.com?this=that&a=1&b=2c=3');
        u.setQuery(null);
        u.toString().should.be.eql('//www.test.com');
    });

    it('should empty a query', function() {
        u = Uri.parse('//www.test.com?this=that&a=1&b=2c=3');
        u.setQuery('');
        u.toString().should.be.eql('//www.test.com');
    });

    it('should add an anchor to a domain', function() {
        u = Uri.parse('//test.com');
        u.setAnchor('content');
        u.toString().should.be.eql('//test.com/#content');
    });

    it('should add an anchor with a hash prefix to a domain', function() {
        u = Uri.parse('//test.com');
        u.setAnchor('#content');
        u.toString().should.be.eql('//test.com/#content');
    });

    it('should add an anchor to a path', function() {
        u = Uri.parse('/a/b/c/123.html');
        u.setAnchor('content');
        u.toString().should.be.eql('/a/b/c/123.html#content');
    });

    it('should change an anchor', function() {
        u = Uri.parse('/a/b/c/index.html#content');
        u.setAnchor('about');
        u.toString().should.be.eql('/a/b/c/index.html#about');
    });

    it('should empty an anchor', function() {
        u = Uri.parse('/a/b/c/index.html#content');
        u.setAnchor('');
        u.toString().should.be.eql('/a/b/c/index.html');
    });

    it('should delete an anchor', function() {
        u = Uri.parse('/a/b/c/index.html#content');
        u.setAnchor(null);
        u.toString().should.be.eql('/a/b/c/index.html');
    });

    it('should get single encoded values', function() {
        u = Uri.parse('http://example.com/search?q=%40');
        u.getParam('q')[0].should.be.eql('@');
    });

    it('should get double encoded values', function() {
        u = Uri.parse('http://example.com/search?q=%2540');
        u.getParam('q')[0].should.be.eql('%40');
    });

    it('should work with %40 values', function() {
        u = Uri.parse('http://example.com/search?q=%40&stupid=yes');
        u.deleteParam('stupid');
        u.toString().should.be.eql('http://example.com/search?q=%40');
    });

    it('should work with %25 values', function() {
        u = Uri.parse('http://example.com/search?q=100%25&stupid=yes');
        u.deleteParam('stupid');
        u.toString().should.be.eql('http://example.com/search?q=100%25');
    });

    it('should insert missing slash when origin and path have no slash', function() {
        u = Uri.parse('http://test.com');
        u.setPath('relativePath');
        u.toString().should.be.eql('http://test.com/relativePath');
    });

    it('should remove extra slash when origin and path both provide a slash', function() {
        u = Uri.parse('http://test.com/');
        u.setPath('/relativePath');
        u.toString().should.be.eql('http://test.com/relativePath');
    });

    it('correctly composes url encoded urls', function() {
        var originalQuery = '?k=%40v',
            parsed = Uri.parse('http://example.com' + originalQuery);
        parsed.getQuery().should.be.eql(originalQuery);
    });
    
    it('should be able to return url root', function() {
        u = Uri.parse('http://test.com/ololo/trololo.html?param1=1#!123');
        u.getRoot().should.be.eql('http://test.com/ololo');
    });
    
    it('should be able to decode cp1251 encoded params', function() {
        u = Uri.parse('http://test.com/ololo/trololo.html?text=%F2%E0%E1%EB%EE');
        u.getParam('text')[0].should.be.eql('табло');
    });
    
    it('should not fall on params encoded with unknown encoding', function() {
        u = Uri.parse('http://test.com/ololo/trololo.html?text=%COCO%C0C0');
        u.getParam('text')[0].should.be.eql('%COCO%C0C0');
    });

    it('should correctly parse url with query containing "@"', function() {
        u = Uri.parse('http://example.com/?text=@fake.com');
        u.toString().should.be.eql('http://example.com/?text=%40fake.com');
    });

    it('should be able to normalize a full url to percentage encoding', function() {
        Uri
            .normalize('http://yandex.ru/yandsearch?text=yandex+почта&lr=213')
            .should.be.eql('http://yandex.ru/yandsearch?text=yandex%20%D0%BF%D0%BE%D1%87%D1%82%D0%B0&lr=213');
    });
});

provide();

});
