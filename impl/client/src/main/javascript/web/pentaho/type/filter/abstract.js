/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "module",
  "../complex",
  "./_core/tree",
  "./_core/and",
  "./_core/or",
  "./_core/not",
  "./_core/true",
  "./_core/false",
  "../../util/arg",
  "../../util/error"
], function(module, complexFactory, treeFactory, andFactory, orFactory, notFactory,
            trueFactory, falseFactory, arg, error) {

  "use strict";

  return function(context) {

    var filter = {};

    var Complex = context.get(complexFactory);

    /**
     * @name pentaho.type.filter.Abstract.Type
     * @class
     * @extends pentaho.type.Complex.Type
     *
     * @classDesc The base type class of filter types.
     *
     * For more information see {@link pentaho.type.filter.Abstract}.
     */

    /**
     * @name pentaho.type.filter.Abstract
     * @class
     * @extends pentaho.type.Complex
     * @abstract
     * @amd {pentaho.type.Factory<pentaho.type.filter.Abstract>} pentaho/type/filter/abstract
     *
     * @classDesc The base class of filter types.
     *
     * @description Creates a filter instance.
     *
     * @constructor
     * @param {pentaho.type.filter.spec.IAbstract} [spec] - A filter specification.
     */

    filter.Abstract = Complex.extend("pentaho.type.filter.Abstract", /** @lends pentaho.type.filter.Abstract# */{

      /**
       * Gets the kind of this filter.
       *
       * The values of the standard, concrete filter kinds
       * are available in the [KnownFilterKind]{@link pentaho.type.filter.KnownFilterKind}
       * enumeration.
       *
       * @name kind
       * @memberOf pentaho.type.filter.Abstract#
       * @type {string}
       * @readOnly
       */

      /**
       * Gets a value that indicates if this filter is terminal.
       * The non-terminal filters are
       * [Or]{@link pentaho.type.filter.Or},
       * [And]{@link pentaho.type.filter.And} and
       * [Not]{@link pentaho.type.filter.Not}.
       *
       * @type {boolean}
       * @readOnly
       */
      get isTerminal() {
        return true;
      },

      /**
       * Gets a key that identifies the content of this filter.
       *
       * @type {string}
       * @readOnly
       */
      get contentKey() {
        return this.__contentKey || (this.__contentKey = this.__buildContentKeyOuter());
      },

      /**
       * Wraps the result of calling `_buildContentKey` with information on the kind of filter.
       *
       * @return {string} The content key.
       * @private
       */
      __buildContentKeyOuter: function() {
        var innerKey = this._buildContentKey();
        return "(" + this.type.shortId + (innerKey ? (" " + innerKey) : "") + ")";
      },

      /**
       * Builds the content key.
       *
       * The kind of filter is already added around what is returned by this method.
       *
       * @name _buildContentKey
       * @memberOf pentaho.type.filter.Abstract#
       * @method
       * @return {string} The content key.
       * @protected
       * @abstract
       */

      _setVersionInternal: function(version) {
        this.base(version);

        this.__contentKey = null;
      },

      /**
       * Determines if an element is selected by this filter.
       *
       * When the filter is not valid, an error is thrown.
       * Otherwise, this method delegates to the [_contains]{@link pentaho.type.filter.Abstract#_contains} method.
       *
       * @param {!pentaho.type.Element} elem - The candidate dataset element.
       *
       * @return {boolean} `true` if this filter contains `element`, or `false` otherwise.
       *
       * @throws {pentaho.type.ValidationError} When the filter is not valid,
       * the first error returned by the `validate` method.
       */
      contains: function(elem) {
        this.assertValid();

        return this._contains(elem);
      },

      /**
       * Actually determines if an element is selected by this filter.
       *
       * This method assumes that the filter is valid.
       *
       * @name _contains
       * @memberOf pentaho.type.filter.Abstract#
       * @method
       *
       * @param {!pentaho.type.Element} elem - The candidate dataset element.
       *
       * @return {boolean} `true` if this filter contains `element`, or `false` otherwise.
       *
       * @abstract
       * @protected
       *
       * @see pentaho.type.filter.Abstract#contains
       */

      /**
       * Creates a filter that is a transformed version of this filter.
       *
       * This implementation calls `transformer` with `this`.
       * If the result is non-{@link Nully}, it is returned.
       * Otherwise, the result of calling [_visitDefault]{@link pentaho.type.filter.Abstract#_visitDefault}
       * is returned.
       *
       * @param {!pentaho.type.filter.FTransformer} transformer - The transformer function.
       *
       * @return {!pentaho.type.filter.Abstract} The transformed filter.
       */
      visit: function(transformer) {
        if(!transformer) throw error.argRequired("transformer");

        return transformer(this) || this._visitDefault(transformer);
      },

      /**
       * Creates a filter that is a transformed version of this filter, the default way.
       *
       * This implementation simply returns `this`.
       * Override to implement a custom default transformation logic,
       * like transforming operands.
       *
       * @param {!pentaho.type.filter.FTransformer} transformer - The transformer function.
       *
       * @return {!pentaho.type.filter.Abstract} The transformed filter.
       *
       * @see pentaho.type.filter.Tree#_visitDefault
       */
      _visitDefault: function(transformer) {
        return this.clone();
      },

      /**
       * Creates a filter that is the negation of this filter.
       *
       * @return {!pentaho.type.filter.Abstract} A negated filter.
       */
      negate: function() {
        return new filter.Not({operand: this});
      },

      /**
       * Creates a filter that is the union between this filter and a variable number of other filters.
       *
       * @param {...pentaho.type.filter.Abstract[]} filters - The filters to be joined with this one.
       *
       * @return {!pentaho.type.filter.Abstract} The resulting filter.
       */
      or: function() {
        if(!arguments.length) return this;

        var args = arg.slice(arguments);
        args.unshift(this);

        return new filter.Or({operands: args});
      },

      /**
       * Creates a filter that is the intersection between this filter and a variable number of other filters.
       *
       * @param {...pentaho.type.filter.Abstract[]} filters - The filters to be intersected with this one.
       *
       * @return {!pentaho.type.filter.Abstract} The resulting filter.
       */
      and: function() {
        if(!arguments.length) return this;

        var args = arg.slice(arguments);
        args.unshift(this);

        return new filter.And({operands: args});
      },

      toDnf: function() {
        return this
            .visit(moveNotInward)
            .visit(moveAndInward)
            .visit(flattenTree)
            .visit(ensureDnfTopLevel)
            .visit(simplifyDnf);
      },

      type: /** @lends pentaho.type.filter.Abstract.Type# */{
        id: module.id,

        isAbstract: true
      }
    });

    // Store reference back to the `filter` object in the Abstract class.
    filter.Abstract._core = filter;

    // Setup the remaining core classes
    notFactory(filter);
    treeFactory(filter);
    andFactory(filter);
    orFactory(filter);
    trueFactory(filter);
    falseFactory(filter);

    return filter.Abstract;

    function moveNotInward(f) {

      if(f.kind === "not") {
        var o = f.operand;
        if(o && !o.isTerminal) {
          /* eslint default-case: 0 */
          switch(o.kind) {
            case "and":
              // 1. `NOT(A AND B) <=> NOT A OR  NOT B` - De Morgan 1 - NOT over AND
              return new filter.Or({operands: o.operands.toArray(function(ao) {
                return ao.negate().visit(moveNotInward);
              })});

            case "or":
              // 2. `NOT(A OR B) <=> NOT A AND NOT B` - De Morgan 2 - NOT over OR
              return new filter.And({operands: o.operands.toArray(function(oo) {
                return oo.negate().visit(moveNotInward);
              })});

            case "not":
              // 3. NOT(NOT(A)) <=> A - Double negation elimination
              return o.operand && o.operand.visit(moveNotInward);
          }
        }
      }
    }

    function moveAndInward(f) {

      if(f.kind === "and") {

        // 1. AND distributivity over OR
        var i = -1;
        var os = f.operands;
        var L = os.count;
        var osAndOther = [];
        var or;
        var ao;
        while(++i < L) {
          ao = os.at(i);
          if(!or && ao.kind === "or") {
            or = ao;
          } else {
            osAndOther.push(ao);
          }
        }

        if(or) {
          return new filter.Or({operands: or.operands.toArray(function(oo) {
            return new filter.And({operands: osAndOther.concat(oo)}).visit(moveAndInward);
          })});
        }

        return new filter.And({operands: osAndOther});
      }
    }

    function flattenTree(f) {

      var kind;

      switch((kind = f.kind)) {
        case "and":
        case "or":

          var i = -1;
          var os = f.operands;
          var L = os.count;
          var osFlattened = [];

          while(++i < L) {
            // recurse in pre-order
            var o = os.at(i).visit(moveAndInward);
            if(o.kind === kind) {
              osFlattened.push.apply(osFlattened, o.operands.toArray());
            } else {
              osFlattened.push(o);
            }
          }

          return new f.constructor({operands: osFlattened});
      }
    }

    function ensureDnfTopLevel(f) {

      switch(f.kind) {
        case "or":

          var i = -1;
          var os = f.operands;
          var L = os.count;
          var osAnds = [];

          while(++i < L) {
            var o = os.at(i);
            if(o.kind !== "and") {
              osAnds.push(new filter.And({operands: [o]}));
            } else {
              osAnds.push(o);
            }
          }

          return new f.constructor({operands: osAnds});

        case "and":
          f = new filter.Or({operands: [f]});
          break;

        default:
          f = new filter.Or({operands: new filter.And({operands: [f]})});
      }

      return f;
    }

    function simplifyDnf(f) {

      // NOTE: AND() <=> True
      // NOTE:  OR() <=> False
      // NOTE:  OR(AND()) <=> True

      // -- Duplicates --
      // 1) AND(A, A) <=> AND(A)
      // 2)  OR(A, A) <=>  OR(A)

      // -- Neutral Operand Elimination --
      // 3) AND( .. True .. ) <=> AND( .. .. )
      //    Cannot happen, atm

      // 4)  OR( .. False .. ) <=> OR( .. .. )
      //     OR( .. AND(A, NOT(A)) ..)

      // -- AND/OR Elimination --
      // 3) AND( .. False .. ) <=> False
      //    Cannot happen, atm

      // 4)  OR( .. True .. ) <=> True
      //     OR( .. AND() .. ) <=> OR(AND()) <=> True

      // -- NOT Elimination --
      // 5) NOT(True) <=> False
      //    Cannot happen, atm

      // 6) NOT(False) <=> True
      //    Cannot happen, atm

      // -- XYZ --
      // 7) AND(A, NOT(A)) <=> False - Law of non-contradiction
      //    can occur within an OR
      //
      // 8) OR (A, NOT(A)) <=> True  - Law of excluded middle
      //    cannot occur cause DNF's ORs always contain direct ANDs, and never NOTs.

      switch(f.kind) {
        case "or":

          var i = -1;
          var os = f.operands;
          var L = os.count;
          var osAnds = [];

          while(++i < L) {
            var o = os.at(i);
            if(o.kind !== "and") {
              osAnds.push(new filter.And({operands: [o]}));
            } else {
              osAnds.push(o);
            }
          }

          return new f.constructor({operands: osAnds});

        case "and":
          f = new filter.Or({operands: [f]});
          break;

        default:
          f = new filter.Or({operands: new filter.And({operands: [f]})});
      }

      return f;
    }
  };
});
