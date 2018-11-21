(function(global) {

  var basePath = "node_modules/@pentaho/viz-api";

  global.requireCfg = {
    paths: {},
    shim: {},
    map: {"*": {}},
    bundles: {},
    config: {
      "pentaho/modules": {},
      "pentaho/environment": {
        application: "pentaho-viz-api-sandbox"
      }
    },
    packages: []
  };

  global.ENVIRONMENT_CONFIG = {
    paths: {
      "common-ui": basePath
    }
  };

  loadScriptSyncNested("node_modules/requirejs/require.js");
  loadScriptSyncNested(basePath + "/common-ui-require-js-cfg.js");
  loadScriptSyncNested(basePath + "/package-require-js-cfg.js");
  loadScriptSyncNested(basePath + "/require-cfg.js");

  function loadScriptSyncNested(src) {
    // eslint-disable-next-line no-useless-concat
    document.write("<script language='javascript' type='text/javascript' src='" + src + "'></scr" + "ipt>");
  }
})(window);
