/*!
 * Copyright 2017 Pentaho Corporation. All rights reserved.
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
  "../KnownFilterKind"
], function(KnownFilterKind) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.IsGreaterOrEqual.Type
     * @class
     * @extends pentaho.data.filter.Property.Type
     *
     * @classDesc The type class of the greater or equal than filter type.
     *
     * For more information see {@link pentaho.data.filter.IsGreaterOrEqual}.
     */

    /**
     * @name pentaho.data.filter.IsGreaterOrEqual
     * @class
     * @extends pentaho.data.filter.Property
     * @amd {pentaho.type.spec.UTypeModule<pentaho.data.filter.IsGreaterOrEqual>} pentaho/data/filter/isGreaterOrEqual
     *
     * @classDesc The `IsGreaterOrEqual` class represents a filter for being greater than or equal to a given value.
     * The filter selects elements having the value of a certain property greater or equal to a reference
     * value: [value]{@link pentaho.data.filter.IsGreaterOrEqual#value}.
     *
     * @description Creates a greater or equal than filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsGreaterOrEqual} [spec] - A greater than filter specification.
     */

    filter.IsGreaterOrEqual = filter.Property.extend(/** @lends pentaho.data.filter.IsGreaterOrEqual# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsGreaterOrEqual;
      },

      /**
       * Gets the expected value of the property.
       *
       * This getter is a shorthand for `this.getv("value")`.
       *
       * @name value
       * @memberOf pentaho.data.filter.IsGreaterOrEqual#
       * @type {pentaho.type.Element}
       *
       * @readOnly
       */

      /** @inheritDoc */
      negate: function() {
        return new filter.IsLess({property: this.property, value: this.value});
      },

      /** @inheritDoc */
      _compile: function() {

        var property = this.property;
        var referenceValue = this.value;

        return function isGreaterOrEqualContains(elem) {
          var value = elem.getv(property, true);
          return value !== null && referenceValue >= value;
        };
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var v = this.get("value");
        return (this.property || "") + " " + (v ? v.$key : "");
      },

      $type: /** @lends pentaho.data.filter.IsGreaterOrEqual.Type# */{
        id: "pentaho/data/filter/isGreaterOrEqual",
        alias: ">=",
        props: [
          {
            name: "value",
            nameAlias: "v",
            valueType: "element",
            isRequired: true,
            isReadOnly: true,
            isBoundary: true
          }
        ]
      }
    });
  };
});
