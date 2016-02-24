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
  "./AbstractPropertyFilter",
  "./_toSpec"
], function(AbstractPropertyFilter, toSpec) {
  "use strict";

  /**
   * @name IsIn
   * @memberOf pentaho.data.Filter
   * @class
   * @abstract
   * @amd pentaho/data/Filter/IsIn
   *
   * @classdesc The `IsIn` class implements a type of AbstractPropertyFilter {@link pentaho.data.Filter.AbstractPropertyFilter}.
   *
   * @example
   * <caption> Create a new <code>IsIn</code> filter.
   *
   * require(["pentaho/data/Table", "pentaho/data/Filter/IsIn"], function(Table, IsIn) {
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
   *   var filter = new IsIn("product", ["A"]);
   *   var filteredData = filter.filter(data); //filteredData.getValue(0, 0) === "A"
   * });
   */
  var IsIn = AbstractPropertyFilter.extend("pentaho.data.Filter.IsIn", /** @lends pentaho.data.Filter.IsIn# */{

    /**
     * @inheritdoc
     * @readonly
     */
    get type() { return "$in";},

    /**
     * @inheritdoc
     */
    _method: function(value) {
      var N = this._value.length;
      for(var k = 0; k < N; k++) {
        if(this._value[k] === value)
          return true;
      }
      return false;
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      return toSpec(this._property, toSpec(this.type, this._value.length ? this._value : null));
    }
  });

  return IsIn;
});