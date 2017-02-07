modules.define('spec', ['uri__querystring', 'location'], function(provide, Querystring, location) {

describe('location native API', function() {
        var Uri = Querystring.Uri;

        it('should change location by path', function() {
            location.change({ url : '/desktop.specs/location/spec-js+browser-js+bemhtml/spec-js+browser-js+bemhtml.html?test=a&ololo=123' });
            var u = Uri.parse(window.location.href);
            (u.getPath() + u.getQuery()).should.be.eql('/desktop.specs/location/spec-js+browser-js+bemhtml/spec-js+browser-js+bemhtml.html?test=a&ololo=123');
        });

        it('should change location by params with forceParams flag', function() {
            location.change({ params : { test : [1, 2] }, forceParams : true });
            var u = Uri.parse(window.location.href);
            (u.getPath() + u.getQuery()).should.be.eql('/desktop.specs/location/spec-js+browser-js+bemhtml/spec-js+browser-js+bemhtml.html?test=1&test=2');
        });

        it('should change location by params without forceParams flag', function() {
            location.change({ params : { param2 : [22] } });
            var u = Uri.parse(window.location.href);
            (u.getPath() + u.getQuery()).should.be.eql('/desktop.specs/location/spec-js+browser-js+bemhtml/spec-js+browser-js+bemhtml.html?test=1&test=2&param2=22');
        });

        it('shoud raise security error for different domain', function() {
            var before = Querystring.Uri.parse(window.location.href);

            try {
                location.change({ url : 'http://example.com' });
            } catch(e) {
                /security/i.test(e.name).should.be.true;
            }

            var after = Querystring.Uri.parse(window.location.href);
            after.getHost().should.be.eql(before.getHost());
        });
});

provide();

});
