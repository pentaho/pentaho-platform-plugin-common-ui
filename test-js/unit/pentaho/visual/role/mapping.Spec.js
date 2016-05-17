define([
  "tests/pentaho/util/errorMatch",
  "pentaho/type/Context",
  "pentaho/type/complex",
  "pentaho/visual/role/mapping",
  "pentaho/visual/role/mappingAttribute",
], function(errorMatch, Context, complexFactory, mappingFactory, attributeFactory) {
  "use strict";

  describe("pentaho.visual.role.Mapping", function() {
    var Complex, Mapping, Attribute;

    beforeEach(function () {
      var context = new Context();
      Complex = context.get(complexFactory);
      Mapping = context.get(mappingFactory);
      Attribute = context.get(attributeFactory);
    });

    function assertIsValid(complex) {
      // this way, errors are shown in the console...
      expect(complex.validate()).toBe(null);
    }

    function assertIsInvalid(complex) {
      expect(complex.isValid).toBe(false);
    }

    function getValue( object ) {
      return object.value;
    }

    describe("#levelEffective", function () {
      it("when the level is null, the effective level should be equal to the auto level", function () {
        /* When {@link pentaho.visual.role.Mapping#level} is not `null`,
        * that measurement level is returned.
        * Otherwise,
        * the value of {@link pentaho.visual.role.Mapping#levelAuto},
        * which can be `undefined`, is returned.
        */
        fail();
      });

      it("when the level is not null, the effective level should be equal to the level", function () {
        fail();
      });

    });

    describe("#levelAuto", function () {
      it("when a valid mapping is empty, the auto level is undefined", function() {
        var ValidMapping = Mapping.extend( {
          type: {
            levels: ["nominal"]
          }
        });
        var mapping = new ValidMapping();

        // Assumptions
        assertIsValid(mapping);
        expect(mapping.attributes.count).toEqual(0);

        // Test
        expect(mapping.levelAuto).toBeUndefined();
      });

      it("when a non-empty mapping is invalid, the auto level is undefined", function() {
        var InvalidMapping = Mapping.extend( {
          type: {
            levels: ["nominal"],
            props: [
              { name: "bananas", isRequired: true }
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
        it("set levels are set", function() {
          var MyMapping = Mapping.extend();

          var expectedLevels = ["nominal", "ordinal"];

          MyMapping.type.levels = expectedLevels;
          var actualLevels = MyMapping.type.levels.toArray(getValue);

          expect(actualLevels).toEqual(expectedLevels);
        });

        it("a non-abstract visual role needs to support at least one measurement level", function () {
          function defineEmptyLevelsMapping() {
            Mapping.extend( { type: { levels: [] } });
          }

          expect(defineEmptyLevelsMapping).toThrow(errorMatch.argInvalid("levels"));
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

        it("set levels is additive", function() {
          fail();
        });

        it("a visual role definition cannot remove support for a measurement level supported by its ancestors", function () {
          fail("Test no longer makes sense. Check...");
          // TODO: This test stopped making sens. Levels are additive
          var baseLevels = ["nominal", "ordinal"];
          var BaseMapping = Mapping.extend( { type: { levels: baseLevels } });

          var constrainedLevels = [baseLevels[0]];
          function extendMapping() {
            BaseMapping.extend( { type: { levels: constrainedLevels } } );
          }

          expect(extendMapping).toThrow(errorMatch.argInvalid("levels"));
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

          var BaseMapping = Mapping.extend({type: {dataType: dataTypeA}});

          function deriveToNonSubDataType() {
            BaseMapping.extend( {type: {dataType: dataTypeB}});
          }

          expect(deriveToNonSubDataType).toThrow(errorMatch.argInvalid("dataType"));
        });

        it("a dataType can be a subtype of the dataType of the parent visual role definition", function () {
          fail();
        });


        it("when a visual role definition does not specify the supported dataType, it inherits the one defined in its parent visual role definition", function () {
          fail();
        });

        it("???", function () {
          /* The first set local value must respect the _monotonicity_ property with the inherited value.*/

        });

        it("when dataType is set to a Nully value, the operation is ignored", function () {
          fail();
        });

        it("when dataType is set and the visual role definition already has descendants, an error is thrown.", function () {
          /* @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
           * [subtypes]{@link pentaho.type.Type#hasDescendants}.
           */
          fail();
        });

        it("???", function() {
          /*
          * Otherwise, the set value is assumed to be an [spec.UTypeReference]{@link pentaho.type.spec.UTypeReference}
          * and is first resolved using [this.context.get]{@link pentaho.type.Context#get}.
          */
          fail();
        });

        it("the root visual role definition has a dataType of pentaho.type.Value", function () {
          fail();
        });

        it("when the dataType removes support of a measurement level supported by the visual role definition ancestors, then an error is thrown", function () {
          fail();
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

      describe("levelsEffective", function() {

        // TODO: levels effective might be dropped
        it("a dataType constraints the effective levels", function() {
          fail();
        });

      });
    });
  });
});
