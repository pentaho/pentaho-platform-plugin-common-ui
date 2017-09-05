/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
  "pentaho/data/Table",
  "pentaho/type/Context",
  "pentaho/type/events/DidChange",
  "tests/test-utils",
  "tests/pentaho/util/errorMatch"
], function(Table, Context, DidChange, testUtils, errorMatch) {

  "use strict";

  /* globals document, Promise, TypeError, spyOn, expect, jasmine, describe, it */

  /* eslint dot-notation: 0, max-nested-callbacks: 0 */

  var it = testUtils.itAsync;

  describe("pentaho.visual.base.View", function() {
    var View;
    var Model;
    var model;
    var dataTable;
    var context;

    beforeEach(function(done) {

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

      Context.createAsync()
          .then(function(_context) {
            context = _context;

            return context.applyAsync([
              "pentaho/visual/base/view",
              "pentaho/visual/base/model"
            ], function(BaseView, BaseModel) {

              View = BaseView;

              Model = BaseModel.extend(); // not abstract

              dataTable = new Table(dataTableSpec);
              model = new Model({data: dataTable});
            });
          })
          .then(done, done.fail);
    });

    describe("new (viewSpec)", function() {

      it("should be possible to invoke without arguments", function() {

        var view = new View();
        expect(view != null).toBe(true);
      });

      it("should be possible to specify viewSpec.domContainer", function() {

        var elem = document.createElement("div");
        var view = new View({domContainer: elem});
        expect(view.domContainer).toBe(elem);
      });

      it("should be possible to specify viewSpec.isAutoUpdate", function() {

        var view = new View({isAutoUpdate: false});
        expect(view.isAutoUpdate).toBe(false);

        view = new View({isAutoUpdate: true});
        expect(view.isAutoUpdate).toBe(true);
      });

      it("cannot instantiate a View with a spec if one of its members has a value of the wrong type", function() {
        [{
          width: "nope",
          height: 1,
          model: model
        }, {
          width: 1,
          height: "nope",
          model: model
        }, {
          width: 1,
          height: 1,
          model: true
        }].forEach(function(spec) {
          expect(function() {
            return new View(spec);
          }).toThrow();
        });
      });
    });

    describe("#domContainer", function() {

      it("should get null, initially", function() {
        var view = new View();

        expect(view.domContainer).toBe(null);
      });

      it("should get a set domContainer", function() {

        var view = new View();

        var element = document.createElement("div");

        view.domContainer = element;

        expect(view.domContainer).toBe(element);
      });

      it("should throw if set to null after set to an element", function() {

        var view = new View();

        var element = document.createElement("div");

        view.domContainer = element;

        expect(function() {
          view.domContainer = null;
        }).toThrow(errorMatch.argRequired("domContainer"));
      });

      it("should throw if set to another element", function() {

        var view = new View();

        var element = document.createElement("div");

        view.domContainer = element;

        expect(function() {
          view.domContainer = document.createElement("div");
        }).toThrow(errorMatch.operInvalid());
      });

      it("should call _initDomContainer when set to the first non-null value", function() {

        var view = new View();

        spyOn(view, "_initDomContainer").and.callThrough();

        var element = document.createElement("div");

        view.domContainer = element;

        expect(view._initDomContainer).toHaveBeenCalledTimes(1);
      });
    });

    it("should preload registered filter types", function() {

      return require.using(["pentaho/type/Context"], function(Context) {

        return Context.createAsync().then(function(context) {

          return context.applyAsync(["pentaho/visual/base/view"], function(BaseView) {

            context.get("pentaho/data/filter/or");
          });
        });
      });
    });

    describe("#selectionFilter", function() {

      it("should have a default selectionFilter", function() {
        var view = new View();
        var selectionFilter = view.selectionFilter;

        var AbstractFilter = context.get("pentaho/data/filter/abstract");
        expect(selectionFilter).toBeDefined();
        expect(selectionFilter instanceof AbstractFilter).toBe(true);
      });
    });

    describe("#update()", function() {

      describe("Will phase", function() {

        function createView() {
          var view = new View({
            width: 100,
            height: 100,
            domContainer: document.createElement("div"),
            model: model
          });

          // Silence these
          spyOn(view, "__onUpdateDidOuter");
          spyOn(view, "__onUpdateRejectedOuter").and.callFake(function(error) { return Promise.reject(error); });
          spyOn(view, "__updateLoop").and.returnValue(Promise.resolve());

          spyOn(view, "_onUpdateWill");

          return view;
        }

        it("should call the '_onUpdateWill' method before the update loop", function() {

          var view = createView();

          view.__updateLoop.and.callFake(function() {

            expect(view._onUpdateWill).toHaveBeenCalledTimes(1);

            return Promise.resolve();
          });

          return view.update().then(function() {
            expect(view.__updateLoop).toHaveBeenCalledTimes(1);
            expect(view._onUpdateWill).toHaveBeenCalledTimes(1);
          });
        });

        it("should reject the update and not perform the update loop if '_onUpdateWill' returns an error", function() {

          var view = createView();

          var errorWill = new Error();

          view._onUpdateWill.and.returnValue(errorWill);

          return view.update().then(function() {
            fail("Expected update to have been rejected.");
          }, function(reason) {
            expect(view.__updateLoop).not.toHaveBeenCalled();
            expect(reason).toBe(errorWill);
          });
        });

        it("should reject the update and not perform the update loop if '_onUpdateWill' throws an error", function() {

          var view = createView();

          var errorWill = new Error();

          view._onUpdateWill.and.throwError(errorWill);

          return view.update().then(function() {
            fail("Expected update to have been rejected.");
          }, function(reason) {
            expect(view.__updateLoop).not.toHaveBeenCalled();
            expect(reason).toBe(errorWill);
          });
        });

        it("should emit the 'will:update' event from within the _onUpdateWill method", function() {

          var view = createView();

          var listener = jasmine.createSpy("will:update");
          view.on("will:update", listener);

          var originalMethod = View.prototype._onUpdateWill;

          view._onUpdateWill.and.callFake(function() {

            expect(listener).not.toHaveBeenCalled();

            var result = originalMethod.apply(this, arguments);

            expect(listener).toHaveBeenCalledTimes(1);

            return result;
          });

          return view.update().then(function() {
            expect(view._onUpdateWill).toHaveBeenCalled();
          });
        });

        it("should reject the update if the 'will:update' event is canceled", function() {

          var view = createView();

          view._onUpdateWill.and.callThrough();

          var cancelReason;
          var listener = jasmine.createSpy("will:update").and.callFake(function(event) {
            event.cancel("I was canceled");
            cancelReason = event.cancelReason;
          });

          view.on("will:update", listener);

          return view.update().then(function() {
            fail("Expected update to have been rejected.");
          }, function(reason) {
            expect(listener).toHaveBeenCalled();
            expect(cancelReason).toBe(reason);
          });
        });
      });

      describe("Update loop phase", function() {

        function createView() {

          var view = new View({
            width: 100,
            height: 100,
            domContainer: document.createElement("div"),
            model: model
          });

          // Silence these
          spyOn(view, "_onUpdateWill");
          spyOn(view, "__onUpdateDidOuter");

          spyOn(view, "__onUpdateRejectedOuter").and.callFake(function(error) { return Promise.reject(error); });
          spyOn(view, "__updateLoop").and.callThrough();
          spyOn(view, "_updateAll");

          return view;
        }

        it("should call '__updateLoop' when the update is not canceled in the will phase", function() {

          var view = createView();

          return view.update().then(function() {
            expect(view.__updateLoop).toHaveBeenCalled();
          });
        });

        it("should call 'validate', before selecting the partial update method", function() {

          var view = createView();

          spyOn(view, "validate");

          var originalMethod = view.__selectUpdateMethod;
          spyOn(view, "__selectUpdateMethod").and.callFake(function() {

            expect(view.validate).toHaveBeenCalled();

            return originalMethod.apply(this, arguments);
          });

          return view.update().then(function() {
            expect(view.__selectUpdateMethod).toHaveBeenCalled();
          });
        });

        it("should reject the update if 'validate' returns errors", function() {

          var view = createView();

          var errors = [new Error("<A>"), new Error("<B>")];

          spyOn(view, "validate").and.returnValue(errors);

          return view.update().then(function() {
            fail("Expected update to have been rejected.");
          }, function(reason) {
            expect(reason.message).toContain("<A>");
            expect(reason.message).toContain("<B>");
          });
        });

        it("should select a partial update method if '__validate' returns no errors", function() {

          var view = createView();

          spyOn(view, "__selectUpdateMethod").and.callThrough();

          return view.update().then(function() {
            expect(view.__selectUpdateMethod).toHaveBeenCalled();
          });
        });

        it("should call the selected partial update method", function() {

          var view = createView();

          view._updateFoo = jasmine.createSpy("_updateFoo");
          spyOn(view, "__selectUpdateMethod").and.returnValue({name: "_updateFoo", mask: -1});

          return view.update().then(function() {
            expect(view._updateFoo).toHaveBeenCalled();
            expect(view._updateAll).not.toHaveBeenCalled();
          });
        });

        it("should allow returning nothing from the selected partial update method", function() {

          var view = createView();

          return view.update();
        });

        it("should allow returning a fulfilled promise from the selected partial update method", function() {

          var view = createView();

          view._updateAll.and.returnValue(Promise.resolve());

          return view.update();
        });

        it("should reject the update when a selected partial update method returns a rejected promise", function() {

          var view = createView();

          view._updateAll.and.returnValue(Promise.reject(new Error()));

          return view.update().then(function() {
            fail("Expected update to have been rejected.");
          }, function() {
            // Success. Swallow rejection.
          });
        });
      });

      describe("Did phase", function() {

        function createView() {

          var view = new View({
            width: 100,
            height: 100,
            domContainer: document.createElement("div"),
            model: model
          });

          // Silence these
          spyOn(view, "_onUpdateWill");
          spyOn(view, "_onUpdateDid");

          spyOn(view, "__onUpdateRejectedOuter").and.callFake(function(error) {
            this.__updatingPromise = null;
            return Promise.reject(error);
          });
          spyOn(view, "__updateLoop").and.returnValue(Promise.resolve());

          return view;
        }

        it("should call _onUpdateDid if the update succeeds", function() {

          var view = createView();

          return view.update().then(function() {
            expect(view._onUpdateDid).toHaveBeenCalled();
          });
        });

        it("should not call _onUpdateDid if the update is rejected", function() {

          var view = createView();
          view.__updateLoop.and.returnValue(Promise.reject(new Error("Failed")));

          return view.update().then(function() {
            fail("Expected update to have been rejected.");
          }, function() {
            expect(view._onUpdateDid).not.toHaveBeenCalled();
          });
        });

        it("should call _onUpdateDid after the update loop", function() {

          var view = createView();

          view.__updateLoop.and.callFake(function() {
            expect(view._onUpdateDid).not.toHaveBeenCalled();
            return Promise.resolve();
          });

          return view.update().then(function() {
            expect(view.__updateLoop).toHaveBeenCalledTimes(1);
          });
        });

        it("should fulfill the update even if '_onUpdateDid' throws an error", function() {

          console.log("TEST: expect console error.");
          var view = createView();

          view._onUpdateDid.and.throwError(new Error());

          return view.update();
        });

        it("should emit the 'did:update' event from within the _onUpdateDid method", function() {

          var view = createView();

          var listener = jasmine.createSpy("did:update");
          view.on("did:update", listener);

          var originalMethod = View.prototype._onUpdateDid;

          view._onUpdateDid.and.callFake(function() {

            expect(listener).not.toHaveBeenCalled();

            var result = originalMethod.apply(this, arguments);

            expect(listener).toHaveBeenCalledTimes(1);

            return result;
          });

          return view.update().then(function() {
            expect(view._onUpdateDid).toHaveBeenCalled();
          });
        });
      });

      describe("Rejected phase", function() {

        function createView() {

          var view = new View({
            width: 100,
            height: 100,
            domContainer: document.createElement("div"),
            model: model
          });

          // Silence these
          spyOn(view, "_onUpdateWill");
          spyOn(view, "__updateLoop").and.returnValue(Promise.reject(new Error("Failed")));
          spyOn(view, "_onUpdateRejected").and.callThrough();
          spyOn(view, "__onUpdateDidOuter").and.callFake(function() {
            this.__updatingPromise = null;
          });
          return view;
        }

        it("should call _onUpdateRejected if the update is rejected", function() {

          var view = createView();

          return view.update().then(function() {
            fail("Expected update to have been rejected.");
          }, function() {
            expect(view._onUpdateRejected).toHaveBeenCalled();
          });
        });

        it("should not call _onUpdateRejected if the update is fulfilled", function() {

          var view = createView();
          view.__updateLoop.and.returnValue(Promise.resolve());

          return view.update().then(function() {
            expect(view._onUpdateRejected).not.toHaveBeenCalled();
          });
        });

        it("should call _onUpdateRejected after the update loop", function() {

          var view = createView();

          view.__updateLoop.and.callFake(function() {
            expect(view._onUpdateRejected).not.toHaveBeenCalled();
            return Promise.reject(new Error("Failed."));
          });

          return view.update().then(function() {
            expect(view.__updateLoop).toHaveBeenCalled();
          }, function() {
            expect(view.__updateLoop).toHaveBeenCalled();
          });
        });

        it("should reject the update with the original error, even if '_onUpdateRejected' throws an error", function() {

          var error0 = new Error("Failed");
          var view = createView();
          view.__updateLoop.and.returnValue(Promise.reject(error0));

          view._onUpdateRejected.and.throwError(new Error());

          console.log("TEST: expect console error.");

          return view.update().then(function() {
            fail("Expected update to have been rejected.");
          }, function(reason) {
            expect(reason).toBe(error0);
          });
        });

        it("should emit the 'rejected:update' event from within the _onUpdateRejected method", function() {

          var view = createView();

          var listener = jasmine.createSpy("rejected:update");
          view.on("rejected:update", listener);

          var originalMethod = View.prototype._onUpdateRejected;

          view._onUpdateRejected.and.callFake(function() {

            expect(listener).not.toHaveBeenCalled();

            var result = originalMethod.apply(this, arguments);

            expect(listener).toHaveBeenCalledTimes(1);

            return result;
          });

          return view.update().then(function() {
            fail("Expected update to have been rejected.");
          }, function() {
            expect(view._onUpdateRejected).toHaveBeenCalled();
          });
        });
      });

      describe("Concurrency", function() {

        function createView() {
          return new View({
            width: 100,
            height: 100,
            domContainer: document.createElement("div"),
            model: model
          });
        }

        it("should be able to call update twice", function() {

          var view = createView();

          return view.update().then(function() {

            view.__dirtyPropGroups.set();

            return view.update();
          });
        });

        it("should return a promise to the current update when an update operation " +
           "is already undergoing (nested)", function() {

          var view = createView();

          var pDuring = null;

          spyOn(view, "_updateAll").and.callFake(function() {
            pDuring = view.update();
          });

          var pOuter = view.update();

          return pOuter.then(function() {
            expect(pOuter).toBe(pDuring);
          });
        });

        it("should return a promise to the current update when an update operation " +
           "is already undergoing (async)", function() {

          var view = createView();

          var _resolve = null;

          spyOn(view, "_updateAll").and.callFake(function() {
            return new Promise(function(resolve) { _resolve = resolve; });
          });

          var p = view.update();

          expect(p).toBe(view.update());

          _resolve();

          return p;
        });
      });
    });

    describe("#update (handling of dirty bits)", function() {
      var DerivedView;

      beforeEach(function() {

        DerivedView = View.extend({
          _updateSize: function() {},
          _updateSelection: function() {},
          _updateSizeAndSelection: function() {}
        });
      });

      function createView() {
        var view = new DerivedView({
          width: 100,
          height: 100,
          domContainer: document.createElement("div"),
          model: model,
          isAutoUpdate: false
        });

        view.__dirtyPropGroups.clear(); // view is clean

        // Ensure view is always valid
        spyOn(view, "validate").and.returnValue(null);

        return view;
      }

      function createUpdateSpies(view) {
        return {
          updateSize:      spyOn(view, "_updateSize"),
          updateSelection: spyOn(view, "_updateSelection"),
          updateSizeAndSelection: spyOn(view, "_updateSizeAndSelection"),
          updateAll:       spyOn(view, "_updateAll")
        };
      }

      it("should return immediately when the view is not updating and is not dirty", function() {

        var view  = createView();

        spyOn(view, "_updateAll");

        return view.update().then(function() {
          expect(view._updateAll).not.toHaveBeenCalled();
        });
      });

      it("should call #_updateSize when the Size bit is set", function() {

        var view  = createView();
        var spies = createUpdateSpies(view);

        view.__dirtyPropGroups.set(View.PropertyGroups.Size);

        return view.update().then(function() {
          expect(spies.updateSize).toHaveBeenCalled();
          expect(spies.updateSelection).not.toHaveBeenCalled();
          expect(spies.updateSizeAndSelection).not.toHaveBeenCalled();
          expect(spies.updateAll).not.toHaveBeenCalled();
        });
      });

      it("should call #_updateSelection when the Selection bit is set", function() {

        var view  = createView();
        var spies = createUpdateSpies(view);

        view.__dirtyPropGroups.set(View.PropertyGroups.Selection);

        return view.update().then(function() {
          expect(spies.updateSize).not.toHaveBeenCalled();
          expect(spies.updateSizeAndSelection).not.toHaveBeenCalled();
          expect(spies.updateAll).not.toHaveBeenCalled();
          expect(spies.updateSelection).toHaveBeenCalled();
        });
      });

      it("should call #_updateSizeAndSelection when both the Size and Selection bits are set", function() {

        var view  = createView();
        var spies = createUpdateSpies(view);

        view.__dirtyPropGroups.set(View.PropertyGroups.Size | View.PropertyGroups.Selection);

        return view.update().then(function() {
          expect(spies.updateSize).not.toHaveBeenCalled();
          expect(spies.updateSelection).not.toHaveBeenCalled();
          expect(spies.updateAll).not.toHaveBeenCalled();
          expect(spies.updateSizeAndSelection).toHaveBeenCalled();
        });
      });

      it("should call #_updateAll when both the General, Size and Selection bits are set", function() {

        var view  = createView();
        var spies = createUpdateSpies(view);

        view.__dirtyPropGroups.set(
            View.PropertyGroups.General | View.PropertyGroups.Size | View.PropertyGroups.Selection);

        return view.update().then(function() {
          expect(spies.updateSize).not.toHaveBeenCalled();
          expect(spies.updateSelection).not.toHaveBeenCalled();
          expect(spies.updateSizeAndSelection).not.toHaveBeenCalled();
          expect(spies.updateAll).toHaveBeenCalled();
        });
      });

      it("should allow model changes of different PropGroups during an async update operation", function() {

        var view = createView();

        var _resolveSize = null;

        spyOn(view, "_updateSize").and.callFake(function() {
          return new Promise(function(resolve) { _resolveSize = resolve; });
        });

        spyOn(view, "_updateSelection");

        // Simulate a size change
        view.__dirtyPropGroups.set(View.PropertyGroups.Size);

        var p = view.update();

        // _updateSize is still updating

        // Change the view's selection
        view.selectionFilter = {_: "or"};

        expect((view.__dirtyPropGroups.get() & View.PropertyGroups.Selection) !== 0).toBe(true);

        // Finish _updateSize
        _resolveSize();

        return p.then(function() {

          expect(view._updateSize).toHaveBeenCalledTimes(1);
          expect(view._updateSelection).toHaveBeenCalledTimes(1);
        });
      });

      it("should allow model changes of the same PropGroups during an async update operation", function() {

        var view = createView();

        var _resolveSize1 = null;

        spyOn(view, "_updateSize").and.callFake(function() {
          // First Size update
          if(!_resolveSize1) {
            return new Promise(function(resolve) { _resolveSize1 = resolve; });
          }
        });

        view.__dirtyPropGroups.set(View.PropertyGroups.Size);

        var p = view.update();

        // _updateSize is still updating

        // Change the view's width
        view.width = 300;

        // Finish _updateSize operation 1
        _resolveSize1();

        return p.then(function() {

          expect(view._updateSize).toHaveBeenCalledTimes(2);
        });
      });
    });

    describe("#_onChangeClassify", function() {
      var view;
      var SubView;

      beforeEach(function() {
        SubView = View.extend({
          $type: {
            props: [
              {name: "foo", valueType: "string"}
            ]
          }
        });

        view = new SubView({
          width: 100,
          height: 100,
          domContainer: document.createElement("div"),
          model: model,
          isAutoUpdate: false
        });

        view.__dirtyPropGroups.clear();

        expect(view.isDirty).toBe(false); // view is clean
      });

      it("should set the Size bit when 'height' changes", function() {
        view.height = 200;
        expect(view.__dirtyPropGroups.is(View.PropertyGroups.Size)).toBe(true);
      });

      it("should set the Size bit when 'width' changes", function() {
        view.width = 200;
        expect(view.__dirtyPropGroups.is(View.PropertyGroups.Size)).toBe(true);
      });

      it("should set the Data bit when 'model.data' changes", function() {
        view.model.data = new Table();
        expect(view.__dirtyPropGroups.is(View.PropertyGroups.Data)).toBe(true);
      });

      it("should set the Selection bit  when 'selectionFilter' changes", function() {
        view.selectionFilter = {_: "or"};
        expect(view.__dirtyPropGroups.is(View.PropertyGroups.Selection)).toBe(true);
      });

      it("should set the General bit when a property other than " +
         "'height', 'width' or 'selectionFilter' changes", function() {
        view.foo = "bar";
        expect(view.__dirtyPropGroups.is(View.PropertyGroups.General)).toBe(true);
      });

      it("should call '_onChangeClassify' to classify the change", function() {
        spyOn(view, "_onChangeClassify").and.callThrough();
        view.foo = "bar";
        expect(view._onChangeClassify).toHaveBeenCalled();
      });

      it("should not call 'update' if '_onChangeClassify' does not recognize any relevant change", function() {
        spyOn(view, "_onChangeClassify");
        spyOn(view, "update");
        view.isAutoUpdate = true;

        view.foo = "bar";

        expect(view.update).not.toHaveBeenCalled();
      });

      it("should call 'update' even if '_onChangeClassify' marks changes that already existed", function() {

        view.__dirtyPropGroups.set(View.PropertyGroups.General);
        view.isAutoUpdate = true;

        spyOn(view, "_onChangeClassify").and.callFake(function(dirtyPropGroups) {
          dirtyPropGroups.set(View.PropertyGroups.General);
        });

        spyOn(view, "update").and.returnValue(Promise.resolve());

        view.foo = "bar";

        expect(view.update).toHaveBeenCalled();
      });
    }); // #_onChangeClassify

    describe("#isAutoUpdate", function() {

      function createValidCleanView() {
        var view = new View({
          width:  100,
          height: 100,
          domContainer: document.createElement("div"),
          model: model
        });

        expect(view.$isValid).toBe(true);

        view.__dirtyPropGroups.clear(); // view is clean

        expect(view.isDirty).toBe(false);

        return view;
      }

      it("should get `true`, initially", function() {
        var view = new View();

        expect(view.isAutoUpdate).toBe(true);
      });

      it("should get a set value", function() {
        var view = new View();

        view.isAutoUpdate = false;

        expect(view.isAutoUpdate).toBe(false);
      });

      it("should not call #update when #isAutoUpdate is `false` and the view's properties change", function() {

        var view = createValidCleanView();

        spyOn(view, "update");

        view.isAutoUpdate = false;

        view.width = 200;

        expect(view.update).not.toHaveBeenCalled();
      });

      it("should not call #update when #isAutoUpdate is `true` and the view's properties change but " +
         "no dom container is set", function() {

        var view = new View({
          width:  100,
          height: 100,
          model: model
        });

        expect(view.$isValid).toBe(true);

        view.__dirtyPropGroups.clear(); // view is clean

        expect(view.isDirty).toBe(false);

        spyOn(view, "update");

        view.width = 200;

        expect(view.update).not.toHaveBeenCalled();
      });

      it("should call #update when #isAutoUpdate is `true` and the view's properties change", function() {

        var view = createValidCleanView();

        spyOn(view, "update").and.returnValue(Promise.resolve());

        view.width = 200; // marks the view as dirty

        expect(view.update).toHaveBeenCalled();
      });

      // Coverage.
      // TODO: should test that logger.warn is called.
      it("should log the rejected case of an auto-update", function() {

        var view = createValidCleanView();

        spyOn(view, "update").and.returnValue(Promise.reject(new Error("Something went wrong...")));

        view.width = 200; // marks the view as dirty

        expect(view.update).toHaveBeenCalled();
      });
    }); // #isAutoUpdate

    describe("#isDirty", function() {

      var view;

      beforeEach(function() {

        view = new View({
          width: 100,
          height: 100,
          domContainer: document.createElement("div"),
          model: model
        });
      });

      it("should be `true` when the view is created", function() {
        expect(view.isDirty).toBe(true);
      });

      it("should be read-only", function() {
        expect(function() {
          view.isDirty = false;
        }).toThrowError(TypeError);
      });

      it("should be `true` when 'will:update' is called", function() {

        view.on("will:update", function() {
          expect(view.isDirty).toBe(true);
        });

        return view.update();
      });

      it("should be `true` during a call to one of the _updateZyx methods", function() {

        spyOn(view, "_updateAll").and.callFake(function() {

          expect(view.isDirty).toBe(true);

        });

        return view.update();
      });

      it("should be `false` when 'did:update' is called", function() {

        view.on("did:update", function() {
          expect(view.isDirty).toBe(false);
        });

        return view.update();
      });

      it("should be `true` when 'rejected:update' is called", function() {

        spyOn(view, "_updateAll").and.returnValue(Promise.reject("Just because."));

        view.on("rejected:update", function() {
          expect(view.isDirty).toBe(true);
        });

        return view.update().then(function() {
          fail("Expected update to have been rejected.");
        }, function() {
          // swallow error
        });
      });

      it("should be `false` after a successful update", function() {

        expect(view.isDirty).toBe(true);

        return view.update().then(function() {

          expect(view.isDirty).toBe(false);
        });
      });

      it("should mark the view as dirty when 'isAutoUpdate' is `false` and a change has taken place", function() {
        view.__dirtyPropGroups.clear();

        view.isAutoUpdate = false;

        view.width = 200;

        expect(view.isDirty).toBe(true);
      });
    }); // #isDirty

    describe("#isUpdating", function() {

      var view;

      beforeEach(function() {
        view = new View({
          width: 100,
          height: 100,
          domContainer: document.createElement("div"),
          model: model
        });
      });

      it("should be `false` when the view is created", function() {
        expect(view.isUpdating).toBe(false);
      });

      it("should be read-only", function() {
        expect(function() {
          view.isUpdating = false;
        }).toThrowError(TypeError);
      });

      it("should be `true` when 'will:update' is called", function() {

        view.on("will:update", function() {
          expect(view.isUpdating).toBe(true);
        });

        return view.update();
      });

      it("should be `true` during a call to one of the _updateZyx methods", function() {

        spyOn(view, "_updateAll").and.callFake(function() {

          expect(view.isUpdating).toBe(true);

        });

        return view.update();
      });

      it("should be `false` when 'did:udpate' is called", function() {

        view.on("did:update", function() {
          expect(view.isUpdating).toBe(false);
        });

        return view.update();
      });

      it("should be `false` when 'rejected:update' is called", function() {

        spyOn(view, "_updateAll").and.returnValue(Promise.reject("Just because."));

        view.on("rejected:update", function() {
          expect(view.isUpdating).toBe(false);
        });

        return view.update().then(function() {
          fail("Expected update to have been rejected.");
        }, function() {
          // swallow error
        });
      });

      it("should be `false` after a successful update", function() {

        return view.update().then(function() {

          expect(view.isUpdating).toBe(false);
        });
      });
    }); // #isUpdating

    describe("#dispose", function() {

      function createView() {

        return new View({
          width: 100,
          height: 100,
          domContainer: document.createElement("div"),
          model: model
        });
      }

      it("should be possible to be called once", function() {

        var view = createView();

        view.dispose();
      });

      it("should be possible to be called twice", function() {

        var view = createView();

        view.dispose();

        view.dispose();
      });

      it("should call _releaseDomContainer", function() {

        var view = createView();

        spyOn(view, "_releaseDomContainer").and.callThrough();

        view.dispose();

        expect(view._releaseDomContainer).toHaveBeenCalledTimes(1);
      });

      it("should call _releaseDomContainer the first time", function() {

        var view = createView();

        spyOn(view, "_releaseDomContainer").and.callThrough();

        view.dispose();

        view.dispose();

        expect(view._releaseDomContainer).toHaveBeenCalledTimes(1);
      });
    }); // #dispose

    describe("#_releaseDomContainer", function() {

      function createView() {
        return new View({
          width: 100,
          height: 100,
          domContainer: document.createElement("div"),
          model: model
        });
      }

      it("should clear out the DOM container", function() {
        var view = createView();

        expect(view.domContainer).not.toBe(null);
        view._releaseDomContainer();
        expect(view.domContainer).toBe(null);
      });
    }); // #_releaseDomContainer

    describe("#extend", function() {

      // coverage
      it("should be possible to extend without passing an instSpec argument", function() {

        var view = new View({
          width: 100,
          height: 100,
          domContainer: document.createElement("div"),
          model: model
        });

        view.extend();
      });

      it("should register _updateXyz method with the corresponding mask", function() {

        var updateSize = function() {};
        var DerivedView = View.extend({
          _updateSize: updateSize
        });

        var info = DerivedView.__UpdateMethods[View.PropertyGroups.Size];
        expect(info.name).toBe("_updateSize");
        expect(info.mask).toBe(View.PropertyGroups.Size);

        expect(DerivedView.__UpdateMethodsList.indexOf(info)).toBeGreaterThan(-1);
      });

      it("should register _updateXyz method with the corresponding mask when using 'implement'", function() {

        var updateSize = function() {};
        var DerivedView = View.extend({});

        DerivedView.implement({
          _updateSize: updateSize
        });

        var info = DerivedView.__UpdateMethods[View.PropertyGroups.Size];
        expect(info.name).toBe("_updateSize");
        expect(info.mask).toBe(View.PropertyGroups.Size);

        expect(DerivedView.__UpdateMethodsList.indexOf(info)).toBeGreaterThan(-1);
      });

      // TODO: should also test it logs a warning...
      it("should ignore an _updateXyz method which has no known property groups", function() {

        var count = View.__UpdateMethodsList.length;

        var updateBarAndFoo = function() {};
        var DerivedView = View.extend({
          _updateBarAndFoo: updateBarAndFoo
        });

        expect(DerivedView.__UpdateMethodsList.length).toBe(count);
      });

      it("should ignore unknown property groups and still register the _updateXyz method " +
         "under the known mask", function() {

        var updateSizeAndFoo = function() {};
        var DerivedView = View.extend({
          _updateSizeAndFoo: updateSizeAndFoo
        });

        var info = DerivedView.__UpdateMethods[View.PropertyGroups.Size];
        expect(info.name).toBe("_updateSizeAndFoo");
        expect(info.mask).toBe(View.PropertyGroups.Size);

        expect(DerivedView.__UpdateMethodsList.indexOf(info)).toBeGreaterThan(-1);
      });

      it("should not re-register an update method that is already declared in the base class", function() {

        var updateSize = function() {};
        var DerivedView = View.extend({
          _updateSize: updateSize
        });

        var info = DerivedView.__UpdateMethods[View.PropertyGroups.Size];

        var DerivedView2 = DerivedView.extend({
          // Override
          _updateSize: function() {}
        });

        var info2 = DerivedView2.__UpdateMethods[View.PropertyGroups.Size];

        expect(info2).toBe(info);
      });
    }); // #extend

    describe("#validate()", function() {

      it("a view spec is valid if all (declared) properties (required and optional) are properly defined", function() {
        var view = new View({
          width: 1,
          height: 1,
          model: model
        });

        expect(view.validate()).toBeNull();
      });

      it("a model spec is invalid if at least one required property is omitted", function() {
        var view = new View();
        expect(view.validate()).not.toBeNull();

        view = new View({});
        expect(view.validate()).not.toBeNull();

        view = new View({
          width: 1
        });
        expect(view.validate()).not.toBeNull();

        view = new View({
          width: 1,
          height: 1
        });
        expect(view.validate()).not.toBeNull();
      });
    });

    describe("#toJSON()", function() {

      it("should not serialize the `selectionFilter` property by default", function() {
        var view = new View({
          width: 1,
          height: 1,
          selectionFilter: {_: "pentaho/data/filter/and"}
        });

        expect(!!view.get("selectionFilter")).toBe(true);

        var json = view.toJSON();

        expect(json instanceof Object).toBe(true);
        expect("selectionFilter" in json).toBe(false);
      });

      it("should serialize the `selectionFilter` property if keyArgs.omitProps.selectionFilter = false", function() {
        var view = new View({
          width: 1,
          height: 1,
          selectionFilter: {_: "pentaho/data/filter/and"}
        });

        expect(!!view.get("selectionFilter")).toBe(true);

        var json = view.toSpec({isJson: true, omitProps: {selectionFilter: false}});

        expect(json instanceof Object).toBe(true);
        expect("selectionFilter" in json).toBe(true);
      });
    });

    describe("#toSpec()", function() {

      it("should serialize the `model` property", function() {
        var view = new View({
          width:  1,
          height: 1,
          model: model
        });

        expect(!!view.get("model")).toBe(true);

        var json = view.toSpec();

        expect(json instanceof Object).toBe(true);
        expect("model" in json).toBe(true);
      });

      it("should serialize the `selectionFilter` property", function() {
        var view = new View({
          width: 1,
          height: 1,
          selectionFilter: {_: "pentaho/data/filter/and"}
        });

        expect(!!view.get("selectionFilter")).toBe(true);

        var json = view.toSpec();

        expect(json instanceof Object).toBe(true);
        expect("selectionFilter" in json).toBe(true);
      });
    });

    describe("#act", function() {
      var SelectAction;
      var ExecuteAction;

      beforeEach(function() {
        // Assuming pre-loaded with View
        SelectAction = context.get("pentaho/visual/action/select");
        ExecuteAction = context.get("pentaho/visual/action/execute");
      });

      it("should call all _onActionPhase<Phase> methods", function() {

        var view = new View();

        var action = new ExecuteAction();

        spyOn(view, "_onActionPhaseInit").and.callThrough();
        spyOn(view, "_onActionPhaseWill").and.callThrough();
        spyOn(view, "_onActionPhaseDo").and.callThrough();
        spyOn(view, "_onActionPhaseFinally").and.callThrough();

        view.act(action);

        expect(view._onActionPhaseInit).toHaveBeenCalledWith(action);
        expect(view._onActionPhaseWill).toHaveBeenCalledWith(action);
        expect(view._onActionPhaseDo).toHaveBeenCalledWith(action);
        expect(view._onActionPhaseFinally).toHaveBeenCalledWith(action);
      });

      it("should call registered view event listeners", function() {

        var view = new View();

        var action = new ExecuteAction();

        var observer = {
          init: jasmine.createSpy(),
          will: jasmine.createSpy(),
          "do": jasmine.createSpy(),
          "finally": jasmine.createSpy()
        };

        view.on(ExecuteAction.type.id, observer);

        view.act(action);

        expect(observer.init).toHaveBeenCalledWith(action);
        expect(observer.will).toHaveBeenCalledWith(action);
        expect(observer["do"]).toHaveBeenCalledWith(action);
        expect(observer["finally"]).toHaveBeenCalledWith(action);
      });

      it("should allow canceling the action in the init phase", function() {

        var view = new View();

        var action = new ExecuteAction();

        var observer = {
          init: jasmine.createSpy("init").and.callFake(function(action) {
            action.reject();
          }),
          will: jasmine.createSpy("will"),
          "do": jasmine.createSpy("do"),
          "finally": jasmine.createSpy("finally").and.callFake(function(action) {
            expect(action.isRejected).toBe(true);
            expect(action.isCanceled).toBe(true);
            expect(action.isFailed).toBe(false);
            expect(action.isExecuting).toBe(false);
            expect(action.isFinished).toBe(true);
          })
        };

        view.on(ExecuteAction.type.id, observer);

        view.act(action);

        expect(observer.init).toHaveBeenCalledWith(action);
        expect(observer.will).not.toHaveBeenCalled();
        expect(observer["do"]).not.toHaveBeenCalled();
        expect(observer["finally"]).toHaveBeenCalledWith(action);
      });

      it("should allow canceling the action in the will phase", function() {

        var view = new View();

        var action = new ExecuteAction();

        var observer = {
          init: jasmine.createSpy("init"),
          will: jasmine.createSpy("will").and.callFake(function(action) {
            action.reject();
          }),
          "do": jasmine.createSpy("do"),
          "finally": jasmine.createSpy("finally").and.callFake(function(action) {
            expect(action.isRejected).toBe(true);
            expect(action.isCanceled).toBe(true);
            expect(action.isFailed).toBe(false);
            expect(action.isExecuting).toBe(false);
            expect(action.isFinished).toBe(true);
          })
        };

        // Use the alias.
        view.on("execute", observer);

        view.act(action);

        expect(observer.init).toHaveBeenCalledWith(action);
        expect(observer.will).toHaveBeenCalledWith(action);
        expect(observer["do"]).not.toHaveBeenCalled();
        expect(observer["finally"]).toHaveBeenCalledWith(action);
      });
    });

    describe("getClassAsync(modelType)", function() {

      it("should be defined", function() {

        expect(typeof View.getClassAsync).toBe("function");
      });

      it("should be defined in subclasses of View", function() {

        var SubView = View.extend();

        expect(typeof SubView.getClassAsync).toBe("function");
      });

      it("should return a promise", function() {

        var p = View.getClassAsync(model.$type);

        expect(p instanceof Promise).toBe(true);
      });

      it("should return a rejected promise when given no modelType", function() {

        return testUtils.expectToRejectWith(View.getClassAsync(null), {
          asymmetricMatch: function(error) { return error instanceof Error; }
        });
      });

      it("should return a promise that is rejected when the type of model does not have " +
          "a registered view type", function() {

        var SubModel = Model.extend({$type: {defaultView: null}});

        return testUtils.expectToRejectWith(View.getClassAsync(SubModel.type), {
          asymmetricMatch: function(error) { return error instanceof Error; }
        });
      });

      it("should return a promise that is rejected when the type of model refers an " +
          "undefined view type", function() {

        var SubModel = Model.extend({$type: {defaultView: "test/foo/bar/view"}});

        return testUtils.expectToRejectWith(View.getClassAsync(SubModel.type), {
          asymmetricMatch: function(error) { return error instanceof Error; }
        });
      });

      it("should return a promise that is rejected when the model type identifier does not exist", function() {

        return testUtils.expectToRejectWith(View.getClassAsync("test/foo/bar"), {
          asymmetricMatch: function(error) { return error instanceof Error; }
        });
      });

      it("should return a promise that is fulfilled with the view constructor of " +
         "the registered default view type", function() {

        var SubView  = View.extend();
        var SubModel = Model.extend({$type: {defaultView: SubView}});

        return View.getClassAsync(SubModel.type)
            .then(function(ViewCtor) {
              expect(ViewCtor).toBe(SubView);
            });
      });

      it("should return a promise that is fulfilled with the view constructor of " +
          "the registered default view type identifier", function() {

        var SubModel = Model.extend({$type: {defaultView: "pentaho/visual/base/view"}});

        return View.getClassAsync(SubModel.type)
            .then(function(ViewCtor) {
              expect(ViewCtor).toBe(View);
            });
      });
    });

    describe("createAsync(domContainer, model)", function() {
      it("should be defined", function() {
        expect(typeof View.createAsync).toBe("function");
      });

      it("should be defined in subclasses of View", function() {
        var SubView = View.extend();

        expect(typeof SubView.createAsync).toBe("function");
      });

      it("should return a rejected promise when given no spec", function() {

        return testUtils.expectToRejectWith(
            function() { return View.createAsync(); },
            errorMatch.argRequired("viewSpec"));
      });

      it("should return a rejected promise when given a spec with no view type id and no model", function() {

        return testUtils.expectToRejectWith(
            function() { return View.createAsync({}); },
            errorMatch.argRequired("viewSpec.model"));
      });

      it("should return a rejected promise when given a spec with no view type id and a model " +
         "with no type id", function() {

        return testUtils.expectToRejectWith(
            function() { return View.createAsync({model: {}}); },
            errorMatch.argRequired("viewSpec.model._"));
      });

      it("should return a promise that resolves to a view when given a spec with a view type id", function() {

        function config(localRequire) {

          localRequire.define("test/foo/view", [], function() {

            return ["pentaho/visual/base/view", function(BaseView) {

              return BaseView.extend({
                $type: {
                  id: "test/foo/view"
                }
              });
            }];
          });
        }

        return require.using(["pentaho/type/Context"], config, function(Context) {

          return Context.createAsync().then(function(context) {

            return context.applyAsync(["pentaho/visual/base/view"], function(View) {

              return View.createAsync({_: "test/foo/view"}).then(function(fooView) {
                expect(fooView instanceof View).toBe(true);
                expect(fooView.$type.id).toBe("test/foo/view");
              });
            });
          });
        });
      });

      it("should return a promise that resolves to a view of the default type of the model type id" +
         "in the model property", function() {

        function config(localRequire) {

          localRequire.define("test/foo/view", [], function() {

            return ["pentaho/visual/base/view", function(BaseView) {

              return BaseView.extend({
                $type: {
                  id: "test/foo/view",
                  props: {a: {valueType: "string"}}
                }
              });
            }];
          });

          localRequire.define("test/foo/model", [], function() {

            return ["pentaho/visual/base/model", function(BaseModel) {

              return BaseModel.extend({
                $type: {
                  id: "test/foo/model",
                  defaultView: "test/foo/view"
                }
              });
            }];
          });
        }

        return require.using(["pentaho/type/Context"], config, function(Context) {

          return Context.createAsync().then(function(context) {

            return context.applyAsync(["pentaho/visual/base/view"], function(View) {

              var viewSpec = {
                a: "b",
                model: {_: "test/foo/model"}
              };

              return View.createAsync(viewSpec).then(function(fooView) {

                expect(fooView instanceof View).toBe(true);
                expect(fooView.$type.id).toBe("test/foo/view");
                expect(fooView.a).toBe("b");
              });
            });
          });
        });
      });

      it("should return a promise that resolves to a view of the default type of the model instance " +
          "in the model property", function() {

        function config(localRequire) {

          localRequire.define("test/foo/view", [], function() {

            return ["pentaho/visual/base/view", function(BaseView) {

              return BaseView.extend({
                $type: {
                  id: "test/foo/view",
                  props: {a: {valueType: "string"}}
                }
              });
            }];
          });

          localRequire.define("test/foo/model", [], function() {

            return ["pentaho/visual/base/model", function(BaseModel) {

              return BaseModel.extend({
                $type: {
                  id: "test/foo/model",
                  defaultView: "test/foo/view"
                }
              });
            }];
          });
        }

        return require.using(["pentaho/type/Context"], config, function(Context) {

          return Context.createAsync().then(function(context) {

            return context.applyAsync(["pentaho/visual/base/view", "test/foo/model"], function(View, FooModel) {

              var fooModel = new FooModel();
              var viewSpec = {
                a: "b",
                model: fooModel
              };
              return View.createAsync(viewSpec).then(function(fooView) {

                expect(fooView instanceof View).toBe(true);
                expect(fooView.$type.id).toBe("test/foo/view");
                expect(fooView.a).toBe("b");
                expect(fooView.model).toBe(fooModel);
              });
            });
          });
        });
      });
    });

    describe(".Type", function() {
      describe("#extension", function() {

        it("should respect a specified object value", function() {
          var ext = {foo: "bar"};
          var DerivedView = View.extend({$type: {
            extension: ext
          }});

          expect(DerivedView.type.extension).toEqual(ext);
        });

        it("should convert a falsy value to null", function() {
          var DerivedView = View.extend({$type: {
            extension: false
          }});

          expect(DerivedView.type.extension).toBe(null);
        });

        it("should read the local value and not an inherited base value", function() {
          var ext = {foo: "bar"};
          var DerivedView = View.extend({$type: {
            extension: ext
          }});

          var DerivedView2 = DerivedView.extend();

          expect(DerivedView2.type.extension).toBe(null);
        });

        it("should throw if set and the type already has descendants", function() {

          var DerivedView  = View.extend();
          var DerivedView2 = DerivedView.extend();

          expect(function() {
            DerivedView.type.extension = {foo: "bar"};
          }).toThrow(errorMatch.operInvalid());
        });
      });

      describe("#extensionEffective", function() {

        it("should reflect a locally specified object value", function() {
          var ext = {foo: "bar"};

          var DerivedView = View.extend({
            $type: {
              extension: ext
            }
          });

          expect(DerivedView.type.extensionEffective).toEqual(ext);
        });

        it("should reuse the initially determined object value", function() {
          var ext = {foo: "bar"};

          var DerivedView = View.extend({
            $type: {
              extension: ext
            }
          });

          var result1 = DerivedView.type.extensionEffective;
          var result2 = DerivedView.type.extensionEffective;

          expect(result1).toBe(result2);
        });

        it("should reflect an inherited object value", function() {

          var ext = {foo: "bar"};
          var DerivedView = View.extend({$type: {
            extension: ext
          }});

          var DerivedView2 = DerivedView.extend();

          expect(DerivedView2.type.extensionEffective).toEqual(ext);
        });

        it("should merge local and inherited object values", function() {

          var DerivedView = View.extend({$type: {
            extension: {foo: "bar"}
          }});

          var DerivedView2 = DerivedView.extend({$type: {
            extension: {bar: "foo"}
          }});

          expect(DerivedView2.type.extensionEffective).toEqual({
            foo: "bar",
            bar: "foo"
          });
        });

        it("should override inherited properties with local properties", function() {

          var DerivedView = View.extend({$type: {
            extension: {foo: "bar"}
          }});

          var DerivedView2 = DerivedView.extend({$type: {
            extension: {foo: "gugu"}
          }});

          expect(DerivedView2.type.extensionEffective).toEqual({
            foo: "gugu"
          });
        });
      });
    });
  });
});
