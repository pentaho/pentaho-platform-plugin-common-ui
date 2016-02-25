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
  "./AbstractFilter",
  "../../util/object",
  "../../lang/ArgumentRequiredError",
  "./_toSpec"
], function(AbstractFilter, O, ArgumentRequiredError, _toSpec) {
  "use strict";

  /**
   * @name Not
   * @memberOf pentaho.data.filter
   * @class
   * @abstract
   * @amd pentaho/data/filter/Not
   *
   * @classdesc The `Not` class implements a type of AbstractTreeFilter {@link pentaho.data.filter.AbstractTreeFilter}.
   *
   * @example
   * <caption> Create a new <code>Not</code> filter.
   *
   * require(["pentaho/data/Table", "pentaho/data/filter/IsIn", "pentaho/data/filter/IsEqual", "pentaho/data/filter/Not"], function(Table, IsIn, IsEqual, Not) {
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
   *  var sales12k = new Filter.IsEqual("sales", 12000);
   *  var filter = new Filter.Not(sales12k);
   *  var data = filter.apply(data); //data.getValue(0, 0) === ["B", "D", "E", "F", "G"]
   * });
   */
  var NotFilter = AbstractFilter.extend("pentaho.data.filter.Not", /** @lends pentaho.data.filter.Not# */{

    constructor: function(operand) {
      if(!operand) throw new ArgumentRequiredError("operand");

      O.setConst(this, "operand", operand);
    },

    /**
     * @inheritdoc
     * @readonly
     */
    get type() { return "$not";},

    /**
     * @inheritdoc
     */
    contains: function(entry) {
      return !this.operand.contains(entry);
    },

    /**
     * @inheritdoc
     */
    invert: function() {
      return this.operand;
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      return _toSpec(this.type, this.operand.toSpec());
    }
  });

  return NotFilter;

});