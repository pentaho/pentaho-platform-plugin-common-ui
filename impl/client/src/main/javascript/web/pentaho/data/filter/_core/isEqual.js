/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
     * @name pentaho.data.filter.IsEqual.Type
     * @class
     * @extends pentaho.data.filter.Property.Type
     *
     * @classDesc The type class of the equality filter type.
     *
     * For more information see {@link pentaho.data.filter.IsEqual}.
     */

    /**
     * @name pentaho.data.filter.IsEqual
     * @class
     * @extends pentaho.data.filter.Property
     * @amd {pentaho.type.Factory<pentaho.data.filter.IsEqual>} pentaho/data/filter/isEqual
     *
     * @classDesc The `IsEqual` class represents an equality filter.
     * This filter selects elements having the value of a certain property equal to
     * a reference value: [value]{@link pentaho.data.filter.IsEqual#value}.
     *
     * @description Creates an equality filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsEqual} [spec] - An equality filter specification.
     */

    filter.IsEqual = filter.Property.extend(/** @lends pentaho.data.filter.IsEqual# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsEqual;
      },

      /**
       * Gets the expected value of the property.
       *
       * This getter is a shorthand for `this.getv("value")`.
       *
       * @name value
       * @memberOf pentaho.data.filter.IsEqual#
       * @type {pentaho.type.Element}
       *
       * @readOnly
       */

      /** @inheritDoc */
      _operation: function(value) {
        return this.value === value;
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var v = this.get("value");
        return (this.property || "") + " " + (v ? v.$key : "");
      },

      $type: /** @lends pentaho.data.filter.IsEqual.Type# */{
        id: "pentaho/data/filter/isEqual",
        alias: "=",
        props: [
          {
            // may be `null`
            name: "value",
            nameAlias: "v",
            valueType: "element",
            isReadOnly: true,
            isBoundary: true
          }
        ]
      }
    });
  };
});
