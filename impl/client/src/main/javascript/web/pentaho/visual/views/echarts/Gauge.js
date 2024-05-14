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

    _buildAxisLineColors: function () {

      var colorArray = this._getContinuousColorScale();

      var step = 1 / colorArray.length;
      var threshold = step;

      var axisLineColors = [];

      for (var i = 0; i < colorArray.length; i++) {
        axisLineColors.push([threshold, colorArray[i]]);
        threshold += step;
      }

      return axisLineColors;
    },


    _buildSeries: function(echartData) {
      var model = this.model;
      var dataTable = model.data;

      var range = this._getColumnRange(dataTable, dataTable.getNumberOfColumns() - 1, true);

      var showProgress = !model.useMeasureColors;
      var colorScale = model.useMeasureColors ? this._buildAxisLineColors() : [[1, '#E6EBF8']];
      var fontColor = model.labelColor || this.fontColor;
      var axisLabelColor = model.useMeasureColors ? 'inherit' : fontColor;
      var labelFontFamily = this._getFontFamily(model.labelFontFamily);
      var labelFontWeight = this._getFontWeight(model.labelStyle);
      var titleFontWeight = this._getFontWeight(model.legendStyle);
      var titleFontFamily = this._getFontFamily(model.legendFontFamily);
      var legendPosition = model.legendPosition || "right";
      var center;

      switch (legendPosition) {
        case "left":
          center = ['60%', '50%'];
          break;
        case "top":
          center = ['50%', '55%'];
          break;
        case "bottom":
          center = ['50%', '45%'];
          break;
        case "right":
        default:
          center = ['40%', '50%'];
          break;
      }

      return [
        {
          type: "gauge",
          center: center,
          min: range.min,
          max: range.max,
          data: echartData,

          axisLine: {
            lineStyle: {
              color: colorScale
            }
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 18,
            itemStyle: {
              color: 'auto'
            }
          },
          progress: {
            show: showProgress,
            overlap: true,
            roundCap: true
          },
          pointer: {
            icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
            width: 8,
            length: '80%',
            offsetCenter: [0, '8%']
          },
          axisTick: {
            show: false,
            distance: -30,
            length: 8
          },
          splitLine: {
            show: false,
            distance: -30,
            length: 30
          },
          axisLabel: {
            color: axisLabelColor,
            distance: 40,
            fontSize: model.labelSize || this.fontSize,
            fontFamily: labelFontFamily,
            fontWeight: labelFontWeight,
            formatter: function(value) {
              return new Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 2,
                compactDisplay: "short"
              }).format(value);
            }
          },
          title: {
            fontFamily: titleFontFamily,
            fontWeight: titleFontWeight,
            fontSize: model.legendSize || 14
          },
          detail: {
            width: "auto",
            height: "auto",
            legendHoverLink: true,
            fontSize: model.legendSize || 14,
            color: "#fff",
            borderRadius: 3,
            formatter: "{value}"
          },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 1
          }
        }
      ];
    },

    /**
     * This method transforms the table into a plain structure,
     * obtains the required values for categories and measures from te source dataTable object,
     * transforms them into target name-value pairs in string and number formats,
     * handles their layout within the available width/height,
     * and builds the tooltip.
     *
     * @override
     */
    _buildData: function() {
      var model = this.model;
      var dataTable = model.data;

      if(dataTable.originalCrossTable) {
        dataTable = dataTable.originalCrossTable.toPlainTable({skipRowsWithAllNullMeasures: true});
      }

      var rowCount = dataTable.getNumberOfRows();
      var categoriesColIndexes = model.rows.fieldIndexes;
      var measureColIndex = model.measures.fieldIndexes[0];
      var font = util.getDefaultFont(null, 12);
      var legendPosition = model.legendPosition || "right";
      var bgColorDetail = this._buildColors();

      var records = [];

      var bandPercent = 0.95;

      var self = this;

      function pushRecordsHorizontal(offsetCenterYPercent){
        var offsetCenterX;
        var innerWidth = model.width * 0.8;
        var stepWidthHorizontal = innerWidth / (rowCount - (1 - bandPercent));
        var bandWidthHorizontal = bandPercent * stepWidthHorizontal;
        var detailWidthHorizontal = stepWidthHorizontal * 0.7;
        var offsetCenterX0 = -innerWidth / 2 + bandWidthHorizontal / 2;

        for (var i = 0; i < rowCount; i++) {
          offsetCenterX = offsetCenterX0 + stepWidthHorizontal * i

          records.push({
            name: dataTable.getCompositeFormattedValue(i, categoriesColIndexes, self.groupedLabelSeparator),
            value: dataTable.getValue(i, measureColIndex),
            tooltip: self._buildTooltip(self._buildRowTooltipHtml(dataTable, i), font),
            title: {
              offsetCenter: [offsetCenterX, offsetCenterYPercent + "%"],
              overflow: "truncate",
              width: bandWidthHorizontal
            },
            detail: {
              offsetCenter: [offsetCenterX, (offsetCenterYPercent + 15) + "%"],
              width: detailWidthHorizontal,
              backgroundColor: bgColorDetail[i]
            },
            visualKey: dataTable.getCompositeValue(i, categoriesColIndexes, self.groupedLabelSeparator)
          });
        }
      }

      function pushRecordsVertical(offsetCenterXPercent){
        var offsetCenterY;
        var innerHeight = model.height * 0.8;
        var stepWidthVertical = innerHeight / (rowCount - (1 - bandPercent));
        var bandWidthVertical = bandPercent * stepWidthVertical;
        var detailWidthVertical = stepWidthVertical * 0.8;
        var offsetCenterY0 = -innerHeight / 2 + bandWidthVertical / 2;

        for (var i = 0; i < rowCount; i++) {
          offsetCenterY = offsetCenterY0 + stepWidthVertical * i;

          records.push({
            name: dataTable.getCompositeFormattedValue(i, categoriesColIndexes, self.groupedLabelSeparator),
            value: dataTable.getValue(i, measureColIndex),
            tooltip: self._buildTooltip(self._buildRowTooltipHtml(dataTable, i), font),
            title: {
              offsetCenter: [offsetCenterXPercent + "%", offsetCenterY],
              overflow: "truncate",
              width: bandWidthVertical
            },
            detail: {
              offsetCenter: [(offsetCenterXPercent + 40) + "%", offsetCenterY],
              width: detailWidthVertical,
              backgroundColor: bgColorDetail[i]
            },
            visualKey: dataTable.getCompositeValue(i, categoriesColIndexes, self.groupedLabelSeparator)
          });
        }
      }

      switch (legendPosition) {
        case "bottom":
          pushRecordsHorizontal(100);
          break;

        case "top":
          pushRecordsHorizontal(-135);
          break;

        case "left":
          pushRecordsVertical(-235);
          break;

        case "right":
        default:
          pushRecordsVertical(150);
      }

      return records;
    }
  })
  .implement(module.config);
});
