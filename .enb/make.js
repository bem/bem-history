var DEFAULT_LANGS = ['ru', 'en'],
    fs = require('fs'),
    path = require('path'),
    naming = require('bem-naming'),
    techs = require('./techs'),
    PLATFORMS = {
        'desktop' : ['common']
    };

module.exports = function(config) {
    var platforms = ['desktop'],
        langs = process.env.BEM_I18N_LANGS;

    config.includeConfig('enb-bem-examples');
    config.includeConfig('enb-bem-docs');
    config.includeConfig('enb-bem-specs');

    config.setLanguages(langs? langs.split(' ') : [].concat(DEFAULT_LANGS));

    configurePages(platforms);
    configureSets(platforms, {
        tests : config.module('enb-bem-examples').createConfigurator('tests'),
        examples : config.module('enb-bem-examples').createConfigurator('examples'),
        docs : config.module('enb-bem-docs').createConfigurator('docs', 'examples'),
        specs : config.module('enb-bem-specs').createConfigurator('specs')
    });

    function configurePages(platforms) {
        platforms.forEach(function(platform) {
            var nodes = [platform + '.pages/*'];

            config.nodes(nodes, function(nodeConfig) {
                nodeConfig.addTech([techs.files.provide, { target : '?.bemjson.js' }]);
            });

            configureNodes(platform, nodes);
        });
    }

    function configureNodes(platform, nodes) {
        configureLevels(platform, nodes);

        config.nodes(nodes, function(nodeConfig) {
            var langs = config.getLanguages();

            // Base techs
            nodeConfig.addTechs([
                [techs.bem.bemjsonToBemdecl],
                [techs.bem.deps],
                [techs.bem.files]
            ]);

            // Client techs
            nodeConfig.addTechs([
                [techs.css.stylus],
                [techs.js, {
                    filesTarget : '?.js.files',
                    target : '?.browser.js',
                    sourceSuffixes : ['vanilla.js', 'browser.js', 'js']
                }],
                [techs.files.merge, {
                    target : '?.pre.js',
                    sources : ['?.browser.bemhtml.js', '?.browser.js']
                }],
                [techs.ym, {
                    source : '?.pre.js',
                    target : '?.js'
                }]
            ]);

            // js techs
            nodeConfig.addTechs([
                [techs.bem.depsByTechToBemdecl, {
                    target : '?.js-js.bemdecl.js',
                    sourceTech : 'js',
                    destTech : 'js'
                }],
                [techs.bem.mergeBemdecl, {
                    sources : ['?.bemdecl.js', '?.js-js.bemdecl.js'],
                    target : '?.js.bemdecl.js'
                }],
                [techs.bem.deps, {
                    target : '?.js.deps.js',
                    bemdeclFile : '?.js.bemdecl.js'
                }],
                [techs.bem.files, {
                    depsFile : '?.js.deps.js',
                    filesTarget : '?.js.files',
                    dirsTarget : '?.js.dirs'
                }]
            ]);

            // Client Template Engine
            nodeConfig.addTechs([
                [techs.bem.depsByTechToBemdecl, {
                    target : '?.template.bemdecl.js',
                    sourceTech : 'js',
                    destTech : 'bemhtml'
                }],
                [techs.bem.deps, {
                    target : '?.template.deps.js',
                    bemdeclFile : '?.template.bemdecl.js'
                }],
                [techs.bem.files, {
                    depsFile : '?.template.deps.js',
                    filesTarget : '?.template.files',
                    dirsTarget : '?.template.dirs'
                }],
                [techs.engines.bemhtml, {
                    target : '?.browser.bemhtml.js',
                    filesTarget : '?.template.files',
                    devMode : false
                }]
            ]);

            // Build htmls
            nodeConfig.addTechs([
                [techs.engines.bemhtml, { devMode : false }],
                [techs.html.bemhtml]
            ]);

            langs.forEach(function(lang) {
                var destTarget = '?.' + lang + '.html';

                nodeConfig.addTech([techs.files.copy, { source : '?.html', target : destTarget }]);
                nodeConfig.addTarget(destTarget);
            });

            nodeConfig.addTargets([
                '_?.css', '_?.js', '?.html'
            ]);
        });

        config.mode('development', function() {
            config.nodes(nodes, function(nodeConfig) {
                nodeConfig.addTechs([
                    [techs.borschik, { source : '?.css', target : '_?.css', freeze : true, minify : false }],
                    [techs.borschik, { source : '?.js', target : '_?.js', freeze : true, minify : false }]
                ]);
            });
        });

        config.mode('production', function() {
            config.nodes(nodes, function(nodeConfig) {
                nodeConfig.addTechs([
                    [techs.borschik, { source : '?.css', target : '_?.css', freeze : true, minify : true }],
                    [techs.borschik, { source : '?.js', target : '_?.js', freeze : true, minify : true }]
                ]);
            });
        });
    }

    function configureLevels(platform, nodes) {
        config.nodes(nodes, function(nodeConfig) {
            var nodeDir = nodeConfig.getNodePath(),
                blockSublevelDir = path.join(nodeDir, '..', '.blocks'),
                sublevelDir = path.join(nodeDir, 'blocks'),
                extendedLevels = [].concat(getTestLevels(platform));

            if(fs.existsSync(blockSublevelDir)) {
                extendedLevels.push(blockSublevelDir);
            }

            if(fs.existsSync(sublevelDir)) {
                extendedLevels.push(sublevelDir);
            }

            nodeConfig.addTech([techs.bem.levels, { levels : extendedLevels }]);
        });
    }

    function configureSets(platforms, sets) {
        platforms.forEach(function(platform) {
            sets.examples.configure({
                destPath : platform + '.examples',
                levels : getLibLevels(platform),
                techSuffixes : ['examples'],
                fileSuffixes : ['bemjson.js', 'title.txt'],
                inlineBemjson : true,
                processInlineBemjson : wrapInPage
            });

            sets.tests.configure({
                destPath : platform + '.tests',
                levels : getLibLevels(platform),
                techSuffixes : ['tests'],
                fileSuffixes : ['bemjson.js', 'title.txt']
            });

            sets.docs.configure({
                destPath : platform + '.docs',
                levels : getLibLevels(platform),
                exampleSets : [platform + '.examples'],
                langs : config.getLanguages(),
                jsdoc : { suffixes : ['vanilla.js', 'browser.js', 'js'] }
            });

            sets.specs.configure({
                destPath : platform + '.specs',
                levels : getLibLevels(platform),
                sourceLevels : getSpecLevels(platform),
                jsSuffixes : ['vanilla.js', 'browser.js', 'js'],
                scripts : ['https://yastatic.net/es5-shims/0.0.2/es5-shims.min.js'],
                templateEngine : {
                    templateTech : require('enb-bemxjst/techs/bemhtml'),
                    templateOptions : { sourceSuffixes : ['bemhtml', 'bemhtml.js'] },
                    htmlTech : require('enb-bemxjst/techs/bemjson-to-html'),
                    htmlTechOptionNames : { bemjsonFile : 'bemjsonFile', templateFile : 'bemhtmlFile' }
                }
            });

            configureNodes(platform, [platform + '.tests/*/*', platform + '.examples/*/*']);
        });
    }
};

function getLibLevels(platform) {
    return PLATFORMS[platform].map(function(level) {
        return level + '.blocks';
    });
}

function getSourceLevels(platform) {
    var platformNames = PLATFORMS[platform];
    var levels = [];

    platformNames.forEach(function(name) {
        levels.push({ path : path.join('libs', 'bem-core', name + '.blocks'), check : false });
    });

    platformNames.forEach(function(name) {
        levels.push({ path : name + '.blocks', check : true });
    });

    return levels;
}

function getTestLevels(platform) {
    return [].concat(
        getSourceLevels(platform),
        'test.blocks'
    );
}

function getSpecLevels(platform) {
    return [].concat(
        { path : path.join('libs', 'bem-pr', 'spec.blocks'), check : false },
        getSourceLevels(platform)
    );
}

function getBrowsers(platform) {
    switch(platform) {
        case 'desktop':
            return [
                'last 2 versions',
                'ie 10',
                'ff 24',
                'opera 12.1'
            ];
    }
}

function wrapInPage(bemjson, meta) {
    var basename = '_' + path.basename(meta.filename, '.bemjson.js');
    return {
        block : 'page',
        title : naming.stringify(meta.notation),
        head : [{ elem : 'css', url : basename + '.css' }],
        scripts : [{ elem : 'js', url : basename + '.js' }],
        content : bemjson
    };
}
