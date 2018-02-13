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

      Object.keys(cellsMap).forEach(function(columnId) {

        var columnIndex = dataTable.getColumnIndexByAttribute(columnId);
        if(columnIndex >= 0) {

          var cell = cellsMap[columnId];

          var filterValue;
          if(cell == null) {
            filterValue = null;
          } else {
            // Adding the expected data type.
            filterValue = {
              _: dataTable.getColumnType(columnIndex),
              value: cell.valueOf(),
              formatted: cell.toString()
            };
          }

          var equalFilter = new IsEqual({property: dataTable.getColumnId(columnIndex), value: filterValue});

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
