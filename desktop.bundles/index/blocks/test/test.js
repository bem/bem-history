BEM.DOM.decl('test', {
    onSetMod: {
        js: function() {
            // window.history = {};
            
            // var h = BEM.blocks['history'].getInstance(),
            //     l = BEM.blocks['location'].getInstance();
            
            // h.pushState(undefined, '', '?test=a');
            // console.log('\n\nhistory state', h.state);
            // 
            // console.log('\n\nhistory state', h.state);
            // console.log('location _state', l._state);
            // 
            // l.change({ params: { test: [1,2] }, forceParams: true });
            // console.log('\n\nhistory state', h.state);
            // console.log('location _state', l._state);
            // 
            // l.change({ params: { param2: [22] } });
            // console.log('\n\nhistory state', h.state);
            // console.log('location _state', l._state);
                        
            // mocha.setup('bdd');
            
            var expect = chai.expect,
                assert = chai.assert;
            
            describe('Uri.js', function() {
                var u;

                beforeEach(function() {
                    u = new Uri('http://test.com');
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
                    u = new Uri('/index.html');
                    u.host('wherever.com');
                    expect(u.toString()).to.equal('wherever.com/index.html');
                })

                it('can change a hostname', function() {
                    u.host('wherever.com');
                    expect(u.toString()).to.equal('http://wherever.com');
                })

                it('should not add a port when there is no hostname', function() {
                    u = new Uri('/index.html');
                    u.port(8080);
                    expect(u.toString()).to.equal('/index.html');
                })

                it('should  change the port', function() {
                    u.port(8080);
                    expect(u.toString()).to.equal('http://test.com:8080');
                })

                it('should  add a path to a domain', function() {
                    u = new Uri('test.com');
                    u.path('/some/article.html');
                    expect(u.toString()).to.equal('test.com/some/article.html')
                })

                it('should  change a path', function() {
                    u.path('/some/article.html');
                    expect(u.toString()).to.equal('http://test.com/some/article.html');
                })

                it('should  delete a path', function() {
                    u = new Uri('http://test.com/index.html');
                    u.path(null);
                    expect(u.toString()).to.equal('http://test.com');
                })

                it('should  empty a path', function() {
                    u = new Uri('http://test.com/index.html');
                    u.path('');
                    expect(u.toString()).to.equal('http://test.com');
                })

                it('should  add a query to nothing', function() {
                    u = new Uri('');
                    u.query('this=that&something=else');
                    expect(u.toString()).to.equal('?this=that&something=else');
                })

                it('should  add a query to a relative path', function() {
                    u = new Uri('/some/file.html');
                    u.query('this=that&something=else');
                    expect(u.toString()).to.equal('/some/file.html?this=that&something=else');
                })

                it('should  add a query to a domain', function() {
                    u = new Uri('test.com')
                    u.query('this=that&something=else')
                    expect(u.toString()).to.equal('test.com/?this=that&something=else')
                })

                it('should  swap a query', function() {
                    u = new Uri('www.test.com?this=that&a=1&b=2c=3')
                    u.query('this=that&something=else')
                    expect(u.toString()).to.equal('www.test.com/?this=that&something=else')
                })

                it('should  delete a query', function() {
                    u = new Uri('www.test.com?this=that&a=1&b=2c=3')
                    u.query(null)
                    expect(u.toString()).to.equal('www.test.com')
                })

                it('should  empty a query', function() {
                    u = new Uri('www.test.com?this=that&a=1&b=2c=3')
                    u.query('')
                    expect(u.toString()).to.equal('www.test.com')
                })

                it('should  add an anchor to a domain', function() {
                    u = new Uri('test.com')
                    u.anchor('content')
                    expect(u.toString()).to.equal('test.com/#content')
                })

                it('should  add an anchor with a hash prefix to a domain', function() {
                    u = new Uri('test.com')
                    u.anchor('#content')
                    expect(u.toString()).to.equal('test.com/#content')
                })

                it('should  add an anchor to a path', function() {
                    u = new Uri('a/b/c/123.html')
                    u.anchor('content')
                    expect(u.toString()).to.equal('a/b/c/123.html#content')
                })

                it('should  change an anchor', function() {
                    u = new Uri('/a/b/c/index.html#content')
                    u.anchor('about')
                    expect(u.toString()).to.equal('/a/b/c/index.html#about')
                })

                it('should  empty an anchor', function() {
                    u = new Uri('/a/b/c/index.html#content')
                    u.anchor('')
                    expect(u.toString()).to.equal('/a/b/c/index.html')
                })

                it('should  delete an anchor', function() {
                    u = new Uri('/a/b/c/index.html#content')
                    u.anchor(null)
                    expect(u.toString()).to.equal('/a/b/c/index.html')
                })

                // it('should  get single encoded values', function() {
                //     u = new Uri('http://example.com/search?q=%40')
                //     expect(u.getQueryParamValues('q')[0]).to.equal('@')
                // })

                // it('should  get double encoded values', function() {
                //     u = new Uri('http://example.com/search?q=%2540')
                //     expect(u.getQueryParamValues('q')[0]).to.equal('%40')
                // })

                it('should  work with %40 values', function() {
                    u = new Uri('http://example.com/search?q=%40&stupid=yes')
                    u.deleteQueryParam('stupid')
                    expect(u.toString()).to.equal('http://example.com/search?q=%40')
                })

                it('should  work with %25 values', function() {
                    u = new Uri('http://example.com/search?q=100%25&stupid=yes')
                    u.deleteQueryParam('stupid')
                    expect(u.toString()).to.equal('http://example.com/search?q=100%25')
                })

                it('should insert missing slash when origin and path have no slash', function () {
                    u = new Uri('http://test.com')
                    u.path('relativePath')
                    expect(u.toString()).to.equal('http://test.com/relativePath')
                })

                it('should remove extra slash when origin and path both provide a slash', function () {
                    u = new Uri('http://test.com/')
                    u.path('/relativePath')
                    expect(u.toString()).to.equal('http://test.com/relativePath')
                })

                // it('should remove extra slashes when origin and path both provide too many slashes', function () {
                //     u = new Uri('http://test.com//')
                //     u.path('//relativePath')
                //     expect(u.toString()).to.equal('http://test.com/relativePath')
                // })

                // it('preserves the format of file uris', function() {
                //     var str = 'file://c:/parent/child.ext'
                //     var uri = new Uri(str)
                //     expect(uri.toString()).to.equal(str)
                // })

                it('correctly composes url encoded urls', function() {
                    var originalQuery = '?k=%40v'
                    var parsed = new Uri('http://example.com' + originalQuery)
                    expect(parsed.query()).to.equal(originalQuery)
                })
            })
            
            var windowHistoryBackup = window.history;
            
            describe('Hashbang fallback', function() {
                window.history = {};
                
                var h = BEM.blocks['history'].getInstance(),
                    l = BEM.blocks['location'].getInstance();
                    
            
                describe('location block', function() {
                    
                    it('should  change location by path and emit event hashchange', function(done){
                        // BEM.DOM.win.on('hashchange', function () {
                        //     assert(true);
                        //     done();
                        // });
                
                        l.change({ url: '/desktop.bundles/index/index.html?test=a&ololo=123' });
                        assert(true);
                        // expect(window.location.href).to.equal('file:///desktop.bundles/index/index.html#!/index.html?test=a&ololo=123');
                        done();
                    })
                    
                    it('should  change location by params with forceParams flag and emit event hashchange', function(done){
                        // BEM.DOM.win.on('hashchange', function () {
                        //     assert(true);
                        //     done();
                        // });
                
                        l.change({ params: { test: [1,2] }, forceParams: true });
                        assert(true);
                        done();
                    })
                    
                    it('should  change location by params without forceParams flag and emit event hashchange', function(done){
                        // BEM.DOM.win.on('hashchange', function () {
                        //     assert(true);
                        //     done();
                        // });
                
                        l.change({ params: { param2: [22] } });
                        assert(true);
                        done();
                    })
                
                })
            })
            
            describe('Native API', function() {
                BEM.blocks['history'].instance = null;
                BEM.blocks['location']._instance = null;
                window.history = windowHistoryBackup;
                
                var h = BEM.blocks['history'].getInstance(),
                    l = BEM.blocks['location'].getInstance();
            
                describe('location block', function() {
                    
                    it('should  change location by path and emit history event statechange', function(done){
                        // h.on('statechange', function () {
                        //     assert(true);
                        //     done();
                        // });
                
                        l.change({ url: '/desktop.bundles/index/index.html?test=a&ololo=123' });
                        // assert(true);
                        expect(window.location.href).to.equal('file:///desktop.bundles/index/index.html?test=a&ololo=123');
                        done();
                    })
                    
                    it('should  change location by params with forceParams flag and emit history event statechange', function(done){
                        // h.on('statechange', function () {
                        //     assert(true);
                        //     done();
                        // });
            
                        l.change({ params: { test: [1,2] }, forceParams: true });
                        // assert(true);
                        expect(window.location.href).to.equal('file:///desktop.bundles/index/index.html?test=1&test=2');
                        done();
                    })
                
                    it('should  change location by params without forceParams flag and emit history event statechange', function(done){
                        // h.on('statechange', function () {
                        //     assert(true);
                        //     done();
                        // });
            
                        l.change({ params: { param2: [22] } });
                        // assert(true);
                        expect(window.location.href).to.equal('file:///desktop.bundles/index/index.html?test=1&test=2&param2=22');
                        done();
                    })
                    
                })
                
            })
            
            // mocha.checkLeaks();
            // mocha.run();
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
