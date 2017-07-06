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
  "../lang/Base"
], function(module, Base) {

  "use strict";

  return Base.Array.extend(module.id, /** @lends pentaho.type.ReferenceList# */{

    /**
     * @alias ReferenceList
     * @memberOf pentaho.type
     * @class
     * @extends pentaho.lang.Base.Array
     * @private
     *
     * @classDesc The `ReferenceList` class describes a list of references to a container instance.
     *
     * @constructor
     * @description Creates an empty `Changeset` for a given owner value.
     */
    constructor: function() {
    },

    /**
     * Adds a reference to the owner of this reference list.
     *
     * @param {!pentaho.type.mixins.Container} container - The container that references the owner of this reference
     * list.
     * @param {pentaho.type.Property.Type} [propType] When `container` is a complex,
     * the property type whose value contains the owner of this reference list.
     *
     * @private
     */
    add: function(container, propType) {
      this.push({container: container, property: propType || null});
    },

    /**
     * Removes a reference to the owner of this reference list.
     *
     * @param {!pentaho.type.mixins.Container} container - The container that references the owner of this reference
     * list.
     * @param {pentaho.type.Property.Type} [propType] When `container` is a complex,
     * the property type whose value used to reference.
     *
     * @return {boolean} `true` if the reference existed and was removed; `false`, otherwise.
     */
    remove: function(container, propType) {
      // Expecting just a few references; commonly, 1 ref.
      if(!propType) propType = null;

      var i = this.length;
      while(i--) {
        var aref = this[i];
        if(aref.container === container && aref.property === propType) {
          this.splice(i, 1);
          return true;
        }
      }
      return false;
    }
  });
});
