/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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
  /* globals requireCfg, CONTEXT_PATH, KARMA_RUN, SESSION_LOCALE, active_theme, ENVIRONMENT_CONFIG */

  /* eslint dot-notation: 0, require-jsdoc: 0 */

  // ATTENTION: the parts of this AMD information related with the Type API and the Viz API
  // are duplicated in cgg's define-cfg.js. Keep all in sync.
  // Also, it is duplicated in the testing require.config.js.
  var basePath;
  var useBundle = false;

  // environment configured
  if((typeof ENVIRONMENT_CONFIG !== "undefined" && typeof ENVIRONMENT_CONFIG.paths !== "undefined" &&
      typeof ENVIRONMENT_CONFIG.paths["common-ui"] !== "undefined")) {
    basePath = ENVIRONMENT_CONFIG.paths["common-ui"];
  } else if(typeof CONTEXT_PATH !== "undefined") {
    var useDebug = typeof document === "undefined" || document.location.href.indexOf("debug=true") > 0;

    // production
    basePath = CONTEXT_PATH + "content/common-ui/resources/web";
    if(!useDebug) {
      basePath += "/compressed";
      useBundle = true;
    }
  } else {
    // build / test
    basePath = "common-ui";
  }

  var requirePaths = requireCfg.paths;
  var requirePackages = requireCfg.packages;
  var requireShim = requireCfg.shim;
  var requireMap = requireCfg.map;

  var requireModules = requireCfg.config["pentaho/modules"] || (requireCfg.config["pentaho/modules"] = {});

  // region common-ui
  requirePaths["common-ui"] = basePath;
  requirePaths["common-repo"] = basePath + "/repo";
  requirePaths["common-data"] = basePath + "/dataapi";

  requirePaths["pentaho/common"] = basePath + "/dojo/pentaho/common";
  // endregion

  // region Pentaho Platform JavaScript APIs (Core, Data, Visual)

  // Unfortunately, *mantle* already maps the "pentaho" id to "/js",
  // so the paths of all of the following sub-modules must be configured individually.
  // E.g. requirePaths["pentaho/util"] = basePath + "/pentaho/util";
  [
    "_core", "shim", "util", "lang",
    "i18n", "data", "type",
    "visual", "config", "environment",
    "debug", "ccc", "module", "platformBundle"
  ].forEach(function(name) {
    requirePaths["pentaho/" + name] = basePath + "/pentaho/" + name;
  });

  requirePackages.push({
    "name": "pentaho/module",
    "main": "metaOf"
  });

  requirePackages.push({
    "name": "pentaho/debug",
    "main": "manager"
  });

  requirePackages.push({
    "name": "pentaho/i18n",
    "main": "serverService"
  });

  requirePackages.push({
    "name": "pentaho/environment"
  });

  requireModules["pentaho/config/spec/IRuleSet"] = {base: null, isAbstract: true};

  requireModules["pentaho/type/Instance"] = {alias: "instance", base: null};
  requireModules["pentaho/type/Value"] = {alias: "value", base: "instance"};
  requireModules["pentaho/type/Property"] = {alias: "property", base: "instance"};
  requireModules["pentaho/type/List"] = {alias: "list", base: "value"};
  requireModules["pentaho/type/Element"] = {alias: "element", base: "value"};
  requireModules["pentaho/type/Complex"] = {alias: "complex", base: "element"};
  requireModules["pentaho/type/Simple"] = {alias: "simple", base: "element"};
  requireModules["pentaho/type/Number"] = {alias: "number", base: "simple"};
  requireModules["pentaho/type/String"] = {alias: "string", base: "simple"};
  requireModules["pentaho/type/Boolean"] = {alias: "boolean", base: "simple"};
  requireModules["pentaho/type/Date"] = {alias: "date", base: "simple"};
  requireModules["pentaho/type/Object"] = {alias: "object", base: "simple"};
  requireModules["pentaho/type/Function"] = {alias: "function", base: "simple"};
  requireModules["pentaho/type/TypeDescriptor"] = {alias: "type", base: "simple"};
  requireModules["pentaho/type/mixins/Enum"] = {alias: "enum", base: "element"};
  requireModules["pentaho/type/action/Base"] = {base: "element"};

  requireModules["pentaho/data/filter/Abstract"] = {base: "complex"};
  requireModules["pentaho/data/filter/True"] = {alias: "true", base: "pentaho/data/filter/Abstract"};
  requireModules["pentaho/data/filter/False"] = {alias: "false", base: "pentaho/data/filter/Abstract"};
  requireModules["pentaho/data/filter/Tree"] = {base: "pentaho/data/filter/Abstract"};
  requireModules["pentaho/data/filter/Or"] = {alias: "or", base: "pentaho/data/filter/Tree"};
  requireModules["pentaho/data/filter/And"] = {alias: "and", base: "pentaho/data/filter/Tree"};
  requireModules["pentaho/data/filter/Not"] = {alias: "not", base: "pentaho/data/filter/Abstract"};
  requireModules["pentaho/data/filter/Property"] = {base: "pentaho/data/filter/Abstract"};
  requireModules["pentaho/data/filter/IsEqual"] = {alias: "=", base: "pentaho/data/filter/Property"};
  requireModules["pentaho/data/filter/IsIn"] = {alias: "in", base: "pentaho/data/filter/Property"};
  requireModules["pentaho/data/filter/IsGreater"] = {alias: ">", base: "pentaho/data/filter/Property"};
  requireModules["pentaho/data/filter/IsGreaterOrEqual"] = {alias: ">=", base: "pentaho/data/filter/Property"};
  requireModules["pentaho/data/filter/IsLess"] = {alias: "<", base: "pentaho/data/filter/Property"};
  requireModules["pentaho/data/filter/IsLessOrEqual"] = {alias: "<=", base: "pentaho/data/filter/Property"};
  requireModules["pentaho/data/filter/IsLike"] = {alias: "like", base: "pentaho/data/filter/Property"};

  requireModules["pentaho/visual/base/Model"] = {base: "complex"};
  requireModules["pentaho/visual/base/View"] = {base: "complex"};
  requireModules["pentaho/visual/role/adaptation/Strategy"] = {base: "complex"};
  requireModules["pentaho/visual/role/adaptation/IdentityStrategy"] = {
    base: "pentaho/visual/role/adaptation/Strategy"
  };
  requireModules["pentaho/visual/role/adaptation/TupleStrategy"] = {
    base: "pentaho/visual/role/adaptation/Strategy"
  };
  requireModules["pentaho/visual/role/adaptation/EntityWithTimeIntervalKeyStrategy"] = {
    base: "pentaho/visual/role/adaptation/Strategy"
  };
  // endregion

  // region Base AMD Plugins
  requirePaths["local"] = basePath + "/util/local";
  requirePaths["json"] = basePath + "/util/require-json/json";
  requirePaths["text"] = basePath + "/util/require-text/text";
  // Using `map` is important for use in r.js and correct AMD config of the other files of the package.
  // Placing the minSuffix in the path ensures building works well,
  // so that the resolved module id is the same in both debug and non-debug cases.

  requireMap["*"]["css"] = "common-ui/util/require-css/css";
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
  requirePaths["dojo/selector/_loader"] = dojoOverrides + "dojo/selector/_loader";
  requirePaths["dojo/i18n"] = dojoOverrides + "dojo/i18n";
  requirePaths["dojo/request/default"] = dojoOverrides + "dojo/request/default";
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
  requirePaths["common-ui/jquery"] = basePath + "/jquery/jquery.conflict";

  requirePaths["common-ui/jquery-clean"] = basePath + "/jquery/jquery";
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

  requirePaths["common-ui/bootstrap"] = basePath + "/bootstrap/bootstrap";
  requireShim["common-ui/bootstrap"] = ["common-ui/jquery"];

  requirePaths["common-ui/ring"] = basePath + "/ring/ring";
  requireShim["common-ui/ring"] = {deps: ["common-ui/underscore"], exports: "ring"};

  requirePaths["common-ui/underscore"] = basePath + "/underscore/underscore";
  // underscore should be required using the module ID above, creating a map entry to guarantee backwards compatibility
  requireMap["*"]["underscore"] = "common-ui/underscore"; // deprecated

  // ANGULAR
  requirePaths["common-ui/angular"] = basePath + "/angular/angular";
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

  requirePaths["common-ui/angular-resource"] = basePath + "/angular/angular-resource";
  requireShim["common-ui/angular-resource"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-route"] = basePath + "/angular/angular-route";
  requireShim["common-ui/angular-route"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-animate"] = basePath + "/angular/angular-animate";
  requireShim["common-ui/angular-animate"] = ["common-ui/angular"];

  requirePaths["common-ui/angular-sanitize"] = basePath + "/angular/angular-sanitize";
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

  // region Type API and Visualization Models Packages and Themes
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

  requireModules["pentaho/visual/config/vizApi.conf"] = {type: "pentaho/config/spec/IRuleSet"};

  requireModules["pentaho/visual/models/Abstract"] = {base: "pentaho/visual/base/Model"};
  requireModules["pentaho/visual/samples/calc/Model"] = {base: "pentaho/visual/base/Model"};
  [
    "pentaho/visual/models/CartesianAbstract",
    "pentaho/visual/models/CategoricalContinuousAbstract",
    "pentaho/visual/models/BarAbstract",
    "pentaho/visual/models/BarNormalizedAbstract",
    "pentaho/visual/models/BarHorizontal",
    "pentaho/visual/models/Bar",
    "pentaho/visual/models/BarStacked",
    "pentaho/visual/models/BarStackedHorizontal",
    "pentaho/visual/models/BarNormalized",
    "pentaho/visual/models/BarNormalizedHorizontal",
    "pentaho/visual/models/BarLine",
    "pentaho/visual/models/Line",
    "pentaho/visual/models/PointAbstract",
    "pentaho/visual/models/MetricPointAbstract",
    "pentaho/visual/models/AreaStacked",
    "pentaho/visual/models/Pie",
    "pentaho/visual/models/HeatGrid",
    "pentaho/visual/models/Sunburst",
    "pentaho/visual/models/Donut",
    "pentaho/visual/models/Scatter",
    "pentaho/visual/models/Bubble"
  ].forEach(function(name) {
    requireModules[name] = {base: "pentaho/visual/models/Abstract"};
  });
  // endregion

  // TODO: this should be removed from here, and to the GEO plugin's package.json
  // when it is possible to specify global maps or an option that achieves the same effect.
  requireMap["*"]["pentaho/visual/models/GeoMap"] = "pentaho/geo/visual_${project.version}/Model";
  requireMap["*"]["pentaho/geo/visual/Map"] = "pentaho/geo/visual_${project.version}/View";

  // VizAPI actions
  requireModules["pentaho/visual/action/Base"] = {base: "pentaho/type/action/Base"};
  requireModules["pentaho/visual/action/Select"] = {alias: "select", base: "pentaho/visual/action/Base"};
  requireModules["pentaho/visual/action/Execute"] = {alias: "execute", base: "pentaho/visual/action/Base"};
  requireModules["pentaho/visual/action/Update"] = {base: "pentaho/visual/action/Base"};

  // Color Palettes
  requireModules["pentaho/visual/color/Palette"] = {base: "complex"};

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
    requireModules[id] = {type: "pentaho/visual/color/Palette"};
  });

  // Copied by hand of /target/requireCfg.bundles.js
  if(useBundle) {
    requireCfg.bundles["pentaho/platformBundle"] = [
      "pentaho/util/has",
      "pentaho/util/object",
      "pentaho/util/fun",
      "pentaho/util/text",
      "pentaho/debug/Levels",
      "pentaho/debug/impl/Manager",
      "pentaho/util/domWindow",
      "pentaho/debug",
      "pentaho/lang/Base",
      "pentaho/data/_ElementMock",
      "pentaho/data/AtomicTypeName",
      "pentaho/data/_AbstractTable",
      "pentaho/lang/ArgumentError",
      "pentaho/lang/ArgumentRequiredError",
      "pentaho/lang/ArgumentInvalidError",
      "pentaho/lang/ArgumentInvalidTypeError",
      "pentaho/lang/ArgumentRangeError",
      "pentaho/lang/OperationInvalidError",
      "pentaho/lang/NotImplementedError",
      "pentaho/util/error",
      "pentaho/util/arg",
      "pentaho/data/_OfAttribute",
      "pentaho/lang/_Annotatable",
      "pentaho/data/Member",
      "pentaho/data/Cell",
      "pentaho/data/StructurePosition",
      "pentaho/lang/List",
      "pentaho/lang/Collection",
      "pentaho/data/MemberCollection",
      "pentaho/util/date",
      "pentaho/data/Attribute",
      "pentaho/data/AttributeCollection",
      "pentaho/data/Model",
      "pentaho/data/Structure",
      "pentaho/data/_plain/Row",
      "pentaho/data/_WithStructure",
      "pentaho/data/CellTuple",
      "pentaho/data/_WithCellTupleBase",
      "pentaho/data/_plain/RowList",
      "pentaho/data/_plain/Table",
      "pentaho/data/_cross/AxisPosition",
      "pentaho/data/_cross/Axis",
      "pentaho/data/_cross/MeasureCellSet",
      "pentaho/data/_cross/Table",
      "pentaho/data/_Table",
      "pentaho/data/_TableView",
      "pentaho/data/AbstractTable",
      "pentaho/data/Table",
      "pentaho/data/TableView",
      "pentaho/data/filter/_core/tree",
      "pentaho/data/filter/KnownFilterKind",
      "pentaho/data/filter/_core/and",
      "pentaho/data/filter/_core/or",
      "pentaho/data/filter/_core/not",
      "pentaho/data/filter/_core/true",
      "pentaho/data/filter/_core/false",
      "pentaho/data/filter/_core/property",
      "pentaho/data/filter/_core/isEqual",
      "pentaho/data/filter/_core/isIn",
      "pentaho/data/filter/_core/isGreater",
      "pentaho/data/filter/_core/isLess",
      "pentaho/data/filter/_core/isGreaterOrEqual",
      "pentaho/data/filter/_core/isLessOrEqual",
      "pentaho/data/filter/_core/isLike",
      "pentaho/util/logger",
      "pentaho/data/filter/abstract",
      "pentaho/data/filter/tree",
      "pentaho/data/filter/property",
      "pentaho/data/filter/and",
      "pentaho/data/filter/or",
      "pentaho/data/filter/not",
      "pentaho/data/filter/isEqual",
      "pentaho/data/filter/isIn",
      "pentaho/data/filter/isGreater",
      "pentaho/data/filter/isLess",
      "pentaho/data/filter/isGreaterOrEqual",
      "pentaho/data/filter/isLessOrEqual",
      "pentaho/data/filter/isLike",
      "pentaho/data/filter/true",
      "pentaho/data/filter/false",
      "pentaho/data/filter/standard",
      "pentaho/util/spec",
      "pentaho/lang/SortedList",
      "pentaho/shim/_es6-promise/es6-promise",
      "pentaho/shim/es6-promise",
      "pentaho/config/impl/Service",
      "pentaho/typeInfo/impl/Service",
      "pentaho/typeInfo",
      "pentaho/instanceInfo/impl/Service",
      "pentaho/instanceInfo",
      "pentaho/config/impl/AmdLoadedService",
      "pentaho/config/impl/instanceOfAmdLoadedService",
      "pentaho/util/url",
      "pentaho/environment/impl/Environment",
      "pentaho/environment",
      "pentaho/type/SpecificationContext",
      "pentaho/type/SpecificationScope",
      "pentaho/type/util",
      "pentaho/util/promise",
      "pentaho/type/InstancesContainer",
      "pentaho/type/ReferenceList",
      "pentaho/type/changes/ChangeRef",
      "pentaho/type/changes/AbstractTransactionScope",
      "pentaho/type/changes/TransactionScope",
      "pentaho/lang/UserError",
      "pentaho/type/changes/TransactionRejectedError",
      "pentaho/lang/ActionResult",
      "pentaho/type/changes/Transaction",
      "pentaho/type/changes/CommittedScope",
      "pentaho/util/module",
      "pentaho/lang/_AnnotatableLinked",
      "pentaho/type/_type",
      "pentaho/type/instance",
      "pentaho/type/ValidationError",
      "pentaho/type/value",
      "pentaho/type/element",
      "pentaho/lang/Event",
      "pentaho/lang/EventSource",
      "pentaho/type/mixins/_mixinChangeset",
      "pentaho/type/events/WillChange",
      "pentaho/type/mixins/mixinError",
      "pentaho/type/events/RejectedChange",
      "pentaho/type/events/DidChange",
      "pentaho/type/mixins/Container",
      "pentaho/type/changes/Change",
      "pentaho/type/changes/Changeset",
      "pentaho/type/changes/PrimitiveChange",
      "pentaho/type/changes/Add",
      "pentaho/type/changes/Remove",
      "pentaho/type/changes/Move",
      "pentaho/type/changes/Sort",
      "pentaho/type/changes/Clear",
      "pentaho/type/changes/ListChangeset",
      "pentaho/type/list",
      "pentaho/type/simple",
      "pentaho/type/PropertyTypeCollection",
      "pentaho/type/changes/Replace",
      "pentaho/type/changes/ComplexChangeset",
      "pentaho/type/complex",
      "pentaho/type/string",
      "pentaho/type/number",
      "pentaho/type/boolean",
      "pentaho/type/date",
      "pentaho/type/object",
      "pentaho/type/function",
      "pentaho/type/typeDescriptor",
      "pentaho/type/property",
      "pentaho/type/mixins/enum",
      "pentaho/type/mixins/discreteDomain",
      "pentaho/type/standard",
      "pentaho/type/Context",
      "pentaho/data/util",
      "pentaho/visual/role/mappingField",
      "pentaho/visual/role/abstractMapping",
      "pentaho/visual/role/abstractProperty",
      "pentaho/visual/color/level",
      "pentaho/visual/color/palette",
      "pentaho/visual/color/paletteProperty",
      "pentaho/visual/base/application",
      "pentaho/visual/base/abstractModel",
      "pentaho/visual/role/mode",
      "pentaho/visual/role/mapping",
      "pentaho/visual/role/property",
      "pentaho/visual/base/model",
      "pentaho/type/action/States",
      "pentaho/lang/RuntimeError",
      "pentaho/type/action/Execution",
      "pentaho/util/BitSet",
      "pentaho/type/action/base",
      "pentaho/type/action/impl/target",
      "pentaho/visual/action/base",
      "pentaho/visual/action/update",
      "pentaho/visual/action/SelectionModes",
      "pentaho/visual/action/select",
      "pentaho/visual/action/execute",
      "pentaho/visual/action/mixins/data",
      "pentaho/visual/action/mixins/positioned",
      "pentaho/visual/base/view",
      "pentaho/visual/role/externalMapping",
      "pentaho/visual/role/adaptation/strategy",
      "pentaho/visual/role/externalProperty",
      "pentaho/visual/base/modelAdapter",
      "pentaho/visual/color/utils",
      "pentaho/visual/color/palettes/divergentRyb3",
      "pentaho/visual/color/palettes/divergentRyb5",
      "pentaho/visual/color/palettes/divergentRyg3",
      "pentaho/visual/color/palettes/divergentRyg5",
      "pentaho/visual/color/palettes/nominalDark",
      "pentaho/visual/color/palettes/nominalLight",
      "pentaho/visual/color/palettes/nominalNeutral",
      "pentaho/visual/color/palettes/nominalPrimary",
      "pentaho/visual/color/palettes/quantitativeBlue3",
      "pentaho/visual/color/palettes/quantitativeBlue5",
      "pentaho/visual/color/palettes/quantitativeGray3",
      "pentaho/visual/color/palettes/quantitativeGray5",
      "pentaho/visual/color/palettes/all",
      "pentaho/visual/role/adaptation/identityStrategy",
      "pentaho/visual/role/adaptation/tupleStrategy",
      "pentaho/visual/role/adaptation/timeIntervalDuration",
      "pentaho/visual/role/adaptation/entityWithTimeIntervalKeyStrategy",
      "pentaho/visual/role/adaptation/allStrategies",
      "pentaho/visual/models/abstract",
      "pentaho/visual/models/areaStacked",
      "pentaho/visual/models/bar",
      "pentaho/visual/models/barAbstract",
      "pentaho/visual/models/barHorizontal",
      "pentaho/visual/models/barLine",
      "pentaho/visual/models/barNormalized",
      "pentaho/visual/models/barNormalizedAbstract",
      "pentaho/visual/models/barNormalizedHorizontal",
      "pentaho/visual/models/barStacked",
      "pentaho/visual/models/barStackedHorizontal",
      "pentaho/visual/models/bubble",
      "pentaho/visual/models/cartesianAbstract",
      "pentaho/visual/models/categoricalContinuousAbstract",
      "pentaho/visual/models/donut",
      "pentaho/visual/models/heatGrid",
      "pentaho/visual/models/line",
      "pentaho/visual/models/metricPointAbstract",
      "pentaho/visual/models/pie",
      "pentaho/visual/models/pointAbstract",
      "pentaho/visual/models/scatter",
      "pentaho/visual/models/sunburst",
      "pentaho/visual/models/mixins/interpolated",
      "pentaho/visual/models/mixins/multiCharted",
      "pentaho/visual/models/mixins/scaleColorContinuous",
      "pentaho/visual/models/mixins/scaleColorDiscrete",
      "pentaho/visual/models/mixins/scaleSizeContinuous",
      "pentaho/visual/models/mixins/trended",
      "pentaho/visual/models/types/backgroundFill",
      "pentaho/visual/models/types/color",
      "pentaho/visual/models/types/colorSet",
      "pentaho/visual/models/types/displayUnits",
      "pentaho/visual/models/types/emptyCellMode",
      "pentaho/visual/models/types/fontStyle",
      "pentaho/visual/models/types/labelsOption",
      "pentaho/visual/models/types/lineWidth",
      "pentaho/visual/models/types/maxChartsPerRow",
      "pentaho/visual/models/types/multiChartOverflow",
      "pentaho/visual/models/types/multiChartRangeScope",
      "pentaho/visual/models/types/pattern",
      "pentaho/visual/models/types/shape",
      "pentaho/visual/models/types/sides",
      "pentaho/visual/models/types/sizeByNegativesMode",
      "pentaho/visual/models/types/sliceOrder",
      "pentaho/visual/models/types/trendType",
      "pentaho/visual/models/all",
      "pentaho/ccc/visual/_util",
      "pentaho/ccc/visual/abstract",
      "pentaho/ccc/visual/area",
      "pentaho/ccc/visual/areaAbstract",
      "pentaho/ccc/visual/areaStacked",
      "pentaho/data/_trends",
      "pentaho/data/_trend-linear",
      "pentaho/data/trends",
      "pentaho/ccc/visual/_trends",
      "pentaho/ccc/visual/bar",
      "pentaho/ccc/visual/barAbstract",
      "pentaho/ccc/visual/barHorizontal",
      "pentaho/ccc/visual/barLine",
      "pentaho/ccc/visual/barNormalized",
      "pentaho/ccc/visual/barNormalizedAbstract",
      "pentaho/ccc/visual/barNormalizedHorizontal",
      "pentaho/ccc/visual/barStacked",
      "pentaho/ccc/visual/barStackedHorizontal",
      "pentaho/ccc/visual/boxplot",
      "pentaho/ccc/visual/bubble",
      "pentaho/ccc/visual/cartesianAbstract",
      "pentaho/ccc/visual/categoricalContinuousAbstract",
      "pentaho/ccc/visual/donut",
      "pentaho/ccc/visual/heatGrid",
      "pentaho/ccc/visual/line",
      "pentaho/ccc/visual/metricPointAbstract",
      "pentaho/ccc/visual/pie",
      "pentaho/ccc/visual/pointAbstract",
      "pentaho/ccc/visual/scatter",
      "pentaho/ccc/visual/sunburst",
      "pentaho/ccc/visual/treemap",
      "pentaho/ccc/visual/waterfall",
      "pentaho/ccc/visual/all"
    ];
  }
})();
