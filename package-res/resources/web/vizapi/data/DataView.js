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
define(['./AbstractDataTable', './DataTable'], function(AbstractDataTable, DataTable) {
  /**
   * @module common-ui.vizapi.data
   */

  /**
   * A **data view** is an object that
   * provides a way to access a subset of a source table.
   *
   * #### AMD
   *
   * **Module Id**: `"common-ui/vizapi/data/DataView"`
   *
   * **Module Type**: The {{#crossLink "DataView"}}{{/crossLink}} constructor.
   *
   * #### Description
   *
   * A data view can selectively show rows and/or columns from the source table
   * through use of the
   * {{#crossLink "DataView/setRows:method"}}{{/crossLink}}
   * and {{#crossLink "DataView/setColumns:method"}}{{/crossLink}} methods,
   * respectively.
   * Columns can also be hidden by using the
   * {{#crossLink "DataView/hideColumns:method"}}{{/crossLink}},
   * a variant that preserves already hidden columns.
   *
   * @class DataView
   * @extends AbstractDataTable
   * @constructor
   * @param {AbstractDataTable} table The source table.
   */
  function DataView(table) {
    if(!table) throw new Error("Argument 'table' is required.");
    this._source = table;

    this._rows    = null;
    this._columns = this._getSourceColumns();
  }

  DataView.prototype = new AbstractDataTable();
  DataView.prototype.constructor = DataView;

  // ====
  // Implement abstract class

  DataView.prototype._getColumn = function(colIdx) {
    return this._source._getColumn(this.getTableColumnIndex(colIdx));
  };

  DataView.prototype._getRow = function(rowIdx) {
    return this._source._getRow(this.getTableRowIndex(rowIdx));
  };

  DataView.prototype._getCell = function(rowIdx, colIdx) {
    return this._source._getCell(this.getTableRowIndex(rowIdx), this.getTableColumnIndex(colIdx));
  };

  DataView.prototype.getNumberOfColumns = function() {
    return this._columns.length;
  };

  DataView.prototype.getNumberOfRows = function() {
    return this._rows ? this._rows.length : this._source.getNumberOfRows();
  };

  // ====
  // COLS

  /*
   * Gets an array with all source column indexes.
   *
   * @method _getSourceColumns
   * @return {Array} An array of source column indexes.
   */
  DataView.prototype._getSourceColumns = function() {
    var C = this._source.getNumberOfColumns(),
        cols = new Array(C),
        j;

    for(j = 0; j < C; j++) cols[j] = j;

    return cols;
  };

  /**
   * Gets the source column index corresponding to a given view column index.
   *
   * @method getTableColumnIndex
   * @param {Number} colIdx The view column index.
   * @return {Number} The source column index.
   * @since 3.0
   */
  DataView.prototype.getTableColumnIndex = function(colIdx) {
    return this._columns[colIdx];
  };

  /**
   * Sets the indexes of the visible source columns.
   *
   * The column indexes do not have to match the order of columns in the source table.
   * However, these must be within the range of valid source column indexes.
   *
   * If this method is not called or is called with a `null` or `undefined` value in the `columns` argument,
   * all of the source columns are made visible.
   *
   * @method setColumns
   * @param {Array} [columns] An array of source column indexes.
   * @chainable
   */
  DataView.prototype.setColumns = function(columns) {
    this._columns = columns ? columns.slice() : this._getSourceColumns();
    return this;
  };

  /**
   * Gets the indexes of the visible source columns.
   *
   * Do **NOT** modify the returned array directly.
   *
   * @method getViewColumns
   * @return {Array} The array of source column indexes.
   * @since 3.0
   */
  DataView.prototype.getViewColumns = function() {
    return this._columns;
  };

  /**
   * Hides columns, given their **source** indexes.
   *
   * It is allowed to specify a column that is already hidden.
   *
   * @method hideColumns
   * @param columns An array of source column indexes to hide.
   * @chainable
   */
  DataView.prototype.hideColumns = function(columns) {
    var cols = this._columns;
    if(cols.length) {
      var hideColsMap = {},
          j;

      // Index the indexes of the specified columns to be hidden.
      j = columns.length;
      while(j--)  hideColsMap[columns[j]] = 1;

      // Remove those indexes from the current visible columns.
      j = cols.length;
      while(j--)
        if(hideColsMap[cols[j]] === 1)
          cols.splice(j, 1);
    }

    return this;
  };

  DataView.prototype.addColumn = function(colSpec) {
    var colIdx = this._source.addColumn(colSpec);
    return this._columns.push(colIdx) - 1;
  };

  // ====
  // ROWS

  /**
   * Gets the source row index corresponding to a given view row index.
   *
   * @method getTableRowIndex
   * @param {Number} rowIdx The view row index.
   * @return {Number} The source row index.
   * @since 3.0
   */
  DataView.prototype.getTableRowIndex = function(rowIdx) {
    return this._rows ? this._rows[rowIdx] : rowIdx;
  };

  /**
   * Sets the indexes of the source rows to show in the view.
   *
   * The row indexes do not have to match the order of rows in the source table.
   *
   * If this method is not called, or is called with a `null` value,
   * all of the source rows are included.
   *
   * The row indexes must be within the range of valid row indexes of the source table.
   *
   * @method setRows
   * @param {Array} [rows=null] An array of source row indexes.
   * @chainable
   */
  DataView.prototype.setRows = function(rows) {
    this._rows = rows || null;
    return this;
  };

  /**
   * Gets the indexes of the visible source rows.
   *
   * Do **NOT** modify the returned array directly.
   *
   * @method getViewRows
   * @return {Array|Null} The array of source row indexes or `null`, if one has not been set.
   * @since 3.0
   */
  DataView.prototype.getViewRows = function() {
    return this._rows;
  };

  // -----
  // TABLE

  /*
   * Gets the view's source table.
   *
   * @method getSourceTable
   * @return {AbstractDataTable} The source table.
   * @since 3.0
   */
  DataView.prototype.getSourceTable = function() {
    return this._source;
  };

  /**
   * Gets a {{#crossLink "DataTable"}}{{/crossLink}} loaded with the
   * data view's visible rows and columns.
   *
   * This is a convenience method for abbreviating:
   *
   *      var dataTable = new DataTable(thisDataView.toJSON());
   *
   * @method toDataTable
   * @return {DataTable} A data table.
  */
  DataView.prototype.toDataTable = function() {
    return new DataTable(this.toJSON());
  };

  return DataView;
});
