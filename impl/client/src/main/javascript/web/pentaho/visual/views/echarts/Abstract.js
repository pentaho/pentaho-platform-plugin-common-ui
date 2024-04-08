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
  "common-ui/echarts"
], function(module, BaseView, util, echarts) {

  "use strict";

  return BaseView.extend(module.id, {

    groupedLabelSeparator: "~",

    _initializeChart: function() {
      this._chart = echarts.init(this.domContainer, null, {});
      return this._chart;
    },

    /** @override */
    _updateSize: function() {
      this._chart.resize();
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
      var font = util.getDefaultFont(null, 12);
      var model = this.model;
      var fontWeight = model.labelStyle;
      var fontFamily = model.labelFontFamily;

      return {
        show: true,
        position: labelPosition,
        formatter: formatter,
        backgroundColor: "transparent",
        fontWeight: fontWeight === "plain" ? "normal" : fontWeight,
        color: model.labelColor,
        fontSize: model.labelSize || 12,
        fontFamily: fontFamily === "Default" ? font.substring(font.indexOf(" ") + 1) : fontFamily
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
      var font = util.getDefaultFont(null, 14);

      var top = "auto";
      var left = "auto";
      var position = model.legendPosition;
      var orient = this._legendOrientation(position);
      var fontWeight = model.legendStyle;
      var fontFamily = model.legendFontFamily;
      var legendBgColor = model.legendBackgroundColor;

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
        backgroundColor: legendBgColor.toLowerCase() !== "#ffffff" ? legendBgColor : "transparent",
        itemWidth: 8,
        itemHeight: 8,
        padding: 10,
        textStyle: {
          fontWeight: fontWeight === "plain" ? "normal" : fontWeight,
          color: model.legendColor,
          fontSize: model.legendSize,
          fontFamily: fontFamily === "Default" ? font.substring(font.indexOf(" ") + 1) : fontFamily
        }
      };
    },

    _buildBgColor: function() {
      var model = this.model;
      var bgFillType = model.backgroundFill;
      var bgColorFill = model.backgroundColor;
      var bgColorEnd = model.backgroundColorEnd;

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

      // Draw the chart
      this._chart.setOption(this._echartOptions);
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
