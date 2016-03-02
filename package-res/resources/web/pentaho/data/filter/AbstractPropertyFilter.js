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
  "./_apply",
  "./_toSpec"
], function(AbstractFilter, _apply, _toSpec) {
  "use strict";

  /**
   * @name AbstractPropertyFilter
   * @memberOf pentaho.data.filter
   * @class
   * @extends pentaho.data.filter.AbstractFilter
   * @abstract
   * @amd pentaho/data/filter/AbstractPropertyFilter
   *
   * @classdesc A base class for filters that represents a set of elements which contains a given
   * property and whose value matches against a criteria/condition.
   *
   * @description Creates an instance that filters a dataset by comparing the value of
   * a property against a criteria/condition.
   *
   * @param {string} property The name of the property.
   * @param {any} value - The property value.
   *
   */
  var AbstractPropertyFilter = AbstractFilter.extend("pentaho.data.filter.AbstractPropertyFilter", /** @lends pentaho.data.filter.AbstractPropertyFilter# */{
    constructor: function(property, value) {
      this.value = value;
      this.property = property;
      Object.freeze(this);
    },

    /**
     * Gets the name of the property containing the value used for filtering.
     * @type {string}
     * @readonly
     */
    property: null,

    /**
     * Gets the value of the [property]{@link pentaho.data.filter.AbstractFilter#property} used for filtering.
     * @type {any}
     * @readonly
     */
    value: null,

    /**
     * Asserts if a concrete value in the dataset matches the criteria/condition of this filter.
     *
     * @param {any} value - The value to be compared against the criteria/condition of this filter.
     * @returns {boolean} `true` if the value meets the requirement of the filter, or `false` otherwise.
     * @protected
     * @abstract
     */
    _operation: /* istanbul ignore next: placeholder method */ function(value) {
      return false;
    },

    /**
     * Tests if a dataset element belongs to the set defined by this filter.
     *
     * @param {!pentaho.type.Element} element - The element of the dataset to be tested.
     * @return {boolean} `true` if `element` matches this filter, or `false` otherwise.
     * @override
     */
    contains: function(element) {
      return element.has(this.property) &&
        this._operation(element.getv(this.property));
    },

    /**
     * @inheritdoc
     */
    apply: function(datatable) {
      return _apply(this, datatable);
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      return _toSpec(this.property, _toSpec(this._op, this.value));
    }
  });

  return AbstractPropertyFilter;


});