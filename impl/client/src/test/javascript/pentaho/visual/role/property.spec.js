/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "tests/pentaho/util/errorMatch",
  "pentaho/type/Context",
  "pentaho/type/SpecificationScope",
  "pentaho/data/Table"
], function(errorMatch, Context, SpecificationScope, Table) {

  "use strict";

  /* globals describe, it, beforeAll, beforeEach, afterEach, spyOn */

  describe("pentaho.visual.role.Property", function() {

    describe(".Type", function() {

      var VisualModel;
      var RoleProperty;
      var context;

      beforeAll(function(done) {

        Context.createAsync()
            .then(function(_context) {
              context = _context;

              return context.getDependencyApplyAsync([
                "pentaho/visual/base/model",
                "pentaho/visual/role/property"
              ], function(_Model, _RoleProperty) {
                VisualModel = _Model;
                RoleProperty = _RoleProperty;
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
                modes: [{valueType: ["string"]}]
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

      // region role property modes
      describe("#modes", function() {

        it("should default to a single mode having data type string and isContinuous false", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property"
                }
              }
            }
          });

          var actualModes = Model.type.get("propRole").modes.toJSON();

          expect(actualModes).toEqual([
            {dataType: "string"}
          ]);
        });

        it("should respect the values specified on the spec", function() {

          var initialModes = [
            {dataType: "number"},
            {dataType: "string"}
          ];

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: initialModes
                }
              }
            }
          });

          var actualModes = Model.type.get("propRole").modes.toJSON();

          expect(actualModes).toEqual(initialModes);
        });

        it("should allow removing modes by setting", function() {

          var initialModes = [
            {dataType: "number"},
            {dataType: "string"}
          ];

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: initialModes
                }
              }
            }
          });

          var finalModes = [
            {dataType: "number"}
          ];

          var rolePropType = Model.type.get("propRole");

          rolePropType.modes = finalModes;

          var actualModes = rolePropType.modes.toJSON();

          expect(actualModes).toEqual(finalModes);
        });

        it("should throw when a visual role would not support any mode", function() {

          expect(function() {

            VisualModel.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    modes: []
                  }
                }
              }
            });
          }).toThrow(errorMatch.argInvalid("modes"));
        });

        it("should allow a derived property to remove modes", function() {

          var initialModes = [
            {dataType: "number"},
            {dataType: "string"}
          ];

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: initialModes
                }
              }
            }
          });

          var finalModes = [
            {dataType: "string"}
          ];

          var ModelB = ModelA.extend({
            $type: {
              props: {
                propRole: {
                  modes: finalModes
                }
              }
            }
          });

          var rolePropType = ModelB.type.get("propRole");

          expect(rolePropType.modes.toJSON()).toEqual(finalModes);
        });

        it("should inherit the modes of the ancestor property type, when modes is unspecified", function() {

          var initialModes = [
            {dataType: "number"},
            {dataType: "string"}
          ];

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: initialModes
                }
              }
            }
          });

          var ModelB = ModelA.extend();

          var rolePropType = ModelB.type.get("propRole");

          var derivedModes = rolePropType.modes.toJSON();

          expect(derivedModes).toEqual(initialModes);
        });

        describe("when modes is set to a Nully value, the operation is ignored", function() {

          function expectNopOnNullyValue(nullyValue) {

            var initialModes = [
              {dataType: "number"},
              {dataType: "string"}
            ];

            var Model = VisualModel.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    modes: initialModes
                  }
                }
              }
            });

            var rolePropType = Model.type.get("propRole");

            rolePropType.modes = nullyValue;

            var finalModes = rolePropType.modes.toJSON();

            expect(finalModes).toEqual(initialModes);
          }

          it("should ignore the operation, when modes is set to null", function() {

            expectNopOnNullyValue(null);
          });

          it("should ignore the operation, when modes is set to undefined", function() {

            expectNopOnNullyValue(undefined);
          });
        });

        it("should throw an error, when modes is set and the property type already has descendants.", function() {

          var initialModes = [
            {dataType: "number"},
            {dataType: "string"}
          ];

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: initialModes
                }
              }
            }
          });

          ModelA.extend({
            $type: {
              props: {
                propRole: {}
              }
            }
          });

          var finalModes = [
            {dataType: "string"}
          ];

          var roleAPropType = ModelA.type.get("propRole");

          expect(function() {

            roleAPropType.modes = finalModes;

          }).toThrow(errorMatch.operInvalid());

          expect(roleAPropType.modes.toJSON()).toEqual(initialModes);

        });

        describe("the role.Property type", function() {

          it("should have a null modes", function() {
            expect(RoleProperty.type.modes).toBe(null);
          });
        });
      });

      describe("#hasAnyContinuousModes", function() {

        it("should be true if any level is quantitative", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string", isContinuous: false},
                    {dataType: "number", isContinuous: true}
                  ]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.hasAnyContinuousModes).toBe(true);
        });

        it("should be false if every level is categorical", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string", isContinuous: false},
                    {dataType: "number", isContinuous: false}
                  ]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.hasAnyContinuousModes).toBe(false);
        });
      });

      describe("#hasAnyCategoricalModes", function() {

        it("should be true if any mode is categorical", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRoleA: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "number", isContinuous: true},
                    {dataType: "string", isContinuous: false}
                  ]
                },
                propRoleB: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string", isContinuous: false},
                    {dataType: "number", isContinuous: true}
                  ]
                },
                propRoleC: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string", isContinuous: false},
                    {dataType: "object", isContinuous: false}
                  ]
                }
              }
            }
          });

          expect(Model.type.get("propRoleA").hasAnyCategoricalModes).toBe(true);
          expect(Model.type.get("propRoleB").hasAnyCategoricalModes).toBe(true);
          expect(Model.type.get("propRoleC").hasAnyCategoricalModes).toBe(true);
        });

        it("should be false if every mode is continuous", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "number", isContinuous: true}
                  ]
                }
              }
            }
          });

          expect(Model.type.get("propRole").hasAnyCategoricalModes).toBe(false);
        });
      });

      describe("#isVisualKey", function() {

        it("should have a root value of false", function() {

          expect(RoleProperty.type.isVisualKey).toBe(false);
        });

        it("should default to true if there is at least one categorical mode", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "number"},
                    {dataType: "string"}
                  ]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should default to true if modes is unspecified", function() {

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

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should default to false if there is no categorical mode", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "number"}
                  ]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should respect a specified boolean false value if there are categorical modes", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  isVisualKey: false,
                  modes: [
                    {dataType: "number"},
                    {dataType: "string"}
                  ]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should respect a specified boolean true value if there are categorical modes", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  isVisualKey: true,
                  modes: [
                    {dataType: "number"},
                    {dataType: "string"}
                  ]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should respect a specified boolean false value if there are no categorical modes", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  isVisualKey: false,
                  modes: [
                    {dataType: "number"}
                  ]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should respect a specified boolean true value if there are no categorical modes", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  isVisualKey: true,
                  modes: [
                    {dataType: "number"}
                  ]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should ignore a specified null value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string"}
                  ],
                  isVisualKey: null
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should ignore a specified undefined value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string"}
                  ],
                  isVisualKey: undefined
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should ignore setting to an undefined value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "number"}
                  ],
                  isVisualKey: false
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);

          rolePropType.isVisualKey = undefined;

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should ignore setting to an null value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "number"}
                  ],
                  isVisualKey: false
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);

          rolePropType.isVisualKey = null;

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should respect setting to the value true", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "number"}
                  ]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          rolePropType.isVisualKey = true;

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should ignore setting to the value false after being true", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string"}
                  ]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          rolePropType.isVisualKey = false;

          expect(rolePropType.isVisualKey).toBe(true);
        });
      });
      // endregion

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

            it("should be invalid when a mapping has a modeFixed which is not one of the property's modes", function() {

              var model = createFullValidQualitativeMapping();

              model.propRole.modeFixed = {dataType: "number"};

              assertIsInvalid(model);
            });
          });
        }
      });

      describe("#_fillSpecInContext(spec, keyArgs)", function() {

        describe("#modes", function() {

          it("should not serialize modes when not locally specified", function() {

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

            expect("modes" in spec).toBe(false);
          });

          it("should serialize modes when locally specified", function() {

            var scope = new SpecificationScope();

            var DerivedVisualModel = VisualModel.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string"}
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
            expect(spec.modes.length).toBe(1);
            expect(spec.modes[0].dataType.id).toBe("pentaho/type/string");
          });

          it("should serialize modes when locally specified in a derived class", function() {

            var scope = new SpecificationScope();

            var DerivedVisualModel = VisualModel.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string"},
                      {dataType: "number"}
                    ]
                  }
                }
              }
            });

            var DerivedVisualModel2 = DerivedVisualModel.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string"}
                    ]
                  }
                }
              }
            });

            var rolePropType = DerivedVisualModel2.type.get("propRole");
            var spec = {};
            var ka = {};
            var any = rolePropType._fillSpecInContext(spec, ka);

            scope.dispose();

            expect(any).toBe(true);
            expect(spec.modes.length).toBe(1);
            expect(spec.modes[0].dataType.id).toBe("pentaho/type/string");
          });
        });

        describe("#isVisualKey", function() {

          describe("root property", function() {

            it("should not serialize when not locally specified", function() {

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

              expect("isVisualKey" in spec).toBe(false);
            });

            it("should not serialize when locally specified equal to the default value", function() {

              var scope = new SpecificationScope();

              var DerivedVisualModel = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      isVisualKey: true
                    }
                  }
                }
              });

              var rolePropType = DerivedVisualModel.type.get("propRole");
              var spec = {};
              var ka = {};
              var any = rolePropType._fillSpecInContext(spec, ka);

              scope.dispose();

              expect("isVisualKey" in spec).toBe(false);
            });

            it("should serialize when locally specified not equal to the default value", function() {

              var scope = new SpecificationScope();

              var DerivedVisualModel = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      isVisualKey: false
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
              expect(spec.isVisualKey).toBe(false);
            });
          });

          describe("derived property", function() {

            it("should serialize when locally specified not equal to the inherited value", function() {

              var scope = new SpecificationScope();

              var DerivedVisualModel = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      isVisualKey: false
                    }
                  }
                }
              });

              var DerivedVisualModel2 = DerivedVisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      isVisualKey: true
                    }
                  }
                }
              });

              var rolePropType = DerivedVisualModel2.type.get("propRole");
              var spec = {};
              var ka = {};
              var any = rolePropType._fillSpecInContext(spec, ka);

              scope.dispose();

              expect(any).toBe(true);
              expect(spec.isVisualKey).toBe(true);
            });
          });
        });
      });
    });
  });
});
