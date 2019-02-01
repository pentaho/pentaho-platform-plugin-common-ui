/*!
 * Copyright 2010 - 2019 Hitachi Vantara.  All rights reserved.
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
  "pentaho/visual/base/View",
  "pentaho/visual/base/Model",
  "pentaho/lang/UserError",
  "pentaho/lang/RuntimeError",
  "pentaho/visual/action/ModelChangedError",
  "pentaho/type/action/ComplexChangeset",
  "pentaho/type/action/Replace",
  "pentaho/type/action/Transaction",
  "pentaho/type/Number",
  "pentaho/type/Object",
  "pentaho/type/String",
  "pentaho/data/filter/Or",
  "pentaho/util/BitSet",
  "tests/test-utils",
  "tests/pentaho/util/errorMatch"
], function(Table, BaseView, BaseModel, UserError, RuntimeError, ModelChangedError, ComplexChangeset, Replace,
            Transaction, PentahoNumber, PentahoObject, PentahoString, OrFilter, BitSet, testUtils, errorMatch) {

  "use strict";

  /* eslint dot-notation: 0, max-nested-callbacks: 0 */

  // As in Complex.js
  var PROP_VALUE_SPECIFIED = 1;

  describe("pentaho.visual.base.View", function() {

    var Model;
    var model;
    var dataTable;

    function getDataTableSpec1() {
      return {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "sales", type: "number", label: "Sales"}
        ],
        rows: [
          {c: [{v: "Portugal"}, {v: 12000}]},
          {c: [{v: "Ireland"}, {v: 6000}]}
        ]
      };
    }

    beforeAll(function() {
      Model = BaseModel.extend({
        $type: {
          props: {
            "foo": {valueType: "string"}
          }
        }
      });
    });

    beforeEach(function() {
      dataTable = new Table(getDataTableSpec1());
      model = new Model({data: dataTable, isAutoUpdate: false});
    });

    describe("new(viewSpec)", function() {

      it("should throw if invoked without arguments", function() {
        expect(function() {
          var view = new BaseView();
        }).toThrow(errorMatch.argRequired("viewSpec.model"));
      });

      it("should throw if invoked without viewSpec.model", function() {
        expect(function() {
          var view = new BaseView({});
        }).toThrow(errorMatch.argRequired("viewSpec.model"));
      });

      it("should throw if invoked without viewSpec.domContainer", function() {
        expect(function() {
          var view = new BaseView({model: model});
        }).toThrow(errorMatch.argRequired("viewSpec.domContainer"));
      });

      it("should not throw if given both a model and a domContainer", function() {
        var elem = document.createElement("div");
        var view = new BaseView({model: model, domContainer: elem});

        expect(view.domContainer).toBe(elem);
      });

      it("should have view.model be the given model", function() {
        var elem = document.createElement("div");
        var view = new BaseView({model: model, domContainer: elem});

        expect(view.model).toBe(model);
      });

      it("should have view.domContainer be the given domContainer", function() {
        var domContainer = document.createElement("div");
        var view = new BaseView({model: model, domContainer: domContainer});

        expect(view.domContainer).toBe(domContainer);
      });

      it("should have view.hasUpdatedAll be false", function() {
        var domContainer = document.createElement("div");
        var view = new BaseView({model: model, domContainer: domContainer});

        expect(view.hasUpdatedAll).toBe(false);
      });

      it("should throw if invoked with a viewSpec.model which is not a Model", function() {
        expect(function() {
          var view = new BaseView({model: {}});
        }).toThrow(errorMatch.argInvalidType("viewSpec.model", "pentaho/visual/base/Model", "object"));
      });
    });

    describe("#__onChangeClassify(dirtyPropGroups, changeset)", function() {
      var view;
      var CustomView;

      beforeEach(function() {
        CustomView = BaseView.extend({});

        model.__changeset = null;

        expect(model.isDirty).toBe(false);

        view = new CustomView({
          domContainer: document.createElement("div"),
          model: model
        });
      });

      it("should set the Size bit when 'height' changes", function() {
        var txn = new Transaction();
        var changeset = new ComplexChangeset(txn, model);
        var propType = model.$type.get("height");
        var value = new PentahoNumber(model.height + 100);
        changeset.__setPrimitiveChange("height", new Replace(propType, value, PROP_VALUE_SPECIFIED));

        var dirtyPropGroups = new BitSet();

        view.__onChangeClassify(dirtyPropGroups, changeset);

        expect(dirtyPropGroups.is(BaseView.PropertyGroups.Size)).toBe(true);
      });

      it("should set the Size bit when 'width' changes", function() {

        var txn = new Transaction();
        var changeset = new ComplexChangeset(txn, model);
        var propType = model.$type.get("width");
        var value = new PentahoNumber(model.height + 100);
        changeset.__setPrimitiveChange("width", new Replace(propType, value, PROP_VALUE_SPECIFIED));

        var dirtyPropGroups = new BitSet();

        view.__onChangeClassify(dirtyPropGroups, changeset);

        expect(dirtyPropGroups.is(BaseView.PropertyGroups.Size)).toBe(true);
      });

      it("should set the Data bit when 'model.data' changes", function() {

        var txn = new Transaction();
        var changeset = new ComplexChangeset(txn, model);
        var propType = model.$type.get("data");
        var value = new PentahoObject(new Table());
        changeset.__setPrimitiveChange("data", new Replace(propType, value, PROP_VALUE_SPECIFIED));

        var dirtyPropGroups = new BitSet();

        view.__onChangeClassify(dirtyPropGroups, changeset);

        expect(dirtyPropGroups.is(BaseView.PropertyGroups.Data)).toBe(true);
      });

      it("should set the Selection bit  when 'selectionFilter' changes", function() {
        var txn = new Transaction();
        var changeset = new ComplexChangeset(txn, model);
        var propType = model.$type.get("selectionFilter");
        var value = new PentahoObject(new OrFilter());
        changeset.__setPrimitiveChange("selectionFilter", new Replace(propType, value, PROP_VALUE_SPECIFIED));

        var dirtyPropGroups = new BitSet();

        view.__onChangeClassify(dirtyPropGroups, changeset);

        expect(dirtyPropGroups.is(BaseView.PropertyGroups.Selection)).toBe(true);
      });

      it("should set the General bit when a property other than " +
        "'height', 'width' or 'selectionFilter' changes", function() {

        var txn = new Transaction();
        var changeset = new ComplexChangeset(txn, model);
        var propType = model.$type.get("foo");
        var value = new PentahoString("bar");
        changeset.__setPrimitiveChange("foo", new Replace(propType, value, PROP_VALUE_SPECIFIED));

        var dirtyPropGroups = new BitSet();

        view.__onChangeClassify(dirtyPropGroups, changeset);

        expect(dirtyPropGroups.is(BaseView.PropertyGroups.General)).toBe(true);
      });

      it("should set All bits when the changeset is null", function() {

        var changeset = null;

        var dirtyPropGroups = new BitSet();

        view.__onChangeClassify(dirtyPropGroups, changeset);

        expect(dirtyPropGroups.is(BaseView.PropertyGroups.All)).toBe(true);
      });

      it("should set the Size and Data bits when 'model.width' and 'model.data' changes", function() {

        var txn = new Transaction();
        var changeset = new ComplexChangeset(txn, model);

        var propType = model.$type.get("data");
        var value = new PentahoObject(new Table());
        changeset.__setPrimitiveChange("data", new Replace(propType, value, PROP_VALUE_SPECIFIED));

        propType = model.$type.get("width");
        value = new PentahoNumber(model.height + 100);
        changeset.__setPrimitiveChange("width", new Replace(propType, value, PROP_VALUE_SPECIFIED));

        var dirtyPropGroups = new BitSet();

        view.__onChangeClassify(dirtyPropGroups, changeset);

        expect(dirtyPropGroups.is(BaseView.PropertyGroups.Data | BaseView.PropertyGroups.Size)).toBe(true);
      });
    });

    describe("#__selectUpdateMethod(dirtyPropGroups) : methodInfo", function() {

      describe("view with all methods", function() {
        var view;
        var ViewWithAllUpdateHandlers;

        beforeAll(function() {
          ViewWithAllUpdateHandlers = BaseView.extend({
            _updateSize: function() {
            },
            _updateData: function() {
            },
            _updateDataAndSize: function() {
            },
            _updateSelection: function() {
            },
            _updateGeneral: function() {
            },
            _updateAll: function() {
            }
          });
        });

        beforeEach(function() {
          view = new ViewWithAllUpdateHandlers({
            model: model,
            domContainer: document.createElement("div")
          });
        });

        it("should return _updateSize when only the Size bit is set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.Size);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateSize"}));
        });

        it("should return _updateData when only the Data bit is set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.Data);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateData"}));
        });

        it("should return _updateSelection when only the Selection bit is set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.Selection);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateSelection"}));
        });

        it("should return _updateGeneral when only the General bit is set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.General);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateGeneral"}));
        });

        it("should return _updateAll when the All bit is set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.All);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateAll"}));
        });

        it("should return _updateDataAndSize when only the Data and Size bits are set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.Data | BaseView.PropertyGroups.Size);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateDataAndSize"}));
        });

        it("should fallback to _updateAll when only the Data and General bits are set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.Data | BaseView.PropertyGroups.General);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateAll"}));
        });

        it("should fallback to _updateAll when only the Data, Size and General bits are set", function() {

          var dirtyPropGroups = new BitSet(
            BaseView.PropertyGroups.Data | BaseView.PropertyGroups.Size | BaseView.PropertyGroups.General);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateAll"}));
        });
      });

      describe("view with some methods", function() {
        var view;
        var ViewWithSomeUpdateHandlers;

        beforeAll(function() {
          ViewWithSomeUpdateHandlers = BaseView.extend({
            _updateSize: function() {
            },
            _updateData: function() {
            },
            _updateDataAndSize: function() {
            },
            _updateAll: function() {
            }
          });
        });

        beforeEach(function() {
          view = new ViewWithSomeUpdateHandlers({
            model: model,
            domContainer: document.createElement("div")
          });
        });

        it("should return _updateSize when only the Size bit is set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.Size);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateSize"}));
        });

        it("should return _updateData when only the Data bit is set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.Data);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateData"}));
        });

        it("should return _updateAll when only the Selection bit is set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.Selection);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateAll"}));
        });

        it("should return _updateAll when only the General bit is set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.General);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateAll"}));
        });

        it("should return _updateAll when the All bit is set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.All);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateAll"}));
        });

        it("should return _updateDataAndSize when only the Data and Size bits are set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.Data | BaseView.PropertyGroups.Size);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateDataAndSize"}));
        });

        it("should fallback to _updateAll when only the Data and General bits are set", function() {

          var dirtyPropGroups = new BitSet(BaseView.PropertyGroups.Data | BaseView.PropertyGroups.General);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateAll"}));
        });

        it("should fallback to _updateAll when only the Data, Size and General bits are set", function() {

          var dirtyPropGroups = new BitSet(
            BaseView.PropertyGroups.Data | BaseView.PropertyGroups.Size | BaseView.PropertyGroups.General);

          var methodInfo = view.__selectUpdateMethod(dirtyPropGroups);

          expect(methodInfo).toEqual(jasmine.objectContaining({name: "_updateAll"}));
        });
      });
    });

    describe("#_update(event, action)", function() {
      var view;
      var CustomView;

      beforeAll(function() {
        CustomView = BaseView.extend({});
      });

      beforeEach(function() {
        view = new CustomView({
          model: model,
          domContainer: document.createElement("div")
        });
      });

      it("should call #__onChangeClassify with the given action's changeset", function() {

        spyOn(view, "__onChangeClassify");

        var action = {changeset: {}};
        var event = {action: action};

        view.__hasUpdatedAll = true;
        expect(view.hasUpdatedAll).toBe(true);

        var result = view._update(event, action);

        expect(view.__onChangeClassify).toHaveBeenCalledTimes(1);
        expect(view.__onChangeClassify).toHaveBeenCalledWith(jasmine.any(BitSet), action.changeset);

        return result;
      });

      it("should pass null to __onChangeClassify when #hasUpdatedAll is false", function() {

        spyOn(view, "__onChangeClassify").and.callFake(function(dirtyPropGroups) {
          dirtyPropGroups.set(BaseView.PropertyGroups.All);
        });
        spyOn(view, "__selectUpdateMethod").and.returnValue({name: "_updateAll"});

        var action = {changeset: {}};
        var event = {action: action};

        expect(view.hasUpdatedAll).toBe(false);

        return view._update(event, action).then(function() {
          expect(view.__onChangeClassify).toHaveBeenCalledWith(jasmine.any(BitSet), null);
        });
      });

      it("should not call #__selectUpdateMethod if #__onChangeClassify does not report dirty bits", function() {

        spyOn(view, "__onChangeClassify");
        spyOn(view, "__selectUpdateMethod");

        var action = {changeset: {}};
        var event = {action: action};

        var result = view._update(event, action);

        expect(view.__onChangeClassify).toHaveBeenCalledTimes(1);
        expect(view.__selectUpdateMethod).not.toHaveBeenCalled();

        return result;
      });

      it("should call #__selectUpdateMethod if #__onChangeClassify reports dirty bits", function() {

        spyOn(view, "__onChangeClassify").and.callFake(function(dirtyPropGroups) {
          dirtyPropGroups.set(BaseView.PropertyGroups.Size);
        });

        spyOn(view, "__selectUpdateMethod").and.returnValue({name: "_updateSize"});

        view._updateSize = jasmine.createSpy("_updateSize");

        var action = {changeset: {}};
        var event = {action: action};

        var result = view._update(event, action);

        expect(view.__onChangeClassify).toHaveBeenCalledTimes(1);
        expect(view.__selectUpdateMethod).toHaveBeenCalledTimes(1);
        expect(view.__selectUpdateMethod).toHaveBeenCalledWith(jasmine.any(BitSet));

        return result;
      });

      it("should call the method returned by #__selectUpdateMethod", function() {

        spyOn(view, "__onChangeClassify").and.callFake(function(dirtyPropGroups) {
          dirtyPropGroups.set(BaseView.PropertyGroups.Size);
        });

        spyOn(view, "__selectUpdateMethod").and.returnValue({name: "_updateSize"});

        view._updateSize = jasmine.createSpy("_updateSize");

        var action = {changeset: {}};
        var event = {action: action};

        var result = view._update(event, action);

        expect(view._updateSize).toHaveBeenCalledTimes(1);

        return result;
      });

      it("should allow returning nothing from the selected update method", function() {

        spyOn(view, "__onChangeClassify").and.callFake(function(dirtyPropGroups) {
          dirtyPropGroups.set(BaseView.PropertyGroups.Size);
        });

        spyOn(view, "__selectUpdateMethod").and.returnValue({name: "_updateSize"});

        view._updateSize = jasmine.createSpy("_updateSize");

        var action = {changeset: {}};
        var event = {action: action};

        var result = view._update(event, action);

        expect(typeof result.then).toBe("function");

        return result;
      });

      it("should allow returning a fulfilled promise from the update method", function() {

        spyOn(view, "__onChangeClassify").and.callFake(function(dirtyPropGroups) {
          dirtyPropGroups.set(BaseView.PropertyGroups.Size);
        });

        spyOn(view, "__selectUpdateMethod").and.returnValue({name: "_updateSize"});

        view._updateSize = jasmine.createSpy("_updateSize").and.returnValue(Promise.resolve());

        var action = {changeset: {}};
        var event = {action: action};

        var result = view._update(event, action);

        expect(typeof result.then).toBe("function");

        return result;
      });

      it("should set #hasUpdatedAll to true after the first successful update", function() {

        spyOn(view, "__onChangeClassify").and.callFake(function(dirtyPropGroups) {
          dirtyPropGroups.set(BaseView.PropertyGroups.Size);
        });

        spyOn(view, "__selectUpdateMethod").and.returnValue({name: "_updateSize"});

        view._updateSize = jasmine.createSpy("_updateSize").and.returnValue(Promise.resolve());

        var action = {changeset: {}, isRejected: false};
        var event = {action: action};

        expect(view.hasUpdatedAll).toBe(false);

        return view._update(event, action).then(function() {
          expect(view.hasUpdatedAll).toBe(true);
        });
      });

      it("should not set #hasUpdatedAll to true if the first update is rejected (i)", function() {

        spyOn(view, "__onChangeClassify").and.callFake(function(dirtyPropGroups) {
          dirtyPropGroups.set(BaseView.PropertyGroups.All);
        });

        spyOn(view, "__selectUpdateMethod").and.returnValue({name: "_updateAll"});

        spyOn(view, "_updateAll").and.returnValue(Promise.reject(new Error("Failed test error")));

        var action = {changeset: {}};
        var event = {action: action, isRejected: false};

        expect(view.hasUpdatedAll).toBe(false);

        return view._update(event, action).then(function() {
          return Promise.reject("Should have been rejected.");
        }, function() {
          expect(view.hasUpdatedAll).toBe(false);
        });
      });

      it("should not set #hasUpdatedAll to true if the first update is rejected (ii)", function() {

        spyOn(view, "__onChangeClassify").and.callFake(function(dirtyPropGroups) {
          dirtyPropGroups.set(BaseView.PropertyGroups.All);
        });

        spyOn(view, "__selectUpdateMethod").and.returnValue({name: "_updateAll"});

        spyOn(view, "_updateAll");

        var action = {changeset: {}};
        var event = {action: action, isRejected: true};

        expect(view.hasUpdatedAll).toBe(false);

        return view._update(event, action).then(function() {
          expect(view.hasUpdatedAll).toBe(false);
        });
      });
    });

    describe("#update() - integration", function() {

      function createUpdateSpies(view) {
        return {
          updateData:      spyOn(view, "_updateData"),
          updateSize:      spyOn(view, "_updateSize"),
          updateSelection: spyOn(view, "_updateSelection"),
          updateSizeAndSelection: spyOn(view, "_updateSizeAndSelection"),
          updateAll:       spyOn(view, "_updateAll")
        };
      }

      function configRequireJs(localRequire) {

        localRequire.define("test/foo/View", ["pentaho/visual/base/View"], function(BaseView) {
          return BaseView.extend({
            _updateData: function() {},
            _updateSize: function() {},
            _updateSelection: function() {},
            _updateSizeAndSelection: function() {}
          });
        });

        localRequire.define("test/foo/Model", ["pentaho/visual/base/Model"], function(BaseModel) {

          return BaseModel.extend({
            $type: {
              id: "test/foo/Model",
              props: [
                {
                  name: "x",
                  base: "pentaho/visual/role/Property"
                },
                {
                  name: "y",
                  base: "pentaho/visual/role/Property",
                  modes: [{dataType: "number"}]
                }
              ]
            }
          });
        });
      }

      function testView(tester) {

        return require.using(["test/foo/Model", "test/foo/View"], configRequireJs, function(FooModel, FooView) {

          var model = new FooModel({
            isAutoUpdate: false,
            width: 100,
            height: 100,
            data: new Table(getDataTableSpec1()),
            selectionFilter: {_: "or", o: [{_: "=", p: "country", v: "Portugal"}]},
            x: {fields: ["country"]},
            y: {fields: ["sales"]}
          });

          // Model is clean.
          model.__changeset = null;

          var view = new FooView({
            model: model,
            domContainer: document.createElement("div")
          });

          view.__hasUpdatedAll = true;

          return tester(model, view);
        });
      }

      describe("when configured with a full specification", function() {

        it("should call _updateData when only data has changed", function() {

          return testView(function(model, view) {

            var spies = createUpdateSpies(view);

            model.data = new Table(getDataTableSpec1());

            return model.update().then(function() {
              expect(spies.updateData).toHaveBeenCalled();
              expect(spies.updateSize).not.toHaveBeenCalled();
              expect(spies.updateSelection).not.toHaveBeenCalled();
              expect(spies.updateSizeAndSelection).not.toHaveBeenCalled();
              expect(spies.updateAll).not.toHaveBeenCalled();
            });
          });
        });
      });
    });

    describe("#dispose()", function() {

      function createView() {

        return new BaseView({
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

      it("should clear the domContainer", function() {

        var view = createView();

        expect(view.domContainer).not.toBe(null);
        view.dispose();
        expect(view.domContainer).toBe(null);
      });
    });

    describe("#extend", function() {

      // coverage
      it("should be possible to extend without passing an instSpec argument", function() {

        var view = new BaseView({
          width: 100,
          height: 100,
          domContainer: document.createElement("div"),
          model: model
        });

        view.extend();
      });

      it("should register _updateXyz method with the corresponding mask", function() {

        var updateSize = function() {};
        var DerivedView = BaseView.extend({
          _updateSize: updateSize
        });

        var info = DerivedView.__UpdateMethods[BaseView.PropertyGroups.Size];
        expect(info.name).toBe("_updateSize");
        expect(info.mask).toBe(BaseView.PropertyGroups.Size);

        expect(DerivedView.__UpdateMethodsList.indexOf(info)).toBeGreaterThan(-1);
      });

      it("should register _updateXyz method with the corresponding mask when using 'implement'", function() {

        var updateSize = function() {};
        var DerivedView = BaseView.extend({});

        DerivedView.implement({
          _updateSize: updateSize
        });

        var info = DerivedView.__UpdateMethods[BaseView.PropertyGroups.Size];
        expect(info.name).toBe("_updateSize");
        expect(info.mask).toBe(BaseView.PropertyGroups.Size);

        expect(DerivedView.__UpdateMethodsList.indexOf(info)).toBeGreaterThan(-1);
      });

      // TODO: should also test it logs a warning...
      it("should ignore an _updateXyz method which has no known property groups", function() {

        var count = BaseView.__UpdateMethodsList.length;

        var updateBarAndFoo = function() {};
        var DerivedView = BaseView.extend({
          _updateBarAndFoo: updateBarAndFoo
        });

        expect(DerivedView.__UpdateMethodsList.length).toBe(count);
      });

      it("should ignore unknown property groups and still register the _updateXyz method " +
         "under the known mask", function() {

        var updateSizeAndFoo = function() {};
        var DerivedView = BaseView.extend({
          _updateSizeAndFoo: updateSizeAndFoo
        });

        var info = DerivedView.__UpdateMethods[BaseView.PropertyGroups.Size];
        expect(info.name).toBe("_updateSizeAndFoo");
        expect(info.mask).toBe(BaseView.PropertyGroups.Size);

        expect(DerivedView.__UpdateMethodsList.indexOf(info)).toBeGreaterThan(-1);
      });

      it("should not re-register an update method that is already declared in the base class", function() {

        var updateSize = function() {};
        var DerivedView = BaseView.extend({
          _updateSize: updateSize
        });

        var info = DerivedView.__UpdateMethods[BaseView.PropertyGroups.Size];

        var DerivedView2 = DerivedView.extend({
          // Override
          _updateSize: function() {}
        });

        var info2 = DerivedView2.__UpdateMethods[BaseView.PropertyGroups.Size];

        expect(info2).toBe(info);
      });
    });
  });
});
