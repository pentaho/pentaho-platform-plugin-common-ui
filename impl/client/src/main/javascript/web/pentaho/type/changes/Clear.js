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

  return PrimitiveChange.extend("pentaho.type.changes.Clear", /** @lends pentaho.type.changes.Clear# */{

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

    /** @inheritDoc */
    _prepare: function(changeset) {

      var container = changeset.owner;

      if(!container.$isBoundary && !container.$type.elementType.isSimple) {
        var transaction = changeset.transaction;
        var i = -1;
        var elements = container.__elems;
        var L = elements.length;
        var element;
        while(++i < L) {
          element = elements[i];
          if(element.__addReference) {
            transaction.__ensureChangeRef(element).removeReference(container);
            changeset.__removeComplexElement(element);
          }
        }
      }
    },

    /** @inheritDoc */
    _cancel: function(changeset) {

      var container = changeset.owner;

      if(!container.$isBoundary && !container.$type.elementType.isSimple) {
        var transaction = changeset.transaction;
        var i = -1;
        var elements = container.__elems;
        var L = elements.length;
        var element;
        while(++i < L) {
          element = elements[i];
          if(element.__addReference) {
            transaction.__ensureChangeRef(element).addReference(container);
            changeset.__addComplexElement(element);
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
