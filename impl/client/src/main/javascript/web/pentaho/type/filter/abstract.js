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
  "../../util/arg",
  "../../util/error"
], function(module, complexFactory, treeFactory, andFactory, orFactory, notFactory, arg, error) {

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
        return this;
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

      type: /** @lends pentaho.type.filter.Abstract.Type# */{
        id: module.id,

        isAbstract: true
      }
    });

    // Store reference back to the `filter` object in the Abstract class.
    filter.Abstract._core = filter;

    // Setup the remaining core classes
    notFactory (filter);
    treeFactory(filter);
    andFactory (filter);
    orFactory  (filter);

    return filter.Abstract;
  };
});
