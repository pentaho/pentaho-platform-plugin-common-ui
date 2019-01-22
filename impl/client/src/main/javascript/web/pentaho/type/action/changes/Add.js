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
  "module",
  "./PrimitiveChange"
], function(module, PrimitiveChange) {
  "use strict";

  return PrimitiveChange.extend(module.id, /** @lends pentaho.type.changes.Add# */{

    /**
     * @alias Add
     * @memberOf pentaho.type.changes
     * @class
     * @extends pentaho.type.changes.PrimitiveChange
     *
     * @friend pentaho.type.changes.ListChangeset
     *
     * @amd pentaho/type/changes/Add
     *
     * @classDesc The `Add` class describes the primitive operation of adding a new element to a list at a given index.
     *
     * This type of change is always part of a {@link pentaho.type.changes.ListChangeset}.
     *
     * @constructor
     * @description Creates an instance.
     *
     * @param {pentaho.type.Element} elem - The element to be added to the list.
     * @param {number} index - The list index at which the element should be inserted.
     */
    constructor: function(elem, index) {

      /**
       * Gets the element that is added to the list.
       *
       * @type {pentaho.type.Element}
       * @readOnly
       */
      this.element = elem;

      /**
       * Gets the list index at which the element is inserted.
       *
       * @type {number}
       * @readOnly
       */
      this.index = index;
    },

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "add"
     */
    get type() {
      return "add";
    },

    /** @inheritDoc */
    _prepare: function(changeset) {
      var element = this.element;
      if(element.__addReference && !changeset.target.$isBoundary) {
        changeset.__addComplexElement(element);
      }
    },

    /** @inheritDoc */
    _cancel: function(changeset) {
      var element = this.element;
      if(element.__addReference && !changeset.target.$isBoundary) {
        changeset.__removeComplexElement(element);
      }
    },

    /** @inheritDoc */
    _apply: function(target) {
      var elem = this.element;

      target.__elems.splice(this.index, 0, elem);
      target.__keys[elem.$key] = elem;
    }
  });
});
