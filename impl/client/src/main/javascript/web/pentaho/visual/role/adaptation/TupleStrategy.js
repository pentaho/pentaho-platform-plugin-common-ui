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
  "pentaho/module!_",
  "./Strategy",
  "pentaho/util/object",
  "pentaho/data/util"
], function(module, Strategy, O, dataUtil) {

  "use strict";

  // region IndexNode class
  /**
   * @classDesc A tree index.
   * @class
   * @memberOf pentaho.visual.role.adaptation.TupleStrategy~
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
     * @type {Array.<pentaho.visual.role.adaptation.TupleStrategy~IndexNode>}
     */
    this.children = null;
  }

  /**
   * Gets the index of the first indexed row having the given keys.
   *
   * @memberOf pentaho.visual.role.adaptation.TupleStrategy~IndexNode
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
      if(children === null) {
        return -1;
      }

      var value = dataUtil.getCellValue(values[level]);
      var key = keyFuns[level](value);

      var child = children[key];
      if(child == null) {
        return -1;
      }

      parentNode = child;
    }

    return parentNode.index;
  };

  /**
   * Indexes a row, given the data set, row index and array of functions which obtain the key of each value.
   *
   * @memberOf pentaho.visual.role.adaptation.TupleStrategy~IndexNode
   * @param {!pentaho.data.ITable} inputData - The data set whose row is to be indexed.
   * @param {number} rowIndex - The row to index.
   * @param {!Array.<number>} columnIndexes - The column indexes to index.
   * @param {!Array.<(function(any):string)>} keyFuns - The array of key functions which obtain the
   * key of each value.
   *
   * @return {!Array.<any>} The values of the indexed row.
   */
  IndexNode.prototype.add = function(inputData, rowIndex, columnIndexes, keyFuns) {
    var level = -1;
    var levelCount = columnIndexes.length;
    var values = new Array(levelCount);
    var parentNode = this;
    while(++level < levelCount) {

      var children = parentNode.children;
      if(children === null) {
        parentNode.children = children = Object.create(null);
      }

      var value;
      values[level] = value = inputData.getValue(rowIndex, columnIndexes[level]);

      var key = keyFuns[level](value);
      var child = children[key];
      if(child == null) {
        children[key] = child = new IndexNode(key, rowIndex);
      }

      parentNode = child;
    }

    return values;
  };
  // endregion

  /**
   * @name pentaho.visual.role.adaptation.TupleStrategyType
   * @class
   * @extends pentaho.visual.role.adaptation.StrategyType
   *
   * @classDesc The type class of {@link pentaho.visual.role.adaptation.TupleStrategy}.
   */

  var TupleStrategy = Strategy.extend(/** @lends pentaho.visual.role.adaptation.TupleStrategy# */{
    /**
     * @alias pentaho.visual.role.adaptation.TupleStrategy
     * @class
     * @extends pentaho.visual.role.adaptation.Strategy
     * @abstract
     *
     * @amd pentaho/visual/role/adaptation/TupleStrategy
     *
     * @classDesc The `TupleStrategy` class describes the strategy of mapping one or more data properties
     * to an array of those values, and back.
     *
     * The strategy targets:
     * 1. modes whose [dataType]{@link pentaho.visual.role.Mode#dataType} is a
     *   [list]{@link pentaho.type.Type#isList}, and
     * 2. mappings of fields whose [type][@link pentaho.data.ITable#getColumnType] can be assigned to the
     *   [element type]{@link pentaho.type.ListType#of} of the mode's list data type.
     * 3. mappings of fields whose data type is [continuous][@link pentaho.type.Type#isContinuous] nature
     *   is compatible with the mode's [continuous]{@link pentaho.visual.role.Mode#isContinuous} nature;
     *   if the mode is continuous, then all mapped fields need to be as well.
     *
     * @description Creates a _tuple_ mapping strategy instance.
     * @constructor
     * @param {pentaho.visual.role.adaptation.spec.IStrategy} [instSpec] A _tuple_ mapping strategy specification.
     */
    constructor: function(instSpec) {

      instSpec = Object.create(instSpec);
      instSpec.outputFieldIndexes = instSpec.inputFieldIndexes;

      this.base(instSpec);

      /**
       * Gets the array of function which extract the key of the value of each column of `inputData`.
       *
       * @type {!Array.<(function(any):string)>}
       * @readOnly
       * @private
       */
      this.__keyFuns = __createKeyFuns.call(this);

      /**
       * Gets the tree index.
       *
       * @type {pentaho.visual.role.adaptation.TupleStrategy~IndexNode}
       * @readOnly
       * @private
       */
      this.__index = null;
    },

    /** @inheritDoc */
    get isInvertible() {
      return true;
    },

    /** @inheritDoc */
    map: function(inputValues) {

      inputValues = __trimRightUndefined(inputValues);

      return this._getDataRowCells(
        this.__getIndex().getIndexOf(inputValues, this.__keyFuns),
        this.outputFieldIndexes,
        inputValues.length);
    },

    /** @inheritDoc */
    invert: function(outputValues) {

      outputValues = __trimRightUndefined(outputValues);

      return this._getDataRowCells(
        this.__getIndex().getIndexOf(outputValues, this.__keyFuns),
        this.inputFieldIndexes,
        outputValues.length);
    },

    /**
     * Gets the tree index.
     *
     * @return {!pentaho.visual.role.adaptation.TupleStrategy~IndexNode} The tree index.
     * @private
     */
    __getIndex: function() {
      var index = this.__index;
      if(index === null) {
        this.__installIndex();
        index = this.__index;
      }

      return index;
    },

    /**
     * Builds the map of row indexes by input/output value key.
     * @private
     */
    __installIndex: function() {
      var index = this.__index = new IndexNode("", -1);
      var inputFieldIndexes = this.inputFieldIndexes;
      var keyFuns = this.__keyFuns;
      var dataTable = this.data;
      var rowCount = dataTable.getNumberOfRows();
      var rowIndex = -1;
      while(++rowIndex < rowCount) {
        index.add(dataTable, rowIndex, inputFieldIndexes, keyFuns);
      }
    },

    $type: /** @lends pentaho.visual.role.adaptation.TupleStrategyType# */{
      id: module.id,

      /** @inheritDoc */
      getInputTypeFor: function(outputDataType, isVisualKey) {

        if(!outputDataType.isList) {
          return null;
        }

        return outputDataType;
      },

      /** @inheritDoc */
      validateApplication: function(schemaData, inputFieldIndexes) {
        return {isValid: true, addsFields: false};
      },

      /** @inheritDoc */
      apply: function(data, inputFieldIndexes) {
        return new TupleStrategy({
          data: data,
          inputFieldIndexes: inputFieldIndexes
        });
      }
    }
  })
  .configure({$type: module.config});

  return TupleStrategy;

  /**
   * Creates the key functions for the values of all of the columns.
   *
   * @memberOf pentaho.visual.role.adaptation.TupleStrategy#
   *
   * @return {Array.<(function(any) : string)>} The array of key functions.
   * @private
   */
  function __createKeyFuns() {
    var inputData = this.data;
    var fieldIndexes = this.inputFieldIndexes;
    var fieldCount = fieldIndexes.length;
    var keys = new Array(fieldCount);
    var index = fieldCount;
    while(index--) {
      keys[index] = O.getSameTypeKeyFun(inputData.getColumnType(fieldIndexes[index]));
    }

    return keys;
  }

  /**
   * Trims `undefined` values from the right of an array.
   * Returns a copy of the original array if any trimming is performed.
   *
   * @memberOf pentaho.visual.role.adaptation.TupleStrategy#
   *
   * @param {Array} values - The array to trime.
   * @return {Array} The trimmed array.
   * @private
   */
  function __trimRightUndefined(values) {
    var level = values.length;
    var count = 0;
    while(level-- && values[level] === undefined) {
      count++;
    }

    return count > 0 ? values.slice(0, -count) : values;
  }
});
