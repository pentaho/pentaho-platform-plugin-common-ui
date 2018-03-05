/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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

  "use strict";

  /**
   * The `util` namespace contains functions for common tasks around dealing with data.
   *
   * @name util
   * @namespace
   * @memberOf pentaho.data
   * @amd pentaho/data/util
   */
  var dataUtil = /** @lends pentaho.data.util */{

    /**
     * Gets a value that indicates if a given data table has any key columns.
     *
     * @param {!pentaho.data.ITable} dataTable - The data table.
     *
     * @return {boolean} `true` if there are key columns; `false`, if not.
     *
     * @see pentaho.data.ITable#isColumnKey
     */
    hasAnyKeyColumns: function(dataTable) {
      var columnIndex = -1;
      var columnCount = dataTable.getNumberOfColumns();
      while(++columnIndex < columnCount) {
        if(dataTable.isColumnKey(columnIndex)) {
          return true;
        }
      }

      return false;
    },

    /**
     * Gets a value that indicates if a column is an _effective key_.
     *
     * A column is considered an _effective key_
     * if [isColumnKey]{@link pentaho.data.ITable#isColumnKey} returns `true` for the corresponding column or,
     * in the case when the data table has no actual key attributes,
     * if the attribute is categorical (see [isColumnTypeContinuous]{@link pentaho.data.util.isColumnTypeContinuous}).
     *
     * @param {!pentaho.data.ITable} dataTable - The data table.
     * @param {number} columnIndex - The column index.
     * @param {boolean} [hasDataKeyColumns] - Indicates if `dataTable`, or its source table,
     * contain any (real) key columns.
     * Defaults to the result of calling [hasAnyKeyColumns]{@link pentaho.data.util.hasAnyKeyColumns} on `dataTable`.
     * For performance reasons, if this method is being called repeatedly on the same data table,
     * this value should be pre-calculated and specified each time.
     *
     * @return {boolean} `true` if the column is an effective key; `false`, if not.
     */
    isColumnKeyEffective: function(dataTable, columnIndex, hasDataKeyColumns) {
      if(hasDataKeyColumns == null) {
        hasDataKeyColumns = dataUtil.hasAnyKeyColumns(dataTable);
      }
      return hasDataKeyColumns
          ? dataTable.isColumnKey(columnIndex)
          : !dataUtil.isColumnTypeContinuous(dataTable.getColumnType(columnIndex));
    },

    /**
     * Gets a value that indicates if a given column data type has the _continuous_ capability.
     *
     * The data types `"date"` and `"number"` are considered continuous and all others categorical.
     *
     * @param {string} dataType - The data type name.
     *
     * @return {boolean} `true` if the data type is _continuous_; `false`, otherwise.
     */
    isColumnTypeContinuous: function(dataType) {
      return dataType === "number" || dataType === "date";
    },

    /**
     * Creates a data filter from the given cells map, source data table and Type API context.
     *
     * @param {!Object.<string, any|pentaho.data.ICell>} cellsMap - The data cells map.
     * @param {!pentaho.data.ITable} dataTable - The associated source data table.
     * @param {!pentaho.type.Context} context - The Type API context from which to obtain the filter types.
     * The types {@link pentaho.data.filter.IsEqual} and {@link pentaho.data.filter.And}
     * must have been loaded already.
     *
     * @return {!pentaho.data.filter.Abstract} A data filter.
     */
    createFilterFromCellsMap: function(cellsMap, dataTable, context) {

      var IsEqual = context.get("=");

      var andOperands = [];

      var dataPlain = dataTable.toPlainTable();

      Object.keys(cellsMap).forEach(function(columnId) {

        var columnIndex = dataPlain.getColumnIndexById(columnId);
        if(columnIndex >= 0) {

          var cell = cellsMap[columnId];

          var filterValue;
          if(cell == null) {
            filterValue = null;
          } else {
            // Adding the expected data type.
            filterValue = {
              _: dataPlain.getColumnType(columnIndex),
              value: cell.valueOf(),
              formatted: cell.toString()
            };
          }

          var equalFilter = new IsEqual({property: dataPlain.getColumnId(columnIndex), value: filterValue});

          andOperands.push(equalFilter);
        }
      });

      if(andOperands.length === 0) {
        return null;
      }

      var And = context.get("and");

      return new And({operands: andOperands});
    }
  };

  return dataUtil;
});
