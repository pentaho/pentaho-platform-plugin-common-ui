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
  "./OwnedChange"
], function(OwnedChange) {
  "use strict";

  /**
   * @name RemoveOne
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.type.changes.OwnedChange
   * @amd pentaho/type/changes/RemoveOne
   *
   * @classDesc Describes an operation that removes an element from a list.
   *
   * @constructor
   * @description Creates an instance.
   *
   * @param {!pentaho.type.Element} elem - The object to be removed from the list.
   * @param {string} key - The key that is being used for identifying the object in the list.
   */
  return OwnedChange.extend("pentaho.type.RemoveOne", {

    constructor: function(elem, key) {
      this.key = key;
      this.elem = elem;
    },

    /**
     * @inheritdoc
     */
    get type() {
      return "removeOne";
    },

    /**
     * @inheritdoc
     */
    apply: function(list) {
      var key = this.key;
      var index = list._elems.indexOf(this.elem);

      list._elems.splice(index, 1);
      delete list._keys[key];

      return list;
    }
  });
});
