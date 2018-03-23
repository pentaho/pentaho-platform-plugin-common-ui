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
  "pentaho/util/arg",
  "pentaho/lang/OperationInvalidError",
  "pentaho/i18n!../i18n/messages"
], function(module, O, arg, OperationInvalidError, bundle) {

  "use strict";

  return [
    "complex",
    function(Complex) {

      /**
       * @name pentaho.visual.role.adaptation.Strategy.Type
       * @class
       * @extends pentaho.type.Complex.Type
       *
       * @classDesc The type class of {@link pentaho.visual.role.adaptation.Strategy}.
       */

      var Strategy = Complex.extend(/** @lends pentaho.visual.role.adaptation.Strategy# */{

        /**
         * @alias Strategy
         * @memberOf pentaho.visual.role.adaptation
         * @class
         * @extends pentaho.type.Complex
         * @abstract
         *
         * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.adaptation.Strategy>} pentaho/visual/role/adaptation/strategy
         *
         * @classDesc The `Strategy` class describes a strategy for mapping the data mapped to a visual role
         * from the external data space to the internal data space, and back.
         *
         * @description Creates a visual role adaptation strategy instance.
         * @constructor
         * @param {!pentaho.visual.role.adaptation.spec.IStrategy} instSpec - An adaptation strategy specification.
         */
        constructor: function(instSpec) {

          this.base(instSpec);

          /**
           * Gets the data set of this strategy.
           *
           * @name pentaho.visual.role.adaptation.Strategy#data
           * @type {!pentaho.data.ITable}
           * @readOnly
           */
          O.setConst(this, "data", arg.required(instSpec, "data", "instSpec"));

          /**
           * Gets the indexes of the input fields.
           *
           * @name pentaho.visual.role.adaptation.Strategy#inputFieldIndexes
           * @type {!Array.<number>}
           * @readOnly
           */
          O.setConst(this, "inputFieldIndexes", arg.required(instSpec, "inputFieldIndexes", "instSpec"));

          /**
           * Gets the indexes of the output fields.
           *
           * In identity-like strategies, `outputFieldIndexes` are equal to `inputFieldIndexes`.
           *
           * @name pentaho.visual.role.adaptation.Strategy#outputFieldIndexes
           * @type {!Array.<number>}
           * @readOnly
           *
           * @see pentaho.visual.role.adaptation.Strategy#outputFieldNames
           */
          O.setConst(this, "outputFieldIndexes", arg.required(instSpec, "outputFieldIndexes", "instSpec"));
        },

        /**
         * Gets a value that indicates if the strategy is invertible.
         *
         * The default implementation returns `false`.
         *
         * @name pentaho.visual.role.adaptation.Strategy#isInvertible
         * @type {boolean}
         * @readOnly
         */
        get isInvertible() {
          return false;
        },

        /**
         * Gets the names of the output fields.
         *
         * @type {!Array.<string>}
         * @readOnly
         *
         * @see pentaho.visual.role.adaptation.Strategy#outputFieldIndexes
         */
        get outputFieldNames() {

          var data = this.data;

          return this.outputFieldIndexes.map(function(outputFieldIndex) {
            return data.getColumnId(outputFieldIndex);
          });
        },

        /**
         * Gets the output data cells that correspond to the given input values or cells.
         *
         * In the case of adaptation strategies,
         * such as the [tuple]{@link pentaho.visual.role.adaptation.TupleStrategy} strategy,
         * that have more than one [output field]{@link pentaho.visual.role.adaptation.Strategy#outputFieldIndexes},
         * the values or cells of all of the output fields (or a left-aligned part of these) should be provided.
         *
         * @name pentaho.visual.role.adaptation.Strategy#map
         * @method
         *
         * @param {Array.<any|!pentaho.data.ICell>} inputValues - The output value(s) or cell(s).
         *
         * @return {Array.<!pentaho.data.ICell>} The output cells, when the given input values are present;
         * `null`, otherwise.
         *
         * @abstract
         */

        /**
         * Gets the input data cells that correspond to the given output values or cells.
         *
         * In the case of adaptation strategies,
         * such as the [tuple]{@link pentaho.visual.role.adaptation.TupleStrategy} strategy,
         * that have more than one [output field]{@link pentaho.visual.role.adaptation.Strategy#outputFieldIndexes},
         * the values or cells of all of the output fields (or a left-aligned part of these) should be provided.
         *
         * @name pentaho.visual.role.adaptation.Strategy#invert
         * @method
         *
         * @param {Array.<any|!pentaho.data.ICell>} outputValues - The output value(s) or cell(s).
         *
         * @return {Array.<!pentaho.data.ICell>} The input cells, when the given output values are present;
         * `null`, otherwise.
         */
        invert: function(outputValues) {
          throw new OperationInvalidError("Not supported.");
        },

        $type: /** @lends pentaho.visual.role.adaptation.Strategy.Type# */{
          id: module.id,

          isAbstract: true

          /**
           * Gets the input data type that would be required for this strategy to output a
           * given output data type and visual key nature.
           *
           * If the strategy cannot be applied to the given arguments, `null` should be returned.
           *
           * @name getInputTypeFor
           * @memberOf pentaho.visual.role.adaptation.Strategy.Type#
           * @method
           *
           * @param {!pentaho.type.Type} outputDataType - The output data type.
           * @param {boolean} isVisualKey - Indicates that the strategy should be able to preserve the key nature
           * of input fields. Created strategies should be
           * [invertible]{@link pentaho.visual.role.adaptation.Strategy#isInvertible}.
           *
           * @return {pentaho.type.Type} The input type, if the strategy can be applied; `null`, if not.
           *
           * @abstract
           */

          /**
           * Validates if the strategy is applicable to the given fields of a schema data table.
           *
           * This method can only be called if the data types of the given fields are compatible with the result of
           * a previous call to [getInputTypeFor]{@link pentaho.visual.role.adaptation.Strategy.Type#getInputTypeFor}.
           *
           * @name validateApplication
           * @memberOf pentaho.visual.role.adaptation.Strategy.Type#
           * @method
           *
           * @param {!pentaho.data.Table} schemaData - A data table representative of the schema of the data.
           * @param {!Array.<number>} inputFieldIndexes - The indexes of the input fields.
           *
           * @return {!pentaho.visual.role.adaptation.IStrategyApplicationValidation} A method application
           * validation object.
           *
           * @abstract
           */

          /**
           * Applies the strategy to the given data and fields.
           *
           * This method can only be called if a previous call to
           * [validateApplication]{@link pentaho.visual.role.adaptation.Strategy.Type#validateApplication}
           * with compatible arguments returned a
           * [valid]{@link pentaho.visual.role.adaptation.IStrategyApplicationValidation#isValid} application object.
           *
           * @name apply
           * @memberOf pentaho.visual.role.adaptation.Strategy.Type#
           * @method
           *
           * @param {!pentaho.data.Table} data - A data table.
           * @param {!Array.<number>} inputFieldIndexes - The indexes of the input fields.
           *
           * @return {!pentaho.visual.role.adaptation.Strategy} A strategy instance.
           *
           * @abstract
           */
        }
      })
      .implement({$type: bundle.structured.adaptation.strategy});

      return Strategy;
    }
  ];
});
