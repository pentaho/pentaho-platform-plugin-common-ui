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
define([
  "pentaho/util/error",
  "pentaho/data/util"
], function(error, dataUtil) {

  "use strict";

  /**
   * The `util` namespace contains functions for common tasks around dealing with visual scenes.
   *
   * @name util
   * @namespace
   * @memberOf pentaho.visual.scene
   * @amd pentaho/visual/scene/util
   */
  var sceneUtil = /** @lends pentaho.visual.scene.util */{
    /**
     * Creates a data filter that represents the values of the specified visual role variables.
     *
     * The types {@link pentaho.data.filter.IsEqual} and {@link pentaho.data.filter.And}
     * must have been loaded already.
     *
     * If the given variables map entails no distinguishing fields
     * (in the sense of being _effective keys_, as defined in
     * [isColumnKeyEffective]{@link pentaho.data.util.isColumnKeyEffective}) of the associated data table,
     * then the returned filter will be `null`.
     *
     * @param {!Object.<string, any|pentaho.visual.role.scene.IVariable>} varsMap - A map of visual role names
     * to corresponding _variables_. All variables, even those from inherited keys are considered.
     *
     * Map keys which are not the name of a mapper visual role property of `model` are ignored.
     * Map values can be any value that supports the JavaScript's `valueOf` method.
     *
     * @param {!pentaho.visual.base.Model} model - The associated visual model. Must be valid.
     *
     * @return {pentaho.data.filter.Abstract} The filter, if one can be created; `null`, otherwise
     *
     * @see pentaho.data.util.createFilterFromCellsMap
     */
    createFilterForVars: function(varsMap, model) {

      var keyDataCellsMap = sceneUtil.invertVars(varsMap, model);

      return dataUtil.createFilterFromCellsMap(keyDataCellsMap, model.data, model.$type.context);
    },

    /**
     * Creates a data cells map corresponding to the values of the specified visual role variables.
     *
     * By default, only data cells for fields which are **effective keys** are considered,
     * as defined in [isColumnKeyEffective]{@link pentaho.data.util.isColumnKeyEffective}.
     * Specify `keyArgs.includeMeasureFields` as `true` to include all fields.
     *
     * @param {!Object.<string, any|pentaho.visual.role.scene.IVariable>} varsMap - A map of visual role names
     * to corresponding _variables_. All variables, even those from inherited keys are considered.
     *
     * Map keys which are not the name of a mapper visual role property of `model` are ignored.
     * Map values can be any value that supports the JavaScript's `valueOf` method.
     *
     * @param {!pentaho.visual.base.Model} model - The associated visual model. Must be valid.
     *
     * @param {Object} [keyArgs] The keyword arguments object.
     * @param {boolean} [keyArgs.includeMeasureFields=false] Indicates that measure fields should also
     * be included.
     * In practice, indicates that all fields should be included.
     *
     * @return {!Object.<string, pentaho.data.ICell>} A data cells map, possibly empty.
     *
     * @see pentaho.data.util.hasAnyKeyColumns
     * @see pentaho.data.ITable#isColumnKey
     * @see pentaho.data.util#isColumnTypeContinuous
     */
    invertVars: function(varsMap, model, keyArgs) {

      var data = model.data;
      if(data === null) {
        throw error.argInvalid("model", "No data.");
      }

      var includeKeyFieldsOnly = !(keyArgs && keyArgs.includeMeasureFields);
      var hasDataKeyColumns = includeKeyFieldsOnly ? dataUtil.hasAnyKeyColumns(data) : null;

      var modelType = model.$type;
      var cellsMap = {};

      // All enumerable properties, even inherited ones, should be considered.
      // eslint-disable-next-line guard-for-in
      for(var varName in varsMap) {

        // Ignore vars not associated with a visual role.
        var propType = modelType.get(varName, /* sloppy: */true);
        if(propType !== null && modelType.isVisualRole(propType)) {

          // Ignore unmapped visual roles.
          var mapper = model.get(varName).mapper;
          if(mapper !== null) {
            // This allows specifying either IVariable or direct values :-)
            var varValue = varsMap[varName];
            if(varValue != null) {
              varValue = varValue.valueOf();
            }

            var rowIndex = mapper.invertValue(varValue);
            if(rowIndex != null && rowIndex >= 0) {
              var inputData = mapper.inputData;
              var isKeyColumnFilter = includeKeyFieldsOnly
                  ? __getIsColumnKeyEffectiveFilter(inputData, hasDataKeyColumns)
                  : null;

              __collectDataRowCells(cellsMap, inputData, rowIndex, isKeyColumnFilter);
            }
          }
        }
      }

      return cellsMap;
    }
  };

  return sceneUtil;

  /**
   * Collects cells from a row of data set into a given data cells map.
   *
   * @memberOf pentaho.visual.scene.util~
   * @private
   *
   * @param {!Object.<string, pentaho.data.ICell>} dataCellsMap - A data cells map, where collected cells are placed.
   * @param {!pentaho.data.ITable} dataTable - The data set.
   * @param {number} rowIndex - The index of the row to collect cells from.
   * @param {?(function(number):boolean)} [columnFilter] - A column filter.
   */
  function __collectDataRowCells(dataCellsMap, dataTable, rowIndex, columnFilter) {

    var columnIndex = -1;
    var columnCount = dataTable.getNumberOfColumns();

    while(++columnIndex < columnCount) {
      if(columnFilter === null || columnFilter(columnIndex)) {
        dataCellsMap[dataTable.getColumnId(columnIndex)] = dataTable.getCell(rowIndex, columnIndex);
      }
    }
  }

  /**
   * Creates an effective key column filter function for a given data set with the indication
   * of whether the (source) data set has any real key columns
   *
   * @memberOf pentaho.visual.scene.util~
   * @private
   *
   * @param {!pentaho.data.ITable} dataTable - The data set.
   * @param {boolean} hasDataKeyColumns - Indicates if the data set or its source data set includes any key columns.
   * @return {(function(number):boolean)} A column filter.
   */
  function __getIsColumnKeyEffectiveFilter(dataTable, hasDataKeyColumns) {

    return function isColumnKeyEffective(columnIndex) {
      return dataUtil.isColumnKeyEffective(dataTable, columnIndex, hasDataKeyColumns);
    };
  }
});
