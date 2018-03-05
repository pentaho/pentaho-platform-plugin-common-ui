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

      var Model;
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
                Model = _Model;
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

        var DerivedModel = Model.extend({
          $type: {
            props: {
              propRole: {
                base: "pentaho/visual/role/property",
                modes: [{dataType: ["string"]}]
              }
            }
          }
        });

        var data = new Table(getDataSpec1());

        var model = new DerivedModel({
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

      // region #modes et. al.
      describe("#modes", function() {

        it("should default to a single mode having data type string and isContinuous false", function() {

          var DerivedModel = Model.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property"
                }
              }
            }
          });

          var actualModes = DerivedModel.type.get("propRole").modes.toJSON();

          expect(actualModes).toEqual(["string"]);
        });

        it("should respect the values specified on the spec", function() {

          var initialModes = [
            "number",
            "string"
          ];

          var DerivedModel = Model.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: initialModes
                }
              }
            }
          });

          var actualModes = DerivedModel.type.get("propRole").modes.toJSON();

          expect(actualModes).toEqual(initialModes);
        });

        it("should allow removing modes by setting", function() {

          var initialModes = [
            "number",
            "string"
          ];

          var DerivedModel = Model.extend({
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
            "number"
          ];

          var rolePropType = DerivedModel.type.get("propRole");

          rolePropType.modes = finalModes;

          var actualModes = rolePropType.modes.toJSON();

          expect(actualModes).toEqual(finalModes);
        });

        it("should throw when a visual role would not support any mode", function() {

          expect(function() {

            Model.extend({
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
            "number",
            "string"
          ];

          var ModelA = Model.extend({
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
            "string"
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
            "number",
            "string"
          ];

          var ModelA = Model.extend({
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
              "number",
              "string"
            ];

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    modes: initialModes
                  }
                }
              }
            });

            var rolePropType = DerivedModel.type.get("propRole");

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
            "number",
            "string"
          ];

          var ModelA = Model.extend({
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
            "string"
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

      // The following are actually of BaseProperty, but easier to test here.

      describe("#hasAnyListModes", function() {

        it("should be true if any mode is list", function() {

          var DerivedModel = Model.extend({
            $type: {
              props: {
                propRoleA: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "number"},
                    {dataType: ["string"]}
                  ]
                },
                propRoleB: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "string"},
                    {dataType: ["number"]}
                  ]
                },
                propRoleC: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "list"}
                  ]
                }
              }
            }
          });

          expect(DerivedModel.type.get("propRoleA").hasAnyListModes).toBe(true);
          expect(DerivedModel.type.get("propRoleB").hasAnyListModes).toBe(true);
          expect(DerivedModel.type.get("propRoleC").hasAnyListModes).toBe(true);
        });

        it("should be false if every mode is not a list, value or instance", function() {

          var DerivedModel = Model.extend({
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

          expect(DerivedModel.type.get("propRole").hasAnyListModes).toBe(false);
        });

        it("should be false if some mode is of type value or instance", function() {

          var DerivedModel1 = Model.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "value"}
                  ]
                }
              }
            }
          });

          var DerivedModel2 = Model.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "instance"}
                  ]
                }
              }
            }
          });

          expect(DerivedModel1.type.get("propRole").hasAnyListModes).toBe(false);
          expect(DerivedModel2.type.get("propRole").hasAnyListModes).toBe(false);
        });
      });

      describe("#hasAnyContinuousModes", function() {

        it("should be true if any level is quantitative", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.hasAnyContinuousModes).toBe(true);
        });

        it("should be false if every level is categorical", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.hasAnyContinuousModes).toBe(false);
        });
      });

      describe("#hasAnyCategoricalModes", function() {

        it("should be true if any mode is categorical", function() {

          var DerivedModel = Model.extend({
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

          expect(DerivedModel.type.get("propRoleA").hasAnyCategoricalModes).toBe(true);
          expect(DerivedModel.type.get("propRoleB").hasAnyCategoricalModes).toBe(true);
          expect(DerivedModel.type.get("propRoleC").hasAnyCategoricalModes).toBe(true);
        });

        it("should be false if every mode is continuous", function() {

          var DerivedModel = Model.extend({
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

          expect(DerivedModel.type.get("propRole").hasAnyCategoricalModes).toBe(false);
        });
      });

      describe("#hasAnyModes({isContinuous, isList, elementDataType})", function() {

        describe("spec.isContinuous: false", function() {

          it("should be true if any mode is categorical", function() {

            var DerivedModel = Model.extend({
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

            expect(DerivedModel.type.get("propRoleA").hasAnyModes({isContinuous: false})).toBe(true);
            expect(DerivedModel.type.get("propRoleB").hasAnyModes({isContinuous: false})).toBe(true);
            expect(DerivedModel.type.get("propRoleC").hasAnyModes({isContinuous: false})).toBe(true);
          });

          it("should be false if every mode is continuous", function() {

            var DerivedModel = Model.extend({
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

            expect(DerivedModel.type.get("propRole").hasAnyModes({isContinuous: false})).toBe(false);
          });
        });

        describe("spec.isContinuous: true", function() {

          it("should be true if any level is quantitative", function() {

            var DerivedModel = Model.extend({
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

            var rolePropType = DerivedModel.type.get("propRole");

            expect(rolePropType.hasAnyModes({isContinuous: true})).toBe(true);
          });

          it("should be false if every level is categorical", function() {

            var DerivedModel = Model.extend({
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

            var rolePropType = DerivedModel.type.get("propRole");

            expect(rolePropType.hasAnyModes({isContinuous: true})).toBe(false);
          });
        });

        describe("spec.isList: false", function() {

          it("should be false if every mode is list", function() {

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  propRoleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: ["string"]}
                    ]
                  },
                  propRoleB: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: ["number"]}
                    ]
                  },
                  propRoleC: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "list"}
                    ]
                  }
                }
              }
            });

            expect(DerivedModel.type.get("propRoleA").hasAnyModes({isList: false})).toBe(false);
            expect(DerivedModel.type.get("propRoleB").hasAnyModes({isList: false})).toBe(false);
            expect(DerivedModel.type.get("propRoleC").hasAnyModes({isList: false})).toBe(false);
          });

          it("should be true if any mode is not a list, value or instance", function() {

            var DerivedModel = Model.extend({
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

            expect(DerivedModel.type.get("propRole").hasAnyModes({isList: false})).toBe(true);
          });

          it("should be true if any mode is of type value or instance", function() {

            var DerivedModel1 = Model.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "value"}
                    ]
                  }
                }
              }
            });

            var DerivedModel2 = Model.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "instance"}
                    ]
                  }
                }
              }
            });

            expect(DerivedModel1.type.get("propRole").hasAnyModes({isList: false})).toBe(true);
            expect(DerivedModel2.type.get("propRole").hasAnyModes({isList: false})).toBe(true);
          });
        });

        describe("spec.isList: true", function() {

          it("should be true if any mode is list", function() {

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  propRoleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "number"},
                      {dataType: ["string"]}
                    ]
                  },
                  propRoleB: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string"},
                      {dataType: ["number"]}
                    ]
                  },
                  propRoleC: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "list"}
                    ]
                  }
                }
              }
            });

            expect(DerivedModel.type.get("propRoleA").hasAnyModes({isList: true})).toBe(true);
            expect(DerivedModel.type.get("propRoleB").hasAnyModes({isList: true})).toBe(true);
            expect(DerivedModel.type.get("propRoleC").hasAnyModes({isList: true})).toBe(true);
          });

          it("should be false if every mode is not a list, value or instance", function() {

            var DerivedModel = Model.extend({
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

            expect(DerivedModel.type.get("propRole").hasAnyModes({isList: true})).toBe(false);
          });

          it("should be false if some mode is of type value or instance", function() {

            var DerivedModel1 = Model.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "value"}
                    ]
                  }
                }
              }
            });

            var DerivedModel2 = Model.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "instance"}
                    ]
                  }
                }
              }
            });

            expect(DerivedModel1.type.get("propRole").hasAnyModes({isList: true})).toBe(false);
            expect(DerivedModel2.type.get("propRole").hasAnyModes({isList: true})).toBe(false);
          });
        });

        describe("spec.elementDataType", function() {

          it("should be true if at least one list type mode exists and has the specified element type", function() {

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  propRoleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: ["string"]}
                    ]
                  },
                  propRoleB: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: ["number"]}
                    ]
                  }
                }
              }
            });

            expect(DerivedModel.type.get("propRoleA").hasAnyModes({elementDataType: "string"})).toBe(true);
            expect(DerivedModel.type.get("propRoleB").hasAnyModes({elementDataType: "number"})).toBe(true);
          });

          it("should be true if at least one list type mode exists and has an element type which is a subtype of " +
              "the specified element type", function() {

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  propRoleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "list"},
                      {dataType: "number"}
                    ]
                  }
                }
              }
            });

            expect(DerivedModel.type.get("propRoleA").hasAnyModes({elementDataType: "string"})).toBe(true);
          });

          it("should be true if at least one element type mode exists and is the specified element type", function() {

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  propRoleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "string"}
                    ]
                  }
                }
              }
            });

            expect(DerivedModel.type.get("propRoleA").hasAnyModes({elementDataType: "string"})).toBe(true);
          });

          it("should be true if at least one element type mode exists and is a subtype of " +
              "the specified element type", function() {

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  propRoleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "element"}
                    ]
                  }
                }
              }
            });

            expect(DerivedModel.type.get("propRoleA").hasAnyModes({elementDataType: "string"})).toBe(true);
          });

          it("should be false if no element type mode exists with the specified element type", function() {

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  propRoleA: {
                    base: "pentaho/visual/role/property",
                    modes: [
                      {dataType: "number"}
                    ]
                  }
                }
              }
            });

            expect(DerivedModel.type.get("propRoleA").hasAnyModes({elementDataType: "string"})).toBe(false);
          });
        });
      });
      // endregion

      describe("#isVisualKey", function() {

        it("should have a root value of false", function() {

          expect(RoleProperty.type.isVisualKey).toBe(false);
        });

        it("should default to true if there is at least one categorical mode", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should default to true if modes is unspecified", function() {

          var DerivedModel = Model.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property"
                }
              }
            }
          });

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should default to false if there is no categorical mode", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should respect a specified boolean false value if there are categorical modes", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should respect a specified boolean true value if there are categorical modes", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should respect a specified boolean false value if there are no categorical modes", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should respect a specified boolean true value if there are no categorical modes", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should ignore a specified null value", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should ignore a specified undefined value", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should ignore setting to an undefined value", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);

          rolePropType.isVisualKey = undefined;

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should ignore setting to an null value", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);

          rolePropType.isVisualKey = null;

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should respect setting to the value true", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          rolePropType.isVisualKey = true;

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should ignore setting to the value false after being true", function() {

          var DerivedModel = Model.extend({
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

          var rolePropType = DerivedModel.type.get("propRole");

          rolePropType.isVisualKey = false;

          expect(rolePropType.isVisualKey).toBe(true);
        });
      });

      describe("#fields", function() {

        describe("#countRangeOn(model)", function() {

          describe("when there is no current mode", function() {

            it("should return max = 1 if there are no list modes", function() {

              var DerivedModel = Model.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      modes: [
                        {dataType: "element"},
                        {dataType: "string"}
                      ]
                    }
                  }
                }
              });

              var rolePropType = DerivedModel.type.get("propRole");

              var model = new DerivedModel();

              var result = rolePropType.fields.countRangeOn(model);

              expect(result instanceof Object).toBe(true);
              expect(result.max).toBe(1);
            });

            it("should return max = Infinity if there is at least one list mode", function() {

              var DerivedModel = Model.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      modes: [
                        {dataType: "element"},
                        {dataType: "list"}
                      ]
                    }
                  }
                }
              });

              var rolePropType = DerivedModel.type.get("propRole");

              var model = new DerivedModel();

              var result = rolePropType.fields.countRangeOn(model);

              expect(result instanceof Object).toBe(true);
              expect(result.max).toBe(Infinity);
            });
          });

          describe("when there is a current mode", function() {

            it("should return max = 1 if it is not a list mode", function() {

              var DerivedModel = Model.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      modes: [
                        {dataType: "element"},
                        {dataType: "list"}
                      ]
                    }
                  }
                }
              });

              var rolePropType = DerivedModel.type.get("propRole");

              var data = new Table(getDataSpec1());

              var model = new DerivedModel({
                data: data,
                propRole: {
                  fields: ["country"]
                }
              });

              var result = rolePropType.fields.countRangeOn(model);

              expect(result instanceof Object).toBe(true);
              expect(result.max).toBe(1);
            });

            it("should return max = Infinity if it is a list mode", function() {

              var DerivedModel = Model.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      modes: [
                        {dataType: "element"},
                        {dataType: "list"}
                      ]
                    }
                  }
                }
              });

              var rolePropType = DerivedModel.type.get("propRole");

              var data = new Table(getDataSpec1());

              var model = new DerivedModel({
                data: data,
                propRole: {
                  fields: ["country", "product"]
                }
              });

              var result = rolePropType.fields.countRangeOn(model);

              expect(result instanceof Object).toBe(true);
              expect(result.max).toBe(Infinity);
            });
          });
        });
      });

      describe("#getModeEffectiveOn(model)", function() {

        it("should return mapping.modeFixed if it is specified", function() {

          var DerivedModel = Model.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  modes: [
                    {dataType: "element"},
                    {dataType: "string"}
                  ]
                }
              }
            }
          });

          var rolePropType = DerivedModel.type.get("propRole");

          var model = new DerivedModel({
            data: new Table(getDataSpec1()),
            propRole: {
              modeFixed: {dataType: "string"},
              fields: [{name: "country"}]
            }
          });

          var result = rolePropType.getModeEffectiveOn(model);

          expect(result).toBe(model.propRole.modeFixed);
        });

        describe("when mapping.modeFixed is not specified", function() {

          it("should return null if model has no data", function() {

            var DerivedModel = Model.extend({
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

            var rolePropType = DerivedModel.type.get("propRole");

            var model = new DerivedModel({
              propRole: {
                fields: [{name: "country"}]
              }
            });

            var result = rolePropType.getModeEffectiveOn(model);

            expect(result).toBe(null);
          });

          describe("when data is specified", function() {

            it("should return null when the mapping references an undefined field", function() {

              var DerivedModel = Model.extend({
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

              var rolePropType = DerivedModel.type.get("propRole");

              var model = new DerivedModel({
                data: new Table(getDataSpec1()),
                propRole: {
                  fields: [{name: "country"}, {name: "foo"}]
                }
              });

              var result = rolePropType.getModeEffectiveOn(model);

              expect(result).toBe(null);
            });

            describe("when all fields are defined", function() {

              it("should return the first mode which is applicable to the mapped fields' types (i)", function() {

                var DerivedModel = Model.extend({
                  $type: {
                    props: {
                      propRole: {
                        base: "pentaho/visual/role/property",
                        modes: [
                          {dataType: "number"},
                          {dataType: "element"},
                          {dataType: "string"}
                        ]
                      }
                    }
                  }
                });

                var rolePropType = DerivedModel.type.get("propRole");

                var model = new DerivedModel({
                  data: new Table(getDataSpec1()),
                  propRole: {
                    fields: [{name: "country"}]
                  }
                });

                var result = rolePropType.getModeEffectiveOn(model);

                expect(result).toBe(rolePropType.modes.at(1));
              });

              it("should return the first mode which is applicable to the mapped fields' types (ii)", function() {

                var DerivedModel = Model.extend({
                  $type: {
                    props: {
                      propRole: {
                        base: "pentaho/visual/role/property",
                        modes: [
                          {dataType: "string"},
                          {dataType: "element"},
                          {dataType: ["string"]}
                        ]
                      }
                    }
                  }
                });

                var rolePropType = DerivedModel.type.get("propRole");

                var model = new DerivedModel({
                  data: new Table(getDataSpec1()),
                  propRole: {
                    fields: [{name: "country"}, {name: "product"}]
                  }
                });

                var result = rolePropType.getModeEffectiveOn(model);

                expect(result).toBe(rolePropType.modes.at(2));
              });

              it("should return null when there is no applicable mode to the mapped fields' types", function() {

                var DerivedModel = Model.extend({
                  $type: {
                    props: {
                      propRole: {
                        base: "pentaho/visual/role/property",
                        modes: [
                          {dataType: "string"},
                          {dataType: "element"}
                        ]
                      }
                    }
                  }
                });

                var rolePropType = DerivedModel.type.get("propRole");

                var model = new DerivedModel({
                  data: new Table(getDataSpec1()),
                  propRole: {
                    fields: [{name: "country"}, {name: "product"}]
                  }
                });

                var result = rolePropType.getModeEffectiveOn(model);

                expect(result).toBe(null);
              });
            });
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

              var DerivedModel = Model.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property"
                    }
                  }
                }
              });

              var rolePropType = DerivedModel.type.get("propRole");

              var model = new DerivedModel({
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

            it("should be invalid when there is no applicable mode", function() {

              var model = createFullValidQualitativeMapping();

              model.propRole.fields = ["sales"];

              assertIsInvalid(model);
            });
          });
        }
      });

      describe("#_fillSpecInContext(spec, keyArgs)", function() {

        describe("#modes", function() {

          it("should not serialize modes when not locally specified", function() {

            var scope = new SpecificationScope();

            var DerivedModel = Model.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property"
                  }
                }
              }
            });

            var rolePropType = DerivedModel.type.get("propRole");
            var spec = {};
            var ka = {};
            var any = rolePropType._fillSpecInContext(spec, ka);

            scope.dispose();

            // any can still be true because of the `base` attribute and of the base implementation.

            expect("modes" in spec).toBe(false);
          });

          it("should serialize modes when locally specified", function() {

            var scope = new SpecificationScope();

            var DerivedModel = Model.extend({
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

            var rolePropType = DerivedModel.type.get("propRole");
            var spec = {};
            var ka = {};
            var any = rolePropType._fillSpecInContext(spec, ka);

            scope.dispose();

            expect(any).toBe(true);
            expect(spec.modes.length).toBe(1);
            expect(spec.modes[0].id).toBe("pentaho/type/string");
          });

          it("should serialize modes when locally specified in a derived class", function() {

            var scope = new SpecificationScope();

            var DerivedModel = Model.extend({
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

            var DerivedModel2 = DerivedModel.extend({
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

            var rolePropType = DerivedModel2.type.get("propRole");
            var spec = {};
            var ka = {};
            var any = rolePropType._fillSpecInContext(spec, ka);

            scope.dispose();

            expect(any).toBe(true);
            expect(spec.modes.length).toBe(1);
            expect(spec.modes[0].id).toBe("pentaho/type/string");
          });
        });

        describe("#isVisualKey", function() {

          describe("root property", function() {

            it("should not serialize when not locally specified", function() {

              var scope = new SpecificationScope();

              var DerivedModel = Model.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property"
                    }
                  }
                }
              });

              var rolePropType = DerivedModel.type.get("propRole");
              var spec = {};
              var ka = {};
              var any = rolePropType._fillSpecInContext(spec, ka);

              scope.dispose();

              // any can still be true because of the `base` attribute and of the base implementation.

              expect("isVisualKey" in spec).toBe(false);
            });

            it("should not serialize when locally specified equal to the default value", function() {

              var scope = new SpecificationScope();

              var DerivedModel = Model.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      isVisualKey: true
                    }
                  }
                }
              });

              var rolePropType = DerivedModel.type.get("propRole");
              var spec = {};
              var ka = {};
              var any = rolePropType._fillSpecInContext(spec, ka);

              scope.dispose();

              expect("isVisualKey" in spec).toBe(false);
            });

            it("should serialize when locally specified not equal to the default value", function() {

              var scope = new SpecificationScope();

              var DerivedModel = Model.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      isVisualKey: false
                    }
                  }
                }
              });

              var rolePropType = DerivedModel.type.get("propRole");
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

              var DerivedModel = Model.extend({
                $type: {
                  props: {
                    propRole: {
                      base: "pentaho/visual/role/property",
                      isVisualKey: false
                    }
                  }
                }
              });

              var DerivedModel2 = DerivedModel.extend({
                $type: {
                  props: {
                    propRole: {
                      isVisualKey: true
                    }
                  }
                }
              });

              var rolePropType = DerivedModel2.type.get("propRole");
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
