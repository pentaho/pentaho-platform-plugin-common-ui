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
  "module",
  "./impl/TupleMapper"
], function(module, TupleMapper) {

  "use strict";

  return [
    "./base",
    function(Base) {

      /**
       * @name pentaho.visual.role.strategies.Tuple.Type
       * @class
       * @extends pentaho.visual.role.strategies.Base.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.strategies.Tuple}.
       */

      /**
       * @name pentaho.visual.role.strategies.Tuple
       * @class
       * @extends pentaho.visual.role.strategies.Base
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.strategies.Tuple>} pentaho/visual/role/strategies/tuple
       *
       * @classDesc The `Tuple` class describes the strategy of mapping one or more data properties
       * to an array of those values, and back.
       *
       * The strategy targets:
       * 1. modes whose [dataType]{@link pentaho.visual.role.Mode#dataType} is a
       *   [list]{@link pentaho.type.Type#isList}, and
       * 2. mappings of fields whose [type][@link pentaho.data.ITable#getColumnType] can be assigned to the
       *   [element type]{@link pentaho.type.List.Type#of} of the mode's list data type.
       * 3. mappings of fields whose data type is [continuous][@link pentaho.type.Type#isContinuous] nature
       *   is compatible with the mode's [continuous]{@link pentaho.visual.role.Mode#isContinuous} nature;
       *   if the mode is continuous, then all mapped fields need to be as well.
       *
       * @description Creates a _tuple_ mapping strategy instance.
       * @constructor
       * @param {pentaho.visual.role.strategies.spec.IBase} [spec] A _tuple_ mapping strategy specification.
       */
      var Tuple = Base.extend(/** @lends pentaho.visual.role.strategies.Tuple# */{
        $type: /** @lends pentaho.visual.role.strategies.Tuple.Type# */{
          id: module.id
        },

        /** @override */
        getMapper: function(propType, inputData, mode) {

          // 1) The mode's value data type is a list.
          var dataType = mode.dataType;
          if(!dataType.isList) {
            return null;
          }

          var columnIndex;
          var columnCount = inputData.getNumberOfColumns();

          var columnType;

          // 2) The data type of each column must be assignable to the element type.
          var elemType = dataType.of;
          if(elemType.alias !== "element") {
            var context = dataType.context;

            columnIndex = -1;
            while(++columnIndex < columnCount) {
              columnType = context.get(inputData.getColumnType(columnIndex)).type;
              if(!columnType.isSubtypeOf(elemType)) {
                return null;
              }
            }
          }

          // 3) Compatible continuous nature.
          if(mode.isContinuous) {
            // All columns need to be continuous as well.
            columnIndex = -1;
            while(++columnIndex < columnCount) {
              columnType = context.get(inputData.getColumnType(columnIndex)).type;
              if(!columnType.isContinuous) {
                return null;
              }
            }
          }

          return new TupleMapper(this, propType, inputData, mode);
        }
      });

      return Tuple;
    }
  ];
});
