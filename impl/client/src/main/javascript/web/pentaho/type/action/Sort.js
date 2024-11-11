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

  return PrimitiveChange.extend(module.id, /** @lends pentaho.type.action.Sort# */{

    /**
     * @alias Sort
     * @memberOf pentaho.type.action
     * @class
     * @extends pentaho.type.action.PrimitiveChange
     * @amd pentaho/type/action/Sort
     *
     * @classDesc The `Sort` class describes the primitive operation that sorts the element in a list.
     *
     * This type of change is always part of a {@link pentaho.type.action.ListChangeset}.
     *
     * @constructor
     * @description Creates an instance.
     *
     * @param {function(pentaho.type.Element, pentaho.type.Element) : number} comparer - The
     * function used for comparing elements in the list.
     */
    constructor: function(comparer) {
      this.comparer = comparer;
    },

    /**
     * Gets the type of change.
     *
     * @type {string}
     * @readonly
     * @default "sort"
     * @override
     * @see pentaho.type.action.Change#type
     */
    get type() {
      return "sort";
    },

    /** @inheritDoc */
    _apply: function(target) {
      target.__elems.sort(this.comparer);
    }
  }, /** @lends pentaho.type.action.Sort */{
    /** @inheritDoc */
    get id() {
      return module.id;
    }
  });
});
