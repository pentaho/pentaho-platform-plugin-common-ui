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
  "./Adapter"
], function(module, O, Adapter) {

  "use strict";

  var IdentityAdapter = Adapter.extend(/** @lends pentaho.visual.role.adaptation.impl.IdentityAdapter# */{
    /**
     * @classDesc The `IdentityAdapter` class is the adapter implementation class of the `IdentityStrategy` strategy.
     * @alias IdentityAdapter
     * @memberOf pentaho.visual.role.adaptation.impl
     * @class
     * @extends pentaho.visual.role.adaptation.impl.Adapter
     * @private
     * @see pentaho.visual.role.adaptation.IdentityStrategy
     * @description Creates an identity adapter instance.
     * @param {!pentaho.type.visual.role.adaptation.IStrategyMethod} method - The strategy method.
     * @param {!pentaho.data.ITable} dataTable - The data set to be adapted.
     * @param {!Array.<number>} inputFieldIndexes - The indexes of the input fields.
     */
    constructor: function(method, dataTable, inputFieldIndexes) {

      this.base(method, dataTable, inputFieldIndexes, inputFieldIndexes);

      // Created lazily by #__installIndex, when/if needed.
      this.__index = null;
      this.__keyFun = null;
    },

    /**
     * A map of row indexes by output value key.
     *
     * @return {!Object.<string, number>} The index.
     * @private
     */
    __getRowIndexByOutputValueKey: function() {
      var index = this.__index;
      if(index === null) {
        this.__installIndex();
        index = this.__index;
      }

      return index;
    },

    /**
     * Builds the map of row indexes by output value key.
     * @private
     */
    __installIndex: function() {

      var index = this.__index = Object.create(null);
      var keyFun = this.__keyFun = O.getSameTypeKeyFun(this.method.outputDataType.alias);

      var fieldIndex = this.outputFieldIndexes[0];
      var dataTable = this.data;

      var rowCount = dataTable.getNumberOfRows();
      var rowIndex = -1;
      while(++rowIndex < rowCount) {
        var outputValue = dataTable.getValue(rowIndex, fieldIndex);
        var outputValueKey = keyFun(outputValue);

        // Keep first row index.
        if(index[outputValueKey] === undefined) {
          index[outputValueKey] = rowIndex;
        }
      }
    },

    /** @inheritDoc */
    invert: function(outputValues) {

      // Must do upfront. Also creates this.__keyFun.
      var rowIndexByOutputValueKey = this.__getRowIndexByOutputValueKey();

      // Accepts ICell or direct values.
      var outputValue = outputValues[0].valueOf();

      var outputValueKey = this.__keyFun(outputValue);

      var rowIndex = rowIndexByOutputValueKey[outputValueKey];
      if(rowIndex === undefined) {
        return null;
      }

      var inputCell = this.data.getCell(rowIndex, this.inputFieldIndexes[0]);

      return [inputCell];
    }
  });

  return IdentityAdapter;
});
