/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
   * @name pentaho.visual.role.MappingField
   * @class
   * @extends pentaho.type.Complex
   *
   * @amd pentaho/visual/role/MappingField
   *
   * @classDesc The `MappingField` class represents a field in a
   * [visual role mapping]{@link pentaho.visual.role.AbstractMapping}.
   *
   * The `Mode` type is an [entity]{@link pentaho.type.Value.Type#isEntity} type.
   *
   * @see pentaho.visual.role.AbstractMapping
   *
   * @description Creates a visual role mapping field instance.
   * @constructor
   * @param {pentaho.visual.role.spec.UMappingField} [spec] A visual role mapping field specification.
   */
  return Complex.extend(/** @lends pentaho.visual.role.MappingField# */{

    constructor: function(spec, keyArgs) {
      this.base(this.$type.normalizeInstanceSpec(spec), keyArgs);
    },

    /**
     * Gets the (immutable) key of the visual role mapping field.
     *
     * The key is the value of the [name]{@link pentaho.visual.role.MappingField#name} property.
     *
     * @type {string}
     * @readOnly
     * @override
     * @see pentaho.type.Value.Type#isEntity
     */
    get $key() {
      return this.name;
    },

    /** @inheritDoc */
    toSpecInContext: function(keyArgs) {

      var spec = this.base(keyArgs);

      if(spec.constructor === Object) {
        // If only the name is output, then return it directly.
        var count = 0;
        var name = null;

        /* eslint guard-for-in: 0 */
        for(var p in spec) {
          count++;
          if(count > 1 || p !== "name") break;
          // count === 0 && p === name
          name = spec.name;
        }

        if(name && count === 1) {
          spec = name;
        }
      }

      return spec;
    },

    $type: /** @lends pentaho.visual.role.MappingField.Type# */{

      id: module.id,

      // @override
      _normalizeInstanceSpec: function(valueSpec) {
        // The name property?
        return (typeof valueSpec === "string") ? {name: valueSpec} : valueSpec;
      },

      // @override
      hasNormalizedInstanceSpecKeyData: function(valueSpec) {
        return valueSpec.name !== undefined;
      },

      props: [
        /**
         * Gets or sets the name of the field.
         *
         * This property is immutable and can only be specified at construction time.
         *
         * This property is required.
         *
         * @name pentaho.visual.role.MappingField#name
         * @type {string}
         * @see pentaho.visual.role.spec.IMappingField#name
         */
        {name: "name", valueType: "string", isRequired: true, isReadOnly: true}
      ]
    }
  })
  .localize({$type: bundle.structured.MappingField})
  .configure({$type: module.config});
});
