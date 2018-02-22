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
  "./impl/IdentityMapper"
], function(module, IdentityMapper) {

  "use strict";

  return [
    "./base",
    function(Base) {

      /**
       * @name pentaho.visual.role.strategies.Identity.Type
       * @class
       * @extends pentaho.visual.role.strategies.Base.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.strategies.Identity}.
       */

      /**
       * @name pentaho.visual.role.strategies.Identity
       * @class
       * @extends pentaho.visual.role.strategies.Base
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.strategies.Identity>} pentaho/visual/role/strategies/identity
       *
       * @classDesc The `Identity` class describes the strategy of mapping data, without modification,
       * from the data space to the visual space, and back.
       *
       * The _identity_ strategy targets:
       * 1. Mappings with a single field;
       * 2. Modes whose [dataType]{@link pentaho.visual.role.Mode#dataType} can
       *    be assigned to the data type of the mapped field;
       * 3. Modes whose [continuous]{@link pentaho.visual.role.Mode#isContinuous} nature is compatible
       *    with the [continuous]{@link pentaho.data.ITable#isColumnContinuous} nature of the mapped field:
       *    if the mapped field is categorical it cannot be mapped to a continuous mode.
       *
       * @description Creates an _identity_ mapping strategy instance.
       * @constructor
       * @param {pentaho.visual.role.strategies.spec.IBase} [spec] An _identity_ mapping strategy specification.
       */
      var Identity = Base.extend(/** @lends pentaho.visual.role.strategies.Identity# */{
        $type: /** @lends pentaho.visual.role.strategies.Identity.Type# */{
          id: module.id
        },

        /** @override */
        getMapper: function(propType, inputData, mode) {

          // 1) Can handle a single column.
          if(inputData.getNumberOfColumns() !== 1) {
            return null;
          }

          // 2) Compatible dataType.
          var columnType = propType.context.get(inputData.getColumnType(0)).type;
          if(!columnType.isSubtypeOf(mode.dataType)) {
            return null;
          }

          // 3) Compatible continuous nature.
          if(mode.isContinuous && !inputData.isColumnContinuous(0)) {
            return null;
          }

          return new IdentityMapper(this, propType, inputData, mode, columnType);
        }
      });

      return Identity;
    }
  ];
});
