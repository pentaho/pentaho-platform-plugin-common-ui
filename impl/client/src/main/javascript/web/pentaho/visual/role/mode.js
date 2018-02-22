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
  "pentaho/i18n!messages"
], function(module, bundle) {

  "use strict";

  return [
    "complex",
    function(Complex) {

      /**
       * @name pentaho.visual.role.Mode.Type
       * @class
       * @extends pentaho.type.Complex.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.Mode}.
       */

      /**
       * @name pentaho.visual.role.Mode
       * @class
       * @extends pentaho.type.Complex
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.Mode>} pentaho/visual/role/mode
       *
       * @classDesc The `Mode` class describes a specific operating mode of a visual role
       * in terms of the [data type]{@link pentaho.visual.role.Mode#dataType} of its value and
       * of the [type of scale]{@link pentaho.visual.role.Mode#isContinuous}, continuous or categorical,
       * used to encode it.
       *
       * @description Creates a visual role operating mode instance.
       * @constructor
       * @param {pentaho.visual.role.spec.IMode} [spec] A visual role operating mode specification.
       */
      var VisualRoleMode = Complex.extend(/** @lends pentaho.visual.role.Mode# */{

        /**
         * Gets the (immutable) key of the visual role mode.
         *
         * The key is a string composed from the key of the [dataType]{@link pentaho.visual.role.Mode#dataType} and
         * the value of [isContinuous]{@link pentaho.visual.role.Mode#isContinuous}.
         *
         * @type {string}
         * @readOnly
         * @override
         */
        get $key() {
          return this.get("dataType").$key + "|" + this.isContinuous;
        },

        $type: /** @lends pentaho.visual.role.Mode.Type# */{
          id: module.id,
          props: [
            /**
             * Gets the data type of the visual role value when operating in this mode.
             *
             * When unspecified, or specified as `null`,
             * the default value is {@link pentaho.type.Instance},
             * meaning that values of any data type are accepted.
             *
             * @name pentaho.visual.role.Mode#dataType
             * @type {!pentaho.type.Type}
             *
             * @see pentaho.visual.role.spec.IMode#dataType
             */
            {
              name: "dataType",
              valueType: "type",
              isRequired: true,
              defaultValue: "instance",
              isReadOnly: true
            },

            // Non-consistency example 1: {dataType: "geoName", isContinuous: true}
            // The visualization does the geo localization itself...
            // Non-consistency example 2: {dataType: ["number"], isContinuous: true}
            // Generic measure use case. Each field is handled directly.
            /**
             * Gets the type of scale, continuous or categorical,
             * used by the associated visual role to encode values when operating in this mode.
             *
             * This property is immutable and can only be specified at construction time.
             *
             * Typically, the value of this property is consistent with that of
             * [dataType]{@link pentaho.visual.role.Mode#dataType} -
             * when the data type is not [continuous]{@link pentaho.type.Type#isContinuous} then
             * this property is `false` as well.
             * When this is not the case, it is assumed that the visualization somehow
             * is able to convert the categorical data type into a continuous value.
             *
             * When unspecified, or specified as `null`,
             * defaults to the value of [isContinuous]{@link pentaho.type.Type#isContinuous} of
             * [dataType]{@link pentaho.visual.role.Mode#dataType}.
             *
             * The types {@link pentaho.type.Number} and {@link pentaho.type.Date} are known to be continuous.
             *
             * @name pentaho.visual.role.Mode#isContinuous
             * @type {boolean}
             *
             * @see pentaho.visual.role.spec.IMode#isContinuous
             */
            {
              name: "isContinuous",
              valueType: "boolean",
              isRequired: true,
              isReadOnly: true,
              defaultValue: function() {
                // Surely, `dataType` has already been initialized, based on property definition order.
                return this.dataType.isContinuous;
              }
            }
          ]
        }
      })
      .implement({$type: bundle.structured.mode});

      return VisualRoleMode;
    }
  ];
});
