/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "./PrimitiveChange"
], function(PrimitiveChange) {
  "use strict";

  return PrimitiveChange.extend("pentaho.type.Remove", /** @lends pentaho.type.changes.Remove# */{

    /**
     * @name Remove
     * @memberOf pentaho.type.changes
     * @class
     * @extends pentaho.type.changes.PrimitiveChange
     * @amd pentaho/type/changes/Remove
     *
     * @classDesc The `Remove` class describes the primitive operation that
     * removes a set of contiguous elements from a list.
     *
     * This type of change is always part of a {@link pentaho.type.changes.ListChangeset}.
     *
     * @constructor
     * @description Creates an instance.
     *
     * @param {!Array.<pentaho.type.Element>} elems - The elements to be removed from the list.
     * @param {number} index - The starting index of the elements in the list.
     */
    constructor: function(elems, index) {
      /**
       * Gets the elements that are removed from the list.
       *
       * @type {!Array.<pentaho.type.Element>}
       * @readOnly
       */
      this.elements = elems;

      /**
       * Gets the index of the element in the list.
       *
       * @type {number}
       * @readOnly
       */
      this.index = index;
    },

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "remove"
     */
    get type() {
      return "remove";
    },

    _apply: function(target) {

      var elems = this.elements;

      target._elems.splice(this.index, elems.length);

      elems.forEach(function(elem) {
        delete target._keys[elem.key];
      });
    }
  });
});
