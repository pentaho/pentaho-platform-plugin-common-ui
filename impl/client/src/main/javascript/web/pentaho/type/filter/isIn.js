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
     * @name pentaho.type.filter.IsIn.Type
     * @class
     * @extends pentaho.type.Property.Type
     *
     * @classDesc The type class of the membership filter type.
     *
     * For more information see {@link pentaho.type.filter.IsIn}.
     *
     * @private
     */

    /**
     * @name pentaho.type.filter.IsIn
     * @class
     * @extends pentaho.type.filter.Property
     * @amd {pentaho.type.Factory<pentaho.type.filter.IsIn>} pentaho/type/filter/isIn
     *
     * @classDesc The `IsIn` class represents a membership filter.
     * This filter selects elements in which the value of a certain property belongs to
     * a certain reference set, [values]{@link pentaho.type.filter.IsIn#values}.
     *
     * @description Creates a membership filter instance.
     *
     * @constructor
     * @param {pentaho.type.filter.spec.IIsIn} [spec] - A membership filter specification.
     *
     * @private
     */

    return PropertyFilter.extend("pentaho.type.filter.IsIn", /** @lends pentaho.type.filter.IsIn# */{

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

      _operation: function(value) {
        if(value != null) {
          var values = this.values;
          var L = values.count;
          var i = -1;
          while(++i < L) if(values.at(i).valueOf() === value) return true;
        }

        return false;
      },

      _buildContentKey: function() {
        return (this.property || "") + " " + this.values.toArray(function(v) { return v.key; }).join(" ");
      },

      type: /** @lends pentaho.type.filter.IsIn.Type# */{
        id: module.id,
        alias: "in",
        props: [
          {
            // may be empty
            name: "values",
            nameAlias: "v",
            type: ["element"],
            isReadOnly: true,
            isBoundary: true
          }
        ]
      }
    });
  };
});
