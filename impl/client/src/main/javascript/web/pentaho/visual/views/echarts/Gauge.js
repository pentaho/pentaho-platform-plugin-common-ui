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
  "./Abstract",
  "pentaho/visual/util"
], function(module, BaseView, util) {

  "use strict";

  return BaseView.extend(module.id, {

    _buildSeries: function() {
      var dataTable = this.model.data;
      var range = dataTable.getColumnRange(dataTable.getNumberOfColumns() - 1);

      function log10Ceil(x) {
        return (x > 0)
            ? Math.pow(10, Math.ceil(Math.log10(x)))
            : -Math.pow(10, -Math.ceil(-Math.log10(-x)));
      }

      function log10Floor(x) {
        return (x > 0)
            ? Math.pow(10, Math.floor(Math.log(x)))
            : -Math.pow(10, -Math.floor(-Math.log(-x)));
      }

      var minEf = log10Floor(range.min);
      var maxEf = log10Ceil(range.max);

      // Make sure range includes 0.
      if (maxEf < 0) {
        maxEf = 0;
      } else if (minEf > 0) {
        minEf = 0;
      }

      return [
        {
          type: "gauge",
          min: minEf,
          max: maxEf,

          pointer: {
            width: 8,
            length: "80%",
            offsetCenter: [0, "8%"]
          },
          progress: {
            show: true,
            overlap: true,
            roundCap: true
          },
          detail: {
            width: "auto",
            height: "auto",
            legendHoverLink: true,
            fontSize: 14,
            color: "#fff",
            backgroundColor: "inherit",
            borderRadius: 3,
            formatter: "{value}"
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

    /**
     * This method transforms the table into a plain structure,
     * obtains the required values for categories and measures from te source dataTable object,
     * transforms them into target name-value pairs in string and number formats,
     * handles their layout within the available width,
     * and builds the tooltip.
     *
     * @override
     */
    _buildData: function() {
      var dataTable = this.model.data;

      if(dataTable.originalCrossTable) {
        dataTable = dataTable.originalCrossTable.toPlainTable({skipRowsWithAllNullMeasures: true});
      }

      var rowCount = dataTable.getNumberOfRows();
      var categoriesColIndexes = this.model.rows.fieldIndexes;
      var measureColIndex = this.model.measures.fieldIndexes[0];
      var font = util.getDefaultFont(null, 12);

      var records = [];

      var innerWidth = this.model.width * 0.8;

      // Avoid overlapping title text by having a safety margin on either side of text (2.5%).
      var bandPercent = 0.95;
      var stepWidth = innerWidth / (rowCount - (1 - bandPercent));
      var bandWidth = bandPercent * stepWidth;
      var detailWidth = stepWidth * 0.7;

      var offsetCenterYPercent = 100;

      // X coordinates of title/detail are relative to the center of the chart, as per option `offsetCenter`.
      // Also, center points on each band, by offsetting by half band.
      var offsetCenterX0 = -innerWidth / 2 + bandWidth / 2;

      // Read data from dataTable and push it to records
      for(var i = 0; i < rowCount; i++) {
        var offsetCenterX = offsetCenterX0 + stepWidth * i;

        records.push({
          name: this._getTableFormattedValue(dataTable, i, categoriesColIndexes),
          value: dataTable.getValue(i, measureColIndex),
          tooltip: this._buildTooltip(this._buildRowTooltipHtml(dataTable, i), font),
          title: {
            offsetCenter: [offsetCenterX, offsetCenterYPercent + "%"],
            overflow: "truncate",
            width: bandWidth
          },
          detail: {
            offsetCenter: [offsetCenterX, (offsetCenterYPercent + 15) + "%"],
            width: detailWidth
          }
        });
      }

      return records;
    }
  })
  .implement(module.config);
});
