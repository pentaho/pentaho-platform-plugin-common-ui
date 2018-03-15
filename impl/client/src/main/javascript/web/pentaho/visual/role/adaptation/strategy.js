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
  "pentaho/lang/NotImplementedError",
  "pentaho/i18n!../i18n/messages"
], function(module, NotImplementedError, bundle) {

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

      /**
       * @name pentaho.visual.role.adaptation.Strategy
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
       * @param {pentaho.visual.role.adaptation.spec.IStrategy} [spec] An adaptation strategy specification.
       */
      var Strategy = Complex.extend(/** @lends pentaho.visual.role.adaptation.Strategy# */{

        $type: /** @lends pentaho.visual.role.adaptation.Strategy.Type# */{
          id: module.id,

          isAbstract: true
        },

        /**
         * Selects the methods of this strategy that are compatible with the given output data type and
         * visual key nature.
         *
         * If no methods apply to the given arguments, `null` should be returned.
         *
         * The actual output data type of the returned methods may be a [subtype]{@link pentaho.type.Type#isSubtypeOf}
         * of the given `outputDataType`.
         *
         * @name selectMethods
         * @memberOf pentaho.visual.role.adaptation.Strategy#
         * @method
         * @param {!pentaho.type.Type} outputDataType - The output data type.
         * @param {boolean} isVisualKey - Indicates that the returned method must preserve the key nature
         * of input fields. The returned method must be
         * [invertible]{@link pentaho.visual.role.adaptation.IStrategyMethod#isInvertible}.
         *
         * @return {Array.<!pentaho.visual.role.adaptation.IStrategyMethod>} A list of methods, if any apply;
         * `null`, if none.
         *
         * @abstract
         */

        // ---

        selectMethods: function() {
          throw new NotImplementedError();
        }
      })
      .implement({$type: bundle.structured.adaptation.strategy});

      return Strategy;
    }
  ];
});
