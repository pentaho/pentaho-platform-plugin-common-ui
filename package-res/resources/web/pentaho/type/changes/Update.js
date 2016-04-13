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

  return PrimitiveChange.extend("pentaho.type.changes.Update", /** @lends pentaho.type.changes.Update# */{

    /**
     * @alias Update
     * @memberOf pentaho.type.changes
     * @class
     * @extends pentaho.type.changes.PrimitiveChange
     * @amd pentaho/type/changes/Update
     *
     * @classDesc Describes an operation that updates an element in a list.
     * In an `update` operation, the reference to the element does not change, but its content does.
     *
     * This type of change is always part of a {@link pentaho.type.changes.ListChangeset}.
     *
     * @constructor
     * @description Creates an instance.
     *
     * @param {!pentaho.type.Element} elem - The object (already in the list) that will be updated.
    constructor: function(elem, other) {
     * @param {!pentaho.type.Element} other - The object with the content that will be used for updating the list.
     * @param {number} index - The position of `elem` in the list.
     */
    constructor: function(elem, index, other) {
      this.elem = elem;
      this.at = index;
      this.other = other;
    },

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "update"
     */
    get type() {
      return "update";
    },

    /**
     * Applies the change to a list value.
     *
     * @param {!pentaho.type.List} target - The list to apply the change on.
     */
    apply: function(list) {
      if(this.at != null)
        list.at(this.at).configure(this.other);
      else
        list.get(this.elem.key).configure(this.other);
    }
  });
});
