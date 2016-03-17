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
  "./_apply"
], function(Base, _apply) {
  "use strict";

  /**
   * @name AbstractFilter
   * @memberOf pentaho.data.filter
   *
   * @class
   * @extends pentaho.lang.Base
   * @abstract
   *
   * @classdesc The (abstract) base class for filters that represent subsets of a particular
   * {@link pentaho.data.Table} object.
   *
   * A filter is an [intensional]{@link https://en.wikipedia.org/wiki/Intensional_definition}
   * representation of a subset of items in a collection.
   *
   * The hierarchy spawned by this class allows building filters by composition, in the form of a tree of filters.
   * When filtering a particular item in a data set, the leaf nodes evaluate the data
   * and return a boolean that signals if the item belongs to the set defined by the filter.
   * Non-leaf nodes act as aggregators of the outcomes of other nodes (leaf or non-leaf).
   */
  var AbstractFilter = Base.extend("pentaho.data.filter.AbstractFilter", /** @lends pentaho.data.filter.AbstractFilter# */{

    /**
     * Gets the type of filter.
     * Use this property to dynamically inspect the type implemented by this filter.
     *
     * @type {string}
     * @readonly
     */
    get type() {
      /* istanbul ignore next: placeholder getter */
      return null;
    },

    /**
     * @ignore
     */
    _op: null,

    /**
     * Determines if an element belongs to the set defined by this filter.
     *
     * @param {!pentaho.type.Element} element - The candidate data set element.
     * @return {boolean} `true` if this filter contains `element`, or `false` otherwise.
     * @abstract
     */
    contains: /* istanbul ignore next: placeholder method */ function(element) {
      return false;
    },

    /**
     * Returns the subset of data that matches this filter.
     *
     * @param {!pentaho.data.Table} dataTable - The data table to filter.
     * @returns {!pentaho.data.TableView} The data table view of the restricted data set.
     * @override
     */
    apply: function(dataTable) {
      return _apply(this, dataTable);
    },

    /**
     * Returns a transformed version of this filter.
     *
     * Note: The `iteratee` callback is invoked with this filter as a single argument.
     *
     * @param {?pentaho.data.filter~transformIteratee} iteratee - Function which will transform this filter.
     * @return {!pentaho.data.filter.AbstractFilter} Transformed filter.
     *
     * @see pentaho.data.filter.AbstractTreeFilter#walk
     */
    walk: function(iteratee) {
      return iteratee(this, null);
    },

    /**
     * Outputs a simple object that serializes the operation described by this filter.
     * The syntax loosely follows the query language of MongoDB.
     *
     * @abstract
     * @ignore
     *
     * @example
     * <caption> Create a new <code>Or</code> filter.</caption>
     *
     * require(["pentaho/data/Table", "pentaho/data/filter/IsIn", "pentaho/data/filter/IsEqual", "pentaho/data/filter/And", "pentaho/data/filter/Not", "pentaho/data/filter"], function(Table, IsIn, IsEqual, And, Not, filter) {
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
     *   var sales12k = new IsEqual("sales", [12000]);
     *   var productAB = new IsIn("product", ["A", "B"]);
     *   var notInProductABFilter = new Not(productAB);
     *   var andFilter = new And([sales12k, notInProductABFilter]);
     *   var dataFilter = new Not(andFilter);
     *   var filteredData = dataFilter.apply(data);
     *   // filteredData.getValue(0, 0) === "A"
     *   // filteredData.getValue(1, 0) === "B"
     *   // filteredData.getValue(2, 0) === "D"
     *   // filteredData.getValue(3, 0) === "E"
     *   // filteredData.getValue(4, 0) === "F"
     *   // filteredData.getValue(5, 0) === "G"
     *
     *   var specFromDataFilter = dataFilter.toSpec();
     *
     *   // JSON.stringify(specFromDataFilter) === {
     *   //   "$not": {
     *   //     "$and": [
     *   //       {"sales": 12000},
     *   //       {"$not": {"product": {"$in": ["A", "B"]}}}
     *   //     ]
     *   //   }
     *   // };
     * });
     *
     * @return {!pentaho.data.filter.AbstractFilter} Object.
     */
    toSpec: /* istanbul ignore next: placeholder method */ function() {
      return null;
    }
  });

  return AbstractFilter;

  /**
   * Iteratee
   *
   * @callback pentaho.data.filter~transformIteratee
   * @param {?pentaho.data.filter.AbstractFilter} filter - The filter to be transformed.
   * @param {!pentaho.data.filter.AbstractFilter[]} [filterOperands] - List of filter operands.
   * @return {!pentaho.data.filter.AbstractFilter[]}
   */

});