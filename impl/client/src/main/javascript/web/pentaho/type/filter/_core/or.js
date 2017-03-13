/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "../KnownFilterKind"
], function(KnownFilterKind) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.type.filter.Or.Type
     * @class
     * @extends pentaho.type.Tree.Type
     *
     * @classDesc The type class of `Or` filter types.
     *
     * For more information see {@link pentaho.type.filter.Or}.
     */

    /**
     * @name pentaho.type.filter.Or
     * @class
     * @extends pentaho.type.filter.Tree
     *
     * @amd {pentaho.type.Factory<pentaho.type.filter.Or>} pentaho/type/filter/or
     *
     * @classDesc The `Or` filter represents a boolean disjunction (an Or) filter.
     *
     * This filter selects the elements that are selected by at least one of
     * a series of other filters, [operands]{@link pentaho.type.filter.Tree#operands}.
     *
     * In terms of set operations,
     * the `Or` filter corresponds to the union of all of its operands' subsets.
     *
     * @description Creates an `Or` filter.
     *
     * @constructor
     * @param {pentaho.type.filter.spec.ITree} [spec] - A tree filter specification.
     */
    filter.Or = filter.Tree.extend("pentaho.type.filter.Or", /** @lends pentaho.type.filter.Or# */{

      get kind() {
        return KnownFilterKind.Or;
      },

      _contains: function(elem) {
        var ops = this.operands;
        var i = -1;
        var L = ops.count;
        while(++i < L) if(ops.at(i)._contains(elem)) return true;
        return false;
      },

      /**
       * Creates a filter that is the disjunction between this filter and any number of other filters.
       *
       * Disjunctions of disjunction filters (Ors of Ors) are flattened.
       *
       * @param {...pentaho.type.filter.Abstract[]} filters - The filters to be joined with this one.
       *
       * @return {pentaho.type.filter.Abstract} The resulting filter.
       *
       * @override
       */
      or: function() {
        return this._operation.apply(this, arguments);
      },

      get _inverseClass() {
        return filter.And;
      },

      type: /** @lends pentaho.type.filter.Or.Type# */{
        id: "pentaho/type/filter/or",
        alias: "or"
      }
    });
  };
});
