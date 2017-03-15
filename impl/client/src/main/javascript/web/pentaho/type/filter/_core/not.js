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
     * @name pentaho.type.filter.Not.Type
     * @class
     * @extends pentaho.type.Abstract.Type
     *
     * @classDesc The type class of the `Not` filter type.
     *
     * For more information see {@link pentaho.type.filter.Not}.
     */

    /**
     * @name pentaho.type.filter.Not
     * @class
     * @extends pentaho.type.filter.Abstract
     *
     * @amd {pentaho.type.Factory<pentaho.type.filter.Not>} pentaho/type/filter/not
     *
     * @classDesc The `Not` type represents a negation filter.
     *
     * This filter selects the elements that are **not** selected by another filter,
     * [operand]{@link pentaho.type.filter.Not#operand}.
     *
     * In terms of set operations,
     * the `Not` filter corresponds to the complement of the subset selected by its operand.
     *
     * @description Creates a negation filter.
     *
     * @constructor
     * @param {pentaho.type.filter.spec.INot} [spec] - A negation filter specification.
     */

    filter.Not = filter.Abstract.extend("pentaho.type.filter.Not", /** @lends pentaho.type.filter.Not# */{

      get kind() {
        return KnownFilterKind.Not;
      },

      get isTerminal() {
        return false;
      },

      /**
       * Gets the operand of this filter.
       *
       * This getter is a shorthand for `this.get("operand")`.
       *
       * @type {pentaho.type.filter.Abstract}
       *
       * @readonly
       */
      get operand() {
        return this.get("operand");
      },

      _contains: function(elem) {
        return !this.operand._contains(elem);
      },

      /**
       * Creates a filter that is a transformed version of this filter, the default way.
       *
       * This implementation tests if [operand]{@link pentaho.type.filter.Not#operand} is `null`,
       * and, if so, `this` is returned.
       * Otherwise, the operand is visited, and if it is not modified, then `this` is returned.
       * Otherwise, the result of negating the transformed operand is returned.
       *
       * @param {!pentaho.type.filter.FTransformer} transformer - The transformer function.
       *
       * @return {!pentaho.type.filter.Abstract} The transformed filter.
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
       * When [operand]{@link pentaho.type.filter.Not#operand} is set,
       * double negation is prevented by returning the operand itself.
       *
       * @return {!pentaho.type.filter.Abstract} A filter that is the negation of this filter.
       *
       * @override
       */
      negate: function() {
        return this.operand || new filter.Not({operand: this});
      },

      type: /** @lends pentaho.type.filter.Not.Type# */{
        id: "pentaho/type/filter/not",
        alias: "not",
        props: [
          {
            name: "operand",
            nameAlias: "o",
            type: filter.Abstract,
            isRequired: true
          }
        ]
      }
    });
  };
});
