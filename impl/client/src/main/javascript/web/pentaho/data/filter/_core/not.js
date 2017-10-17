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
     * @name pentaho.data.filter.Not.Type
     * @class
     * @extends pentaho.data.filter.Abstract.Type
     *
     * @classDesc The type class of the `Not` filter type.
     *
     * For more information see {@link pentaho.data.filter.Not}.
     */

    /**
     * @name pentaho.data.filter.Not
     * @class
     * @extends pentaho.data.filter.Abstract
     *
     * @amd {pentaho.type.spec.UTypeModule<pentaho.data.filter.Not>} pentaho/data/filter/not
     *
     * @classDesc The `Not` type represents a negation filter.
     *
     * This filter selects the elements that are **not** selected by another filter:
     * [operand]{@link pentaho.data.filter.Not#operand}.
     *
     * In terms of set operations,
     * the `Not` filter corresponds to the complement of the subset selected by its operand.
     *
     * @description Creates a negation filter.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.INot} [spec] - A negation filter specification.
     */

    filter.Not = filter.Abstract.extend("pentaho.data.filter.Not", /** @lends pentaho.data.filter.Not# */{

      /** @inheritDoc */
      get kind() {
        return KnownFilterKind.Not;
      },

      /** @inheritDoc */
      get isTerminal() {
        return false;
      },

      /** @inheritDoc */
      get isNot() {
        return true;
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        var o = this.operand;
        return o ? o.contentKey : "";
      },

      /**
       * Gets the operand of this filter.
       *
       * This getter is a shorthand for `this.get("operand")`.
       *
       * @type {pentaho.data.filter.Abstract}
       *
       * @readonly
       */
      get operand() {
        return this.get("operand");
      },

      /** @inheritDoc */
      _compile: function() {

        var compiledOp = this.operand.compile();

        return function notContains(elem) {
          return !compiledOp(elem);
        };
      },

      /**
       * Creates a filter that is a transformed version of this filter, the default way.
       *
       * This implementation tests if [operand]{@link pentaho.data.filter.Not#operand} is `null`,
       * and, if so, `this` is returned.
       * Otherwise, the operand is visited, and if it is not modified, then `this` is returned.
       * Otherwise, the result of negating the transformed operand is returned.
       *
       * @param {!pentaho.data.filter.FTransformer} transformer - The transformer function.
       *
       * @return {!pentaho.data.filter.Abstract} The transformed filter.
       */
      _visitDefault: function(transformer) {
        var oper1 = this.operand;
        if(oper1) {
          var oper2 = oper1.visit(transformer);
          return oper2 !== oper1 ? oper2.negate() : this;
        }

        return this;
      },

      /**
       * Creates a filter which is the negation of this filter.
       *
       * When [operand]{@link pentaho.data.filter.Not#operand} is set,
       * double negation is prevented by returning the operand itself.
       *
       * @return {!pentaho.data.filter.Abstract} A filter that is the negation of this filter.
       *
       * @override
       */
      negate: function() {
        return this.operand || new filter.Not({operand: this});
      },

      $type: /** @lends pentaho.data.filter.Not.Type# */{
        id: "pentaho/data/filter/not",
        alias: "not",
        props: [
          {
            name: "operand",
            nameAlias: "o",
            valueType: filter.Abstract,
            isRequired: true,
            isReadOnly: true,
            isBoundary: true
          }
        ]
      }
    });
  };
});
