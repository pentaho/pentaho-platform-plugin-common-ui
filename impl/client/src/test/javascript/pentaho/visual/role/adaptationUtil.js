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
  "pentaho/lang/Base"
], function(Base) {

  "use strict";

  /* globals describe, it, beforeAll, beforeEach, afterEach, spyOn */

  return {

    buildAdapter: function(ModelAdapter, DerivedModel, propsSpec) {
      return ModelAdapter.extend({
        $type: {
          props: [{name: "model", valueType: DerivedModel}].concat(propsSpec || [])
        }
      });
    },

    createMocks: function(Model, ModelAdapter, BaseStrategy) {

      var exports = {};

      exports.ModelWithStringRole = Model.extend({
        $type: {
          props: {
            roleA: {
              base: "pentaho/visual/role/property",
              modes: [
                {dataType: "string"}
              ]
            }
          }
        }
      });

      exports.ModelWithStringListRole = Model.extend({
        $type: {
          props: {
            roleA: {
              base: "pentaho/visual/role/property",
              modes: [
                {dataType: ["string"]}
              ]
            }
          }
        }
      });

      exports.NullStrategy = BaseStrategy.extend({
        selectMethods: function() {
          return null;
        }
      });

      exports.IdentityRoleAdapter = Base.extend({
        constructor: function(method, data, inputFieldIndexes) {
          this.method = method;
          this.data = data;
          this.inputFieldIndexes = inputFieldIndexes;
          this.outputFieldIndexes = inputFieldIndexes;
        },
        adapt: function() {}
      });

      // ---

      exports.ElementIdentityStrategyMethod = Base.extend({
        constructor: function(strategy, outputDataType) {
          this.strategy = strategy;
          this.name = null;
          this.fullName = strategy.$type.uid;
          this.isIdentity = true;
          this.isInvertible = false;
          this.inputDataType = outputDataType;
          this.outputDataType = outputDataType;
        },

        validateApplication: function(schemaData, inputFieldIndexes) {
          return {
            method: this,
            schemaData: schemaData,
            inputFieldIndexes: inputFieldIndexes,

            apply: function(data) {
              return new exports.IdentityRoleAdapter(this.method, data, this.inputFieldIndexes);
            }
          };
        }
      });

      exports.ElementIdentityStrategy = BaseStrategy.extend({

        selectMethods: function(outputDataType, isVisualKey) {
          if(outputDataType.isList) {
            return null;
          }

          // List of strategy methods
          return [new exports.ElementIdentityStrategyMethod(this, outputDataType)];
        }
      });

      // ---

      exports.ListIdentityStrategyMethod = Base.extend({
        constructor: function(strategy, outputDataType) {
          this.strategy = strategy;
          this.name = null;
          this.fullName = strategy.$type.uid;
          this.isIdentity = true;
          this.isInvertible = false;
          this.inputDataType = outputDataType;
          this.outputDataType = outputDataType;
        },

        validateApplication: function(schemaData, inputFieldIndexes) {
          return {
            method: this,
            schemaData: schemaData,
            inputFieldIndexes: inputFieldIndexes,

            apply: function(data) {
              return new exports.IdentityRoleAdapter(this.method, data, this.inputFieldIndexes);
            }
          };
        }
      });

      exports.ListIdentityStrategy = BaseStrategy.extend({
        selectMethods: function(outputDataType, isVisualKey) {
          if(!outputDataType.isList) {
            return null;
          }

          // List of strategy methods
          return [new exports.ListIdentityStrategyMethod(this, outputDataType)];
        }
      });

      // ---

      exports.CombineRoleAdapter = Base.extend({
        constructor: function(method, data, inputFieldIndexes) {
          this.method = method;
          this.data = data;
          this.inputFieldIndexes = inputFieldIndexes;

          data.model.attributes.add({
            name: "combinedCol",
            type: "string",
            label: "Combine"
          });

          var outputFieldIndex = data.addColumn("combinedCol");

          this.outputFieldIndexes = [outputFieldIndex];
        },
        adapt: function() {}
      });

      exports.CombineStrategyMethod = Base.extend({
        constructor: function(strategy, outputDataType) {
          this.strategy = strategy;
          this.name = null;
          this.fullName = strategy.$type.uid;
          this.isIdentity = false;
          this.isInvertible = false;
          this.inputDataType = outputDataType.context.get("list").type;
          this.outputDataType = outputDataType;
        },

        validateApplication: function(schemaData, inputFieldIndexes) {
          return {
            method: this,
            schemaData: schemaData,
            inputFieldIndexes: inputFieldIndexes,

            apply: function(data) {
              return new exports.CombineRoleAdapter(this.method, data, this.inputFieldIndexes);
            }
          };
        }
      });

      exports.CombineStrategy = BaseStrategy.extend({
        selectMethods: function(outputDataType, isVisualKey) {

          var stringType = outputDataType.context.get("string").type;

          if(!stringType.isSubtypeOf(outputDataType)) {
            return null;
          }

          // List of strategy methods
          return [new exports.CombineStrategyMethod(this, stringType)];
        }
      }, {
        columnName: "combinedCol"
      });

      return exports;
    }
  };
});
