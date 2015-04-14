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
*
*/

pentaho = typeof pentaho == "undefined" ? {} : pentaho;

/**
 * Pentaho JavaScript Visualization Data APIs.
 *
 * This module defines interfaces and classes
 * used by visualizations for data representation and manipulatation.
 *
 * @module common-ui.vizapi.data
 * @main common-ui.vizapi.data
 */

/**
 * An _AbstractDataTable_ represents a set of tabular data.
 *
 * @class AbstractDataTable
 * @constructor
 */
 pentaho.AbstractDataTable = function AbstractDataTable() {};

/**
 * Gets a column object, given its index.
 *
 * @method _getColumn
 * @param {Number} colIdx The column index (zero-based).
 * @return {Object} The column object.
 * @protected
 */

/**
 * Gets a row object, given its index.
 *
 * @method _getRow
 * @param {Number} rowIdx The row index (zero-based).
 * @return {Object} The row object.
 * @protected
 */

/**
 * Gets a cell, given its row and column index.
 *
 * @method _getCell
 * @param {Number} rowIdx The cell's row index (zero-based).
 * @param {Number} colIdx The cell's column index (zero-based).
 * @return {Null|Object} The cell.
 * @protected
 */

/**
 * Gets the number of columns.
 *
 * @method getNumberOfColumns
 * @return {Number} The number of columns.
 */

/**
 * Gets the number of rows.
 *
 * @method getNumberOfRows
 * @return {Number} The number of rows.
 */

// NOTE: Not publicizing the add method yet, as it is not unit-tested,
// and would need many other methods to be complete:
// addRow, addRows, setCell, setValue, setFormattedValue, ...
// Used internally for the createTrend method.

/*
 * Appends a new column to the table, given its specification.
 *
 * For data views,
 * this method adds a column to the nearest `DataTable`
 * and makes the column visible in the intervening views.
 *
 * In all existing rows, the value of the new column will be set to `null`.
 *
 * @method addColumn
 * @param {Object} colSpec The column specification.
 * @param {String} colSpec.id The id of the column.
 * @param {String} [colSpec.type="string"]  The data type of the column's values.
 * @param {String} [colSpec.label] The label of the column.
 * @return {Number} The index of the new column.
 */

// TODO: metadata/properties on column/cell/row/table should be stored in a metadata bag, property "p".
// However, any change must be performed in tandem with Analyzer server-side placement of
// the "dataReq", "geoRole column property (See GoogleVisualizationRender.renderDataTable).
// Deferred to when we touch server-side, during DataTable extensions work.

pentaho.AbstractDataTable.prototype.isValueEqual = function(a, b) {
  return (a === b) ||
         (a == null && b == null) ||
         (typeof a === 'number' && isNaN(a) && typeof b === 'number' && isNaN(b));
};

// ----
// COLS

/**
 * Gets the data type of the values of a column, given its index.
 *
 * DataType values are always delivered in lower case
 * (whatever the initially provided casing).
 *
 * The recognized data type values are:
 * * `"string"` — values are such that `typeof value === "string"`
 * * `"number"` — values are such that `typeof value === "number"`
 * * `"boolean"` — values are such that `typeof value === "boolean"`
 *
 * @method getColumnType
 * @param {Number} colIdx The column index (zero-based).
 * @return {String} The data type of the column's values.
 */
pentaho.AbstractDataTable.prototype.getColumnType = function(colIdx) {
  var type = this._getColumn(colIdx).type;
  return type ? type.toLowerCase() : "string";
};

/**
 * Gets the id of the data property stored in a column, given its index.
 *
 * @method getColumnId
 * @param {Number} colIdx The column index (zero-based).
 * @return {String} The column's data property id.
 */
pentaho.AbstractDataTable.prototype.getColumnId = function(colIdx) {
  return this._getColumn(colIdx).id;
};

/**
 * Gets the label of the data property stored in a column, given its index.
 *
 * @method getColumnLabel
 * @param {Number} colIdx The column index (zero-based).
 * @return {String} The column's data property label.
 */
pentaho.AbstractDataTable.prototype.getColumnLabel = function(colIdx) {
  return this._getColumn(colIdx).label;
};

/**
 * Gets the value of a column property.
 *
 * @method getColumnProperty
 * @param {Number} colIdx The column index (zero-based).
 * @param {String} name  The name of the property.
 * @return {any} The property value.
 */
pentaho.AbstractDataTable.prototype.getColumnProperty = function(colIdx, name) {
  return this._getColumn(colIdx)[name];
};

/**
 * Sets the value of a column property.
 *
 * @method setColumnProperty
 * @param {Number} colIdx The column index (zero-based).
 * @param {String} name  The name of the property.
 * @param {any}    value The value of the property.
 * @chainable
 */
pentaho.AbstractDataTable.prototype.setColumnProperty = function(colIdx, name, value) {
  this._getColumn(colIdx)[name] = value;
  return this;
};

// TODO: Cache results when no key function is specified.

/**
 * Gets the value range of a column, given its index.
 *
 * When there is no data, or all data is `null`, `undefined` or `NaN`,
 * the returned range object will have both of its properties, `min` and `max`,
 * with the value `undefined`.
 *
 * This method can be applied meaningfully to columns having a `"number"` or `"string"` data type
 * (or whose specified `options.key` function evaluates to such types of values).
 * When the data type is `"string"`, the comparison is lexicographical.
 *
 * @example
 *     {min: 123, max: 456}
 *
 * @method getColumnRange
 * @param {Number} colIdx The column index (zero-based).
 * @param {Object} [options] A keyword arguments object.
 * @param {Function} [options.key] A function that derives values from the actual column values.
 * @return {Object} A non-null range object.
 */
pentaho.AbstractDataTable.prototype.getColumnRange = function(colIdx, options) {
  var set = false,
      key = options && options.key,
      i = 0,
      R = this.getNumberOfRows(),
      min, max; // = undefined

  while(i < R) {
    var value = this.getValue(i++, colIdx);
    if(value != null && ((typeof value !== "number") || !isNaN(value))) {
      if(key) {
        value = key(value);
        if(value == null || isNaN(value)) continue;
      }

      if(!set) {
        min = max = value;
        set = true;
      } else {
        if(value < min) min = value;
        if(value > max) max = value;
      }
    }
  }

  return {min: min, max: max};
};

/**
 * Gets an array of the distinct values of a column, given its index.
 *
 * Values are obtained by calling
 * {{#crossLink "AbstractDataTable/getValue:method"}}{{/crossLink}} on each cell.
 *
 * The distinct values are returned in order of first occurrence (not sorted).
 *
 * The values `null` and `NaN` are treated just like other values and
 * can thus be returned.
 *
 * @method getDistinctValues
 * @param {Number} colIdx The column index (zero-based).
 * @return {Array} A non-null array with the distinct values.
 */
pentaho.AbstractDataTable.prototype.getDistinctValues = function(colIdx) {
  return this._getDistinctValuesCore(colIdx, /*formatted:*/false);
};

/**
 * Gets an array of the distinct _formatted_ values of a column, given its index.
 *
 * Formatted values are obtained by calling
 * {{#crossLink "AbstractDataTable/getFormattedValue:method"}}{{/crossLink}} on each cell.
 *
 * The distinct formatted values are returned in order of first occurrence (not sorted).
 *
 * The value `null` is treated just like other values and can thus be returned.
 *
 * @method getDistinctFormattedValues
 * @param {Number} colIdx The cell's column index (zero-based).
 * @return {Array} A non-null array with the distinct formatted values.
 */
pentaho.AbstractDataTable.prototype.getDistinctFormattedValues = function(colIdx) {
  return this._getDistinctValuesCore(colIdx, /*formatted:*/true);
};

pentaho.AbstractDataTable.prototype._getDistinctValuesCore = function(colIdx, formatted) {
  var values = [],
      keyMap = {},
      i = 0,
      R = this.getNumberOfRows(),
      getValue = formatted ? this.getFormattedValue : this.getValue,
      value, key;

  while(i < R) {
    value = getValue.call(this, i++, colIdx);
    key   = (typeof value) + ":" + value;
    if(keyMap[key] !== 1) {
      keyMap[key] = 1;
      values.push(value);
    }
  }

  return values;
};

// =====
// CELLS

/**
 * Gets the value of a cell, given its row and column index.
 *
 * When a cell is missing or has a `null` or `undefined` value,
 * then `null` is returned.
 *
 * @method getValue
 * @param {Number} rowIdx The cell's row index (zero-based).
 * @param {Number} colIdx The cell's column index (zero-based).
 * @return {Null|Boolean|Number|String} The cell's value.
 */
pentaho.AbstractDataTable.prototype.getValue = function(rowIdx, colIdx) {
  var cell = this._getCell(rowIdx, colIdx),
      v;

  return cell         ==  null      ? null :
         (typeof cell !== "object") ? cell :
         (v = cell.v) !=  null      ? v    :
         null;
};

/**
 * Gets a _copy_ of a cell, given its row and column index.
 *
 * The value `null` is returned when:
 * 1. a cell is missing, or
 * 2. a cell has both a _nully_ value and formatted value properties
 *    (where _nully_ means `null`or `undefined`).
 *
 * @method getCell
 * @param {Number} rowIdx The cell's row index (zero-based).
 * @param {Number} colIdx The cell's column index (zero-based).
 * @return {Null|Object} A copy of the cell or `null`.
 */
pentaho.AbstractDataTable.prototype.getCell = function(rowIdx, colIdx) {
  var cell = this._getCell(rowIdx, colIdx);
  if(cell == null) return null;
  if(typeof cell !== "object") return {v: cell, f: null};

  var v = cell.v, f = cell.f;
  if(v == null && f == null) return null;
  return {
    v: v == null ? null : v,
    f: f == null ? null : String(f)
  };
};

/**
 * Gets the formatted value of a cell, given its row and column index.
 *
 * If the cell has a specified formatted value,
 * then the string representation of that value is returned.
 *
 * Otherwise, if the cell has a specified value,
 * then the string representation of that value is returned.
 *
 * **Note**: When both the cell's formatted value and value are `null`or `undefined`,
 * then `null` is returned.
 *
 * Contrast this method with {{#crossLink "AbstractDataTable/getLabel:method"}}{{/crossLink}},
 * that only returns a formatted value when one has been explicitly defined in the cell's `f` property.
 *
 * @method getFormattedValue
 * @param {Number} rowIdx The cell's row index (zero-based).
 * @param {Number} colIdx The cell's column index (zero-based).
 * @return {Null|String} The cell's formatted value.
 */
pentaho.AbstractDataTable.prototype.getFormattedValue = function(rowIdx, colIdx) {
  var cell = this._getCell(rowIdx, colIdx),
      f;

  return cell == null ? null :
         (((f = cell.f) != null) || ((f = cell.v) != null))  ? String(f) :
         (typeof cell === 'object') ? null :
         String(cell);
};

/**
 * Gets the formatted value _property_ of a cell, given its row and column index.
 *
 * This method returns the string representation of the value of the cell's `f` property,
 * when the value is defined, or `null`, otherwise.
 *
 * Contrast this method with {{#crossLink "AbstractDataTable/getFormattedValue:method"}}{{/crossLink}},
 * that returns a best-effort formatted value in all cases,
 * except for `null` or `undefined` values.
 *
 * @method getLabel
 * @param {Number} rowIdx The cell's row index (zero-based).
 * @param {Number} colIdx The cell's column index (zero-based).
 * @return {Null|String} The specified formatted value or `null`.
 * @since 3.0
 */
pentaho.AbstractDataTable.prototype.getLabel = function(rowIdx, colIdx) {
  var cell = this._getCell(rowIdx, colIdx),
      f;

  return cell != null && (f = cell.f) != null ? String(f) : null;
};

// -----
// TABLE

/**
 * Gets a table plain-object, in DataTable format.
 *
 * See also: {{#crossLink "DataView/toDataTable:method"}}{{/crossLink}}.
 *
 * @method toJSON
 * @return {Object} A table plain-object.
 * @since 3.0
 */
pentaho.AbstractDataTable.prototype.toJSON = function() {
  var C = this.getNumberOfColumns(),
      cols = new Array(C),
      j = -1;

  while(++j < C) {
    // Copy, to preserve any metadata.
    var srcCol = this._getColumn(j),
        col    = cols[j] = {};
    for(var p in srcCol)
      if(srcCol.hasOwnProperty(p))
        col[p] = srcCol[p];
  }

  var R = this.getNumberOfRows(),
      rows = new Array(R),
      i = -1,
      cells;

  while(++i < R) {
    cells = new Array((j = C));

    while(j--) cells[j] = this.getCell(i, j);

    rows[i] = {c: cells};
  }

  return {cols: cols, rows: rows};
};

// ---------------

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
pentaho.DataTable = function DataTable(table) {
  this._jsonTable =
    !table ? {cols: [], rows: []} :
    table instanceof pentaho.AbstractDataTable ? table.toJSON() :
    table.metadata ? pentaho.DataTable.convertCdaToDataTable(table) :
    table;
};

pentaho.DataTable.prototype = new pentaho.AbstractDataTable();
pentaho.DataTable.prototype.constructor = pentaho.DataTable;

// ====
// Abstract class implementation

pentaho.DataTable.prototype._getColumn = function(colIdx) {
  return this._jsonTable.cols[colIdx];
};

pentaho.DataTable.prototype._getRow = function(rowIdx) {
  return this._jsonTable.rows[rowIdx];
};

pentaho.DataTable.prototype._getCell = function(rowIdx, colIdx) {
  return this._jsonTable.rows[rowIdx].c[colIdx];
};

pentaho.DataTable.prototype.getNumberOfColumns = function() {
  return this._jsonTable.cols.length;
};

pentaho.DataTable.prototype.getNumberOfRows = function() {
  return this._jsonTable.rows.length;
};

// =====
// TABLE

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
pentaho.DataTable.convertCdaToDataTable = function(cdaTable) {
  var cdaCols = cdaTable.metadata,
      cdaRows = cdaTable.resultset,
      C = cdaCols.length,
      R = cdaRows.length,
      cols = new Array(C),
      rows = new Array(R),
      j;

  // TODO: Move this constant object out to closure space upon AMD conversion!
  // CDA lowercase -> DT
  var colTypeMap = {
    'numeric': 'number',
    'integer': 'number'
  };

  // Columns
  j = -1;
  while(++j < C) {
    var cdaCol  = cdaCols[j],
        colType = String(cdaCol.colType || 'string').toLowerCase();

    if(colTypeMap.hasOwnProperty(colType))
      colType = colTypeMap[colType];

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
pentaho.DataTable.prototype.getJsonTable = function() {
  return this._jsonTable;
};

// ====
// COLS
pentaho.DataTable.prototype.addColumn = function(colSpec) {
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
 *     var view = new pentaho.DataView(dataTable);
 *     view.setRows(rows);
 *
 * @method getFilteredRows
 * @param {Array} filters The filters array.
 * @return {Array} An array of row indexes of the rows that meet the filter requirements.
*/
pentaho.DataTable.prototype.getFilteredRows = function(filters) {
  var rows = [],
      R = this.getNumberOfRows();

  // Any data?
  if(R) {
    // Process filters
    var valuePredicate = this._buildFilteredRowsPredicate(filters),
        i = -1;

    // Filter
    while(++i < R)
      if(!valuePredicate || valuePredicate.call(this, i))
        rows.push(i);
  }

  return rows;
};

// TODO: Convert this to internal function upon the AMD conversion.

// Conjunction of all value filters, if any.
pentaho.DataTable.prototype._buildFilteredRowsPredicate = function(valueFilters) {
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
};

/**
 * A **data view** is an object that
 * provides a way to access a subset of a source table.
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
pentaho.DataView = function DataView(table) {
  if(!table) throw new Error("Argument 'table' is required.");
  this._source = table;

  this._rows    = null;
  this._columns = this._getSourceColumns();
};

pentaho.DataView.prototype = new pentaho.AbstractDataTable();
pentaho.DataView.prototype.constructor = pentaho.DataView;

// ====
// Implement abstract class

pentaho.DataView.prototype._getColumn = function(colIdx) {
  return this._source._getColumn(this.getTableColumnIndex(colIdx));
};

pentaho.DataView.prototype._getRow = function(rowIdx) {
  return this._source._getRow(this.getTableRowIndex(rowIdx));
};

pentaho.DataView.prototype._getCell = function(rowIdx, colIdx) {
  return this._source._getCell(this.getTableRowIndex(rowIdx), this.getTableColumnIndex(colIdx));
};

pentaho.DataView.prototype.getNumberOfColumns = function() {
  return this._columns.length;
};

pentaho.DataView.prototype.getNumberOfRows = function() {
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
pentaho.DataView.prototype._getSourceColumns = function() {
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
pentaho.DataView.prototype.getTableColumnIndex = function(colIdx) {
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
pentaho.DataView.prototype.setColumns = function(columns) {
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
pentaho.DataView.prototype.getViewColumns = function() {
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
pentaho.DataView.prototype.hideColumns = function(columns) {
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

pentaho.DataView.prototype.addColumn = function(colSpec) {
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
pentaho.DataView.prototype.getTableRowIndex = function(rowIdx) {
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
pentaho.DataView.prototype.setRows = function(rows) {
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
pentaho.DataView.prototype.getViewRows = function() {
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
pentaho.DataView.prototype.getSourceTable = function() {
  return this._source;
};

/**
 * Gets a {{#crossLink "DataTable"}}{{/crossLink}} loaded with the
 * data view's visible rows and columns.
 *
 * This is a convenience method for abbreviating:
 *
 *      var dataTable = new pentaho.DataTable(thisDataView.toJSON());
 *
 * @method toDataTable
 * @return {DataTable} A data table.
*/
pentaho.DataView.prototype.toDataTable = function() {
  return new pentaho.DataTable(this.toJSON());
};

/* TRENDS */

(function() {

    function argRequired(name) {
      return new Error("Argument '" + name + "' is required.");
    }

    function argInvalid(name, text) {
      return new Error("Argument '" + name + "' is invalid." + (text ? (" " + text) : ""));
    }

    // NOTE: This needs unit-testing before being documented publicly.

    /*
     * Computes a trend of a given type and adds the
     * result to a new column in the table.
     *
     * For data views,
     * this method creates the trend in the _root_ `DataTable`,
     * and makes the created trend column visible in the intervening views.
     *
     * @method createTrend
     * @for AbstractDataTable
     * @param {Object} trendArgs A keyword arguments object.
     * @param {String} trendArgs.type  The type of trend to create; possible values: 'linear'.
     * @param {Number} trendArgs.x     The index of the "x" value column; can be a numeric or string column.
     * @param {Number} trendArgs.y     The index of the "y" value column; must be of a column of type 'number'.
     * @param {String} trendArgs.name  The name of the new trend column; defaults to the type of trend plus the suffix "Trend".
     * @param {String} trendArgs.label The label of the new trend column; defaults to the trend name, when specified, or to the default label of the trend type.
     * @return {Number} The index of the added trend column.
     */

    pentaho.DataView.prototype.createTrend = function(trendArgs) {
      var trendIndex = this._source.createTrend(trendArgs);
      return this._columns.push(trendIndex) - 1;
    };

    pentaho.DataTable.prototype.createTrend = function(trendArgs) {
      // Argument validation
      // ===================

      if(!(trendArgs instanceof Object)) throw argRequired('trendArgs');

      // # TrendType

      var trendType = trendArgs.type;
      if(!trendType) throw argRequired('trendArgs.type');

      trendType = '' + trendType; // toString

      var trendInfo = pentaho.trends.get(trendType, /*assert*/ true);

      // # x

      var colCount = this.getNumberOfColumns();

      var xIndex = trendArgs.x;
      if(xIndex == null) throw argRequired('trendArgs.x');

      xIndex = +xIndex; // toNumber
      if(isNaN(xIndex)) throw argInvalid('trendArgs.x', "Not a number.");

      if(xIndex < 0 || xIndex >= colCount) throw argInvalid('trendArgs.x', "Out of range.");

      // can be numeric or string

      // # y

      var yIndex = trendArgs.y;
      if(yIndex == null)
        throw argRequired('trendArgs.y');

      yIndex = +yIndex; // toNumber
      if(isNaN(yIndex))
        throw argInvalid('trendArgs.y', "Not a number.");

      if(yIndex < 0 || yIndex >= colCount)
        throw argInvalid('trendArgs.y', "Out of range.");

      if(this.getColumnType(yIndex) !== 'number')
        throw argInvalid('trendArgs.y', "Must be a numeric column.");

      // xIndex may be equal to yIndex...

      // # name and label

      var trendName  = trendArgs.name  ||
                       (trendType + "Trend");

      var trendLabel = trendArgs.label ||
                       (trendArgs.name ?  trendName : trendInfo.label);

      // # custom options

      var trendOptions = trendArgs.options || {};

      // Create Trend Column
      // ===================

      // TODO: Use setCell method when available.

      // Create the trend column.
      // Am I a DataView or a DataTable?
      var trendIndex = this.addColumn({
        id:    trendName,
        type:  'number',
        label: trendLabel
      });

      var table = this._jsonTable;
      var me = this;

      // ----

      var isXDiscrete = this.getColumnType(xIndex) !== 'number';

      var rowIndexesEnumtor = this.getRowIndexEnumerator();

      var getX = isXDiscrete ?
          null : // means: "use *index* as X value"
          function(i) { return me.getValue(i, xIndex); };

      var getY = function(i) { return me.getValue(i, yIndex); };

      var options = Object.create(trendOptions);
      options.rows = rowIndexesEnumtor;
      options.x = getX;
      options.y = getY;

      var trendModel = trendInfo.model(options);

      // Not enough points to interpolate?
      // Every row's trend column already has the value null.
      if(!trendModel) return false;

      dojo.forEach(table.rows, function(row, i){
        var trendX = getX ? getX(i) : i,
            trendY = trendX != null ? trendModel.sample(trendX, getY(i), i) : null;

        row.c[trendIndex] = {v: trendY};
      });

      return true;
    };

    /* getRowIndexEnumerator
     *
     * Obtains an enumerator for the row index of the data table.
     */
    pentaho.AbstractDataTable.prototype.getRowIndexEnumerator = function() {
      var index = -1,
          count = this.getNumberOfRows(),
          enumtor = {
            item: undefined,
            next: function() {
                if(index < count - 1) {
                    enumtor.item = ++index; // the row index
                    return true;
                }

                if(enumtor.item) enumtor.item = undefined;

                return false;
            }
          };

      return enumtor;
    };

    /* trendType -> trendInfo */
    var _trends = {};

    pentaho.trends = {};

    /* define
     * Defines a trend type given its specification.
     *
     * type The type of trend to define.
     * spec The trend specification object.
     * spec.label A name for the type of trend; defaults to the capitalized trend type with the suffix "Trend".
     * spec.model A function that given a series of points computes a trend model.
     *
     */
    pentaho.trends.define = function(type, spec){
      if(!type) throw argRequired('type');

      type = '' + type; // to string

      if(!spec) throw argRequired('spec');

      // ----

      var model = spec.model;
      if(!model) throw argRequired('spec.model');
      if(typeof model !== 'function') throw argInvalid('spec.model', "Not a function");

      // ----

      var label = spec.label;
      if(!label) label = type.chartAt(0).toUpperCase() + type.substr(1) + " Trend";

      _trends[type] = {
        type:  type,
        label: label,
        model: model
      };
    };

    /* get
     * Obtains the trend info object of a given trend type.
     *
     * type The type of trend desired.
     * assert If an error should be thrown if the trend type is not defined.
     */
    pentaho.trends.get = function(type, assert) {
      if(!type) throw argRequired('type');

      var trendInfo = _trends.hasOwnProperty(type) ? _trends[type] : null;
      if(!trendInfo && assert)
        throw argInvalid('type', "There is no trend type named '" + type + "'.");

      return trendInfo;
    };

    /* types
     * Obtains an array with the names of all defined trend types.
     */
    pentaho.trends.types = function() {
      // TODO: replace with dojo or JavaScript's Object.keys implementation...

      var ret = [];
      for(var p in _trends)
        if(Object.prototype.hasOwnProperty.call(_trends, p))
          ret.push(p);

      return ret;
    };

    // --------------------

    function parseNum(value) {
      return value != null ? (+value) : NaN;  // to Number works for dates as well
    }

    pentaho.trends.define('linear', {
      label: 'Linear trend',
      model: function(options) {
        var rowsQuery = options.rows,
            getX = options.x,
            getY = options.y,
            i = 0,
            N = 0,
            sumX  = 0,
            sumY  = 0,
            sumXY = 0,
            sumXX = 0;

        while(rowsQuery.next()) {
          var row = rowsQuery.item,
              // Ignore null && NaN values
              x = getX ? parseNum(getX(row)) : i; // use the index itself for discrete stuff

          if(!isNaN(x)) {
            var y = parseNum(getY(row));
            if(!isNaN(y)) {
              N++;

              sumX  += x;
              sumY  += y;
              sumXY += x * y;
              sumXX += x * x;
            }
          }

          i++; // Discrete nulls must still increment the index
        }

        // y = alpha + beta * x
        if(N >= 2) {
          var avgX  = sumX  / N,
              avgY  = sumY  / N,
              avgXY = sumXY / N,
              avgXX = sumXX / N,

              // When N === 1 => den = 0
              den = (avgXX - avgX * avgX),

              beta = den && ((avgXY - (avgX * avgY)) / den),

              alpha = avgY - beta * avgX;

          return {
            alpha: alpha,
            beta:  beta,
            reset: function() {},

            // y = alpha + beta * x
            sample: function(x) { return alpha + beta * (+x); }
          };
        }
      }
    });

}());
