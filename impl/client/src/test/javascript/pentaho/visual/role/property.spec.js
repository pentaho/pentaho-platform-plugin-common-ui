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

  function getValue(object) {
    return object.value;
  }

  describe("pentaho.visual.role.Property", function() {

    describe(".Type", function() {

      var Value;
      var Complex;
      var VisualModel;
      var RoleProperty;
      var context;

      beforeEach(function(done) {

        Context.createAsync()
            .then(function(_context) {
              context = _context;

              Value = context.get("value");
              Complex = context.get("complex");

              return context.applyAsync([
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
      describe("#levels", function() {

        it("should respect the values specified on the spec", function() {

          var expectedLevels = ["nominal", "ordinal"];

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: expectedLevels
                }
              }
            }
          });

          var actualLevels = Model.type.get("propRole").levels.toArray(getValue);

          expect(actualLevels).toEqual(expectedLevels);
        });

        it("should sort the values specified on the spec", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["ordinal", "nominal"]
                }
              }
            }
          });

          var actualLevels = Model.type.get("propRole").levels.toArray(getValue);

          expect(actualLevels).toEqual(["nominal", "ordinal"]);
        });

        it("should allow removing values by setting", function() {

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

          rolePropType.levels = ["quantitative"];

          var actualLevels = rolePropType.levels.toArray(getValue);

          expect(actualLevels).toEqual(["quantitative"]);
        });

        it("should throw when a mapping does not support any measurement level", function() {

          expect(function() {

            VisualModel.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    levels: []
                  }
                }
              }
            });
          }).toThrow(errorMatch.argInvalid("levels"));
        });

        it("should allow a derived property to remove measurement levels", function() {

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal", "ordinal"]
                }
              }
            }
          });

          var ModelB = ModelA.extend({
            $type: {
              props: {
                propRole: {
                  levels: ["nominal"]
                }
              }
            }
          });

          var rolePropType = ModelB.type.get("propRole");

          expect(rolePropType.levels.toArray(getValue)).toEqual(["nominal"]);
        });

        it("should inherit the levels of the ancestor mapping type, when levels is unspecified", function() {

          var baseLevels = ["nominal", "ordinal"];

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: baseLevels
                }
              }
            }
          });

          var ModelB = ModelA.extend();

          var rolePropType = ModelB.type.get("propRole");

          var derivedLevels = rolePropType.levels.toArray(getValue);

          expect(derivedLevels).toEqual(baseLevels);
        });

        describe("when levels is set to a Nully value, the operation is ignored", function() {

          function expectNopOnNullyValue(nullyValue) {

            var expectedLevels = ["nominal", "ordinal"];

            var Model = VisualModel.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    levels: expectedLevels
                  }
                }
              }
            });

            var rolePropType = Model.type.get("propRole");

            rolePropType.levels = nullyValue;

            var actualLevels = rolePropType.levels.toArray(getValue);

            expect(actualLevels).toEqual(expectedLevels);
          }

          it("should ignore the operation, when levels is set to null", function() {

            expectNopOnNullyValue(null);
          });

          it("should ignore the operation, when levels is set to undefined", function() {

            expectNopOnNullyValue(undefined);
          });
        });

        it("should throw an error, when levels is set and the mapping type already has descendants.", function() {

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["ordinal"]
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

          var roleAPropType = ModelA.type.get("propRole");

          expect(function() {

            roleAPropType.levels = ["ordinal"];

          }).toThrow(errorMatch.operInvalid());
        });

        describe("the root property type", function() {

          it("should have all levels", function() {

            expect(RoleProperty.type.levels.toArray(getValue)).toEqual(["nominal", "ordinal", "quantitative"]);
          });
        });
      });

      describe("#anyLevelsQuantitative", function() {

        it("should be true if any level is quantitative", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["ordinal", "quantitative"]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.anyLevelsQuantitative).toBe(true);
        });

        it("should be false if not any level is quantitative", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["ordinal", "nominal"]
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.anyLevelsQuantitative).toBe(false);
        });
      });

      describe("#anyLevelsQualitative", function() {

        it("should be true if any level is qualitative", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRoleA: {
                  base: "pentaho/visual/role/property",
                  levels: ["ordinal", "quantitative"]
                },
                propRoleB: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal", "quantitative"]
                },
                propRoleC: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal", "ordinal"]
                }
              }
            }
          });

          expect(Model.type.get("propRoleA").anyLevelsQualitative).toBe(true);
          expect(Model.type.get("propRoleB").anyLevelsQualitative).toBe(true);
          expect(Model.type.get("propRoleC").anyLevelsQualitative).toBe(true);
        });

        it("should be false if not any level is qualitative", function() {

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

          expect(Model.type.get("propRole").anyLevelsQualitative).toBe(false);
        });
      });

      describe("#dataType", function() {

        it("should throw an error, when it is not a subtype of the dataType of the ancestor mapping type", function() {

          var dataTypeA = Complex.extend().type;
          var dataTypeB = Complex.extend().type;

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal"],
                  dataType: dataTypeA
                }
              }
            }
          });

          expect(function() {
            ModelA.extend({
              $type: {
                props: {
                  propRole: {
                    dataType: dataTypeB
                  }
                }
              }
            });
          }).toThrow(errorMatch.argInvalid("dataType"));
        });

        it("should accept a dataType that is a subtype of the dataType of the ancestor mapping type", function() {

          var DataTypeA = Complex.extend();
          var dataTypeA = DataTypeA.type;
          var dataTypeB = DataTypeA.extend().type;

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal"],
                  dataType: dataTypeA
                }
              }
            }
          });

          var ModelB = ModelA.extend({
            $type: {
              props: {
                propRole: {
                  dataType: dataTypeB
                }
              }
            }
          });

          expect(ModelB.type.get("propRole").dataType).toBe(dataTypeB);
        });

        it("should inherit the dataType of the ancestor mapping type, when unspecified", function() {

          var dataTypeA = Complex.extend().type;

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal"],
                  dataType: dataTypeA
                }
              }
            }
          });

          var ModelB = ModelA.extend({
            $type: {
              props: {
                propRole: {}
              }
            }
          });

          expect(ModelB.type.get("propRole").dataType).toBe(dataTypeA);
        });

        it("should ignore the operation, when dataType is set to a Nully value", function() {

          var dataTypeA = Complex.extend().type;

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal"],
                  dataType: dataTypeA
                }
              }
            }
          });

          var roleAPropType = ModelA.type.get("propRole");

          roleAPropType.dataType = null;

          expect(roleAPropType.dataType).toBe(dataTypeA);

          roleAPropType.dataType = undefined;

          expect(roleAPropType.dataType).toBe(dataTypeA);
        });

        // coverage
        it("should allow setting to the same type", function() {

          var dataTypeA = Complex.extend().type;

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal"],
                  dataType: dataTypeA
                }
              }
            }
          });

          var roleAPropType = ModelA.type.get("propRole");

          roleAPropType.dataType = dataTypeA;

          expect(roleAPropType.dataType).toBe(dataTypeA);
        });

        it("should throw, when set and the mapping type already has descendants", function() {

          var dataTypeA = Complex.extend().type;

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal"],
                  dataType: dataTypeA
                }
              }
            }
          });

          var roleAPropType = ModelA.type.get("propRole");

          ModelA.extend({
            $type: {
              props: {
                propRole: {}
              }
            }
          });

          expect(function() {

            roleAPropType.dataType = dataTypeA;

          }).toThrow(errorMatch.operInvalid());
        });

        it("should resolve values through the context", function() {

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal"]
                }
              }
            }
          });

          var roleAPropType = ModelA.type.get("propRole");

          roleAPropType.dataType = "complex";

          expect(roleAPropType.dataType).toBe(Complex.type);
        });

        it("should be pentaho.type.Value, at the root role property type", function() {

          expect(RoleProperty.type.dataType).toBe(Value.type);
        });

        it("should throw, when set to a data type that is inherently qualitative and " +
            "one of the role's levels is quantitative", function() {

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"]
                }
              }
            }
          });

          var roleAPropType = ModelA.type.get("propRole");

          // Test
          expect(function() {

            roleAPropType.dataType = "string";

          }).toThrow(errorMatch.argInvalid("dataType"));
        });
      });

      describe("#isVisualKey", function() {

        it("should have a root value of null", function() {

          expect(RoleProperty.type.isVisualKey).toBe(null);
        });

        it("should be undefined by default", function() {

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

          expect(rolePropType.isVisualKey).toBe(undefined);
        });

        it("should respect a specified boolean false value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"],
                  isVisualKey: false
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should respect a specified boolean true value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"],
                  isVisualKey: true
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should consider as true a specified truthy value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"],
                  isVisualKey: 1
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should consider as false a specified falsey, non-nully value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"],
                  isVisualKey: 0
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should ignore a specified null value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"],
                  isVisualKey: null
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(undefined);
        });

        it("should ignore a specified undefined value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"],
                  isVisualKey: undefined
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(undefined);
        });

        it("should ignore setting to an undefined value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"],
                  isVisualKey: true
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);

          rolePropType.isVisualKey = undefined;

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should ignore setting to a null value", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"],
                  isVisualKey: true
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          expect(rolePropType.isVisualKey).toBe(true);

          rolePropType.isVisualKey = null;

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should respect setting to the value true", function() {

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

          rolePropType.isVisualKey = true;

          expect(rolePropType.isVisualKey).toBe(true);
        });

        it("should respect setting to the value false", function() {

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

          rolePropType.isVisualKey = false;

          expect(rolePropType.isVisualKey).toBe(false);
        });

        it("should allow specifying a function", function() {

          var fIsKey = function() { return true; };

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["quantitative"],
                  isVisualKey: fIsKey
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          rolePropType.isVisualKey = fIsKey;

          expect(rolePropType.isVisualKey).toBe(fIsKey);
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

      describe("#levelAutoOn(model)", function() {

        it("should return undefined, when the mapping contains no attributes", function() {

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

          var model = new Model({
            data: new Table(getDataSpec1())
          });
          var rolePropType = model.$type.get("propRole");

          // Assumptions
          assertIsValid(model);
          expect(model.propRole.attributes.count).toEqual(0);

          // Test
          expect(rolePropType.levelAutoOn(model)).toBeUndefined();
        });

        it("should return undefined, when one of the attributes is not defined in the model's data", function() {

          var model = createFullValidQualitativeMapping();
          var rolePropType = model.$type.get("propRole");

          model.propRole.attributes.add({name: "mugambo"});

          expect(rolePropType.levelAutoOn(model)).toBeUndefined();
        });

        it("should return undefined, when the attributes' level is incompatible with the role's levels", function() {

          var model = createFullValidQuantitativeMapping();
          var rolePropType = model.$type.get("propRole");

          model.propRole.attributes.set(["country"]);

          expect(rolePropType.levelAutoOn(model)).toBeUndefined();
        });

        it("should return ordinal, when mapped to two attributes, one ordinal and one quantitative, " +
            "and the role is ordinal and quantitative", function() {

          // properly determines the lowest attribute level of measurement.

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["ordinal", "quantitative"]
                }
              }
            }
          });

          var model = new Model({
            data: new Table(getDataSpec1()),
            propRole: {attributes: ["product", "sales"]}
          });

          var rolePropType = model.$type.get("propRole");

          expect(rolePropType.levelAutoOn(model)).toBe("ordinal");
        });

        it("should return quantitative, when the attributes level is quantitative and the role is both " +
            "qualitative and quantitative", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal", "quantitative"]
                }
              }
            }
          });

          var model = new Model({
            data: new Table(getDataSpec1()),
            propRole: {attributes: ["sales"]}
          });

          var rolePropType = model.$type.get("propRole");

          expect(rolePropType.levelAutoOn(model)).toBe("quantitative");
        });

        it("should return ordinal, when the attributes level is nominal and the role is " +
            "both nominal and ordinal", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal", "ordinal"]
                }
              }
            }
          });

          var model = new Model({
            data: new Table(getDataSpec1()),
            propRole: {attributes: ["country"]}
          });

          var rolePropType = model.$type.get("propRole");

          expect(rolePropType.levelAutoOn(model)).toBe("ordinal");
        });

        it("should return nominal, when the attributes level is quantitative and the role is nominal", function() {

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

          var model = new Model({
            data: new Table(getDataSpec1()),
            propRole: {attributes: ["sales"]}
          });

          var rolePropType = model.$type.get("propRole");

          expect(rolePropType.levelAutoOn(model)).toBe("nominal");
        });

        it("should return ordinal, when the attributes level is quantitative and the role is ordinal", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["ordinal"]
                }
              }
            }
          });

          var model = new Model({
            data: new Table(getDataSpec1()),
            propRole: {attributes: ["sales"]}
          });

          var rolePropType = model.$type.get("propRole");

          expect(rolePropType.levelAutoOn(model)).toBe("ordinal");
        });
      });

      describe("#levelEffectiveOn(model)", function() {

        it("should be equal to the auto level when the level is null", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal", "ordinal"]
                }
              }
            }
          });

          var model = new Model();
          var mapping = model.propRole;
          var rolePropType = model.$type.get("propRole");

          // Assumptions
          expect(mapping.level).toBe(null);

          // Test
          spyOn(rolePropType, "levelAutoOn").and.returnValue("foo-level");

          var levelEffective = rolePropType.levelEffectiveOn(model);

          expect(rolePropType.levelAutoOn).toHaveBeenCalledTimes(1);
          expect(rolePropType.levelAutoOn).toHaveBeenCalledWith(model);
          expect(levelEffective).toBe("foo-level");
        });

        it("should be equal to the level, when the level is not null", function() {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal", "ordinal"]
                }
              }
            }
          });

          var level = "nominal";
          var model = new Model({propRole: {level: level}});
          var rolePropType = model.$type.get("propRole");

          spyOn(rolePropType, "levelAutoOn").and.returnValue("foo-level");

          var levelEffective = rolePropType.levelEffectiveOn(model);

          // Test
          expect(rolePropType.levelAutoOn).not.toHaveBeenCalled();

          expect(levelEffective).toBe(level);
        });
      });

      describe("#isVisualKeyOn(model)", function() {

        function testItLocal(valueSpec, valueExpected) {

          var Model = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal"],
                  isVisualKey: valueSpec
                }
              }
            }
          });

          var rolePropType = Model.type.get("propRole");

          var model = new Model({
            data: new Table(getDataSpec1()),
            propRole: {attributes: ["country"]}
          });

          expect(rolePropType.isVisualKeyOn(model)).toBe(valueExpected);
        }

        function testItInherited(value1Spec, value2Spec, valueExpected) {

          var ModelA = VisualModel.extend({
            $type: {
              props: {
                propRole: {
                  base: "pentaho/visual/role/property",
                  levels: ["nominal"],
                  isVisualKey: value1Spec
                }
              }
            }
          });

          var ModelB = ModelA.extend({
            $type: {
              props: {
                propRole: {
                  isVisualKey: value2Spec
                }
              }
            }
          });

          var roleBPropType = ModelB.type.get("propRole");

          var model = new ModelB({
            data: new Table(getDataSpec1()),
            propRole: {attributes: ["country"]}
          });

          expect(roleBPropType.isVisualKeyOn(model)).toBe(valueExpected);
        }

        it("should be false for an unmapped quantitative visual role", function() {

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

          var model = new Model({
            data: new Table(getDataSpec1())
          });

          expect(rolePropType.isVisualKeyOn(model)).toBe(false);
        });

        it("should be false for an unmapped qualitative visual role", function() {

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
            data: new Table(getDataSpec1())
          });

          expect(rolePropType.isVisualKeyOn(model)).toBe(false);
        });

        it("should be true for a mapped qualitative visual role, when not specified in the type", function() {

          var model = createFullValidQualitativeMapping();

          var rolePropType = model.$type.get("propRole");

          expect(rolePropType.isVisualKeyOn(model)).toBe(true);
        });

        it("should be true for a mapped quantitative visual role with dates, " +
            "when not specified in the type", function() {

          var model = createFullValidQuantitativeMapping();
          model.propRole.attributes.add(["date"]);

          var rolePropType = model.$type.get("propRole");

          expect(rolePropType.isVisualKeyOn(model)).toBe(true);
        });

        it("should be false for a number-mapped visual role, when not specified in the type", function() {

          var model = createFullValidQuantitativeMapping();

          var rolePropType = model.$type.get("propRole");

          expect(rolePropType.isVisualKeyOn(model)).toBe(false);
        });

        it("should evaluate to the specified, local, constant type#isVisualKey value", function() {
          testItLocal(true, true);
          testItLocal(false, false);
        });

        it("should evaluate to the specified, local, function type#isVisualKey value", function() {
          testItLocal(function() { return true; }, true);
          testItLocal(function() { return false; }, false);
        });

        it("should inherit the type#isVisualKey value", function() {
          testItInherited(true, null, true);
          testItInherited(false, null, false);
          testItInherited(function() { return true; }, null, true);
          testItInherited(function() { return false; }, null, false);
        });

        it("should not allow overriding a defined, inherited type#isVisualKey value", function() {
          testItInherited(true, false, true);
          testItInherited(false, true, false);
          testItInherited(function() { return true; }, false, true);
          testItInherited(
              function() { return false; },
              function() { return true; },
              false);
        });
      });

      describe("validateOn(model)", function() {

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
                "duplicate names and aggregation", function() {

              var model = createFullValidQuantitativeMapping();

              var containedAttribute = model.propRole.attributes.at(0);

              model.propRole.attributes.add(containedAttribute.clone());

              assertIsInvalid(model);
            });

            it("should be valid, when a mapping with an effective level of quantitative has duplicate names " +
                "but != aggregations", function() {

              var model = createFullValidQuantitativeMapping();

              var attribute1 = model.propRole.attributes.at(0);
              attribute1.aggregation = "sum";

              var attribute2 = attribute1.clone(); // same name
              attribute2.aggregation = "avg";

              model.propRole.attributes.add(attribute2);

              assertIsValid(model);
            });
          });
        }
      });

      describe("_fillSpecInContext(spec, keyArgs)", function() {

        describe("#levels", function() {

          it("should not serialize levels when not locally specified", function() {

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

            expect("levels" in spec).toBe(false);
          });

          it("should serialize levels when locally specified", function() {

            var scope = new SpecificationScope();

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

            var rolePropType = DerivedVisualModel.type.get("propRole");
            var spec = {};
            var ka = {};
            var any = rolePropType._fillSpecInContext(spec, ka);

            scope.dispose();

            expect(any).toBe(true);
            expect("levels" in spec);

            var levelValues = spec.levels.map(function(levelSpec) { return levelSpec.v; });
            expect(levelValues).toEqual(["quantitative"]);
          });

        });

        describe("#dataType", function() {

          it("should not serialize dataType when not locally specified", function() {

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

            expect("dataType" in spec).toBe(false);
          });

          it("should serialize dataType when locally specified", function() {

            var scope = new SpecificationScope();

            var DerivedVisualModel = VisualModel.extend({
              $type: {
                props: {
                  propRole: {
                    base: "pentaho/visual/role/property",
                    dataType: "number"
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
            expect(spec.dataType).toBe("number");
          });
        });

        describe("#isVisualKey", function() {

          propertyTypeUtil.itDynamicAttribute("isVisualKey", true, "pentaho/visual/role/property");

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
