/*!
* Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
define([
  "require",
  "../../../util/arg",
  "../../../util/object",
  "../../../shim/es6-promise"
], function(require, arg, O) {
  return /** @type IVisualTypeProvider */{
    getAll: getVisualTypes
  };

  function visualFactory(createOptions) {
    return new Promise(function(resolve, reject) {
      require(["./wrapper/charts/" + createOptions.type._chart], function(ChartClass) {
        resolve(new ChartClass(createOptions));
      }, reject);
    });
  }

  function getVisualTypes() {
    return [
      {
        id:      "x-ccc_bar",
        type:    "barchart",
        _chart:  "BarChart",
        source:  "CCC",
        name:    vizLabel("VERTICAL_BAR"),
        factory: visualFactory,
        updateEditModel: function() {
          updateTrendOptions.apply(this, arguments);
        },
        dataReqs: [{
          name: "Default",
          reqs: arrayAppendMany(
            createDataReq("VERTICAL_BAR", {options: false}),
            createColumnDataLabelsReq({
              separator: false,
              anchors: ["none", "center", "inside_end", "inside_base", "outside_end"]
            }),
            createTrendsDataReqs({separator: true}),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 100
      },
      {
        id:      "x-ccc_barstacked",
        type:    "barchart",
        _chart:  "StackedBarChart",
        source:  "CCC",
        name:    vizLabel("STACKED_VERTICAL_BAR"),
        factory: visualFactory,
        dataReqs: [{
          name: "Default",
          reqs: arrayAppendMany(
            createDataReq("STACKED_VERTICAL_BAR", {options: false}),
            createColumnDataLabelsReq({
              separator: false,
              anchors: ["none", "center", "inside_end", "inside_base"]
            }),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 110
      },
      {
        id:      "x-ccc_horzbar",
        type:    "horzbarchart",
        _chart:  "HorizontalBarChart",
        source:  "CCC",
        name:    vizLabel("HORIZONTAL_BAR"),
        factory: visualFactory,
        dataReqs: [{
          name: "Default",
          reqs: arrayAppendMany(
            createDataReq("HORIZONTAL_BAR", {options: false}),
            createColumnDataLabelsReq({
              separator: false,
              anchors: ["none", "center", "inside_end", "inside_base", "outside_end"]
            }),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 130,
        menuSeparator: true
      },
      {
        id:      "x-ccc_horzbarstacked",
        type:    "horzbarchart",
        _chart:  "HorizontalStackedBarChart",
        source:  "CCC",
        name:    vizLabel("STACKED_HORIZONTAL_BAR"),
        factory: visualFactory,
        dataReqs: [{
          name: "Default",
          reqs: arrayAppendMany(
            createDataReq("STACKED_HORIZONTAL_BAR", {options: false}),
            createColumnDataLabelsReq({
              separator: false,
              anchors: ["none", "center", "inside_end", "inside_base"]
            }),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 140
      },
      {
        id:      "x-ccc_barnormalized",
        type:    "barchart",
        _chart:  "NormalizedBarChart",
        source:  "CCC",
        name:    vizLabel("PCT_STACKED_VERTICAL_BAR"),
        factory: visualFactory,
        dataReqs: [{
          name: "Default",
          reqs: arrayAppendMany(
            createDataReq("PCT_STACKED_VERTICAL_BAR", {options: false}),
            createColumnDataLabelsReq({
              separator: false,
              anchors:   ["none", "center", "inside_end", "inside_base"]
            }),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 120
      },
      {
        id:      "x-ccc_horzbarnormalized",
        type:    "horzbarchart",
        _chart:  "HorizontalNormalizedBarChart",
        source:  "CCC",
        name:    vizLabel("PCT_STACKED_HORIZONTAL_BAR"),
        factory: visualFactory,
        dataReqs: [{
          name: "Default",
          reqs: arrayAppendMany(
            createDataReq("PCT_STACKED_HORIZONTAL_BAR", {options: false}),
            createColumnDataLabelsReq({
              separator: false,
              anchors: ["none", "center", "inside_end", "inside_base"]
            }),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 150
      },
      {
        id:      "x-ccc_line",
        type:    "linechart",
        _chart:  "LineChart",
        source:  "CCC",
        name:    vizLabel("LINE"),
        factory: visualFactory,
        updateEditModel: function() {
          updateTrendOptions.apply(this, arguments);
        },
        args: {
            // Default value for "shape" data request
            shape: "circle"
        },
        dataReqs: [
          {
            name: "Default",
            drillOrder: ["rows"],
            hyperlinkOrder: ["rows","columns"],
            reqs: arrayAppendMany(
              createDataReq("LINE", {options: false}),
              createLabelsVisibleAnchorDataReq(),
              createShapeDataReq(null, {separator: true}),
              createLineWidthDataReq(),
              createTrendsDataReqs(),
              createChartOptionsDataReq(true))
          }
        ],
        menuOrdinal: 160,
        menuSeparator: true
      },
      {
        id:      "x-ccc_area",
        type:    "areachart",
        _chart:  "StackedAreaChart",
        source:  "CCC",
        name:    vizLabel("STACKED_AREA"),
        factory: visualFactory,
        dataReqs: [{
          name: "Default",
          drillOrder: ["rows"],
          hyperlinkOrder: ["rows","columns"],
          reqs: arrayAppendMany(
            createDataReq("STACKED_AREA",{options: false}),
            createLabelsVisibleAnchorDataReq(true),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 180
      },
      {
        id:      "x-ccc_scatter",
        type:    "scatter",
        _chart:  "MetricDotChart",
        source:  "CCC",
        name:    vizLabel("SCATTER"),
        factory: visualFactory,
        updateEditModel: function() {
          updateTrendOptions.apply(this, arguments);
          updateColorOptions.apply(this, arguments);
        },
        maxValues: [1000, 2500, 5000, 10000],
        dataReqs:  [{
          name: "Default",
          reqs:  arrayAppendMany(
            {
              id: "x",
              dataType: "number",
              dataStructure: "column",
              caption: dropZoneLabel("SCATTER_X"),
              required: true,
              allowMultiple: false
            },
            {
              id: "y",
              dataType: "number",
              dataStructure: "column",
              caption: dropZoneLabel("SCATTER_Y"),
              required: true,
              allowMultiple: false
            },
            {
              id: "rows",
              dataType: "string",
              dataStructure: "column",
              caption: dropZoneLabel("SCATTER_ROW"),
              required: true,
              allowMultiple: true
            },
            {
              id: "color",
              dataType: "number, string",
              dataStructure: "column",
              caption: dropZoneLabel("SCATTER_COL"),
              required: false,
              allowMultiple: false
            },
            {
              id: "size",
              dataType: "number",
              dataStructure: "column",
              caption: dropZoneLabel("SCATTER_Z"),
              required: false,
              allowMultiple: false
            },
            createMultiDataReq(),
            createNumericDomainPaletteDataReqs(),
            createLabelsVisibleAnchorDataReq(),
            createTrendsDataReqs(),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 190,
        menuSeparator: true
      },
      {
        id:      "x-ccc_barline",
        type:    "barchart",
        _chart:  "BarLineChart",
        source:  "CCC",
        name:    vizLabel("VERTICAL_BAR_LINE"),
        factory: visualFactory,
        updateEditModel: function() {
          updateBarLineMeasures.apply(this, arguments);
        },
        args:  {
          shape: "circle"
        },
        dataReqs: [{
          name: "Default",
          reqs: [
            createRowDataReq("VERTICAL_BAR_LINE_ROW"),
            createColDataReq("VERTICAL_BAR_LINE_COL"),
            propSet(
              createMeaDataReq("VERTICAL_BAR_LINE_NUMCOL"),
              "required", false),
            propSet(
              createMeaDataReq("VERTICAL_BAR_LINE_NUMLINE"),
              "id", "measuresLine",
              "required", false),

            createColumnDataLabelsReq({
              value_anchor: "VALUE_COLUMN_ANCHOR",
              separator: false,
              anchors:["none", "center", "inside_end", "inside_base", "outside_end"]
            }),
            createLabelsVisibleAnchorDataReq({
              labels_option: "lineLabelsOption",
              value_anchor: "VALUE_LINE_ANCHOR"
            }),
            createMultiDataReq(),
            createShapeDataReq(null, {separator: true}),
            createLineWidthDataReq(),
            createChartOptionsDataReq(true)
          ]
        }],
        menuOrdinal: 125
      },
      {
        id:      "x-ccc_waterfall",
        type:    "waterfallchart",
        _chart:  "WaterfallChart",
        source:  "CCC",
        name:    vizLabel("WATERFALL"),
        factory: visualFactory,
        dataReqs: [{
          name: "Default",
          reqs: createDataReq("WATERFALL")
        }]
      },
      {
        id:      "x-ccc_boxplot",
        type:    "boxplotchart",
        _chart:  "BoxplotChart",
        source:  "CCC",
        name:    vizLabel("BOXPLOT"),
        factory: visualFactory,
        dataReqs: [{
          name: "Default",
          reqs: [
            createRowDataReq("BOXPLOT_ROW"),

            propSet(
              createMeaDataReq("BOXPLOT_PCT50"),
              "allowMultiple", false,
              "required", false),

            {
              id: "percentil25",
              dataType: "number",
              dataStructure: "column",
              caption: dropZoneLabel("BOXPLOT_PCT25"),
              required: false,
              allowMultiple: false
            },
            {
              id: "percentil75",
              dataType: "number",
              dataStructure: "column",
              caption: dropZoneLabel("BOXPLOT_PCT75"),
              required: false,
              allowMultiple: false
            },
            {
              id: "percentil5",
              dataType: "number",
              dataStructure: "column",
              caption: dropZoneLabel("BOXPLOT_PCT05"),
              required: false,
              allowMultiple: false
            },
            {
              id: "percentil95",
              dataType: "number",
              dataStructure: "column",
              caption: dropZoneLabel("BOXPLOT_PCT95"),
              required: false,
              allowMultiple: false
            },
            createMultiDataReq(),
            createChartOptionsDataReq()
          ]
        }]
      },
      {
        id:      "x-ccc_pie",
        type:    "piechart",
        _chart:  "PieChart",
        source:  "CCC",
        name:    vizLabel("MULTIPLE_PIE"),
        factory: visualFactory,
        args: {
          labelsOption: "outside"
        },
        dataReqs: [{
          name: "Default",
          drillOrder: ["rows","columns"],
          hyperlinkOrder: ["rows","columns"],
          reqs: arrayAppendMany(
            createDataReq("MULTIPLE_PIE", {multi: false, options: false}),
            createPieLabelsVisiblePositionDataReq(),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 183
      },
      {
        id:      "x-ccc_heatgrid",
        type:    "heatgrid",
        _chart:  "HeatGridChart",
        source:  "CCC",
        name:    vizLabel("HEATGRID"),
        factory: visualFactory,
        updateEditModel: function() {
          updateColorOrSizeRequired.apply(this, arguments);
        },
        maxValues: [500, 1000, 2000, 5000],
        args:      {
          // Default value for "shape" data request
          shape:"square"
        },
        dataReqs:  [{
          name: "Default",
          reqs: arrayAppendMany(
            {
              id: "rows",
              dataType: "string",
              dataStructure: "row",
              caption:  dropZoneLabel("HEATGRID_ROW"),
              required: true,
              allowMultiple: true
            },
            {
              id: "columns",
              dataType: "string",
              dataStructure: "column",
              caption: dropZoneLabel("HEATGRID_COL"),
              required: false,
              allowMultiple: true
            },
            {
              id: "color",
              dataType: "number",
              dataStructure: "column",
              caption: dropZoneLabel("HEATGRID_COLOR"),
              required: false,
              allowMultiple: false
            },
            {
              id: "size",
              dataType: "number",
              dataStructure: "column",
              caption: dropZoneLabel("HEATGRID_SIZE"),
              required: false,
              allowMultiple: false
            },
            createLabelsVisibleAnchorDataReq({
              hideOptions: ["left", "right", "top", "bottom"]
            }),
            createNumericDomainPaletteDataReqs({separator: true}),
            createShapeDataReq({"square": true, "circle": true}),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 200
      },
      {
        id:      "x-ccc_treemap",
        type:    "treemapchart",
        _chart:  "TreemapChart",
        source:  "CCC",
        name:    vizLabel("TREEMAP"),
        factory: visualFactory,
        dataReqs: [{
          name: "Default",
          reqs: [
            propSet(
              createRowDataReq("TREEMAP_ROW"),
              "required", true),
            {
              id: "size",
              dataType: "number",
              dataStructure: "column",
              caption: dropZoneLabel("TREEMAP_SIZE"),
              required: false,
              allowMultiple: false
            },
            createMultiDataReq(),
            createChartOptionsDataReq(false)
          ]
        }]
      },
      {
        id:      "x-ccc_bulletchart",
        type:    "bulletchart",
        _chart:  "BulletChart",
        source:  "CCC",
        name:    "Bullet Chart",
        factory: visualFactory,
        dataReqs: [
          {
            name: "Default",
            reqs: [
              {
                id: "rows",
                dataType: "string",
                dataStructure: "row",
                caption: "Across",
                required: true
              },
              {
                id: "columns",
                dataType: "string",
                dataStructure: "column",
                caption: "Down",
                required: true
              },
              {
                id: "measures",
                dataType: "number",
                dataStructure: "column",
                caption: "Values",
                required: true
              },
              createChartOptionsDataReq()
            ]
          }
        ]
      },
      {
        id:      "x-ccc_sunburst",
        type:    "treemapchart",
        _chart:  "SunburstChart",
        source:  "CCC",
        name:    vizLabel("SUNBURST"),
        factory: visualFactory,
        dataReqs: [{
          name: "Default",
          reqs: arrayAppendMany(
            propSet(
              createRowDataReq("SUNBURST_ROW"),
              "required", true),

            {
                id: "size",
                dataType: "number",
                dataStructure: "column",
                caption: dropZoneLabel("SUNBURST_SIZE"),
                required: false,
                allowMultiple: false
            },
            createMultiDataReq(),
            createLabelsVisibleAnchorDataReq({
              hideOptions: ["left", "right", "top", "bottom"]
            }),
            createSortDataReqs(true),
            createEmptySlicesDataReq(),
            createChartOptionsDataReq(true))
        }],
        menuOrdinal: 185
      }
    ];
  }

  // ----------

  // used by: bar, line, scatter
  function updateTrendOptions(editModel, changedProp) {
    if(changedProp && changedProp !== "trendType") return;

    var trendType = editModel.byId("trendType").value;
    var hidden = !trendType || trendType === "none";

    editModel.byId("trendLineWidth").ui.hidden = hidden;
    editModel.byId("trendName").ui.hidden = hidden;
  }

  function updateBarLineMeasures(editModel, changedProp) {
    if(changedProp && changedProp !== "measures" && changedProp !== "measuresLine") return;

    // Required logic, at least one of measuresBar or measuresLine is required by default
    var measuresBar  = editModel.byId("measures");
    var measuresLine = editModel.byId("measuresLine");

    var hasBarGems  = !measuresBar.value.length;
    var hasLineGems = !measuresLine.value.length;

    measuresBar .required =
    measuresLine.required = !hasBarGems && !hasLineGems;

    // Line options
    editModel.byId("shape"    ).ui.hidden =
    editModel.byId("lineWidth").ui.hidden = hasLineGems;
  }

  function updateColorOrSizeRequired(editModel, changedProp) {
    if(changedProp && changedProp !== "color" && changedProp !== "size") return;

    var colorBy   = editModel.byId("color");
    var sizeBy    = editModel.byId("size");
    var totalGems = colorBy.value.length + sizeBy.value.length;

    colorBy.required = (totalGems == 0);
    sizeBy .required = (totalGems == 0);
  }

  function updateColorOptions(editModel, changedProp) {
    if(changedProp && changedProp !== "color") return;

    var colorBy   = editModel.byId("color"),
        count     = colorBy.value.length,
        isMeasure = count > 0 && (colorBy.value[0].type === "number");

    // == 1 continuous data attribute
    // >= 0 discrete data attributes
    colorBy.allowMultiple = !isMeasure; // !count || !isMeasure ; !count => !isMeasure

    // Show/hide color options
    var colorOptionsVisible = isMeasure;

    editModel.byId("reverseColors").ui.hidden = !colorOptionsVisible;
    editModel.byId("colorSet"     ).ui.hidden = !colorOptionsVisible;
    editModel.byId("pattern"      ).ui.hidden = !colorOptionsVisible;
  }

  // ----------

  function label(prefix, id) {
    var cat = typeof cvCatalog !== "undefined" ? cvCatalog : null;
    return (cat && id && cvCatalog[(prefix || "") + id]) || "";
  }

  function vizLabel(id) {
    return "X - " + (label("VIZ_", id) || id);
  }

  function dropZoneLabel(id, defaultLabel) {
    return label("dropZoneLabels_", id) ||
           label("ropZoneLabels_", id) ||
           defaultLabel || id;
  }

  function chartPropsLabel(id, defaultLabel) {
    return label("dlgChartProps", id) || defaultLabel || id;
  }

  function createRowDataReq(rowLabel) {
    return {
      id: "rows",
      dataType: "string",
      dataStructure: "column",
      caption: dropZoneLabel(rowLabel),
      required: false,
      allowMultiple: true
    };
  }

  function createColDataReq(columnLabel) {
    return {
      id: "columns",
      dataType: "string",
      dataStructure: "column",
      caption: dropZoneLabel(columnLabel),
      required: false,
      allowMultiple: true
    };
  }

  function createMeaDataReq(measureLabel) {
    return {
      id: "measures",
      dataType: "number",
      dataStructure: "column",
      caption: dropZoneLabel(measureLabel),
      required: true,
      allowMultiple: true
    };
  }

  function createMultiDataReq() {
    return {
      id: "multi",
      dataType: "string",
      dataStructure: "column",
      caption: dropZoneLabel("MULTI_CHART"),
      required: false,
      allowMultiple: true
    };
  }

  function createShapeDataReq(valuesSet, options) {
    var values = ["circle", "cross", "diamond", "square", "triangle"];
    if(valuesSet)
      values = values.filter(function(value) { return O.hasOwn(valuesSet, value); });

    values.unshift("none");

    return {
      id:       "shape",
      dataType: "string",
      values:   values,
      ui: {
        labels:    values.map(function(option) { return dropZoneLabel(option.toUpperCase()); }),
        group:     "options",
        type:      "combo",
        seperator: options ? arg.optional(options, "separator", false) : false,
        caption:   dropZoneLabel("BULLET_STYLE")
      }
    };
  }

  function createLineWidthDataReq() {
    return {
      id: "lineWidth",
      dataType: "string",
      values: ["1", "2", "3", "4", "5", "6", "7", "8"],
      ui: {
        labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
        group: "options",
        type:  "combo",
        caption: chartPropsLabel("LineWidth")
      }
    };
  }

  // used by: bar, line, scatter
  function createTrendsDataReqs(keyArgs) {
    var types = ["none", "linear"];
    return [
      {
        id: "trendType",
        dataType: "string",
        values: types,
        ui: {
          labels:  types.map(function(option) {
            return dropZoneLabel("TREND_TYPE_" + option.toUpperCase());
          }),
          group: "options",
          type:  "combo",
          caption: dropZoneLabel("TREND_TYPE"),
          seperator: arg.optional(keyArgs, "separator", true)
        }
      },
      {
        id: "trendName",
        dataType: "string",
        ui: {
          group: "options",
          type:  "textbox",
          caption: dropZoneLabel("TREND_NAME")
        }
      },
      {
        id: "trendLineWidth",
        dataType: "string",
        values: ["1", "2", "3", "4", "5", "6", "7", "8"],
        ui: {
          labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
          group: "options",
          type:  "combo",
          caption: dropZoneLabel("TREND_LINEWIDTH")
        }
      }
    ];
  }

  function createSortDataReqs(addSeparator) {
    var types = ["bySizeDescending", "bySizeAscending", "none"];
    return {
      id: "sliceOrder",
      dataType: "string",
      values: types,
      ui: {
        labels: types.map(function(option) {
          return dropZoneLabel("SORT_TYPE_" + option.toUpperCase());
        }),
        group:     "options",
        type:      "combo",
        caption:   dropZoneLabel("SORT_TYPE"),
        seperator: addSeparator
      }
    };
  }

  // used by: scatter, heatgrid
  function createNumericDomainPaletteDataReqs(keyArgs) {
    return [
      {
        id: "pattern",
        dataType: "string",
        values: ["GRADIENT", "3-COLOR", "5-COLOR"],
        ui: {
          labels: ["GRADIENT", "3_STEP", "5_STEP"].
                  map(function(option) { return dropZoneLabel(option); }),
          group: "options",
          type:  "combo",
          caption: dropZoneLabel("PATTERN"),
          seperator: arg.optional(keyArgs, "separator", false)
        }
      },
      {
        id: "colorSet",
        dataType: "string",
        values: ["ryg", "ryb", "blue", "gray"],
        ui: {
          labels:  ["RYG", "RYB", "BLUE", "GRAY"].
                   map(function(option) { return dropZoneLabel("GRAD_" + option); }),
          group:   "options",
          type:    "combo",
          caption: dropZoneLabel("COLORSET")
        }
      },
      {
        id: "reverseColors",
        dataType: "boolean",
        ui: {
          label: dropZoneLabel("COLORSET_REVERSE"),
          group: "options",
          type:  "checkbox"
        }
      }
    ];
  }

  function createEmptySlicesDataReq() {
    return {
      id: "emptySlicesHidden",
      dataType: "boolean",
      value: true,
      ui: {
        label:   dropZoneLabel("SHOW_AS_GAPS"),
        group:   "options",
        type:    "checkbox",
        caption: dropZoneLabel("EMPTY_SLICES")
      }
    };
  }

  function createPieLabelsVisiblePositionDataReq(keyArgs) {
    var positions = ["none", "outside", "inside"];

    return {
      id: "labelsOption",
      dataType: "string",
      values: positions,
      // value: "outside",
      ui: {
        labels: positions.map(function(option) {
          return dropZoneLabel("VALUE_POSITION_" + option.toUpperCase());
        }),
        group: "options",
        type:  "combo",
        caption: dropZoneLabel("VALUE_POSITION")
      }
    };
  }

  function createLabelsVisibleAnchorDataReq(keyArgs) {
    var anchors = ["none", "center", "left", "right", "top", "bottom"],
        hideOptions = arg.optional(keyArgs, "hideOptions");

    if(hideOptions) {
      for(var i = 0; i < hideOptions.length; i++) {
        for(var j = 0; j < anchors.length; j++) {
          if(anchors[j] === hideOptions[i]) {
            anchors.splice(j, 1);
            break;
          }
        }
      }
    }

    return {
      id: arg.optional(keyArgs, "labels_option", "labelsOption"),
      dataType: "string",
      values: anchors,
      ui: {
        labels: anchors.map(function(option) {
          return dropZoneLabel("VALUE_ANCHOR_DOTS_" + option.toUpperCase());
        }),
        group: "options",
        type:  "combo",
        caption: dropZoneLabel(arg.optional(keyArgs, "value_anchor", "VALUE_ANCHOR"))
      }
    };
  }

  function createColumnDataLabelsReq(keyArgs) {
    var anchors = arg.optional(keyArgs, "anchors");

    return {
      id: "labelsOption",
      dataType: "string",
      values: anchors,
      ui: {
        labels: anchors.map(function(option) {
          return dropZoneLabel("COLUMN_LABEL_ANCHOR_" + option.toUpperCase());
        }),
        group: "options",
        type:  "combo",
        seperator: arg.optional(keyArgs, "separator", true),
        caption: dropZoneLabel(arg.optional(keyArgs, "value_anchor", "VALUE_ANCHOR"))
      }
    };
  }

  function createChartOptionsDataReq(hasSeparator) {
    return {
      id: "optionsBtn",
      dataType: "none",
      ui: {
        group:     "options",
        type:      "button",
        label:     dropZoneLabel("CHART_OPTIONS"),
        seperator: hasSeparator || false
      }
    };
  }

  function createDataReq(chartId, options) {
    var json = [];

    if(arg.optional(options, "row", true))
        json.push(createRowDataReq(chartId + "_ROW"));

    if(arg.optional(options, "column", true))
        json.push(createColDataReq(chartId + "_COL"));

    if(arg.optional(options, "measure", true))
        json.push(createMeaDataReq(chartId + "_NUM"));

    if(arg.optional(options, "multi", true))
        json.push(createMultiDataReq());

    if(arg.optional(options, "options", true))
        json.push(createChartOptionsDataReq(false));

    return json;
  }

  // -----

  function propSet(o) {
      // Not assigning to arguments variable allows optimizations.
    var oo = o || {},
        a  = arguments;
    for(var i = 1, A = a.length - 1 ; i < A ; i += 2) oo[a[i]] = a[i+1];
    return oo;
  }

  function arrayAppendMany(target) {
      var a = arguments, S = a.length, source;
      target = arrayTo(target);
      if(S > 1) {
          for(var s = 1 ; s < S ; s++) {
              if((source = arrayTo(a[s]))) {
                  var i = 0, L = source.length;
                  while(i < L) target.push(source[i++]);
              }
          }
      }
      return target;
  }

  function arrayTo(v) {
      return (v instanceof Array) ? v : ((v != null) ? [v] : null);
  }
});
