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

    _initializeChart: function() {
      this._chart = echarts.init(this.domContainer, null, {});
      return this._chart;
    },

    /** @override */
    _updateSize: function() {
      // this.base();
      this._chart.resize();
    },

    _getEChartsLabel: function(labelsOption) {
      switch(labelsOption) {
        case "topLeft" :
          return "leftTop";
        case "bottomLeft" :
          return "leftBottom";
        case "topRight":
          return "rightTop";
        case "bottomRight":
          return "rightBottom";
        default:
          return labelsOption;
      }
    },

    _configureLabel: function(options, labelPosition, formatter) {
      var font = util.getDefaultFont(null, 12);

      var label = {
        show: true,
        position: labelPosition,
        formatter: formatter,
        backgroundColor: "transparent",
        fontSize: font.substring(0, font.indexOf(" ")),
        fontFamily: font.substring(font.indexOf(" ") + 1)
      };

      options.series.forEach(function(row) {
        row.label = label;
      });
    },

    _getTableFormattedValue: function(dataTable, rowIndex, categoriesColIndexes) {
      return categoriesColIndexes.map(function(colIndex) {
        return dataTable.getFormattedValue(rowIndex, colIndex);
      }).join(" ~ ");
    },

    _configureLegend: function(options, records) {
      var categories = [];
      var font = util.getDefaultFont(null, 14);

      records.forEach(function(record) {
        categories.push(record.name);
      });

      options.legend = {
        data: categories,
        type: "scroll",
        align: "auto",
        padding: 10,
        textStyle: {
          fontSize: font.substring(0, font.indexOf(" ")),
          fontFamily: font.substring(font.indexOf(" ") + 1)
        }
      };
    },

    _configureData: function(options, records) {
      options.series.forEach(function(row) {
        row.data = records;
      });
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

      function escapeHTML(str){
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
        series: this._buildSeries()
      };

      this._configureData(this._echartOptions, this._echartData);
    },

    /** This method initializes the eChart library,
     *configures all the properties, data that are required for the chart and renders it.
     *
     * @override */
    _updateAll: function () {

      this.base();

      if (this._chart == null){
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
