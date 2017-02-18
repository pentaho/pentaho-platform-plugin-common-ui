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
(function(global) {
  /* globals requireCfg, CONTEXT_PATH, KARMA_RUN, SESSION_LOCALE, active_theme, ENVIRONMENT_CONFIG */

  /* eslint dot-notation: 0, require-jsdoc: 0 */

  var basePath =
      // environment configured
      (typeof ENVIRONMENT_CONFIG !== "undefined" && typeof ENVIRONMENT_CONFIG.paths !== "undefined" &&
        typeof ENVIRONMENT_CONFIG.paths["common-ui"] !== "undefined") ? ENVIRONMENT_CONFIG.paths["common-ui"] :
      // production
      (typeof CONTEXT_PATH !== "undefined") ? CONTEXT_PATH + "content/common-ui/resources/web" :
      // test
      (typeof KARMA_RUN !== "undefined") ? "../../package-res/resources/web" :
      // build
      "common-ui";

  var useDebug = typeof document === "undefined" || document.location.href.indexOf("debug=true") > 0;
  var minSuffix = useDebug ? "" : ".min";
  var requirePaths = requireCfg.paths;
  var requireShim = requireCfg.shim;
  var requireMap = requireCfg.map;

  // TODO: This fallback logic is temporary, and can be removed when the remaining
  //    parts of the system rename the "service" plugin id to "pentaho/service".
  var requireTypes = requireCfg.config["pentaho/service"] || (requireCfg.config["pentaho/service"] = {});

  // region common-ui
  requirePaths["common-ui"] = basePath;
  requirePaths["common-repo"] = basePath + "/repo";
  requirePaths["common-data"] = basePath + "/dataapi";

  requirePaths["pentaho/common"] = basePath + "/dojo/pentaho/common";
  // endregion

  // region Pentaho Web-Client Platform

  // Unfortunately, *mantle* already maps the "pentaho" id to "/js",
  // so the paths of all of the following sub-modules must be configured individually.
  // E.g. requirePaths["pentaho/util"] = basePath + "/pentaho/util";
  [
    "shim", "util", "lang",
    "i18n", "service", "data", "type",
    "visual", "config", "context", "debug", "ccc"
  ].forEach(function(name) {
    requirePaths["pentaho/" + name] = basePath + "/pentaho/" + name;
  });

  // Named instances
  requireTypes["pentaho/config/impl/instanceOfAmdLoadedService"] = "pentaho.config.IService";

  // TODO: remove the following when `webcontext.js` already configures pentaho/context
  requireCfg.config["pentaho/context"] = {
    theme:  getVar("active_theme"),
    locale: getVar("SESSION_LOCALE"),
    user: {
      id:   getVar("SESSION_NAME"),
      home: getVar("HOME_FOLDER")
    },
    reservedChars: getVar("RESERVED_CHARS"),
    server: {
      url: getUrl()
    }
  };

  function getVar(name) {
    return global[name] || null;
  }
  function getUrl() {
    return getVar("FULL_QUALIFIED_URL") ||
           getVar("CONTEXT_PATH") ||
           getVar("SERVER_PROTOCOL");
  }
  // endregion

  // region Base AMD Plugins
  requirePaths["local"] = basePath + "/util/local";
  requirePaths["json"] = basePath + "/util/require-json/json";
  requirePaths["text"] = basePath + "/util/require-text/text";
  // Using `map` is important for use in r.js and correct AMD config of the other files of the package.
  // Placing the minSuffix in the path ensures building works well,
  // so that the resolved module id is the same in both debug and non-debug cases.
  if(minSuffix) {
    requirePaths["common-ui/util/require-css/css"] = basePath + "/util/require-css/css" + minSuffix;
  }
  requireMap["*"]["css"] = "common-ui/util/require-css/css";
  // endregion

  // region ES Shims
  // Intended for private use of "pentaho/shim/es6-promise" only!
  if(minSuffix) {
    requirePaths["pentaho/shim/_es6-promise/es6-promise"] =
        basePath + "/pentaho/shim/_es6-promise/es6-promise" + minSuffix;
  }
  // endregion

  // region DOJO
  requirePaths["dojo"] = basePath + "/dojo/dojo";
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
  requirePaths["dojo/_base/config"] = dojoOverrides + "dojo/_base/config";
  requirePaths["dojo/store/Memory"] = dojoOverrides + "dojo/store/Memory";
  requirePaths["dijit/_HasDropDown"] = dojoOverrides + "dijit/_HasDropDown";
  requirePaths["dijit/_CssStateMixin"] = dojoOverrides + "dijit/_CssStateMixin";
  // endregion

  // region Plugin Handler
  requirePaths["common-ui/PluginHandler"] = basePath + "/plugin-handler/pluginHandler";
  requirePaths["common-ui/Plugin"] = basePath + "/plugin-handler/plugin";
  requirePaths["common-ui/AngularPluginHandler"] = basePath + "/plugin-handler/angularPluginHandler";
  requirePaths["common-ui/AngularPlugin"] = basePath + "/plugin-handler/angularPlugin";
  requirePaths["common-ui/AnimatedAngularPluginHandler"] = basePath + "/plugin-handler/animatedAngularPluginHandler";
  requirePaths["common-ui/AnimatedAngularPlugin"] = basePath + "/plugin-handler/animatedAngularPlugin";
  // endregion

  // region Bundled 3rd party libs
  requirePaths["common-ui/jquery"] = basePath + "/jquery/jquery" + minSuffix;
  requireShim["common-ui/jquery"] = {exports: "$"};

  requirePaths["common-ui/jquery-clean"] = basePath + "/jquery/jquery" + minSuffix;
  requireShim["common-ui/jquery-clean"] = {
    exports: "$",
    init: function() {
      return this.$.noConflict(true);
    }
  };

  requirePaths["common-ui/handlebars"] = basePath + "/handlebars/handlebars-v4.0.5";
  requireShim["common-ui/handlebars"] = ["common-ui/jquery"];

  requirePaths["common-ui/jquery-i18n"] = basePath + "/jquery/jquery.i18n.properties-min";
  requireShim["common-ui/jquery-i18n"] = ["common-ui/jquery"];
  requirePaths["common-ui/jquery-pentaho-i18n"] = basePath + "/jquery/jquery.i18n.properties.supported.languages";

  requirePaths["common-ui/bootstrap"] = basePath + "/bootstrap/bootstrap" + minSuffix;
  requireShim["common-ui/bootstrap"] = ["common-ui/jquery"];

  requirePaths["common-ui/ring"] = basePath + "/ring/ring";
  requireShim["common-ui/ring"] = {deps: ["common-ui/underscore"], exports: "ring"};

  requirePaths["common-ui/underscore"] = basePath + "/underscore/underscore" + minSuffix;
  // underscore should be required using the module ID above, creating a map entry to guarantee backwards compatibility
  requireMap["*"]["underscore"] = "common-ui/underscore"; // deprecated

  // ANGULAR
  requirePaths["common-ui/angular"] = basePath + "/angular/angular" + minSuffix;
  requireShim["common-ui/angular"] = {
    deps: ["common-ui/jquery"],
    exports: "angular",
    init: function() {
      // Load i18n for angular.
      var baseMid = "common-ui/angular-i18n/angular-locale_"; // mid = module id
      var locale = (typeof SESSION_LOCALE !== "undefined") ? SESSION_LOCALE : "en";

      locale = locale.replace("_", "-").toLowerCase();

      require([baseMid + locale], function() {}, function() {
        // Couldn"t find the locale specified, fall back.
        var prev = locale;

        // Strip off the country designation, try to get just the language.
        locale = (locale.length > 2) ? locale.substring(0, 2) : "en";

        if(typeof console !== "undefined" && console.warn)
          console.warn("Could not load locale for '" + prev + "', falling back to '" + locale + "'");

        require([baseMid + locale], function() {}, function() {
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
  requireShim["common-ui/angular-resource"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-route"] = basePath + "/angular/angular-route" + minSuffix;
  requireShim["common-ui/angular-route"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-animate"] = basePath + "/angular/angular-animate" + minSuffix;
  requireShim["common-ui/angular-animate"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-sanitize"] = basePath + "/angular/angular-sanitize" + minSuffix;
  requireShim["common-ui/angular-sanitize"] = ["common-ui/angular"];

  requirePaths["common-ui/properties-parser"] = basePath + "/angular-translate/properties-parser";

  requirePaths["common-ui/angular-translate"] = basePath + "/angular-translate/angular-translate";
  requireShim["common-ui/angular-translate"] = ["pentaho/shim/es5", "common-ui/angular"];

  requirePaths["common-ui/angular-translate-loader-partial"] = basePath +
      "/angular-translate/angular-translate-loader-partial";
  requireShim["common-ui/angular-translate-loader-partial"] = ["common-ui/angular-translate"];

  requirePaths["common-ui/angular-translate-loader-static"] = basePath +
      "/angular-translate/angular-translate-loader-static-files";
  requireShim["common-ui/angular-translate-loader-static"] = ["common-ui/angular-translate"];

  requirePaths["common-ui/angular-ui-bootstrap"] = basePath + "/bootstrap/ui-bootstrap-tpls-0.6.0.min";
  requireShim["common-ui/angular-ui-bootstrap"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-directives"] = basePath + "/angular-directives";
  requireShim["common-ui/angular-directives"] = ["common-ui/angular-ui-bootstrap"];
  // endregion

  // region Metadata Model and Visualizations Packages
  function mapTheme(mid, themeRoot, themes) {
    var theme = (typeof active_theme !== "undefined") ? active_theme : null;
    if(!theme || themes.indexOf(theme) < 0) theme = themes[0];

    // e.g. "/theme" -> "/themes/crystal"
    requireMap["*"][mid + "/theme"] = mid + "/" + themeRoot + "/" + theme;
  }

  function registerViz(name) {
    requireTypes[name] = "pentaho/visual/base";
  }

  // Metadata Model Base Theme
  mapTheme("pentaho/type", "themes", ["crystal"]);

  // CCC Themes
  mapTheme("pentaho/visual/models", "themes", ["crystal", "sapphire", "onyx", "det"]);

  // sample/calc theme
  mapTheme("pentaho/visual/samples/calc", "themes", ["crystal"]);

  requireCfg.packages.push({"name": "pentaho/visual/base", "main": "model"});
  requireCfg.packages.push({"name": "pentaho/visual/samples/calc", "main": "model"});

  [
    // base visual
    "pentaho/visual/base",

    // calc viz
    "pentaho/visual/samples/calc",

    // ccc vizs
    "pentaho/visual/models/abstract",
    "pentaho/visual/models/cartesianAbstract",
    "pentaho/visual/models/categoricalContinuousAbstract",
    "pentaho/visual/models/barAbstract",
    "pentaho/visual/models/barNormalizedAbstract",
    "pentaho/visual/models/barHorizontal",
    "pentaho/visual/models/bar",
    "pentaho/visual/models/barStacked",
    "pentaho/visual/models/barStackedHorizontal",
    "pentaho/visual/models/barNormalized",
    "pentaho/visual/models/barNormalizedHorizontal",
    "pentaho/visual/models/barLine",
    "pentaho/visual/models/line",
    "pentaho/visual/models/pointAbstract",
    "pentaho/visual/models/metricDotAbstract",
    "pentaho/visual/models/areaStacked",
    "pentaho/visual/models/pie",
    "pentaho/visual/models/heatGrid",
    "pentaho/visual/models/sunburst",
    "pentaho/visual/models/donut",
    "pentaho/visual/models/scatter",
    "pentaho/visual/models/bubble"
  ].forEach(registerViz);
  // endregion

  // TODO: this should be removed from here, and to the GEO plugin's package.json
  // when it is possible to specify global maps or an option that achieves the same effect.
  requireMap["*"]["pentaho/visual/models/geoMap"] = "pentaho/geo/visual_${project.version}/model";
  requireMap["*"]["pentaho/geo/visual/map"] = "pentaho/geo/visual_${project.version}/view";
})(this);
