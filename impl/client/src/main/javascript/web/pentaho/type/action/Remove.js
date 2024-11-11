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

  return PrimitiveChange.extend(module.id, /** @lends pentaho.type.action.Remove# */{

    /**
     * @name Remove
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.type.action.PrimitiveChange
     * @amd pentaho/type/action/Remove
     *
     * @classDesc The `Remove` class describes the primitive operation that
     * removes a set of contiguous elements from a list.
     *
     * This type of change is always part of a {@link pentaho.type.action.ListChangeset}.
     *
     * @constructor
     * @description Creates an instance.
     *
     * @param {Array.<pentaho.type.Element>} elems - The elements to be removed from the list.
     * @param {number} index - The starting index of the elements in the list.
     */
    constructor: function(elems, index) {
      /**
       * Gets the elements that are removed from the list.
       *
       * @type {Array.<pentaho.type.Element>}
       * @readOnly
       */
      this.elements = elems;

      /**
       * Gets the index of the element in the list.
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
     * @default "remove"
     * @override
     * @see pentaho.type.action.Change#type
     */
    get type() {
      return "remove";
    },

    /** @inheritDoc */
    _prepare: function(changeset) {

      var container = changeset.target;

      if(!container.$isBoundary && !container.$type.elementType.isSimple) {
        var i = -1;
        var elements = this.elements;
        var L = elements.length;
        while(++i < L) {
          if(elements[i].__addReference) {
            changeset.__removeComplexElement(elements[i]);
          }
        }
      }
    },

    /** @inheritDoc */
    _cancel: function(changeset) {

      var container = changeset.target;

      if(!container.$isBoundary && !container.$type.elementType.isSimple) {
        var i = -1;
        var elements = this.elements;
        var L = elements.length;
        while(++i < L) {
          if(elements[i].__addReference) {
            changeset.__addComplexElement(elements[i]);
          }
        }
      }
    },

    /** @inheritDoc */
    _apply: function(target) {
      var elems = this.elements;

      target.__elems.splice(this.index, elems.length);

      elems.forEach(function(elem) {
        delete target.__keys[elem.$key];
      });
    }
  }, /** @lends pentaho.type.action.Remove */{
    /** @inheritDoc */
    get id() {
      return module.id;
    }
  });
});
