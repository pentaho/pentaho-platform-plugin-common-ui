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
   * @name RemoveAt
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.Operation
   * @amd pentaho/type/changes/RemoveAt
   *
   * @classDesc Describes an operation that removes a set of elements from a list.
   *
   * @constructor
   * @description Creates an instance.
   *
   * @param {!pentaho.type.Element[]} elements - The objects to be removed from the list.
   * @param {number} start - The position in the list of the first element to be removed.
   */
  return Operation.extend("pentaho.type.RemoveAt", {

    constructor: function(elements, start) {
      this.at = start;
      this.toRemove = elements;
    },

    /**
     * @inheritdoc
     */
    get type() {
      return "removeAt";
    },

    /**
     * @inheritdoc
     */
    apply: function(list) {
      var toRemove = this.toRemove;
      var start = this.at;

      list._elems.splice(start, toRemove.length);

      toRemove.forEach(function(elem) {
        delete list._keys[elem.key];
      });

      return list;
    }
  });
});
