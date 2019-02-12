/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
  "./PrimitiveChange"
], function(module, PrimitiveChange) {
  "use strict";

  return PrimitiveChange.extend(module.id, /** @lends pentaho.type.action.Sort# */{

    /**
     * @alias Sort
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.type.action.PrimitiveChange
     * @amd pentaho/type/action/Sort
     *
     * @classDesc The `Sort` class describes the primitive operation that sorts the element in a list.
     *
     * This type of change is always part of a {@link pentaho.type.action.ListChangeset}.
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
     * @override
     * @see pentaho.type.action.Change#type
     */
    get type() {
      return "sort";
    },

    /** @inheritDoc */
    _apply: function(target) {
      target.__elems.sort(this.comparer);
    }
  }, /** @lends pentaho.type.action.Sort */{
    /** @inheritDoc */
    get id() {
      return module.id;
    }
  });
});
