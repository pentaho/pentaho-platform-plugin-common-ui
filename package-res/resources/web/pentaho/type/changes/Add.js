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
   * @name Add
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.Operation
   * @amd pentaho/type/changes/Add
   *
   * @classDesc Describes an operation that adds an element to a list.
   *
   * @constructor
   * @description Creates an instance.
   *
   * @param {!pentaho.type.Element} elem - The object to be added to the list.
   * @param {number} index - The position in the list at which the element should to be inserted.
   * @param {string} key - The key that should be used for identifying the object to be added.
   */
  return Operation.extend("pentaho.type.changes.Add", /** @lends pentaho.type.changes.Add# */{

    constructor: function(elem, index, key) {
      this.at = index;
      this.key = key;
      this.elem = elem;
    },

    /**
     * @inheritdoc
     */
    get type() {
      return "add";
    },

    /**
     * @inheritdoc
     */
    apply: function(list) {
      var elem = this.elem;

      list._elems.splice(this.at, 0, elem);
      list._keys[this.key] = elem;
      return list;
    }
  });
});
