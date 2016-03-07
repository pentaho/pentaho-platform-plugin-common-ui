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
], function(AbstractPropertyFilter, _toSpec) {
  "use strict";

  /**
   * @name IsEqual
   * @memberOf pentaho.data.filter
   *
   * @class
   * @extends pentaho.data.filter.AbstractPropertyFilter
   *
   * @classdesc A filter that defines the set of items having the value of a property equal to a certain value.
   *
   * @example
   * <caption> Create a new <code>IsEqual</code> filter.</caption>
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
   *   var myFilter = new filter.IsEqual("product", "A");
   *   var filteredData = myFilter.apply(data);
   *   //filteredData.getValue(0, 0) === "A"
   * });
   *
   * @description Creates a filter that matches the value of a given property to a specific value.
   *
   * @param {string} property - The name of the property.
   * @param {any} value - The value of the property.
   */
  var IsEqual = AbstractPropertyFilter.extend("pentaho.data.filter.IsEqual", /** @lends pentaho.data.filter.IsEqual# */{

    constructor: function(property, value) {
      this.base(property);
      this.value = value;
      Object.freeze(this);
    },

    /**
     * @inheritdoc
     */
    get type() { return "isEqual"; },

    _op: "$eq",

    /**
     * Gets the value to test for equality.
     *
     * @type {any}
     * @readonly
     */
    value: null,

    /**
     * @inheritdoc
     */
    _operation: function(value) {
      return this.value === value;
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      return _toSpec(this.property, _toSpec(this._op, this.value));
    }
  });

  return IsEqual;
});