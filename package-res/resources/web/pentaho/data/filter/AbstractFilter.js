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
  "./_Element",
  "../TableView",
  "../../util/arg",
  "require",
  //"./Or",
  //"./And",
  //"./Not",
], function(Base, Element, TableView, arg, require, Or, And, Not) {
  "use strict";

  var Or, And, Not;
  /**
   * @name AbstractFilter
   * @memberOf pentaho.data.filter
   * @class
   * @abstract
   * @amd pentaho/data/filter/AbstractFilter
   *
   * @classdesc The `AbstractFilter` class is the abstract base class of
   * classes that represent a filter.
   *
   * ### Remarks
   *
   * The following derived classes are also abstract:
   *
   * * {@link pentaho.data.filter.AbstractPropertyFilter}
   * * {@link pentaho.data.filter.AbstractTreeFilter}
   */
  var AbstractFilter = Base.extend("pentaho.data.filter.AbstractFilter", /** @lends pentaho.data.filter.AbstractFilter# */{
    get type() {
      /* istanbul ignore next: placeholder getter */
      return null;
    },

    _op: null,

    /**
     * Outputs a simple object that serializes the operation described by this filter.
     * The syntax loosely follows the query language of MongoDB.
     *
     * @return {Object} Object.
     */
    toSpec: /* istanbul ignore next: placeholder method */ function() {
      return null;
    },

    /**
     * Tests if an element belongs to the set defined by this filter.
     *
     * @param {pentaho.type.Element} - [dataTable]{@link pentaho.data.Table} entry.
     * @return {boolean}
     */
    contains: /* istanbul ignore next: placeholder method */ function(element) {
      return false;
    },

    /**
     * Returns a filter that is the inverse of this filter.
     * @returns {*}
     */
    invert: function() {
      if(!Not) Not = require("./Not");
      return new Not(this);
    },

    /**
     * Returns a filter that is the union of this filter with another.
     * In other words, implements the OR operation between this filter and another.
     * @param {} other -
     * @returns {*}
     */
    or: function() {
      if(!arguments.length) return this;
      var args = arg.slice(arguments);
      args.unshift(this);
      if(!Or) Or = require("./Or");
      return new Or(args);
    },

    /**
     * Returns a filter that is the intersection of this filter with another.
     * In other words, implements the INTERSECT operation between this filter and another.
     * @param {} other -
     * @returns {*}
     */
    and: function() {
      if(!arguments.length) return this;
      var args = arg.slice(arguments);
      args.unshift(this);
      if(!And) And = require("./And");
      return new And(args);
    },

    apply: function(dataTable) {
      var nRows = dataTable.getNumberOfRows();
      var filteredRows = [];

      var element = new Element(dataTable, null);
      for(var k = 0; k < nRows; k++) {
        element.rowIdx = k;
        if(this.contains(element)) {
          filteredRows.push(k);
        }
      }

      var dataView = new TableView(dataTable);
      dataView.setSourceRows(filteredRows);
      return dataView;
    }
  });

  return AbstractFilter;

});