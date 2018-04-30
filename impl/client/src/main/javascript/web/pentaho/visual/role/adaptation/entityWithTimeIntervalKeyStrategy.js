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
  "pentaho/util/date",
  "pentaho/data/util",

  // so that r.js sees otherwise invisible dependencies.
  "./strategy",
  "./timeIntervalDuration"
], function(module, O, dateUtil, dataUtil) {
  "use strict";

  return [
    "./strategy",
    "./timeIntervalDuration",
    "pentaho/type/date",
    function(Strategy, TimeIntervalDuration, DateType) {

      var stringListType = this.get(["string"]);

      /**
       * @name pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy.Type
       * @class
       * @extends pentaho.visual.role.adaptation.Strategy.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy}.
       */
      var EntityWithTimeIntervalKeyStrategy = Strategy.extend(
        /** @lends pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy# */
        {
          /**
           * @alias pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy
           * @class
           * @extends pentaho.visual.role.adaptation.Strategy
           * @abstract
           *
           * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy>}
           *      pentaho/visual/role/adaptation/entityWithTimeIntervalKeyStrategy
           *
           * @classDesc The `EntityWithTimeIntervalKeyStrategy` class describes the strategy of mapping fields from a
           *   time hierarchy to a date value representing the start time of the most specific level (i.e. the smaller
           *   time interval).
           *
           * The strategy targets:
           * 1. modes whose [dataType]{@link pentaho.visual.role.Mode#dataType} is [date]{@link pentaho.type.Date}, and
           * 2. mappings of fields whose [attributes][@link pentaho.data.ITable#getColumnAttribute] contains the
           *   property "EntityWithTimeIntervalKey".
           *
           * Members of the most specific level must include the property "startDateTime". That is signaled by
           *   "isStartDateTimeProvided" boolean attribute in the "EntityWithTimeIntervalKey" property.
           *
           * @description Creates a _EntityWithTimeIntervalKey_ mapping strategy instance.
           * @constructor
           * @param {pentaho.visual.role.adaptation.spec.IStrategy} [instSpec] A _EntityWithTimeIntervalKey_ mapping
           *   strategy specification.
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
            this.mainInputPosition = this.$type.__getMainInputFieldPosition(inputFieldIndexes, dataTable);

            var mainSourceColumn = dataTable.getColumnAttribute(inputFieldIndexes[this.mainInputPosition]);

            var attributeName;
            var baseAttributeName = attributeName = this.$type.__getOutputFieldName(inputFieldIndexes);
            while(dataTable.model.attributes.get(attributeName) != null) {
              attributeName = baseAttributeName + "_" + new Date();
            }

            dataTable.model.attributes.add(
              {
                name: attributeName,
                type: "date",
                label: this.$type.__getOutputFieldLabel(inputFieldIndexes, dataTable),
                isKey: true,
                p: {
                  "timeIntervalDuration": mainSourceColumn.property("EntityWithTimeIntervalKey").duration
                }
              }
            );

            var outputColIndex = dataTable.addColumn(attributeName);

            var rowIndex = dataTable.getNumberOfRows();
            while(rowIndex--) {
              var inputFieldCount = inputFieldIndexes.length;
              var inputCells = new Array(inputFieldCount);

              var cellLabels = [];
              var cellIndex = -1;
              while(++cellIndex < inputFieldCount) {
                inputCells[cellIndex] = dataTable.getCell(rowIndex, inputFieldIndexes[cellIndex]);
                var label = inputCells[cellIndex].label;
                if(label) {
                  cellLabels.push(label);
                }
              }

              var mainInputCell = inputCells[this.mainInputPosition];
              var inputValue = mainInputCell.value;
              var dateValue = inputValue !== null
                ? dateUtil.parseDateEcma262v7(mainInputCell.referent.property("startDateTime"))
                : null;

              var outputCell = dataTable.getCell(rowIndex, outputColIndex);
              outputCell.value = dateValue;
              outputCell.label = cellLabels.join(", ");

              this.__backIndex[this.__keyFun.call(null, dateValue)] = rowIndex;
              this.__forwardIndex[inputValue === null ? "" : inputValue] = rowIndex;
            }

            instSpec = Object.create(instSpec);
            instSpec.outputFieldIndexes = [outputColIndex];

            this.base(instSpec);
          },

          /** @inheritDoc */
          get isInvertible() {
            return true;
          },

          /** @inheritDoc */
          map: function(inputValues) {
            var lookupValue = dataUtil.getCellValue(inputValues[this.mainInputPosition]);

            var rowIndex = this.__forwardIndex[lookupValue === null ? "" : lookupValue];
            if(rowIndex != null) {
              return this._getDataRowCells(rowIndex, this.outputFieldIndexes);
            }

            return null;
          },

          /** @inheritDoc */
          invert: function(outputValues) {

            var lookupValue = dataUtil.getCellValue(outputValues[0]);

            lookupValue = this.__keyFun.call(null, lookupValue);

            var rowIndex = this.__backIndex[lookupValue];
            if(rowIndex != null) {
              return this._getDataRowCells(rowIndex, this.inputFieldIndexes);
            }

            return null;
          },

          $type: /** @lends pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy.Type# */{
            id: module.id,

            /** @inheritDoc */
            getInputTypeFor: function(outputDataType, isVisualKey) {
              if(!isVisualKey || !outputDataType.isSubtypeOf(DateType.type)) {
                return null;
              }

              return stringListType.type;
            },

            /** @inheritDoc */
            validateApplication: function(schemaData, inputFieldIndexes) {
              var mainInputFieldIndex = this.__getMainInputFieldPosition(inputFieldIndexes, schemaData);

              return {isValid: mainInputFieldIndex > -1, addsFields: true};
            },

            __getMainInputFieldPosition: function(inputFieldIndexes, schemaData) {
              var mostSpecific = null;
              var mostSpecificIndex = null;

              var index = inputFieldIndexes.length;

              while(index--) {
                var colAttribute = schemaData.getColumnAttribute(inputFieldIndexes[index]);

                if(colAttribute != null) {
                  var annotation = colAttribute.property("EntityWithTimeIntervalKey");

                  if(annotation != null) {
                    // Equal duration replaces mostSpecific, because we're looping backwards.
                    if(mostSpecific == null ||
                       TimeIntervalDuration.type.comparePrimitiveValues(
                         mostSpecific.duration,
                         annotation.duration) < 1) {
                      mostSpecific = annotation;
                      mostSpecificIndex = index;
                    }

                    continue;
                  }
                }

                // If we reach here, one of the fields has no annotation, so we must reject the mapping
                mostSpecific = null;
                break;
              }

              return mostSpecific != null && mostSpecific.isStartDateTimeProvided ? mostSpecificIndex : -1;
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
            apply: function(data, inputFieldIndexes) {
              return new EntityWithTimeIntervalKeyStrategy(
                {
                  data: data,
                  inputFieldIndexes: inputFieldIndexes
                }
              );
            }
          }
        });

      return EntityWithTimeIntervalKeyStrategy;
    }
  ];
});
