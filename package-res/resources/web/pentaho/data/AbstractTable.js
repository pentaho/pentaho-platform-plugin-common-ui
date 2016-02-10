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
define([
  "../lang/Base"
], function(Base) {

  // NOTE: most of this class is actually documented in ITableReadOnly.jsdoc and ITable.jsdoc.
  // While the latter shape the implementation, they are not publicized.

  /**
   * @name AbstractTable
   * @memberOf pentaho.data
   * @class
   * @abstract
   * @implements pentaho.lang.ISpecifiable
   * @amd pentaho/data/AbstractTable
   *
   * @classdesc The `AbstractTable` class is the abstract base class of
   * classes that represent a tabular dataset.
   *
   * ### Remarks
   *
   * The following derived classes are not abstract and can be used directly:
   *
   * * {@link pentaho.data.Table}
   * * {@link pentaho.data.TableView}
   */
  return Base.extend("pentaho.data.AbstractTable", /** @lends pentaho.data.AbstractTable# */{
    /**
     * Gets a cell, given its row and column indexes.
     *
     * @name pentaho.data.AbstractTable#getCell
     * @abstract
     * @function
     * @param {number} rowIndex The row index (zero-based).
     * @param {number} colIndex The column index (zero-based).
     * @return {!pentaho.data.Cell} The specified cell object.
     */

    // -----

    /** @ignore */
    isValueEqual: function(a, b) {
      return (a === b) ||
          (a == null && b == null) ||
          (typeof a === 'number' && isNaN(a) && typeof b === 'number' && isNaN(b));
    },

    /**
     * Gets the index of the first column having a given attribute.
     *
     * Returns `-1` when:
     * * `attr` is not specified
     * * a string is specified but an attribute with the specified name is not defined in the table model
     * * a specified attribute instance does not belong to this table's model
     * * there's no column with the specified attribute.
     *
     * @param {string|pentaho.data.Attribute} attr An attribute or the name of one.
     * @return {number} The (0-based) index of the first column having the specified attribute,
     * if any, or `-1`, if none.
     */
    getColumnIndexByAttribute: function(attr) {
      if(attr) {
        if(typeof attr === "string") attr = this.model.attributes.get(attr);

        if(this.model.attributes.includes(attr)) {
          var c = -1, C = this.getNumberOfColumns();
          while(++c < C)
            if(this.getColumnAttribute(c) === attr)
              return c;
        }
      }
      return -1;
    },

    /**
     * Gets the value range of a column, given its index.
     *
     * When there is no data, or the values of the given column are all `null`, `undefined` or `NaN`,
     * the returned range object will have both of its properties, `min` and `max`,
     * with the value `undefined`.
     *
     * This method can be applied meaningfully to columns having a `"number"` or `"string"` data type
     * (or whose specified `options.key` function evaluates to such types of values).
     * When the data type is `"string"`, the comparison is lexicographical.
     *
     * @param {number} colIndex The column index (zero-based).
     * @param {Object} [options] A keyword arguments object.
     * @param {function} [options.key] A function that derives values from the actual column values.
     * @return {pentaho.data.Range} A non-null range object.
     */
    getColumnRange: function(colIndex, options) {
      var set = false,
          key = options && options.key,
          i = 0,
          R = this.getNumberOfRows(),
          min, max; // = undefined

      while(i < R) {
        var value = this.getValue(i++, colIndex);
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
    },

    /**
     * Gets an array of the distinct values of a column, given its index.
     *
     * Values are obtained by calling
     * {@link pentaho.data.AbstractTable##getValue} on each cell.
     *
     * The distinct values are returned in order of (first) occurrence (not sorted).
     *
     * The values `null` and `NaN` are treated just like other values and
     * can thus be returned.
     *
     * @param {number} colIndex The column index (zero-based).
     * @return {Array.<pentaho.data.Atomic|null>} A non-null array with the distinct values.
     */
    getDistinctValues: function(colIndex) {
      return this._getDistinctValuesCore(colIndex, /*formatted:*/false);
    },

    /**
     * Gets an array of the distinct _formatted_ values of a column, given its index.
     *
     * Formatted values are obtained by calling
     * {@link pentaho.data.AbstractTable#getFormattedValue} on each cell.
     *
     * The distinct formatted values are returned in order of (first) occurrence (not sorted).
     *
     * The value `null` is treated just like other values and can thus be returned.
     *
     * @param {number} colIndex The column index (zero-based).
     * @return {string[]} A non-null array with the distinct formatted values.
     */
    getDistinctFormattedValues: function(colIndex) {
      return this._getDistinctValuesCore(colIndex, /*formatted:*/true);
    },

    _getDistinctValuesCore: function(colIndex, formatted) {
      var values = [],
          keyMap = {},
          i = 0,
          R = this.getNumberOfRows(),
          getValue = formatted ? this.getFormattedValue : this.getValue,
          value, key;

      while(i < R) {
        value = getValue.call(this, i++, colIndex);
        key   = (typeof value) + ":" + value;
        if(keyMap[key] !== 1) {
          keyMap[key] = 1;
          values.push(value);
        }
      }

      return values;
    },

    /**
     * Filters the rows of the table using the specified filters.
     * Returns an array of the row indexes that meet the filter criteria.
     *
     * The result can be passed to
     * {@link pentaho.data.TableView#setSourceRows}
     * to obtain a filtered table.
     *
     * When no value filters are specified,
     * the indexes of all rows are returned.
     *
     * @example <caption>Rows having value 'France' in column 0</caption>
     *     var rows = table.getFilteredRows({column: 0, value: 'France'});
     *     var view = new View(dataTable);
     *     view.setSourceRows(rows);
     *
     * @param {Array} filters The filters array.
     * @return {number[]} An array of the row indexes of the rows that meet the filter requirements.
     */
    getFilteredRows: function(filters) {
      var rows = [], R = this.getNumberOfRows();

      // Any data?
      if(R) {
        // Process filters
        var valuePredicate = buildFilteredRowsPredicate.call(this, filters),
            i = -1;

        // Filter
        while(++i < R)
          if(!valuePredicate || valuePredicate.call(this, i))
            rows.push(i);
      }

      return rows;
    },

    /**
     * Creates a CDA dataset.
     *
     * @return {Object} The CDA dataset.
     */
    toJsonCda: function() {
      var C = this.getNumberOfColumns(),
          R = this.getNumberOfRows(),
          metadata = new Array(C),
          resultset = new Array(R),
          j = C,
          i = R,
          cell, resultRow, v, f;

      while(j--) {
        metadata[j] = {
          colIndex: j,
          colName:  this.getColumnId(j),
          colLabel: this.getColumnLabel(j),
          colType:  writeCdaColType(this.getColumnType(j))
        }
      }

      while(i--) {
        resultset[i] = resultRow = new Array(C);

        j = C;
        while(j--) {
          cell = this.getCell(i, j);
          v = cell.value;
          f = cell.label;

          resultRow[j] = (f == null) ? v : {v: v, f: f};
        }
      }

      return {metadata: metadata, resultset: resultset};
    }
  });

  // Conjunction of all value filters, if any.
  function buildFilteredRowsPredicate(valueFilters) {
    var F = valueFilters.length;

    // (rowIdx: number) -> boolean
    if(F) return function(rowIndex) {
      for(var f = 0; f < F; f++) {
        var filter = valueFilters[f],
            v = filter.value;
        if(v !== undefined && !this.isValueEqual(this.getValue(rowIndex, filter.column), v))
          return false;
      }
      return true;
    };
  }

  function writeCdaColType(colType) {
    switch(colType) {
      case 'string': return 'STRING';
      case 'number': return 'NUMERIC';
    }

    throw new Error("Unsupported data type");
  }
});