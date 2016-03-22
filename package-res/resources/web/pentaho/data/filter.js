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
  "./_filter/AbstractFilter", "./_filter/AbstractFilter.IFilter",
  "./_filter/AbstractPropertyFilter",
  "./_filter/AbstractTreeFilter",
  "./_filter/IsEqual",
  "./_filter/IsIn",
  "./_filter/And", "./_filter/And.IFilter",
  "./_filter/Or", "./_filter/Or.IFilter",
  "./_filter/Not"
], function(AbstractFilter, AbstractFilterIFilter,
            AbstractPropertyFilter, AbstractTreeFilter, IsEqual, IsIn,
            And, AndIFilter,
            Or, OrIFilter,
            Not) {
  "use strict";

  AbstractFilter.implement(AbstractFilterIFilter);
  And.implement(AndIFilter);
  Or.implement(OrIFilter);

  /**
   * This namespace contains classes for filters that are used for expressing a data set
   * [intensionally]{@link https://en.wikipedia.org/wiki/Intensional_definition}.
   * It also exports a static create function that can be used to generate a filter tree from a spec.
   *
   * @namespace
   * @name pentaho.data.filter
   * @memberOf pentaho.data
   * @amd pentaho/data/filter
   *
   * @example
   * <caption> Two methods for creating a filter.</caption>
   *
   * require(["pentaho/data/Table", "pentaho/data/filter"], function(Table, filter) {
   *   var data = new Table({
   *     model: [
   *       {name: "product", type: "string",  label: "Product"},
   *       {name: "sales",   type: "number",  label: "Sales"},
   *       {name: "inStock", type: "boolean", label: "In Stock"}
   *     ],
   *     rows: [
   *       {c: [{v: "A"}, {v: 12000}, {v: true}]},
   *       {c: [{v: "B"}, {v: 6000},  {v: true}]},
   *       {c: [{v: "C"}, {v: 12000}, {v: false}]},
   *       {c: [{v: "D"}, {v: 1000},  {v: false}]},
   *       {c: [{v: "E"}, {v: 2000},  {v: false}]},
   *       {c: [{v: "F"}, {v: 3000},  {v: false}]},
   *       {c: [{v: "G"}, {v: 4000},  {v: false}]}
   *     ]
   *   });
   *
   *   var sales12k = new filter.IsEqual("sales", [12000]);
   *   var productAB = new filter.IsIn("product", ["A", "B"]);
   *   var notInProductABFilter = new filter.Not(productAB);
   *   var andFilter = new filter.And([sales12k, notInProductABFilter]);
   *   var dataFilter = new filter.Not(andFilter);
   *   var filteredData = dataFilter.apply(data);
   *   // filteredData.getValue(0, 0) === "A"
   *   // filteredData.getValue(1, 0) === "B"
   *   // filteredData.getValue(2, 0) === "D"
   *   // filteredData.getValue(3, 0) === "E"
   *   // filteredData.getValue(4, 0) === "F"
   *   // filteredData.getValue(5, 0) === "G"
   *
   *   var specFromDataFilter = dataFilter.toSpec();
   *   // {
   *   //   "$not": {
   *   //     "$and": [
   *   //       {"sales": 12000},
   *   //       {"$not": {"product": {"$in": ["A", "B"]}}}
   *   //     ]
   *   //   }
   *   // };
   *
   *   //Or alternatively
   *   var spec = {
   *      "$not": {
   *        "$and": [
   *          {"sales": 12000},
   *          {"$not": {"product": {"$in": ["A", "B"]}}}
   *        ]
   *      }
   *    };
   *
   *   var filterFromSpec = filter.create(spec);
   *   var filteredDataFromSpec = filterFromSpec.apply(data);
   *   // filteredDataFromSpec.getValue(0, 0) === "A"
   *   // filteredDataFromSpec.getValue(1, 0) === "B"
   *   // filteredDataFromSpec.getValue(2, 0) === "D"
   *   // filteredDataFromSpec.getValue(3, 0) === "E"
   *   // filteredDataFromSpec.getValue(4, 0) === "F"
   *   // filteredDataFromSpec.getValue(5, 0) === "G"
   * });
   *
   */
  return {
    //Abstract classes
    AbstractFilter: AbstractFilter,
    AbstractPropertyFilter: AbstractPropertyFilter,
    AbstractTreeFilter: AbstractTreeFilter,
    // Leaf nodes
    IsEqual: IsEqual,
    IsIn: IsIn,
    // Non-leaf nodes
    Or: Or,
    And: And,
    Not: Not,

    /**
     * Create a filter from a spec.
     *
     * @memberOf pentaho.data.filter
     * @method
     * @static
     * @param {Object} spec - The specification of a filter.
     * @return {!pentaho.data.filter.Or} The filter objects that correspond to the specification.
     */
    create: function(spec) {
      if(spec) return new Or(fromSpec(spec));
      return new Or();
    }
  };

  function fromSpec(filterSpec) {
    var registeredFilters = {
      "$and": And,
      "$or": Or,
      "$not": Not,
      "$eq": IsEqual,
      "$in": IsIn
    };

    for(var key in filterSpec) {
      var value = filterSpec[key];
      if(key === "$not") {
        return new registeredFilters["$not"](fromSpec(value));
      } else if(key[0] === "$") {
        // And, Or: {$and:[...]}, {$or:[...]}}
        return new registeredFilters[key](value.map(fromSpec));
      } else if(typeof value === "object"){
        // IsEqual, IsIn: {property:{"$eq": value}}
        for(var operator in value) {
          var operand = value[operator];
          return new registeredFilters[operator](key, operand);
        }
      } else {
        // shortcut: assume {property: value} is synonym for {property:{"$eq": value}}
        return new IsEqual(key, value);
      }
    }
  }

});