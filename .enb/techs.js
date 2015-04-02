module.exports = {
    files : {
        provide : require('enb/techs/file-provider'),
        copy : require('enb/techs/file-copy'),
        merge : require('enb/techs/file-merge')
    },
    bem : require('enb-bem-techs'),
    css : {
        stylus : require('enb-stylus/techs/css-stylus')
    },
    js : require('./techs/js-borschik-include'),
    ym : require('enb-modules/techs/prepend-modules'),
    engines : {
        bemhtml : require('enb-bemxjst/techs/bemhtml-old')
    },
    html : {
        bemhtml : require('enb-bemxjst/techs/html-from-bemjson')
    },
    borschik : require('enb-borschik/techs/borschik')
};
