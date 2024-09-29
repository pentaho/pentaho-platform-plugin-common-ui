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
  "pentaho/visual/impl/View",
  "pentaho/visual/util",
  "pentaho/visual/color/util",
  "pentaho/visual/scene/util",
  "pentaho/data/util",
  "common-ui/echarts"
], function(module, BaseView, util, visualColorUtils, sceneUtil, dataUtil, echarts) {

  "use strict";

  var SelectionStates = {
    NoneSelected: 0,
    AnySelected: 1,
    IsSelected: 2
  }

  return BaseView.extend(module.id, {

    groupedLabelSeparator: "~",

    font: util.getDefaultFont(null, 12),
    fontFamily: "Default",
    fontWeight: "plain",
    fontSize: 12,
    fontColor: "#333333",

    __clickTimeout: null,

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

    _getCellsValues: function(cells) {
      return cells.map(function(cell) {
        return cell.valueOf();
      })
    },

    _initializeChart: function() {
      var size = this._getModelSize();
      this._chart = echarts.init(this.domContainer, null, {width: size.width, height: size.height});

      this._chart.on("dblclick", function (echartsEvent) {
        this._onDoubleClick(echartsEvent);
      }, this);

      this._chart.on("click", function (echartsEvent) {
        if (this.__clickTimeout) {
          clearTimeout(this.__clickTimeout);
          this.__clickTimeout = null;
          return;
        }

        this.__clickTimeout = setTimeout(function() {
          this.__clickTimeout = null;
          this._onClick(echartsEvent);
        }.bind(this), 301);
      }, this);

      return this._chart;
    },

    _onClick: function(echartsEvent) {
      if(this.model.isDirty) {
        return;
      }

      this._onSelect(echartsEvent);
    },

    _onDoubleClick: function(echartsEvent) {
      if(this.model.isDirty) {
        return;
      }

      this._onExecute(echartsEvent);
    },

    /** @override */
    _updateSize: function() {
      var size = this._getModelSize();
      var width = size.width, height = size.height;

      this._chart.resize({width: width, height: height});
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

    _getContinuousColorScale: function() {
      var model = this.model;
      var colorScale;

      var paletteQuantitative = model.paletteQuantitative;
      if(paletteQuantitative) {
        colorScale = paletteQuantitative.colors.toArray(function(color) { return color.value; });
      } else {
        colorScale = visualColorUtils.buildPalette(model.colorSet, model.pattern, model.reverseColors);
      }

      return colorScale;
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

    _onExecute: function (echartsEvent) {
      var model = this.model;
      var srcEvent = echartsEvent.event;
      var filter = this._createFilter(echartsEvent);
      if(filter === null) {
        return;
      }

      model.execute({
        dataFilter: filter,
        position: srcEvent ? {x: srcEvent.offsetX, y: srcEvent.offsetY} : null
      });
    },

    _onSelect: function(echartsEvent) {
      var model = this.model;
      var filter = this._createFilter(echartsEvent);
      if(filter === null) {
        return;
      }

      model.select({
        dataFilter: filter,
        selectionMode: "toggle"
      });
    },

    _createFilter: function(echartsEvent) {
      // This is needed when user clicks on `axisName`.
      // Only Radar uses axisName , for now.
      if(echartsEvent.targetType === "axisName") {
        return null;
      }

      var model = this.model;

      var varMap = echartsEvent.data.vars;
      var keyDataCellsMap = sceneUtil.invertVars(varMap, model);
      return dataUtil.createFilterFromCellsMap(keyDataCellsMap, model.data);
    },

     /** @override */
    _updateSelection: function() {
      var myChart = this._chart;
      var records = myChart.getOption().series[0].data;
      var selectionFilter = this.model.selectionFilter;
      var globalSelectionState = null;
      var modelData = this.model.data;
      var colorArray = this._echartOptions.color;
      var colorArrayLen = colorArray.length;

      if (selectionFilter === null ||
          selectionFilter.toDnf().kind === "false") {
        // Nothing is selected.
        globalSelectionState = SelectionStates.NoneSelected;  // 00
      }

      records.forEach(function(record, recordIndex) {
        var colorIndex = recordIndex % colorArrayLen;
        var color = colorArray[colorIndex];

        var selectionState;

        if (globalSelectionState === SelectionStates.NoneSelected) {
          selectionState = globalSelectionState;
        } else {
          var rowIndexes = record.rowIndexes || [recordIndex];
          var isSelected = rowIndexes.some( (rowIndex) => {
            return rowIndex != null && modelData.filterMatchesRow(selectionFilter, rowIndex);
          });

          if (isSelected) {
            // Among the selected
            selectionState = SelectionStates.AnySelected | SelectionStates.IsSelected; // 11
          } else {
            // Not among the selected
            selectionState = SelectionStates.AnySelected;
          }
        }

        this.__configureItemSelection(record, selectionState, color);
      }, this);

      myChart.setOption({
        series: [
          {
            data: records
          }
        ],
      });
    },

    __configureItemSelection: function(dataItem, selectionState, baseColor) {
      var isSelected = (selectionState & SelectionStates.IsSelected) !== 0;
      // Is Selected or Nothing Is Selected ?
      var isSelectedOrNoneIs = isSelected || selectionState === SelectionStates.NoneSelected;

        if (isSelectedOrNoneIs) {
          dataItem.itemStyle = {
            color: baseColor
          };
        } else {
          dataItem.itemStyle = {
            color: "#999999"
          };
        }
    },

    /** @inheritDoc */
    dispose: function() {

      this.__disposeChart();

      this.base();
    },

    /**
     * Disposes an existing eChart chart, along with
     * {@link https://github.com/ecomfe/zrender/blob/master/src/dom/HandlerProxy.ts#L525 removing}
     * event listeners.
     *
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
