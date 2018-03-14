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
  "pentaho/lang/Base",
  "./impl/IdentityAdapter"
], function(module, Base, IdentityAdapter) {

  "use strict";

  // region helper classes
  /**
   * @class
   * @implements {pentaho.visual.role.adaptation.IStrategyMethodValidApplication}
   * @private
   */
  var IdentityStrategyMethodValidApplication = Base.extend({
    constructor: function(strategyMethod, schemaData, inputFieldIndexes) {
      this.method = strategyMethod;
      this.schemaData = schemaData;
      this.inputFieldIndexes = inputFieldIndexes;
    },

    apply: function(dataTable) {
      return new IdentityAdapter(this, dataTable, this.inputFieldIndexes);
    }
  });

  /**
   * @class
   * @implements {pentaho.visual.role.adaptation.IStrategyMethod}
   * @private
   */
  var IdentityStrategyMethod = Base.extend({
    constructor: function(strategy, outputDataType) {
      this.strategy = strategy;
      this.name = null;
      this.fullName = strategy.$type.id;
      this.isIdentity = true;
      this.isInvertible = true;
      this.inputDataType = outputDataType;
      this.outputDataType = outputDataType;
    },

    validateApplication: function(schemaData, inputFieldIndexes) {
      return new IdentityStrategyMethodValidApplication(this, schemaData, inputFieldIndexes);
    }
  });
  // endregion

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

      /**
       * @name pentaho.visual.role.adaptation.IdentityStrategy
       * @class
       * @extends pentaho.visual.role.adaptation.Strategy
       * @abstract
       *
       * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.role.adaptation.IdentityStrategy>} pentaho/visual/role/adaptation/identityStrategy
       *
       * @classDesc The `IdentityStrategy` class describes the strategy of adapting a single data field,
       * without modification, between the external and internal data space.
       *
       * The _identity_ strategy targets mappings with a single field and
       * exposes a single,
       * [invertible]{@link pentaho.visual.role.adaptation.IStrategyMethod#isInvertible},
       * [identity]{@link pentaho.visual.role.adaptation.IStrategyMethod#isIdentity} method.
       *
       * @description Creates an _identity_ mapping strategy instance.
       * @constructor
       * @param {pentaho.visual.role.adaptation.spec.IStrategy} [spec] An _identity_ mapping strategy specification.
       */
      var IdentityStrategy = Strategy.extend(/** @lends pentaho.visual.role.adaptation.IdentityStrategy# */{
        $type: /** @lends pentaho.visual.role.adaptation.IdentityStrategy.Type# */{
          id: module.id
        },

        /** @override */
        selectMethods: function(outputDataType, isVisualKey) {

          // 1) Can handle a single column.
          if(outputDataType.isList) {
            return null;
          }

          return [new IdentityStrategyMethod(this, outputDataType)];
        }
      });

      return IdentityStrategy;
    }
  ];
});
