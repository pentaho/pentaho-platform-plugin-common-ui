/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


(function(global) {

  var basePath = "node_modules/@pentaho/visual-sandbox";

  global.requireCfg = {
    paths: {
      "pentaho/visual/samples/sandbox": basePath
    },
    shim: {},
    map: {"*": {}},
    bundles: {},
    config: {
      "pentaho/modules": {},
      "pentaho/environment": {
        application: "pentaho/visual/samples/sandbox"
      }
    },
    packages: []
  };

  global.ENVIRONMENT_CONFIG = {
    paths: {
      "common-ui": basePath
    }
  };

  loadScriptSyncNested(basePath + "/require.js");
  loadScriptSyncNested(basePath + "/common-ui-require-js-cfg.js");
  loadScriptSyncNested(basePath + "/package-require-js-cfg.js");
  loadScriptSyncNested(basePath + "/require-cfg.js");

  function loadScriptSyncNested(src) {
    // eslint-disable-next-line no-useless-concat
    document.write("<script language='javascript' type='text/javascript' src='" + src + "'></scr" + "ipt>");
  }
})(window);
