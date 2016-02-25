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
  "./AbstractPropertyFilter"
], function(AbstractPropertyFilter) {
  "use strict";

  /**
   * @name IsIn
   * @memberOf pentaho.data.filter
   * @class
   * @abstract
   * @amd pentaho/data/filter/IsEqual
   *
   * @classdesc The `IsEqual` class implements a type of AbstractPropertyFilter {@link pentaho.data.filter.AbstractPropertyFilter}.
   *
   * @example
   * <caption> Create a new <code>IsEqual</code> filter.
   *
   * require(["pentaho/data/Table", "pentaho/data/filter/IsEqual"], function(Table, IsEqual) {
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
   *   var filter = new IsEqual("product", ["A"]);
   *   var filteredData = filter.apply(data); //filteredData.getValue(0, 0) === "A"
   * });
   */
  var IsEqual = AbstractPropertyFilter.extend("pentaho.data.filter.IsEqual", /** @lends pentaho.data.filter.IsEqual# */{

    /**
     * @inheritdoc
     * @readonly
     */
    get type() { return "$eq";},

    /**
     * @inheritdoc
     */
    _operation: function(value) {
      return this.value === value;
    }
  });

  return IsEqual;
});