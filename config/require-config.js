// Find and inject tests using require
var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return (/package\-res.*Spec\.js$/).test(file);
});

requireCfg['deps'] = tests;


requireCfg['baseUrl'] = 'base/build-res/module-scripts/';

requireCfg['paths']['test/karma/unit/angular-directives'] = "../../package-res/resources/web/test/karma/unit/angular-directives";

requireCfg['paths']['angular-mocks'] = "../../package-res/resources/web/angular/angular-mocks";
requireCfg['paths']['angular-scenario'] = "../../package-res/resources/web/angular/angular-scenario";

requireCfg['shim']['angular-mocks'] = { deps: ['common-ui/angular-resource'] };

requireCfg['paths']['dojo'] = '../../dev-res/dojo/dojo-release-1.9.2-src/dojo';
requireCfg['paths']['dojox'] = '../../dev-res/dojo/dojo-release-1.9.2-src/dojox';
requireCfg['paths']['dijit'] = '../../dev-res/dojo/dojo-release-1.9.2-src/dijit';

requireCfg['callback'] = function() {
  window.__karma__.start();
};

requirejs.config(requireCfg);
