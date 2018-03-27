/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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

  return PrimitiveChange.extend("pentaho.type.changes.Sort", /** @lends pentaho.type.changes.Sort# */{

    /**
     * @alias Sort
     * @memberOf pentaho.type.changes
     * @class
     * @extends pentaho.type.changes.PrimitiveChange
     * @amd pentaho/type/changes/sort
     *
     * @classDesc The `Sort` class describes the primitive operation that sorts the element in a list.
     *
     * This type of change is always part of a {@link pentaho.type.changes.ListChangeset}.
     *
     * @constructor
     * @description Creates an instance.
     *
     * @param {function(pentaho.type.Element, pentaho.type.Element) : number} comparer - The
     * function used for comparing elements in the list.
     */
    constructor: function(comparer) {
      this.comparer = comparer;
    },

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "sort"
     */
    get type() {
      return "sort";
    },

    /** @inheritDoc */
    _apply: function(target) {
      target.__elems.sort(this.comparer);
    }
  });
});
