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
  "pentaho/visual/base/Model",
  "pentaho/visual/base/ModelAdapter",
  "pentaho/visual/role/adaptation/Strategy",
  "pentaho/type/String",
  "pentaho/type/List"
], function(Model, ModelAdapter, BaseStrategy, PentahoString, List) {

  "use strict";

  return {

    buildAdapter: function(DerivedModel, propsSpec) {
      return ModelAdapter.extend({
        $type: {
          props: [{name: "model", valueType: DerivedModel}].concat(propsSpec || [])
        }
      });
    },

    createMocks: function() {

      var exports = {};

      exports.ModelWithStringRole = Model.extend({
        $type: {
          props: {
            roleA: {
              base: "pentaho/visual/role/Property",
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
              base: "pentaho/visual/role/Property",
              modes: [
                {dataType: ["string"]}
              ]
            }
          }
        }
      });

      exports.NullStrategy = BaseStrategy.extend({
        $type: {
          getInputTypeFor: function() {
            return null;
          }
        }
      });

      // ---

      exports.ElementIdentityStrategy = BaseStrategy.extend({
        constructor: function(instSpec) {

          instSpec = Object.create(instSpec);
          instSpec.outputFieldIndexes = instSpec.inputFieldIndexes;

          this.base(instSpec);
        },

        map: function() {},

        $type: {
          getInputTypeFor: function(outputDataType, isVisualKey) {
            if(outputDataType.isList) {
              return null;
            }

            return outputDataType;
          },
          validateApplication: function(schemaData, inputFieldIndexes) {
            return {isValid: true, addsFields: false};
          },
          apply: function(data, inputFieldIndexes) {
            return new exports.ElementIdentityStrategy({
              data: data,
              inputFieldIndexes: inputFieldIndexes
            });
          }
        }
      });

      // ---

      exports.ListIdentityStrategy = BaseStrategy.extend({
        constructor: function(instSpec) {

          instSpec = Object.create(instSpec);
          instSpec.outputFieldIndexes = instSpec.inputFieldIndexes;

          this.base(instSpec);
        },

        map: function() {},

        $type: {
          getInputTypeFor: function(outputDataType, isVisualKey) {
            if(!outputDataType.isList) {
              return null;
            }

            return outputDataType;
          },
          validateApplication: function(schemaData, inputFieldIndexes) {
            return {isValid: true, addsFields: false};
          },
          apply: function(data, inputFieldIndexes) {
            return new exports.ListIdentityStrategy({
              data: data,
              inputFieldIndexes: inputFieldIndexes
            });
          }
        }
      });

      // ---

      exports.CombineStrategy = BaseStrategy.extend({
        constructor: function(instSpec) {

          instSpec = Object.create(instSpec);

          var data = instSpec.data;

          data.model.attributes.add({
            name: "combinedCol",
            type: "string",
            label: "Combine"
          });

          var outputFieldIndex = data.addColumn("combinedCol");

          instSpec.outputFieldIndexes = [outputFieldIndex];

          this.base(instSpec);
        },

        map: function() {},

        $type: {
          getInputTypeFor: function(outputDataType, isVisualKey) {

            if(!PentahoString.type.isSubtypeOf(outputDataType)) {
              return null;
            }

            return List.type;
          },
          validateApplication: function(schemaData, inputFieldIndexes) {
            return {isValid: true, addsFields: true};
          },
          apply: function(data, inputFieldIndexes) {
            return new exports.CombineStrategy({
              data: data,
              inputFieldIndexes: inputFieldIndexes
            });
          }
        }
      }, {
        columnName: "combinedCol"
      });

      return exports;
    }
  };
});
