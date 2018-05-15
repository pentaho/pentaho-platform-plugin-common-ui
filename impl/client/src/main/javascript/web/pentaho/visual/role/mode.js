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
  "pentaho/module!",
  "pentaho/type/Complex",
  "pentaho/i18n!messages"
], function(module, Complex, bundle) {

  "use strict";

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
   * @amd pentaho/visual/role/Mode
   *
   * @classDesc The `Mode` class describes a specific operating mode of a visual role
   * in terms of the [data type]{@link pentaho.visual.role.Mode#dataType} of its value and
   * of the [type of scale]{@link pentaho.visual.role.Mode#isContinuous}, continuous or categorical,
   * used to encode it.
   *
   * The `Mode` type is an [entity]{@link pentaho.type.Value.Type#isEntity} type.
   *
   * @description Creates a visual role operating mode instance.
   * @constructor
   * @param {pentaho.visual.role.spec.IMode} [spec] A visual role operating mode specification.
   */
  var VisualRoleMode = Complex.extend(/** @lends pentaho.visual.role.Mode# */{

    constructor: function(spec, keyArgs) {
      this.base(this.$type.normalizeInstanceSpec(spec), keyArgs);
    },

    /**
     * Gets the (immutable) key of the visual role mode.
     *
     * The key is a string composed from the key of the [dataType]{@link pentaho.visual.role.Mode#dataType} and
     * the value of [isContinuous]{@link pentaho.visual.role.Mode#isContinuous}.
     *
     * @type {string}
     * @readOnly
     * @override
     * @see pentaho.type.Value.Type#isEntity
     */
    get $key() {
      return this.get("dataType").$key + "|" + this.isContinuous;
    },

    /**
     * Gets a value that indicates this operation mode is applicable to
     * a given list of field types.
     *
     * @param {!Array.<pentaho.type.Instance.Type>} fieldTypes - The list of field types.
     *
     * @return {boolean} `true` if this operation mode is applicable to `fieldTypes`; `false` otherwise.
     */
    canApplyToFieldTypes: function(fieldTypes) {
      var dataType = this.dataType;
      var elementType = dataType.elementType;

      if(dataType.isElement) {
        if(fieldTypes.length > 1) {
          return false;
        }
      } else if(!dataType.isList) {
        // abstract instance
        return true;
      }

      return fieldTypes.every(function(fieldType) {
        return fieldType.isSubtypeOf(elementType);
      });
    },

    /** @inheritDoc */
    toSpecInContext: function(keyArgs) {

      var spec = this.base(keyArgs);

      if(spec.constructor === Object) {
        // If only the dataType is output, then return it directly.
        var count = 0;
        var dataType = null;

        /* eslint guard-for-in: 0 */
        for(var p in spec) {
          count++;
          if(count > 1 || p !== "dataType") break;
          // count === 0 && p === name
          dataType = spec.dataType;
        }

        if(dataType !== null && count === 1) {
          spec = dataType;
        }
      }

      return spec;
    },

    $type: /** @lends pentaho.visual.role.Mode.Type# */{
      id: module.id,

      isEntity: true,

      // @override
      _normalizeInstanceSpec: function(valueSpec) {
        // The dataType property?
        return valueSpec.constructor !== Object ? {dataType: valueSpec} : valueSpec;
      },

      // @override
      hasNormalizedInstanceSpecKeyData: function(valueSpec) {
        return valueSpec.dataType !== undefined || valueSpec.isContinuous !== undefined;
      },

      props: [
        /**
         * Gets the data type of the visual role value when operating in this mode.
         *
         * This property is immutable and can only be specified at construction time.
         *
         * When unspecified, or specified as `null`,
         * the default value is {@link pentaho.type.Instance},
         * meaning that values of any data type are accepted.
         *
         * @name pentaho.visual.role.Mode#dataType
         * @type {!pentaho.type.Instance.Type}
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
         * when the data type is not [continuous]{@link pentaho.type.Instance.Type#isContinuous} then
         * this property is `false` as well.
         * When this is not the case, it is assumed that the visualization somehow
         * is able to convert the categorical data type into a continuous value.
         *
         * When unspecified, or specified as `null`,
         * defaults to the value of [isContinuous]{@link pentaho.type.Instance.Type#isContinuous} of the
         * [element type]{@link pentaho.type.Instance.Type#elementType}
         * of the mode's
         * [data type]{@link pentaho.visual.role.Mode#dataType}.
         *
         * The types {@link pentaho.type.Number} and {@link pentaho.type.Date} are known to be continuous.
         *
         * @name pentaho.visual.role.Mode#isContinuous
         * @type {boolean}
         *
         * @see pentaho.visual.role.spec.IMode#isContinuous
         * @see pentaho.type.Instance.Type#elementType
         * @see pentaho.visual.role.Mode#dataType
         */
        {
          name: "isContinuous",
          valueType: "boolean",
          isRequired: true,
          isReadOnly: true,
          defaultValue: function() {
            // Surely, `dataType` has already been initialized, based on property definition order.
            return this.dataType.elementType.isContinuous;
          }
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Mode})
  .configure({$type: module.config});

  return VisualRoleMode;
});
