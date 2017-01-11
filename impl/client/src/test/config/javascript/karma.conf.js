module.exports = function(config) {
    config.set({

        basePath: '${basedir}',

        frameworks: ['jasmine', 'requirejs'],

        plugins: [
            'karma-jasmine',
            'karma-requirejs',
            'karma-chrome-launcher',
            'karma-mocha-reporter'
        ],

        files: [
            '${project.build.directory}/context-begin.js',

            {pattern: '${build.dependenciesDirectory}/**/*',         included: false}, // target/dependency/
            {pattern: '${build.javascriptTestOutputDirectory}/**/*', included: false}, // target/test-javascript/
            {pattern: '${build.javascriptTestSourceDirectory}/**/*', included: false}, // src/test/javascript/

            '${build.dependenciesDirectory}/cdf/cdf-require-js-cfg.js',
            // TODO: remove? {pattern: '${basedir}/src/main/resources/i18n/**/*.properties', included: false},
            '${build.javascriptTestConfigDirectory}/require-test.js',
            '${project.build.directory}/context.js'
        ],

        exclude: [
            // excluding this two folders because we are using the versions inside the webjars folder
            '${project.build.directory}/dependency/dojo-release-${dojo.version}-src/(dojo|dijit)/**/*'
        ],

        reporters: ["mocha"],

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ["Chrome"]
    });
};
