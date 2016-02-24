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
  "../../lang/Base",
  "../Element",
  "../TableView",
  "require"
], function(Base, Element, TableView, require) {
  "use strict";

  /**
   * @name AbstractFilter
   * @memberOf pentaho.data.Filter
   * @class
   * @abstract
   * @amd pentaho/data/Filter/AbstractFilter
   *
   * @classdesc The `AbstractFilter` class is the abstract base class of
   * classes that represent a filter.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/data/Filter/AbstractFilter"`.
   *
   * ### Remarks
   *
   * The following derived classes are also abstract:
   *
   * * {@link pentaho.data.Filter.AbstractPropertyFilter}
   * * {@link pentaho.data.Filter.AbstractTreeFilter}
   */
  var AbstractFilter = Base.extend("pentaho.data.Filter.AbstractFilter", /** @lends pentaho.data.Filter.AbstractFilter# */{
    constructor: function(value) {
      this._value = value;
    },

    /**
     *
     * @readonly
     */
    get value() {
      return this._value;
    },

    /**
     * Outputs a JSON that serializes the operation described by this filter.
     * The syntax loosely follows the query language of MongoDB.
     *
     * @return {Object} JSON object.
     */
    toSpec: function() {
      return null;
    },

    /**
     * Tests if an entry is an element of the set defined by this filter.
     *
     * @param {pentaho.data.Entry} - [dataTable]{@link pentaho.data.Table} entry.
     * @return {boolean}
     */
    contains: function(entry) {
      return false;
    },

    /**
     * Returns a filter that negates this filter.
     * @returns {*}
     */
    negation: function() {
      return AbstractFilter.negation(this);
    },

    /**
     * Returns a filter that is the union of this filter with the other.
     * In other words, implements the OR operation between this filter and another.
     * @param {} other -
     * @returns {*}
     */
    union: function(other) {
      return AbstractFilter.union(this, other);
    },

    /**
     * Returns a filter that is the intersection of this filter with the other.
     * In other words, implements the INTERSECT operation between this filter and another.
     * @param {} other -
     * @returns {*}
     */
    intersection: function(other) {
      return AbstractFilter.intersection(this, other);
    },

    filter: function(dataTable) {
      var k, nRows = dataTable.getNumberOfRows();
      var filteredRows = [];

      for(k = 0; k < nRows; k++) {
        var entry = new Element(dataTable, k);
        var bool = this.contains(entry);
        if(bool) {
          filteredRows.push(k);
        }
      }

      var dataView = new TableView(dataTable);
      dataView.setSourceRows(filteredRows);
      return dataView;
    }
  }, {
    union: function() {
      var OrFilter = require("./Or");
      return new OrFilter(argumentsToArray(arguments));
    },

    negation: function(a) {
      var NotFilter = require("./Not");
      return new NotFilter(a);
    },

    intersection: function() {
      var AndFilter = require("./And");
      return new AndFilter(argumentsToArray(arguments));
    },

    filter: function(filter, dataTable) {
      return filter.filter(dataTable);
    }
  });

  return AbstractFilter;

  function argumentsToArray(args) {
    return args.length === 1 ? [args[0]] : Array.apply(null, args);
  }


});