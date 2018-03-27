/*!
 * Copyright 2017 Hitachi Vantara. All rights reserved.
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
     * @name pentaho.data.filter.IsLessOrEqual.Type
     * @class
     * @extends pentaho.data.filter.Property.Type
     *
     * @classDesc The type class of the less or equal than filter type.
     *
     * For more information see {@link pentaho.data.filter.IsLessOrEqual}.
     */

    /**
     * @name pentaho.data.filter.IsLessOrEqual
     * @class
     * @extends pentaho.data.filter.Property
     * @amd {pentaho.type.spec.UTypeModule<pentaho.data.filter.IsLessOrEqual>} pentaho/data/filter/isLessOrEqual
     *
     * @classDesc The `IsLessOrEqual` class represents a filter for being less than or equal to a given value.
     * The filter selects elements having the value of a certain property less or equal than a reference
     * value: [value]{@link pentaho.data.filter.isLessOrEqual#value}.
     *
     * @description Creates a less or equal than filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsLessOrEqual} [spec] - A less or equal than filter specification.
     */

    filter.IsLessOrEqual = filter.Property.extend(/** @lends pentaho.data.filter.IsLessOrEqual# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsLessOrEqual;
      },

      /**
       * Gets the expected value of the property.
       *
       * This getter is a shorthand for `this.getv("value")`.
       *
       * @name value
       * @memberOf pentaho.data.filter.IsLessOrEqual#
       * @type {pentaho.type.Element}
       *
       * @readOnly
       */

      /** @inheritDoc */
      negate: function() {
        return new filter.IsGreater({property: this.property, value: this.value});
      },

      /** @inheritDoc */
      _compile: function() {

        var property = this.property;
        var referenceValue = this.value;

        return function isLessOrEqualContains(elem) {
          var value = elem.getv(property, true);
          return value !== null && referenceValue <= value;
        };
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var v = this.get("value");
        return (this.property || "") + " " + (v ? v.$key : "");
      },

      $type: /** @lends pentaho.data.filter.IsLessOrEqual.Type# */{
        id: "pentaho/data/filter/isLessOrEqual",
        alias: "<=",
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
