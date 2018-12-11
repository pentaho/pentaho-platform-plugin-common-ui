/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "../lang/Base",
  "./_ElementMock",
  "./AtomicTypeName"
], function(Base, ElementMock, AtomicTypeName) {

  // NOTE: most of this class is actually documented in ITable.jsdoc.
  // While the latter shape the implementation, they are not publicized.

  // Map of DataTable types to CDA lowercase colType
  // CDA column types (method getColTypes)
  // github.com/webdetails/cda/blob/master/core/src/main/java/pt/webdetails/cda/exporter/AbstractExporter.java#L47

  var COLTYPE_DT_CDA = {};
  COLTYPE_DT_CDA[AtomicTypeName.NUMBER] = "numeric";
  COLTYPE_DT_CDA[AtomicTypeName.STRING] = "string";
  COLTYPE_DT_CDA[AtomicTypeName.DATE] = "date";
  COLTYPE_DT_CDA[AtomicTypeName.BOOLEAN] = "boolean";

  /**
   * @ignore
   * @name AbstractTable
   * @memberOf pentaho.data
   * @class
   * @abstract
   * @implements ?pentaho.lang.ISpecifiable
   * @implements ?pentaho.data.ITable
   * @amd pentaho/data/AbstractTable
   *
   * @classdesc The `AbstractTable` class is the abstract base class of
   * classes that represent a tabular dataset.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/data/AbstractTable"`.
   *
   * ### Remarks
   *
   * The following derived classes are not abstract and can be used directly:
   *
   * * {@link pentaho.data.Table}
   * * {@link pentaho.data.TableView}
   */
  var AbstractTable = Base.extend("pentaho.data.AbstractTable", /** @lends pentaho.data.AbstractTable# */{
    /**
     * Gets a cell, given its row and column indexes.
     *
     * @name pentaho.data.AbstractTable#getCell
     * @abstract
     * @function
     * @param {number} rowIndex The row index (zero-based).
     * @param {number} colIndex The column index (zero-based).
     * @return {pentaho.data.Cell} The specified cell object.
     */

    /**
     * Adds a column.
     *
     * @name pentaho.data.AbstractTable#addColumn
     * @method
     * @abstract
     * @param {?object} colSpec The column specification.
     * @param {?object} [keyArgs] The keyword arguments.
     * @return {number} The index of the new column.
     */

    /**
     * Adds a row.
     *
     * @name pentaho.data.AbstractTable#addRow
     * @method
     * @abstract
     * @param {?object} rowSpec The row specification.
     * @param {?object} [keyArgs] The keyword arguments.
     * @return {number} The index of the new row.
     */

    /**
     * Gets the attribute of a column, given its index.
     *
     * @name pentaho.data.AbstractTable#getColumnAttribute
     * @method
     * @abstract
     * @param {number} colIndex The column index (zero-based).
     * @return {?pentaho.data.Attribute} The column attribute object or `null`, if none.
     *
     *    Only cross-tables can have columns that have no associated attribute.
     */

    /**
     * Gets the underlying model object.
     *
     * @name pentaho.data.AbstractTable#model
     * @readonly
     * @type {?pentaho.data.Model}
     */

    // -----

    /** @ignore */
    isValueEqual: function(a, b) {
      return (a === b) ||
          (a == null && b == null) ||
          (typeof a === "number" && isNaN(a) && typeof b === "number" && isNaN(b));
    },

    /**
     * Gets the index of the first column having a given name or attribute.
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
          var c = -1;
          var C = this.getNumberOfColumns();
          while(++c < C)
            if(this.getColumnAttribute(c) === attr)
              return c;
        }
      }

      return -1;
    },

    /**
     * Gets the index of the first column having a given identifier.
     *
     * @param {string} id - The column identifier.
     * @return {number} The (0-based) index of the first column having the specified identifier,
     * if any, or `-1`, if none.
     */
    getColumnIndexById: function(id) {
      return this.getColumnIndexByAttribute(id);
    },

    /** @inheritDoc */
    getColumnProperty: function(colIndex, propName) {

      var attr = this.getColumnAttribute(colIndex);
      if(attr) {
        return attr.property(propName);
      }
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
     * @param {?object} [options] A keyword arguments object.
     * @param {function} [options.key] A function that derives values from the actual column values.
     * @return {?pentaho.data.Range} A non-null range object.
     */
    getColumnRange: function(colIndex, options) {
      var set = false;
      var key = options && options.key;
      var i = 0;
      var R = this.getNumberOfRows();
      var min;
      var max; // = undefined

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
      return this._getDistinctValuesCore(colIndex, /* formatted: */false);
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
      return this._getDistinctValuesCore(colIndex, /* formatted: */true);
    },

    _getDistinctValuesCore: function(colIndex, formatted) {
      var values = [];
      var keyMap = {};
      var i = 0;
      var R = this.getNumberOfRows();
      var getValue = formatted ? this.getFormattedValue : this.getValue;
      var value;
      var key;

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
      var rows = [];
      var R = this.getNumberOfRows();

      // Any data?
      if(R) {
        // Process filters
        var valuePredicate = buildFilteredRowsPredicate.call(this, filters);
        var i = -1;

        // Filter
        while(++i < R)
          if(!valuePredicate || valuePredicate.call(this, i))
            rows.push(i);
      }

      return rows;
    },

    /** @inheritDoc */
    filter: function(filter) {

      var filteredRows = [];
      var L = this.getNumberOfRows();
      if(L > 0) {
        var predicate = filter.compile();

        var elem = new ElementMock(this, null);
        var i = -1;
        while(++i < L) {
          elem.rowIdx = i;
          if(predicate(elem)) {
            filteredRows.push(i);
          }
        }
      }

      var dataView = new AbstractTable.core.TableView(this);
      dataView.setSourceRows(filteredRows);
      return dataView;
    },

    filterMatchesRow: function(filter, rowIndex) {

      var elem = new ElementMock(this, rowIndex);

      return filter.contains(elem);
    },

    /**
     * Creates a CDA dataset.
     *
     * @return {?object} The CDA dataset.
     */
    toJsonCda: function() {
      var C = this.getNumberOfColumns();
      var R = this.getNumberOfRows();
      var metadata = new Array(C);
      var resultset = new Array(R);
      var j = C;
      var i = R;
      var cell;
      var resultRow;
      var v;
      var f;

      while(j--) {
        metadata[j] = {
          colIndex: j,
          colName:  this.getColumnId(j),
          colLabel: this.getColumnLabel(j),
          colType:  writeCdaColType(this.getColumnType(j)),
          colIsKey: this.isColumnKey(j)
        };
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

  return AbstractTable;

  // Conjunction of all value filters, if any.
  function buildFilteredRowsPredicate(valueFilters) {
    var F = valueFilters.length;

    // (rowIdx: number) -> boolean
    if(F) return function(rowIndex) {
      for(var f = 0; f < F; f++) {
        var filter = valueFilters[f];
        var v = filter.value;
        if(v !== undefined && !this.isValueEqual(this.getValue(rowIndex, filter.column), v))
          return false;
      }
      return true;
    };
  }

  function writeCdaColType(colType) {
    if(!COLTYPE_DT_CDA.hasOwnProperty(colType))
      throw new Error("Unsupported data type");

    return COLTYPE_DT_CDA[colType];
  }
});
