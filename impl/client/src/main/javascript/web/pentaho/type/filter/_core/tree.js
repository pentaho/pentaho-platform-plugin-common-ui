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
  "../../../util/error"
], function(error) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.type.filter.Tree.Type
     * @class
     * @extends pentaho.type.Abstract.Type
     *
     * @classDesc The base type class of `Tree` filter types.
     *
     * For more information see {@link pentaho.type.filter.Tree}.
     */

    /**
     * @name pentaho.type.filter.Tree
     * @class
     * @extends pentaho.type.filter.Abstract
     * @abstract
     *
     * @amd {pentaho.type.Factory<pentaho.type.filter.Tree>} pentaho/type/filter/tree
     *
     * @classDesc The base class of filters that combine other filters.
     *
     * Example subclasses include:
     *
     * * {@link pentaho.type.filter.And}
     * * {@link pentaho.type.filter.Or}
     *
     * @description Creates a filter that combines a series of filters.
     *
     * @constructor
     * @param {pentaho.type.filter.spec.ITree} [spec] - A tree filter specification.
     */

    filter.Tree = filter.Abstract.extend("pentaho.type.filter.Tree", /** @lends pentaho.type.filter.Tree# */{

      get isTerminal() {
        return false;
      },

      /**
       * Gets the list of operands of this filter.
       *
       * This getter is a shorthand for `this.get("operands")`.
       *
       * @type {pentaho.type.List<pentaho.type.filter.Abstract>}
       *
       * @readonly
       */
      get operands() {
        return this.get("operands");
      },

      /**
       * Gets the inverse filter class.
       *
       * @name _inverseClass
       * @memberOf pentaho.type.filter.Tree#
       * @type {Class.<pentaho.type.filter.Tree>}
       * @protected
       * @abstract
       * @readOnly
       */

      negate: function() {
        var invOpers = this.operands.toArray(function(operand) {
          return operand.negate();
        });

        var InvFilter = this._inverseClass;
        return new InvFilter({operands: invOpers});
      },

      _operation: function() {
        var N = arguments.length;
        if(!N) return this;

        var FilterClass = this.constructor;

        var op;
        var ops = this.operands.toArray();
        var OP = ops.length;

        // Add given argument filters
        var k = -1;
        while(++k < N) {
          if((op = arguments[k])) {
            if(op instanceof FilterClass) {
              // Flatten And argument
              var innerOps = op.operands;
              var I = innerOps.count;
              var i = -1;
              while(++i < I) ops.push(innerOps.at(i));

            } else {
              ops.push(op);
            }
          }
        }

        /* eslint default-case: 0 */
        switch(ops.length) {
          // Any non-null arguments?
          case OP: return this;

          // Only a single operand at the end (had 0, now has 1).
          case 1: return ops[0];
        }

        return new FilterClass({operands: ops});
      },

      /**
       * Creates a filter that is a transformed version of this filter, the default way.
       *
       * This implementation visits existing operands and, if none are modified, `this` is returned.
       * Otherwise, a new filter of the same type and with the transformed operands is returned.
       *
       * @param {!pentaho.type.filter.FTransformer} transformer - The transformer function.
       *
       * @return {!pentaho.type.filter.Abstract} The transformed filter.
       *
       * @see pentaho.type.filter.Tree#visitOperands
       */
      _visitDefault: function(transformer) {
        var opersOut = this.visitOperands(transformer);
        return opersOut ? new this.constructor({operands: opersOut}) : this.clone();
      },

      /**
       * Creates transformed versions of the operands of this filter.
       *
       * If no operands are actually modified, `null` is returned.
       *
       * @param {!pentaho.type.filter.FTransformer} transformer - The transformer function.
       * @param {Object} [keyArgs] - The keyword arguments object.
       * @param {function} [keyArgs.where] - A predicate function to filter desired children.
       *
       * @return {Array.<pentaho.type.filter.Abstract>} The transformed operands or `null`.
       *
       * @see pentaho.type.filter.Tree#visit
       */
      visitOperands: function(transformer, keyArgs) {
        if(!transformer) throw error.argRequired("transformer");

        var where = keyArgs && keyArgs.where;
        var opersOut = null;
        var opersIn  = this.operands;
        var L = opersIn.count;
        var i = -1;
        while(++i < L) {
          var operIn  = opersIn.at(i);
          var operOut = (!where || where(operIn)) ? operIn.visit(transformer) : null;
          if(opersOut || !operOut || operOut !== operIn) {

            if(!opersOut) {
              // Fill opersOut up until i (exclusive)
              opersOut = [];
              var j = -1;
              while(++j < i) opersOut.push(opersIn.at(j));
            }

            if(operOut) opersOut.push(operOut);
          }
        }

        return opersOut;
      },

      type: /** @lends pentaho.type.filter.Tree.Type# */{
        id: "pentaho/type/filter/tree",
        isAbstract: true,
        props: [
          {
            name: "operands",
            nameAlias: "o",
            type: [filter.Abstract]
          }
        ]
      }
    });
  };
});
