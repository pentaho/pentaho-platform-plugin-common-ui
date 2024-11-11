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

  return PrimitiveChange.extend(module.id, /** @lends pentaho.type.action.Clear# */{

    /**
     * @name Clear
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.type.action.PrimitiveChange
     * @amd pentaho/type/action/Clear
     *
     * @classDesc The `Clear` class describes the primitive operation that clears every element of a list.
     *
     * This type of change is always part of a {@link pentaho.type.action.ListChangeset}.
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
     * @override
     * @see pentaho.type.action.Change#type
     */
    get type() {
      return "clear";
    },

    /** @inheritDoc */
    _prepare: function(changeset) {

      var container = changeset.target;

      if(!container.$isBoundary && !container.$type.elementType.isSimple) {
        var i = -1;
        var elements = container.__elems;
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
        var elements = container.__elems;
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
      target.__elems = [];
      target.__keys = {};
    }
  }, /** @lends pentaho.type.action.Clear */{
    /** @inheritDoc */
    get id() {
      return module.id;
    }
  });
});
