/*!
 * Copyright 2023 Hitachi Vantara. All rights reserved.
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
  "./Abstract",
  "common-ui/echarts",
  "pentaho/visual/util"
], function(module, BaseView, echarts, util) {

  "use strict";

  return BaseView.extend(module.id, {

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

    _configureLabel: function(options) {
      var font = util.getDefaultFont(null, 12);

      var label = {
        show: true,
        position: this._getEChartsLabel(this.model.labelsOption),
        formatter: "{b}: {d}%",
        backgroundColor: "transparent",
        fontSize: font.substring(0, font.indexOf(" ")),
        fontFamily: font.substring(font.indexOf(" ") + 1)
      };

      options.series.forEach(function(row) {
        row.label = label;
      });
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

    _buildSeries: function() {
      var dataTable = this.model.data;
      var range = dataTable.getColumnRange(dataTable.getNumberOfColumns() - 1);

      return [
        {
          type: "funnel",
          left: "20%",
          right: "20%",
          top: "10%",
          bottom: "10%",
          width: "auto",
          height: "auto",
          min: range.min,
          max: range.max,
          minSize: 5,
          maxSize: "100%",
          sort: this.model.order === "bySizeDescending" ? "descending" : "ascending",
          legendHoverLink: true,
          gap: 4,
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: "solid"
            }
          },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 1
          },
          emphasis: {
            label: {
              fontSize: 20
            }
          }
        }
      ];
    },

    _buildRowTooltipHtml: function(dataTable, rowNum) {
      var rowTooltipHtml = "";

      for(var colNum = 0; colNum < dataTable.getNumberOfColumns(); colNum++) {
        rowTooltipHtml = rowTooltipHtml + dataTable.getColumnLabel(colNum) + " : " +
          dataTable.getFormattedValue(rowNum, colNum) + "<br />";
      }

      return rowTooltipHtml;
    },

    _buildData: function() {
      var dataTable = this.model.data;

      if(dataTable.originalCrossTable) {
        dataTable = dataTable.originalCrossTable.toPlainTable({skipRowsWithAllNullMeasures: true});
      }

      var rowLength = dataTable.getNumberOfRows();
      var colLength = dataTable.getNumberOfColumns();
      var font = util.getDefaultFont(null, 12);

      var records = [];

      // Read data from dataTable and push it to records
      for(var i = 0; i < rowLength; i++) {
        records.push({
          name: dataTable.getFormattedValue(i, colLength - 2),
          value: dataTable.getValue(i, colLength - 1),
          tooltip: this._buildTooltip(this._buildRowTooltipHtml(dataTable, i), font)
        });
      }

      return records;
    },

    _configureData: function(options, records) {
      options.series.forEach(function(row) {
        row.data = records;
      });
    },

    /** This method initializes the eChart library,
     *configures all the properties, data that are required for the chart and renders it.
     *
     * @override */
    _updateAll: function() {

      this.base();

      var myChart = echarts.init(this.domContainer, null, {});
      var records = this._buildData();
      var options = {
        tooltip: {
          trigger: "item"
        },
        color: this._buildColors(),
        series: this._buildSeries()
      };

      this._configureData(options, records);
      this._configureLabel(options);
      this._configureLegend(options, records);

      // Draw the chart
      myChart.setOption(options);
    }
  })
  .implement(module.config);
});
