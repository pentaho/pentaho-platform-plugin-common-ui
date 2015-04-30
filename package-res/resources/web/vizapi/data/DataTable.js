/*!
* Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
define(['./AbstractDataTable'], function(AbstractDataTable) {
  /**
   * @module common-ui.vizapi.data
   */

  /**
   * A {{#crossLink "DataTable"}}{{/crossLink}} is a
   * type of table that directly stores tabular data.
   *
   * A `DataTable` can be constructed empty, or from either:
   * * a {{#crossLink "AbstractDataTable"}}{{/crossLink}} object,
   *   in which case its data is copied, or
   * * a plain JavaScript object having one of the supported data formats:
   *   _DataTable_ or _CDA_.
   *
   * @example
   * To create a `DataTable` from a plain JavaScript object in _DataTable_ format:
   *
   *     var dataTable = new DataTable({
   *       cols: [
   *         {id: "col1", type: "string", label: "Column 1"},
   *         {id: "col2", type: "number", label: "Column 2"},
   *       ],
   *       rows: [
   *         {c: [ {v: "row1", f: "Row 1"}, 123] },
   *         {c: [ {v: "row2", f: "Row 1"}, {v: 456}] }
   *       ]
   *     });
   *
   * @example
   * To create a `DataTable` from a plain JavaScript object in _CDA_ format:
   *
   *     var dataTable = new DataTable({
   *       metadata: [
   *         {colName: "col1", colType: "STRING",  colLabel: "Column 1"},
   *         {colName: "col2", colType: "NUMERIC", colLabel: "Column 2"}
   *       ],
   *       resultset: [
   *         ["Row1", 123],
   *         ["Row2", 456]
   *       ]
   *     });
   *
   * @example
   * To create a `DataTable` with a copy of the data
   * in a `DataTable` or `DataView` object,
   * use the copy constructor variant:
   *
   *     var dataTable = new DataTable(dataTableOrView);
   *
   * @class DataTable
   * @extends AbstractDataTable
   * @constructor
   * @param {Object|AbstractDataTable} [table]
   *    An instance of {{#crossLink "AbstractDataTable"}}{{/crossLink}} or
   *    a plain JavaScript object in a supported data format.
   */
  function DataTable(table) {
    this._jsonTable =
      !table ? {cols: [], rows: []} :
      table instanceof AbstractDataTable ? table.toJSON() :
      table.metadata ? DataTable.convertCdaToDataTable(table) :
      table;
  }

  DataTable.prototype = new AbstractDataTable();
  DataTable.prototype.constructor = DataTable;

  // ====
  // Abstract class implementation

  DataTable.prototype._getColumn = function(colIdx) {
    return this._jsonTable.cols[colIdx];
  };

  DataTable.prototype._getRow = function(rowIdx) {
    return this._jsonTable.rows[rowIdx];
  };

  DataTable.prototype._getCell = function(rowIdx, colIdx) {
    return this._jsonTable.rows[rowIdx].c[colIdx];
  };

  DataTable.prototype.getNumberOfColumns = function() {
    return this._jsonTable.cols.length;
  };

  DataTable.prototype.getNumberOfRows = function() {
    return this._jsonTable.rows.length;
  };

  // =====
  // TABLE

  // Map of CDA lowercase colType to DataTable type
  var COLTYPE_CDA_DT = {
    'numeric': 'number',
    'integer': 'number'
  };

  /**
   * Converts a table in plain JavaScript object, in _CDA_ format, to _DataTable_ format.
   *
   * @example
   * If the _CDA_ table object is:
   *
   *     {
   *        metadata: [
   *          {colName: "country", colType: "STRING",  colLabel: "Country"},
   *          {colName: "sales",   colType: "NUMERIC", colLabel: "Sales"  }
   *        ],
   *        resultset: [
   *          ["Portugal", 12000],
   *          ["Ireland",   6000]
   *        ]
   *     }
   *
   * the resulting table object in _DataTable_ format is:
   *
   *     {
   *       cols: [
   *         {id: "country", type: "string", label: "Country"},
   *         {id: "sales",   type: "number", label: "Sales"  },
   *       ],
   *       rows: [
   *         {c: [ {v: "Portugal"}, {v: 12000}] },
   *         {c: [ {v: "Ireland" }, {v:  6000}] }
   *       ]
   *     }
   *
   * @method convertCdaToDataTable
   * @static
   * @param {Object} cdaTable A table object in _CDA_ format.
   * @return {Object} A table object in _DataTable_ format.
   */
  DataTable.convertCdaToDataTable = function(cdaTable) {
    var cdaCols = cdaTable.metadata,
        cdaRows = cdaTable.resultset,
        C = cdaCols.length,
        R = cdaRows.length,
        cols = new Array(C),
        rows = new Array(R),
        j;

    // Columns
    j = -1;
    while(++j < C) {
      var cdaCol  = cdaCols[j],
          colType = String(cdaCol.colType || 'string').toLowerCase();

      if(COLTYPE_CDA_DT.hasOwnProperty(colType))
        colType = COLTYPE_CDA_DT[colType];

      cols[j] = {
        id:    cdaCol.colName,
        type:  colType,
        label: cdaCol.colLabel || cdaCol.colName
      };
    }

    // Rows
    var i = -1;
    while(++i < R) {
      var cdaRow = cdaRows[i], cells = new Array(C);

      // Copy cells
      j = C;
      while(j--) {
        var v = cdaRow[j];
        cells[j] = v == null ? null : // direct null
                   (typeof v === 'object') && ('v' in v) ? v : // direct cell
                   {v: v, f: null}; // value to cell
      }

      rows[i] = {c: cells};
    }

    return {cols: cols, rows: rows};
  };

  /**
   * Gets the underlying plain object in DataTable format,
   * that contains the current data in the data table.
   *
   * Do **NOT** modify the returned data structure.
   *
   * This method is deprecated.
   * You can use {{#crossLink "AbstractDataTable/toJSON:method"}}{{/crossLink}}
   * to get a copy of the contained data,
   * or use the methods that access each table component directly.
   *
   * @method getJsonTable
   * @return {Object} The JSON-like data object.
   * @deprecated Use method "toJSON" instead.
   */
  DataTable.prototype.getJsonTable = function() {
    return this._jsonTable;
  };

  // ====
  // COLS
  DataTable.prototype.addColumn = function(colSpec) {
    var j = this._jsonTable.cols.push({
       id:    colSpec.id,
       type:  colSpec.type,
       label: colSpec.label,
    }) - 1;

    // Set all rows to null
    var rows = this._jsonTable.rows,
        R = rows.length;
    if(R) {
      var i = -1;
      while(++i < R) rows[i].c[j] = null;
    }

    return j;
  };

  // ====
  // ROWS

  /**
   * Filters the rows of the table using the specified filters.
   * Returns an array of the row indexes that meet the filter criteria.
   *
   * The result can be passed to
   * {{#crossLink "DataView/setRows:method"}}{{/crossLink}}
   * to obtain a filtered table.
   *
   * When no value filters are specified, all rows will be included in the output.
   *
   * @example
   * To filter on column 0 == 'France':
   *
   *     var rows = dataTable.getFilteredRows({column: 0, value: 'France'});
   *     var view = new DataView(dataTable);
   *     view.setRows(rows);
   *
   * @method getFilteredRows
   * @param {Array} filters The filters array.
   * @return {Array} An array of row indexes of the rows that meet the filter requirements.
  */
  DataTable.prototype.getFilteredRows = function(filters) {
    var rows = [],
        R = this.getNumberOfRows();

    // Any data?
    if(R) {
      // Process filters
      var valuePredicate = DataTable_buildFilteredRowsPredicate.call(this, filters),
          i = -1;

      // Filter
      while(++i < R)
        if(!valuePredicate || valuePredicate.call(this, i))
          rows.push(i);
    }

    return rows;
  };

  // Conjunction of all value filters, if any.
  function DataTable_buildFilteredRowsPredicate(valueFilters) {
    var F = valueFilters.length;

    // (rowIdx: number) -> boolean
    if(F) return function(rowIdx) {
      for(var f = 0; f < F; f++) {
        var filter = valueFilters[f],
            v = filter.value;
        if(v !== undefined && !this.isValueEqual(this.getValue(rowIdx, filter.column), v))
          return false;
      }
      return true;
    };
  }

  return DataTable;
});
