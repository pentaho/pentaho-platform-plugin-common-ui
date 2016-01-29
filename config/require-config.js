// Find and inject tests using require
requireCfg.deps = Object.keys(window.__karma__.files).filter(function(file) {
    return (/package\-res.*Spec\.js$/).test(file);
});

requireCfg.baseUrl = "/base/build-res/module-scripts/";

requireCfg.paths["test/karma/unit/angular-directives"] =
  "/base/package-res/resources/web/test/karma/unit/angular-directives";

requireCfg.paths["angular-scenario"] = "/base/package-res/resources/web/angular/angular-scenario";

requireCfg.paths["dojo"]  = "/base/dev-res/dojo/dojo-release-1.9.2-src/dojo";
requireCfg.paths["dojox"] = "/base/dev-res/dojo/dojo-release-1.9.2-src/dojox";
requireCfg.paths["dijit"] = "/base/dev-res/dojo/dojo-release-1.9.2-src/dijit";

requireCfg.paths["pentaho/visual/type/registryMock"] =
    "/base/package-res/resources/web/test/karma/unit/pentaho/visual/type/registryMock";

requireCfg.paths["common-ui/jquery-clean"] = "/base/package-res/resources/web/jquery/jquery-1.9.1";
requireCfg.shim["common-ui/jquery-clean"] = {
  exports: "$",
  init: function() {
    return $.noConflict(true);
  }
};

requireCfg.paths["pentaho/i18n"] =
    "/base/package-res/resources/web/test/karma/unit/pentaho/i18nMock";

// Reset "pentaho/service" module configuration.
requireCfg.config["pentaho/service"] = {};

requireCfg.callback = function() {
  window.__karma__.start();
};

requirejs.config(requireCfg);
