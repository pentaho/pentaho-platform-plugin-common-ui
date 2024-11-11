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
  "pentaho/module!../And",
  "../KnownFilterKind"
], function(module, KnownFilterKind) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.AndType
     * @class
     * @extends pentaho.data.filter.TreeType
     *
     * @classDesc The type class of the `And` filter type.
     *
     * For more information see {@link pentaho.data.filter.And}.
     */

    /**
     * @name pentaho.data.filter.And
     * @class
     * @extends pentaho.data.filter.Tree
     *
     * @amd pentaho/data/filter/And
     *
     * @classDesc
     * @classDesc The `And` filter represents a boolean conjunction (an And) filter.
     *
     * This filter selects the elements that are selected by all of
     * a series of other filters: [operands]{@link pentaho.data.filter.Tree#operands}.
     *
     * In terms of set operations,
     * the `And` filter corresponds to the intersection of all of its operands' subsets.
     *
     * @description Creates an `And` filter.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.ITree} [spec] - A tree filter specification.
     */

    filter.And = filter.Tree.extend("pentaho.data.filter.And", /** @lends pentaho.data.filter.And# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.And;
      },

      /** @inheritDoc */
      _compile: function() {

        var compiledOps = this.operands.toArray(function(op) {
          return op.compile();
        });

        var L = compiledOps.length;

        return function andContains(elem) {
          var i = -1;
          while(++i < L) if(!compiledOps[i](elem)) return false;
          return true;
        };
      },

      /**
       * Creates a filter that is the conjunction between this filter and a variable number of other filters.
       *
       * Conjunctions of conjunction filters (Ands of Ands) are flattened.
       *
       * @param {...pentaho.data.filter.Abstract[]} filters - The filters to be intersected with this one.
       *
       * @return {pentaho.data.filter.Abstract} The resulting filter.
       */
      and: function() {
        return this._operation.apply(this, arguments);
      },

      /** @inheritDoc */
      get _inverseClass() {
        return filter.Or;
      },

      $type: /** @lends pentaho.data.filter.AndType# */{
        id: module.id
      }
    });
  };
});
