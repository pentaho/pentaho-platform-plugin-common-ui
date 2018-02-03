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
  "pentaho/type/ValidationError",
  "pentaho/type/SpecificationScope",
  "pentaho/data/Table",
  "tests/pentaho/type/propertyTypeUtil"
], function(errorMatch, Context, ValidationError, SpecificationScope, Table, propertyTypeUtil) {

  "use strict";

  /* globals describe, it, beforeEach, afterEach, spyOn */

  describe("pentaho.visual.role.Property", function() {

    describe(".Type", function() {

      var VisualModel;
      var RoleProperty;
      var context;

      beforeEach(function(done) {

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
                levels: ["nominal", "ordinal"],
                dataType: "string"
              }
            }
          }
        });

        var data = new Table(getDataSpec1());
        var model = new DerivedVisualModel({
          data: data,
          propRole: {attributes: ["country", "product"]}
        });

        assertIsValid(model);

        return model;
      }

      function createFullValidQuantitativeMapping() {

        var DerivedVisualModel = VisualModel.extend({
          $type: {
            props: {
              propRole: {
                base: "pentaho/visual/role/property",
                levels: ["quantitative"]
              }
            }
          }
        });

        var data = new Table(getDataSpec1());
        var model = new DerivedVisualModel({
          data: data,
          propRole: {attributes: ["sales"]}
        });

        assertIsValid(model);

        return model;
      }

      function assertIsValid(complex) {
        // this way, errors are shown in the console...
        expect(complex.validate()).toBe(null);
      }
      // endregion

      // region role property attributes
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

      describe("#attributes", function() {

        it("should get an object that conforms to the interface IPropertyAttributes", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");
          var attrs = rolePropType.attributes;

          expect(attrs instanceof Object).toBe(true);
          expect("isRequired" in attrs).toBe(true);
          expect("countMin" in attrs).toBe(true);
          expect("countMax" in attrs).toBe(true);
          expect("countRangeOn" in attrs).toBe(true);
        });

        it("should get the same object each time", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");
          var attrs1 = rolePropType.attributes;
          var attrs2 = rolePropType.attributes;

          expect(attrs1).toBe(attrs2);
        });

        it("should set only the specified properties", function() {

          var attrsSpec0 = {
            isRequired: function() {},
            countMin: function() {},
            countMax: function() {}
          };

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"],
                  attributes: attrsSpec0
                }
              }
            }
          });

          var attrsSpec1 = {
            isRequired: function() {}
          };

          var rolePropType = Model.type.get("propRole");

          rolePropType.attributes = attrsSpec1;

          expect(rolePropType.attributes.isRequired).toBe(attrsSpec1.isRequired);
          expect(rolePropType.attributes.countMin).toBe(attrsSpec0.countMin);
          expect(rolePropType.attributes.countMax).toBe(attrsSpec0.countMax);
        });
      });
      // endregion

      // TODO: reimplement validateOn
      xdescribe("validateOn(model)", function() {

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

            function assertIsValid(model) {
              if(txnScope) txnScope.acceptWill();

              // this way, errors are shown in the console...
              expect(model.$type.get("propRole").validateOn(model)).toBe(null);
            }

            function assertIsInvalid(model) {
              if(txnScope) txnScope.acceptWill();

              expect(model.$type.get("propRole").validateOn(model) != null).toBe(true);
            }

            it("should stop validation if base validation returns errors", function() {

              var Model = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      levels: ["nominal"]
                    }
                  }
                }
              });

              var rolePropType = Model.type.get("propRole");

              var model = new Model({
                propRole: {attributes: [{}]}
              });

              expect(model.propRole.attributes.count).toBe(1);

              // Assumptions
              var errors = rolePropType.validateOn(model);
              expect(Array.isArray(errors)).toBe(true);
              expect(errors.length).toBe(1);
            });

            it("should be invalid when attributes.isRequired and there are no attributes", function() {

              var Model = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      levels: ["nominal"],
                      attributes: {
                        isRequired: true
                      }
                    }
                  }
                }
              });

              var rolePropType = Model.type.get("propRole");

              var model = new Model({
                data: new Table(getDataSpec1())
              });

              var errors = rolePropType.validateOn(model);
              expect(errors).toEqual([
                jasmine.any(ValidationError)
              ]);
            });

            it("should be valid when attributes.isRequired and there are attributes", function() {

              var Model = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      levels: ["nominal"],
                      attributes: {
                        isRequired: true
                      }
                    }
                  }
                }
              });

              var rolePropType = Model.type.get("propRole");

              var model = new Model({
                data: new Table(getDataSpec1()),
                propRole: {attributes: ["country"]}
              });

              var errors = rolePropType.validateOn(model);

              expect(errors).toBe(null);
            });

            it("should be invalid when attributes.countMin = 2 and there are no attributes", function() {

              var Model = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      levels: ["nominal"],
                      attributes: {
                        countMin: 2
                      }
                    }
                  }
                }
              });

              var rolePropType = Model.type.get("propRole");

              var model = new Model({
                data: new Table(getDataSpec1())
              });

              var errors = rolePropType.validateOn(model);
              expect(errors).toEqual([
                jasmine.any(ValidationError)
              ]);
            });

            it("should be valid when attributes.countMin = 2 and there are 2 attributes", function() {

              var Model = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      levels: ["nominal"],
                      attributes: {
                        countMin: 2
                      }
                    }
                  }
                }
              });

              var rolePropType = Model.type.get("propRole");

              var model = new Model({
                data: new Table(getDataSpec1()),
                propRole: {attributes: ["country", "product"]}
              });

              var errors = rolePropType.validateOn(model);

              expect(errors).toBe(null);
            });

            it("should be invalid when attributes.countMax = 1 and there are 2 attributes", function() {

              var Model = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      levels: ["nominal"],
                      attributes: {
                        countMax: 1
                      }
                    }
                  }
                }
              });

              var rolePropType = Model.type.get("propRole");

              var model = new Model({
                data: new Table(getDataSpec1()),
                propRole: {attributes: ["country", "product"]}
              });

              var errors = rolePropType.validateOn(model);
              expect(errors).toEqual([
                jasmine.any(ValidationError)
              ]);
            });

            it("should be valid when attributes.countMax = 1 and there are 1 attributes", function() {

              var Model = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      levels: ["nominal"],
                      attributes: {
                        countMax: 1
                      }
                    }
                  }
                }
              });

              var rolePropType = Model.type.get("propRole");

              var model = new Model({
                data: new Table(getDataSpec1()),
                propRole: {attributes: ["country"]}
              });

              var errors = rolePropType.validateOn(model);

              expect(errors).toBe(null);
            });

            it("should be invalid, when the mapping's level is not one of the role's levels (qualitative)", function() {

              var model = createFullValidQualitativeMapping();

              model.propRole.level = "quantitative";

              assertIsInvalid(model);
            });

            it("should be invalid, when its level is not one of the role's levels (quantitative)", function() {

              var model = createFullValidQuantitativeMapping();

              model.propRole.level = "ordinal";

              assertIsInvalid(model);
            });

            it("should be valid, when its level is one of the role's levels", function() {

              var model = createFullValidQualitativeMapping();

              model.propRole.level = "nominal";

              assertIsValid(model);

              model.propRole.level = "ordinal";

              assertIsValid(model);
            });

            it("should be invalid, when the model has no data", function() {

              var model = createFullValidQualitativeMapping();

              model.data = null;

              assertIsInvalid(model);
            });

            it("should be invalid, when the name of a mapping attribute is not defined in the model data", function() {

              var model = createFullValidQualitativeMapping();
              model.propRole.attributes.add({name: "mugambo"});

              assertIsInvalid(model);
            });

            it("should be invalid, when the type of the mapped attribute is not a subtype of " +
                "the role's dataType", function() {

              var model = createFullValidQualitativeMapping();

              // quantitative measurement level would be compatible with the qualitative role.
              // but this role specifies the data type.
              model.propRole.attributes.add({name: "sales"});

              assertIsInvalid(model);
            });

            it("should be invalid, when the attributes level is the same, " +
                "but its data type is not a subtype", function() {

              var Model = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      levels: ["quantitative"],
                      dataType: "date"
                    }
                  }
                }
              });

              var model = new Model({
                data: new Table(getDataSpec1()),
                // an existing attribute whose measurement level is compatible with
                propRole: {attributes: ["sales"]}
              });

              assertIsInvalid(model);
            });

            it("should be invalid, when dataType is null and the attributes level is not " +
                "compatible with the role's levels", function() {

              var Model = VisualModel.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      levels: ["quantitative"]
                    }
                  }
                }
              });

              var model = new Model({
                data: new Table(getDataSpec1()),
                // an existing attribute whose measurement level is compatible with
                propRole: {attributes: ["product"]}
              });

              assertIsInvalid(model);
            });

            it("should be invalid, when a mapping with an effective " +
                "level of qualitative has duplicate names", function() {

              var model = createFullValidQualitativeMapping();

              var containedAttribute = model.propRole.attributes.at(0);

              model.propRole.attributes.add(containedAttribute.clone());

              assertIsInvalid(model);
            });

            it("should be invalid, when a mapping with an effective level of quantitative has " +
                "duplicate names", function() {

              var model = createFullValidQuantitativeMapping();

              var containedAttribute = model.propRole.attributes.at(0);

              model.propRole.attributes.add(containedAttribute.clone());

              assertIsInvalid(model);
            });

          });
        }
      });

      describe("_fillSpecInContext(spec, keyArgs)", function() {

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

        describe("#attributes", function() {

          describe("countMin", function() {

            propertyTypeUtil.itDynamicAttribute("countMin", 1, "pentaho/visual/role/property", "attributes");

          });

          describe("countMax", function() {

            propertyTypeUtil.itDynamicAttribute("countMax", 2, "pentaho/visual/role/property", "attributes");

          });

          describe("isRequired", function() {

            propertyTypeUtil.itDynamicAttribute("isRequired", true, "pentaho/visual/role/property", "attributes");

          });
        });
      });
    });
  });
});
