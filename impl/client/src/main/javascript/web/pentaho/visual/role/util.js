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
     * Tests if it would be valid to add a field to a visual role.
     *
     * This method allows moving, appending/inserting or replacing a field in a visual role.
     *
     * When `fieldName` is already mapped to the visual role:
     * 1. When `targetFieldPosition` is not specified, the field is moved to the last position,
     *    if it is not already its position, in which case `null` is returned.
     *
     * 2. Otherwise, the field is moved to the specified position,
     *    if it is not already its position, in which case `null` is returned.
     *
     * When `targetFieldPosition` is not specified:
     * 1. When `fieldName` is already mapped to the visual role,
     *    the field is moved to the last position.
     * 2. Otherwise,
     *
     * When valid, returns the corresponding visual role usage.
     *
     * @param {pentaho.visual.base.AbstractModel} vizModel - The visualization model.
     * @param {pentaho.data.Table} dataTable - The data table in which all the fields,
     *  including the new one, is defined.
     * @param {string} roleName - The name of the visual role.
     * @param {string} fieldName - The name of the field.
     * @param {?number} targetFieldPosition - The new index of the field in the visual role's field list.
     *   When unspecified and the field is already mapped to the visual role, then it is moved.
     *
     *   When unspecified and the position is determined automatically,
     *   by attempting every position, starting from the one after the last mapped field.
     *
     *   Otherwise,
     *   when `replaceTarget` is `true`, the field replaces the existing one at the given position.
     *   When `replaceTarget` is `false`, the field is inserted before the existing one.
     *
     * @param {?boolean} replaceTarget - Indicates that the field should
     *   replace the existing field at the given position,
     *   instead of being inserted before the existing field.
     *
     *   This argument is ignored if `targetFieldPosition` is not specified.
     *
     * @return {?pentaho.visual.role.Mode} The resulting visual role mode, when valid;
     *  `null`, otherwise.
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
      var mappingField = mappingFields.get(fieldName);

      var fieldPosition = arg.optional(keyArgs, "fieldPosition", null);
      var replaceTarget = false;

      if(fieldPosition != null) {
        // `fieldPosition` may be >= length, in which case `null` is returned.
        var targetMappingField = mappingFields.at(fieldPosition);
        if(targetMappingField !== null) {
          if(targetMappingField === mappingField) {
            // Same position (replaceTarget is irrelevant).
            return null;
          }

          replaceTarget = arg.optional(keyArgs, "replaceTarget", false);
          if(replaceTarget === "auto") {
            // Enter replace mode if there is no room to add/insert.
            replaceTarget = mappingFields.count >= propType.fields.countRangeOn(vizModel).max;
          }
        }
      } else if(mappingField !== null) {
        // To last position.
        fieldPosition = mappingFields.count;

        // Already at the last position, so no actual move?
        if(mappingFields.at(fieldPosition - 1) === mappingField) {
          return null;
        }
      }

      return Transaction.enter().using(function(scope) {

        // Make the changes.

        if(alternateDataTable !== null) {
          vizModel.data = alternateDataTable;
        }

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
          propType: propType, // cache
          fieldPosition: fieldPosition,
          replaceTarget: replaceTarget,
          mode: mapping.mode
        };
      });
    },

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

        // 3. Number of currently mapped fields.
        function(roleUsage) {
          var mapping = vizModel.get(roleUsage.name);

          return mapping.fields.count;
        },

        // 4. Visual order.
        function(roleUsage) {
          return roleUsage.propType.ordinal;
        },

        // 5. Role definition order (for stability).
        function(roleUsage) {
          return roleUsage.propType.index;
        }
      ]);

      return orderedValidRoleUsages[0];
    }
  };

  return roleUtil;

  function sortByProps(list, propAccessors) {

    var P = propAccessors.length;

    return list.sort(function(elemA, elemB) {
      var i = -1;
      while(++i < P) {
        var propAccessor = propAccessors[i];
        var result = F.compare(propAccessor(elemA), propAccessor(elemB));
        if(result !== 0) {
          return result;
        }
      }

      return 0;
    });
  }
});
