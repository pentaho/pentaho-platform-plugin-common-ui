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
