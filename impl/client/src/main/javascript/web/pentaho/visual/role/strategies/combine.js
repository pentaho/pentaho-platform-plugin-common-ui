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
  "./impl/CombineMapper"
], function(module, CombineMapper) {

  "use strict";

  return [
    "./base",
    function(Base) {

      /**
       * @name pentaho.visual.role.strategies.Combine.Type
       * @class
       * @extends pentaho.visual.role.strategies.Base.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.strategies.Combine}.
       */

      /**
       * @name pentaho.visual.role.strategies.Combine
       * @class
       * @extends pentaho.visual.role.strategies.Base
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.strategies.Combine>} pentaho/visual/role/strategies/combine
       *
       * @classDesc The `Combine` class describes the strategy of mapping one or more data properties
       * to a single _string_ visual value by concatenating the string representation of the values of
       * multiple fields with a special
       * [separator character]{@link pentaho.visual.role.strategies.Combine#valueSeparator}, and back.
       *
       * Formatted values are combined using the
       * [formattedSeparator]{@link pentaho.visual.role.strategies.Combine#formattedSeparator} text.
       *
       * The _combine_ strategy targets:
       * 1. Visual roles which are [visual keys]{@link pentaho.visual.role.Property.Type#isVisualKey};
       * 2. Modes whose [dataType]{@link pentaho.visual.role.Mode#dataType} can
       *    be assigned to [string]{@link pentaho.type.String};
       * 3. Modes which are categorical (not [continuous]{@link pentaho.visual.role.Mode#isContinuous}).
       *
       * @description Creates a _combine_ mapping strategy instance.
       * @constructor
       * @param {pentaho.visual.role.strategies.spec.IBase} [spec] A _combine_ mapping strategy specification.
       */
      var Combine = Base.extend(/** @lends pentaho.visual.role.strategies.Combine# */{
        $type: /** @lends pentaho.visual.role.strategies.Combine.Type# */{
          id: module.id,
          props: [
            /**
             * Gets or sets the text separator used to combine the keys of each field.
             *
             * @name pentaho.visual.role.strategies.Combine#valueSeparator
             * @type {string}
             * @default "~"
             */
            {
              name: "valueSeparator",
              valueType: "string",
              isRequired: true,
              defaultValue: "~"
            },

            /**
             * Gets or sets the text separator used to combine the formatted values of each field.
             *
             * @name pentaho.visual.role.strategies.Combine#formattedSeparator
             * @type {string}
             * @default " ~ "
             */
            {
              name: "formattedSeparator",
              valueType: "string",
              isRequired: true,
              defaultValue: " ~ "
            }
          ]
        },

        /** @override */
        getMapper: function(propType, inputData, mode) {

          // 1) Only really makes sense for key visual roles and categorical modes.
          if(!propType.isVisualKey || mode.isContinuous) {
            return null;
          }

          // 2) The mode's data type is assignable to string.
          var stringType = propType.context.get("string").type;
          if(!stringType.isSubtypeOf(mode.dataType)) {
            return null;
          }

          return new CombineMapper(this, propType, inputData, mode, this.valueSeparator, this.formattedSeparator);
        }
      });

      return Combine;
    }
  ];
});
