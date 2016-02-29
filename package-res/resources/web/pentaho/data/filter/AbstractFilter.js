/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "../../lang/Base",
  "../../util/arg",
  "require"
  //"./Or",
  //"./And",
  //"./Not",
], function(Base, arg, require, Or, And, Not) {
  "use strict";

  var Or, And, Not;
  /**
   * @name AbstractFilter
   * @memberOf pentaho.data.filter
   * @class
   * @abstract
   * @amd pentaho/data/filter/AbstractFilter
   *
   * @classdesc The (abstract) base class for filters that represent subsets of a particular {@link pentaho.data.Table} object.
   * A filter is an intensional representation of a subset of items in a collection.
   *
   * The hierarchy spawned by this base class allows building filters by composition, in the form of a tree of filters.
   * When filtering a particular item in a data set, the leaf nodes evaluate the data and return a boolean that signals if the item belongs to the set defined by the filter.
   * Non-leaf nodes act as aggregators of the outcomes of other nodes (leaf or non-leaf).
   *
   * ### Remarks
   *
   * The following derived classes are also abstract and provide the non-leaf and leaf
   * nodes respectively that override and implement the methods necessary for filtering a
   * data format.
   *
   * * {@link pentaho.data.filter.AbstractPropertyFilter}
   * * {@link pentaho.data.filter.AbstractTreeFilter}
   *
   * NOTE: A filter does not represent projections.
   *
   */
  var AbstractFilter = Base.extend("pentaho.data.filter.AbstractFilter", /** @lends pentaho.data.filter.AbstractFilter# */{
    get type() {
      /* istanbul ignore next: placeholder getter */
      return null;
    },

    _op: null,

    /**
     * Outputs a simple object that serializes the operation described by this filter.
     * The syntax loosely follows the query language of MongoDB.
     *
     * @name pentaho.data.filter.AbstractFilter#toSpec
     * @method
     * @abstract
     * @ignore
     *
     * @example
     * <caption> Create a new <code>Or</code> filter.</caption>
     *
     * require(["pentaho/data/Table", "pentaho/data/Filter"], function(Table, Filter) {
     *   var data = new Table({
     *     model: [
     *       {name: "product", type: "string", label: "Product"},
     *       {name: "sales", type: "number", label: "Sales"},
     *       {name: "inStock", type: "boolean", label: "In Stock"}
     *     ],
     *     rows: [
     *       {c: [{v: "A"}, {v: 12000}, {v: true}]},
     *       {c: [{v: "B"}, {v: 6000}, {v: true}]},
     *       {c: [{v: "C"}, {v: 12000}, {v: false}]},
     *       {c: [{v: "D"}, {v: 1000}, {v: false}]},
     *       {c: [{v: "E"}, {v: 2000}, {v: false}]},
     *       {c: [{v: "F"}, {v: 3000}, {v: false}]},
     *       {c: [{v: "G"}, {v: 4000}, {v: false}]}
     *     ]
     *   });
     *
     *   var sales12k = new Filter.IsEqual("sales", [12000]);
     *   var productAB = new Filter.IsIn("product", ["A", "B"]);
     *   var notInProductABFilter = new Not(productAB);
     *   var andFilter = new Filter.And([sales12k, notInProductABFilter]);
     *   var filter = new Not(andFilter);
     *   var specFromFilter = filter.toSpec();
     *
     *   // JSON.Stringify(specFromFilter) === {
     *   //   "$not": {
     *   //     "$and": [
     *   //       {"sales": 12000},
     *   //       {"$not": {"product": {"$in": ["A", "B"]}}}
     *   //     ]
     *   //   }
     *   // };
     *
     *   var filterFromSpec = Filter.create(specFromFilter);
     *   var filteredDataFromSpec = filterFromSpec.apply(data); //filteredDataFromSpec.getValue(0, 0) === "A", filteredDataFromSpec.getValue(1, 0) === "B", filteredDataFromSpec.getValue(2, 0) === "D", filteredDataFromSpec.getValue(3, 0) === "E", filteredDataFromSpec.getValue(4, 0) === "F", filteredDataFromSpec.getValue(5, 0) === "G"
     * });
     *
     *
     * @return {Object} Object.
     */
    toSpec: /* istanbul ignore next: placeholder method */ function() {
      return null;
    },

    /**
     * Tests if an element belongs to the set defined by this filter.
     *
     * @name pentaho.data.filter.AbstractFilter#contains
     * @method
     * @abstract
     * @param {object} - [entry] The candidate data set entry.
     * @return {boolean} True if the entry value is contained by this filter.
     */
    contains: /* istanbul ignore next: placeholder method */ function(element) {
      return false;
    },

    /**
     * Implements the NOT operation between this filter and another.
     *
     * @name pentaho.data.filter.AbstractFilter#invert
     * @method
     * @abstract
     * @returns {pentaho.data.filter.Not} A filter that is the inverse of this filter.
     */
    invert: function() {
      if(!Not) Not = require("./Not");
      return new Not(this);
    },

    /**
     * Implements the OR operation between this filter and another.
     *
     * @name pentaho.data.filter.AbstractFilter#or
     * @method
     * @abstract
     * @returns {pentaho.data.filter.Or} A filter that is the union of this filter with another.
     */
    or: function() {
      if(!arguments.length) return this;
      var args = arg.slice(arguments);
      args.unshift(this);
      if(!Or) Or = require("./Or");
      return new Or(args);
    },

    /**
     * Implements the INTERSECT operation between this filter and another.
     *
     * @name pentaho.data.filter.AbstractFilter#and
     * @method
     * @abstract
     * @returns {pentaho.data.filter.And} A filter that is the intersection of this filter with another.
     */
    and: function() {
      if(!arguments.length) return this;
      var args = arg.slice(arguments);
      args.unshift(this);
      if(!And) And = require("./And");
      return new And(args);
    },

    /**
     * Returns the subset of data that matches this filter.
     *
     * @name pentaho.data.filter.AbstractFilter#apply
     * @method
     * @abstract
     * @param {object} data The data to filter
     * @returns {object} The data view of the filtered data set.
     */
    apply: /* istanbul ignore next: placeholder method */ function(data) {
      return false;
    }
  });

  return AbstractFilter;

});