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
define(function() {
  /**
   * @module pentaho.visual.data
   */

  /**
   * An _AbstractDataTable_ represents a set of tabular data.
   *
   * #### AMD
   *
   * **Module Id**: `"pentaho/visual/data/AbstractDataTable"`
   *
   * **Module Type**: The {{#crossLink "AbstractDataTable"}}{{/crossLink}} constructor.
   *
   * @class AbstractDataTable
   * @constructor
   */
   function AbstractDataTable() {}

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

  AbstractDataTable.prototype.isValueEqual = function(a, b) {
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
  AbstractDataTable.prototype.getColumnType = function(colIdx) {
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
  AbstractDataTable.prototype.getColumnId = function(colIdx) {
    return this._getColumn(colIdx).id;
  };

  /**
   * Gets the label of the data property stored in a column, given its index.
   *
   * @method getColumnLabel
   * @param {Number} colIdx The column index (zero-based).
   * @return {String} The column's data property label.
   */
  AbstractDataTable.prototype.getColumnLabel = function(colIdx) {
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
  AbstractDataTable.prototype.getColumnProperty = function(colIdx, name) {
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
  AbstractDataTable.prototype.setColumnProperty = function(colIdx, name, value) {
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
  AbstractDataTable.prototype.getColumnRange = function(colIdx, options) {
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
  AbstractDataTable.prototype.getDistinctValues = function(colIdx) {
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
  AbstractDataTable.prototype.getDistinctFormattedValues = function(colIdx) {
    return this._getDistinctValuesCore(colIdx, /*formatted:*/true);
  };

  AbstractDataTable.prototype._getDistinctValuesCore = function(colIdx, formatted) {
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
  AbstractDataTable.prototype.getValue = function(rowIdx, colIdx) {
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
  AbstractDataTable.prototype.getCell = function(rowIdx, colIdx) {
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
  AbstractDataTable.prototype.getFormattedValue = function(rowIdx, colIdx) {
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
  AbstractDataTable.prototype.getLabel = function(rowIdx, colIdx) {
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
  AbstractDataTable.prototype.toJSON = function() {
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

  return AbstractDataTable;
});
