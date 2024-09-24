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

"use strict";

var __requirePromise = null;
var __config = null;

export default vizApiLoader;

vizApiLoader.config = configure;

function vizApiLoader(moduleIds) {

  if(!Array.isArray(moduleIds)) {
    moduleIds = [moduleIds];
  }

  return getRequireAsync().then(function(require) {
    return new Promise(function(resolve, reject) {
      if(Array.isArray(moduleIds)) {
        require(moduleIds, function() {

          var results = Array.prototype.slice.call(arguments);

          resolve(results);
        }, reject);
      } else {
        require([moduleIds], resolve, reject);
      }
    });
  });
}

function configure(config) {
  // Store for calling initAsync later.
  __config = config;

  return vizApiLoader;
}

function getRequireAsync() {
  return __requirePromise || (__requirePromise = initAsync(__config || {}));
}

function initAsync(config) {

  var basePath = removeTrailingSlash(config.baseUrl || ".");
  var application = config.application || null;
  var isDebug = !!(config.debug || false);

  var requireCfg;

  var global = getGlobal();

  return loadScript(basePath + "/require.js")
    .then(function() {

      global.requireCfg = requireCfg = {
        paths: {},
        shim: {},
        map: {"*": {}},
        bundles: {},
        config: {
          "pentaho/debug": {
            level: isDebug ? "debug" : "warn"
          },
          "pentaho/modules": {},
          "pentaho/environment": {
            application: application
          }
        },
        packages: []
      };

      global.ENVIRONMENT_CONFIG = {
        debug: isDebug,
        paths: {
          "common-ui": basePath
        }
      };

      return loadScript(basePath + "/common-ui-require-js-cfg.js");
    })
    .then(function() {

      global.require.config(requireCfg);

      requireCfg = null;

      ["paths", "map", "config", "packages", "shim", "bundles"].forEach(function(key) {
        if(config[key] != null) {
          (requireCfg || (requireCfg = {}))[key] = config[key];
        }
      });

      if(requireCfg !== null) {
        global.require.config(requireCfg);
      }

      return global.require;
    });
}

function loadScript(src) {
  return new Promise(function(resolve, reject) {
    var elem;
    elem = document.createElement("script");
    elem.src = src;
    elem.async = true;
    elem.onload = resolve;
    elem.onerror = reject;
    document.head.appendChild(elem);
  });
}

function getGlobal() {
  if(typeof self !== "undefined") {
    return self;
  }

  if(typeof window !== "undefined") {
    return window;
  }

  if(typeof global !== "undefined" && global.Math && global.Array) {
    return global;
  }

  // eslint-disable-next-line no-new-func
  return Function("return this")();
}

function removeTrailingSlash(path) {
  return path.replace(/^(.*)\/?$/, "$1");
}