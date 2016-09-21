define([
  "pentaho/type/Context",
  "pentaho/visual/role/level"
], function(Context, levelFactory) {
  "use strict";

  describe("pentaho.visual.role.MeasurementLevel.Type", function() {

    var context, MeasurementLevel;

    beforeEach(function () {
      context = new Context();
      MeasurementLevel = context.get(levelFactory);
    });

    describe("#isQuantitative(level)", function() {
      it("should return false when given null", function() {
        expect(MeasurementLevel.type.isQuantitative(null)).toBe(false);
      });

      it("should return false when given undefined", function() {
        expect(MeasurementLevel.type.isQuantitative(null)).toBe(false);
      });

      it("should return true for the string 'quantitative'", function() {
        expect(MeasurementLevel.type.isQuantitative("quantitative")).toBe(true);
      });

      it("should return true for the pentaho.type.String 'quantitative'", function() {
        expect(MeasurementLevel.type.isQuantitative(new MeasurementLevel("quantitative"))).toBe(true);
      });

      it("should return false for other values", function() {
        expect(MeasurementLevel.type.isQuantitative(new MeasurementLevel("foo"))).toBe(false);
        expect(MeasurementLevel.type.isQuantitative("foo")).toBe(false);
      });
    });

    describe("#isQualitative(level)", function() {
      it("should return false when given null", function() {
        expect(MeasurementLevel.type.isQualitative(null)).toBe(false);
      });

      it("should return false when given undefined", function() {
        expect(MeasurementLevel.type.isQualitative(null)).toBe(false);
      });

      it("should return true for the string 'nominal'", function() {
        expect(MeasurementLevel.type.isQualitative("nominal")).toBe(true);
      });

      it("should return true for the string 'ordinal'", function() {
        expect(MeasurementLevel.type.isQualitative("ordinal")).toBe(true);
      });

      it("should return true for the pentaho.type.String 'nominal'", function() {
        expect(MeasurementLevel.type.isQualitative(new MeasurementLevel("nominal"))).toBe(true);
      });

      it("should return true for the pentaho.type.String 'ordinal'", function() {
        expect(MeasurementLevel.type.isQualitative(new MeasurementLevel("ordinal"))).toBe(true);
      });

      it("should return false for other values", function() {
        expect(MeasurementLevel.type.isQualitative(new MeasurementLevel("foo"))).toBe(false);
        expect(MeasurementLevel.type.isQualitative("foo")).toBe(false);
      });
    });

    describe("#isTypeQualitativeOnly(type)", function() {

      it("should return true for type string", function() {
        var type = context.get("string").type;
        expect(MeasurementLevel.type.isTypeQualitativeOnly(type)).toBe(true);
      });

      it("should return true for type boolean", function() {
        var type = context.get("boolean").type;
        expect(MeasurementLevel.type.isTypeQualitativeOnly(type)).toBe(true);
      });

      it("should return true for type complex", function() {
        var type = context.get("complex").type;
        expect(MeasurementLevel.type.isTypeQualitativeOnly(type)).toBe(true);
      });

      it("should return false for type number", function() {
        var type = context.get("number").type;
        expect(MeasurementLevel.type.isTypeQualitativeOnly(type)).toBe(false);
      });

      it("should return false for type date", function() {
        var type = context.get("date").type;
        expect(MeasurementLevel.type.isTypeQualitativeOnly(type)).toBe(false);
      });

      it("should return false for a subtype number", function() {
        var type = context.get("number").extend().type;
        expect(MeasurementLevel.type.isTypeQualitativeOnly(type)).toBe(false);
      });

      it("should return false for a subtype date", function() {
        var type = context.get("date").extend().type;
        expect(MeasurementLevel.type.isTypeQualitativeOnly(type)).toBe(false);
      });
    });

    describe("#compare(a, b)", function() {

      it("should return negative if only `a` is not a valid measurement level value", function() {
        expect(MeasurementLevel.type.compare("foo", "nominal")).toBeLessThan(0);
      });

      it("should return positive if only `b` is not a valid measurement level value", function() {
        expect(MeasurementLevel.type.compare("nominal", "foo")).toBeGreaterThan(0);
      });

      it("should return 0 if both `a` and `b` are not valid measurement level values", function() {
        expect(MeasurementLevel.type.compare("bar", "foo")).toBe(0);
      });

      it("should return 0 if `a` and `b` are equal valid measurement level values", function() {
        function expectIt(value) {
          expect(MeasurementLevel.type.compare(value, value)).toBe(0);
          expect(MeasurementLevel.type.compare(
              new MeasurementLevel(value),
              new MeasurementLevel(value))).toBe(0);
        }

        expectIt("nominal");
        expectIt("ordinal");
        expectIt("quantitative");
      });

      it("should return negative if `a` is nominal and `b` is ordinal", function() {
        function expectIt(a, b) {
          expect(MeasurementLevel.type.compare(a, b)).toBeLessThan(0);
          expect(MeasurementLevel.type.compare(new MeasurementLevel(a), new MeasurementLevel(b))).toBeLessThan(0);
        }

        expectIt("nominal", "ordinal");
      });

      it("should return negative if `a` is nominal and `b` is quantitative", function() {
        function expectIt(a, b) {
          expect(MeasurementLevel.type.compare(a, b)).toBeLessThan(0);
          expect(MeasurementLevel.type.compare(new MeasurementLevel(a), new MeasurementLevel(b))).toBeLessThan(0);
        }

        expectIt("nominal", "quantitative");
      });

      it("should return negative if `a` is ordinal and `b` is quantitative", function() {
        function expectIt(a, b) {
          expect(MeasurementLevel.type.compare(a, b)).toBeLessThan(0);
          expect(MeasurementLevel.type.compare(new MeasurementLevel(a), new MeasurementLevel(b))).toBeLessThan(0);
        }

        expectIt("ordinal", "quantitative");
      });
    });
  });
});
