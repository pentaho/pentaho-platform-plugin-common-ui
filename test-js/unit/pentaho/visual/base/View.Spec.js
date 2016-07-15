define([
  "pentaho/visual/base/View",
  "pentaho/visual/base",
  "pentaho/type/Context",
  "pentaho/type/events/DidChange",
  "tests/test-utils",
  "tests/pentaho/util/errorMatch"
], function(View, modelFactory, Context, DidChange,
            testUtils, errorMatch) {
  "use strict";

  /*global document:false*/

  describe("pentaho/visual/base/View", function() {
    var Model, model, listeners;

    beforeEach(function() {
      var dataTableSpec = {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "sales", type: "number", label: "Sales"}
        ],
        rows: [
          {c: [{v: "Portugal"}, {v: 12000}]},
          {c: [{v: "Ireland"}, {v: 6000}]}
        ]
      };
      var dataSpec = {
        width: 1,
        height: 1,
        data: {
          v: dataTableSpec
        }
      };
      var context = new Context();
      Model = context.get(modelFactory);
      model = new Model(dataSpec);

    });

    describe("the constructor ", function() {

      it("should throw if invoked with no arguments", function() {
        expect(function() {
          return new View();
        }).toThrow(errorMatch.argRequired("model"));

        expect(function() {
          return new View(model);
        }).not.toThrow();
      });

    });

    describe("validation: ", function() {

      it("should be valid if the model is valid", function(){
        var view = new View(model);
        expect(model.validate()).toBeNull(); //Null === no errors
        expect(view._isValid()).toBe(true);
      });

      it("should be invalid if the model is invalid", function(){
        var model = new Model();
        var view = new View(model);
        expect(model.validate()).not.toBeNull(); //Null === no errors
        expect(view._isValid()).toBe(false);
      });
    });

    describe("#update", function() {
      var view, element = document.createElement("div"), it = testUtils.itAsync;

      var DerivedView = View.extend({
        _update: function() {
          this._setDomNode(element);
          return "Rendered";
        }
      });

      var ValidationErrorView = DerivedView.extend({
        _validate: function(){ return ["Some error"]; }
      });

      var UpdateErrorView = View.extend({
        _update: function(){ throw new Error("Some error"); }
      });

      beforeEach(function() {
        view = null;

        listeners = jasmine.createSpyObj('listeners', [
          'didCreate',
          'willUpdate',
          'didUpdate',
          'rejectedUpdate'
        ]);

      });

      function createView(ViewClass) {
        view = new ViewClass(model);

        view.on("will:update", listeners.willUpdate);
        view.on("did:update", listeners.didUpdate);
        view.on("rejected:update", listeners.rejectedUpdate);

        view.on("did:create", listeners.didCreate);
      }

      function expectError(errorMessage, expectedMessage) {
        expect(listeners.didUpdate).not.toHaveBeenCalled();
        expect(expectedMessage).toBe(errorMessage);
      }

      function expectValidationError(errorMessage, expectedMessage) {
        expectError("View update was rejected:\n - " + expectedMessage, errorMessage);
      }

      it("should call the `will:update` event listener if the view is valid", function() {
        createView(DerivedView);
        
        return view.update().then(function() {
          expect(listeners.willUpdate).toHaveBeenCalled();
        });
      });

      it("should call the `did:update` event listener if the view is valid and called `_update", function() {
          createView(DerivedView);
          spyOn(view, '_update').and.callThrough();

          return view.update().then(function() {
            expect(view._update).toHaveBeenCalled();
            expect(listeners.didUpdate).toHaveBeenCalled();
          });
        });

      it("should not call the `will:update` event listener if the view is invalid", function() {
        createView(ValidationErrorView);

        return view.update().then(function() {
          expect(listeners.didUpdate).not.toHaveBeenCalled();
        }, function() {
          expect(listeners.didUpdate).not.toHaveBeenCalled();
          expect(listeners.willUpdate).toHaveBeenCalled();
        });
      });

      it("should call the `rejected:update` event listener if the view `will:update` event is canceled", function() {
          createView(DerivedView);

          listeners.willUpdate.and.callFake(function(event) {
            event.cancel("I was canceled");
          });

          return view.update().then(function() {
            expect(listeners.didUpdate).not.toHaveBeenCalled();
          }, function (reason) {
            expectError(reason.message, "I was canceled");
            expect(listeners.rejectedUpdate).toHaveBeenCalled();
          });
        });

      it("should call the `rejected:update` event listener if the view is invalid", function() {
        createView(ValidationErrorView);

        return view.update().then(function() {
          expect(listeners.didUpdate).not.toHaveBeenCalled();
        }, function(reason) {
          expectValidationError(reason.message, "Some error");
          expect(listeners.rejectedUpdate).toHaveBeenCalled();
        });
      });

      it("should call the `rejected:update` event listener if `_update` throws", function() {
        createView(UpdateErrorView);

        return view.update().then(function() {
          expect(listeners.didUpdate).not.toHaveBeenCalled();
        }, function(reason) {
          expectError(reason.message, "Some error");
          expect(listeners.rejectedUpdate).toHaveBeenCalled();
        });
      });

      it("should invoke `_update` if the view is valid", function() {
        createView(DerivedView);

        spyOn(view, '_update').and.callThrough();

        return view.update().then(function() {
          expect(view._update).toHaveBeenCalled();
        });
      });

      it("should create the visualization DOM element if the view is valid", function() {
        createView(DerivedView);
        spyOn(view, '_setDomNode').and.callThrough();

        expect(view.domNode).toBeNull();
        return view.update().then(function() {
          expect(view._setDomNode).toHaveBeenCalled();
          expect(view.domNode instanceof HTMLElement).toBe(true);
        });

      });

      it("should emit a 'did:create' event before the first update", function() {
        createView(DerivedView);
        
        var created = false, updated = false;
        listeners.didCreate.and.callFake(function() {
          created = true;
          expect(updated).toBe(false);
        });

        listeners.didUpdate.and.callFake(function() {
          updated = true;
          expect(created).toBe(true);
        });

        return view.update().then(function() {
          expect(created).toBe(true);
          expect(updated).toBe(true);
        });

      });

      it("should not create the visualization DOM element if the view is invalid", function() {
        createView(ValidationErrorView);
        spyOn(view, '_setDomNode').and.callThrough();

        return view.update().then(function() {
          expect(listeners.didUpdate).not.toHaveBeenCalled();
        }, function(reason) {
          expectValidationError(reason.message, "Some error");
          expect(view._setDomNode).not.toHaveBeenCalled();
          expect(view.domNode).toBeNull();
        });

      });

      it("should not let the visualization's DOM element be set more than once", function() {
        createView(DerivedView);

        var element = document.createElement("div");
        view._setDomNode(element);
        expect(view.domNode).toBe(element);
        expect(function() {
          view._setDomNode(document.createElement("span"));
        }).toThrowError("Can't change the visualization dom node once it is set.");

      });

      it("should not emit a 'did:create' event if the view is invalid", function() {
        createView(ValidationErrorView);

        return view.update().then(function() {
          expect(listeners.didUpdate).not.toHaveBeenCalled();
        }, function(reason) {
          expectValidationError(reason.message, "Some error");
        });

      });

      it("should not emit a 'did:create' event if `_validate` throws", function() {
        createView(ValidationErrorView);

        return view.update().then(function() {
          expect(listeners.didUpdate).not.toHaveBeenCalled();
        }, function(reason) {
          expectValidationError(reason.message, "Some error");
        });

      });
    });

    describe("#_onChange", function(){
      var view, _resize, _update, _selectionChanged;
      beforeEach(function(){
        view = new View(model);
        _resize = spyOn(view, "_resize");
        _selectionChanged = spyOn(view, "_selectionChanged");
        _update = spyOn(view, "_update");
      });

      it("triggers #_resize when only 'height' changes", function(){
        model.height = 100;

        expect(_resize).toHaveBeenCalled();
        expect(_selectionChanged).not.toHaveBeenCalled();
        expect(_update).not.toHaveBeenCalled();
      });

      it("triggers #_resize when only 'width' changes", function(){
        model.width = 100;

        expect(_resize).toHaveBeenCalled();
        expect(_selectionChanged).not.toHaveBeenCalled();
        expect(_update).not.toHaveBeenCalled();
      });

      it("triggers #_selectionChanged when 'selectionFilter' changes", function(){
        model.selectionFilter = null;

        expect(_resize).not.toHaveBeenCalled();
        expect(_selectionChanged).toHaveBeenCalled();
        expect(_update).not.toHaveBeenCalled();
      });

      it("does not trigger any render method when 'selectionMode' changes", function(){
        model.selectionMode = null;

        expect(_resize).not.toHaveBeenCalled();
        expect(_selectionChanged).not.toHaveBeenCalled();
        expect(_update).not.toHaveBeenCalled();
      });

      it("triggers #_update when a property other than 'height', 'width' or 'selectionFilter' changes", function(){
        model.isInteractive = false;

        expect(_resize).not.toHaveBeenCalled();
        expect(_selectionChanged).not.toHaveBeenCalled();
        expect(_update).toHaveBeenCalled();
      });

    }); // #_onChange
  });

});
