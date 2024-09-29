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
          selectedMode: "multiple",

          /*
           If user wishes to fire a select action when 'useMeasureColors' is true,
           it is recommended to click on the dial and not on "colored partition".
           The dial is clickable and provides the value. The "colored partition" is just an
           axis and not clickable, like any other axis in ECharts.
           Reference: https://github.com/apache/echarts/issues/18093#issuecomment-1366918061
          */
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
            show: model.showLegend,
            fontFamily: titleFontFamily,
            fontWeight: titleFontWeight,
            fontSize: model.legendSize || 14
          },
          detail: {
            show: model.showLegend,
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
        var formattedValueMap = {};

        for (var i = 0; i < rowCount; i++) {
          offsetCenterX = offsetCenterX0 + stepWidthHorizontal * i;
          var measureValue = dataTable.getValue(i, measureColIndex);
          formattedValueMap[measureValue] = dataTable.getFormattedValue(i, measureColIndex);

          records.push({
            name: dataTable.getCompositeFormattedValue(i, categoriesColIndexes, self.groupedLabelSeparator),
            value: measureValue,
            tooltip: self._buildTooltip(self._buildRowTooltipHtml(dataTable, i), font),
            vars: {"rows": self._getCellsValues(dataTable.getRowCells(i, categoriesColIndexes))},
            title: {
              offsetCenter: [offsetCenterX, offsetCenterYPercent + "%"],
              overflow: "truncate",
              width: bandWidthHorizontal
            },
            detail: {
              offsetCenter: [offsetCenterX, (offsetCenterYPercent + 15) + "%"],
              width: detailWidthHorizontal,
              backgroundColor: bgColorDetail[i],
              formatter: function (value) {
                return formattedValueMap[value];
              }
            }
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
        var formattedValueMap = {};

        for (var i = 0; i < rowCount; i++) {
          offsetCenterY = offsetCenterY0 + stepWidthVertical * i;
          var measureValue = dataTable.getValue(i, measureColIndex);
          formattedValueMap[measureValue] = dataTable.getFormattedValue(i, measureColIndex);

          records.push({
            name: dataTable.getCompositeFormattedValue(i, categoriesColIndexes, self.groupedLabelSeparator),
            value: measureValue,
            tooltip: self._buildTooltip(self._buildRowTooltipHtml(dataTable, i), font),
            vars: {"rows": self._getCellsValues(dataTable.getRowCells(i, categoriesColIndexes))},
            title: {
              offsetCenter: [offsetCenterXPercent + "%", offsetCenterY],
              overflow: "truncate",
              width: bandWidthVertical
            },
            detail: {
              offsetCenter: [(offsetCenterXPercent + 40) + "%", offsetCenterY],
              width: detailWidthVertical,
              backgroundColor: bgColorDetail[i],
              formatter: function (value) {
                return formattedValueMap[value];
              }
            }
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
