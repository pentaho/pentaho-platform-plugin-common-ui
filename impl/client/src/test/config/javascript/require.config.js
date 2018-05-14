(function() {

  "use strict";

  /* globals requireCfg, depDir, depWebJars, basePath, baseTest */

  /* eslint dot-notation: 0, require-jsdoc: 0 */

  CONTEXT_PATH = "/";

  var requirePaths = requireCfg.paths;

  // We need to map the original i18n src file to a different amd module
  // so that we can test it, as well use the mock that is need for the test environment
  requirePaths["pentaho/i18n-src"] = basePath + "/pentaho/i18n";
  requirePaths["pentaho/i18n"] = baseTest + "/pentaho/i18nMock";
  requirePaths["pentaho/i18n/MessageBundle"] = basePath + "/pentaho/i18n/MessageBundle";

})();
