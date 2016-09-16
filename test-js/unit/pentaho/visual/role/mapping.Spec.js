define([
  "tests/pentaho/util/errorMatch",
  "pentaho/util/object",
  "pentaho/type/Context",
  "pentaho/type/complex",
  "pentaho/visual/base",
  "pentaho/type/value",
  "pentaho/visual/role/mapping",
  "pentaho/visual/role/mappingAttribute",
  "pentaho/visual/role/nominal",
  "pentaho/visual/role/ordinal",
  "pentaho/visual/role/quantitative",
  "pentaho/data/Table"
], function(errorMatch, objectUtil, Context, complexFactory, visualModelFactory, valueFactory,
    mappingFactory, attributeFactory, nominalFactory, ordinalFactory, quantitativeFactory,
    Table) {

  "use strict";

  /* global TypeError:false */

  function getValue(object) {
    return object.value;
  }

  describe("pentaho.visual.role.Mapping", function() {
    var Value, Complex, VisualModel, Mapping, MappingAttribute, context;

    beforeEach(function () {
      context = new Context();

      Value = context.get(valueFactory);
      Complex = context.get(complexFactory);

      VisualModel = context.get(visualModelFactory);

      Mapping = context.get(mappingFactory);
      MappingAttribute = context.get(attributeFactory);
    });

    // region helper methods
    /**
     * Creates a visual model that has a property visualRole with the given mapping of type Mapping
     */
    function createVisualModelWithMapping(Mapping) {
      var DerivedVisualModel = VisualModel.extend({type: {
        props: [{name: "visualRole", type: Mapping}]
      }});

      return new DerivedVisualModel();
    }

    function getDataSpec1() {
      return {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "product", type: "string", label: "Product"},
          {name: "sales",   type: "number", label: "Sales"  }
        ],
        rows: [
          {c: ["Portugal", "fish", 100]},
          {c: ["Ireland",  "beer", 200]}
        ]
      };
    }

    function createFullValidQualitativeMapping() {
      var ValidMapping = Mapping.extend({
        type: {
          levels: ["nominal", "ordinal"],
          dataType: "string"
        }
      });

      var model = createVisualModelWithMapping(ValidMapping);

      model.data = new Table(getDataSpec1());

      var mapping = model.visualRole;

      mapping.attributes.add(["country", "product"]);

      assertIsValid(mapping);

      return mapping;
    }

    function createFullValidQuantitativeMapping() {
      var ValidMapping = Mapping.extend({
        type: {
          levels: ["quantitative"]
        }
      });

      var model = createVisualModelWithMapping(ValidMapping);

      model.data = new Table(getDataSpec1());

      var mapping = model.visualRole;

      mapping.attributes.add(["sales"]);

      assertIsValid(mapping);

      return mapping;
    }

    function assertIsValid(complex) {
      // this way, errors are shown in the console...
      expect(complex.validate()).toBe(null);
    }
    // endregion

    describe("#isMapped", function() {
      var DerivedMapping;

      beforeEach(function() {
        DerivedMapping = Mapping.extend({type: {levels: ["quantitative"]}});
      });

      it("should be false when it has zero attributes", function() {
        var mapping = new DerivedMapping();
        expect(mapping.isMapped).toBe(false);
      });

      it("should be true when it has one attribute", function() {
        var mapping = new DerivedMapping({attributes: ["foo"]});
        expect(mapping.isMapped).toBe(true);
      });

      it("should be true when it has two attributes", function() {
        var mapping = new DerivedMapping({attributes: ["foo", "bar"]});
        expect(mapping.isMapped).toBe(true);
      });
    });

    describe("#levelEffective", function() {
      it("should be equal to the auto level when the level is null", function() {
        var BaseMapping = Mapping.extend({type: {levels: ["nominal", "ordinal"]}});

        // make sure that the mapping has a model
        var model = createVisualModelWithMapping(BaseMapping);
        var mapping = model.visualRole;

        // Assumptions
        expect(mapping.level).toBe(null);

        // Test
        var autoLevel = mapping.levelAuto;
        var levelEffective = mapping.levelEffective;
        expect(levelEffective).toBe(autoLevel);
      });

      it("should be equal to the level, when the level is not null", function() {
        var BaseMapping = Mapping.extend({type: {levels: ["nominal", "ordinal"]}});
        var model = createVisualModelWithMapping(BaseMapping);
        var mapping = model.visualRole;

        var expectedEffectiveLevel = "nominal";
        mapping.level = expectedEffectiveLevel;

        // Test
        var actualLevelEffective = mapping.levelEffective;
        expect(actualLevelEffective).toBe(expectedEffectiveLevel);
      });
    });

    describe("#levelAuto", function() {
      it("should return undefined, when the mapping contains no attributes", function() {
        var ValidMapping = Mapping.extend({
          type: {
            levels: ["nominal"]
          }
        });

        var model = createVisualModelWithMapping(ValidMapping);
        var mapping = model.visualRole;

        // Assumptions
        assertIsValid(mapping);
        expect(mapping.attributes.count).toEqual(0);

        // Test
        expect(mapping.levelAuto).toBeUndefined();
      });

      it("should return undefined, when one of the attributes is not defined in the model's data", function() {
        var mapping = createFullValidQualitativeMapping();
        var nonExistingDataAttribute = new MappingAttribute({name: "mugambo"});
        mapping.attributes.add(nonExistingDataAttribute);

        expect(mapping.levelAuto).toBeUndefined();
      });

      it("should return undefined, when the attributes level is incompatible with the roles' levels", function() {
        var mapping = createFullValidQuantitativeMapping();

        mapping.attributes.set(["country"]);

        expect(mapping.levelAuto).toBe(undefined);
      });

      it("should return ordinal, when mapped to two attributes, one ordinal and one quantitative, " +
         "and the role is ordinal and quantitative",
      function() {

        // properly determines the lowest attribute level of measurement.

        var MyMapping = Mapping.extend({
          type: {
            levels: ["ordinal", "quantitative"]
          }
        });

        var model = createVisualModelWithMapping(MyMapping);

        model.data = new Table(getDataSpec1());

        var mapping = model.visualRole;

        mapping.attributes.add(["product", "sales"]);

        expect(mapping.levelAuto).toBe("ordinal");
      });

      it("should return quantitative, when the attributes level is quantitative and the role is both " +
         "qualitative and quantitative", function() {
        var MyMapping = Mapping.extend({
          type: {
            levels: ["nominal", "quantitative"]
          }
        });

        var model = createVisualModelWithMapping(MyMapping);

        model.data = new Table(getDataSpec1());

        var mapping = model.visualRole;

        mapping.attributes.add("sales");

        expect(mapping.levelAuto).toBe("quantitative");
      });

      it("should return ordinal, when the attributes level is nominal and the role is both nominal and ordinal",
      function() {
        var MyMapping = Mapping.extend({
          type: {
            levels: ["nominal", "ordinal"]
          }
        });

        var model = createVisualModelWithMapping(MyMapping);

        model.data = new Table(getDataSpec1());

        var mapping = model.visualRole;

        mapping.attributes.add("country");

        expect(mapping.levelAuto).toBe("ordinal");
      });

      it("should return nominal, when the attributes level is quantitative and the role is nominal",
      function() {
        var MyMapping = Mapping.extend({
          type: {
            levels: ["nominal"]
          }
        });

        var model = createVisualModelWithMapping(MyMapping);

        model.data = new Table(getDataSpec1());

        var mapping = model.visualRole;

        mapping.attributes.add("sales");

        expect(mapping.levelAuto).toBe("nominal");
      });

      it("should return ordinal, when the attributes level is quantitative and the role is ordinal",
      function() {
        var MyMapping = Mapping.extend({
          type: {
            levels: ["ordinal"]
          }
        });

        var model = createVisualModelWithMapping(MyMapping);

        model.data = new Table(getDataSpec1());

        var mapping = model.visualRole;

        mapping.attributes.add("sales");

        expect(mapping.levelAuto).toBe("ordinal");
      });
    });

    describe("validate()", function() {

      function doValidateTests(useTxn) {

        describe(useTxn ? "ambient" : "direct", function() {
          var txnScope;

          beforeEach(function() {
            if(useTxn) txnScope = context.enterChange();
          });

          afterEach(function() {
            if(txnScope) txnScope.dispose();
          });

          function assertIsValid(complex) {
            if(txnScope) txnScope.acceptWill();

            // this way, errors are shown in the console...
            expect(complex.validate()).toBe(null);
          }

          function assertIsInvalid(complex) {
            if(txnScope) txnScope.acceptWill();

            expect(complex.isValid).toBe(false);
          }

          it("should stop validation if base validation returns errors", function() {
            var MyMapping = Mapping.extend({
              type: {
                levels: ["nominal"]
              }
            });

            // invalidMappingAttribute.name is required
            var invalidMappingAttribute = new MappingAttribute();

            // Assumptions
            var errors = invalidMappingAttribute.validate();
            expect(Array.isArray(errors)).toBe(true);
            expect(errors.length).toBe(1);

            var mapping = new MyMapping({attributes: [invalidMappingAttribute]});

            // Test
            errors = mapping.validate();

            expect(Array.isArray(errors)).toBe(true);
            expect(errors.length).toBe(1);
          });

          it("should be invalid, when it has no model", function() {
            var MyMapping = Mapping.extend({
              type: {
                levels: ["nominal"]
              }
            });

            var mapping = new MyMapping();

            expect(mapping.model).toBe(null);

            assertIsInvalid(mapping);
          });

          it("should be invalid, when its level is not one of the role's levels (qualitative)", function() {
            var mapping = createFullValidQualitativeMapping();

            mapping.level = "quantitative";

            assertIsInvalid(mapping);
          });

          it("should be invalid, when its level is not one of the role's levels (quantitative)", function() {
            var mapping = createFullValidQuantitativeMapping();

            mapping.level = "ordinal";

            assertIsInvalid(mapping);
          });

          it("should be valid, when its level is one of the role's levels", function() {
            var mapping = createFullValidQualitativeMapping();

            mapping.level = "nominal";

            assertIsValid(mapping);

            mapping.level = "ordinal";

            assertIsValid(mapping);
          });

          it("should be invalid, when the model has no data", function() {
            var mapping = createFullValidQualitativeMapping();
            assertIsValid(mapping);
            mapping.model.data = null;

            assertIsInvalid(mapping);
          });

          it("should be invalid, when the name of a mapping attribute is not defined in the model data", function() {
            var mapping = createFullValidQualitativeMapping();
            var nonExistingDataAttribute = new MappingAttribute({name: "mugambo"});
            mapping.attributes.add(nonExistingDataAttribute);

            assertIsInvalid(mapping);
          });

          it("should be invalid, when the type of the mapped attribute is not a subtype of the role's dataType",
          function() {
            var mapping = createFullValidQualitativeMapping();

            // quantitative measurement level would be compatible with the qualitative role.
            // but this role specifies the data type.
            var incompatibleDataTypeAttribute = "sales";

            mapping.attributes.add(incompatibleDataTypeAttribute);

            assertIsInvalid(mapping);
          });

          it("should be invalid, when the attributes level is the same, but its data type is not a subtype",
          function() {

            // Role with no data type restriction.
            var DerivedMapping = Mapping.extend({
              type: {
                levels:   ["quantitative"],
                dataType: "date"
              }
            });

            var model = createVisualModelWithMapping(DerivedMapping);

            model.data = new Table(getDataSpec1());

            // an existing attribute whose measurement level is compatible with
            var mapping = model.visualRole;

            mapping.attributes.add("sales");

            assertIsInvalid(mapping);
          });

          it("should be invalid, when dataType is null and the attributes level is not " +
             "compatible with the role's levels", function() {

            // Role with no data type restriction.
            var DerivedMapping = Mapping.extend({
              type: {
                levels: ["quantitative"]
              }
            });

            var model = createVisualModelWithMapping(DerivedMapping);

            model.data = new Table(getDataSpec1());

            // an existing attribute whose measurement level is compatible with
            var mapping = model.visualRole;

            mapping.attributes.add("product");

            assertIsInvalid(mapping);
          });

          it("should be invalid, when a mapping with an effective level of qualitative has duplicate names",
          function() {
            var mapping = createFullValidQualitativeMapping();

            var containedAttribute = mapping.attributes.at(0);

            mapping.attributes.add(containedAttribute.clone());

            assertIsInvalid(mapping);
          });

          it("should be invalid, when a mapping with an effective level of quantitative has " +
             "duplicate names and aggregation", function() {
            var mapping = createFullValidQuantitativeMapping();

            var containedAttribute = mapping.attributes.at(0);

            mapping.attributes.add(containedAttribute.clone());

            assertIsInvalid(mapping);
          });

          it("should be valid, when a mapping with an effective level of quantitative has duplicate names " +
             "but != aggregations", function() {
            var mapping = createFullValidQuantitativeMapping();

            var attribute1 = mapping.attributes.at(0);
            attribute1.aggregation = "sum";

            var attribute2 = attribute1.clone(); // same name
            attribute2.aggregation = "avg";

            mapping.attributes.add(attribute2);

            assertIsValid(mapping);
          });
        });
      }

      doValidateTests(false);
      doValidateTests(true);
    });

    describe("#model and #modelProperty", function() {
      var derived, Derived, propType, DerivedMapping, mapping;

      beforeEach(function() {
        DerivedMapping = Mapping.extend({type: {levels: ["nominal"]}});

        Derived = Complex.extend({type: {
          props: [
            {name: "foo", type: DerivedMapping}
          ]
        }});

        propType = Derived.type.get("foo");

        derived = new Derived();

        derived.foo = mapping = new DerivedMapping();
      });


      it("should have #model return the container `derived`", function() {
        expect(mapping.model).toBe(derived);
      });

      it("should have #modelProperty return the containing property", function() {
        expect(mapping.modelProperty).toBe(propType);
      });
    });

    describe("#isVisualKey", function() {

      function testItLocal(valueSpec, valueExpected) {
        var ValidMapping = Mapping.extend({type: {levels: ["nominal"], isVisualKey: valueSpec}});

        var model = createVisualModelWithMapping(ValidMapping);

        model.data = new Table(getDataSpec1());

        var mapping = model.visualRole;
        mapping.attributes.add(["country"]);

        expect(mapping.isVisualKey).toBe(valueExpected);
      }

      function testItInherited(value1Spec, value2Spec, valueExpected) {
        var DerivedMapping1 = Mapping.extend({type: {levels: ["nominal"], isVisualKey: value1Spec}});
        var DerivedMapping2 = DerivedMapping1.extend({type: {isVisualKey: value2Spec}});

        var model = createVisualModelWithMapping(DerivedMapping2);

        model.data = new Table(getDataSpec1());

        var mapping = model.visualRole;
        mapping.attributes.add(["country"]);

        expect(mapping.isVisualKey).toBe(valueExpected);
      }

      it("should be false for an unmapped quantitative visual role", function() {
        var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"]}});
        var mapping = new DerivedMapping();
        expect(mapping.isVisualKey).toBe(false);
      });

      it("should be false for an unmapped qualitative visual role", function() {
        var DerivedMapping = Mapping.extend({type: {levels: ["nominal"]}});
        var mapping = new DerivedMapping();
        expect(mapping.isVisualKey).toBe(false);
      });

      it("should be true for a mapped qualitative visual role, when not specified in the type", function() {
        var mapping = createFullValidQualitativeMapping();
        expect(mapping.isVisualKey).toBe(true);
      });

      it("should be false for a mapped quantitative visual role, when not specified in the type", function() {
        var mapping = createFullValidQuantitativeMapping();
        expect(mapping.isVisualKey).toBe(false);
      });

      it("should evaluate to the specified, local, constant type#isVisualKey value", function() {
        testItLocal(true, true);
        testItLocal(false, false);
      });

      it("should evaluate to the specified, local, function type#isVisualKey value", function() {
        testItLocal(function() { return true;  }, true);
        testItLocal(function() { return false; }, false);
      });

      it("should inherit the type#isVisualKey value", function() {
        testItInherited(true, null, true);
        testItInherited(false, null, false);
        testItInherited(function() { return true;  }, null, true);
        testItInherited(function() { return false; }, null, false);
      });

      it("should not allow overriding a defined, inherited type#isVisualKey value", function() {
        testItInherited(true, false, true);
        testItInherited(false, true, false);
        testItInherited(function() { return true;  }, false, true);
        testItInherited(function() { return false; }, function() { return true;  }, false);
      });
    });

    describe(".Type", function() {

      describe("#levels", function() {
        it("should respect the values specified on the spec", function() {
          var expectedLevels = ["nominal", "ordinal"];
          var MyMapping = Mapping.extend({type: {levels: expectedLevels}});

          var actualLevels = MyMapping.type.levels.toArray(getValue);

          expect(actualLevels).toEqual(expectedLevels);
        });

        it("should allow adding values by setting", function() {
          var expectedLevels = ["nominal", "ordinal"];
          var MyMapping = Mapping.extend({type: {levels: expectedLevels}});

          MyMapping.type.levels = ["quantitative"];

          expectedLevels = expectedLevels.concat("quantitative");

          var actualLevels = MyMapping.type.levels.toArray(getValue);

          expect(actualLevels).toEqual(expectedLevels);
        });

        it("should throw when a non-abstract mapping does not support any measurement level", function() {
          function defineEmptyLevelsMapping() {
            Mapping.extend({type: {levels: []}});
          }

          expect(defineEmptyLevelsMapping).toThrow(errorMatch.argRequired("levels"));
        });

        it("should not throw when an abstract mapping does not support any measurement level", function() {
          function defineAbstractEmptyLevelsMapping() {
            Mapping.extend({type: {isAbstract: true}});
          }

          expect(defineAbstractEmptyLevelsMapping).not.toThrow(errorMatch.argRequired("levels"));
        });

        it("should allow a derived mapping type to add new measurement levels " +
           "by specifying the base levels plus the new levels", function() {
          var baseLevels = ["nominal"];
          var extendedLevels = baseLevels.concat("ordinal");

          var BaseMapping = Mapping.extend({type: {levels: baseLevels}});
          var ExtendedMapping = BaseMapping.extend({type: {levels: extendedLevels}});

          expect(ExtendedMapping.type.levels.toArray(getValue)).toEqual(extendedLevels);
        });

        it("should allow a derived mapping type to add new measurement levels " +
           "by specifying only the new levels", function() {
          var baseLevels = ["nominal"];
          var BaseMapping = Mapping.extend({type: {levels: baseLevels}});

          var addLevels = ["ordinal"];
          var DerivedMapping = BaseMapping.extend({type: {levels: addLevels}});

          var expectedLevels = baseLevels.concat(addLevels);
          var actualLevels = DerivedMapping.type.levels.toArray(getValue);
          expect(expectedLevels).toEqual(actualLevels);
        });

        it("should throw when adding a measurement level that is quantitative and " +
           "the visual role's dataType is inherently qualitative", function() {

          var baseLevels = ["nominal"];
          var BaseMapping = Mapping.extend({
            type: {
              levels:   baseLevels,
              dataType: "string"
            }
          });

          var addLevel = "quantitative";

          // Test
          var extendedLevels = baseLevels.concat(addLevel);

          function extendMapping() {
            BaseMapping.extend({
              type: {
                levels: extendedLevels
              }
            });
          }

          expect(extendMapping).toThrow(errorMatch.argInvalid("levels"));
        });

        it("should not allow removing an inherited measurement level", function() {
          var baseLevels = ["nominal", "ordinal"];
          var BaseMapping = Mapping.extend({type: {levels: baseLevels}});

          var constrainedLevels = [baseLevels[0]];
          var DerivedMapping = BaseMapping.extend({type: {levels: constrainedLevels}});

          var actualLevels = DerivedMapping.type.levels.toArray(getValue);
          expect(actualLevels.length).toBe(2);
          expect(actualLevels).toContain("nominal");
          expect(actualLevels).toContain("ordinal");

        });

        it("should inherit the levels of the ancestor mapping type, when levels is unspecified", function() {
          var baseLevels = ["nominal", "ordinal"];
          var BaseMapping = Mapping.extend({type: {levels: baseLevels}});
          var DerivedMapping = BaseMapping.extend();

          var derivedLevels = DerivedMapping.type.levels.toArray(getValue);

          expect(derivedLevels).toEqual(baseLevels);
        });

        describe("when levels is set to a Nully value, the operation is ignored", function() {
          function assertNopOnNullyValue(nullyValue) {
            var expectedLevels = ["nominal", "ordinal"];
            var MyMapping = Mapping.extend({type: {levels: expectedLevels}});

            MyMapping.type.levels = nullyValue;
            var actualLevels = MyMapping.type.levels.toArray(getValue);

            expect(actualLevels).toEqual(expectedLevels);
          }

          it("should ignore the operation, when levels is set to null", function() {
            assertNopOnNullyValue(null);
          });

          it("should ignore the operation, when levels is set to undefined", function() {
            assertNopOnNullyValue(undefined);
          });
        });

        it("should throw an error, when levels is set and the mapping type already has descendants.", function() {
          var BaseMapping = Mapping.extend({type: {levels: ["ordinal"]}});
          var DerivedMapping = BaseMapping.extend();

          function setLevels() {
            BaseMapping.type.levels = ["nominal"];
          }

          expect(setLevels).toThrow(errorMatch.operInvalid());
        });

        describe("the root mapping type", function() {
          it("should have no levels", function() {
            expect(Mapping.type.levels.count).toEqual(0);
          });
        });
      });

      describe("#anyLevelsQuantitative", function() {
        it("should be true if any level is quantitative", function() {
          var levels = ["nominal", "ordinal", "quantitative", "foo", "bar"];
          var MyMapping = Mapping.extend({type: {levels: levels}});

          expect(MyMapping.type.anyLevelsQuantitative).toBe(true);
        });

        it("should be false if not any level is quantitative", function() {
          var levels = ["foo", "ordinal", "nominal", "bar"];
          var MyMapping = Mapping.extend({type: {levels: levels}});

          expect(MyMapping.type.anyLevelsQuantitative).toBe(false);
        });
      });

      describe("#anyLevelsQualitative", function() {
        it("should be true if any level is qualitative", function() {
          var levels = ["foo", "ordinal", "quantitative", "bar"];
          var MyMapping = Mapping.extend({type: {levels: levels}});

          expect(MyMapping.type.anyLevelsQualitative).toBe(true);

          levels = ["nominal", "bar"];
          MyMapping = Mapping.extend({type: {levels: levels}});

          expect(MyMapping.type.anyLevelsQualitative).toBe(true);

          levels = ["nominal", "ordinal"];
          MyMapping = Mapping.extend({type: {levels: levels}});

          expect(MyMapping.type.anyLevelsQualitative).toBe(true);
        });

        it("should be false if not any level is qualitative", function() {
          var levels = ["quantitative", "other", "foo"];
          var MyMapping = Mapping.extend({type: {levels: levels}});

          expect(MyMapping.type.anyLevelsQualitative).toBe(false);
        });
      });

      describe("#dataType", function() {
        it("should throw an error, when it is not a subtype of the dataType of the ancestor mapping type", function() {
          var dataTypeA = Complex.extend().type;
          var dataTypeB = Complex.extend().type;

          var BaseMapping = Mapping.extend({
            type: {
              levels: ["nominal"],
              dataType: dataTypeA
            }
          });

          function deriveToNonSubDataType() {
            BaseMapping.extend({type: {dataType: dataTypeB}});
          }

          expect(deriveToNonSubDataType).toThrow(errorMatch.argInvalid("dataType"));
        });

        it("should accept a dataType that is a subtype of the dataType of the ancestor mapping type", function() {
          var Parent = Complex.extend();
          var parentDataType = Parent.type;
          var childDataType = Parent.extend().type;

          var BaseMapping = Mapping.extend({
            type: {
              levels: ["nominal"],
              dataType: parentDataType
            }
          });

          var DerivedMapping = BaseMapping.extend({type: {dataType: childDataType}});

          expect(DerivedMapping.type.dataType).toBe(childDataType);
        });

        it("should inherit the dataType of the ancestor mapping type, when unspecified", function() {
          var expectedDataType = Complex.extend().type;
          var BaseMapping = Mapping.extend({
            type: {
              levels: ["nominal"],
              dataType: expectedDataType
            }
          });
          var DerivedMapping = BaseMapping.extend();

          expect(DerivedMapping.type.dataType).toBe(expectedDataType);
        });

        it("should ignore the operation, when dataType is set to a Nully value", function() {
          var expectedDataType = Complex.extend().type;

          var BaseMapping = Mapping.extend({
            type: {
              levels: ["nominal"],
              dataType: expectedDataType
            }
          });

          BaseMapping.type.dataType = null;

          expect(BaseMapping.type.dataType).toBe(expectedDataType);

          BaseMapping.type.dataType = undefined;

          expect(BaseMapping.type.dataType).toBe(expectedDataType);
        });

        // coverage
        it("should allow setting to the same type", function() {
          var expectedDataType = Complex.extend().type;

          var BaseMapping = Mapping.extend({
            type: {
              levels: ["nominal"],
              dataType: expectedDataType
            }
          });

          BaseMapping.type.dataType = expectedDataType;

          expect(BaseMapping.type.dataType).toBe(expectedDataType);
        });

        it("should throw, when set and the mapping type already has descendants", function() {
          var BaseMapping = Mapping.extend({type: {levels: ["nominal", "ordinal"]}});
          var DerivedMapping = BaseMapping.extend();

          var dataTypeA = Complex.extend().type;

          function setDataType() {
            BaseMapping.type.dataType = dataTypeA;
          }

          expect(setDataType).toThrow(errorMatch.operInvalid());
        });

        it("should resolve values through the context", function() {
          var BaseMapping = Mapping.extend({type: {levels: ["nominal", "ordinal"]}});

          BaseMapping.type.dataType = "complex";

          expect(BaseMapping.type.dataType).toBe(Complex.type);
        });

        it("should be pentaho.type.Value, at root mapping type", function() {
          expect(Mapping.type.dataType).toBe(Value.type);
        });

        it("should throw, when set to a data type that is inherently qualitative and " +
           "one of the role's levels is quantitative", function() {
          var BaseMapping = Mapping.extend({type: {levels: ["quantitative"]}});

          // Test
          function extendMapping() {
            BaseMapping.extend({type: {dataType: "string"}});
          }

          expect(extendMapping).toThrow(errorMatch.argInvalid("dataType"));
        });
      });

      describe("#isVisualKey", function() {

        it("should have a root value of null", function() {
          expect(Mapping.type.isVisualKey).toBe(null);
        });

        it("should be undefined by default", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"]}});

          expect(DerivedMapping.type.isVisualKey).toBe(undefined);
        });

        it("should respect a specified boolean false value", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"], isVisualKey: false}});

          expect(DerivedMapping.type.isVisualKey).toBe(false);
        });

        it("should respect a specified boolean true value", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"], isVisualKey: true}});

          expect(DerivedMapping.type.isVisualKey).toBe(true);
        });

        it("should consider as true a specified truthy value", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"], isVisualKey: 1}});

          expect(DerivedMapping.type.isVisualKey).toBe(true);
        });

        it("should consider as false a specified falsey, non-nully value", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"], isVisualKey: 0}});

          expect(DerivedMapping.type.isVisualKey).toBe(false);
        });

        it("should ignore a specified null value", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"], isVisualKey: null}});

          expect(DerivedMapping.type.isVisualKey).toBe(undefined);
        });

        it("should ignore a specified undefined value", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"], isVisualKey: undefined}});

          expect(DerivedMapping.type.isVisualKey).toBe(undefined);
        });

        it("should ignore setting to an undefined value", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"], isVisualKey: true}});

          expect(DerivedMapping.type.isVisualKey).toBe(true);

          DerivedMapping.type.isVisualKey = undefined;

          expect(DerivedMapping.type.isVisualKey).toBe(true);
        });

        it("should ignore setting to a null value", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"], isVisualKey: true}});

          expect(DerivedMapping.type.isVisualKey).toBe(true);

          DerivedMapping.type.isVisualKey = null;

          expect(DerivedMapping.type.isVisualKey).toBe(true);
        });

        it("should respect setting to the value true", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"]}});

          DerivedMapping.type.isVisualKey = true;

          expect(DerivedMapping.type.isVisualKey).toBe(true);
        });

        it("should respect setting to the value false", function() {
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"]}});

          DerivedMapping.type.isVisualKey = false;

          expect(DerivedMapping.type.isVisualKey).toBe(false);
        });

        it("should allow specifying a function", function() {
          var fIsKey = function() { return true; };
          var DerivedMapping = Mapping.extend({type: {levels: ["quantitative"], isVisualKey: fIsKey}});

          expect(DerivedMapping.type.isVisualKey).toBe(fIsKey);
        });
      });
    });
  });

  describe("pentaho.visual.role.NominalMapping", function() {
    var NominalMapping;

    beforeEach(function () {
      var context = new Context();
      NominalMapping = context.get(nominalFactory);
    });

    describe(".Type", function() {
      it("should have levels [nominal]", function() {
        var levels = NominalMapping.type.levels;
        expect(levels.toArray(getValue)).toEqual(["nominal"]);
      });
    });

    it("should be able to create an instance", function() {
      var mapping = new NominalMapping();
      expect(mapping instanceof NominalMapping).toBe(true);
    });
  });

  describe("pentaho.visual.role.OrdinalMapping", function() {
    var OrdinalMapping;

    beforeEach(function () {
      var context = new Context();
      OrdinalMapping = context.get(ordinalFactory);
    });

    describe(".Type", function() {
      it("should have levels [ordinal]", function() {
        var levels = OrdinalMapping.type.levels;
        expect(levels.toArray(getValue)).toEqual(["ordinal"]);
      });
    });

    it("should be able to create an instance", function() {
      var mapping = new OrdinalMapping();
      expect(mapping instanceof OrdinalMapping).toBe(true);
    });
  });

  describe("pentaho.visual.role.QuantitativeMapping", function() {
    var QuantitativeMapping;

    beforeEach(function () {
      var context = new Context();
      QuantitativeMapping = context.get(quantitativeFactory);
    });

    describe(".Type", function() {
      it("should have levels [quantitative]", function() {
        var levels = QuantitativeMapping.type.levels;
        expect(levels.toArray(getValue)).toEqual(["quantitative"]);
      });
    });

    it("should be able to create an instance", function() {
      var mapping = new QuantitativeMapping();
      expect(mapping instanceof QuantitativeMapping).toBe(true);
    });
  });
});
