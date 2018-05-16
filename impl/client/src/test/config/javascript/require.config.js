(function() {

  "use strict";

  /* globals requireCfg, depDir, depWebJars, basePath, baseTest */

  CONTEXT_PATH = "/";

  var requirePackages = requireCfg.packages;

  // Use the i18n FileSystem version by default.
  requirePackages.forEach(function(packageDef) {
    if(packageDef.name === "pentaho/i18n") {
      packageDef.main = "directService";
    }
  });
})();
