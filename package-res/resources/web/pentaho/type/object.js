/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "./simple",
  "../i18n!types"
], function(module, simpleFactory, bundle) {

  "use strict";

  var _simpleObjectNextUid = 1;

  return function(context) {

    var Simple = context.get(simpleFactory);

    /**
     * @name pentaho.type.Object
     * @class
     * @extends pentaho.type.Simple
     * @amd {pentaho.type.Factory<pentaho.type.Object>} pentaho/type/object
     *
     * @classDesc A primitive JavaScript object type.
     *
     * @description Creates an object instance.
     */
    return Simple.extend("pentaho.type.Object", /** @lends "pentaho.type.Object#" */{
      constructor: function(spec) {
        this.base(spec);

        this._uid = String(_simpleObjectNextUid++);
      },

      /**
       * Gets the unique key of the native object.
       *
       * The key of a value identifies it among its _peers_.
       *
       * @type string
       * @readonly
       */
      get key() {
        return this._uid;
      },

      /**
       * Gets the underlying object value of the value.
       * @name pentaho.type.Object#value
       * @type object
       * @readonly
       */

      type: {
        id: module.id,
        styleClass: "pentaho-type-object",
        cast: Object
      }
    }).implement({
      type: bundle.structured["object"]
    });
  };
});
