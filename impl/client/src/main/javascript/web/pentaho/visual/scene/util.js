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
     * @param {Object.<string, *|pentaho.data.ICell>} varsMap - A map of visual role names
     * to corresponding _variables_. All variables, even those from inherited keys are considered.
     *
     * Map keys which are not the name of a mapper visual role property of `model` are ignored.
     * Map values can be any value that supports the JavaScript's `valueOf` method.
     *
     * @param {pentaho.visual.Model} model - The associated visual model. Must be valid.
     *
     * @return {?pentaho.data.filter.Abstract} The filter, if one can be created; `null`, otherwise
     *
     * @see pentaho.data.util.createFilterFromCellsMap
     */
    createFilterFromVars: function(varsMap, model) {

      var keyDataCellsMap = sceneUtil.invertVars(varsMap, model);

      return dataUtil.createFilterFromCellsMap(keyDataCellsMap, model.data);
    },

    /**
     * Creates a data cells map corresponding to the values of the specified visual role variables.
     *
     * By default, only data cells for fields which are **effective keys** are considered,
     * as defined in [isColumnKeyEffective]{@link pentaho.data.util.isColumnKeyEffective}.
     * Specify `keyArgs.includeMeasureFields` as `true` to include all fields.
     *
     * @param {?Object.<string, pentaho.data.ICell|Array.<pentaho.data.ICell>>} varsMap - A map of visual role names
     * to corresponding _variables_. All variables, even those from inherited keys are considered.
     *
     * Map keys which are not the name of a mapper visual role property of `model` are ignored.
     *
     * @param {pentaho.visual.Model} model - The associated visual model. Must be valid.
     *
     * @param {?object} [keyArgs] The keyword arguments object.
     * @param {boolean} [keyArgs.includeMeasureFields=false] Indicates that measure fields should also
     * be included.
     * In practice, indicates that all fields should be included.
     *
     * @return {Object.<string, pentaho.data.ICell>} A data cells map, possibly empty.
     *
     * @see pentaho.data.util.isColumnKeyEffective
     */
    invertVars: function(varsMap, model, keyArgs) {

      var data = model.data;
      var includeKeyFieldsOnly = !(keyArgs && keyArgs.includeMeasureFields);
      var hasDataKeyColumns = includeKeyFieldsOnly ? dataUtil.hasAnyKeyColumns(data) : null;

      var modelType = model.$type;
      var columnIndexes;
      var columnNames;
      var cellsMap = {};

      // All enumerable properties, even inherited ones, should be considered.
      // eslint-disable-next-line guard-for-in
      for(var varName in varsMap) {

        // Ignore vars not associated with a visual role.
        var propType = modelType.get(varName, /* sloppy: */true);
        if(propType !== null && modelType.isVisualRole(propType)) {

          // Ignore unmapped visual roles.
          var mapping = model.get(varName);
          if(mapping.hasFields) {

            columnIndexes = includeKeyFieldsOnly ? [] : null;
            columnNames = [];

            // eslint-disable-next-line no-loop-func
            mapping.fields.each(function(mappingField) {
              var fieldName = mappingField.name;

              columnNames.push(fieldName);

              if(includeKeyFieldsOnly) {
                columnIndexes.push(data.getColumnIndexById(fieldName));
              }
            });

            var varValue = varsMap[varName];
            if(Array.isArray(varValue)) {
              // eslint-disable-next-line no-loop-func
              varValue.forEach(addField);
            } else {
              addField(varValue, 0);
            }
          }
        }
      }

      return cellsMap;

      /**
       * Adds a field.
       *
       * Takes care to respect `includeKeyFieldsOnly`.
       *
       * @param {pentaho.data.ICell} cell - The cell value, possibly `null`.
       * @param {number} index - The index of the cell.
       */
      function addField(cell, index) {

        if(!includeKeyFieldsOnly || dataUtil.isColumnKeyEffective(data, columnIndexes[index], hasDataKeyColumns)) {

          cellsMap[columnNames[index]] = cell;
        }
      }
    }
  };

  return sceneUtil;
});
