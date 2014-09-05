({
    block : 'page',
    title : 'bem-history: location',
    head : { elem : 'js', url : '_simple.js' },
    content : [
        {
            block : 'test',
            js : { change : 'params' },
            content : 'click me to change location prams'
        },
        {
            block : 'test',
            js : { change : 'href' },
            content : 'click me to change location href'
        }
    ]
})
