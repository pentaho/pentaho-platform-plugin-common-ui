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
  "./AbstractFilter"
], function(AbstractFilter) {
  "use strict";

  /**
   * @name AbstractPropertyFilter
   * @memberOf pentaho.data.filter
   *
   * @class
   * @extends pentaho.data.filter.AbstractFilter
   * @abstract
   *
   * @classdesc A base class that filters elements in a set
   * by matching the value of a given property against a criteria/condition.
   *
   * @description Creates an instance that filters a data set by comparing the value of
   * a property against a criteria/condition.
   *
   * @param {string} property The name of the property.
   */
  var AbstractPropertyFilter = AbstractFilter.extend("pentaho.data.filter.AbstractPropertyFilter", /** @lends pentaho.data.filter.AbstractPropertyFilter# */{
    constructor: function(property) {
      this.property = property;
    },

    /**
     * Gets the name of the property containing the value used for filtering.
     * @type {string}
     * @readonly
     */
    property: null,

    /**
     * Asserts if a concrete value in the data set matches the criteria/condition of this filter.
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
     * Tests if a data set element belongs to the set defined by this filter.
     *
     * @param {!pentaho.type.Element} element - The element of the data set to be tested.
     * @return {boolean} `true` if `element` matches this filter, or `false` otherwise.
     * @override
     */
    contains: function(element) {
      return element.has(this.property) &&
        this._operation(element.getv(this.property));
    }

  });

  return AbstractPropertyFilter;

});