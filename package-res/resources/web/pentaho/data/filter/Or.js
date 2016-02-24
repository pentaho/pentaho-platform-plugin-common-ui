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
  "./AbstractTreeFilter",
  "require",
  "./And",
], function(AbstractTreeFilter, require, And) {
  "use strict";

  /**
   * @name Or
   * @memberOf pentaho.data.filter
   * @class
   * @abstract
   * @amd pentaho/data/filter/Or
   *
   * @classdesc The `Or` class implements a type of AbstractTreeFilter {@link pentaho.data.filter.AbstractTreeFilter}.
   *
   * @example
   * <caption> Create a new <code>Or</code> filter.
   *
   * require(["pentaho/data/Table", "pentaho/data/filter/IsIn", "pentaho/data/filter/IsEqual", "pentaho/data/filter/Or"], function(Table, IsIn, IsEqual, Or) {
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
   *
   *  var sales12k = new IsIn("sales", [12000]);
   *  var inStock = new IsEqual("inStock", true);
   *  var combination1 = new Or([sales12k, inStock]);
   *  var data1 = combination1.apply(data); //data1.getValue(0, 0) === ["A", "B", "C"]
   * });
   */
  var OrFilter = AbstractTreeFilter.extend("pentaho.data.filter.Or", /** @lends pentaho.data.filter.Or# */{

    /**
     * @inheritdoc
     * @readonly
     */
    get type() { return "$or";},

    /**
     * @inheritdoc
     */
    contains: function(entry) {
      var N = this.children ? this.children.length : 0;

      var memo = false; // false is the neutral element of an OR operation
      for(var k = 0; k < N && !memo; k++) {
        memo = memo || this.children[k].contains(entry);
      }
      return memo;
    },

    /**
     * @inheritdoc
     */
    or: function() {
      for(var k = 0, N = arguments.length; k < N; k++) {
        this.insert(arguments[k]);
      }
      return this;
    },

    /**
     * @inheritdoc
     */
    invert: function() {
      var negatedChildren = this.children.map(function(child) {
        return child.invert();
      });
      if(!And) And = require("./And");
      return new And(negatedChildren);
    }
  });

  return OrFilter;

});