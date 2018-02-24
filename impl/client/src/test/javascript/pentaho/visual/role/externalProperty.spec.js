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
  "pentaho/type/Context",
  "pentaho/data/Table",
  "pentaho/type/SpecificationScope"
], function(Context, Table, SpecificationScope) {

  "use strict";

  /* globals describe, it, beforeAll, beforeEach, afterEach, spyOn */

  xdescribe("pentaho.visual.role.ExternalProperty", function() {

    describe(".Type", function() {

      var VisualModel;
      var BaseStrategy;
      var NullStrategy;
      var IdentityStrategy;
      var CombineStrategy;
      var TupleStrategy;
      var context;

      beforeAll(function(done) {

        Context.createAsync()
            .then(function(_context) {
              context = _context;

              return context.getDependencyApplyAsync([
                "pentaho/visual/base/model",
                "pentaho/visual/role/strategies/base",
                "pentaho/visual/role/strategies/identity",
                "pentaho/visual/role/strategies/combine",
                "pentaho/visual/role/strategies/tuple"
              ], function(_Model, _BaseStrategy, _IdentityStrategy, _CombineStrategy, _TupleStrategy) {
                VisualModel = _Model;

                BaseStrategy = _BaseStrategy;
                IdentityStrategy = _IdentityStrategy;
                CombineStrategy = _CombineStrategy;
                TupleStrategy = _TupleStrategy;

                NullStrategy = BaseStrategy.extend({
                  getAdapter: function() {
                    return null;
                  }
                });
              });
            })
            .then(done, done.fail);

      });

      // region helper methods
      function getDataSpec1() {
        return {
          model: [
            {name: "country", type: "string", label: "Country"},
            {name: "product", type: "string", label: "Product"},
            {name: "sales", type: "number", label: "Sales"},
            {name: "date", type: "date", label: "Date"}
          ],
          rows: [
            {c: ["Portugal", "fish", 100, "2016-01-01"]},
            {c: ["Ireland", "beer", 200, "2016-01-02"]}
          ]
        };
      }

      function createFullValidQualitativeMapping() {

        var DerivedVisualModel = VisualModel.extend({
          $type: {
            props: {
              propRole: {
                base: "pentaho/visual/role/property",
                modes: [{dataType: "string"}],
                strategies: [new IdentityStrategy(), new CombineStrategy(), new TupleStrategy()],
                dataType: "string"
              }
            }
          }
        });

        var data = new Table(getDataSpec1());

        var model = new DerivedVisualModel({
          data: data,
          propRole: {fields: ["country", "product"]}
        });

        assertIsValid(model);

        return model;
      }

      function assertIsValid(complex) {
        // this way, errors are shown in the console...
        expect(complex.validate()).toBe(null);
      }
      // endregion

      describe("#getAdapterOn(model)", function() {

        it("should return null if the role is not mapped", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: {
                roleA: {
                  base: "pentaho/visual/role/property",
                  modes: [{dataType: "string"}],
                  strategies: [
                    new IdentityStrategy()
                  ]
                }
              }
            }
          });

          var propType = CustomModel.type.get("roleA");
          var model = new CustomModel({
            data: new Table(getDataSpec1())
          });

          var adapter = propType.getAdapterOn(model);

          expect(adapter).toBe(null);
        });

        it("should return null if the model has no data", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: {
                roleA: {
                  base: "pentaho/visual/role/property",
                  modes: [{dataType: "string"}],
                  strategies: [
                    new IdentityStrategy()
                  ]
                }
              }
            }
          });

          var propType = CustomModel.type.get("roleA");
          var model = new CustomModel({
            roleA: {fields: ["country"]}
          });

          var adapter = propType.getAdapterOn(model);

          expect(adapter).toBe(null);
        });

        it("should return null if one of the mapped fields is not defined", function() {

          var CustomModel = VisualModel.extend({
            $type: {
              props: {
                roleA: {
                  base: "pentaho/visual/role/property",
                  modes: [{dataType: "string"}],
                  strategies: [
                    new IdentityStrategy()
                  ]
                }
              }
            }
          });

          var propType = CustomModel.type.get("roleA");
          var model = new CustomModel({
            roleA: {fields: ["foo"]}
          });

          var adapter = propType.getAdapterOn(model);

          expect(adapter).toBe(null);
        });

        describe("mapping has a specified isCategoricalFixed", function() {

          it("should return null if there is no compatible mode (isCategoricalFixed=false)", function() {

            var CustomModel = VisualModel.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string", isContinuous: false},
                      {dataType: "number", isContinuous: false}
                    ],
                    strategies: [
                      new IdentityStrategy()
                    ]
                  }
                }
              }
            });

            var propType = CustomModel.type.get("roleA");
            var model = new CustomModel({
              data: new Table(getDataSpec1()),
              roleA: {
                isContinuousFixed: true,
                fields: ["country"]
              }
            });

            var adapter = propType.getAdapterOn(model);

            expect(adapter).toBe(null);
          });

          it("should return null if there is no compatible mode (isContinuousFixed=false)", function() {

            var CustomModel = VisualModel.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string", isContinuous: true},
                      {dataType: "number", isContinuous: true}
                    ]
                  }
                }
              }
            });

            var propType = CustomModel.type.get("roleA");
            var model = new CustomModel({
              data: new Table(getDataSpec1()),
              roleA: {
                isContinuousFixed: false,
                fields: ["country"]
              }
            });

            var adapter = propType.getAdapterOn(model);

            expect(adapter).toBe(null);
          });

          it("should return an adapter if there is a compatible mode (isContinuousFixed=true)", function() {

            var CustomModel = VisualModel.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "number", isContinuous: true}
                    ],
                    strategies: [
                      new IdentityStrategy()
                    ]
                  }
                }
              }
            });

            var propType = CustomModel.type.get("roleA");
            var model = new CustomModel({
              data: new Table(getDataSpec1()),
              roleA: {
                isContinuousFixed: true,
                fields: ["sales"]
              }
            });

            var adapter = propType.getAdapterOn(model);

            expect(adapter).not.toBe(null);
          });

          it("should return an adapter if there is a compatible mode (isContinuousFixed=false)", function() {

            var CustomModel = VisualModel.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string", isContinuous: false}
                    ],
                    strategies: [
                      new IdentityStrategy()
                    ]
                  }
                }
              }
            });

            var propType = CustomModel.type.get("roleA");
            var model = new CustomModel({
              data: new Table(getDataSpec1()),
              roleA: {
                isContinuousFixed: false,
                fields: ["country"]
              }
            });

            var adapter = propType.getAdapterOn(model);

            expect(adapter).not.toBe(null);
          });
        });

        describe("mapping has no isContinuousFixed", function() {

          it("should return null if there is no applicable strategy for any of the modes", function() {

            var CustomModel = VisualModel.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string"},
                      {dataType: "number"}
                    ],
                    strategies: [
                      new NullStrategy(),
                      new IdentityStrategy()
                    ]
                  }
                }
              }
            });

            var propType = CustomModel.type.get("roleA");
            var model = new CustomModel({
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country", "sales"]
              }
            });

            var adapter = propType.getAdapterOn(model);

            expect(adapter).toBe(null);
          });

          it("should return the adapter of the first applicable strategy and mode", function() {

            var nullStrategy = new NullStrategy();
            var identityStrategy1 = new IdentityStrategy();
            var identityStrategy2 = new IdentityStrategy();

            spyOn(nullStrategy, "getMapper").and.callThrough();
            spyOn(identityStrategy1, "getMapper").and.callThrough();
            spyOn(identityStrategy2, "getMapper").and.callThrough();

            var CustomModel = VisualModel.extend({
              $type: {
                props: {
                  roleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "number"},
                      {dataType: "string"}
                    ],
                    strategies: [
                      nullStrategy,
                      identityStrategy1,
                      identityStrategy2
                    ]
                  }
                }
              }
            });

            var propType = CustomModel.type.get("roleA");
            var model = new CustomModel({
              data: new Table(getDataSpec1()),
              roleA: {
                fields: ["country"]
              }
            });

            var adapter = propType.getAdapterOn(model);

            expect(adapter).not.toBe(null);
            expect(adapter.mode).toBe(propType.modes.at(1));
          });
        });
      });

      describe("#validateOn(model)", function() {

        doValidateTests(false);
        doValidateTests(true);

        function doValidateTests(useTxn) {

          describe(useTxn ? "ambient" : "direct", function() {

            var txnScope;

            beforeEach(function() {
              if(useTxn) txnScope = context.enterChange();
            });

            afterEach(function() {
              if(txnScope) txnScope.dispose();
            });

            function assertIsInvalid(model) {
              if(txnScope) txnScope.acceptWill();

              expect(model.$type.get("propRole").validateOn(model) != null).toBe(true);
            }

            it("should stop validation if base validation returns errors", function() {

              var Model = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property"
                    }
                  }
                }
              });

              var rolePropType = Model.type.get("propRole");

              var model = new Model({
                propRole: {fields: [{}]}
              });

              expect(model.propRole.fields.count).toBe(1);

              // Assumptions
              var errors = rolePropType.validateOn(model);
              expect(Array.isArray(errors)).toBe(true);
              expect(errors.length).toBe(1);
            });

            it("should be invalid, when the model has no data", function() {

              var model = createFullValidQualitativeMapping();

              model.data = null;

              assertIsInvalid(model);
            });
          });
        }
      });

      describe("#_fillSpecInContext(spec, keyArgs)", function() {

        describe("#strategies", function() {

          it("should not serialize strategies when not locally specified", function() {

            var scope = new SpecificationScope();

            var DerivedVisualModel = VisualModel.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property"
                  }
                }
              }
            });

            var rolePropType = DerivedVisualModel.type.get("propRole");
            var spec = {};
            var ka = {};
            var any = rolePropType._fillSpecInContext(spec, ka);

            scope.dispose();

            // any can still be true because of the `base` attribute and of the base implementation.

            expect("strategies" in spec).toBe(false);
          });

          it("should serialize strategies when locally specified", function() {

            var scope = new SpecificationScope();

            var DerivedVisualModel = VisualModel.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    strategies: [
                      new IdentityStrategy()
                    ]
                  }
                }
              }
            });

            var rolePropType = DerivedVisualModel.type.get("propRole");
            var spec = {};
            var ka = {};
            var any = rolePropType._fillSpecInContext(spec, ka);

            scope.dispose();

            expect(any).toBe(true);
            expect(spec.strategies.length).toBe(1);
            expect(spec.strategies[0].$type).toBe(IdentityStrategy.type);
          });
        });
      });
    });
  });
});
