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
  "./Filter/IsEqual",
  "./Filter/IsIn",
  "./Filter/And",
  "./Filter/Or",
  "./Filter/Not",
  "./Filter/AbstractFilter"
], function(IsEqual, IsIn, AndFilter, OrFilter, NotFilter, AbstractFilter) {
  "use strict";


  var RootFilter = OrFilter.extend({
    constructor: function(filterSpec) {
      this.base();
      if(filterSpec)
        this.union(fromSpec(filterSpec));
    }
  });

  return {
    // Leaf nodes
    IsEqual: IsEqual,
    IsIn: IsIn,
    // Non-leaf nodes
    Or: OrFilter,
    And: AndFilter,
    Not: NotFilter,
    //Root: RootFilter,
    create: function(spec) { return new RootFilter(spec); }
    // factories
    //isEqual: function(property, value) { return new IsEqual(property, value); },
    //isIn: function(property, value) { return new IsIn(property, value); },
    //union: AbstractFilter.union,
    //intersection: AbstractFilter.intersection,
    //negation: AbstractFilter.negation,
    //or: AbstractFilter.union,
    //and: AbstractFilter.intersection,
    //not: AbstractFilter.negation
  };

  function fromSpec(filterSpec) {
    var registeredFilters = {
      "$and": AndFilter,
      "$or": OrFilter,
      "$not": NotFilter,
      "$eq": IsEqual,
      "$in": IsIn
    };

    var operator, property, value;
    for(var arg in filterSpec) {
      if(arg[0] === "$") {
        // And, Or, Not: {$and:[...]}, {$or:[...]}, {$not:[...]}
        operator = arg;
        if(operator === "$not")
          return new registeredFilters["$not"](fromSpec(filterSpec[operator]));
        return new registeredFilters[operator](filterSpec[operator].map(fromSpec));
      } else if(typeof filterSpec[arg] !== "object") {
        // shortcut: assume {property: value} is synonym for {property:{"$eq": value}}
        return new IsEqual(arg, filterSpec[arg]);
      } else {
        // IsEqual, IsIn: {property:{"$eq": value}}
        property = arg;
        for(operator in filterSpec[property]) {
          value = filterSpec[property][operator];
          return new registeredFilters[operator](property, value);
        }
      }

    }
  }

});