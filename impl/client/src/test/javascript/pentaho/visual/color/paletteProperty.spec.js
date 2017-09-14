/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "tests/pentaho/util/errorMatch",
  "pentaho/type/ValidationError",
  "pentaho/type/SpecificationScope",
  "tests/test-utils"
], function(Context, errorMatch, ValidationError, SpecificationScope, testUtils) {

  "use strict";

  // Use alternate, promise-aware version of `it`.
  var it = testUtils.itAsync;
  var expectToRejectWith = testUtils.expectToRejectWith;

  // helper
  describe("pentaho.visual.color.Property", function() {

    describe(".Type", function() {

      describe("tests using the top AMD context", function() {
        var BaseModel;
        var Palette;
        var PaletteProperty;
        var context;

        beforeEach(function(done) {

          Context.createAsync()
              .then(function(_context) {

                context = _context;

                return context.getDependencyAsync({
                  BaseModel: "pentaho/visual/base/model",
                  Palette: "pentaho/visual/color/palette",
                  PaletteProperty: "pentaho/visual/color/paletteProperty"
                });
              })
              .then(function(deps) {
                BaseModel = deps.BaseModel;
                Palette = deps.Palette;
                PaletteProperty = deps.PaletteProperty;
              })
              .then(done, done.fail);
        });

        // region property attributes

        describe("#valueType", function() {

          it("should be Palette", function() {

            expect(PaletteProperty.type.valueType).toBe(Palette.type);
          });
        });

        describe("#levels", function() {

          function getValue(object) {
            return object.value;
          }

          describe("the root property type", function() {

            it("should have all levels", function() {

              expect(PaletteProperty.type.levels.toArray(getValue)).toEqual(["nominal", "quantitative", "divergent"]);
            });
          });

          it("should respect the values specified on the spec", function() {

            var expectedLevels = ["nominal", "divergent"];

            var Model = BaseModel.extend({
              $type: {
                props: {
                  palette1: {
                    base: "pentaho/visual/color/paletteProperty",
                    levels: expectedLevels
                  }
                }
              }
            });

            var actualLevels = Model.type.get("palette1").levels.toArray(getValue);

            expect(actualLevels).toEqual(expectedLevels);
          });

          it("should sort the values specified on the spec", function() {

            var Model = BaseModel.extend({
              $type: {
                props: {
                  palette1: {
                    base: "pentaho/visual/color/paletteProperty",
                    levels: ["divergent", "nominal"]
                  }
                }
              }
            });

            var actualLevels = Model.type.get("palette1").levels.toArray(getValue);

            expect(actualLevels).toEqual(["nominal", "divergent"]);
          });

          it("should allow removing values by setting", function() {

            var Model = BaseModel.extend({
              $type: {
                props: {
                  palette1: {
                    base: "pentaho/visual/color/paletteProperty"
                  }
                }
              }
            });

            var palettePropType = Model.type.get("palette1");

            palettePropType.levels = ["quantitative"];

            var actualLevels = palettePropType.levels.toArray(getValue);

            expect(actualLevels).toEqual(["quantitative"]);
          });

          it("should throw when a property would not support any measurement level", function() {

            expect(function() {

              BaseModel.extend({
                $type: {
                  props: {
                    palette1: {
                      base: "pentaho/visual/color/paletteProperty",
                      levels: []
                    }
                  }
                }
              });
            }).toThrow(errorMatch.argInvalid("levels"));
          });

          it("should allow a derived property to remove measurement levels", function() {

            var ModelA = BaseModel.extend({
              $type: {
                props: {
                  palette1: {
                    base: "pentaho/visual/color/paletteProperty",
                    levels: ["nominal", "quantitative"]
                  }
                }
              }
            });

            var ModelB = ModelA.extend({
              $type: {
                props: {
                  palette1: {
                    levels: ["nominal"]
                  }
                }
              }
            });

            var palettePropType = ModelB.type.get("palette1");

            expect(palettePropType.levels.toArray(getValue)).toEqual(["nominal"]);
          });

          it("should inherit the levels of the ancestor property type, when levels is unspecified", function() {

            var baseLevels = ["nominal", "quantitative"];

            var ModelA = BaseModel.extend({
              $type: {
                props: {
                  palette1: {
                    base: "pentaho/visual/color/paletteProperty",
                    levels: baseLevels
                  }
                }
              }
            });

            var ModelB = ModelA.extend();

            var palettePropType = ModelB.type.get("palette1");

            var derivedLevels = palettePropType.levels.toArray(getValue);

            expect(derivedLevels).toEqual(baseLevels);
          });

          describe("when levels is set to a Nully value, the operation is ignored", function() {

            function expectNopOnNullyValue(nullyValue) {

              var expectedLevels = ["nominal", "quantitative"];

              var Model = BaseModel.extend({
                $type: {
                  props: {
                    palette1: {
                      base: "pentaho/visual/color/paletteProperty",
                      levels: expectedLevels
                    }
                  }
                }
              });

              var palettePropType = Model.type.get("palette1");

              palettePropType.levels = nullyValue;

              var actualLevels = palettePropType.levels.toArray(getValue);

              expect(actualLevels).toEqual(expectedLevels);
            }

            it("should ignore the operation, when levels is set to null", function() {

              expectNopOnNullyValue(null);
            });

            it("should ignore the operation, when levels is set to undefined", function() {

              expectNopOnNullyValue(undefined);
            });
          });

          it("should throw an error, when levels is set and the property type already has descendants.", function() {

            var ModelA = BaseModel.extend({
              $type: {
                props: {
                  palette1: {
                    base: "pentaho/visual/color/paletteProperty",
                    levels: ["quantitative"]
                  }
                }
              }
            });

            ModelA.extend({
              $type: {
                props: {
                  palette1: {}
                }
              }
            });

            var roleAPropType = ModelA.type.get("palette1");

            expect(function() {

              roleAPropType.levels = ["quantitative"];

            }).toThrow(errorMatch.operInvalid());
          });
        });

        // See also #defaultValue tests on tests with a new AMD context each time
        // endregion

        describe("validateOn(model)", function() {

          doValidateTests(false);
          doValidateTests(true);

          function doValidateTests(useTxn) {

            describe(useTxn ? "with an ambient transaction" : "without a transaction", function() {

              var txnScope;

              beforeEach(function() {
                if(useTxn) txnScope = context.enterChange();
              });

              afterEach(function() {
                if(txnScope) txnScope.dispose();
              });

              function expectIsValid(model) {
                if(txnScope) txnScope.acceptWill();

                // this way, errors are shown in the console...
                expect(model.$type.get("palette1").validateOn(model)).toBe(null);
              }

              function expectIsInvalid(model) {
                if(txnScope) txnScope.acceptWill();

                expect(model.$type.get("palette1").validateOn(model) != null).toBe(true);
              }

              it("should stop validation if base validation returns errors", function() {

                var Model = BaseModel.extend({
                  $type: {
                    props: {
                      palette1: {
                        base: "pentaho/visual/color/paletteProperty",
                        levels: ["nominal"],
                        isRequired: true,
                        defaultValue: null // suppress our smart default, for now
                      }
                    }
                  }
                });

                var palettePropType = Model.type.get("palette1");

                var model = new Model();

                expect(model.palette1).toBe(null);

                // Should fail on isRequired and not do any more validations
                var errors = palettePropType.validateOn(model);
                expect(Array.isArray(errors)).toBe(true);
                expect(errors.length).toBe(1);
              });

              it("should be invalid, when the palette's level is not one of the property's levels (nominal)", function() {

                var Model = BaseModel.extend({
                  $type: {
                    props: {
                      palette1: {
                        base: "pentaho/visual/color/paletteProperty",
                        levels: ["nominal"]
                      }
                    }
                  }
                });

                var model = new Model({
                  palette1: new Palette({level: "quantitative", colors: ["red"]})
                });

                expectIsInvalid(model);
              });

              it("should be invalid, when the palette's level is not one of " +
                  "the property's levels (quantitative)", function() {

                var Model = BaseModel.extend({
                  $type: {
                    props: {
                      palette1: {
                        base: "pentaho/visual/color/paletteProperty",
                        levels: ["quantitative"]
                      }
                    }
                  }
                });

                var model = new Model({
                  palette1: new Palette({level: "nominal", colors: ["red"]})
                });

                expectIsInvalid(model);
              });

              it("should be valid, when its level is one of the role's levels", function() {

                var Model = BaseModel.extend({
                  $type: {
                    props: {
                      palette1: {
                        base: "pentaho/visual/color/paletteProperty",
                        levels: ["quantitative"]
                      }
                    }
                  }
                });

                var model = new Model({
                  palette1: new Palette({level: "quantitative", colors: ["red"]})
                });

                expectIsValid(model);
              });
            });
          }
        });

        describe("_fillSpecInContext(spec, keyArgs)", function() {

          describe("#levels", function() {

            it("should not serialize levels when not locally specified", function() {

              var scope = new SpecificationScope();

              var DerivedVisualModel = BaseModel.extend({
                $type: {
                  props: {
                    palette1: {
                      base: "pentaho/visual/color/paletteProperty"
                    }
                  }
                }
              });

              var palettePropType = DerivedVisualModel.type.get("palette1");
              var spec = {};
              var ka = {};
              var any = palettePropType._fillSpecInContext(spec, ka);

              scope.dispose();

              // any can still be true because of the `base` attribute and of the base implementation.

              expect("levels" in spec).toBe(false);
            });

            it("should serialize levels when locally specified", function() {

              var scope = new SpecificationScope();

              var DerivedVisualModel = BaseModel.extend({
                $type: {
                  props: {
                    palette1: {
                      base: "pentaho/visual/color/paletteProperty",
                      levels: ["quantitative"]
                    }
                  }
                }
              });

              var palettePropType = DerivedVisualModel.type.get("palette1");
              var spec = {};
              var ka = {};
              var any = palettePropType._fillSpecInContext(spec, ka);

              scope.dispose();

              expect(any).toBe(true);
              expect("levels" in spec);

              var levelValues = spec.levels.map(function(levelSpec) { return levelSpec.v; });
              expect(levelValues).toEqual(["quantitative"]);
            });

          });
        });
      });

      describe("tests with a new AMD context each time and shared AMD config", function() {

        function configAmd(localRequire) {

          // Clear all default instance registrations
          localRequire.config({
            config: {
              "pentaho/instanceInfo": null
            }
          });

          localRequire.config({
            config: {
              "pentaho/instanceInfo": {
                // This registration is actually required for everything to work...
                "pentaho/config/impl/instanceOfAmdLoadedService": {type: "pentaho.config.IService"},

                "my/palettesContextConfig": {type: "pentaho.config.spec.IRuleSet"},

                // Register palettes
                "my/nominalPalette1": {type: "pentaho/visual/color/palette"},
                "my/nominalPalette2": {type: "pentaho/visual/color/palette"},
                "my/quantitativePalette1": {type: "pentaho/visual/color/palette"}
              }
            }
          });

          localRequire.define("my/palettesContextConfig", function() {

            return {
              rules: [
                {
                  select: {type: "pentaho/type/Context"},
                  apply: {
                    instances: {
                      "my/nominalPalette1": {ranking: 4},
                      "my/nominalPalette2": {ranking: 3},
                      "my/quantitativePalette1": {ranking: 2}
                    }
                  }
                }
              ]
            };
          });

          localRequire.define("my/nominalPalette1", function() {

            return ["pentaho/visual/color/palette", function(Palette) {
              return new Palette({level: "nominal", colors: ["nominalPalette1"]});
            }];
          });

          localRequire.define("my/nominalPalette2", function() {

            return ["pentaho/visual/color/palette", function(Palette) {
              return new Palette({level: "nominal", colors: ["nominalPalette2"]});
            }];
          });

          localRequire.define("my/quantitativePalette1", function() {

            return ["pentaho/visual/color/palette", function(Palette) {
              return new Palette({level: "quantitative", colors: ["quantitativePalette1"]});
            }];
          });
        }

        describe("#defaultValue", function() {

          it("should select a palette with a compatible level", function() {

            return require.using([
              "pentaho/type/Context"
            ], configAmd, function(Context) {

              return Context.createAsync()
                  .then(function(context) {
                    return context.getDependencyAsync({
                      BaseModel: "pentaho/visual/base/model"
                    });
                  })
                  .then(function(deps) {

                    var Model = deps.BaseModel.extend({
                      $type: {
                        props: {
                          palette1: {
                            base: "pentaho/visual/color/paletteProperty",
                            levels: ["nominal", "divergent"]
                          }
                        }
                      }
                    });

                    var model = new Model();

                    var palette = model.palette1;

                    expect(palette.colors.at(0).value).toBe("nominalPalette1");
                  });
            });
          });

          it("should select a palette with a compatible level, and assign null if there's not one", function() {

            return require.using([
              "pentaho/type/Context"
            ], configAmd, function(Context) {

              return Context.createAsync()
                  .then(function(context) {
                    return context.getDependencyAsync({
                      BaseModel: "pentaho/visual/base/model"
                    });
                  })
                  .then(function(deps) {

                    var Model = deps.BaseModel.extend({
                      $type: {
                        props: {
                          palette1: {
                            base: "pentaho/visual/color/paletteProperty",
                            levels: ["divergent"]
                          }
                        }
                      }
                    });

                    var model = new Model();

                    var palette = model.palette1;

                    expect(palette).toBe(null);
                  });
            });
          });

          it("should select a compatible palette which is not used in " +
              "the previous properties (when initializing)", function() {

            return require.using([
              "pentaho/type/Context"
            ], configAmd, function(Context) {

              return Context.createAsync()
                  .then(function(context) {
                    return context.getDependencyAsync({
                      BaseModel: "pentaho/visual/base/model",
                      nominalPalette1: {$instance: {id: "my/nominalPalette1"}},
                      nominalPalette2: {$instance: {id: "my/nominalPalette2"}},
                      quantitativePalette1: {$instance: {id: "my/quantitativePalette1"}},
                    });
                  })
                  .then(function(deps) {

                    var Model = deps.BaseModel.extend({
                      $type: {
                        props: {
                          palette1: {
                            base: "pentaho/visual/color/paletteProperty"
                          },
                          palette2: {
                            base: "pentaho/visual/color/paletteProperty"
                          },
                          palette3: {
                            base: "pentaho/visual/color/paletteProperty"
                          }
                        }
                      }
                    });

                    var model = new Model({
                      palette1: deps.nominalPalette1,
                      palette3: deps.nominalPalette2
                    });

                    var palette = model.palette2;

                    expect(palette).toBe(deps.nominalPalette2);
                  });
            });
          });

          it("should select a compatible palette which is not used in " +
              "the other properties (when setting)", function() {

            return require.using([
              "pentaho/type/Context"
            ], configAmd, function(Context) {

              return Context.createAsync()
                  .then(function(context) {
                    return context.getDependencyAsync({
                      BaseModel: "pentaho/visual/base/model",
                      nominalPalette1: {$instance: {id: "my/nominalPalette1"}},
                      nominalPalette2: {$instance: {id: "my/nominalPalette2"}},
                      quantitativePalette1: {$instance: {id: "my/quantitativePalette1"}},
                    });
                  })
                  .then(function(deps) {

                    var Model = deps.BaseModel.extend({
                      $type: {
                        props: {
                          palette1: {
                            base: "pentaho/visual/color/paletteProperty"
                          },
                          palette2: {
                            base: "pentaho/visual/color/paletteProperty"
                          },
                          palette3: {
                            base: "pentaho/visual/color/paletteProperty"
                          }
                        }
                      }
                    });

                    var model = new Model({
                      palette1: deps.nominalPalette1,
                      palette3: deps.nominalPalette2
                    });

                    model.palette2 = null;

                    var palette = model.palette2;

                    expect(palette).toBe(deps.quantitativePalette1);
                  });
            });
          });
        });
      });
    });
  });
});
