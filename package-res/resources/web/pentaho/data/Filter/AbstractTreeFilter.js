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
  "./_toSpec"
], function(AbstractFilter, toSpec) {
  "use strict";

  /**
   * @name AbstractTreeFilter
   * @memberOf pentaho.data.Filter
   * @class
   * @abstract
   * @amd pentaho/data/Filter/AbstractTreeFilter
   *
   * @classdesc The `AbstractTreeFilter` class is the abstract base class of
   * classes that represent a filter.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/data/Filter/AbstractTreeFilter"`.
   *
   * ### Remarks
   *
   * The following derived classes are not abstract and can be used directly:
   *
   * * {@link pentaho.data.Filter.And}
   * * {@link pentaho.data.Filter.Or}
   * * {@link pentaho.data.Filter.Not}
   */
  var AbstractTreeFilter = AbstractFilter.extend("pentaho.data.Filter.AbstractTreeFilter", /** @lends pentaho.data.Filter.AbstractTreeFilter# */{
    constructor: function(children) {
      //children = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
      if(children instanceof Array)
        this._children = children.slice();
      else
        this._children = children ? [children] : [];
    },

    _children: null,
    get children() {
      return this._children;
    },

    /**
     * Inserts a filter element child.
     *
     * @param {object} [element] The element to insert as a child.
     *
     * @return {Object} The abstract tree filter and its children.
     */
    insert: function(element) {
      this._children.push(element);
      return this;
    },

    /**
     * @inheritdoc
     */
    contains: function(entry) {
      return false;
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      var operands = [];
      if(this.children.length) {
        this.children.forEach(function(child) {
          var childSpec = child.toSpec();
          if(childSpec)
            operands.push(childSpec);
        });
      }
      return toSpec(this.type, operands.length ? operands : null);
    }
  });

  return AbstractTreeFilter;

});