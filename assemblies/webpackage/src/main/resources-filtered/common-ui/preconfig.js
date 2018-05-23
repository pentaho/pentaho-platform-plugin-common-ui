/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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

/* globals requireCfg, packageInfo, getVersionedModuleId, SESSION_LOCALE, active_theme */

var basePath = packageInfo.webRootPath;
var sourcePath = basePath;
var useDebug = typeof document === "undefined" || document.location.href.indexOf("debug=true") > 0;

if(!useDebug) {
  basePath += "/compressed";
}

var requirePaths = requireCfg.paths;
var requireShim = requireCfg.shim;

// configure cdf's jquery-clean shim
// (not in package.json because functions aren't supported)
requireShim[getVersionedModuleId("common-ui/jquery-clean")] = {
  exports: "$",
  init: function() {
    return this.$.noConflict(true);
  }
};


// configure cdf's angular shim
// (not in package.json because functions aren't supported)
requireShim[getVersionedModuleId("common-ui/angular")] = {
  deps: [getVersionedModuleId("common-ui/jquery")],
  exports: "angular",
  init: function() {
    // Load i18n for angular.
    var baseMid = getVersionedModuleId("common-ui/angular-i18n/angular-locale_"); // mid = module id
    var locale = (typeof SESSION_LOCALE !== "undefined") ? SESSION_LOCALE : "en";

    locale = locale.replace("_", "-").toLowerCase();

    require([baseMid + locale], function() {
    }, function() {
      // Couldn't find the locale specified, fall back.
      var prev = locale;

      // Strip off the country designation, try to get just the language.
      locale = (locale.length > 2) ? locale.substring(0, 2) : "en";

      if(typeof console !== "undefined" && console.warn)
        console.warn("Could not load locale for '" + prev + "', falling back to '" + locale + "'");

      require([baseMid + locale], function() {
      }, function() {
        // Can't find the language at all, go get english.
        if(typeof console !== "undefined" && console.warn)
          console.warn("Could not load locale for '" + locale + "', falling back to 'en'");

        require([baseMid + "en"], function() {
        });
      });
    });
  }
};

function mapTheme(mid, themeRoot, themes) {
  var theme = (typeof active_theme !== "undefined") ? active_theme : null;
  if(!theme || themes.indexOf(theme) < 0) theme = themes[0];

  // e.g. "/theme" -> "/themes/crystal"
  requirePaths[getVersionedModuleId(mid) + "/theme"] = basePath + "/" + mid + "/" + themeRoot + "/" + theme;
}

// Type API Base Theme
mapTheme("pentaho/type", "themes", ["ruby"]);

// Visual Models Themes
mapTheme("pentaho/visual/models", "themes", ["crystal", "sapphire", "onyx", "det", "ruby"]);

// sample/calc theme
mapTheme("pentaho/visual/samples/calc", "themes", ["ruby"]);

// switch paths to use compressed versions
if(!useDebug) {
  [
    "common-ui",
    "common-repo",
    "common-data",

    "pentaho/common",

    "pentaho/_core",
    "pentaho/module",
    "pentaho/shim",
    "pentaho/util",
    "pentaho/lang",
    "pentaho/i18n",
    "pentaho/data",
    "pentaho/type",
    "pentaho/visual",
    "pentaho/config",
    "pentaho/environment",
    "pentaho/debug",
    "pentaho/ccc",
    "pentaho/platformBundle",

    "local",
    "json",
    "text",
    "common-ui/util/require-css/css",

    "dojo",
    "dojox",
    "dijit",

    "dojo/on",
    "dojo/dom-geometry",
    "dojo/dom-prop",
    "dojox/layout/ResizeHandle",
    "dojox/grid/_View",
    "dojox/xml/parser",
    "dojox/grid/Selection",
    "dojox/grid/_FocusManager",
    "dojox/grid/_Scroller",
    "dojox/storage",
    "dojox/json",
    "dojox/rpc",
    "dojo/_base/kernel",
    "dojo/_base/config",
    "dojo/store/Memory",
    "dijit/_HasDropDown",
    "dijit/_CssStateMixin",
    "dojo/selector/_loader",
    "dojo/i18n",
    "dojo/request/default",

    "common-ui/PluginHandler",
    "common-ui/Plugin",
    "common-ui/AngularPluginHandler",
    "common-ui/AngularPlugin",
    "common-ui/AnimatedAngularPluginHandler",
    "common-ui/AnimatedAngularPlugin",

    "common-ui/jquery",
    "common-ui/jquery-clean",
    "common-ui/handlebars",
    "common-ui/jquery-i18n",
    "common-ui/jquery-pentaho-i18n",
    "common-ui/bootstrap",
    "common-ui/ring",
    "common-ui/underscore",
    "common-ui/angular",
    "common-ui/angular-i18n",
    "common-ui/angular-resource",
    "common-ui/angular-route",
    "common-ui/angular-animate",
    "common-ui/angular-sanitize",
    "common-ui/properties-parser",
    "common-ui/angular-translate",
    "common-ui/angular-translate-loader-partial",
    "common-ui/angular-translate-loader-static",
    "common-ui/angular-ui-bootstrap",
    "common-ui/angular-directives"
  ].forEach(function(mid) {
    var versionMid = getVersionedModuleId(mid);
    var path = requirePaths[versionMid];
    var packagePath = path.substring(sourcePath.length);
    requirePaths[versionMid] = basePath + packagePath;
  });

  // Copied by hand of /target/requireCfg.bundles.js
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
    "pentaho/module/util",
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
    "pentaho/type/changes/Change",
    "pentaho/type/changes/Changeset",
    "pentaho/type/changes/PrimitiveChange",
    "pentaho/type/changes/Add",
    "pentaho/type/changes/Remove",
    "pentaho/type/changes/Move",
    "pentaho/type/changes/Sort",
    "pentaho/type/changes/Clear",
    "pentaho/type/changes/ListChangeset",
    "pentaho/type/List",
    "pentaho/type/mixins/DiscreteDomain",
    "pentaho/type/Property",
    "pentaho/lang/Collection",
    "pentaho/type/PropertyTypeCollection",
    "pentaho/type/changes/Replace",
    "pentaho/type/changes/ComplexChangeset",
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
    "pentaho/type/action/Base",
    "pentaho/visual/action/Base",
    "pentaho/visual/action/Update",
    "pentaho/visual/action/mixins/Data",
    "pentaho/visual/action/mixins/Positioned",
    "pentaho/visual/action/SelectionModes",
    "pentaho/visual/action/Select",
    "pentaho/visual/action/Execute",
    "pentaho/type/action/States",
    "pentaho/lang/RuntimeError",
    "pentaho/type/action/Execution",
    "pentaho/type/action/impl/Target",
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
    "pentaho/visual/role/adaptation/TimeIntervalDuration",
    "pentaho/visual/role/adaptation/EntityWithTimeIntervalKeyStrategy",
    "pentaho/visual/role/adaptation/allStrategies",
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
