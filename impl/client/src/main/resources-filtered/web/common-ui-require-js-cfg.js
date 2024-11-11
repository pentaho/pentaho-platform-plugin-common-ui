/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

(function() {
  /* globals requireCfg, CONTEXT_PATH, KARMA_RUN, SESSION_LOCALE, active_theme, ENVIRONMENT_CONFIG */

  /* eslint dot-notation: 0, require-jsdoc: 0 */

  // ATTENTION: the parts of this AMD information related with the Type API and the Viz API
  // are duplicated in cgg's define-cfg.js. Keep all in sync.
  // Also, it is duplicated in the testing require.config.js.
  var basePath;
  var baseUncompressedPath;
  var useBundle = false;
  var useDebug = true;

  // environment configured
  if((typeof ENVIRONMENT_CONFIG !== "undefined" &&
      ENVIRONMENT_CONFIG.paths !== undefined &&
      ENVIRONMENT_CONFIG.paths["common-ui"] !== undefined)) {

    if(ENVIRONMENT_CONFIG.debug != null) {
      useDebug = !!ENVIRONMENT_CONFIG.debug;
    }

    basePath = ENVIRONMENT_CONFIG.paths["common-ui"];

  } else if(typeof CONTEXT_PATH !== "undefined") {
    useDebug = typeof document === "undefined" || document.location.href.indexOf("debug=true") > 0;

    // production
    basePath = CONTEXT_PATH + "content/common-ui/resources/web";
  } else {
    // build / test
    basePath = "common-ui";
  }

  baseUncompressedPath = basePath;

  if(!useDebug) {
    basePath += "/compressed";
    useBundle = true;
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
    "_core", "csrf", "shim", "util", "lang",
    "i18n", "data", "action", "type",
    "visual", "config", "environment",
    "debug", "ccc", "module", "platformBundle", "platformCore", "theme"
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
  }, {
    "name": "common-ui/util/_alertDialog"
  }, {
    "name": "pentaho/common/responsive/Dialog"
  });

  requireModules["pentaho/config/spec/IRuleSet"] = {base: null, isVirtual: true};

  requireModules["pentaho/module/Annotation"] = {base: null};
  requireModules["pentaho/config/ExternalAnnotation"] = {base: "pentaho/module/Annotation"};
  requireModules["pentaho/i18n/LoadConfigAnnotation"] = {base: "pentaho/config/ExternalAnnotation"};
  requireModules["pentaho/theme/LoadThemeAnnotation"] = {base: "pentaho/module/Annotation"};
  requireModules["pentaho/theme/ThemeAnnotation"] = {base: "pentaho/module/Annotation"};

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

  requireModules["pentaho/visual/Model"] = {base: "complex"};
  requireModules["pentaho/visual/DefaultViewAnnotation"] = {base: "pentaho/module/Annotation"};
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

  requirePaths["dijit/_CssStateMixin"] = dojoOverrides + "dijit/_CssStateMixin";
  requirePaths["dijit/_HasDropDown"] = dojoOverrides + "dijit/_HasDropDown";
  requirePaths["dijit/_PaletteMixin"] = dojoOverrides + "dijit/_PaletteMixin";
  requirePaths["dijit/Dialog"] = dojoOverrides + "dijit/Dialog";
  requirePaths["dijit/Menu"] = dojoOverrides + "dijit/Menu";

  requirePaths["dojo/_base/config"] = dojoOverrides + "dojo/_base/config";
  requirePaths["dojo/request/default"] = dojoOverrides + "dojo/request/default";
  requirePaths["dojo/store/Memory"] = dojoOverrides + "dojo/store/Memory";
  requirePaths["dojo/dom-prop"] = dojoOverrides + "dojo/dom-prop";
  requirePaths["dojo/i18n"] = dojoOverrides + "dojo/i18n";

  requirePaths["dojox/grid/Selection"] = dojoOverrides + "dojox/grid/Selection";
  requirePaths["dojox/grid/_View"] = dojoOverrides + "dojox/grid/_View";
  requirePaths["dojox/json"] = dojoOverrides + "dojox/json";
  requirePaths["dojox/rpc"] = dojoOverrides + "dojox/rpc";
  requirePaths["dojox/storage/_common"] = dojoOverrides + "dojox/storage/_common";
  // endregion

  requirePaths["common-ui/echarts"] = basePath + "/echarts/echarts";
  requirePaths["common-ui/dompurify"] = basePath + "/dompurify/purify";

  // region Bundled 3rd party libs
  requirePaths["common-ui/jquery"] = basePath + "/jquery/jquery.conflict";

  requirePaths["common-ui/jquery-clean"] = basePath + "/jquery/jquery";
  requireShim["common-ui/jquery-clean"] = {
    exports: "$",
    init: function() {
      return this.$.noConflict(true);
    }
  };

  requirePaths["common-ui/handlebars"] = basePath + "/handlebars/handlebars-v4.7.7";
  requireShim["common-ui/handlebars"] = ["common-ui/jquery"];

  requirePaths["common-ui/jquery-i18n"] = basePath + "/jquery/jquery.i18n.properties-min";
  requireShim["common-ui/jquery-i18n"] = ["common-ui/jquery"];
  requirePaths["common-ui/jquery-pentaho-i18n"] = basePath + "/jquery/jquery.i18n.properties.supported.languages";

  requirePaths["common-ui/bootstrap"] = basePath + "/bootstrap/bootstrap";
  requireShim["common-ui/bootstrap"] = ["common-ui/jquery"];

  requirePaths["common-ui/underscore"] = basePath + "/underscore/underscore";
  // underscore should be required using the module ID above, creating a map entry to guarantee backwards compatibility
  requireMap["*"]["underscore"] = "common-ui/underscore"; // deprecated

  // region Angular
  requirePaths["common-ui/angularjs"] = basePath + "/angularjs/angular";
  requireShim["common-ui/angularjs"] = {
    deps: ["common-ui/jquery"],
    exports: "angular",
    init: function() {
      // Load i18n for angular.
      var baseMid = "common-ui/angularjs-i18n/angular-locale_"; // mid = module id
      var locale = (typeof SESSION_LOCALE !== "undefined") ? SESSION_LOCALE : "en";

      locale = locale.replace("_", "-").toLowerCase();

      require([baseMid + locale], function() {}, function() {
        // Couldn't find the locale specified, fall back.
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

  requirePaths["common-ui/angularjs-i18n"] = basePath + "/angularjs/i18n";

  requirePaths["common-ui/angularjs-animate"] = basePath + "/angularjs/angular-animate";
  requireShim["common-ui/angularjs-animate"] = ["common-ui/angularjs"];

  requirePaths["common-ui/uirouter"] = basePath + "/angularjs/uirouter";
  requirePackages.push({
    "name": "common-ui/uirouter/core",
    "location": basePath + "/angularjs/uirouter/core/_bundles",
    "main": "ui-router-core.min"
  });
  requirePackages.push({
    "name": "common-ui/uirouter/angularjs",
    "location": basePath + "/angularjs/uirouter/angularjs/release",
    "main": "ui-router-angularjs.min"
  });
  requireMap["common-ui/uirouter"] = {
    "angular": "common-ui/angularjs",
    "@uirouter": "common-ui/uirouter"
  };
  // endregion

  // region Viz. API

  // This file is always in the non-compressed location.
  requirePaths["pentaho/visual/config"] = baseUncompressedPath + "/pentaho/visual/config";

  requireModules["pentaho/visual/config"] = {type: "pentaho/config/spec/IRuleSet"};

  // region Models
  requireModules["pentaho/visual/models/Abstract"] = {base: "pentaho/visual/Model"};
  requireModules["pentaho/visual/models/CartesianAbstract"] = {base: "pentaho/visual/models/Abstract"};

  requireModules["pentaho/visual/models/CategoricalContinuousAbstract"] = {
    base: "pentaho/visual/models/CartesianAbstract"
  };

  requireModules["pentaho/visual/models/BarAbstract"] = {base: "pentaho/visual/models/CategoricalContinuousAbstract"};

  requireModules["pentaho/visual/models/Bar"] = {
    base: "pentaho/visual/models/BarAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Bar"}
    }
  };
  requireModules["pentaho/visual/models/BarHorizontal"] = {
    base: "pentaho/visual/models/BarAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/BarHorizontal"}
    }
  };
  requireModules["pentaho/visual/models/BarStacked"] = {
    base: "pentaho/visual/models/BarAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/BarStacked"}
    }
  };
  requireModules["pentaho/visual/models/BarStackedHorizontal"] = {
    base: "pentaho/visual/models/BarAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/BarStackedHorizontal"}
    }
  };
  requireModules["pentaho/visual/models/BarLine"] = {
    base: "pentaho/visual/models/BarAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/BarLine"}
    }
  };
  requireModules["pentaho/visual/models/BarNormalizedAbstract"] = {base: "pentaho/visual/models/BarAbstract"};
  requireModules["pentaho/visual/models/BarNormalized"] = {
    base: "pentaho/visual/models/BarNormalizedAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/BarNormalized"}
    }
  };
  requireModules["pentaho/visual/models/BarNormalizedHorizontal"] = {
    base: "pentaho/visual/models/BarNormalizedAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/BarNormalizedHorizontal"}
    }
  };
  requireModules["pentaho/visual/models/Waterfall"] = {
    base: "pentaho/visual/models/BarAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Waterfall"}
    }
  };
  requireModules["pentaho/visual/models/Boxplot"] = {
    base: "pentaho/visual/models/CategoricalContinuousAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Boxplot"}
    }
  };

  requireModules["pentaho/visual/models/Sunburst"] = {
    base: "pentaho/visual/models/Abstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Sunburst"}
    }
  };
  requireModules["pentaho/visual/models/Pie"] = {
    base: "pentaho/visual/models/Abstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Pie"}
    }
  };
  requireModules["pentaho/visual/models/Donut"] = {
    base: "pentaho/visual/models/Pie",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Donut"}
    }
  };

  requireModules["pentaho/visual/models/Funnel"] = {
    base: "pentaho/visual/models/Abstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/visual/views/echarts/Funnel"}
    }
  };

  requireModules["pentaho/visual/models/Gauge"] = {
    base: "pentaho/visual/models/Abstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/visual/views/echarts/Gauge"}
    }
  };

  requireModules["pentaho/visual/models/Radar"] = {
    base: "pentaho/visual/models/Abstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/visual/views/echarts/Radar"}
    }
  };

  requireModules["pentaho/visual/models/MetricPointAbstract"] = {base: "pentaho/visual/models/CartesianAbstract"};
  requireModules["pentaho/visual/models/Scatter"] = {
    base: "pentaho/visual/models/MetricPointAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Scatter"}
    }
  };
  requireModules["pentaho/visual/models/Bubble"] = {
    base: "pentaho/visual/models/MetricPointAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Bubble"}
    }
  };
  requireModules["pentaho/visual/models/Treemap"] = {
    base: "pentaho/visual/models/Abstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Treemap"}
    }
  };

  requireModules["pentaho/visual/models/PointAbstract"] = {base: "pentaho/visual/models/CartesianAbstract"};
  requireModules["pentaho/visual/models/LineAbstract"] = {base: "pentaho/visual/models/PointAbstract"};
  requireModules["pentaho/visual/models/Line"] = {
    base: "pentaho/visual/models/LineAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Line"}
    }
  };
  requireModules["pentaho/visual/models/LineStacked"] = {
    base: "pentaho/visual/models/LineAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/LineStacked"}
    }
  };
  requireModules["pentaho/visual/models/Dot"] = {
    base: "pentaho/visual/models/PointAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/Dot"}
    }
  };
  requireModules["pentaho/visual/models/AreaStacked"] = {
    base: "pentaho/visual/models/PointAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/AreaStacked"}
    }
  };

  requireModules["pentaho/visual/models/HeatGrid"] = {
    base: "pentaho/visual/models/CartesianAbstract",
    annotations: {
      "pentaho/visual/DefaultView": {module: "pentaho/ccc/visual/HeatGrid"}
    }
  };

  requireModules["pentaho/visual/samples/calc/Model"] = {
    base: "pentaho/visual/Model",
    annotations: {"pentaho/visual/DefaultView": {/* module: "./View" */}}
  };
  // endregion

  // region CCC Views
  requireModules["pentaho/ccc/visual/Abstract"] = {base: null};
  requireModules["pentaho/visual/views/echarts/Abstract"] = {base: null};
  requireModules["pentaho/ccc/visual/CartesianAbstract"] = {base: "pentaho/ccc/visual/Abstract"};
  requireModules["pentaho/ccc/visual/CategoricalContinuousAbstract"] = {base: "pentaho/ccc/visual/CartesianAbstract"};

  requireModules["pentaho/ccc/visual/BarAbstract"] = {base: "pentaho/ccc/visual/CategoricalContinuousAbstract"};
  requireModules["pentaho/ccc/visual/Boxplot"] = {base: "pentaho/ccc/visual/CategoricalContinuousAbstract"};
  requireModules["pentaho/ccc/visual/Bar"] = {base: "pentaho/ccc/visual/BarAbstract"};
  requireModules["pentaho/ccc/visual/BarHorizontal"] = {base: "pentaho/ccc/visual/BarAbstract"};
  requireModules["pentaho/ccc/visual/BarStacked"] = {base: "pentaho/ccc/visual/BarAbstract"};
  requireModules["pentaho/ccc/visual/BarStackedHorizontal"] = {base: "pentaho/ccc/visual/BarAbstract"};
  requireModules["pentaho/ccc/visual/BarLine"] = {base: "pentaho/ccc/visual/BarAbstract"};
  requireModules["pentaho/ccc/visual/BarNormalizedAbstract"] = {base: "pentaho/ccc/visual/BarAbstract"};
  requireModules["pentaho/ccc/visual/BarNormalized"] = {base: "pentaho/ccc/visual/BarNormalizedAbstract"};
  requireModules["pentaho/ccc/visual/BarNormalizedHorizontal"] = {base: "pentaho/ccc/visual/BarNormalizedAbstract"};

  requireModules["pentaho/ccc/visual/Sunburst"] = {base: "pentaho/ccc/visual/Abstract"};
  requireModules["pentaho/ccc/visual/Pie"] = {base: "pentaho/ccc/visual/Abstract"};
  requireModules["pentaho/ccc/visual/Donut"] = {base: "pentaho/ccc/visual/Pie"};
  requireModules["pentaho/ccc/visual/Treemap"] = {base: "pentaho/ccc/visual/Abstract"};

  requireModules["pentaho/ccc/visual/MetricPointAbstract"] = {base: "pentaho/ccc/visual/CartesianAbstract"};
  requireModules["pentaho/ccc/visual/Scatter"] = {base: "pentaho/ccc/visual/MetricPointAbstract"};
  requireModules["pentaho/ccc/visual/Bubble"] = {base: "pentaho/ccc/visual/MetricPointAbstract"};

  requireModules["pentaho/ccc/visual/PointAbstract"] = {base: "pentaho/ccc/visual/CartesianAbstract"};
  requireModules["pentaho/ccc/visual/LineAbstract"] = {base: "pentaho/ccc/visual/PointAbstract"};
  requireModules["pentaho/ccc/visual/Line"] = {base: "pentaho/ccc/visual/LineAbstract"};
  requireModules["pentaho/ccc/visual/LineStacked"] = {base: "pentaho/ccc/visual/LineAbstract"};
  requireModules["pentaho/ccc/visual/Dot"] = {base: "pentaho/ccc/visual/PointAbstract"};
  requireModules["pentaho/ccc/visual/AreaStacked"] = {base: "pentaho/ccc/visual/PointAbstract"};

  requireModules["pentaho/ccc/visual/HeatGrid"] = {base: "pentaho/ccc/visual/CartesianAbstract"};
  requireModules["pentaho/ccc/visual/Waterfall"] = {base: "pentaho/ccc/visual/BarAbstract"};
  requireModules["pentaho/visual/views/echarts/Funnel"] = {base: "pentaho/visual/views/echarts/Abstract"};
  requireModules["pentaho/visual/views/echarts/Gauge"] = {base: "pentaho/visual/views/echarts/Abstract"};
  requireModules["pentaho/visual/views/echarts/Radar"] = {base: "pentaho/visual/views/echarts/Abstract"};
  // endregion

  // region Color Palettes
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
  // endregion

  // endregion

  // Copied by hand from /target/requireCfg.bundles.js
  if(useBundle) {
    requireCfg.bundles["pentaho/platformCore"] = [
      "pentaho/util/has",
      "pentaho/util/object",
      "pentaho/util/fun",
      "pentaho/util/text",
      "pentaho/shim/_es6-promise/es6-promise",
      "pentaho/shim/es6-promise",
      "pentaho/util/requireJS",
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
      "pentaho/util/arg",
      "pentaho/lang/ArgumentInvalidTypeError",
      "pentaho/lang/ArgumentRangeError",
      "pentaho/lang/OperationInvalidError",
      "pentaho/lang/NotImplementedError",
      "pentaho/util/error",
      "pentaho/util/promise",
      "pentaho/util/spec",
      "pentaho/module/util",
      "pentaho/_core/module/Meta",
      "pentaho/_core/module/InstanceMeta",
      "pentaho/_core/module/TypeMeta",
      "pentaho/_core/module/Service",
      "pentaho/module/Annotation",
      "pentaho/_core/config/Service",
      "pentaho/config/ExternalAnnotation",
      "pentaho/_core/Core",
      "pentaho/util/url",
      "pentaho/environment/impl/Environment",
      "pentaho/environment/main",
      "pentaho/environment",
      "pentaho/_core/main",
      "pentaho/config/service",
      "pentaho/config/impl/Service",
      "pentaho/module/service",
      "pentaho/module/metaService",
      "pentaho/module/metaOf",
      "pentaho/module",
      "pentaho/module/impl/ServicePlugin",
      "pentaho/module/subtypeOf",
      "pentaho/module/subtypesOf",
      "pentaho/module/instanceOf",
      "pentaho/module/instancesOf",
      "pentaho/i18n/MessageBundle",
      "pentaho/i18n/LoadConfigAnnotation",
      "pentaho/theme/main",
      "pentaho/theme",
      "pentaho/theme/ThemeAnnotation",
      "pentaho/theme/impl/Service",
      "pentaho/theme/service",
      "pentaho/theme/LoadThemeAnnotation",
      "pentaho/csrf/service",
      "pentaho/lang/UserError",
      "pentaho/lang/RuntimeError",
      "pentaho/lang/Event",
      "pentaho/lang/EventSource",
      "pentaho/lang/Collection",
      "pentaho/util/date"
    ];

    requireCfg.bundles["pentaho/platformBundle"] = [
      "pentaho/type/SpecificationContext",
      "pentaho/type/SpecificationScope",
      "pentaho/type/impl/SpecificationProcessor",
      "pentaho/type/impl/Loader",
      "pentaho/type/_baseLoader",
      "pentaho/type/InstanceType",
      "pentaho/type/Instance",
      "pentaho/action/States",
      "pentaho/action/Execution",
      "pentaho/type/action/_transactionControl",
      "pentaho/type/ReferenceList",
      "pentaho/type/action/ChangeRef",
      "pentaho/type/action/AbstractTransactionScope",
      "pentaho/type/action/TransactionScope",
      "pentaho/type/action/CommittedScope",
      "pentaho/type/action/TransactionRejectedError",
      "pentaho/type/action/Transaction",
      "pentaho/type/util",
      "pentaho/type/ValidationError",
      "pentaho/type/Value",
      "pentaho/type/Element",
      "pentaho/type/mixins/Container",
      "pentaho/action/Base",
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
      "pentaho/type/PropertyTypeCollection",
      "pentaho/type/action/Replace",
      "pentaho/type/action/ComplexChangeset",
      "pentaho/type/Simple",
      "pentaho/type/String",
      "pentaho/type/Number",
      "pentaho/type/Boolean",
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
      "pentaho/visual/KeyTypes",
      "pentaho/visual/role/AbstractProperty",
      "pentaho/visual/color/Level",
      "pentaho/visual/color/Palette",
      "pentaho/visual/color/PaletteProperty",
      "pentaho/visual/Application",
      "pentaho/visual/AbstractModel",
      "pentaho/action/impl/Target",
      "pentaho/action/Generic",
      "pentaho/visual/action/Base",
      "pentaho/visual/action/Update",
      "pentaho/visual/action/ModelChangedError",
      "pentaho/visual/action/UpdateExecution",
      "pentaho/visual/action/Interaction",
      "pentaho/visual/action/InteractionExecution",
      "pentaho/visual/action/mixins/Data",
      "pentaho/visual/action/mixins/Positioned",
      "pentaho/visual/action/SelectionModes",
      "pentaho/visual/action/Select",
      "pentaho/visual/action/SelectExecution",
      "pentaho/visual/action/Execute",
      "pentaho/visual/action/Message",
      "pentaho/visual/role/Mode",
      "pentaho/visual/role/Mapping",
      "pentaho/visual/role/Property",
      "pentaho/visual/Model",
      "pentaho/util/BitSet",
      "pentaho/visual/impl/View",
      "pentaho/visual/role/ExternalMapping",
      "pentaho/visual/role/ExternalProperty",
      "pentaho/visual/ModelAdapter",
      "pentaho/visual/action/WellKnownErrorNames",
      "pentaho/visual/color/util",
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
      "pentaho/visual/models/types/MultiChartMax",
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
      "pentaho/visual/models/Boxplot",
      "pentaho/visual/models/Dot",
      "pentaho/visual/models/Pie",
      "pentaho/visual/models/Donut",
      "pentaho/visual/models/types/SliceOrder",
      "pentaho/visual/models/Funnel",
      "pentaho/visual/models/Gauge",
      "pentaho/visual/models/HeatGrid",
      "pentaho/visual/models/LineAbstract",
      "pentaho/visual/models/Line",
      "pentaho/visual/models/LineStacked",
      "pentaho/visual/models/types/RadarShape",
      "pentaho/visual/models/Radar",
      "pentaho/visual/models/Scatter",
      "pentaho/visual/models/Sunburst",
      "pentaho/visual/models/types/TreemapLayoutMode",
      "pentaho/visual/models/Treemap",
      "pentaho/visual/models/types/WaterDirection",
      "pentaho/visual/models/Waterfall",
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
      "pentaho/visual/DefaultViewAnnotation",
      "pentaho/visual/util",
      "pentaho/visual/samples/calc/Model",
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
      "pentaho/ccc/visual/Dot",
      "pentaho/ccc/visual/Pie",
      "pentaho/ccc/visual/Donut",
      "pentaho/ccc/visual/HeatGrid",
      "pentaho/ccc/visual/LineAbstract",
      "pentaho/ccc/visual/Line",
      "pentaho/ccc/visual/LineStacked",
      "pentaho/ccc/visual/Scatter",
      "pentaho/ccc/visual/Sunburst",
      "pentaho/ccc/visual/Treemap",
      "pentaho/ccc/visual/Waterfall",
      "pentaho/ccc/visual/all",
      "pentaho/visual/views/echarts/Abstract",
      "pentaho/visual/views/echarts/Funnel",
      "pentaho/visual/views/echarts/Gauge",
      "pentaho/visual/views/echarts/Radar",
      "pentaho/visual/views/all"
    ];
  }
})();
