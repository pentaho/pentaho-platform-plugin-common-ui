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
  "module",
  "./property",
  "./KnownFilterKind"
], function(module, propertyFactory, KnownFilterKind) {

  "use strict";

  return function(context) {

    var PropertyFilter = context.get(propertyFactory);

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
     * @amd {pentaho.type.Factory<pentaho.data.filter.IsLessOrEqual>} pentaho/data/filter/isLessOrEqual
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

    return PropertyFilter.extend("pentaho.data.filter.IsLessOrEqual", /** @lends pentaho.data.filter.IsLessOrEqual# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsLessOrEqual;
      },

      // TODO: In the future, review if value should be of type pentaho.type.Value.
      /**
       * Gets the expected value of the property.
       *
       * This getter is a shorthand for `this.getv("value")`.
       *
       * @type {any}
       *
       * @readOnly
       */
      get value() {
        return this.getv("value");
      },

      /** @inheritDoc */
      _operation: function(value) {
        return this.value <= value;
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var v = this.get("value");
        return (this.property || "") + " " + (v ? v.key : "");
      },

      type: /** @lends pentaho.data.filter.IsLessOrEqual.Type# */{
        id: module.id,
        alias: "<=",
        props: [
          {
            name: "value",
            nameAlias: "v",
            valueType: "value",
            isRequired: true,
            isReadOnly: true,
            isBoundary: true
          }
        ]
      }
    });
  };
});
