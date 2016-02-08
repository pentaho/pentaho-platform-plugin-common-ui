define([
  "pentaho/type/Context",
  "pentaho/visual/base"
], function(Context, modelFactory) {
  "use strict";

  describe("pentaho/visual/base", function() {
    var context;
    var Model;
    var dataSpec;

    beforeEach(function() {
      context = new Context();
      Model = context.get(modelFactory);
      var data = {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "sales", type: "number", label: "Sales"}
        ],
        rows: [
          {c: [{v: "Portugal"}, {v: 12000}]},
          {c: [{v: "Ireland"}, {v: 6000}]}
        ]
      };
      dataSpec = {
        v: data
      };
    });

    it("can be instantiated with a well-formed spec", function() {
      expect(function() {
        return new Model({
          width: 1,
          height: 1,
          interactive: false,
          data: dataSpec
        });
      }).not.toThrowError();
    });

    it("can be instantiated without arguments", function() {
      expect(function() {
        return new Model();
      }).not.toThrowError();
    });

    it("cannot instantiate a modelSpec if one of its members has a value of the wrong type", function() {
      [{
        width: "nope",
        height: 1,
        interactive: false,
        data: dataSpec
      }, {
        width: 1,
        height: "nope",
        interactive: false,
        data: dataSpec
      }, {
        width: 1,
        height: 1,
        interactive: false,
        data: {}
      }].forEach(function(spec) {
        expect(function() {
          return new Model(spec);
        }).toThrow();
      });
    });

    describe("validates a model spec - ", function() {

      function specValidityShouldBe(spec, bool) {
        if(arguments.length !== 2) {
          throw Error("specValidityShouldBe was not invoked properly");
        }
        var model = new Model(spec);
        if(bool) {
          expect(model.validate()).toBeNull();
        } else {
          expect(model.validate()).not.toBeNull();
        }
      }

      function validSpec(spec) {
        specValidityShouldBe(spec, true);
      }

      function invalidSpec(spec) {
        specValidityShouldBe(spec, false);
      }

      it("a model spec is valid if all (declared) properties (required and optional) are properly defined", function() {
        validSpec({
          width: 1,
          height: 1,
          interactive: false,
          data: dataSpec
        });
      });

      it("a model spec is valid if all required properties are defined", function() {
        validSpec({
          width: 1,
          height: 1,
          data: dataSpec
        });
      });

      it("a model spec is invalid if at least one required property is omitted", function() {
        invalidSpec();
        invalidSpec({});
        invalidSpec({
          width: 1
        });
        invalidSpec({
          width: 1,
          height: 1
        });
        invalidSpec({
          width: 1,
          height: 1,
          interactive: true //optional
        });
      });

    });

  });

});
