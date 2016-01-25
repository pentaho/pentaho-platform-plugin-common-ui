// Find and inject tests using require
requireCfg.deps = Object.keys(window.__karma__.files).filter(function(file) {
    return (/package\-res.*Spec\.js$/).test(file);
});

requireCfg.baseUrl = "/base/build-res/module-scripts/";

requireCfg.paths["dojo"]  = "/base/dev-res/dojo/dojo-release-1.9.2-src/dojo";
requireCfg.paths["dojox"] = "/base/dev-res/dojo/dojo-release-1.9.2-src/dojox";
requireCfg.paths["dijit"] = "/base/dev-res/dojo/dojo-release-1.9.2-src/dijit";

requireCfg.paths["common-ui/jquery-clean"] = "/base/package-res/resources/web/jquery/jquery-1.9.1";
requireCfg.shim["common-ui/jquery-clean"] = {
  exports: "$",
  init: function() {
    return $.noConflict(true);
  }
};

requireCfg.callback = function() {
  window.__karma__.start();
};

requirejs.config(requireCfg);
