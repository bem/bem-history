modules.define('spec', ['uri'], function(provide, Uri, sinon) {

describe('uri', function() {
    var u;

    beforeEach(function() {
        u = Uri.parse('http://test.com');
    });

    it('can replace protocol', function() {
        u.protocol('https');
        u.toString().should.be.eql('https://test.com');
    });

    it('can replace protocol with colon suffix', function() {
        u.protocol('https:');
        u.toString().should.be.eql('https://test.com');
    });

    it('can add a hostname to a relative path', function() {
        u = Uri.parse('/index.html');
        u.host('wherever.com');
        u.toString().should.be.eql('//wherever.com/index.html');
    });

    it('can change a hostname', function() {
        u.host('wherever.com');
        u.toString().should.be.eql('http://wherever.com');
    });

    it('should not add a port when there is no hostname', function() {
        u = Uri.parse('/index.html');
        u.port(8080);
        u.toString().should.be.eql('/index.html');
    });

    it('should change the port', function() {
        u.port(8080);
        u.toString().should.be.eql('http://test.com:8080');
    });

    it('should add a path to a domain', function() {
        u = Uri.parse('//test.com');
        u.path('/some/article.html');
        u.toString().should.be.eql('//test.com/some/article.html');
    });

    it('should change a path', function() {
        u.path('/some/article.html');
        u.toString().should.be.eql('http://test.com/some/article.html');
    });

    it('should delete a path', function() {
        u = Uri.parse('http://test.com/index.html');
        u.path(null);
        u.toString().should.be.eql('http://test.com');
    });

    it('should empty a path', function() {
        u = Uri.parse('http://test.com/index.html');
        u.path('');
        u.toString().should.be.eql('http://test.com');
    });
    
    it('should be able to parse query', function() {
        u = Uri.parse('http://test.com/index.html?param1=1&param2=21&param2=22');
        u.queryParams.should.be.eql({ param1: ['1'], param2: ['21', '22'] });
    });
    
    it('should differ ?param from ?param=', function() {
        u = Uri.parse('http://test.com/index.html?param1&param2=&param1');
        u.queryParams.should.be.eql({ param1: [], param2: [''] });
    });
    
    it('should add { param: [] } to query as ?param', function() {
        u = Uri.parse('http://test.com/index.html');
        u.addParam('param', []);
        u.toString().should.be.eql('http://test.com/index.html?param');
    });

    it('should add a query to nothing', function() {
        u = Uri.parse('');
        u.query('this=that&something=else');
        u.toString().should.be.eql('?this=that&something=else');
    });

    it('should add a query to a relative path', function() {
        u = Uri.parse('/some/file.html');
        u.query('this=that&something=else');
        u.toString().should.be.eql('/some/file.html?this=that&something=else');
    });

    it('should add a query to a domain', function() {
        u = Uri.parse('//test.com');
        u.query('this=that&something=else');
        u.toString().should.be.eql('//test.com/?this=that&something=else');
    });

    it('should swap a query', function() {
        u = Uri.parse('//www.test.com?this=that&a=1&b=2c=3');
        u.query('this=that&something=else');
        u.toString().should.be.eql('//www.test.com/?this=that&something=else');
    });

    it('should delete a query', function() {
        u = Uri.parse('//www.test.com?this=that&a=1&b=2c=3');
        u.query(null);
        u.toString().should.be.eql('//www.test.com');
    });

    it('should empty a query', function() {
        u = Uri.parse('//www.test.com?this=that&a=1&b=2c=3');
        u.query('');
        u.toString().should.be.eql('//www.test.com');
    });

    it('should add an anchor to a domain', function() {
        u = Uri.parse('//test.com');
        u.anchor('content');
        u.toString().should.be.eql('//test.com/#content');
    });

    it('should add an anchor with a hash prefix to a domain', function() {
        u = Uri.parse('//test.com');
        u.anchor('#content');
        u.toString().should.be.eql('//test.com/#content');
    });

    it('should add an anchor to a path', function() {
        u = Uri.parse('/a/b/c/123.html');
        u.anchor('content');
        u.toString().should.be.eql('/a/b/c/123.html#content');
    });

    it('should change an anchor', function() {
        u = Uri.parse('/a/b/c/index.html#content');
        u.anchor('about');
        u.toString().should.be.eql('/a/b/c/index.html#about');
    });

    it('should empty an anchor', function() {
        u = Uri.parse('/a/b/c/index.html#content');
        u.anchor('');
        u.toString().should.be.eql('/a/b/c/index.html');
    });

    it('should delete an anchor', function() {
        u = Uri.parse('/a/b/c/index.html#content');
        u.anchor(null);
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

    it('should insert missing slash when origin and path have no slash', function () {
        u = Uri.parse('http://test.com');
        u.path('relativePath');
        u.toString().should.be.eql('http://test.com/relativePath');
    });

    it('should remove extra slash when origin and path both provide a slash', function () {
        u = Uri.parse('http://test.com/');
        u.path('/relativePath');
        u.toString().should.be.eql('http://test.com/relativePath');
    });

    it('correctly composes url encoded urls', function() {
        var originalQuery = '?k=%40v',
            parsed = Uri.parse('http://example.com' + originalQuery);
        parsed.query().should.be.eql(originalQuery);
    });
    
    it('should be able to return url root', function() {
        u = Uri.parse('http://test.com/ololo/trololo.html?param1=1#!123');
        u.getRoot().should.be.eql('http://test.com/ololo');
    });
});

provide();

});
