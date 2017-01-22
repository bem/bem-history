({
    block : 'page',
    title : 'bem-history: uri',
    head : [
        { elem : 'css', url : '_simple.css' },
        { elem : 'js', url : '_simple.js' }
    ],
    content : [
        {
            tag : 'p',
            content : {
                block : 'test',
                mods : { action : 'addParam' },
                content : 'addParam'
            }
        }
    ]
})
