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
  "pentaho/type/String",
  "pentaho/type/List",
  "pentaho/util/object",
  "pentaho/data/util"
], function(module, Strategy, PentahoString, List, O, dataUtil) {

  "use strict";

  /**
   * @name pentaho.visual.role.adaptation.CombineStrategyType
   * @class
   * @extends pentaho.visual.role.adaptation.StrategyType
   * @private
   *
   * @classDesc The type class of {@link pentaho.visual.role.adaptation.CombineStrategy}.
   */

  var CombineStrategy = Strategy.extend(/** @lends pentaho.visual.role.adaptation.CombineStrategy# */{
    /**
     * @alias CombineStrategy
     * @memberOf pentaho.visual.role.adaptation
     * @class
     * @extends pentaho.visual.role.adaptation.Strategy
     * @abstract
     * @private
     *
     * @amd pentaho/visual/role/adaptation/CombineStrategy
     *
     * @classDesc The `CombineStrategy` class describes the strategy of mapping one or more data properties
     * to a single _string_ value by concatenating the string representation of the values of
     * multiple fields with a special
     * [separator character]{@link pentaho.visual.role.adaptation.CombineStrategy#valueSeparator}, and back.
     *
     * Formatted values are combined using the
     * [formattedSeparator]{@link pentaho.visual.role.adaptation.CombineStrategy#formattedSeparator} text.
     *
     * The strategy targets:
     * 1. Visual roles which are
     *    [effective visual keys]{@link pentaho.visual.role.PropertyType#isVisualKeyEffective}, and
     * 2. Modes whose [dataType]{@link pentaho.visual.role.Mode#dataType} can
     *    be assigned to [string]{@link pentaho.type.String}.
     *
     * @description Creates a _combine_ mapping strategy instance.
     * @constructor
     * @param {pentaho.visual.role.adaptation.spec.IStrategy} [instSpec] A _combine_ mapping strategy specification.
     */
    constructor: function(instSpec) {

      this.base(instSpec);

      var inputKeyFuns;
      var outputIndex;

      /**
       * Gets the array of function which extract the key of the value of each column of `inputData`.
       *
       * @type {Array.<(function(*):string)>}
       * @readOnly
       * @private
       */
      this.__inputKeyFuns = inputKeyFuns = this._createFieldsKeyFuns(this.inputFieldIndexes);

      /**
       * The function which extracts the key of an output value.
       *
       * @type {function(*):string}
       * @readOnly
       * @private
       */
      this.__outputKeyFun = O.getSameTypeKeyFun("string");

      /**
       * The mapping of output values to its first row index.
       *
       * @type {?Object.<string, number>}
       * @readOnly
       * @private
       */
      this.__outputIndex = outputIndex = Object.create(null);

      var inputFieldIndexes = this.inputFieldIndexes;
      var dataTable = this.data;

      // ---
      // Add the new field

      var fieldName;
      var baseAttributeName = fieldName = "combined_" + inputFieldIndexes.join("_");
      while(dataTable.getColumnIndexById(fieldName) >= 0) {
        fieldName = baseAttributeName + "_" + new Date();
      }

      var formattedSeparator = this.formattedSeparator;

      var fieldLabel = inputFieldIndexes.map(function(inputFieldIndex) {
        return dataTable.getColumnLabel(inputFieldIndex);
      }).join(formattedSeparator);

      dataTable.model.attributes.add({
        name: fieldName,
        type: "string",
        label: fieldLabel,
        isKey: true
      });

      var outputFieldIndex = dataTable.addColumn(fieldName);

      // ---
      // Populate the new field and the indexes.

      var rowCount = dataTable.getNumberOfRows();
      var rowIndex = -1;
      var inputFieldCount = inputFieldIndexes.length;

      var valueSeparator = this.valueSeparator;

      while(++rowIndex < rowCount) {

        // Calculate output value.
        var outputValue;
        var outputLabel;

        var fieldIndex = -1;
        while(++fieldIndex < inputFieldCount) {

          var inputCell = dataTable.getCell(rowIndex, inputFieldIndexes[fieldIndex]);
          var inputKey = inputKeyFuns[fieldIndex](inputCell.value);
          if(fieldIndex === 0) {
            outputValue = inputKey;
            outputLabel = inputCell.formatted;
          } else {
            outputValue += valueSeparator + inputKey;
            outputLabel += formattedSeparator + (inputCell.formatted || "");
          }
        }

        var outputCell = dataTable.getCell(rowIndex, outputFieldIndex);
        outputCell.value = outputValue;
        outputCell.label = outputLabel;

        // Keep first row index.
        if(!O.hasOwn(outputIndex, outputValue)) {
          outputIndex[outputValue] = rowIndex;
        }
      }

      // ---

      this._setOutputFieldIndexes([outputFieldIndex]);
    },

    /** @inheritDoc */
    get isInvertible() {
      return true;
    },

    /** @inheritDoc */
    map: function(inputValues) {

      // Convert input values to output value
      var outputValue = this.__combine(inputValues);
      var rowIndex = O.getOwn(this.__outputIndex, outputValue);
      if(rowIndex === undefined) {
        return null;
      }

      return [this.data.getCell(rowIndex, this.outputFieldIndexes[0])];
    },

    /** @inheritDoc */
    invert: function(outputValues) {

      // Ensure cells and null values or null valued-cells are properly converted to a string.
      var outputKey = this.__outputKeyFun(dataUtil.getCellValue(outputValues[0]));

      var rowIndex = O.getOwn(this.__outputIndex, outputKey);
      if(rowIndex === undefined) {
        return null;
      }

      return this._getDataRowCells(rowIndex, this.inputFieldIndexes);
    },

    /**
     * Combines the input values or cells and builds an output value.
     *
     * @param {Array} inputValues - The array of values or cells.
     * @return {string} The combined value.
     * @private
     */
    __combine: function(inputValues) {
      var valueSeparator = this.valueSeparator;
      var inputKeyFuns = this.__inputKeyFuns;
      var inputFieldCount = inputKeyFuns.length;
      var fieldIndex = -1;
      var outputValue;
      while(++fieldIndex < inputFieldCount) {
        var inputValue = dataUtil.getCellValue(inputValues[fieldIndex]);
        var inputValueKey = inputKeyFuns[fieldIndex](inputValue);
        if(fieldIndex === 0) {
          outputValue = inputValueKey;
        } else {
          outputValue += valueSeparator + inputValueKey;
        }
      }

      return outputValue;
    },

    $type: /** @lends pentaho.visual.role.adaptation.CombineStrategyType# */{
      id: module.id,
      props: [
        /**
         * Gets or sets the text separator used to combine the keys of each field.
         *
         * @name pentaho.visual.role.adaptation.CombineStrategy#valueSeparator
         * @type {string}
         * @default "~"
         */
        {
          name: "valueSeparator",
          valueType: "string",
          isRequired: true,
          defaultValue: "~"
        },

        /**
         * Gets or sets the text separator used to combine the formatted values of each field.
         *
         * @name pentaho.visual.role.adaptation.CombineStrategy#formattedSeparator
         * @type {string}
         * @default " ~ "
         */
        {
          name: "formattedSeparator",
          valueType: "string",
          isRequired: true,
          defaultValue: " ~ "
        }
      ],

      /** @inheritDoc */
      getInputTypeFor: function(outputDataType, isVisualKeyEf) {

        if(isVisualKeyEf === false || !outputDataType.isSubtypeOf(PentahoString.type)) {
          return null;
        }

        return List.type;
      },

      /** @inheritDoc */
      validateApplication: function(schemaData, inputFieldIndexes) {
        return {isValid: true, addsFields: true};
      },

      /** @inheritDoc */
      apply: function(data, inputFieldIndexes) {
        return new CombineStrategy({
          data: data,
          inputFieldIndexes: inputFieldIndexes
        });
      }
    }
  })
  .configure({$type: module.config});

  return CombineStrategy;
});
