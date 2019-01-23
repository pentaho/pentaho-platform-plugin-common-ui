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
  if((typeof ENVIRONMENT_CONFIG !== "undefined" &&
      ENVIRONMENT_CONFIG.paths !== undefined &&
      ENVIRONMENT_CONFIG.paths["common-ui"] !== undefined)) {

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

  var requireModules = requireCfg.config["pentaho/modules"];

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
    "i18n", "data", "action", "type",
    "visual", "config", "environment",
    "debug", "ccc", "module", "platformBundle", "theme"
  ].forEach(function(name) {
    requirePaths["pentaho/" + name] = basePath + "/pentaho/" + name;
  });

  requirePackages.push({
    "name": "pentaho/module",
    "main": "metaOf"
  }, {
    "name": "pentaho/debug",
    "main": "manager"
  }, {
    "name": "pentaho/i18n",
    "main": "defaultService"
  }, {
    "name": "pentaho/environment"
  }, {
    "name": "pentaho/theme"
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
  requireModules["pentaho/visual/role/adaptation/EntityWithTimeIntervalKeyStrategy"] = {
    base: "pentaho/visual/role/adaptation/Strategy",
    ranking: -5
  };
  requireModules["pentaho/visual/role/adaptation/EntityWithNumberKeyStrategy"] = {
    base: "pentaho/visual/role/adaptation/Strategy",
    ranking: -5
  };
  requireModules["pentaho/visual/role/adaptation/CombineStrategy"] = {
    base: "pentaho/visual/role/adaptation/Strategy",
    ranking: -5
  };
  requireModules["pentaho/visual/role/adaptation/IdentityStrategy"] = {
    base: "pentaho/visual/role/adaptation/Strategy",
    ranking: -10
  };
  requireModules["pentaho/visual/role/adaptation/TupleStrategy"] = {
    base: "pentaho/visual/role/adaptation/Strategy",
    ranking: -20
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

  // Color Palettes
  requireModules["pentaho/visual/color/Palette"] = {base: "complex"};

  requireModules["pentaho/visual/color/palettes/nominalPrimary"] = {type: "pentaho/visual/color/Palette", ranking: -10};
  requireModules["pentaho/visual/color/palettes/nominalNeutral"] = {
    type: "pentaho/visual/color/Palette",
    ranking: -110
  };
  requireModules["pentaho/visual/color/palettes/nominalLight"] = {type: "pentaho/visual/color/Palette", ranking: -120};
  requireModules["pentaho/visual/color/palettes/nominalDark"] = {type: "pentaho/visual/color/Palette", ranking: -130};
  requireModules["pentaho/visual/color/palettes/quantitativeBlue3"] = {
    type: "pentaho/visual/color/Palette",
    ranking: -10
  };
  requireModules["pentaho/visual/color/palettes/quantitativeBlue5"] = {
    type: "pentaho/visual/color/Palette",
    ranking: -10
  };
  requireModules["pentaho/visual/color/palettes/quantitativeGray3"] = {
    type: "pentaho/visual/color/Palette",
    ranking: -10
  };
  requireModules["pentaho/visual/color/palettes/quantitativeGray5"] = {
    type: "pentaho/visual/color/Palette",
    ranking: -10
  };
  requireModules["pentaho/visual/color/palettes/divergentRyg3"] = {type: "pentaho/visual/color/Palette", ranking: -10};
  requireModules["pentaho/visual/color/palettes/divergentRyg5"] = {type: "pentaho/visual/color/Palette", ranking: -10};
  requireModules["pentaho/visual/color/palettes/divergentRyb3"] = {type: "pentaho/visual/color/Palette", ranking: -10};
  requireModules["pentaho/visual/color/palettes/divergentRyb5"] = {type: "pentaho/visual/color/Palette", ranking: -10};

  // Copied by hand of /target/requireCfg.bundles.js
  if(useBundle) {
    requireCfg.bundles["pentaho/platformBundle"] = [
      "pentaho/util/has",
      "pentaho/util/object",
      "pentaho/util/fun",
      "pentaho/util/text",
      "pentaho/util/requireJSConfig",
      "pentaho/debug/Levels",
      "pentaho/debug/impl/Manager",
      "pentaho/util/domWindow",
      "pentaho/debug/manager",
      "pentaho/debug",
      "pentaho/lang/Base",
      "pentaho/lang/List",
      "pentaho/lang/SortedList",
      "pentaho/lang/ArgumentError",
      "pentaho/lang/ArgumentRequiredError",
      "pentaho/lang/ArgumentInvalidError",
      "pentaho/_core/module/MetaService",
      "pentaho/util/logger",
      "pentaho/lang/ArgumentInvalidTypeError",
      "pentaho/lang/ArgumentRangeError",
      "pentaho/lang/OperationInvalidError",
      "pentaho/lang/NotImplementedError",
      "pentaho/util/error",
      "pentaho/util/arg",
      "pentaho/shim/_es6-promise/es6-promise",
      "pentaho/shim/es6-promise",
      "pentaho/util/promise",
      "pentaho/module/util",
      "pentaho/_core/module/Meta",
      "pentaho/_core/module/InstanceMeta",
      "pentaho/_core/module/TypeMeta",
      "pentaho/_core/module/Service",
      "pentaho/util/spec",
      "pentaho/_core/config/Service",
      "pentaho/_core/Core",
      "pentaho/util/url",
      "pentaho/environment/impl/Environment",
      "pentaho/environment/main",
      "pentaho/environment",
      "pentaho/_core/main",
      "pentaho/config/service",
      "pentaho/module/service",
      "pentaho/module/metaService",
      "pentaho/module/metaOf",
      "pentaho/module",
      "pentaho/module/impl/ServicePlugin",
      "pentaho/module/subtypeOf",
      "pentaho/module/subtypesOf",
      "pentaho/module/instanceOf",
      "pentaho/module/instancesOf",
      "pentaho/type/SpecificationContext",
      "pentaho/type/SpecificationScope",
      "pentaho/type/impl/SpecificationProcessor",
      "pentaho/type/impl/Loader",
      "pentaho/type/_baseLoader",
      "pentaho/type/InstanceType",
      "pentaho/type/Instance",
      "pentaho/type/changes/_transactionControl",
      "pentaho/type/ReferenceList",
      "pentaho/type/changes/ChangeRef",
      "pentaho/type/changes/AbstractTransactionScope",
      "pentaho/type/changes/TransactionScope",
      "pentaho/type/changes/CommittedScope",
      "pentaho/lang/UserError",
      "pentaho/type/changes/TransactionRejectedError",
      "pentaho/lang/ActionResult",
      "pentaho/type/changes/Transaction",
      "pentaho/type/util",
      "pentaho/type/ValidationError",
      "pentaho/type/Value",
      "pentaho/type/Element",
      "pentaho/lang/Event",
      "pentaho/lang/EventSource",
      "pentaho/type/mixins/changeset",
      "pentaho/type/events/WillChange",
      "pentaho/type/mixins/error",
      "pentaho/type/events/RejectedChange",
      "pentaho/type/events/DidChange",
      "pentaho/type/mixins/Container",
      "pentaho/type/action/Change",
      "pentaho/type/action/Changeset",
      "pentaho/type/action/PrimitiveChange",
      "pentaho/type/action/Add",
      "pentaho/type/action/Remove",
      "pentaho/type/action/Move",
      "pentaho/type/action/Sort",
      "pentaho/type/action/Clear",
      "pentaho/type/action/ListChangeset",
      "pentaho/type/List",
      "pentaho/type/mixins/DiscreteDomain",
      "pentaho/type/Property",
      "pentaho/lang/Collection",
      "pentaho/type/PropertyTypeCollection",
      "pentaho/type/action/Replace",
      "pentaho/type/action/ComplexChangeset",
      "pentaho/type/Simple",
      "pentaho/type/String",
      "pentaho/type/Number",
      "pentaho/type/Boolean",
      "pentaho/util/date",
      "pentaho/type/Date",
      "pentaho/type/Object",
      "pentaho/type/Function",
      "pentaho/type/TypeDescriptor",
      "pentaho/type/standardSimple",
      "pentaho/type/Complex",
      "pentaho/type/mixins/Enum",
      "pentaho/type/standard",
      "pentaho/type/loader",
      "pentaho/data/_ElementMock",
      "pentaho/data/AtomicTypeName",
      "pentaho/data/_AbstractTable",
      "pentaho/data/_OfAttribute",
      "pentaho/lang/_Annotatable",
      "pentaho/data/Member",
      "pentaho/data/Cell",
      "pentaho/data/StructurePosition",
      "pentaho/data/MemberCollection",
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
      "pentaho/data/filter/_core/Tree",
      "pentaho/data/filter/KnownFilterKind",
      "pentaho/data/filter/_core/And",
      "pentaho/data/filter/_core/Or",
      "pentaho/data/filter/_core/Not",
      "pentaho/data/filter/_core/True",
      "pentaho/data/filter/_core/False",
      "pentaho/data/filter/_core/Property",
      "pentaho/data/filter/_core/IsEqual",
      "pentaho/data/filter/_core/IsIn",
      "pentaho/data/filter/_core/IsGreater",
      "pentaho/data/filter/_core/IsLess",
      "pentaho/data/filter/_core/IsGreaterOrEqual",
      "pentaho/data/filter/_core/IsLessOrEqual",
      "pentaho/data/filter/_core/IsLike",
      "pentaho/data/filter/Abstract",
      "pentaho/data/filter/Tree",
      "pentaho/data/filter/Property",
      "pentaho/data/filter/And",
      "pentaho/data/filter/Or",
      "pentaho/data/filter/Not",
      "pentaho/data/filter/IsEqual",
      "pentaho/data/filter/IsIn",
      "pentaho/data/filter/IsGreater",
      "pentaho/data/filter/IsLess",
      "pentaho/data/filter/IsGreaterOrEqual",
      "pentaho/data/filter/IsLessOrEqual",
      "pentaho/data/filter/IsLike",
      "pentaho/data/filter/True",
      "pentaho/data/filter/False",
      "pentaho/data/filter/standard",
      "pentaho/visual/role/MappingField",
      "pentaho/data/util",
      "pentaho/visual/role/AbstractMapping",
      "pentaho/visual/base/KeyTypes",
      "pentaho/visual/role/AbstractProperty",
      "pentaho/visual/color/Level",
      "pentaho/visual/color/Palette",
      "pentaho/visual/color/PaletteProperty",
      "pentaho/visual/base/Application",
      "pentaho/visual/base/AbstractModel",
      "pentaho/visual/role/Mode",
      "pentaho/visual/role/Mapping",
      "pentaho/visual/role/Property",
      "pentaho/visual/base/Model",
      "pentaho/action/Base",
      "pentaho/action/Generic",
      "pentaho/visual/action/Base",
      "pentaho/visual/action/Update",
      "pentaho/visual/action/mixins/Data",
      "pentaho/visual/action/mixins/Positioned",
      "pentaho/visual/action/SelectionModes",
      "pentaho/visual/action/Select",
      "pentaho/visual/action/Execute",
      "pentaho/action/States",
      "pentaho/lang/RuntimeError",
      "pentaho/action/Execution",
      "pentaho/action/impl/Target",
      "pentaho/util/BitSet",
      "pentaho/visual/base/View",
      "pentaho/visual/role/ExternalMapping",
      "pentaho/visual/role/ExternalProperty",
      "pentaho/visual/base/ModelAdapter",
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
      "pentaho/visual/models/types/Color",
      "pentaho/visual/models/types/BackgroundFill",
      "pentaho/visual/models/types/FontStyle",
      "pentaho/visual/models/types/Sides",
      "pentaho/visual/models/types/LabelsOption",
      "pentaho/visual/models/Abstract",
      "pentaho/visual/models/types/DisplayUnits",
      "pentaho/visual/models/CartesianAbstract",
      "pentaho/visual/models/mixins/ScaleColorDiscrete",
      "pentaho/visual/models/CategoricalContinuousAbstract",
      "pentaho/visual/models/types/MaxChartsPerRow",
      "pentaho/visual/models/types/MultiChartRangeScope",
      "pentaho/visual/models/types/MultiChartOverflow",
      "pentaho/visual/models/mixins/MultiCharted",
      "pentaho/visual/models/types/EmptyCellMode",
      "pentaho/visual/models/mixins/Interpolated",
      "pentaho/visual/models/PointAbstract",
      "pentaho/visual/models/AreaStacked",
      "pentaho/visual/models/BarAbstract",
      "pentaho/visual/models/types/TrendType",
      "pentaho/visual/models/types/LineWidth",
      "pentaho/visual/models/mixins/Trended",
      "pentaho/visual/models/Bar",
      "pentaho/visual/models/BarHorizontal",
      "pentaho/visual/models/types/Shape",
      "pentaho/visual/models/BarLine",
      "pentaho/visual/models/BarNormalizedAbstract",
      "pentaho/visual/models/BarNormalized",
      "pentaho/visual/models/BarNormalizedHorizontal",
      "pentaho/visual/models/BarStacked",
      "pentaho/visual/models/BarStackedHorizontal",
      "pentaho/visual/models/types/ColorSet",
      "pentaho/visual/models/types/Pattern",
      "pentaho/visual/models/mixins/ScaleColorContinuous",
      "pentaho/visual/models/MetricPointAbstract",
      "pentaho/visual/models/types/SizeByNegativesMode",
      "pentaho/visual/models/mixins/ScaleSizeContinuous",
      "pentaho/visual/models/Bubble",
      "pentaho/visual/models/Pie",
      "pentaho/visual/models/Donut",
      "pentaho/visual/models/HeatGrid",
      "pentaho/visual/models/Line",
      "pentaho/visual/models/Scatter",
      "pentaho/visual/models/types/SliceOrder",
      "pentaho/visual/models/Sunburst",
      "pentaho/visual/models/all",
      "pentaho/visual/role/adaptation/Strategy",
      "pentaho/visual/role/adaptation/IdentityStrategy",
      "pentaho/visual/role/adaptation/TupleStrategy",
      "pentaho/visual/role/adaptation/CombineStrategy",
      "pentaho/visual/role/adaptation/TimeIntervalDuration",
      "pentaho/visual/role/adaptation/EntityWithTimeIntervalKeyStrategy",
      "pentaho/visual/role/adaptation/EntityWithNumberKeyStrategy",
      "pentaho/visual/role/adaptation/allStrategies",
      "pentaho/visual/role/util",
      "pentaho/visual/scene/util",
      "pentaho/visual/scene/impl/Variable",
      "pentaho/visual/scene/Base",
      "pentaho/ccc/visual/_util",
      "pentaho/ccc/visual/Abstract",
      "pentaho/ccc/visual/CartesianAbstract",
      "pentaho/ccc/visual/CategoricalContinuousAbstract",
      "pentaho/ccc/visual/PointAbstract",
      "pentaho/ccc/visual/AreaAbstract",
      "pentaho/ccc/visual/Area",
      "pentaho/ccc/visual/AreaStacked",
      "pentaho/ccc/visual/BarAbstract",
      "pentaho/data/_trends",
      "pentaho/data/_trend-linear",
      "pentaho/data/trends",
      "pentaho/ccc/visual/_trends",
      "pentaho/ccc/visual/Bar",
      "pentaho/ccc/visual/BarHorizontal",
      "pentaho/ccc/visual/BarLine",
      "pentaho/ccc/visual/BarNormalizedAbstract",
      "pentaho/ccc/visual/BarNormalized",
      "pentaho/ccc/visual/BarNormalizedHorizontal",
      "pentaho/ccc/visual/BarStacked",
      "pentaho/ccc/visual/BarStackedHorizontal",
      "pentaho/ccc/visual/Boxplot",
      "pentaho/ccc/visual/MetricPointAbstract",
      "pentaho/ccc/visual/Bubble",
      "pentaho/ccc/visual/Pie",
      "pentaho/ccc/visual/Donut",
      "pentaho/ccc/visual/HeatGrid",
      "pentaho/ccc/visual/Line",
      "pentaho/ccc/visual/Scatter",
      "pentaho/ccc/visual/Sunburst",
      "pentaho/ccc/visual/Treemap",
      "pentaho/ccc/visual/Waterfall",
      "pentaho/ccc/visual/all"
    ];
  }
})();
