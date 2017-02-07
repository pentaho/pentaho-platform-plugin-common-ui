/* globals window, requirejs */

(function() {
  "use strict";

  /* globals requireCfg, active_theme, depDir, depWebJars, basePath, baseTest, webjarsSubPath */

  /* eslint dot-notation: 0, require-jsdoc: 0 */

  var requirePaths    = requireCfg.paths;
  var requireShim     = requireCfg.shim;
  var requireMap      = requireCfg.map;
  var requirePackages = requireCfg.packages;
  var requireTypes    = requireCfg.config["pentaho/service"];

  requirePaths["dojo"] = depWebJars + "/dojo/${dojo.version}";
  requirePaths["dijit"] = depWebJars + "/dijit/${dojo.version}";
  requirePaths["dojox"] = depDir + "/dojo-release-${dojo.version}-src/dojox";

  // ...Overrides
  var dojoOverrides = basePath + "/dojo/pentaho/common/overrides/";

  requirePaths["dojo/on"] = dojoOverrides + "dojo/on";
  requirePaths["dojo/dom-geometry"] = dojoOverrides + "dojo/dom-geometry";
  requirePaths["dojo/dom-prop"] = dojoOverrides + "dojo/dom-prop";
  requirePaths["dojox/layout/ResizeHandle"] = dojoOverrides + "dojox/layout/ResizeHandle";
  requirePaths["dojox/grid/_View"] = dojoOverrides + "dojox/grid/_View";
  requirePaths["dojox/xml/parser"] = dojoOverrides + "dojox/xml/parser";
  requirePaths["dojox/grid/Selection"] =  dojoOverrides + "dojox/grid/Selection";
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

  requirePaths["common-ui"] = basePath;
  requirePaths["common-data"] = basePath + "/dataapi";
  requirePaths["common-repo"] = basePath + "/repo";
  requirePaths["pentaho/common"] = basePath + "/dojo/pentaho/common";

  // Unfortunately, mantle already maps the "pentaho" id to "/js",
  // so all the following sub-modules must be mapped individually.
  requirePaths["pentaho/data"] = basePath + "/pentaho/data";
  requirePaths["pentaho/lang"] = basePath + "/pentaho/lang";
  requirePaths["pentaho/type"] = basePath + "/pentaho/type";
  requirePaths["pentaho/util"] = basePath + "/pentaho/util";
  requirePaths["pentaho/visual"] = basePath + "/pentaho/visual";
  requirePaths["pentaho/service"] = basePath + "/pentaho/service";
  requirePaths["pentaho/i18n"] = baseTest + "/pentaho/i18nMock";
  requirePaths["pentaho/shim"] = basePath + "/pentaho/shim";
  requirePaths["pentaho/config"] = basePath + "/pentaho/config";
  requirePaths["pentaho/context"] = basePath + "/pentaho/context";
  requirePaths["pentaho/debug"] = basePath + "/pentaho/debug";

  // Named instances
  requireTypes["pentaho/config/impl/instanceOfAmdLoadedService"] = "pentaho.config.IService";

  requirePaths["json"] = basePath + "/util/require-json/json";

  // jquery
  requirePaths["common-ui/jquery"] = depWebJars + "/jquery/${jquery.version}/dist/jquery";
  requireShim["common-ui/jquery"] = {exports: "$"};

  /*
   The path for common-ui/jquery-clean must be for a different file used by common-ui/jquery.
   If the same jquery file was used for both paths, a timeout might occur and the tests would fail.
   See the third bullet at http://requirejs.org/docs/errors.html#timeout for more information.
   */
  requirePaths["common-ui/jquery-clean"] = depDir + "/jqueryClean" + webjarsSubPath +
      "/jquery/${jquery.version}/dist/jquery";
  requireShim["common-ui/jquery-clean"] = {
    exports: "$",
    init: function() {
      return this.$.noConflict(true);
    }
  };

  // underscore
  requirePaths["common-ui/underscore"] = basePath + "/underscore/underscore";

  // Angular
  requirePaths["common-ui/angular"] = depWebJars + "/angular/${angular.version}/angular";
  requireShim["common-ui/angular"] = {
    deps: ["common-ui/jquery"],
    exports: "angular"
  };

  requirePaths["common-ui/angular-resource"] = depWebJars + "/angular-resource/${angular.version}/angular-resource";
  requireShim["common-ui/angular-resource"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-ui-bootstrap"] = basePath + "/bootstrap/ui-bootstrap-tpls-0.6.0.min";
  requireShim["common-ui/angular-ui-bootstrap"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-directives"] = basePath + "/angular-directives";
  requireShim["common-ui/angular-directives"] = ["common-ui/angular-ui-bootstrap"];

  requirePaths["common-ui/angular-route"] = depWebJars + "/angular-route/${angular.version}/angular-route";
  requireShim["common-ui/angular-route"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-animate"] = depWebJars + "/angular-animate/${angular.version}/angular-animate";
  requireShim["common-ui/angular-animate"] = ["common-ui/angular"];

  // Plugin Handler
  requirePaths["common-ui/Plugin"] = basePath + "/plugin-handler/plugin";
  requirePaths["common-ui/PluginHandler"] = basePath + "/plugin-handler/pluginHandler";
  requirePaths["common-ui/AngularPlugin"] = basePath + "/plugin-handler/angularPlugin";
  requirePaths["common-ui/AngularPluginHandler"] = basePath + "/plugin-handler/angularPluginHandler";
  requirePaths["common-ui/AnimatedAngularPlugin"] = basePath + "/plugin-handler/animatedAngularPlugin";
  requirePaths["common-ui/AnimatedAngularPluginHandler"] = basePath + "/plugin-handler/animatedAngularPluginHandler";

  // Ring
  requirePaths["common-ui/ring"] = basePath + "/ring/ring";
  requireShim["common-ui/ring"] = {deps: ["common-ui/underscore"], exports: "ring"};

  // --- Extra Viz API config for themes and packages
  function mapTheme(mid, themeRoot, themes) {
    var theme = (typeof active_theme !== "undefined") ? active_theme : null;
    if(!theme || themes.indexOf(theme) < 0) theme = themes[0];

    // e.g. "/theme" -> "/themes/crystal"
    requireMap["*"][mid + "/theme"] = mid + "/" + themeRoot + "/" + theme;
  }

  function registerVizPackage(name) {
    requirePackages.push({"name": name, "main": "model"});
    requireTypes[name] = "pentaho/visual/base";
  }

  // Metadata Model Base Theme
  mapTheme("pentaho/type", "themes", ["crystal"]);

  // CCC Themes
  mapTheme("pentaho/visual/ccc", "_themes", ["crystal", "sapphire", "onyx", "det"]);

  [
    "pentaho/visual/base",
    "pentaho/visual/ccc/abstract",
    "pentaho/visual/ccc/bar"
  ].forEach(registerVizPackage);

})();
