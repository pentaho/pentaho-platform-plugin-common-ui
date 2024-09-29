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

    /** @override */
    _buildSeries: function(echartData) {
      var dataTable = this.model.data;
      var range = dataTable.getColumnRange(dataTable.getNumberOfColumns() - 1);
      var label = this._configureLabel(this._getEChartsLabel(this.model.labelsOption), "{b}: {d}%");

      return [
        {
          type: "funnel",
          left: "20%",
          right: "20%",
          top: "10%",
          data: echartData,
          selectedMode: "multiple",
          label: label,
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
            borderWidth: 0
          },
          emphasis: {
            label: {
              fontSize: 20
            }
          }
        }
      ];
    },

    /** @override */
    _buildData: function() {
      var dataTable = this.model.data;

      if(dataTable.originalCrossTable) {
        dataTable = dataTable.originalCrossTable.toPlainTable({skipRowsWithAllNullMeasures: true});
      }

      var rowLength = dataTable.getNumberOfRows();
      var categoriesColIndexes = this.model.rows.fieldIndexes;
      var measureColIndex = this.model.measures.fieldIndexes[0];
      var font = util.getDefaultFont(null, 12);

      var records = [];

      // Read data from dataTable and push it to records
      for(var i = 0; i < rowLength; i++) {
        records.push({
          name: dataTable.getCompositeFormattedValue(i, categoriesColIndexes, this.groupedLabelSeparator),
          value: dataTable.getValue(i, measureColIndex),
          tooltip: this._buildTooltip(this._buildRowTooltipHtml(dataTable, i), font),
          vars: {"rows": this._getCellsValues(dataTable.getRowCells(i, categoriesColIndexes))}
        });
      }

      return records;
    },

    /** @override */
    _configureOptions: function() {

      this.base();

      this._configureLegend(this._echartOptions, this._echartData);
    }
  })
  .implement(module.config);
});
