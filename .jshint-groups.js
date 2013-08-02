module.exports = {
    options: {
        eqeqeq: true,
        evil: true,
        expr: true,
        forin: true,
        immed: true,
        indent: 4,
        latedef: true,
        maxdepth: 4,
        maxlen: 120,
        maxparams: 4,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        quotmark: 'single',
        trailing: true,
        undef: true
    },
    groups: {
        client: {
            options: {
                predef: ['BEM'],
                browser: true,
                jquery: true
            },
            includes: ['common.blocks/**/*.js']
        }
    }
};
