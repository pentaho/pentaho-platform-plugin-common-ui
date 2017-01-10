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

            {pattern: '${project.build.directory}/dependency/*/**/*', included: false},
            {pattern: '${build.javascriptTestOutputDirectory}/**/*.+(js|css|html|properties)', included: false},
            {pattern: '${build.javascriptTestSourceDirectory}/**/*', included: false},

            // test(not working) {pattern: '${build.javascriptTestSourceDirectory}/**/*.+js', included: false},

            '${build.dependenciesDirectory}/cdf/cdf-require-js-cfg.js',

            //{pattern: '${basedir}/src/main/resources/i18n/**/*.properties', included: false},

            '${build.javascriptTestConfigDirectory}/require-test.js',
            '${project.build.directory}/context.js'
        ],

        exclude: [
            //'${project.build.directory}/dependency/common-ui/resources/web/dojo/**/*.+(js|css|properties|map)',
            //'${basedir}/target/dependency/*/**/*.+(spec.js)'
        ],

        reporters: ["mocha"],

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ["Chrome"]
    });
};
