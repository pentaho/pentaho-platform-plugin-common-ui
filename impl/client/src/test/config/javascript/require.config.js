/* globals window, requirejs */

(function() {
  "use strict";

  /* globals requireCfg, active_theme, depDir, depWebJars, basePath, baseTest, webjarsSubPath */

  /* eslint dot-notation: 0, require-jsdoc: 0 */

  var requirePaths    = requireCfg.paths;
  var requireShim     = requireCfg.shim;
  var requireMap      = requireCfg.map;
  var requireTypeInfo = requireCfg.config["pentaho/typeInfo"];
  var requireInstInfo = requireCfg.config["pentaho/instanceInfo"];

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
  requirePaths["dojo/selector/_loader"] = dojoOverrides + "dojo/selector/_loader";
  requirePaths["dojo/i18n"] = dojoOverrides + "dojo/i18n";
  requirePaths["dojo/request/default"] = dojoOverrides + "dojo/request/default";

  requirePaths["common-ui"] = basePath;
  requirePaths["common-data"] = basePath + "/dataapi";
  requirePaths["common-repo"] = basePath + "/repo";
  requirePaths["pentaho/common"] = basePath + "/dojo/pentaho/common";

  // Unfortunately, mantle already maps the "pentaho" id to "/js",
  // so all the following sub-modules must be mapped individually.
  requirePaths["pentaho/data"] = basePath + "/pentaho/data";
  requirePaths["pentaho/lang"] = basePath + "/pentaho/lang";
  requirePaths["pentaho/type"] = basePath + "/pentaho/type";
  requirePaths["pentaho/typeInfo"] = basePath + "/pentaho/typeInfo";
  requirePaths["pentaho/instanceInfo"] = basePath + "/pentaho/instanceInfo";
  requirePaths["pentaho/util"] = basePath + "/pentaho/util";
  requirePaths["pentaho/visual"] = basePath + "/pentaho/visual";
  requirePaths["pentaho/service"] = basePath + "/pentaho/service";
  // We need to map the original i18n src file to a different amd module
  // so that we can test it, as well use the mock that is need for the test environment
  requirePaths["pentaho/i18n-src"] = basePath + "/pentaho/i18n";
  requirePaths["pentaho/i18n"] = baseTest + "/pentaho/i18nMock";
  requirePaths["pentaho/i18n/MessageBundle"] = basePath + "/pentaho/i18n/MessageBundle";
  requirePaths["pentaho/shim"] = basePath + "/pentaho/shim";
  requirePaths["pentaho/config"] = basePath + "/pentaho/config";
  requirePaths["pentaho/environment"] = basePath + "/pentaho/environment";
  requirePaths["pentaho/debug"] = basePath + "/pentaho/debug";
  requirePaths["pentaho/ccc"] = basePath + "/pentaho/ccc";

  // Named instances
  requireInstInfo["pentaho/config/impl/instanceOfAmdLoadedService"] = {type: "pentaho.config.IService"};

  requireTypeInfo["pentaho/type/instance"] = {alias: "instance"};
  requireTypeInfo["pentaho/type/value"] = {alias: "value", base: "instance"};
  requireTypeInfo["pentaho/type/property"] = {alias: "property", base: "instance"};
  requireTypeInfo["pentaho/type/list"] = {alias: "list", base: "value"};
  requireTypeInfo["pentaho/type/element"] = {alias: "element", base: "value"};
  requireTypeInfo["pentaho/type/complex"] = {alias: "complex", base: "element"};
  requireTypeInfo["pentaho/type/simple"] = {alias: "simple", base: "element"};
  requireTypeInfo["pentaho/type/number"] = {alias: "number", base: "simple"};
  requireTypeInfo["pentaho/type/string"] = {alias: "string", base: "simple"};
  requireTypeInfo["pentaho/type/boolean"] = {alias: "boolean", base: "simple"};
  requireTypeInfo["pentaho/type/date"] = {alias: "date", base: "simple"};
  requireTypeInfo["pentaho/type/object"] = {alias: "object", base: "simple"};
  requireTypeInfo["pentaho/type/function"] = {alias: "function", base: "simple"};
  requireTypeInfo["pentaho/type/typeDescriptor"] = {alias: "type", base: "simple"};
  requireTypeInfo["pentaho/type/mixins/enum"] = {alias: "enum", base: "element"};
  requireTypeInfo["pentaho/type/action/base"] = {base: "element"};

  requireTypeInfo["pentaho/data/filter/abstract"] = {base: "complex"};
  requireTypeInfo["pentaho/data/filter/true"] = {alias: "true", base: "pentaho/data/filter/abstract"};
  requireTypeInfo["pentaho/data/filter/false"] = {alias: "false", base: "pentaho/data/filter/abstract"};
  requireTypeInfo["pentaho/data/filter/tree"] = {base: "pentaho/data/filter/abstract"};
  requireTypeInfo["pentaho/data/filter/or"] = {alias: "or", base: "pentaho/data/filter/tree"};
  requireTypeInfo["pentaho/data/filter/and"] = {alias: "and", base: "pentaho/data/filter/tree"};
  requireTypeInfo["pentaho/data/filter/not"] = {alias: "not", base: "pentaho/data/filter/abstract"};
  requireTypeInfo["pentaho/data/filter/property"] = {base: "pentaho/data/filter/abstract"};
  requireTypeInfo["pentaho/data/filter/isEqual"] = {alias: "=", base: "pentaho/data/filter/property"};
  requireTypeInfo["pentaho/data/filter/isIn"] = {alias: "in", base: "pentaho/data/filter/property"};
  requireTypeInfo["pentaho/data/filter/isGreater"] = {alias: ">", base: "pentaho/data/filter/property"};
  requireTypeInfo["pentaho/data/filter/isGreaterOrEqual"] = {alias: ">=", base: "pentaho/data/filter/property"};
  requireTypeInfo["pentaho/data/filter/isLess"] = {alias: "<", base: "pentaho/data/filter/property"};
  requireTypeInfo["pentaho/data/filter/isLessOrEqual"] = {alias: "<=", base: "pentaho/data/filter/property"};
  requireTypeInfo["pentaho/data/filter/isLike"] = {alias: "like", base: "pentaho/data/filter/property"};

  requireTypeInfo["pentaho/visual/base/model"] = {base: "complex"};
  requireTypeInfo["pentaho/visual/base/view"] = {
    base: "complex",
    props: {
      model: {valueType: "pentaho/visual/base/model"}
    }
  };
  requireTypeInfo["pentaho/visual/role/adaptation/strategy"] = {base: "complex"};
  requireTypeInfo["pentaho/visual/role/adaptation/identityStrategy"] = {
    base: "pentaho/visual/role/adaptation/strategy"
  };
  requireTypeInfo["pentaho/visual/role/adaptation/tupleStrategy"] = {
    base: "pentaho/visual/role/adaptation/strategy"
  };
  requireTypeInfo["pentaho/visual/role/adaptation/entityWithTimeIntervalKeyStrategy"] = {
    base: "pentaho/visual/role/adaptation/strategy"
  };

  requirePaths["json"] = basePath + "/util/require-json/json";

  // jquery
  requirePaths["common-ui/jquery"] = basePath + "/jquery/jquery.conflict";

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

  // Type API Base Theme
  mapTheme("pentaho/type", "themes", ["ruby"]);

  // Visual Models Themes
  mapTheme("pentaho/visual/models", "themes", ["crystal", "sapphire", "onyx", "det", "ruby"]);

  // sample/calc theme
  mapTheme("pentaho/visual/samples/calc", "themes", ["ruby"]);

  requireTypeInfo["pentaho/visual/models/abstract"] = {base: "pentaho/visual/base/model"};
  requireTypeInfo["pentaho/visual/samples/calc/model"] = {base: "pentaho/visual/base/model"};
  [
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
    "pentaho/visual/models/metricPointAbstract",
    "pentaho/visual/models/areaStacked",
    "pentaho/visual/models/pie",
    "pentaho/visual/models/heatGrid",
    "pentaho/visual/models/sunburst",
    "pentaho/visual/models/donut",
    "pentaho/visual/models/scatter",
    "pentaho/visual/models/bubble"
  ].forEach(function(name) {
    requireTypeInfo[name] = {base: "pentaho/visual/models/abstract"};
  });

  // VizAPI actions
  requireTypeInfo["pentaho/visual/action/base"] = {base: "pentaho/type/action/base"};
  requireTypeInfo["pentaho/visual/action/select"] = {alias: "select", base: "pentaho/visual/action/base"};
  requireTypeInfo["pentaho/visual/action/execute"] = {alias: "execute", base: "pentaho/visual/action/base"};
  requireTypeInfo["pentaho/visual/action/update"] = {base: "pentaho/visual/action/base"};

  // Color Palettes
  requireTypeInfo["pentaho/visual/color/palette"] = {base: "complex"};

  [
    "pentaho/visual/color/palettes/nominalPrimary",
    "pentaho/visual/color/palettes/nominalNeutral",
    "pentaho/visual/color/palettes/nominalLight",
    "pentaho/visual/color/palettes/nominalDark",
    "pentaho/visual/color/palettes/quantitativeBlue3",
    "pentaho/visual/color/palettes/quantitativeBlue5",
    "pentaho/visual/color/palettes/quantitativeGray3",
    "pentaho/visual/color/palettes/quantitativeGray5",
    "pentaho/visual/color/palettes/divergentRyg3",
    "pentaho/visual/color/palettes/divergentRyg5",
    "pentaho/visual/color/palettes/divergentRyb3",
    "pentaho/visual/color/palettes/divergentRyb5"
  ].forEach(function(id) {
    requireInstInfo[id] = {type: "pentaho/visual/color/palette"};
  });

  requireInstInfo["pentaho/visual/config/vizApi.conf"] = {type: "pentaho.config.spec.IRuleSet"};
})();
