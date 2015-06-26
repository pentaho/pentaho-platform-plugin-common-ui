/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
(function() {
  /* global requireCfg:true, CONTEXT_PATH:true, KARMA_RUN:true, SESSION_LOCALE:true */
  if (!requireCfg.map) {
    requireCfg.map = {};
  }
  if (!requireCfg.map["*"]) {
    requireCfg.map["*"] = {};
  }
  var basePath =
        // production
        (typeof CONTEXT_PATH !== "undefined") ? CONTEXT_PATH + "content/common-ui/resources/web" :
        // test
        (typeof KARMA_RUN    !== "undefined") ? "../../package-res/resources/web" :
        // build
        "common-ui",

      useDebug  = typeof document === "undefined" || document.location.href.indexOf("debug=true") > 0,
      minSuffix = useDebug ? "" : ".min",
      requirePaths   = requireCfg.paths,
      requireShim    = requireCfg.shim,
      requireMap     = requireCfg.map,
      requireService = requireCfg.config.service;

  requirePaths["common-ui"     ] = basePath;
  requirePaths["common-repo"   ] = basePath + "/repo";
  requirePaths["common-data"   ] = basePath + "/dataapi";
  requirePaths["pentaho/common"] = basePath + "/dojo/pentaho/common";

  requirePaths["pentaho/visual" ] = basePath + "/vizapi";
  requireMap["*"]["common-ui/vizapi"] = "pentaho/visual";

  // AMD PLUGINS
  requirePaths["local"  ] = basePath + "/util/local";
  requirePaths["service"] = basePath + "/util/service";
  requirePaths["json"   ] = basePath + "/util/require-json/json";
  requirePaths["text"   ] = basePath + "/util/require-text/text";
  // Using `map` is important for use in r.js and correct AMD config of the other files of the package.
  requireMap["*"]["css" ] = "common-ui/util/require-css/css" + minSuffix;

  // SHIMS
  requirePaths["es6-promise-shim"] = basePath + "/util/es6-promise-shim";
  requirePaths["common-ui/es5-shim"] = basePath + "/util/es5-shim";

  // DOJO
  requirePaths["dojo" ] = basePath + "/dojo/dojo";
  requirePaths["dojox"] = basePath + "/dojo/dojox";
  requirePaths["dijit"] = basePath + "/dojo/dijit";

  // ...Overrides
  var dojoOverrides = basePath + "/dojo/pentaho/common/overrides/";
  requirePaths["dojo/on"] = dojoOverrides + "dojo/on";
  requirePaths["dojo/dom-geometry"] = dojoOverrides + "dojo/dom-geometry";
  requirePaths["dojo/dom-prop"] = dojoOverrides + "dojo/dom-prop";
  requirePaths["dojox/layout/ResizeHandle"] = dojoOverrides + "dojox/layout/ResizeHandle";
  requirePaths["dojox/grid/_View"] = dojoOverrides + "dojox/grid/_View";
  requirePaths["dojox/xml/parser"] = dojoOverrides + "dojox/xml/parser";
  requirePaths["dojox/grid/Selection"] = dojoOverrides + "dojox/grid/Selection";
  requirePaths["dojox/grid/_FocusManager"] = dojoOverrides + "dojox/grid/_FocusManager";
  requirePaths["dojox/grid/_Scroller"] = dojoOverrides + "dojox/grid/_Scroller";
  requirePaths["dojox/storage"] = dojoOverrides + "dojox/storage";
  requirePaths["dojox/json"] = dojoOverrides + "dojox/json";
  requirePaths["dojox/rpc"] = dojoOverrides + "dojox/rpc";
  requirePaths["dojo/_base/kernel"] = dojoOverrides + "dojo/_base/kernel";
  requirePaths["dojo/store/Memory"] = dojoOverrides + "dojo/store/Memory";

  // Plugin Handler
  requirePaths["common-ui/PluginHandler"] = basePath + "/plugin-handler/pluginHandler";
  requirePaths["common-ui/Plugin"] = basePath + "/plugin-handler/plugin";
  requirePaths["common-ui/AngularPluginHandler"] = basePath + "/plugin-handler/angularPluginHandler";
  requirePaths["common-ui/AngularPlugin"] = basePath + "/plugin-handler/angularPlugin";
  requirePaths["common-ui/AnimatedAngularPluginHandler"] = basePath + "/plugin-handler/animatedAngularPluginHandler";
  requirePaths["common-ui/AnimatedAngularPlugin"] = basePath + "/plugin-handler/animatedAngularPlugin";

  // OTHER LIBS
  requirePaths["common-ui/jquery"] = basePath + "/jquery/jquery-1.9.1" + minSuffix;
  requireShim ["common-ui/jquery"] = {exports: "$"};

  requirePaths["common-ui/handlebars"] = basePath + "/handlebars/handlebars";
  requireShim ["common-ui/handlebars"] = ["common-ui/jquery"];

  requirePaths["common-ui/jquery-i18n"] = basePath + "/jquery/jquery.i18n.properties-min";
  requireShim ["common-ui/jquery-i18n"] = ["common-ui/jquery"];
  requirePaths["common-ui/jquery-pentaho-i18n"] = basePath + "/jquery/jquery.i18n.properties.supported.languages";

  requirePaths["common-ui/bootstrap"] = basePath + "/bootstrap/bootstrap" + minSuffix;
  requireShim ["common-ui/bootstrap"] = ["common-ui/jquery"];

  requirePaths["common-ui/ring"] = basePath + "/ring/ring";
  requireShim ["common-ui/ring"] = {deps: ["common-ui/underscore"], exports: "ring"};

  requirePaths["common-ui/underscore"] = basePath + "/underscore/underscore" + minSuffix;
  requirePaths["underscore"] = basePath + "/underscore/underscore" + minSuffix;

  // Intended for private use of "es6-promise-shim" only
  requirePaths["es6-promise"] = basePath + "/es6-promise/es6-promise" + minSuffix;

  // ANGULAR
  requirePaths["common-ui/angular"] = basePath + "/angular/angular" + minSuffix;
  requireShim ["common-ui/angular"] = {
    deps: ["common-ui/jquery"],
    exports: "angular",
    init: function() {
      // Load i18n for angular.
      var baseMid = "common-ui/angular-i18n/angular-locale_", // mid = module id
          locale = (typeof SESSION_LOCALE !== "undefined") ? SESSION_LOCALE : "en";

      locale = locale.replace("_", "-").toLowerCase();

      require([baseMid + locale], function() { }, function(err) {
          // Couldn"t find the locale specified, fall back.
          var prev = locale;

          // Strip off the country designation, try to get just the language.
          locale = (locale.length > 2) ? locale.substring(0, 2) : "en";

          if(typeof console !== "undefined" && console.warn)
            console.warn("Could not load locale for '" + prev + "', falling back to '" + locale + "'");

          require([baseMid + locale], function() { }, function(err) {
            // Can't find the language at all, go get english.
            if(typeof console !== "undefined" && console.warn)
              console.warn("Could not load locale for '" + locale + "', falling back to 'en'");

            require([baseMid + "en"], function() {});
          });
      });
    }
  };

  requirePaths["common-ui/angular-i18n"] = basePath + "/angular/i18n";

  requirePaths["common-ui/angular-resource"] = basePath + "/angular/angular-resource" + minSuffix;
  requireShim ["common-ui/angular-resource"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-route"] = basePath + "/angular/angular-route" + minSuffix;
  requireShim ["common-ui/angular-route"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-animate"] = basePath + "/angular/angular-animate" + minSuffix;
  requireShim ["common-ui/angular-animate" ] = ["common-ui/angular"];

  requirePaths["common-ui/angular-sanitize"] = basePath + "/angular/angular-sanitize" + minSuffix;
  requireShim ["common-ui/angular-sanitize"] = ["common-ui/angular"];

  requirePaths["common-ui/properties-parser"] = basePath + "/angular-translate/properties-parser";
  requireShim ["common-ui/properties-parser"] = ["common-ui/es5-shim"];

  requirePaths["common-ui/angular-translate"] = basePath + "/angular-translate/angular-translate" + minSuffix;
  requireShim ["common-ui/angular-translate"] = ["common-ui/es5-shim", "common-ui/angular"];

  requirePaths["common-ui/angular-translate-loader-partial"] = basePath + "/angular-translate/angular-translate-loader-partial" + minSuffix;
  requireShim ["common-ui/angular-translate-loader-partial"] = ["common-ui/angular-translate"];

  requirePaths["common-ui/angular-translate-loader-static"] = basePath + "/angular-translate/angular-translate-loader-static" + minSuffix;
  requireShim ["common-ui/angular-translate-loader-static"] = ["common-ui/angular-translate"];

  requirePaths["common-ui/angular-ui-bootstrap"] = basePath + "/bootstrap/ui-bootstrap-tpls-0.6.0.min";
  requireShim ["common-ui/angular-ui-bootstrap"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-directives"] = basePath + "/angular-directives";
  requireShim ["common-ui/angular-directives"] = ["common-ui/angular-ui-bootstrap"];

  // Visual API
  requireService["pentaho/visual/config"] = "IVisualApiConfiguration";

  // Visual API - CCC
  requireService["pentaho/visual/ccc/visualTypeProvider"] = "IVisualTypeProvider";
  requireService["pentaho/visual/ccc/visualTypeConfig"  ] = "IVisualApiConfiguration";

  // Sample visualizations
  requireService["pentaho/visual/sample/visualTypeProvider"] = "IVisualTypeProvider";

}());
