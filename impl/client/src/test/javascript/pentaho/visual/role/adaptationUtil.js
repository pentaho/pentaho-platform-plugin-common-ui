/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/visual/Model",
  "pentaho/visual/ModelAdapter",
  "pentaho/visual/role/adaptation/Strategy",
  "pentaho/type/String",
  "pentaho/type/List"
], function(Model, ModelAdapter, BaseStrategy, PentahoString, List) {

  "use strict";

  return {

    buildAdapter: function(DerivedModel, propsSpec) {

      return ModelAdapter.extend({
        $type: {
          props: [
            {name: "model", valueType: DerivedModel}
          ].concat(propsSpec || [])
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

      exports.ModelWithStringAndStringListRole = Model.extend({
        $type: {
          props: {
            roleA: {
              base: "pentaho/visual/role/Property",
              modes: [
                {dataType: "string"},
                {dataType: ["string"]}
              ]
            }
          }
        }
      });

      exports.NullStrategy = BaseStrategy.extend({
        constructor: function(instSpec) {

          this.base(instSpec);

          this._setOutputFieldIndexes(instSpec.outputFieldIndexes);
        },

        $type: {
          getInputTypeFor: function() {
            return null;
          }
        }
      });

      // ---

      exports.ElementIdentityStrategy = BaseStrategy.extend({

        constructor: function(instSpec) {

          this.base(instSpec);

          this._setOutputFieldIndexes(instSpec.inputFieldIndexes);
        },

        map: function() {},
        invert: function() {},

        $type: {
          get isIdentity() { return true; },

          getInputTypeFor: function(outputDataType, isVisualKeyEf) {
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

      exports.ElementNonIdentityStrategy = BaseStrategy.extend({

        constructor: function(instSpec) {

          this.base(instSpec);

          this._setOutputFieldIndexes(instSpec.inputFieldIndexes);
        },

        map: function() {},
        invert: function() {},

        $type: {
          get isIdentity() { return false; },

          getInputTypeFor: function(outputDataType, isVisualKeyEf) {
            if(outputDataType.isList) {
              return null;
            }

            return outputDataType;
          },
          validateApplication: function(schemaData, inputFieldIndexes) {
            return {isValid: true, addsFields: false};
          },
          apply: function(data, inputFieldIndexes) {
            return new exports.ElementNonIdentityStrategy({
              data: data,
              inputFieldIndexes: inputFieldIndexes
            });
          }
        }
      });

      // ---

      exports.ListIdentityStrategy = BaseStrategy.extend({
        constructor: function(instSpec) {

          this.base(instSpec);

          this._setOutputFieldIndexes(instSpec.inputFieldIndexes);
        },

        map: function() {},
        invert: function() {},

        $type: {
          get isIdentity() { return true; },

          getInputTypeFor: function(outputDataType, isVisualKeyEf) {
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

      exports.ListNonIdentityStrategy = BaseStrategy.extend({
        constructor: function(instSpec) {

          this.base(instSpec);

          this._setOutputFieldIndexes(instSpec.inputFieldIndexes);
        },

        map: function() {},
        invert: function() {},

        $type: {
          getInputTypeFor: function(outputDataType, isVisualKeyEf) {
            if(!outputDataType.isList) {
              return null;
            }

            return outputDataType;
          },
          validateApplication: function(schemaData, inputFieldIndexes) {
            return {isValid: true, addsFields: false};
          },
          apply: function(data, inputFieldIndexes) {
            return new exports.ListNonIdentityStrategy({
              data: data,
              inputFieldIndexes: inputFieldIndexes
            });
          }
        }
      });

      // ---

      exports.CombineStrategy = BaseStrategy.extend({
        constructor: function(instSpec) {

          this.base(instSpec);

          var data = this.data;

          data.model.attributes.add({
            name: "combinedCol",
            type: "string",
            label: "Combine"
          });

          var outputFieldIndex = data.addColumn("combinedCol");

          this._setOutputFieldIndexes([outputFieldIndex]);
        },

        map: function() {},
        invert: function() {},

        $type: {
          getInputTypeFor: function(outputDataType, isVisualKeyEf) {

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
