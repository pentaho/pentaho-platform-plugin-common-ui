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
  "module",
  "./property",
  "./KnownFilterKind"
], function(module, propertyFactory, KnownFilterKind) {

  "use strict";

  return function(context) {

    var PropertyFilter = context.get(propertyFactory);

    // TODO: Opted to keep isIn @private, undocumented, for 7.1. Currently its use could cause problems with the
    // DNF algorithm (simplifications are not performed).
    // Also, existing containers don't currently generate filters with isIn.

    /**
     * @name pentaho.data.filter.IsIn.Type
     * @class
     * @extends pentaho.data.filter.Property.Type
     *
     * @classDesc The type class of the membership filter type.
     *
     * For more information see {@link pentaho.data.filter.IsIn}.
     *
     * @private
     */

    /**
     * @name pentaho.data.filter.IsIn
     * @class
     * @extends pentaho.data.filter.Property
     * @amd {pentaho.type.Factory<pentaho.data.filter.IsIn>} pentaho/data/filter/isIn
     *
     * @classDesc The `IsIn` class represents a membership filter.
     * This filter selects elements in which the value of a certain property belongs to
     * a certain reference set: [values]{@link pentaho.data.filter.IsIn#values}.
     *
     * @description Creates a membership filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IIsIn} [spec] - A membership filter specification.
     *
     * @private
     */

    return PropertyFilter.extend("pentaho.data.filter.IsIn", /** @lends pentaho.data.filter.IsIn# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.IsIn;
      },

      // TODO: In the future, review if values should be of type pentaho.type.Value[].
      /**
       * Gets the possible values of the property.
       *
       * This getter is a shorthand for `this.get("values")`.
       *
       * @type {Array.<any>}
       *
       * @readOnly
       */
      get values() {
        return this.get("values");
      },

      /** @inheritDoc */
      _operation: function(value) {
        if(value != null) {
          var values = this.values;
          var L = values.count;
          var i = -1;
          while(++i < L) if(values.at(i).valueOf() === value) return true;
        }

        return false;
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        return (this.property || "") + " " + this.values.toArray(function(v) { return v.$key; }).join(" ");
      },

      type: /** @lends pentaho.data.filter.IsIn.Type# */{
        id: module.id,
        alias: "in",
        props: [
          {
            // may be empty
            name: "values",
            nameAlias: "v",
            valueType: ["element"],
            isReadOnly: true,
            isBoundary: true
          }
        ]
      }
    });
  };
});
