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
  "./_apply",
  "./_toSpec"
], function(AbstractFilter, O, _apply, toSpec) {
  "use strict";

  /**
   * @name AbstractPropertyFilter
   * @memberOf pentaho.data.filter
   * @class
   * @extends pentaho.data.filter.AbstractFilter
   * @abstract
   * @amd pentaho/data/filter/AbstractPropertyFilter
   *
   * @classdesc The `AbstractPropertyFilter` class is the abstract base class of
   * classes that represent a filter (or leaf node of a tree). This class (and its descendants)
   * extract a given property from within a data table {@link pentaho.data.Table} and
   * compares its value(s) to the corresponding given candidate value(s) using
   * some comparison operation.
   *
   * @description The `AbstractPropertyFilter` extends the `AbstractFilter`
   * {@link pentaho.data.filter.AbstractFilter} class to allow creation of
   * types of filters for a data table {@link pentaho.data.Table}.
   *
   * ### Remarks
   *
   * The following derived classes are not abstract and can be used directly:
   *
   * * {@link pentaho.data.filter.IsEqual}
   * * {@link pentaho.data.filter.IsIn}
   *
   * @param {string} property The name of the property
   * @param {Object} value The value that belongs to the set
   *
   */
  var AbstractPropertyFilter = AbstractFilter.extend("pentaho.data.filter.AbstractPropertyFilter", /** @lends pentaho.data.filter.AbstractPropertyFilter# */{
    constructor: function(property, value) {
      this.value =  value;
      this.property = property;
      Object.freeze(this);
    },

    /**
     * The comparative operation used to filter data at each leaf node.
     *
     * @name pentaho.data.filter.AbstractPropertyFilter#_operation
     * @method
     * @abstract
     * @param {string} value The current candidate value for the given property
     * @returns {boolean} True if the current candidate value meets the requirement of the filter.
     * @protected
     */
    _operation: /* istanbul ignore next: placeholder method */ function(value) {
      return false;
    },

    /**
     * Tests if an entry is an element of the set defined by this filter.
     *
     * @name pentaho.data.filter.AbstractPropertyFilter#contains
     * @method
     * @abstract
     * @param {pentaho.data.filter._Element} - [element] The data table {@link pentaho.data.Table} entry to check for.
     * @return {boolean} True if the entry value is contained by this filter.
     */
    contains: function(element) {
      return element.has(this.property) &&
        this._operation(element.getv(this.property));
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      return toSpec(this.property, toSpec(this._op, this.value));
    },

    /**
     * Returns the subset of data that matches this filter.
     *
     * @name pentaho.data.filter.AbstractPropertyFilter#apply
     * @method
     * @param {pentaho.data.Table} dataTable The data table to filter
     * @returns {pentaho.data.TableView} The data table view of the restricted data set.
     */
    apply: function(dataTable) {
      return _apply(this, dataTable);
    }
  });

  return AbstractPropertyFilter;


});