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
  "./Operation"
], function(Operation) {
  "use strict";
  /**
   * @name Sort
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.Operation
   * @amd pentaho/type/changes/sort
   *
   * @classDesc Describes an operation that sorts the element in a list.
   *
   * @constructor
   * @description Creates an instance.
   *
   * @param {function(pentaho.type.Element, pentaho.type.Element) : number} comparer - The
   * function used for comparing elements in the list.
   */
  return Operation.extend("pentaho.type.changes.Sort", /** @lends pentaho.type.changes.Sort# */{

    constructor: function(comparer) {
      this.comparer = comparer;
    },

    /**
     * @inheritdoc
     */
    get type() {
      return "sort";
    },

    /**
     * @inheritdoc
     */
    apply: function(list) {
      list._elems.sort(this.comparer);
    }
  });
});
