var PATH = require('path'),
    environ = require('bem-environ'),
    PRJ_TECHS = PATH.resolve(__dirname, '../techs/'),
    BEMCORE_TECHS = environ.getLibPath('bem-core', '.bem/techs'),
    BEMPR_TECHS = environ.getLibPath('bem-pr', 'bem/techs'),
    getTechResolver = environ.getTechResolver;

exports.getTechs = function() {
    var techs = {
        'bemjson.js' : 'bem/lib/tech/v2',
        'blocks' : 'level-proto',
        'examples' : 'level-proto',
        'specs' : 'level-proto',
        'tests' : 'level-proto',
        'bemdecl.js' : 'v2/bemdecl.js',
        'deps.js' : 'v2/deps.js',
        'js' : 'v2/js-i'
    };

    ['bemhtml', 'vanilla.js', 'browser.js'].forEach(getTechResolver(techs, BEMCORE_TECHS));

    [
        'spec.js',
        'spec.js+browser.js+bemhtml',
        'spec.bemjson.js'
    ].forEach(getTechResolver(techs, BEMPR_TECHS));

    return techs;
};

exports.defaultTechs = ['browser.js', 'bemhtml'];
