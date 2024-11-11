/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


define([
  "module",
  "./PrimitiveChange"
], function(module, PrimitiveChange) {
  "use strict";

  return PrimitiveChange.extend(module.id, /** @lends pentaho.type.action.Add# */{

    /**
     * @alias Add
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.type.action.PrimitiveChange
     *
     * @friend pentaho.type.action.ListChangeset
     *
     * @amd pentaho/type/action/Add
     *
     * @classDesc The `Add` class describes the primitive operation of adding a new element to a list at a given index.
     *
     * This type of change is always part of a {@link pentaho.type.action.ListChangeset}.
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
     * @override
     * @see pentaho.type.action.Change#type
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
  }, /** @lends pentaho.type.action.Add */{
    /** @inheritDoc */
    get id() {
      return module.id;
    }
  });
});
