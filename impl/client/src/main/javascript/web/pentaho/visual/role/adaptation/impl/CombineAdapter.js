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
  "./Adapter",
  "pentaho/type/String"
], function(module, Adapter, PentahoString) {

  "use strict";

  var CombineAdapter = Adapter.extend(/** @lends pentaho.visual.role.adaptation.impl.CombineAdapter# */{
    /**
     * @classDesc The `CombineAdapter` class is the mapper implementation class of the `Combine` strategy.
     * @alias CombineAdapter
     * @memberOf pentaho.visual.role.adaptation.impl
     * @class
     * @extends pentaho.visual.role.adaptation.impl.Adapter
     * @private
     * @see pentaho.visual.role.adaptation.CombineStrategy
     * @description Creates a _combine_ mapper instance.
     * @param {pentaho.type.visual.role.adaptation.Strategy} strategy - The strategy.
     * @param {pentaho.type.visual.role.PropertyType} propType - The visual role property type.
     * @param {pentaho.data.ITable} inputData - The data set view to be mapped.
     * @param {pentaho.visual.role.Mode} mode - The visual role mode of `propType` which will be used.
     * @param {string} valueSeparator - The text to use to separate combined value keys.
     * @param {string} formattedSeparator - The text to use to separate combined formatted values.
     * this.formattedSeparator
     */
    constructor: function(strategy, propType, inputData, mode, valueSeparator, formattedSeparator) {

      this.base(strategy, propType, inputData, mode);

      /**
       * A map from key to row index.
       *
       * @type {Object.<string, number>}
       * @private
       * @readOnly
       */
      this.__index = Object.create(null);

      /**
       * The data type of the visual role value.
       *
       * @name dataType
       * @type {pentaho.type.Type}
       * @readOnly
       * @private
       */
      this.__dataType = PentahoString.type;

      /**
       * The value combiner function.
       *
       * @param {number} rowIndex - The row index.
       * @return {string} The visual role value.
       * @readOnly
       * @private
       */
      this.__valueCombiner = createGetValueCombiner(inputData, valueSeparator);

      /**
       * The formatted combiner builder function.
       *
       * @param {number} rowIndex - The row index.
       * @return {string} The visual role formatted value.
       * @readOnly
       * @private
       */
      this.__formattedCombiner = createGetFormattedCombiner(inputData, formattedSeparator);
    },

    /** @inheritDoc */
    get dataType() {
      return this.__dataType;
    },

    /** @inheritDoc */
    getValue: function(rowIndex) {

      var value = this.__valueCombiner(rowIndex);

      // Index the value.
      this.__index[value] = rowIndex;

      return value;
    },

    /** @inheritDoc */
    getFormatted: function(rowIndex) {
      return this.__formattedCombiner(rowIndex);
    },

    /** @inheritDoc */
    invertValue: function(value) {
      return this.__index[value];
    }
  });

  return CombineAdapter;

  /**
   * Creates a value combiner function for a given input data and separator.
   *
   * @param {pentaho.data.ITable} inputData - The input data.
   * @param {string} separator - The separator to use between combined values.
   *
   * @return {function(number):string} The value combiner function.
   */
  function createGetValueCombiner(inputData, separator) {

    var columnCount = inputData.getNumberOfColumns();

    return function getValueCombiner(rowIndex) {
      var combined;
      var columnIndex = -1;
      while(++columnIndex < columnCount) {
        var columnValue = inputData.getValueKey(rowIndex, columnIndex);
        if(columnIndex === 0) {
          combined = columnValue;
        } else {
          combined += separator + columnValue;
        }
      }

      return combined;
    };
  }

  /**
   * Creates a formatted value combiner function for a given input data and separator.
   *
   * @param {pentaho.data.ITable} inputData - The input data.
   * @param {string} separator - The separator to use between combined formatted values.
   *
   * @return {function(number):string} The formatted value combiner function.
   */
  function createGetFormattedCombiner(inputData, separator) {

    var columnCount = inputData.getNumberOfColumns();

    return function getFormattedCombiner(rowIndex) {
      var combined = null;
      var columnIndex = -1;
      while(++columnIndex < columnCount) {
        var columnValue = inputData.getFormattedValue(rowIndex, columnIndex);
        if(columnValue != null && columnValue.length > 0) {
          if(combined === null) {
            combined = columnValue;
          } else {
            combined += separator + columnValue;
          }
        }
      }

      return combined;
    };
  }
});
