/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/util/error"
], function(error) {

  "use strict";

  return function(filter) {

    /**
     * @name pentaho.data.filter.Tree.Type
     * @class
     * @extends pentaho.data.filter.Abstract.Type
     *
     * @classDesc The base type class of `Tree` filter types.
     *
     * For more information see {@link pentaho.data.filter.Tree}.
     */

    /**
     * @name pentaho.data.filter.Tree
     * @class
     * @extends pentaho.data.filter.Abstract
     * @abstract
     *
     * @amd {pentaho.type.spec.UTypeModule<pentaho.data.filter.Tree>} pentaho/data/filter/tree
     *
     * @classDesc The base class of filters that combine other filters.
     *
     * Example subclasses include:
     *
     * * {@link pentaho.data.filter.And}
     * * {@link pentaho.data.filter.Or}
     *
     * @description Creates a filter that combines a series of filters.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.ITree} [spec] - A tree filter specification.
     */

    filter.Tree = filter.Abstract.extend("pentaho.data.filter.Tree", /** @lends pentaho.data.filter.Tree# */{

      /** @inheritDoc */
      get isTerminal() {
        return false;
      },

      /** @inheritDoc */
      _buildContentKey: function() {
        // Sorting makes content equality be independent of operand order.
        return this.operands.toArray(function(o) { return o.contentKey; }).sort().join(" ");
      },

      /**
       * Gets the list of operands of this filter.
       *
       * This getter is a shorthand for `this.get("operands")`.
       *
       * @type {pentaho.type.List<pentaho.data.filter.Abstract>}
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
       * @memberOf pentaho.data.filter.Tree#
       * @type {Class.<pentaho.data.filter.Tree>}
       * @protected
       * @abstract
       * @readOnly
       */

      /** @inheritDoc */
      negate: function() {
        var invOpers = this.operands.toArray(function(operand) {
          return operand.negate();
        });

        var InvFilter = this._inverseClass;
        return new InvFilter({operands: invOpers});
      },

      /**
       * Performs the boolean operation including its operands and the additional operands provided as arguments.
       *
       * @param {...any} operands - The additional operands.
       * @return {!pentaho.filter.Abstract} The resulting filter.
       *
       * @protected
       */
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
       * @param {!pentaho.data.filter.FTransformer} transformer - The transformer function.
       *
       * @return {!pentaho.data.filter.Abstract} The transformed filter.
       *
       * @see pentaho.data.filter.Tree#visitOperands
       *
       * @protected
       */
      _visitDefault: function(transformer) {
        var opersOut = this.visitOperands(transformer);
        return opersOut ? new this.constructor({operands: opersOut}) : this;
      },

      /**
       * Creates transformed versions of the operands of this filter.
       *
       * If no operands are actually modified, `null` is returned.
       *
       * @param {!pentaho.data.filter.FTransformer} transformer - The transformer function.
       * @param {Object} [keyArgs] - The keyword arguments object.
       * @param {function} [keyArgs.where] - A predicate function to filter desired children.
       *
       * @return {Array.<pentaho.data.filter.Abstract>} The transformed operands or `null`.
       *
       * @see pentaho.data.filter.Tree#visit
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

      // region __equalityLiteralsByPropertyName
      get __equalityLiteralsByPropertyName() {
        return this.__equalityLiteralsByName ||
            (this.__equalityLiteralsByName = Object.freeze(this.__buildEqualityLiteralsByName()));
      },

      __equalityLiteralsByName: null,

      __buildEqualityLiteralsByName: function() {
        var equalityLiteralsByName = {};
        var os = this.operands;
        var i = os.count;
        var o;
        var p;

        while(i--) {
          o = os.at(i);
          p = (o.isNot ? o.operand : o);
          if(p.kind === "isEqual") {
            equalityLiteralsByName[p.property] = {operand: o, index: i};
          }
        }

        return equalityLiteralsByName;
      },
      // endregion

      $type: /** @lends pentaho.data.filter.Tree.Type# */{
        id: "pentaho/data/filter/tree",
        isAbstract: true,
        props: [
          {
            name: "operands",
            nameAlias: "o",
            valueType: [filter.Abstract],
            isReadOnly: true,
            isBoundary: true
          }
        ]
      }
    });
  };
});
