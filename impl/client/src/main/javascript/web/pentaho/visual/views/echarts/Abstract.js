/*!
 * Copyright 2024 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "pentaho/visual/impl/View",
  "pentaho/visual/util",
  "pentaho/visual/scene/util",
  "pentaho/data/util",
  "common-ui/echarts"
], function(module, BaseView, util, sceneUtil, dataUtil, echarts) {

  "use strict";

  return BaseView.extend(module.id, {

    groupedLabelSeparator: "~",

    font: util.getDefaultFont(null, 12),
    fontFamily: "Default",
    fontWeight: "plain",
    fontSize: 12,
    fontColor: "#333333",

    _getFontWeight: function(modelValue) {
      var fontWeight = modelValue || this.fontWeight;
      fontWeight = fontWeight === "plain" ? "normal" : fontWeight;
      return fontWeight;
    },

    _getFontFamily: function(modelValue) {
      var font = this.font;
      var fontFamily = modelValue || this.fontFamily;
      fontFamily = fontFamily === "Default" ? font.substring(font.indexOf(" ") + 1) : fontFamily;
      return fontFamily;
    },

    _getModelSize: function() {
      var model = this.model;
      return {
        height: model.height || 400,
        width: model.width || 400
      };
    },

    _initializeChart: function() {
      var size = this._getModelSize();
      this._chart = echarts.init(this.domContainer, null, {width: size.width, height: size.height});
      return this._chart;
    },

    /** @override */
    _updateSize: function() {
      var size = this._getModelSize();
      var clientHeight = this._chart.getDom().clientHeight;
      var height = Math.max(clientHeight, size.height);

      this._chart.resize({width: size.width, height:height});
    },

    _getEChartsLabel: function(labelsOption) {
      switch (labelsOption) {
        case "topLeft":
          return "leftTop";
        case "bottomLeft":
          return "leftBottom";
        case "topRight":
          return "rightTop";
        case "bottomRight":
          return "rightBottom";
        default:
          return labelsOption;
      }
    },

    _getColumnRange: function(dataTable, colIndex, ensureZero) {
      var range = dataTable.getColumnRange(colIndex);
      var min = range.min;
      var max = range.max;

      // Make sure range includes 0.
      if (ensureZero) {
        if (max < 0) {
          max = 0;
        } else if (min > 0) {
          min = 0;
        }
      }

      var span = max - min;
      var step = Math.pow(10, Math.round(Math.log10(span)) - 1);
      return {
        min: Math.floor(min / step) * step,
        max: Math.ceil(max / step) * step
      };
    },

    _configureLabel: function(labelPosition, formatter) {
      var model = this.model;
      var fontWeight = this._getFontWeight(model.labelStyle);
      var fontFamily = this._getFontFamily(model.labelFontFamily);

      return {
        show: true,
        position: labelPosition,
        formatter: formatter,
        backgroundColor: "transparent",
        fontWeight: fontWeight,
        color: model.labelColor || this.fontColor,
        fontSize: model.labelSize || this.fontSize,
        fontFamily: fontFamily
      };
    },

    _legendOrientation: function(position) {
      switch (position) {
        case "left":
        case "right":
          return "vertical";
        case "top":
        case "bottom":
          return "horizontal";
        default:
          return "horizontal";
      }
    },

    _configureLegend: function(options, records) {
      var categories = [];
      var model = this.model;

      var top = "auto";
      var left = "auto";
      var position = model.legendPosition || "top";
      var orient = this._legendOrientation(position);

      var fontWeight = this._getFontWeight(model.legendStyle);
      var fontFamily = this._getFontFamily(model.legendFontFamily);

      var legendBgColor = model.legendBackgroundColor || "transparent";
      legendBgColor = legendBgColor.toLowerCase() !== "#ffffff" ? legendBgColor : "transparent";

      if(position === "top" || position === "bottom") {
        top = position;
      } else {
        left = position;
      }

      records.forEach(function(record) {
        categories.push(record.name);
      });

      options.legend = {
        show: model.showLegend && categories.length > 1,
        data: categories,
        type: "scroll",
        align: "left",
        icon: "circle",
        orient: orient,
        left: left,
        top: top,
        backgroundColor: legendBgColor,
        itemWidth: 8,
        itemHeight: 8,
        padding: 10,
        tooltip: {
          show: true
        },
        textStyle: {
          width: 80,
          overflow: "truncate",
          fontWeight: fontWeight,
          color: model.legendColor || this.fontColor,
          fontSize: model.legendSize || 14,
          fontFamily: fontFamily
        }
      };
    },

    _buildBgColor: function() {
      var model = this.model;
      var bgFillType = model.backgroundFill || "none";
      var bgColorFill = model.backgroundColor || "transparent";
      var bgColorEnd = model.backgroundColorEnd || "transparent";

      if(bgFillType === "none") {
        return "transparent";
      }

      if(bgFillType === "solid") {
        return bgColorFill;
      }

      return {
        type: "linear",
        x: 0, y: 0,
        x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: bgColorEnd },
          { offset: 1, color: bgColorFill }
        ],
      };
    },

    _buildColors: function() {
      return this.model.palette.colors.toArray(function(color) {
        return color.value;
      });
    },

    _buildTooltip: function(tooltipFormatString, font) {
      return {
        formatter: tooltipFormatString,
        fontSize: font.substring(0, font.indexOf(" ")),
        fontFamily: font.substring(font.indexOf(" ") + 1)
      };
    },

    _buildRowTooltipHtml: function(dataTable, rowNum) {
      var rowTooltipHtml = "";

      function escapeHTML(str) {
        var elem = document.createElement("e");
        elem.appendChild(document.createTextNode(str));
        return elem.innerHTML;
      }

      for(var colNum = 0; colNum < dataTable.getNumberOfColumns(); colNum++) {
        rowTooltipHtml = rowTooltipHtml + escapeHTML(dataTable.getColumnLabel(colNum)) + " : " +
          escapeHTML(dataTable.getFormattedValue(rowNum, colNum)) + "<br />";
      }

      return rowTooltipHtml;
    },

    _configureOptions: function() {
      this._echartData = this._buildData();
      this._echartOptions = {
        tooltip: {
          trigger: "item"
        },
        color: this._buildColors(),
        backgroundColor: this._buildBgColor(),
        series: this._buildSeries(this._echartData)
      };
    },

    /** This method initializes the eChart library,
     *configures all the properties, data that are required for the chart and renders it.
     *
     * @override */
    _updateAll: function() {

      this.base();

      if(this._chart == null) {
        this._initializeChart();
      }

      this._configureOptions();

      this._chart.on("dblclick", function (params) {
        this._onExecute(params);
      }, this);

      // When 'click' and 'dblclick' are bound to same element
      // and user double-clicks, 'click' is fired twice followed by dbl-click
      // Reference: https://stackoverflow.com/a/7119911
      var clickTimeout;
      this._chart.on("click", function (params) {
        clearTimeout(clickTimeout);
        var me = this;
        clickTimeout = setTimeout(function() {
          me._onSelect(params);
        }, 300);
      }, this);

      // Draw the chart
      this._chart.setOption(this._echartOptions);
    },

    _onExecute: function(params) {
      params.cancelBubble = true;
      var model = this.model;
      if(model.isDirty) {
        return;
      }

      var filter = null;
      var srcEvent = params.event;

      var filter = this._createFilter(params);

      if(filter === null) {
        return;
      }

      model.execute({
        dataFilter: filter,
        position: srcEvent ? {x: srcEvent.offsetX, y: srcEvent.offsetY} : null
      });
    },

    _onSelect: function(params) {
      params.cancelBubble = true;
      var model = this.model;
      if(model.isDirty) {
        return;
      }

      var filter = null;
      var srcEvent = params.event.event;

      var filter = this._createFilter(params);

      if(filter === null) {
        return;
      }

      model.select({
        dataFilter: filter,
        selectionMode: srcEvent.ctrlKey || srcEvent.metaKey ? "toggle" : "replace"
      });
    },

    _createFilter: function(params) {
      var model = this.model;

      var varsMap = this._getVars(params.data.visualKey);

      var keyDataCellsMap = sceneUtil.invertVars(varsMap, model);

      return dataUtil.createFilterFromCellsMap(keyDataCellsMap, model.data);
    },

    _getVars: function(eventData) {
      if(eventData == null) {
        return null;
      }

      var varsMap = Object.create(null);
      var value = eventData.split(this.groupedLabelSeparator);
      var key = "rows";

      varsMap[key] = value;

      return varsMap;
    },

    /** @inheritDoc */
    dispose: function() {

      this.__disposeChart();

      this.base();
    },

    /**
     * Disposes an existing eChart chart.
     * @private
     */
    __disposeChart: function() {
      if(this._chart && this._chart.dispose) {
        this._chart.dispose();
        this._chart = null;
      }
    }
  })
  .implement(module.config);
});
