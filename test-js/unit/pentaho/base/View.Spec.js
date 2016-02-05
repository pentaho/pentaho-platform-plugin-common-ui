define([
  "pentaho/visual/base/View"
], function(View) {
  "use strict";

  describe("pentaho/visual/base/View", function() {
    var view, element;
    beforeEach(function() {
      element = document.createElement("div");
      view = new View(element, {});
    });
    it("validates a DOM element", function() {
      expect(function() {
        return new View(element, {});
      }).not.toThrow();
      expect(function() {
        return new View({}, {});
      }).toThrow();
      expect(function() {
        return new View(null);
      }).toThrow();
      expect(function() {
        return new View(undefined, {});
      }).toThrow();
    });
    it("can not be rendered", function() {
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