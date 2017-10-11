/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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

    // To behind its position
    //     v-----+
    // a b c d e F
    // a b F c d e
    //
    // To ahead of its position
    //     +-----v
    // a b C d e f
    // a b d e f C

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
     * @param {number} indexOld - The old index of the element in the list.
     * @param {number} indexNew - The new index of the element in the list.
     */
    constructor: function(elem, indexOld, indexNew) {
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
      this.indexOld = indexOld;

      /**
       * Gets the new index of the element in the list.
       *
       * @type {number}
       * @readOnly
       */
      this.indexNew = indexNew;
    },

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "move"
     */
    get type() {
      return "move";
    },

    /** @inheritDoc */
    _apply: function(target) {
      target.__elems.splice(this.indexNew, 0, target.__elems.splice(this.indexOld, 1)[0]);
    }
  });
});
