/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!../IsGreater",
  "../KnownFilterKind"
], function(module, KnownFilterKind) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.IsGreaterType
     * @class
     * @extends pentaho.data.filter.PropertyType
     *
     * @classDesc The type class of the strict greater than filter type.
     *
     * For more information see {@link pentaho.data.filter.IsGreater}.
     */

    /**
     * @name pentaho.data.filter.IsGreater
     * @class
     * @extends pentaho.data.filter.Property
     * @amd pentaho/data/filter/IsGreater
     *
     * @classDesc The `IsGreater` class represents a filter for being strictly greater than a given value.
     * The filter selects elements having the value of a certain property strictly greater than a reference
     * value: [value]{@link pentaho.data.filter.IsGreater#value}.
     *
     * @description Creates a greater than filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsGreater} [spec] - A greater than filter specification.
     */

    filter.IsGreater = filter.Property.extend(/** @lends pentaho.data.filter.IsGreater# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsGreater;
      },

      /**
       * Gets the expected value of the property.
       *
       * This getter is a shorthand for `this.getv("value")`.
       *
       * @name value
       * @memberOf pentaho.data.filter.IsGreater#
       * @type {pentaho.type.Element}
       *
       * @readOnly
       */

      /** @inheritDoc */
      negate: function() {
        return new filter.IsLessOrEqual({property: this.property, value: this.value});
      },

      /** @inheritDoc */
      _compile: function() {

        var property = this.property;
        var referenceValue = this.value;

        return function isGreaterContains(elem) {
          var value = elem.getv(property, true);
          return value !== null && referenceValue > value;
        };
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var v = this.get("value");
        return (this.property || "") + " " + (v ? v.$key : "");
      },

      $type: /** @lends pentaho.data.filter.IsGreaterType# */{
        id: module.id,
        props: [
          {
            name: "value",
            nameAlias: "v",
            valueType: "element",
            isRequired: true,
            isBoundary: true
          }
        ]
      }
    });
  };
});
