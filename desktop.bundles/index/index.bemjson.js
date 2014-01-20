({
    block: 'b-page',
    title: 'BEM wrap for History API',
    head: [
        { elem: 'css', url: '../../node_modules/mocha/mocha.css' }
    ],
    content: [
        { tag: 'div', attrs: { id: 'mocha' } },
        {
            block: 'test',
            js: true
        },
        { elem: 'js', url: 'http://yandex.st/jquery/1.8.3/jquery.min.js' },
        
        { elem: 'js', url: '../../node_modules/chai/chai.js' },
        { elem: 'js', url: '../../node_modules/mocha/mocha.js' },
        
        { elem: 'js', url: '_index.js' }
    ]
})
