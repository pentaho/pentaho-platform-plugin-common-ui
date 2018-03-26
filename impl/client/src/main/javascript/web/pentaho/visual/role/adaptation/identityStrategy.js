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

  // so that r.js sees otherwise invisible dependencies.
  "./strategy"
], function(module, O) {

  return [
    "./strategy",
    function(Strategy) {

      /**
       * @name pentaho.visual.role.adaptation.IdentityStrategy.Type
       * @class
       * @extends pentaho.visual.role.adaptation.Strategy.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.adaptation.IdentityStrategy}.
       */

      var IdentityStrategy = Strategy.extend(/** @lends pentaho.visual.role.adaptation.IdentityStrategy# */{

        /**
         * @alias IdentityStrategy
         * @memberOf pentaho.visual.role.adaptation
         * @class
         * @extends pentaho.visual.role.adaptation.Strategy
         * @abstract
         *
         * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.adaptation.IdentityStrategy>}
         *      pentaho/visual/role/adaptation/identityStrategy
         *
         * @classDesc The `IdentityStrategy` class describes the strategy of adapting a single data field,
         * without modification, between the external and internal data space.
         *
         * The _identity_ strategy targets visual role mappings of a single field and exposes a single
         * and is [invertible]{@link pentaho.visual.role.adaptation.IStrategyMethod#isInvertible}.
         *
         * @description Creates an _identity_ mapping strategy instance.
         * @constructor
         * @param {pentaho.visual.role.adaptation.spec.IStrategy} [instSpec] An adaptation strategy specification.
         */
        constructor: function(instSpec) {

          instSpec = Object.create(instSpec);
          instSpec.outputFieldIndexes = instSpec.inputFieldIndexes;

          this.base(instSpec);

          // Created lazily by #__installIndex, when/if needed.
          this.__index = null;
          this.__keyFun = null;
        },

        /** @inheritDoc */
        get isInvertible() {
          return true;
        },

        /** @inheritDoc */
        map: function(inputValues) {

          var outputCell = this.__getCellByValue(inputValues[0]);

          return outputCell === undefined ? null : [outputCell];
        },

        /** @inheritDoc */
        invert: function(outputValues) {

          var inputCell = this.__getCellByValue(outputValues[0]);

          return inputCell === undefined ? null : [inputCell];
        },

        /**
         * Gets the cell given its value or cell
         *
         * @param {any|!pentaho.data.ICell} valueOrCell - The value or cell.
         * @return {pentaho.data.ICell} The cell, if any exists; `null`, if not.
         * @private
         */
        __getCellByValue: function(valueOrCell) {

          if(valueOrCell == null) {
            return null;
          }

          // Must do upfront. Also creates this.__keyFun.
          var rowIndexByValueKey = this.__getRowIndexByValueKeyMap();

          // Accepts ICell or direct values.
          var valueKey = this.__keyFun(valueOrCell && valueOrCell.valueOf());

          var rowIndex = rowIndexByValueKey[valueKey];
          if(rowIndex === undefined) {
            return undefined;
          }

          return this.data.getCell(rowIndex, this.inputFieldIndexes[0]);
        },

        /**
         * Gets a map of row index by input/output value key.
         *
         * @return {!Object.<string, number>} The map.
         * @private
         */
        __getRowIndexByValueKeyMap: function() {
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

          var index = this.__index = Object.create(null);

          var fieldIndex = this.outputFieldIndexes[0];
          var dataTable = this.data;
          var keyFun = this.__keyFun = O.getSameTypeKeyFun(dataTable.getColumnType(fieldIndex));

          var rowCount = dataTable.getNumberOfRows();
          var rowIndex = -1;
          while(++rowIndex < rowCount) {
            var value = dataTable.getValue(rowIndex, fieldIndex);
            if(value !== null) {
              var valueKey = keyFun(value);

              // Keep first row index.
              if(index[valueKey] === undefined) {
                index[valueKey] = rowIndex;
              }
            }
          }
        },

        $type: /** @lends pentaho.visual.role.adaptation.IdentityStrategy.Type# */{
          id: module.id,

          /** @inheritDoc */
          getInputTypeFor: function(outputDataType, isVisualKey) {

            // 1) Can handle a single column.
            if(outputDataType.isList) {
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
            return new IdentityStrategy({
              data: data,
              inputFieldIndexes: inputFieldIndexes
            });
          }
        }
      });

      return IdentityStrategy;
    }
  ];
});
