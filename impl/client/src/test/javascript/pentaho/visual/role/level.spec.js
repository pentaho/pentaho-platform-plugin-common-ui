define([
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  describe("pentaho.visual.role.Level.Type", function() {

    var context;
    var MeasurementLevel;

    beforeEach(function(done) {

      Context.createAsync()
          .then(function(_context) {
            context = _context;

            return context.getDependencyApplyAsync([
              "pentaho/visual/role/level"
            ], function(_MeasurementLevel) {
              MeasurementLevel = _MeasurementLevel;
            });
          })
          .then(done, done.fail);

    });

    describe("#isQuantitative(level)", function() {
      it("should return false when given null", function() {
        expect(MeasurementLevel.type.isQuantitative(null)).toBe(false);
      });

      it("should return false when given undefined", function() {
        expect(MeasurementLevel.type.isQuantitative(undefined)).toBe(false);
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
        expect(MeasurementLevel.type.isQualitative(undefined)).toBe(false);
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
  });
});
