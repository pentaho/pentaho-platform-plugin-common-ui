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
  "pentaho/type/Number",
  "pentaho/util/object",
  "pentaho/data/util"
], function(module, Strategy, PentahoString, PentahoNumber, O, dataUtil) {

  "use strict";

  /**
   * @name pentaho.visual.role.adaptation.EntityWithNumberKeyStrategyType
   * @class
   * @extends pentaho.visual.role.adaptation.StrategyType
   *
   * @classDesc The type class of {@link pentaho.visual.role.adaptation.EntityWithNumberKeyStrategy}.
   */
  // eslint-disable-next-line max-len
  var EntityWithNumberKeyStrategy = Strategy.extend(/** @lends pentaho.visual.role.adaptation.EntityWithNumberKeyStrategy# */{
    /**
     * @alias pentaho.visual.role.adaptation.EntityWithNumberKeyStrategy
     * @class
     * @extends pentaho.visual.role.adaptation.Strategy
     * @abstract
     *
     * @amd pentaho/visual/role/adaptation/EntityWithNumberKeyStrategy
     *
     * @classDesc The `EntityWithNumberKeyStrategy` class describes the strategy of mapping a categorical field
     *   to a number value that equally identifies its elements.
     *
     * The strategy targets:
     * 1. Visual roles which are
     *    [effective visual keys]{@link pentaho.visual.role.PropertyType#isVisualKeyEffective};
     * 2. Modes whose [dataType]{@link pentaho.visual.role.Mode#dataType} is
     *    assignable to [number]{@link pentaho.type.Number}, and
     * 3. Mappings of fields whose [fields][@link pentaho.data.ITable#getColumnProperty] contain the
     *    property "EntityWithNumberKey".
     *
     * @description Creates an `EntityWithNumberKeyStrategy` mapping strategy instance.
     * @constructor
     * @param {pentaho.visual.role.adaptation.spec.IStrategy} [instSpec] An `EntityWithNumberKeyStrategy` mapping
     *   strategy specification.
     */
    constructor: function(instSpec) {

      this.base(instSpec);

      var inputKeyFun;
      var outputKeyFun;
      var inputIndex;
      var outputIndex;

      /**
       * The function which extracts the key of an input value.
       *
       * @type {function(*):string}
       * @readOnly
       * @private
       */
      this.__inputKeyFun = inputKeyFun = O.getSameTypeKeyFun("string");

      /**
       * The function which extracts the key of an output value.
       *
       * @type {function(*):string}
       * @readOnly
       * @private
       */
      this.__outputKeyFun = outputKeyFun = O.getSameTypeKeyFun("number");

      /**
       * The mapping of original values to its first row index.
       *
       * @type {?Object.<string, number>}
       * @readOnly
       * @private
       */
      this.__inputIndex = inputIndex = Object.create(null);

      /**
       * The mapping of generated value to its first row index.
       *
       * @type {?Object.<string, number>}
       * @readOnly
       * @private
       */
      this.__outputIndex = outputIndex = Object.create(null);

      // ---

      var inputFieldIndex = this.inputFieldIndexes[0];
      var dataTable = this.data;

      var fieldName;
      var baseAttributeName = fieldName = "numberKey_" + inputFieldIndex;
      while(dataTable.getColumnIndexById(fieldName) >= 0) {
        fieldName = baseAttributeName + "_" + new Date();
      }

      dataTable.model.attributes.add({
        name: fieldName,
        type: "number",
        label: dataTable.getColumnLabel(inputFieldIndex),
        isKey: true
      });

      var outputFieldIndex = dataTable.addColumn(fieldName);

      // ---
      // Populate the new field and the indexes.

      var rowCount = dataTable.getNumberOfRows();
      var rowIndex = -1;
      while(++rowIndex < rowCount) {
        var inputCell = dataTable.getCell(rowIndex, inputFieldIndex);
        var inputValue = inputCell.value;
        var outputValue = inputValue !== null ? inputCell.referent.property("numberKey") : null;

        var outputCell = dataTable.getCell(rowIndex, outputFieldIndex);
        // The DataTable's cast function ensures this is a number.
        outputCell.value = outputValue;
        outputCell.label = inputCell.label;

        // Keep first row index.
        var inputValueKey = inputKeyFun(inputValue);
        if(!O.hasOwn(inputIndex, inputValueKey)) {
          inputIndex[inputValueKey] = rowIndex;
          outputIndex[outputKeyFun(outputValue)] = rowIndex;
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
      var lookupValue = dataUtil.getCellValue(inputValues[0]);
      var rowIndex = O.getOwn(this.__inputIndex, this.__inputKeyFun(lookupValue));
      if(rowIndex === undefined) {
        return null;
      }

      return [this.data.getCell(rowIndex, this.outputFieldIndexes[0])];
    },

    /** @inheritDoc */
    invert: function(outputValues) {
      var lookupValue = dataUtil.getCellValue(outputValues[0]);
      var rowIndex = O.getOwn(this.__outputIndex, this.__outputKeyFun(lookupValue));
      if(rowIndex === undefined) {
        return null;
      }

      return [this.data.getCell(rowIndex, this.inputFieldIndexes[0])];
    },

    $type: /** @lends pentaho.visual.role.adaptation.EntityWithNumberKeyStrategyType# */{

      id: module.id,

      /** @inheritDoc */
      get isIdentity() {
        return true;
      },

      /** @inheritDoc */
      getInputTypeFor: function(outputDataType, isVisualKeyEf) {

        if(isVisualKeyEf === false || !outputDataType.isSubtypeOf(PentahoNumber.type)) {
          return null;
        }

        return PentahoString.type;
      },

      /** @inheritDoc */
      validateApplication: function(schemaData, inputFieldIndexes) {

        var fieldIndex = inputFieldIndexes[0];
        var annotation = schemaData.getColumnProperty(fieldIndex, "EntityWithNumberKey");
        if(annotation == null) {
          return {isValid: false};
        }

        return {isValid: true, addsFields: true};
      },

      /** @inheritDoc */
      apply: function(data, inputFieldIndexes) {
        return new EntityWithNumberKeyStrategy({
          data: data,
          inputFieldIndexes: inputFieldIndexes
        });
      }
    }
  })
  .configure({$type: module.config});

  return EntityWithNumberKeyStrategy;
});
