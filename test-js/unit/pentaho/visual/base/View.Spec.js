define([
  "pentaho/visual/base/View",
  "pentaho/visual/base",
  "pentaho/type/Context"
], function(View, modelFactory, Context) {
  "use strict";

  describe("pentaho/visual/base/View", function() {
    var element, dataSpec, Model, model;

    beforeEach(function() {
      element = document.createElement("div");
      dataSpec = {
        width: 1,
        height: 1,
        data: {v: {}}
      };
      Model = modelFactory(new Context());
      model = new Model(dataSpec);
    });

    describe("the constructor ", function() {

      it("should throw if invoked with less than two arguments", function() {
        expect(function() {
          return new View();
        }).toThrowError("Argument required: 'element'.");

        expect(function() {
          return new View(element);
        }).toThrowError("Argument required: 'model'.");

        expect(function() {
          return new View(element, model);
        }).not.toThrow();
      });

      it("should throw if the first argument is not a DOM element", function() {
        [
          "div", 1, true, {}, []
        ].forEach(function(elem) {
          expect(function() {
            return new View(elem, model);
          }).toThrowError("Argument invalid: 'element'. Invalid type. Must be an HTMLElement.");
        });
      });

    });

    it("should not be renderable because the _render method is not implemented", function(done) {
      var view = new View(element, model);

      spyOn(view, '_validate').and.returnValue(null); //ensure the view is in a valid state

      view.render().then(function resolve() {
        return "it worked, but shouldn't have";
      }, function reject(reason) {
        return reason;
      }).then(function(result) {
        expect(result).toBe("Not Implemented. _render");
        done();
      });
    });

  });

});