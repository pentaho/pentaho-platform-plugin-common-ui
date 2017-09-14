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
     * @name pentaho.data.filter.And.Type
     * @class
     * @extends pentaho.data.filter.Tree.Type
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
     * @amd {pentaho.type.spec.UTypeModule<pentaho.data.filter.And>} pentaho/data/filter/and
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
      _contains: function(elem) {
        var ops = this.operands;
        var i = -1;
        var L = ops.count;
        while(++i < L) if(!ops.at(i)._contains(elem)) return false;
        return true;
      },

      /**
       * Creates a filter that is the conjunction between this filter and a variable number of other filters.
       *
       * Conjunctions of conjunction filters (Ands of Ands) are flattened.
       *
       * @param {...pentaho.data.filter.Abstract[]} filters - The filters to be intersected with this one.
       *
       * @return {!pentaho.data.filter.Abstract} The resulting filter.
       */
      and: function() {
        return this._operation.apply(this, arguments);
      },

      /** @inheritDoc */
      get _inverseClass() {
        return filter.Or;
      },

      $type: /** @lends pentaho.data.filter.And.Type# */{
        id: "pentaho/data/filter/and",
        alias: "and"
      }
    });
  };
});
