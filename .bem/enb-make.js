module.exports = function(config) {
    config.node('desktop.bundles/index');

    config.nodeMask(/desktop\.bundles\/.*/, function(nodeConfig) {
        nodeConfig.addTechs([
            new (require('enb/techs/file-provider'))({ target: '?.bemjson.js' }),
            new (require('enb/techs/bemdecl-from-bemjson'))(),
            new (require('enb/techs/levels'))({ levels: getLevels(config) }),
            new (require('enb/techs/deps-old'))(),
            new (require('enb/techs/files'))(),
            new (require('enb/techs/js'))(),
            new (require('enb-bemhtml/techs/bemhtml'))(),
            new (require('enb/techs/html-from-bemjson'))()
        ]);
        nodeConfig.addTargets([
            '?.html', '_?.js'
        ]);
    });

    config.mode('development', function() {
        config.nodeMask(/desktop\.bundles\/.*/, function(nodeConfig) {
            nodeConfig.addTechs([
                new (require('enb/techs/file-copy'))({ sourceTarget: '?.js', destTarget: '_?.js' })
            ]);
        });
    });
    config.mode('production', function() {
        config.nodeMask(/desktop\.bundles\/.*/, function(nodeConfig) {
            nodeConfig.addTechs([
                new (require('enb/techs/borschik'))({ sourceTarget: '?.js', destTarget: '_?.js' })
            ]);
        });
    });
};

function getLevels(config) {
    return [
        'libs/bem-bl/blocks-common',
        'libs/bem-bl/blocks-desktop',
        'common.blocks',
        'desktop.bundles/index/blocks'
    ].map(function(level) {
        return config.resolvePath(level);
    });
}
