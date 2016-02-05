define([
  "pentaho/visual/base/View"
], function(View) {
  "use strict";

  describe("pentaho/visual/base/View", function() {
    var element, dataSpec;

    beforeEach(function() {
      element = document.createElement("div");
      var data = {};
      dataSpec = {v: data};
    });

    describe("the constructor ", function() {

      it("should throw if not invoked with two arguments", function() {
        expect(function() {
          return new View();
        }).toThrowError(/required/);

        expect(function() {
          return new View(element);
        }).toThrowError(/required/);

        expect(function() {
          return new View(element, dataSpec);
        }).not.toThrow();
      });

      it("should throw if the first argument is not a DOM element", function() {
        [
          null, 1, true, {}, []
        ].forEach(function(elem) {

          expect(function() {
            return new View(elem, dataSpec);
          }).toThrowError(/Invalid/);
        });
      });

    });

    it("should not be renderable (returns a rejected promise when render() is called)", function() {
      var view = new View(element, dataSpec);
      view.render().then(function resolve() {
        return true;
      }, function reject() {
        return false;
      }).then(function(result) {
        expect(result).toBe(false);
        done();
      });
    });
  });

});