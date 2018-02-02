define([
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  describe("pentaho.visual.role.Mode", function() {

    var context;
    var Mode;

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(_context) {
            context = _context;
            return context.getAsync("pentaho/visual/role/mode");
          })
          .then(function(_Mode) {
            Mode = _Mode;
          })
          .then(done, done.fail);

    });

    describe("new (spec)", function() {

      it("should be possible to create a Mode instance", function() {
        var mode = new Mode();
        expect(mode instanceof Mode).toBe(true);
      });

      describe("spec.dataType", function() {

        it("should have a default of Instance", function() {
          var mode = new Mode();
          expect(mode.dataType != null).toBe(true);
          expect(mode.dataType.id).toBe("pentaho/type/instance");
        });

        it("should respect and resolve a specified string value", function() {
          var mode = new Mode({dataType: "string"});
          expect(mode.dataType != null).toBe(true);
          expect(mode.dataType.id).toBe("pentaho/type/string");
        });

        it("should respect and resolve a specified instance constructor value", function() {
          var mode = new Mode({dataType: context.get("string")});
          expect(mode.dataType != null).toBe(true);
          expect(mode.dataType.id).toBe("pentaho/type/string");
        });

        it("should respect a specified type object", function() {
          var mode = new Mode({dataType: context.get("string").type});
          expect(mode.dataType != null).toBe(true);
          expect(mode.dataType.id).toBe("pentaho/type/string");
        });
      });

      describe("spec.isContinuous", function() {

        it("should have a default of false for the default dataType", function() {
          var mode = new Mode();
          expect(mode.isContinuous).toBe(false);
        });

        it("should have a default of true for the number dataType", function() {
          var mode = new Mode({dataType: "number"});
          expect(mode.isContinuous).toBe(true);
        });

        it("should have a default of true for the date dataType", function() {
          var mode = new Mode({dataType: "date"});
          expect(mode.isContinuous).toBe(true);
        });

        it("should have a default of false for the string dataType", function() {
          var mode = new Mode({dataType: "string"});
          expect(mode.isContinuous).toBe(false);
        });

        // specifically allows continuous for a datatype that cannot be continuous
        // because it is assumed that a later conversion can be made within the viz implementation.
        it("should respect a specified value of true for the string dataType", function() {
          var mode = new Mode({dataType: "string", isContinuous: true});
          expect(mode.isContinuous).toBe(true);
        });

        it("should respect a specified value of false for the number dataType", function() {
          var mode = new Mode({dataType: "number", isContinuous: false});
          expect(mode.isContinuous).toBe(false);
        });
      });
    });

    describe("$key", function() {

      it("should have a different key if same dataType and different isContinuous", function() {
        var modeA = new Mode({dataType: "number", isContinuous: false});
        var modeB = new Mode({dataType: "number", isContinuous: true});
        expect(modeA.$key).not.toBe(modeB.$key);
      });

      it("should have a different key if different dataType and same isContinuous", function() {
        var modeA = new Mode({dataType: "string", isContinuous: false});
        var modeB = new Mode({dataType: "number", isContinuous: false});
        expect(modeA.$key).not.toBe(modeB.$key);
      });

      it("should have a different key if different dataType and different isContinuous", function() {
        var modeA = new Mode({dataType: "string", isContinuous: false});
        var modeB = new Mode({dataType: "number", isContinuous: true});
        expect(modeA.$key).not.toBe(modeB.$key);
      });

      it("should have the same key if same dataType and same isContinuous", function() {
        var modeA = new Mode({dataType: "number", isContinuous: false});
        var modeB = new Mode({dataType: "number", isContinuous: false});
        expect(modeA.$key).toBe(modeB.$key);
      });
    });
  });
});
