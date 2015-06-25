// Find and inject tests using require
requireCfg.deps = Object.keys(window.__karma__.files).filter(function(file) {
    return (/package\-res.*Spec\.js$/).test(file);
});

requireCfg.baseUrl = "/base/build-res/module-scripts/";

requireCfg.paths["test/karma/unit/angular-directives"] =
  "/base/package-res/resources/web/test/karma/unit/angular-directives";

requireCfg.paths["angular-mocks"] = "/base/package-res/resources/web/angular/angular-mocks";
requireCfg.shim ["angular-mocks"] = {deps: ["common-ui/angular-resource"]};

requireCfg.paths["angular-scenario"] = "/base/package-res/resources/web/angular/angular-scenario";

requireCfg.paths["dojo"]  = "/base/dev-res/dojo/dojo-release-1.9.2-src/dojo";
requireCfg.paths["dojox"] = "/base/dev-res/dojo/dojo-release-1.9.2-src/dojox";
requireCfg.paths["dijit"] = "/base/dev-res/dojo/dojo-release-1.9.2-src/dijit";

requireCfg.paths["common-ui/prompting"] = "common-ui/prompting";

requireCfg.paths["pentaho/visual/type/registryMock"] =
    "/base/package-res/resources/web/test/karma/unit/vizapi/type/registryMock";

requireCfg.paths["cdf/lib"] = "cdf/js/lib";

// Reset "service" module configuration.
requireCfg.config.service = {};

requireCfg.callback = function() {
  window.__karma__.start();
};

requirejs.config(requireCfg);
