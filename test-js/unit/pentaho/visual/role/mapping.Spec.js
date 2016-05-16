define([
  "pentaho/type/Context",
  "pentaho/visual/role/mapping",
  "pentaho/visual/role/level",
  "pentaho/visual/role/mappingAttribute",
  "tests/pentaho/util/errorMatch"
], function( Context, mappingFactory, levelFactory, attributeFactory, errorMatch ) {
  "use strict";

  describe("pentaho/visual/role", function() {
    var Mapping, Attribute;
    var context = new Context();

    beforeEach(function () {
      Mapping = context.get(mappingFactory);
      Attribute = context.get(attributeFactory);
    });

    function assertIsValid(complex) {
      expect(complex.validate()).toBeNull();
    }

    function assertIsInvalid(complex) {
      expect(complex.validate().length).toBeGreaterThan(0);
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

      it("when an non-empty mapping is invalid, the auto level is undefined", function() {
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

    describe("type", function () {

      describe("levels", function () {
        it("a non-abstract visual role needs to support at least one measurement level", function () {
          function defineEmptyLevelsMapping() {
            Mapping.extend( { type: { levels: [] } });
          }

          expect(defineEmptyLevelsMapping).toThrow(errorMatch.argInvalid("levels"));
        });

        it("a visual role definition can add support for new measurement levels", function () {
          fail();
        });

        it("when a visual role definition adds support for a measurement level that is not contained in the set implicitly defined by the dataType, then an error is thrown", function () {
          fail();
        });

        it("a visual role definition cannot remove support for a measurement level supported by its ancestors", function () {
          fail();
        });

        it("when a visual role definition does not specify the measurement levels, it inherits the ones of its parent visual role definition", function () {
          fail();
        });

        it("???", function () {
          /* The first set local value must respect the _monotonicity_ property with the inherited value.*/
          fail();
        });

        it("when levels is set to a Nully value, the operation is ignored", function () {
          fail();
        });

        it("when levels is set and the visual role definition already has descendants, an error is thrown.", function () {
          /* @throws {pentaho.lang.OperationInvalidError} When setting and the type already has
           * [subtypes]{@link pentaho.type.Type#hasDescendants}.
           */
          fail();
        });

        it("the root visual role definition has no measurement levels defined", function () {
          fail();
        });


      });

      describe("dataType", function () {
        it("when the dataType is not a subtype of the dataType of the parent visual role definition, then an error is thrown", function () {
          /* @throws {pentaho.lang.ArgumentInvalidError} When setting to a _value type_ that is not a subtype
          * of the current _value type_.
          */
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
