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
  "./PrimitiveChange"
], function(PrimitiveChange) {
  "use strict";

  /**
   * @name Clear
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.PrimitiveChange
   * @amd pentaho/type/changes/Clear
   *
   * @classDesc The `Clear` class describes the primitive operation that clears every element of a list.
   *
   * This type of change is always part of a {@link pentaho.type.changes.ListChangeset}.
   *
   * @constructor
   * @description Creates an instance.
   */
  return PrimitiveChange.extend("pentaho.type.changes.Clear", /** @lends pentaho.type.changes.Clear# */{

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "clear"
     */
    get type() {
      return "clear";
    },

    _prepareRefs: function(txn, target) {
      if(!target.$isBoundary && target.$type.of.isComplex) {
        var i = -1;
        var elems = target.__elems;
        var L = elems.length;
        var elem;
        while(++i < L) {
          if((elem = elems[i]).__addReference) {
            txn.__ensureChangeRef(elem).removeReference(target);
          }
        }
      }
    },

    _cancelRefs: function(txn, target) {
      if(!target.$isBoundary && target.$type.of.isComplex) {
        var i = -1;
        var elems = target.__elems;
        var L = elems.length;
        var elem;
        while(++i < L) {
          if((elem = elems[i]).__addReference) {
            txn.__ensureChangeRef(elem).addReference(target);
          }
        }
      }
    },

    /** @inheritDoc */
    _apply: function(target) {
      target.__elems = [];
      target.__keys = {};
    }
  });
});
