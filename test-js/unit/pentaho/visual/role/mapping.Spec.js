define([
  "tests/pentaho/util/errorMatch",
  "pentaho/type/Context",
  "pentaho/type/complex",
  "pentaho/visual/base",
  "pentaho/type/value",
  "pentaho/visual/role/mapping",
  "pentaho/visual/role/mappingAttribute"
], function(errorMatch, Context, complexFactory, visualModelFactory, valueFactory, mappingFactory, attributeFactory) {
  "use strict";

  describe("pentaho.visual.role.Mapping", function() {
    var Complex, Value, Mapping, Attribute, VisualModel;

    beforeEach(function () {
      var context = new Context();
      Complex = context.get(complexFactory);
      Value = context.get(valueFactory);
      Mapping = context.get(mappingFactory);
      Attribute = context.get(attributeFactory);
      VisualModel = context.get(visualModelFactory);
    });

    /**
     * Creates a visual model that has a property visualRole with the given mapping of type Mapping
     */
    function createVisualModelAndMapping(Mapping) {
      var DerivedVisualModel = VisualModel.extend({type: {
        props: [{name: "visualRole", type: Mapping }]
      }});
      var visualModel = new DerivedVisualModel();

      return visualModel;
    }

    function assertIsValid(complex) {
      // this way, errors are shown in the console...
      expect(complex.validate()).toBe(null);
    }

    function assertIsInvalid(complex) {
      expect(complex.isValid).toBe(false);
    }

    function assertEqualSet( arrayA, arrayB ) {
      expect(arrayA.length).toBe(arrayB.length);
      for(var i = 0; i < arrayA.length; i++ ) {
        expect(arrayA[i]).toEqual(arrayB[i]);
      }
    }

    function getValue( object ) {
      return object.value;
    }

    describe("#levelEffective", function () {
      it("should be equal to the auto level when the level is null", function () {
        var BaseMapping = Mapping.extend({ type: { levels: ["nominal", "ordinal"]}});

        // make sure that the mapping has a model
        var model = createVisualModelAndMapping(BaseMapping);
        var mapping = model.visualRole;

        // Assumptions
        expect(mapping.level).toBe(null);

        // Test
        var autoLevel = mapping.levelAuto;
        var levelEffective = mapping.levelEffective;
        expect(levelEffective).toEqual(autoLevel);

      });

      it("should be equal to the level, when the level is not null", function () {
        var BaseMapping = Mapping.extend({ type: { levels: ["nominal", "ordinal"]}});
        var model = createVisualModelAndMapping(BaseMapping);
        var mapping = model.visualRole;

        var expectedEffectiveLevel = "nominal";
        mapping.level = expectedEffectiveLevel;

        // Test
        var actualLevelEffective = mapping.levelEffective;
        expect(actualLevelEffective).toEqual(expectedEffectiveLevel);

      });

    });

    describe("#levelAuto", function () {
      it("is undefined, when the mapping is valid and empty", function() {
        var ValidMapping = Mapping.extend( {
          type: {
            levels: ["nominal"]
          }
        });

        var model = createVisualModelAndMapping(ValidMapping);
        var mapping = model.visualRole;

        // Assumptions
        assertIsValid(mapping);
        expect(mapping.attributes.count).toEqual(0);

        // Test
        expect(mapping.levelAuto).toBeUndefined();
      });

      it("is undefined, when the mapping is not empty and is invalid", function() {
        var InvalidMapping = Mapping.extend( {
          type: {
            levels: ["nominal"],
            props: [
              {name: "bananas", isRequired: true}
            ]
          }
        });

        var mapping = new InvalidMapping();
        var mappingAttribute = new Attribute();
        mapping.attributes.add(mappingAttribute);

        // Assumptions
        expect(mapping.attributes.count).toBeGreaterThan(0);
        assertIsInvalid(mapping);

        // Test
        expect(mapping.levelAuto).toBeUndefined();
      });

      it("when more than one measurement level could be used, the auto level returns the _highest_ measurement level", function() {
        fail();
      });

    });

    describe("validation", function () {

      it("A mapping is invalid when its level is set to a value that does not belong to the levels", function () {
        var DerivedMapping = Mapping.extend( {
          type: {
            levels: ["nominal"]
          }
        });

        var mapping = new DerivedMapping();
        mapping.level = "ordinal";

        // Test
        assertIsInvalid(mapping);
      });

    });

    describe(".Type", function () {

      describe("#levels", function () {
        it("are set when set", function() {
          var expectedLevels = ["nominal", "ordinal"];
          var MyMapping = Mapping.extend({type: {levels: expectedLevels}});

          var actualLevels = MyMapping.type.levels.toArray(getValue);

          expect(actualLevels).toEqual(expectedLevels);
        });

        it("should throw when a non-abstract mapping does not support any measurement level", function () {
          function defineEmptyLevelsMapping() {
            Mapping.extend( { type: { levels: [] } });
          }

          expect(defineEmptyLevelsMapping).toThrow(errorMatch.argRequired("levels"));
        });

        it("should not throw when an abstract mapping does not support any measurement level", function () {
          function defineAbstractEmptyLevelsMapping() {
            Mapping.extend({type: {isAbstract: true}});
          }

          expect(defineAbstractEmptyLevelsMapping).not.toThrow(errorMatch.argRequired("levels"));
        });

        it("a visual role definition can add support for new measurement levels", function () {
          var baseLevels = ["nominal"];
          var extendedLevels = baseLevels.concat("ordinal");

          var BaseMapping = Mapping.extend( { type: { levels: baseLevels } });
          var ExtendedMapping = BaseMapping.extend( { type: { levels: extendedLevels } } );

          expect(ExtendedMapping.type.levels.toArray(getValue)).toEqual(extendedLevels);
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

        it("setting levels always adds to the levels of the parent mapping", function() {
          var baseLevels = ["nominal"];
          var BaseMapping = Mapping.extend({type: {levels: baseLevels}});

          var addLevels = ["ordinal"];
          var DerivedMapping = BaseMapping.extend({type: {levels: addLevels}});

          var expectedLevels = baseLevels.concat(addLevels);
          var actualLevels = DerivedMapping.type.levels.toArray(getValue);
          assertEqualSet(expectedLevels, actualLevels);
        });

        it("a visual role definition cannot remove support for a measurement level supported by its ancestors", function () {
          var baseLevels = ["nominal", "ordinal"];
          var BaseMapping = Mapping.extend( { type: { levels: baseLevels } });

          var constrainedLevels = [baseLevels[0]];
          var DerivedMapping = BaseMapping.extend( { type: { levels: constrainedLevels } } );

          var actualLevels = DerivedMapping.type.levels.toArray(getValue);
          expect(actualLevels.length).toBe(2);
          expect(actualLevels).toContain("nominal");
          expect(actualLevels).toContain("ordinal");

        });

        it("when a visual role definition does not specify the measurement levels, it inherits the ones of its parent visual role definition", function () {
          var baseLevels = ["nominal", "ordinal"];
          var BaseMapping = Mapping.extend( { type: { levels: baseLevels }} );
          var DerivedMapping = BaseMapping.extend();

          var derivedLevels = DerivedMapping.type.levels.toArray(getValue);

          expect(derivedLevels).toEqual(baseLevels);
        });

        it("???", function () {
          /* The first set local value must respect the _monotonicity_ property with the inherited value.*/
          fail();
        });

        describe("when levels is set to a Nully value, the operation is ignored", function() {
          function assertNopOnNullyValue(nullyValue) {
            var expectedLevels = ["nominal", "ordinal"];
            var MyMapping = Mapping.extend( { type: { levels: expectedLevels }} );

            MyMapping.type.levels = nullyValue;
            var actualLevels = MyMapping.type.levels.toArray(getValue);

            expect(actualLevels).toEqual(expectedLevels);
          }

          it("when levels is set to null, the operation is ignored", function () {
            assertNopOnNullyValue(null);
          });

          it("when levels is set to undefined, the operation is ignored", function () {
            assertNopOnNullyValue(undefined);
          });
        });

        it("when levels is set and the visual role definition already has descendants, an error is thrown.", function () {
          var BaseMapping = Mapping.extend({ type: { levels: ["ordinal"] }});
          var DerivedMapping = BaseMapping.extend();

          function setLevels() {
            BaseMapping.type.levels = ["nominal"];
          }

          expect(setLevels).toThrow(errorMatch.operInvalid());
        });

        it("the root visual role definition has no measurement levels defined", function () {
          expect(Mapping.type.levels.count).toEqual(0);
        });

      });

      describe("dataType", function () {
        it("when the dataType is not a subtype of the dataType of the parent visual role definition, then an error is thrown", function () {
          var dataTypeA = Complex.extend().type;
          var dataTypeB = Complex.extend().type;

          var BaseMapping = Mapping.extend({
            type: {
              levels: ["nominal"],
              dataType: dataTypeA
            }
          });

          function deriveToNonSubDataType() {
            BaseMapping.extend( {type: {dataType: dataTypeB}});
          }

          expect(deriveToNonSubDataType).toThrow(errorMatch.argInvalid("dataType"));
        });

        it("a dataType can be a subtype of the dataType of the parent visual role definition", function () {
          var Parent = Complex.extend();
          var parentDataType = Parent.type;
          var childDataType = Parent.extend().type;

          var BaseMapping = Mapping.extend({
            type: {
              levels: ["nominal"],
              dataType: parentDataType
            }
          });
          var DerivedMapping = BaseMapping.extend( { type: { dataType: childDataType }});

          expect(DerivedMapping.type.dataType).toBe(childDataType);
        });


        it("when a visual role definition does not specify the supported dataType, it inherits the one defined in its parent visual role definition", function () {
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

        it("???", function () {
          /* The first set local value must respect the _monotonicity_ property with the inherited value.*/
          fail();
        });

        it("when dataType is set to a Nully value, the operation is ignored", function () {
          fail();
        });

        it("should throw when dataType is set and the visual role definition already has descendants", function () {
          var BaseMapping = Mapping.extend({type: {levels: ["nominal", "ordinal"]}});
          var DerivedMapping = BaseMapping.extend();

          function setDataType() {
            BaseMapping.type.dataType = "string";
          }

          expect(setDataType).toThrow(errorMatch.operInvalid());
        });

        it("???", function() {
          /*
          * Otherwise, the set value is assumed to be an [spec.UTypeReference]{@link pentaho.type.spec.UTypeReference}
          * and is first resolved using [this.context.get]{@link pentaho.type.Context#get}.
          */
          fail();
        });

        it("should be pentaho.type.Value for the root visual role definition", function () {
          expect(Mapping.type.dataType).toBe(Value.type);
        });

        it("should throw when setting a data type that is inherently qualitative and " +
            "one of the measurement levels is quantitative", function() {
          var BaseMapping = Mapping.extend({type: {levels: ["quantitative"]}});

          // Test
          function extendMapping() {
            BaseMapping.extend({type: {dataType: "string"}});
          }

          expect(extendMapping).toThrow(errorMatch.argInvalid("dataType"));
        });

      });

    });
  });
});
