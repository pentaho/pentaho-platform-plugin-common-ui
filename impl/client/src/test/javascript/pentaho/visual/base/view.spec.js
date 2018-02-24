/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
  "tests/test-utils",
  "tests/pentaho/util/errorMatch"
], function(Table, Context, testUtils, errorMatch) {

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

    function createValidAndDirtyView() {
      return new View({
        width: 100,
        height: 100,
        domContainer: document.createElement("div"),
        model: model
      });
    }

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

            return context.getDependencyApplyAsync([
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

    describe("#update() and UpdateActionExecution", function() {

      it("should call the _onUpdate* methods, with the action execution instance", function() {

        var view = createValidAndDirtyView();

        var actionExecution;

        spyOn(view, "_onUpdateInit").and.callFake(function(_actionExecution) {
          actionExecution = _actionExecution;
          expect(!!actionExecution).toBe(true);
        });
        spyOn(view, "_onUpdateWill").and.callThrough();
        spyOn(view, "_onUpdateDo").and.returnValue(Promise.resolve());
        spyOn(view, "_onUpdateFinally").and.callThrough();

        var promise = view.update();

        promise.then(function() {
          expect(view._onUpdateInit).toHaveBeenCalled();
          expect(view._onUpdateWill).toHaveBeenCalledWith(actionExecution);
          expect(view._onUpdateDo).toHaveBeenCalledWith(actionExecution);
          expect(view._onUpdateFinally).toHaveBeenCalledWith(actionExecution);
        });
      });

      it("should emit the 'pentaho/visual/action/update:will' event from within the _onUpdateWill method", function() {

        var originalOnUpdateWill = View.prototype._onUpdateWill;

        var view = createValidAndDirtyView();

        spyOn(view, "_onUpdateInit");
        spyOn(view, "_onUpdateWill");
        spyOn(view, "_onUpdateDo").and.returnValue(Promise.resolve());
        spyOn(view, "_onUpdateFinally");

        var listener = jasmine.createSpy("will:update");

        view.on("pentaho/visual/action/update", {will: listener});

        view._onUpdateWill.and.callFake(function() {

          expect(listener).not.toHaveBeenCalled();

          var result = originalOnUpdateWill.apply(this, arguments);

          expect(listener).toHaveBeenCalledTimes(1);

          return result;
        });

        return view.update().then(function() {
          expect(view._onUpdateWill).toHaveBeenCalled();
        });
      });

      it("should emit the 'pentaho/visual/action/update:finally' event " +
         "from within the _onUpdateFinally method", function() {

        var originalOnUpdateFinally = View.prototype._onUpdateFinally;

        var view = createValidAndDirtyView();

        spyOn(view, "_onUpdateInit");
        spyOn(view, "_onUpdateWill");
        spyOn(view, "_onUpdateDo").and.returnValue(Promise.resolve());
        spyOn(view, "_onUpdateFinally");

        var listener = jasmine.createSpy("finally:update");

        view.on("pentaho/visual/action/update", {"finally": listener});

        view._onUpdateFinally.and.callFake(function() {

          expect(listener).not.toHaveBeenCalled();

          var result = originalOnUpdateFinally.apply(this, arguments);

          expect(listener).toHaveBeenCalledTimes(1);

          return result;
        });

        return view.update().then(function() {
          expect(view._onUpdateFinally).toHaveBeenCalled();
        });
      });

      describe("Update loop phase", function() {

        function createView() {

          var view = createValidAndDirtyView();

          spyOn(view, "_onUpdateWill");
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

      describe("Concurrency", function() {

        it("should be able to call update twice", function() {

          var view = createValidAndDirtyView();

          return view.update().then(function() {

            view.__dirtyPropGroups.set();

            return view.update();
          });
        });

        it("should return a promise to the current update when an update operation " +
           "is already undergoing (nested)", function() {

          var view = createValidAndDirtyView();

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

          var view = createValidAndDirtyView();

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

    describe("#update() - handling of dirty bits", function() {
      var DerivedView;

      beforeEach(function() {

        DerivedView = View.extend({
          _updateSize: function() {},
          _updateSelection: function() {},
          _updateSizeAndSelection: function() {}
        });
      });

      function createValidAndCleanView() {

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

        var view = createValidAndCleanView();

        spyOn(view, "_updateAll");

        return view.update().then(function() {
          expect(view._updateAll).not.toHaveBeenCalled();
        });
      });

      it("should call #_updateSize when the Size bit is set", function() {

        var view  = createValidAndCleanView();
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

        var view  = createValidAndCleanView();
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

        var view  = createValidAndCleanView();
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

        var view  = createValidAndCleanView();
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

        var view = createValidAndCleanView();

        var _resolveSize = null;

        spyOn(view, "_updateSize").and.callFake(function() {
          return new Promise(function(resolve) { _resolveSize = resolve; });
        });

        spyOn(view, "_updateSelection");

        // Simulate a size change
        view.__dirtyPropGroups.set(View.PropertyGroups.Size);

        var p = view.update();

        // _updateSize is still updating

        // Change the model's selection
        view.model.selectionFilter = {_: "or"};

        expect((view.__dirtyPropGroups.get() & View.PropertyGroups.Selection) !== 0).toBe(true);

        // Finish _updateSize
        _resolveSize();

        return p.then(function() {

          expect(view._updateSize).toHaveBeenCalledTimes(1);
          expect(view._updateSelection).toHaveBeenCalledTimes(1);
        });
      });

      it("should allow model changes of the same PropGroups during an async update operation", function() {

        var view = createValidAndCleanView();

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
        view.model.selectionFilter = {_: "or"};
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

      it("should be `true` when 'pentaho/visual/action/update:{will}' is called", function() {

        view.on("pentaho/visual/action/update", {will: function() {
          expect(view.isDirty).toBe(true);
        }});

        return view.update();
      });

      it("should be `true` during a call to one of the _updateZyx methods", function() {

        spyOn(view, "_updateAll").and.callFake(function() {

          expect(view.isDirty).toBe(true);

        });

        return view.update();
      });

      it("should be `false` when 'pentaho/visual/action/update:{finally}' is called with success", function() {

        view.on("pentaho/visual/action/update", {"finally": function() {
          expect(view.isDirty).toBe(false);
        }});

        return view.update();
      });

      it("should be `true` when 'pentaho/visual/action/update:{finally}' is called with failure", function() {

        spyOn(view, "_updateAll").and.returnValue(Promise.reject("Just because."));

        view.on("pentaho/visual/action/update", {"finally": function() {
          expect(view.isDirty).toBe(true);
        }});

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

      var UpdateAction;
      var view;

      beforeEach(function() {
        // Assuming pre-loaded with View
        UpdateAction = context.get("pentaho/visual/action/update");
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

      it("should be `true` when 'update/will' is called", function() {

        view.on("pentaho/visual/action/update", {
          will: function() {
            expect(view.isUpdating).toBe(true);
          }
        });

        return view.update();
      });

      it("should be `true` during a call to one of the _updateZyx methods", function() {

        spyOn(view, "_updateAll").and.callFake(function() {

          expect(view.isUpdating).toBe(true);

        });

        return view.update();
      });

      it("should be `false` when 'pentaho/visual/action/update:{finally}' is called with success", function() {

        view.on("pentaho/visual/action/update", {
          "finally": function() {
            expect(view.isUpdating).toBe(false);
          }
        });

        return view.update();
      });

      it("should be `false` when 'pentaho/visual/action/update:{finally}' is called with failure", function() {

        spyOn(view, "_updateAll").and.returnValue(Promise.reject("Just because."));

        view.on("pentaho/visual/action/update", {
          "finally": function() {
            expect(view.isUpdating).toBe(false);
          }
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
    });

    describe("#act", function() {
      var CustomSyncAction;

      beforeEach(function() {
        // Assuming pre-loaded with View
        CustomSyncAction = context.get("pentaho/visual/action/base").extend({
          $type: {
            id: "my/test/action",
            isAbstract: false
          }
        });
      });

      it("should call all `_emitActionPhase*Event` methods with the action execution", function() {

        var view = new View();

        spyOn(view, "_emitActionPhaseInitEvent").and.callThrough();
        spyOn(view, "_emitActionPhaseWillEvent").and.callThrough();
        spyOn(view, "_emitActionPhaseDoEvent").and.callThrough();
        spyOn(view, "_emitActionPhaseFinallyEvent").and.callThrough();

        var actionExecution = view.act(new CustomSyncAction());

        return actionExecution.promise.then(function() {
          expect(view._emitActionPhaseInitEvent).toHaveBeenCalledWith(actionExecution);
          expect(view._emitActionPhaseWillEvent).toHaveBeenCalledWith(actionExecution);
          expect(view._emitActionPhaseDoEvent).toHaveBeenCalledWith(actionExecution);
          expect(view._emitActionPhaseFinallyEvent).toHaveBeenCalledWith(actionExecution);
        });
      });

      it("should call registered view event listeners", function() {

        var observer = {
          init: jasmine.createSpy(),
          will: jasmine.createSpy(),
          "do": jasmine.createSpy(),
          "finally": jasmine.createSpy()
        };

        var view = new View();
        view.on(CustomSyncAction.type.id, observer);

        var actionExecution = view.act(new CustomSyncAction());

        return actionExecution.promise.then(function() {
          expect(observer.init).toHaveBeenCalledWith(actionExecution, actionExecution.action);
          expect(observer.will).toHaveBeenCalledWith(actionExecution, actionExecution.action);
          expect(observer["do"]).toHaveBeenCalledWith(actionExecution, actionExecution.action);
          expect(observer["finally"]).toHaveBeenCalledWith(actionExecution, actionExecution.action);
        });
      });

      it("should allow canceling the action in the init phase", function() {

        var observer = {
          init: jasmine.createSpy("init").and.callFake(function(event) {
            event.reject();
          }),
          will: jasmine.createSpy("will"),
          "do": jasmine.createSpy("do"),
          "finally": jasmine.createSpy("finally").and.callFake(function(event) {
            expect(event.isCanceled).toBe(true);
          })
        };

        var view = new View();

        view.on(CustomSyncAction.type.id, observer);

        view.act(new CustomSyncAction()).promise.then(function() {
          expect(observer.init).toHaveBeenCalled();
          expect(observer.will).not.toHaveBeenCalled();
          expect(observer["do"]).not.toHaveBeenCalled();
          expect(observer["finally"]).toHaveBeenCalled();
        });
      });

      it("should allow canceling the action in the will phase", function() {

        var observer = {
          init: jasmine.createSpy("init"),
          will: jasmine.createSpy("will").and.callFake(function(event) {
            event.reject();
          }),
          "do": jasmine.createSpy("do"),
          "finally": jasmine.createSpy("finally").and.callFake(function(event) {
            expect(event.isCanceled).toBe(true);
          })
        };

        var view = new View();

        view.on(CustomSyncAction.type.id, observer);

        view.act(new CustomSyncAction()).promise.then(function() {
          expect(observer.init).toHaveBeenCalled();
          expect(observer.will).toHaveBeenCalled();
          expect(observer["do"]).not.toHaveBeenCalled();
          expect(observer["finally"]).toHaveBeenCalled();
        });
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

        return testUtils.expectToRejectWith(function() { return View.getClassAsync(null); }, {
          asymmetricMatch: function(error) { return error instanceof Error; }
        });
      });

      it("should return a promise that is rejected when the type of model does not have " +
          "a registered view type", function() {

        var SubModel = Model.extend({$type: {defaultView: null}});

        return testUtils.expectToRejectWith(function() { return View.getClassAsync(SubModel.type); }, {
          asymmetricMatch: function(error) { return error instanceof Error; }
        });
      });

      it("should return a promise that is rejected when the type of model refers an " +
          "undefined view type", function() {

        var SubModel = Model.extend({$type: {defaultView: "test/foo/bar/view"}});

        return testUtils.expectToRejectWith(function() { return View.getClassAsync(SubModel.type); }, {
          asymmetricMatch: function(error) { return error instanceof Error; }
        });
      });

      it("should return a promise that is rejected when the model type identifier does not exist", function() {

        return testUtils.expectToRejectWith(function() { return View.getClassAsync("test/foo/bar"); }, {
          asymmetricMatch: function(error) { return error instanceof Error; }
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

            return context.getDependencyApplyAsync(["pentaho/visual/base/view"], function(View) {

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

            return context.getDependencyApplyAsync(["pentaho/visual/base/view"], function(View) {

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

            return context.getDependencyApplyAsync([
              "pentaho/visual/base/view",
              "test/foo/model"
            ], function(View, FooModel) {

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
