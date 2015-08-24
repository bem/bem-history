module.exports = {
    files : {
        provide : require('enb/techs/file-provider'),
        copy : require('enb/techs/file-copy'),
        merge : require('enb/techs/file-merge')
    },
    bem : require('enb-bem-techs'),
    css : {
        stylus : require('enb-stylus/techs/stylus')
    },
    js : require('enb-borschik/techs/js-borschik-include'),
    ym : require('enb-modules/techs/prepend-modules'),
    engines : {
        bemhtml : require('enb-bemxjst/techs/bemhtml')
    },
    html : {
        bemhtml : require('enb-bemxjst/techs/bemjson-to-html')
    },
    borschik : require('enb-borschik/techs/borschik')
};
