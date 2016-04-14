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

  return PrimitiveChange.extend("pentaho.type.Move", /** @lends pentaho.type.changes.Move# */{

    /**
     * @name Move
     * @memberOf pentaho.type.changes
     * @class
     * @extends pentaho.type.changes.PrimitiveChange
     * @amd pentaho/type/changes/Move
     *
     * @classDesc The `Move` class describes the primitive operation that
     * changes an element position inside a list.
     *
     * This type of change is always part of a {@link pentaho.type.changes.ListChangeset}.
     *
     * @constructor
     * @description Creates an instance.
     *
     * @param {!Array.<pentaho.type.Element>} elem - The element to be moved in the list.
     * @param {number} oldIndex - The index of the element in the list.
     * @param {number} newIndex - The new index of the element in the list.
     */
    constructor: function(elem, oldIndex, newIndex) {
      /**
       * Gets the element that is about to be moved in the list.
       *
       * @type {!pentaho.type.Element}
       * @readOnly
       */
      this.element = elem;

      /**
       * Gets the old index of the element in the list.
       *
       * @type {number}
       * @readOnly
       */
      this.oldIndex = oldIndex;

      /**
       * Gets the new index of the element in the list.
       *
       * @type {number}
       * @readOnly
       */
      this.newIndex = newIndex;
    },

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "remove"
     */
    get type() {
      return "move";
    },

    _apply: function(target) {
      target._elems.splice(this.newIndex, 0, target._elems.splice(this.oldIndex, 1)[0]);
    }
  });
});
