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
  "use strict";

  return [
    "./strategy",
    "pentaho/type/date",
    "pentaho/type/list",
    function(Strategy, DateType, ListType) {

      /**
       * @name pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy.Type
       * @class
       * @extends pentaho.visual.role.adaptation.Strategy.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy}.
       */
      var EntityWithTimeIntervalKeyStrategy = Strategy.extend(/** @lends pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy# */{
        /**
         * @alias pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy
         * @class
         * @extends pentaho.visual.role.adaptation.Strategy
         * @abstract
         *
         * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy>}
         *      pentaho/visual/role/adaptation/entityWithTimeIntervalKeyStrategy
         *
         * @classDesc The `EntityWithTimeIntervalKeyStrategy` class describes the strategy of mapping ...TODO...
         *
         * @description Creates a _EntityWithTimeIntervalKey_ mapping strategy instance.
         * @constructor
         * @param {pentaho.visual.role.adaptation.spec.IStrategy} [instSpec] A _EntityWithTimeIntervalKey_ mapping strategy specification.
         */
        constructor: function(instSpec) {
          /**
           * The function which extract the key of the date value.
           *
           * @type {!function(any):string}
           * @readOnly
           * @private
           */
          this.__keyFun = O.getSameTypeKeyFun("date");

          /**
           * The mapping of original values to its first row index.
           * Assumes only the main input field is relevant.
           *
           * @type {Object}
           * @readOnly
           * @private
           */
          this.__forwardIndex = {};

          /**
           * The mapping of generated value to its first row index.
           *
           * @type {Object}
           * @readOnly
           * @private
           */
          this.__backIndex = {};

          var inputFieldIndexes = instSpec.inputFieldIndexes;
          var dataTable = instSpec.data;

          /**
           * The index of the main input field in the inputFieldIndexes array.
           *
           * @type {Object}
           * @readOnly
           * @private
           */
          this.mainInputPosition = inputFieldIndexes.length - 1;

          /**
           * The index of the main input field in the data table.
           *
           * @type {Object}
           * @readOnly
           * @private
           */
          this.mainInputColIndex = inputFieldIndexes[this.mainInputPosition];

          var attributeName;
          var baseAttributeName = attributeName = this.__getOutputFieldName(inputFieldIndexes);
          while(dataTable.model.attributes.get(attributeName) != null) {
            attributeName = baseAttributeName + "_" + new Date();
          }

          dataTable.model.attributes.add({
            name: attributeName,
            type: "date",
            label: this.__getOutputFieldLabel(inputFieldIndexes, dataTable),
            isKey: true
          });

          var outputColIndex = dataTable.addColumn(attributeName);

          var rowIndex = dataTable.getNumberOfRows();
          while(rowIndex--) {
            var cellIndex = inputFieldIndexes.length;
            var inputCells = new Array(cellIndex);

            var cellLabels = new Array(cellIndex);
            while(cellIndex--) {
              inputCells[cellIndex] = dataTable.getCell(rowIndex, inputFieldIndexes[cellIndex]);
              cellLabels[cellIndex] = inputCells[cellIndex].label;
            }

            var mainInputCell = inputCells[this.mainInputColIndex];

            var dateValue = new Date(mainInputCell.referent.property("startDateTime"));

            var outputCell = dataTable.getCell(rowIndex, outputColIndex);
            outputCell.value = dateValue;
            outputCell.label = cellLabels.join(", ");

            this.__backIndex[this.__keyFun.call(null, dateValue)] = rowIndex;
            this.__forwardIndex[mainInputCell.value] = rowIndex;
          }

          instSpec = Object.create(instSpec);
          instSpec.outputFieldIndexes = [outputColIndex];

          this.base(instSpec);
        },

        __getOutputFieldName: function(inputFieldIndexes) {
          return inputFieldIndexes.join("_");
        },

        __getOutputFieldLabel: function(inputFieldIndexes, dataTable) {
          var index = inputFieldIndexes.length;
          var labels = new Array(index);

          while(index--) {
            var colAttribute = dataTable.getColumnAttribute(inputFieldIndexes[index]);
            labels[index] = colAttribute.label;
          }

          return labels.join(", ");
        },

        /** @inheritDoc */
        get isInvertible() {
          return true;
        },

        /** @inheritDoc */
        map: function(inputValues) {
          return this._getDataRowCells(
            this.__forwardIndex[inputValues[this.mainInputPosition]],
            this.outputFieldIndexes);
        },

        /** @inheritDoc */
        invert: function(outputValues) {
          return this._getDataRowCells(
            this.__backIndex[this.__keyFun.call(null, outputValues[0])],
            this.inputFieldIndexes);
        },

        $type: /** @lends pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy.Type# */{
          id: module.id,

          /** @inheritDoc */
          getInputTypeFor: function(outputDataType, isVisualKey) {
            if(!isVisualKey || !outputDataType.isSubtypeOf(DateType.type)) {
              return null;
            }

            return ListType.type;
          },

          /** @inheritDoc */
          validateApplication: function(schemaData, inputFieldIndexes) {
            var hasStartDateTime = false;

            var index = inputFieldIndexes.length;

            while(index--) {
              var colAttribute = schemaData.getColumnAttribute(inputFieldIndexes[index]);
              if(colAttribute != null) {
                var annotation = colAttribute.property("EntityWithTimeIntervalKey");
                if(annotation != null) {
                  if(!hasStartDateTime && annotation.isStartDateTimeProvided) {
                    hasStartDateTime = true;
                    continue;
                  }

                  if(hasStartDateTime) {
                    continue;
                  }
                }
              }

              // if the leaf field provides no start date time *or*
              // any of the fields doesn't have the EntityWithTimeIntervalKey annotation
              // then the strategy doesn't apply.
              return {isValid: false};
            }

            return {isValid: true, addsFields: true};
          },

          /** @inheritDoc */
          apply: function(data, inputFieldIndexes) {
            return new EntityWithTimeIntervalKeyStrategy({
              data: data,
              inputFieldIndexes: inputFieldIndexes
            });
          }
        }
      });

      return EntityWithTimeIntervalKeyStrategy;
    }
  ];
});
