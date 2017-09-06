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
  "module",
  "./_core/tree",
  "./_core/and",
  "./_core/or",
  "./_core/not",
  "./_core/true",
  "./_core/false",
  "./_core/property",
  "./_core/isEqual",
  "./_core/isIn",
  "./_core/isGreater",
  "./_core/isLess",
  "./_core/isGreaterOrEqual",
  "./_core/isLessOrEqual",
  "./_core/isLike",
  "pentaho/util/arg",
  "pentaho/util/error",
  "pentaho/util/object",
  "pentaho/util/logger",
  "pentaho/debug",
  "pentaho/debug/Levels"
], function(module, treeFactory, andFactory, orFactory, notFactory, trueFactory, falseFactory,
            propertyFactory, isEqFactory, isInFactory, isGtFactory, isLtFactory, isGteFactory, isLteFactory,
            isLikeFactory, arg, error, O, logger, debugMgr, DebugLevels) {

  "use strict";

  var __isDebugMode = debugMgr.testLevel(DebugLevels.debug, module);

  return ["complex", function(Complex) {

    var __filter = {};

    /**
     * @name pentaho.data.filter.Abstract.Type
     * @class
     * @extends pentaho.type.Complex.Type
     *
     * @classDesc The base type class of filter types.
     *
     * For more information see {@link pentaho.data.filter.Abstract}.
     */

    /**
     * @name pentaho.data.filter.Abstract
     * @class
     * @extends pentaho.type.Complex
     * @abstract
     * @amd {pentaho.type.spec.UTypeModule<pentaho.data.filter.Abstract>} pentaho/data/filter/abstract
     *
     * @classDesc The base class of filter types.
     *
     * @description Creates a filter instance.
     *
     * @constructor
     * @param {pentaho.data.filter.spec.IAbstract} [spec] - A filter specification.
     */

    __filter.Abstract = Complex.extend("pentaho.data.filter.Abstract", /** @lends pentaho.data.filter.Abstract# */{

      /**
       * Gets the kind of this filter.
       *
       * The values of the standard, concrete filter kinds
       * are available in the [KnownFilterKind]{@link pentaho.data.filter.KnownFilterKind}
       * enumeration.
       *
       * @name kind
       * @memberOf pentaho.data.filter.Abstract#
       * @type {string}
       * @readOnly
       */

      /**
       * Gets a value that indicates if this filter is terminal.
       *
       * The non-terminal filter types are
       * [Or]{@link pentaho.data.filter.Or},
       * [And]{@link pentaho.data.filter.And}, and
       * [Not]{@link pentaho.data.filter.Not}.
       *
       * @type {boolean}
       * @readOnly
       */
      get isTerminal() {
        return true;
      },

      /**
       * Gets a value that indicates if this filter is a [Not]{@link pentaho.data.filter.Not} filter.
       *
       * @type {boolean}
       * @readOnly
       */
      get isNot() {
        return false;
      },

      /**
       * Gets a value that indicates if this filter is a [Property]{@link pentaho.data.filter.Property} filter.
       *
       * @type {boolean}
       * @readOnly
       */
      get isProperty() {
        return false;
      },

      /**
       * Gets a key that identifies the content of this filter.
       *
       * @type {string}
       * @readOnly
       * @final
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
        return "(" + this.$type.shortId + (innerKey ? (" " + innerKey) : "") + ")";
      },

      /**
       * Builds the content key.
       *
       * The return value is automatically augmented with the kind of filter information.
       *
       * @name _buildContentKey
       * @memberOf pentaho.data.filter.Abstract#
       * @method
       * @return {string} The content key.
       * @protected
       * @abstract
       */

      /**
       * Determines if an element is selected by this filter.
       *
       * When the filter is not valid, an error is thrown.
       * Otherwise, this method delegates to the [_contains]{@link pentaho.data.filter.Abstract#_contains} method.
       *
       * @param {!pentaho.type.Element} elem - The candidate dataset element.
       *
       * @return {boolean} `true` if this filter contains `element`, or `false` otherwise.
       *
       * @throws {pentaho.type.ValidationError} When the filter is not valid,
       * the first error returned by the `validate` method.
       *
       * @final
       */
      contains: function(elem) {
        this.assertValid();

        return this._contains(elem);
      },

      /**
       * Actual implementation that determines if an element is selected by this filter.
       *
       * This method assumes that the filter is valid.
       *
       * @name _contains
       * @memberOf pentaho.data.filter.Abstract#
       * @method
       *
       * @param {!pentaho.type.Element} elem - The candidate dataset element.
       *
       * @return {boolean} `true` if this filter contains `element`, or `false` otherwise.
       *
       * @abstract
       * @protected
       *
       * @see pentaho.data.filter.Abstract#contains
       */

      /**
       * Creates a filter that is a transformed version of this filter.
       *
       * This implementation calls `transformer` with `this`.
       * If the result is non-{@link Nully}, it is returned.
       * Otherwise, the result of calling [_visitDefault]{@link pentaho.data.filter.Abstract#_visitDefault}
       * is returned.
       *
       * @param {!pentaho.data.filter.FTransformer} transformer - The transformer function.
       *
       * @return {!pentaho.data.filter.Abstract} The transformed filter.
       */
      visit: function(transformer) {
        if(!transformer) throw error.argRequired("transformer");

        return transformer(this) || this._visitDefault(transformer);
      },

      /**
       * Creates a filter that is the default transformed version of this filter.
       *
       * This implementation simply returns `this`.
       * Override to implement a custom default transformation logic,
       * as when transforming operands.
       *
       * @param {!pentaho.data.filter.FTransformer} transformer - The transformer function.
       *
       * @return {!pentaho.data.filter.Abstract} The transformed filter.
       *
       * @see pentaho.data.filter.Tree#_visitDefault
       *
       * @protected
       */
      _visitDefault: function(transformer) {
        return this;
      },

      /**
       * Creates a filter that is the negation of this filter.
       *
       * @return {!pentaho.data.filter.Abstract} A negated filter.
       */
      negate: function() {
        return new __filter.Not({operand: this});
      },

      /**
       * Creates a filter that is the disjunction (union) between this filter and a variable number of other filters.
       *
       * @param {...pentaho.data.filter.Abstract[]} filters - The filters to be joined with this one.
       *
       * @return {!pentaho.data.filter.Abstract} The resulting filter.
       */
      or: function() {
        if(!arguments.length) return this;

        var args = arg.slice(arguments);
        args.unshift(this);

        return new __filter.Or({operands: args});
      },

      /**
       * Creates a filter that is the conjunction (intersection) between this filter and
       * a variable number of other filters.
       *
       * @param {...pentaho.data.filter.Abstract[]} filters - The filters to be intersected with this one.
       *
       * @return {!pentaho.data.filter.Abstract} The resulting filter.
       */
      and: function() {
        if(!arguments.length) return this;

        var args = arg.slice(arguments);
        args.unshift(this);

        return new __filter.And({operands: args});
      },

      /**
       * Creates a filter that is the "difference" between this filter and a variable number of other filters.
       *
       * This operation is implemented in such a way as to not cause the term explosion that is likely to occur when
       * trying to convert the result with a naive implementation to DNF:
       *
       * ```js
       * var result = this.and(filter.negate());
       *
       * var willIEverGetAResult = result.toDnf();
       * ```
       *
       * This implementation works first by converting both this filter and the `exclude` argument to DNF,
       * assuming that these can be so converted in a reasonable time.
       * Then, the difference is performed using an efficient algorithm.
       *
       * @param {pentaho.data.filter.Abstract} exclude - The filter to be "subtracted" from this one.
       *
       * @return {!pentaho.data.filter.Abstract} The resulting filter (not necessarily in DNF form).
       *
       * @see pentaho.data.filter.Abstract#toDnf
       */
      andNot: function(exclude) {
        if(!exclude)
          return this;

        var currentDnf = this.toDnf();
        switch(currentDnf.kind) {
          case "false":
            return currentDnf; // false \ ? = false
          case "true":
            return exclude.negate(); // true \ ?  = !?
        }

        var excludeDnf = exclude.toDnf();
        switch(excludeDnf.kind) {
          case "false":
            return this; // ? \ false = ?
          case "true":
            return __filter.False.instance; // ? \ true = false
        }

        // Remove from `current`, any `and` that also exists exactly in exclude.
        // Leave unmatched currentDnf disjuncts in `remainders`.

        var remainders = [];

        if(__isDebugMode) {
          logger.log("-----------------------------------------");
          // logger.log("currentDnf #=" + currentDnf.operands.count + " " + currentDnf.contentKey);
          // logger.log("excludeDnf #=" + excludeDnf.operands.count + " " + excludeDnf.contentKey);
        }

        // Index exclude Ands by contentKey.
        var excludeKeys = {};
        excludeDnf.operands.each(function(and) { excludeKeys[and.contentKey] = and; });

        currentDnf.operands.each(function(and) {
          // Exact match?
          if(!O.hasOwn(excludeKeys, and.contentKey)) {
            remainders.push(and);
          }
        });

        if(__isDebugMode) {
          logger.log("remainders 1 #=" + remainders.length +
              " ( " + remainders.length + " * " + excludeDnf.operands.count + " = " +
              (remainders.length * excludeDnf.operands.count) + ")");
        }

        if(remainders.length) {
          excludeDnf.operands.each(function(excludeAnd) {

            var i = remainders.length;
            while(i--) {
              var result = __subtractDnfAnds(remainders[i], excludeAnd);
              if(!result) {
                remainders.splice(i, 1);
                if(!remainders.length) return false;
              } else {
                // replace at i and insert the remaining ands, afterwards.
                // "Gained" how many ands?
                // var extra = ands.length - 1;
                result.unshift(i, 1);
                remainders.splice.apply(remainders, result);

                // Because looping is done backwards, any extra ands are not visited anymore in this excludeAnd.
              }
            }
          });

          if(__isDebugMode) logger.log("remainders 2 #=" + remainders.length);
        }

        var result = remainders.length
            ? new __filter.Or({operands: remainders})
            : __filter.False.instance;

        // if(__isDebugMode) logger.log("result = " + result.contentKey);

        return result;
      },

      /**
       * Converts a copy of this filter into Disjunctive Normal Form and returns it.
       *
       * A filter in DNF is one of:
       *
       * 1. A [True]{@link pentaho.data.filter.True} filter - filters everything.
       * 2. A [False]{@link pentaho.data.filter.False} filter - filters nothing.
       * 3. An [Or]{@link pentaho.data.filter.Or} of [Ands]{@link pentaho.data.filter.And} of,
       *    possibly negated, (non-degenerate) [terminal]{@link pentaho.data.filter.Abstract#isTerminal} filters,
       *    such as: [IsEqual]{@link pentaho.data.filter.IsEqual}.
       *
       * DNF is particularly useful for representing filters because,
       * excluding its degenerate cases,
       * it is the natural form of a filter that selects a set of rows,
       * such as:
       *
       *   (country = "us" and productLine = "cars") or (country = "pt" and productLine = "jets")
       *
       * Generally, DNF conversion is computationally expensive, and, for some types of filters,
       * can not terminate in a reasonable amount of time.
       * One such type of filter is that which results from a difference operation,
       * such as `filterA.and(filterB.negate())`. Directly converting such a structured filter to DNF
       * will usually not terminate soon enough.
       * For such a reason, and because it is such a common operation,
       * the Filter API provides an optimized difference operator: [andNot]{@link pentaho.data.filter.Abstract#andNot}
       * which is able to keep computational cost low enough for practical cases, .
       * The resulting filter can safely be converted to DNF.
       *
       * The result of this operation is cached.
       *
       * @return {!pentaho.data.filter.True|!pentaho.data.filter.False|!pentaho.data.filter.Or} The resulting
       * DNF filter.
       *
       * @see https://en.wikipedia.org/wiki/Disjunctive_normal_form
       */
      toDnf: function() {
        var result = this.__toDnfCache;
        if(!result) {
          this.__toDnfCache = result = this
              .visit(__moveNotInward)
              .visit(__moveAndInward)
              .visit(__flattenTree)
              .visit(__ensureDnfTopLevel)
              .visit(__simplifyDnfTopLevel);

          result.__toDnfCache = result;
        }
        return result;
      },

      $type: /** @lends pentaho.data.filter.Abstract.Type# */{
        id: module.id,

        isAbstract: true
      }
    });

    // Store reference back to the `filter` object in the Abstract class.
    __filter.Abstract._core = __filter;

    // Setup the remaining core classes
    notFactory(__filter);
    treeFactory(__filter);
    andFactory(__filter);
    orFactory(__filter);
    trueFactory(__filter);
    falseFactory(__filter);
    propertyFactory(__filter);
    isEqFactory(__filter);
    isInFactory(__filter);
    isGtFactory(__filter);
    isLtFactory(__filter);
    isGteFactory(__filter);
    isLteFactory(__filter);
    isLikeFactory(__filter);

    return __filter.Abstract;

    function __moveNotInward(f) {
      var o;
      if(f.kind === "not" && (o = f.operand)) {
        /* eslint default-case: 0 */
        switch(o.kind) {
          case "and":
            // 1. `NOT(A AND B) <=> NOT A OR  NOT B` - De Morgan 1 - NOT over AND
            return new __filter.Or({operands: o.operands.toArray(function(ao) {
              return ao.negate().visit(__moveNotInward);
            })});

          case "or":
            // 2. `NOT(A OR B) <=> NOT A AND NOT B` - De Morgan 2 - NOT over OR
            return new __filter.And({operands: o.operands.toArray(function(oo) {
              return oo.negate().visit(__moveNotInward);
            })});

          case "not":
            // 3. NOT(NOT(A)) <=> A - Double negation elimination
            return o.operand && o.operand.visit(__moveNotInward);

          case "true":
            // 3. NOT(TRUE) <=> FALSE
            return __filter.False.instance;

          case "false":
            // 3. NOT(FALSE) <=> TRUE
            return new __filter.True();

          default:
            return o.negate();
        }
      }
    }

    function __moveAndInward(f) {

      if(f.kind === "and") {
        // 1. AND distributivity over OR
        var i = -1;
        var os = f.operands;
        var L = os.count;
        var osAndOther = [];
        var ors = [];
        var ao;

        while(++i < L) {
          ao = os.at(i).visit(__moveAndInward);
          if(ao.kind === "or") {
            ors.push(ao);
          } else {
            osAndOther.push(ao);
          }
        }

        var LOr = ors.length;
        if(LOr) {
          // One And operand per permutation of `or` operands
          //  2   2   3  - # operands
          //
          // or1 or2 or3
          //  1   1   1
          //  1   1   2
          //  1   1   3
          //  1   2   1
          //  1   2   2
          //  1   2   3
          //  2   1   1
          //  2   1   2
          //  2   1   3
          //  2   2   1
          //  2   2   2
          //  2   2   3
          var ands = [];
          var andOperands = new Array(LOr).concat(osAndOther);

          __buildAndOperandsRecursive(ands, andOperands, ors, 0);

          return new __filter.Or({operands: ands});
        }

        return new __filter.And({operands: osAndOther});
      }
    }

    function __buildAndOperandsRecursive(ands, andOperands, ors, iOr) {
      if(iOr < ors.length) {

        var iOrNext = iOr + 1;
        var os = ors[iOr].operands;
        var L = os.count;
        var i = -1;

        while(++i < L) {
          andOperands[iOr] = os.at(i);
          __buildAndOperandsRecursive(ands, andOperands, ors, iOrNext);
        }
      } else {
        ands.push(new __filter.And({operands: andOperands.slice()}));
      }
    }

    function __flattenTree(f) {

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
            var o = os.at(i).visit(__flattenTree);
            if(o.kind === kind) {
              osFlattened.push.apply(osFlattened, o.operands.toArray());
            } else {
              osFlattened.push(o);
            }
          }

          return new f.constructor({operands: osFlattened});
      }
    }

    function __ensureDnfTopLevel(f) {

      switch(f.kind) {
        case "true":
        case "false":
          break;

        case "or":

          var i = -1;
          var os = f.operands;
          var L = os.count;
          var osAnds = [];

          while(++i < L) {
            var o = os.at(i);
            switch(o.kind) {
              // early true/false detection
              case "true": return __filter.True.instance;
              case "false": continue;
              case "and": osAnds.push(o); break;
              default:
                osAnds.push(new __filter.And({operands: [o]}));
            }
          }

          return new f.constructor({operands: osAnds});

        case "and":
          f = new __filter.Or({operands: [f]});
          break;

        default:
          f = new __filter.Or({operands: [new __filter.And({operands: [f]})]});
      }

      return f;
    }

    function __simplifyDnfTopLevel(f) {

      // -- Duplicates --
      // 1) AND(A, A) <=> AND(A)
      // 2)  OR(A, A) <=>  OR(A)

      // -- Neutral Operand Elimination --
      // 3) AND( .. True .. ) <=> AND( .. .. )
      // 4)  OR( .. False .. ) <=> OR( .. .. )

      // -- AND/OR Elimination --
      // 5) AND( .. False .. ) <=> False
      // 6)  OR( .. True .. ) <=> True

      // -- NOT Elimination --
      // 7) NOT(True) <=> False (already eliminated above)
      // 8) NOT(False) <=> True (already eliminated above)

      // -- XYZ --
      // 9) AND(A, NOT(A)) <=> False - Law of non-contradiction
      //    can occur within an OR
      //
      // 10) OR (A, NOT(A)) <=> True  - Law of excluded middle
      //    cannot occur cause DNF's ORs always contain direct ANDs, and never NOTs.

      // 11): AND() <=> True
      // 12):  OR() <=> False
      // NOTE:  OR(AND()) <=> True

      // Remove Nots of properties who have equals to other values

      // TopLevel = Or | True | False
      return f.kind === "or" ? __simplifyDnfOr(f) : f;
    }

    function __simplifyDnfOr(f) {
      // 2)  OR(A, A) <=>  OR(A)
      // 4)  OR( .. False .. ) <=> OR( .. .. )
      // 6)  OR( .. True .. ) <=> True
      // 10) OR (A, NOT(A)) <=> True  - Law of excluded middle (cannot occur in DNF)
      // 12) OR() <=> False
      var andsByKey = {};
      var andsNew = [];

      var i = -1;
      var ands = f.operands;
      var L = ands.count;
      while(++i < L) {

        // assert ands.at(i).kind === "and"

        var o = ands.at(i).visit(__simplifyDnfAnd);
        switch(o.kind) {
          case "true": return __filter.True.instance; // 6)
          case "false": continue; // 4)
        }

        // assert o.kind === "and"

        var key = o.contentKey;

        // 2) Duplicate And? -> Ignore.
        if(O.hasOwn(andsByKey, key)) continue;

        andsByKey[key] = o;
        andsNew.push(o);
      }

      if(!andsNew.length) return __filter.False.instance; // 12)

      return new __filter.Or({operands: andsNew});
    }

    function __simplifyDnfAnd(f) {
      // 1)  AND(A, A) <=> AND(A)
      // 3)  AND( .. True .. ) <=> AND( .. .. )
      // 5)  AND( .. False .. ) <=> False
      // 9)  AND(A, NOT(A)) <=> False - Law of non-contradiction
      // 11) AND() <=> True
      // 13) Cannot be equal to two things at the same time
      //     AND((= p1 1) (= p1 2)) <=> False
      // 14) Ignore property **not equal** when already have property equal to a != value
      //     AND((= p1 1) (not (= p1 2))) <=> AND((= p1 1))

      var osByKey = {};

      // +propName -> []   (positive)
      // -propName -> []   (negated)
      var equalsByPropName = {};
      var osNew = [];

      var i = -1;
      var os = f.operands;
      var L = os.count;
      while(++i < L) {
        var o = os.at(i);
        var isNot = false;
        var p;
        switch(o.kind) {
          case "false": return __filter.False.instance; // 5)
          case "true": continue; // 3)
          case "not": isNot = true; break;
        }

        var key = o.contentKey;

        // 2) Duplicate operand? -> Ignore.
        if(O.hasOwn(osByKey, key)) continue;

        if(isNot) {
          var oo = o.operand;
          if(oo) {
            // 9) Law of non-contradiction
            if(O.hasOwn(osByKey, oo.contentKey)) {
              // Already have non-negated operand
              return __filter.False.instance;
            }

            if(oo.kind === "isEqual" && (p = oo.property)) {
              // 14) Ignore property **not equal** when already have property equal to a != value
              //     If present in equalsByPropName, then it must be for a != value, or the key test above, (9),
              //     would have caught it.
              if(O.hasOwn(equalsByPropName, "+" + p)) {
                continue;
              }
              (equalsByPropName["-" + p] || (equalsByPropName["-" + p] = [])).push(o);
            }
          }
        } else {
          // 9) Law of non-contradiction
          if(O.hasOwn(osByKey, "(not " + key + ")")) {
            // Already have negated operand
            return __filter.False.instance;
          }

          if(o.kind === "isEqual" && (p = o.property)) {

            // 13) Cannot be equal to two things at the same time.
            //     If present in equalsByPropName, then it must be for a != value, or the key test above, (2),
            //     would have caught it.
            if(O.hasOwn(equalsByPropName, "+" + p)) {
              return __filter.False.instance;
            }

            (equalsByPropName["+" + p] || (equalsByPropName["+" + p] = [])).push(o);

            // 14) If property **equal** and already have property **not equal** to a != value
            //     Remove the property not equal...
            //     If present in equalsByPropName, then it must be for a != value, or the key test above, (9),
            //     would have caught it.
            var notEquals = O.getOwn(equalsByPropName, "-" + p);
            if(notEquals) {
              notEquals.forEach(function(notEqual) {
                osNew.splice(osNew.indexOf(notEqual), 1);
                delete osByKey[notEqual.contentKey];
              });
              delete equalsByPropName["-" + p];
            }
          }
        }

        osByKey[key] = o;
        osNew.push(o);
      }

      if(!osNew.length) return __filter.True.instance; // 11)

      return new __filter.And({operands: osNew});
    }

    // Optimized version... of a - b
    function __subtractDnfAnds(a, b) {
      // a,b - And of literals: possibly negated
      // Additionally, it is assumed that the ands are simplified, such that:
      // * a isEqual property can only occur once, either positively or negatively

      var results = [];
      var resulti;

      var literalsAByPropName = a.__equalityLiteralsByPropertyName;
      var bs = b.operands;
      var i = bs.count;
      var isPbNot;
      var isPaNot;

      while(i--) {
        var bi = bs.at(i);
        var pb = (isPbNot = bi.isNot) ? bi.operand : bi;

        var aiInfo = O.getOwn(literalsAByPropName, pb.property);
        if(aiInfo && pb.kind === "isEqual") {
          var ai = aiInfo.operand;
          var pa = (isPaNot = ai.isNot) ? ai.operand : ai;
          if(isPaNot) {
            if(isPbNot) {
              // (-va - -vb) <=> (-va + vb) <=> (p != va and p = vb)
              // if va == vb => false
              // if va != vb => (pb = vb)
              if(!__equalValues(pa.value, pb.value)) {
                resulti = a.operands.toArray();
                resulti[aiInfo.index] = pb;
                results.push(new __filter.And({operands: resulti}));
              }
            } else {
              // (-va - vb) <=> (-va -vb) <=> (p != va and p != vb)
              // if va == vb => the whole diff is = to a
              // if va != vb => (p !in (va,vb))
              if(__equalValues(pa.value, pb.value)) {
                return [a];
              }

              // TODO: replace ai by not in(va,vb) ? IsIn is even not defined...
              throw error.notImplemented("This case is not supported.");
              /*
              resulti = a.operands.toArray();
              resulti[aiInfo.index] = new filter.IsIn({property: pa.property, values: [pa.value, pb.value]}).negate();
              results.push(new filter.And({operands: resulti}));
              */
            }
          } else if(isPbNot) {
            // (va - -vb) <=> (va + vb) <=> (p = va and p = vb)
            // if va == vb => (p = va) => a
            // if va != vb => false
            if(__equalValues(pa.value, pb.value)) {
              return [a];
            }
          } else if(!__equalValues(pa.value, pb.value)) {
            // (va - vb) <=> (p = va and p != vb)
            // if va == vb => false
            // if va != vb => (p = va) => a
            return [a];
          }
        } else {
          // Add a term with an additional operand, -bi
          resulti = a.operands.toArray();
          resulti.push(isPbNot ? pb : pb.negate());
          results.push(new __filter.And({operands: resulti}));
        }
      }

      return results.length ? results : null;
    }
  }];

  function __equalValues(v1, v2) {
    return v1 === v2 || (v1 != null && v2 != null && v1.valueOf() === v2.valueOf());
  }
});
