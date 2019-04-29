/*!
 * Copyright 2019 Hitachi Vantara. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
