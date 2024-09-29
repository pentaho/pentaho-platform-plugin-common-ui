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
  "pentaho/data/TableView",
  "pentaho/util/object",
  "pentaho/visual/util"
], function(module, BaseView, TableView, O, util) {

  "use strict";

  return BaseView.extend(module.id, {

    /** @override */
    _buildData: function() {
      var model = this.model;

      var dataTable = model.data;
      if(dataTable.originalCrossTable) {
        dataTable = dataTable.originalCrossTable.toPlainTable({skipRowsWithAllNullMeasures: true});
      }

      var visualMappings = {
        category: model.category.fieldIndexes,
        series: model.rows.fieldIndexes,
        measures: model.measures.fieldIndexes
      };

      var visualData = this._buildVisualData(dataTable, visualMappings);
      var radarIndicators = this._buildRadarIndicators(dataTable, visualMappings, visualData);
      return {
        indicator: radarIndicators,
        records: this._buildRadarRecords(dataTable, visualData, radarIndicators)
      };
    },

    _buildVisualData: function(dataTable, visualMappings) {
      var categoriesList = this._createEntityList();
      var seriesList = this._createEntityList();

      var rowCount = dataTable.getNumberOfRows();

      // Rows in visual space (where "fields"/columns and their values are the names and values of visual roles).
      var visualRows = new Array(rowCount);

      for(var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        var category = this._getRowVisualEntity(dataTable, rowIndex, visualMappings.category, categoriesList);
        var series = this._getRowVisualEntity(dataTable, rowIndex, visualMappings.series, seriesList);

        visualRows[rowIndex] = {
          category: category,
          series: series
        };
      }

      return {
        rows: visualRows,
        categories: categoriesList,
        series: seriesList
      };
    },

    _createEntityList: function() {
      var list = [];
      list.set = Object.create(null);
      return list;
    },

    _getRowVisualEntity: function(dataTable, rowIndex, colIndexes, entityList) {
      var value = dataTable.getCompositeValue(rowIndex, colIndexes, this.groupedLabelSeparator);
      var key = O.getSameTypeKey(value);

      var entity = O.getOwn(entityList.set, key);
      if(entity == null) {
        var label = dataTable.getCompositeFormattedValue(rowIndex, colIndexes, this.groupedLabelSeparator);
        var cells = dataTable.getRowCells(rowIndex, colIndexes);
        entity = {
          key: key,
          value: value,
          cells: cells,
          label: label,
          rowIndexes: []
        };
        entityList.set[entity.key] = entity;
        entityList.push(entity);
      }

      // Do not register the "virtual" null entity.
      var isDataBound = colIndexes.length > 0;
      if(isDataBound) {
        entity.rowIndexes.push(rowIndex);
      }

      return entity;
    },

    _getEntityTableView: function(entity, dataTable) {
      var view = new TableView(dataTable);
      if(entity.rowIndexes.length > 0) {
        // Not the null series case.
        view.setSourceRows(entity.rowIndexes);
      }

      return view;
    },

    _buildRadarIndicators: function(dataTable, visualMappings, visualData) {
      var indicators = [];

      // One indicator/axis per category value x measure name

      visualData.categories.forEach(function(category) {
        var categoryTableView = this._getEntityTableView(category, dataTable);

        // When  category is not mapped, do not include the category label.
        // Example: "Cars~"
        var categoryLabelPrefix = category.label ? (category.label + this.groupedLabelSeparator) : "";

        visualMappings.measures.forEach(function(measureColIndex) {
          // Example: "Quantity"
          var measureLabel = dataTable.getColumnLabel(measureColIndex);
          indicators.push({
            // Example: "Cars~Quantity"
            name: categoryLabelPrefix + measureLabel,
            max: this._getColumnRange(categoryTableView, measureColIndex, false).max,

            // Store these aux/cookie properties to help later build the Radar records.
            _category: category,
            _measure: measureColIndex
          });
        }, this);
      }, this);

      return indicators;
    },

    _buildRadarTooltip: function(tooltipString) {
      var font = util.getDefaultFont(null, 12);
      return this._buildTooltip(tooltipString, font);
    },

    _buildRadarRecords: function(dataTable, visualData, radarIndicators) {
      var records = [];

      // A record stands for a line of dots.
      // One record per series value.
      // Each record has one point per category value x measure name.

      visualData.series.forEach(function(seriesEntity) {
        var seriesTableView = this._getEntityTableView(seriesEntity, dataTable);
        records.push(buildRecord.call(this, seriesEntity, seriesTableView));
      }, this);

      return records;

      function buildRecord(seriesEntity, seriesTableView) {
        var values = [];
        var labels = [];
        var rowIndexes = [];
        var record = {
          // May be "" for the virtual null series.
          name: seriesEntity.label,

          // For Radar, click event handler params do not contain the information about the
          // data point that is clicked. It gives the entire series data.
          // Because of which tooltip also shows the entire series data
          // and Chart Interactions ( Select and Execute ) are using Series'
          // visual key instead of a combination of series key and category key.
          // Reference: https://github.com/apache/echarts/issues/16160 &
          // https://github.com/apache/echarts/issues/10537#issuecomment-608339356
          vars: {"rows": this._getCellsValues(seriesEntity.cells)},

          value: values,
          _label: labels,
          rowIndexes: rowIndexes
        };

        function escapeHTML(str) {
          var elem = document.createElement("e");
          elem.appendChild(document.createTextNode(str));
          return elem.innerHTML;
        }

        var tooltipString = record.name !== "" ? (escapeHTML(record.name) + "<br />") : "";

        // Given that series x category together form the
        // [visual key]{@link pentaho.visual.role.AbstractPropertyType#isVisualKey},
        // there can be a single data row per series and category combination.
        // Because of this, there's no need to sum measures for a series x category combination.
        // The value of the measure for the single data row can be used directly.

        // 1st phase.
        // Create a map/index from category key to row index.
        var rowIndexByCategory = buildSeriesRowIndexByCategory(seriesTableView);

        // 2nd phase.
        // Now build the record values ECharts structure in the same order
        // of the overall categories entities x measures,
        // matching the order of indicators/axes.
        radarIndicators.forEach(function(indicator) {
          var category = indicator._category;
          var measureColIndex = indicator._measure;
          var rowIndex = O.getOwn(rowIndexByCategory, category.key);

          var value = rowIndex != null
            ? dataTable.getValue(rowIndex, measureColIndex)
            : null;
          var label = rowIndex != null
            ? dataTable.getFormattedValue(rowIndex, measureColIndex)
            : "";
          values.push(value);
          labels.push(label);
          tooltipString = tooltipString + escapeHTML(indicator.name) + " : " + escapeHTML(label) + "<br />";
          rowIndexes.push(rowIndex);
        });

        record.tooltip = this._buildRadarTooltip(tooltipString);

        return record;
      }

      function buildSeriesRowIndexByCategory(seriesTableView) {
        var rowIndexByCategory = Object.create(null);
        var rowCount = seriesTableView.getNumberOfRows();
        for(var rowViewIndex = 0; rowViewIndex < rowCount; rowViewIndex++) {
          // Recover the corresponding visual row.
          var rowIndex = seriesTableView.getSourceRowIndex(rowViewIndex);
          var visualRow = visualData.rows[rowIndex];

          rowIndexByCategory[visualRow.category.key] = rowIndex;
        }

        return rowIndexByCategory;
      }
    },

    _configureOptions: function() {
      this.base();

      var options = this._echartOptions;
      var model = this.model;
      var radarData = this._echartData;

      var fontWeight = this._getFontWeight(model.labelStyle);
      var fontFamily = this._getFontFamily(model.labelFontFamily);

      options.radar = {
        indicator: radarData.indicator,
        triggerEvent: true,
        shape: model.radarShape,
        axisName: {
          color: model.labelColor || this.fontColor,
          fontWeight: fontWeight,
          fontSize: model.labelSize || this.fontSize,
          fontFamily: fontFamily,
          formatter: function(value) {
            var maxLength = 14;
            var words = value.split(" ");
            var formattedTextLength = 0;
            var formattedText = "";
            for(var token of words) {
              if(formattedTextLength + token.length >= maxLength) {
                formattedText += (formattedTextLength ? "\n" : "") + token + " ";
                formattedTextLength = token.length + 1;
              } else {
                formattedText += token + " ";
                formattedTextLength += token.length + 1;
              }
            }

            return formattedText;
          }
        },
        axisLabel: {
          show: model.showAxisTickLabel,
          color: model.labelColor || this.fontColor,
          fontWeight: fontWeight,
          fontSize: model.labelSize || this.fontSize,
          fontFamily: fontFamily,
          showMinLabel: radarData.indicator.length < 3,
          formatter: function(value) {
            return Intl.NumberFormat("en-US", {
              notation: "compact",
              maximumFractionDigits: 2,
              compactDisplay: "short"
            }).format(value);
          }
        }
      };

      this._configureLegend(options, radarData.records);
    },

    /** @override */
    _buildSeries: function(echartData) {
      var model = this.model;
      var label = this._configureLabel(this._getEChartsLabel(model.labelsOption),
       function(params) {
          return params.data._label[params.dimensionIndex];
        });

      return [
        {
          name: "Radar Series",
          type: "radar",
          data: echartData.records,
          selectedMode: "multiple",
          label: label,
          labelLayout: {
            hideOverlap: "true"
          },
          emphasis: {
            focus: "self"
          },
          symbol: model.shape,
          areaStyle: {opacity: model.showArea ? 0.7 : 0},
          lineStyle: {width: model.lineWidth}
        }
      ];
    }
  }).implement(module.config);
});
