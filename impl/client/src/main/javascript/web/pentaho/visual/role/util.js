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
  "pentaho/type/changes/Transaction",
  "pentaho/data/util",
  "pentaho/util/arg",
  "pentaho/util/fun"
], function(Transaction, dataUtil, arg, F) {

  "use strict";

  /**
   * The `util` namespace contains functions for common tasks around dealing with visual roles.
   *
   * @name util
   * @namespace
   * @memberOf pentaho.visual.role
   * @amd pentaho/visual/role/util
   */
  var roleUtil = /** @lends pentaho.visual.role.util */{

    /**
     * Tests if it would be valid to add a field to a visual role at a specific position.
     *
     * This method allows moving, appending/inserting or replacing a field in a visual role.
     *
     * When valid, returns the corresponding visual role usage.
     *
     * @param {pentaho.visual.base.AbstractModel} vizModel - The visualization model.
     * @param {string} roleName - The name of the visual role.
     * @param {string} fieldName - The name of the field.
     *
     * @param {object} [keyArgs] - The keyword arguments object.
     *
     * @param {?pentaho.data.Table} [keyArgs.alternateData] - An alternate data table which certainly
     *  contains all of the currently mapped fields plus the new field.
     *
     * @param {?number} [keyArgs.fieldPosition] - The new index of the field in the visual role's field list.
     *
     *   The default value is the number of fields, causing the field to become the last one.
     *
     *   When specified to an existing position the field is either inserted at that position
     *   or replaces the field at that position, depending on the value of `keyArgs.replaceTarget`.
     *
     * @param {?(boolean|"auto")} [keyArgs.replaceTarget=false] - When `keyArgs.fieldPosition` is specified
     *   and a field mapping exists at that position, indicates if it should be replaced by the new field.
     *
     *   When `"auto"` is specified, the target is replaced only if the visual role has no more available space
     *   for another field.
     *
     *   This argument is ignored if `keyArgs.fieldPosition` is not specified.
     *
     * @return {?pentaho.visual.role.IAddUsage} The resulting visual role usage, when valid;
     *  `null`, otherwise.
     *
     *  @see pentaho.visual.role.util.testAddFieldAtAutoPosition
     */
    testAddField: function(vizModel, roleName, fieldName, keyArgs) {

      // Some pre-processing and early exists.

      var alternateDataTable = arg.optional(keyArgs, "alternateData", null);
      if(alternateDataTable === null && vizModel.data === null) {
        return null;
      }

      // Add/Insert/Replace the field to the visual role.
      var propType = vizModel.$type.get(roleName);
      var mapping = vizModel.get(roleName);
      var mappingFields = mapping.fields;
      var L = mappingFields.count;
      var mappingField = L > 0 ? mappingFields.get(fieldName) : null;

      var fieldPosition = arg.optional(keyArgs, "fieldPosition", null);
      var replaceTarget = false;

      if(L > 0 && fieldPosition != null && fieldPosition < L) {
        // `fieldPosition` may be >= length, in which case `null` is returned.
        fieldPosition = Math.max(0, fieldPosition);

        var targetMappingField = mappingFields.at(fieldPosition);
        // assert targetMappingField !== null

        if(targetMappingField === mappingField) {
          // Same position (replaceTarget is irrelevant).
          return null;
        }

        replaceTarget = arg.optional(keyArgs, "replaceTarget", false);
        if(replaceTarget === "auto") {
          if(mappingField === null) {
            // Enter replace mode if there is no room to add/insert.
            replaceTarget =
              mappingFields.count >=
              propType.fields.countRangeOn(vizModel, {ignoreCurrentMode: true}).max;
          } else {
            // It's a move, so there's space.
            replaceTarget = false;
          }
        }
      } else {
        // To last position.
        fieldPosition = L;

        // Already at the last position, so no actual move?
        if(mappingField !== null && mappingFields.at(fieldPosition - 1) === mappingField) {
          return null;
        }
      }

      return Transaction.enter().using(function(scope) {

        // Make the changes.

        if(alternateDataTable !== null) {
          vizModel.data = alternateDataTable;
        }

        // Generally removing a field or changing the data can cause problems with the selection filter, if any.
        // So it's wise to null it out for this purpose.
        vizModel.selectionFilter = null;

        if(replaceTarget) {
          mappingFields.removeAt(fieldPosition, 1);
        }

        if(mappingField === null) {
          // Append / Insert [Replace]
          mappingFields.insert(fieldName, fieldPosition);
        } else {
          // Move [Replace]
          mappingFields.move(mappingField, fieldPosition);
        }

        // Query if the visual role is valid.
        // Do not accept the transaction. Rollback changes.

        var isRoleValid = scope.acceptWill().isFulfilled && !propType.validateOn(vizModel);
        if(!isRoleValid) {
          return null;
        }

        return {
          name: roleName,
          propType: propType, // conveniently cached
          fieldName: fieldName, // conveniently accessible
          fieldPosition: fieldPosition,
          replaceTarget: replaceTarget,
          mode: mapping.mode
        };
      });
    },

    /**
     * Tests if it would be valid to add a field to a visual role, at one of the possible positions.
     *
     * This method is similar to {@link pentaho.visual.role.util.testAddField},
     * however, it automatically determines the first position from end, if any,
     * at which it would be possible to add the field to the visual role.
     *
     * When valid, returns the corresponding visual role usage.
     *
     * @param {pentaho.visual.base.AbstractModel} vizModel - The visualization model.
     * @param {string} roleName - The name of the visual role.
     * @param {string} fieldName - The name of the field.
     *
     * @param {object} [keyArgs] - The keyword arguments object.
     *
     * @param {?pentaho.data.Table} [keyArgs.alternateData] - An alternate data table which certainly
     *  contains all of the currently mapped fields plus the new field.
     *
     * @param {?(boolean|"auto")} [keyArgs.replaceTarget=false] - Indicates if an existing field at an automatically
     *   determined position should be replaced by the new field.
     *
     *   When `"auto"` is specified, the target is replaced only if the visual role has no more available space
     *   for another field.
     *
     * @return {?pentaho.visual.role.IAddUsage} The resulting visual role usage, when valid;
     *  `null`, otherwise.
     *
     *  @see pentaho.visual.role.util.testAddField
     */
    testAddFieldAtAutoPosition: function(vizModel, roleName, fieldName, keyArgs) {

      var keyArgs2 = keyArgs == null ? {} : Object.create(keyArgs);

      // Starts by testing appending the new field.
      // Then, falls back to lower positions.
      var fieldPosition = vizModel.get(roleName).fields.count + 1;
      while(fieldPosition--) {

        keyArgs2.fieldPosition = fieldPosition;

        var roleUsage = roleUtil.testAddField(vizModel, roleName, fieldName, keyArgs2);
        if(roleUsage !== null) {
          return roleUsage;
        }
      }

      return null;
    },

    /**
     * Gets a list of visual role usages for valid additions of a field to a visualization model
     *
     * This method tests adding the field to each of the visualization model's visual roles,
     * by delegating to {@link pentaho.visual.role.util.testAddFieldAtAutoPosition}.
     *
     * @param {pentaho.visual.base.AbstractModel} vizModel - The visualization model.
     * @param {string} fieldName - The name of the field.
     *
     * @param {object} [keyArgs] - The keyword arguments object.
     *
     * @param {?pentaho.data.Table} [keyArgs.alternateData] - An alternate data table which certainly
     *  contains all of the currently mapped fields plus the new field.
     *
     * @param {?(boolean|"auto")} [keyArgs.replaceTarget=false] - For each of the determined visual role usages,
     *   indicates if an existing field at the automatically determined positions should be replaced by the new field.
     *
     *   When `"auto"` is specified, the target is replaced only if the visual role has no more available space
     *   for another field.
     *
     * @return {Array.<pentaho.visual.role.IAddUsage>} An array of visual role usages, possibly empty.
     *
     * @see pentaho.visual.role.util.testAddFieldAtAutoPosition
     */
    getValidRolesForAddingField: function(vizModel, fieldName, keyArgs) {

      var validRoleUsages = [];

      // For each visible visual role...
      vizModel.$type.eachVisualRole(function(propType) {
        if(propType.isBrowsable) {
          var roleUsage = roleUtil.testAddFieldAtAutoPosition(vizModel, propType.name, fieldName, keyArgs);
          if(roleUsage !== null) {
            validRoleUsages.push(roleUsage);
          }
        }
      });

      return validRoleUsages;
    },

    /**
     * Gets the "best" visual role usage for adding a field to a visualization model.
     *
     * This method selects one of the visual role usages returned by
     * {@link pentaho.visual.role.util.getValidRolesForAddingField} by using the following total ordering:
     *
     * 1. The visual role has its minimum fields requirement satisfied.
     *
     * 2. The field's data type is such that it matches directly the
     *    [isContinuous]{@link pentaho.visual.role.Mode#isContinuous} property of the
     *    [visual role usage]{@link pentaho.visual.role.IAddUsage#mode}.
     *
     * 3. The visual role has a lower number of mapped fields.
     *
     * 4. The visual order of the visual role,
     *    according to its [ordinal]{@link pentaho.visual.role.PropertyType#ordinal} property.
     *
     * 5. The definition order of the visual role,
     *    according to its [index]{@link pentaho.visual.role.PropertyType#index} property.
     *
     * @param {pentaho.visual.base.AbstractModel} vizModel - The visualization model.
     * @param {string} fieldName - The name of the field.
     *
     * @param {object} [keyArgs] - The keyword arguments object.
     *
     * @param {?pentaho.data.Table} [keyArgs.alternateData] - An alternate data table which certainly
     *  contains all of the currently mapped fields plus the new field.
     *
     * @param {?(boolean|"auto")} [keyArgs.replaceTarget=false] - For each of the determined visual role usages,
     *   indicates if an existing field at the automatically determined positions should be replaced by the new field.
     *
     *   When `"auto"` is specified, the target is replaced only if the visual role has no more available space
     *   for another field.
     *
     * @return {Array.<pentaho.visual.role.IAddUsage>} An array of visual role usages, possibly empty.
     *
     * @see pentaho.visual.role.util.testAddFieldAtAutoPosition
     */
    getBestRoleForAddingField: function(vizModel, fieldName, keyArgs) {

      var dataTable = arg.optional(keyArgs, "alternateData") || vizModel.data;
      if(dataTable === null) {
        return null;
      }

      var validRoleUsages = roleUtil.getValidRolesForAddingField(vizModel, fieldName, keyArgs);
      if(validRoleUsages.length === 0) {
        return null;
      }

      // Sort valid role usages and return the "best" one.

      var columnIndex = dataTable.getColumnIndexById(fieldName);
      var isFieldContinuous = dataUtil.isColumnTypeContinuous(dataTable.getColumnType(columnIndex));

      var orderedValidRoleUsages = sortByProps(validRoleUsages, [

        // 1. Satisfied?
        function(roleUsage) {
          var mapping = vizModel.get(roleUsage.name);

          // NOTE: This is the countRange **before** adding the field to the visual role.
          var countRange = roleUsage.propType.fields.countRangeOn(vizModel);

          var isUnsatisfied = mapping.fields.count < countRange.min;

          return isUnsatisfied ? 0 : 1;
        },

        // 2. "Measurement level" distance to that of the field.
        function(roleUsage) {

          if(roleUsage.mode.isContinuous) {
            // ==> isFieldContinuous (or wouldn't be valid)
            return 0;
          }

          if(!isFieldContinuous) {
            // Both are categorical.
            return 0;
          }

          // Field is continuous and downgrades to a categorical role.
          return 1;
        },

        // 3. Try to keep together fields from the same hierarchy
        // NOTE: AS IS IT IS ONLY VALID FOR ANALYZER - introduced to solve 8.2 regression BACKLOG-26273.
        // TODO Do this in a proper way, like by adding hierarchy information to the metadata
        function(roleUsage) {
          var mapping = vizModel.get(roleUsage.name);

          var allFieldsFromTheSameHierarchy = false;

          if (mapping.fields.count > 0) {
            var lastFormulaSeparatorIndex = roleUsage.fieldName.lastIndexOf("].[");

            if(lastFormulaSeparatorIndex > 0) {
              allFieldsFromTheSameHierarchy = true;

              var hierarchy = roleUsage.fieldName.substring(0, lastFormulaSeparatorIndex + 1);

              mapping.fields.each(function(field) {
                if(field.name.indexOf(hierarchy) !== 0) {
                  allFieldsFromTheSameHierarchy = false;
                  return false;
                }
              });
            }
          }

          return allFieldsFromTheSameHierarchy ? 0 : 1;
        },

        // 4. Number of currently mapped fields.
        function(roleUsage) {
          var mapping = vizModel.get(roleUsage.name);

          return mapping.fields.count;
        },

        // 5. Visual order.
        function(roleUsage) {
          return roleUsage.propType.ordinal;
        },

        // 6. Role definition order (for stability).
        function(roleUsage) {
          return roleUsage.propType.index;
        }
      ]);

      return orderedValidRoleUsages[0];
    }
  };

  return roleUtil;

  /**
   * Sorts the elements of an array, in place,
   * according to the values of some of its properties.
   *
   * @param {Array} list - The array to sort.
   * @param {Array.<(function(any) : any)>} propGetters - An array of property getter functions.
   *
   * @return {Array} The specified array.
   */
  function sortByProps(list, propGetters) {

    var P = propGetters.length;

    return list.sort(function(elemA, elemB) {
      var i = -1;
      while(++i < P) {
        var propGetter = propGetters[i];
        var result = F.compare(propGetter(elemA), propGetter(elemB));
        if(result !== 0) {
          return result;
        }
      }

      return 0;
    });
  }
});
