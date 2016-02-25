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
  "./_toSpec"
], function(AbstractFilter, O, toSpec) {
  "use strict";

  /**
   * @name AbstractPropertyFilter
   * @memberOf pentaho.data.filter
   * @class
   * @abstract
   * @amd pentaho/data/filter/AbstractPropertyFilter
   *
   * @classdesc The `AbstractPropertyFilter` class is the abstract base class of
   * classes that represent a filter.
   *
   * @example
   * <caption> Create a new class <code>DerivedAbstractPropertyFilter</code> containing...
   *
   * require(["pentaho/data/filter/AbstractPropertyFilter"], function(AbstractPropertyFilter) {
   *   var DerivedAbstractPropertyFilter = AbstractPropertyFilter.extend({
   *     get type() { return "$type";},
   *     _method: function(value) {
   *        return this._value === value;
   *     },
   *     toSpec: function(){}
   *   });
   *
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
   *   var filter = new DerivedAbstractPropertyFilter("product", ["A"]);
   *   var filteredData = filter.apply(data); //filteredData.getValue(0, 0) === "A"
   * });
   *
   * ### Remarks
   *
   * The following derived classes are not abstract and can be used directly:
   *
   * * {@link pentaho.data.filter.IsEqual}
   * * {@link pentaho.data.filter.IsIn}
   *
   * @constructor
   * @param {string} property The name of the property.
   * @param {string|number} value The value of the property.
   */
  var AbstractPropertyFilter = AbstractFilter.extend("pentaho.data.filter.AbstractPropertyFilter", /** @lends pentaho.data.filter.AbstractPropertyFilter# */{
    get type(){
      /* istanbul ignore next: placeholder getter */
      return null;
    },

    constructor: function(property, value) {
      O.setConst(this, "value", value);
      O.setConst(this, "property", property);
    },
    /**
     *
     * @param value
     * @returns {boolean}
     * @protected
     */
    _operation: /* istanbul ignore next: placeholder method */ function(value){
      return false;
    },

    /**
     * @inheritdoc
     */
    contains: function(entry) {
      return entry.has(this.property) &&
             this._operation(entry.getValue(this.property));
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      return toSpec(this.property, toSpec(this.type, this.value));
    }
  });

  return AbstractPropertyFilter;


});