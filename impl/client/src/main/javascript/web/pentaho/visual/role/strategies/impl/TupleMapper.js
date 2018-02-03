/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "module",
  "pentaho/util/object",
  "./Mapper"
], function(module, O, Mapper) {

  "use strict";

  /**
   * @classDesc A tree index.
   * @class
   * @memberOf pentaho.visual.role.strategies.impl.TupleMapper~
   * @private
   *
   * @constructor
   * @description Creates an index node given its key and index.
   * @param {string} key - The parent-relative node key.
   * @param {number} index - The index of the (first) indexed fact/row.
   */
  function IndexNode(key, index) {
    /**
     * Gets the key of the node, which identifies amongst its sibling nodes.
     * @type {string}
     * @readOnly
     */
    this.key = key;

    /**
     * Gets the index of the first row that was indexed within this node.
     * @type {number}
     */
    this.index = index;

    /**
     * Gets the child nodes of this node, if any, or `null` if none.
     * @type {Array.<pentaho.visual.role.strategies.impl.TupleMapper~IndexNode>}
     */
    this.children = null;
  }

  /**
   * Gets the index of the first indexed row having the given keys.
   *
   * @memberOf pentaho.visual.role.strategies.impl.TupleMapper~IndexNode
   * @param {!Array.<any>} values - The values from which corresponding keys are obtained.
   * @param {!Array.<(function(any):string)>} keyFuns - The array of key functions which obtain the
   * key of each value.
   *
   * @return {number} The index, if a fact with the given keys was found, or `-1`, if one is not found.
   */
  IndexNode.prototype.getIndexOf = function(values, keyFuns) {
    var level = -1;
    var levelCount = values.length;
    var parentNode = this;
    while(++level < levelCount) {
      var children = parentNode.children;
      if(children === null) { return -1; }

      var key = keyFuns[level](values[level]);
      var child = children[key];
      if(child == null) { return -1; }

      parentNode = child;
    }

    return parentNode.index;
  };

  /**
   * Indexes a row, given the data set, row index and array of functions which obtain the key of each value.
   *
   * @memberOf pentaho.visual.role.strategies.impl.TupleMapper~IndexNode
   * @param {!pentaho.data.ITable} inputData - The data set whose row is to be indexed.
   * @param {number} rowIndex - The row to index.
   * @param {!Array.<(function(any):string)>} keyFuns - The array of key functions which obtain the
   * key of each value.
   *
   * @return {!Array.<any>} The values of the indexed row.
   */
  IndexNode.prototype.add = function(inputData, rowIndex, keyFuns) {
    var level = -1;
    var levelCount = inputData.getNumberOfColumns();
    var values = new Array(levelCount);
    var parentNode = this;
    while(++level < levelCount) {

      var children = parentNode.children;
      if(children === null) {
        parentNode.children = children = Object.create(null);
      }

      var value;
      values[level] = value = inputData.getValue(rowIndex, level);

      var key = keyFuns[level](value);
      var child = children[key];
      if(child == null) {
        children[key] = child = new IndexNode(key, rowIndex);
      }

      parentNode = child;
    }

    return values;
  };

  var TupleMapper = Mapper.extend(/** @lends pentaho.visual.role.strategies.impl.TupleMapper# */{
    /**
     * @classDesc The `TupleMapper` class is the mapper implementation class of the `Tuple` strategy.
     * @alias TupleMapper
     * @memberOf pentaho.visual.role.strategies.impl
     * @class
     * @extends pentaho.visual.role.strategies.impl.Mapper
     * @private
     * @see pentaho.visual.role.strategies.Tuple
     * @description Creates a _tuple_ mapper instance.
     * @param {!pentaho.type.visual.role.Property.Type} propType - The visual role property type.
     * @param {!pentaho.data.ITable} inputData - The data set view to be mapped.
     * @param {!pentaho.visual.role.Mode} mode - The visual role mode of `propType` which will be used.
     */
    constructor: function(propType, inputData, mode) {

      this.base(propType, inputData, mode);

      var columnCount = inputData.getNumberOfColumns();

      /**
       * Gets the array of function which extract the key of the value of each column of `inputData`.
       *
       * @type {!Array.<(function(any):string)>}
       * @readOnly
       * @private
       */
      this.__keyFuns = __createKeyFuns(inputData, columnCount);

      /**
       * Gets the tree index.
       *
       * @type {pentaho.visual.role.strategies.impl.TupleMapper~IndexNode}
       * @readOnly
       * @private
       */
      this.__index = new IndexNode("", -1);
    },

    /** @inheritDoc */
    getValue: function(rowIndex) {
      // Build/Index the value.
      return this.__index.add(this.inputData, rowIndex, this.__keyFuns);
    },

    /** @inheritDoc */
    getFormatted: function(rowIndex) {

      var inputData = this.inputData;
      var columnIndex = -1;
      var columnCount = inputData.getNumberOfColumns();
      var tuple = new Array(columnCount);
      while(++columnIndex < columnCount) {
        tuple[columnIndex] = inputData.getFormattedValue(rowIndex, columnIndex);
      }

      return tuple;
    },

    /** @inheritDoc */
    invertValue: function(values) {
      return this.__index.getIndexOf(values, this.__keyFuns);
    }
  });

  return TupleMapper;

  /**
   * Creates the key functions for the values of all of the columns.
   *
   * @memberOf pentaho.visual.role.strategies.impl.TupleMapper~
   *
   * @param {!pentaho.data.ITable} inputData - The data set view to be mapped.
   * @param {number} columnCount - The number of columns.
   *
   * @return {Array.<(function(any) : string)>} The array of key functions.
   * @private
   */
  function __createKeyFuns(inputData, columnCount) {
    var keys = new Array(columnCount);
    var columnIndex = -1;
    while(++columnIndex < columnCount) {
      keys[columnIndex] = O.getSameTypeKeyFun(inputData.getColumnType(columnIndex));
    }

    return keys;
  }
});
