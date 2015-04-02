module.exports = {
    options : {
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

    groups : {
        vanillajs : {
            options : {
                predef : ['modules']
            },
            includes : ['*.blocks/**/*.vanilla.js']
        },

        browserjs : {
            options : {
                browser : true,
                predef : ['modules']
            },
            includes : ['*.blocks/**/*.js'],
            excludes : [
                '**/*.bem/*.js',
                '**/*.i18n/*.js',
                '**/*.bemjson.js',
                '**/*.deps.js',
                '**/*.node.js',
                '**/*.spec.js',
                '**/*.vanilla.js'
            ]
        },

        specjs : {
            options : {
                browser : true,
                predef : [
                    'modules',
                    'describe',
                    'it',
                    'before',
                    'beforeEach',
                    'after',
                    'afterEach'
                ]
            },
            includes : ['*.blocks/**/*.spec.js']
        },

        bemjsonjs : {
            options : {
                asi : true
            },
            includes : [
                '*.bundles/**/*.bemjson.js',
                '**/*.examples/**/*.bemjson.js'
            ],
            excudes : [
                '**/.bem/**/*',
                '*.examples/**/*',
                '*.specs/**/*',
                '*.docs/**/*',
                'libs/**/*',
                'node_modules/**/*'
            ]
        }
    }
};
