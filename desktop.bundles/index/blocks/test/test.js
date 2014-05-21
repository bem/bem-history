BEM.DOM.decl('test', {
    onSetMod: {
        js: function() {
            var expect = chai.expect,
                assert = chai.assert;
            
            describe('Uri.js', function() {
                var u;

                beforeEach(function() {
                    u = BEM.blocks.uri.parse('http://test.com');
                })

                it('can replace protocol', function() {
                    u.protocol('https');
                    expect(u.toString()).to.equal('https://test.com');
                })

                it('can replace protocol with colon suffix', function() {
                    u.protocol('https:');
                    expect(u.toString()).to.equal('https://test.com');
                })

                it('can add a hostname to a relative path', function() {
                    u = BEM.blocks.uri.parse('/index.html');
                    u.host('wherever.com');
                    expect(u.toString()).to.equal('//wherever.com/index.html');
                })

                it('can change a hostname', function() {
                    u.host('wherever.com');
                    expect(u.toString()).to.equal('http://wherever.com');
                })

                it('should not add a port when there is no hostname', function() {
                    u = BEM.blocks.uri.parse('/index.html');
                    u.port(8080);
                    expect(u.toString()).to.equal('/index.html');
                })

                it('should change the port', function() {
                    u.port(8080);
                    expect(u.toString()).to.equal('http://test.com:8080');
                })

                it('should add a path to a domain', function() {
                    u = BEM.blocks.uri.parse('//test.com');
                    u.path('/some/article.html');
                    expect(u.toString()).to.equal('//test.com/some/article.html')
                })

                it('should change a path', function() {
                    u.path('/some/article.html');
                    expect(u.toString()).to.equal('http://test.com/some/article.html');
                })

                it('should delete a path', function() {
                    u = BEM.blocks.uri.parse('http://test.com/index.html');
                    u.path(null);
                    expect(u.toString()).to.equal('http://test.com');
                })

                it('should empty a path', function() {
                    u = BEM.blocks.uri.parse('http://test.com/index.html');
                    u.path('');
                    expect(u.toString()).to.equal('http://test.com');
                })
                
                it('should be able to parse query', function() {
                    u = BEM.blocks.uri.parse('http://test.com/index.html?param1=1&param2=21&param2=22');
                    expect(u.queryParams).to.deep.equal({ param1: ['1'], param2: ['21', '22'] });
                })
                
                it('should differ ?param from ?param=', function() {
                    u = BEM.blocks.uri.parse('http://test.com/index.html?param1&param2=&param1');
                    expect(u.queryParams).to.deep.equal({ param1: [], param2: [''] });
                })
                
                it('should add { param: [] } to query as ?param', function() {
                    u = BEM.blocks.uri.parse('http://test.com/index.html');
                    u.addParam('param', []);
                    expect(u.toString()).to.equal('http://test.com/index.html?param');
                })

                it('should add a query to nothing', function() {
                    u = BEM.blocks.uri.parse('');
                    u.query('this=that&something=else');
                    expect(u.toString()).to.equal('?this=that&something=else');
                })

                it('should add a query to a relative path', function() {
                    u = BEM.blocks.uri.parse('/some/file.html');
                    u.query('this=that&something=else');
                    expect(u.toString()).to.equal('/some/file.html?this=that&something=else');
                })

                it('should add a query to a domain', function() {
                    u = BEM.blocks.uri.parse('//test.com')
                    u.query('this=that&something=else')
                    expect(u.toString()).to.equal('//test.com/?this=that&something=else')
                })

                it('should swap a query', function() {
                    u = BEM.blocks.uri.parse('//www.test.com?this=that&a=1&b=2c=3')
                    u.query('this=that&something=else')
                    expect(u.toString()).to.equal('//www.test.com/?this=that&something=else')
                })

                it('should delete a query', function() {
                    u = BEM.blocks.uri.parse('//www.test.com?this=that&a=1&b=2c=3')
                    u.query(null)
                    expect(u.toString()).to.equal('//www.test.com')
                })

                it('should empty a query', function() {
                    u = BEM.blocks.uri.parse('//www.test.com?this=that&a=1&b=2c=3')
                    u.query('')
                    expect(u.toString()).to.equal('//www.test.com')
                })

                it('should add an anchor to a domain', function() {
                    u = BEM.blocks.uri.parse('//test.com')
                    u.anchor('content')
                    expect(u.toString()).to.equal('//test.com/#content')
                })

                it('should add an anchor with a hash prefix to a domain', function() {
                    u = BEM.blocks.uri.parse('//test.com')
                    u.anchor('#content')
                    expect(u.toString()).to.equal('//test.com/#content')
                })

                it('should add an anchor to a path', function() {
                    u = BEM.blocks.uri.parse('/a/b/c/123.html')
                    u.anchor('content')
                    expect(u.toString()).to.equal('/a/b/c/123.html#content')
                })

                it('should change an anchor', function() {
                    u = BEM.blocks.uri.parse('/a/b/c/index.html#content')
                    u.anchor('about')
                    expect(u.toString()).to.equal('/a/b/c/index.html#about')
                })

                it('should empty an anchor', function() {
                    u = BEM.blocks.uri.parse('/a/b/c/index.html#content')
                    u.anchor('')
                    expect(u.toString()).to.equal('/a/b/c/index.html')
                })

                it('should delete an anchor', function() {
                    u = BEM.blocks.uri.parse('/a/b/c/index.html#content')
                    u.anchor(null)
                    expect(u.toString()).to.equal('/a/b/c/index.html')
                })

                it('should get single encoded values', function() {
                    u = BEM.blocks.uri.parse('http://example.com/search?q=%40')
                    expect(u.getParam('q')[0]).to.equal('@')
                })

                it('should get double encoded values', function() {
                    u = BEM.blocks.uri.parse('http://example.com/search?q=%2540')
                    expect(u.getParam('q')[0]).to.equal('%40')
                })

                it('should work with %40 values', function() {
                    u = BEM.blocks.uri.parse('http://example.com/search?q=%40&stupid=yes')
                    u.deleteParam('stupid')
                    expect(u.toString()).to.equal('http://example.com/search?q=%40')
                })

                it('should work with %25 values', function() {
                    u = BEM.blocks.uri.parse('http://example.com/search?q=100%25&stupid=yes')
                    u.deleteParam('stupid')
                    expect(u.toString()).to.equal('http://example.com/search?q=100%25')
                })

                it('should insert missing slash when origin and path have no slash', function () {
                    u = BEM.blocks.uri.parse('http://test.com')
                    u.path('relativePath')
                    expect(u.toString()).to.equal('http://test.com/relativePath')
                })

                it('should remove extra slash when origin and path both provide a slash', function () {
                    u = BEM.blocks.uri.parse('http://test.com/')
                    u.path('/relativePath')
                    expect(u.toString()).to.equal('http://test.com/relativePath')
                })

                // it('should remove extra slashes when origin and path both provide too many slashes', function () {
                //     u = BEM.blocks.uri.parse('http://test.com//')
                //     u.path('//relativePath')
                //     expect(u.toString()).to.equal('http://test.com/relativePath')
                // })

                // it('preserves the format of file uris', function() {
                //     var str = 'file://c:/parent/child.ext'
                //     var uri = BEM.blocks.uri.parse(str)
                //     expect(uri.toString()).to.equal(str)
                // })

                it('correctly composes url encoded urls', function() {
                    var originalQuery = '?k=%40v'
                    var parsed = BEM.blocks.uri.parse('http://example.com' + originalQuery)
                    expect(parsed.query()).to.equal(originalQuery)
                })
                
                it('should be able to return url root', function() {
                    u = BEM.blocks.uri.parse('http://test.com/ololo/trololo.html?param1=1#!123');
                    expect(u.getRoot()).to.equal('http://test.com/ololo');
                })
                
                it('should be able to decode cp1251 encoded params', function() {
                    u = BEM.blocks.uri.parse('http://test.com/ololo/trololo.html?text=%F2%E0%E1%EB%EE');
                    expect(u.getParam('text')[0]).to.equal('табло');
                })
                
                it('should not fall on params encoded with unknown encoding', function() {
                    u = BEM.blocks.uri.parse('http://test.com/ololo/trololo.html?text=%COCO%C0C0');
                    expect(u.getParam('text')[0]).to.equal('%COCO%C0C0');
                })
                
                it('should be able to normalize a full url to percentage encoding', function() {
                    u = BEM.blocks.uri.parse('http://yandex.ru/yandsearch?text=yandex+почта&lr=213');
                    expect(u.toString()).to.equal('http://yandex.ru/yandsearch?text=yandex%20%D0%BF%D0%BE%D1%87%D1%82%D0%B0&lr=213');
                })
            })
            
            var windowHistoryBackup = window.history;
            
            describe('Hashbang fallback', function() {
                // In Firefox window.history can't be deleted or replaced with {}, undefined,
                // so this tests section fails.
                window.history = {};
                
                var h = BEM.blocks.history.getInstance(),
                    l = BEM.blocks.location.getInstance();
                    
                
                describe('history block', function() {
                    
                    it('should be able to generate hashbang from url', function() {
                        var hashbang = h._generateHashbang('/desktop.bundles/index/index.html?test=a&ololo=123');
                        expect(hashbang).to.equal('!/index.html?test=a&ololo=123');
                    })
                    
                })
                
                describe('location block', function() {
                    
                    it('should change location by path and emit event hashchange', function() {
                        l.change({ url: '/desktop.bundles/index/index.html?test=a&ololo=123' });
                        var u = BEM.blocks.uri.parse(window.location.href);
                        expect('#' + u.anchor()).to.equal('#!/index.html?test=a&ololo=123');
                    })
                    
                    it('should change location by params with forceParams flag and emit event hashchange', function() {
                        l.change({ params: { test: [1,2] }, forceParams: true });
                        var u = BEM.blocks.uri.parse(window.location.href);
                        expect('#' + u.anchor()).to.equal('#!/index.html?test=1&test=2');
                    })
                    
                    it('should change location by params without forceParams flag and emit event hashchange', function() {
                        l.change({ params: { param2: [22] } });
                        var u = BEM.blocks.uri.parse(window.location.href);
                        expect('#' + u.anchor()).to.equal('#!/index.html?test=1&test=2&param2=22');
                    })
                
                })
            })
            
            describe('Native API', function() {
                BEM.blocks.history._instance = null;
                BEM.blocks.location._instance = null;
                window.history = windowHistoryBackup;
                
                var h = BEM.blocks.history.getInstance(),
                    l = BEM.blocks.location.getInstance();
                
                describe('history block', function() {
                    
                    it('should be able to remove hashbang from url', function() {
                        var url = h._removeHashbang('/desktop.bundles/index/index.html?ololo=trololo#!/index.html?test=a&ololo=123'),
                            checkUrl = BEM.blocks.uri.parse('/desktop.bundles/index/index.html?test=a&ololo=123');
                        expect(url).to.equal(checkUrl.build());
                    })
                    
                })
                
                describe('location block', function() {
                    
                    it('should change location by path and emit history event statechange', function() {
                        l.change({ url: '/desktop.bundles/index/index.html?test=a&ololo=123' });
                        var u = BEM.blocks.uri.parse(window.location.href);
                        expect(u.path() + u.query()).to.equal('/desktop.bundles/index/index.html?test=a&ololo=123');
                    })
                    
                    it('should change location by params with forceParams flag and emit history event statechange', function() {
                        l.change({ params: { test: [1,2] }, forceParams: true });
                        var u = BEM.blocks.uri.parse(window.location.href);
                        expect(u.path() + u.query()).to.equal('/desktop.bundles/index/index.html?test=1&test=2');
                    })
                
                    it('should change location by params without forceParams flag and emit history event statechange', function() {
                        l.change({ params: { param2: [22] } });
                        var u = BEM.blocks.uri.parse(window.location.href);
                        expect(u.path() + u.query()).to.equal('/desktop.bundles/index/index.html?test=1&test=2&param2=22');
                    })
                    
                })
                
            })
        }
    }
});

function onload(fn) {
    if(window.addEventListener) { window.addEventListener('load', fn, false) }
    else if(window.attachEvent) { window.attachEvent('onload', fn) }
}

window.mocha.ui('bdd'); // Добавляет в window интерфейсы для описания тестов (describe и пр.)
window.chai.should(); // Расширяет Object.prototype всякими полезными свойствами

onload(function() {
    window.mochaPhantomJS ? window.mochaPhantomJS.run() : window.mocha.run();
});
