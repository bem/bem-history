module.exports = {
    options: {
        expr : true,
        eqeqeq : true,
        undef : true,
        boss : true,
        sub : true,
        supernew : true,
        loopfunc : true,
        onecase : true,
        quotmark : 'single'
    },
    groups: {
        client: {
            options: {
                predef: ['modules'],
                browser: true,
                jquery: true
            },
            includes: ['common.blocks/**/*.js'],
            excludes: [
                '**/*.spec.js',
                '**/*.deps.js'
            ]
        },
        specjs : {
            options : {
                browser : true,
                predef : [ 'modules',
                    'describe',
                    'it',
                    'before',
                    'beforeEach',
                    'after',
                    'afterEach'
                ]
            },
            includes : ['**/*.spec.js'],
            excludes: [
                'node_modules/**',
                '*.specs/**'
            ]
        }
    }
};
