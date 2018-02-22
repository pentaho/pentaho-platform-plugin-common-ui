/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/visual/scene/Base",
  "pentaho/visual/scene/util",
  "pentaho/type/Context",
  "pentaho/data/Table",
  "tests/pentaho/util/errorMatch"
], function(Scene, sceneUtil, Context, DataTable, errorMatch) {

  /* globals it, describe, beforeEach, beforeAll */

  /* eslint max-nested-callbacks: 0 */

  function getDatasetDT1WithTwoKeyColumns() {
    return {
      model: [
        {name: "country", type: "string", label: "Country", isKey: true},
        {name: "city", type: "string", label: "City", isKey: true},
        {name: "sales", type: "number", label: "Sales"}
      ],
      rows: [
        {c: [{v: "Portugal", f: "Portucale"}, {v: "Lisbon", f: "Lisboa"}, {v: 12000}]},
        {c: [{v: "Ireland"}, "Edinburgh", {v: 6000}]}
      ]
    };
  }

  describe("pentaho.visual.scene.Base", function() {

    var AbstractFilter;
    var VisualModel;
    var View;

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(context) {

            return context.getDependencyApplyAsync([
              "pentaho/data/filter/abstract",
              "pentaho/visual/base/model",
              "pentaho/visual/base/view"
            ], function(_AbstractFilter, _VisualModel, _View) {
              AbstractFilter = _AbstractFilter;
              VisualModel = _VisualModel;
              View = _View;
            });
          })
          .then(done, done.fail);
    });

    describe("new (parent, view)", function() {

      it("should throw when given no arguments", function() {
        expect(function() {
          // eslint-disable-next-line no-unused-vars
          var scene = new Scene();
        }).toThrow(errorMatch.argRequired("view"));
      });

      describe("when given (parent: null, view)", function() {

        var CustomView;
        var view;
        var rootScene;

        beforeAll(function() {
          CustomView = View.extend();
        });

        beforeEach(function() {
          view = new CustomView();
          rootScene = new Scene(null, view);
        });

        it("should create a scene instance", function() {
          expect(rootScene instanceof Scene).toBe(true);
        });

        it("should have #parent be null", function() {
          expect(rootScene.parent).toBe(null);
          expect(rootScene.index).toBe(-1);
        });

        it("should have #root be itself", function() {
          expect(rootScene.root).toBe(rootScene);
        });

        it("should have #view be the given view", function() {
          expect(rootScene.view).toBe(view);
        });

        it("should have #vars be a root variable map", function() {
          expect(rootScene.vars != null).toBe(true);
          expect(Object.getPrototypeOf(rootScene.vars)).toBe(null);
        });

        // In the sense of own enumerable ;-)
        it("should have #vars be an empty variable map", function() {
          expect(Object.keys(rootScene.vars).length).toBe(0);
        });
      });

      describe("when given (parent: root, view: null)", function() {
        var CustomView;
        var view;
        var rootScene;
        var childScene;

        beforeAll(function() {
          CustomView = View.extend();
        });

        beforeEach(function() {
          view = new CustomView();
          rootScene = new Scene(null, view);

          // eslint-disable-next-line no-unused-vars
          var childScene1 = new Scene(rootScene);

          childScene = new Scene(rootScene);
        });

        it("should create a scene instance", function() {
          expect(childScene instanceof Scene).toBe(true);
        });

        it("should have #parent be the given parent", function() {
          expect(childScene.parent).toBe(rootScene);
          expect(childScene.index).toBe(1);
        });

        it("should have #index be that of the last child", function() {
          expect(childScene.index).toBe(childScene.parent.children.length - 1);
        });

        it("should have #root be the parent's root", function() {
          expect(childScene.root).toBe(rootScene.root);
        });

        it("should have #view be the parent's view", function() {
          expect(childScene.view).toBe(view);
        });

        it("should have #vars have the parent's #vars as prototype", function() {
          expect(childScene.vars != null).toBe(true);
          expect(Object.getPrototypeOf(childScene.vars)).toBe(rootScene.vars);
        });

        // In the sense of own enumerable ;-)
        it("should have #vars be empty", function() {
          expect(Object.keys(childScene.vars).length).toBe(0);
        });
      });

      describe("when given (parent: notRoot, view: null)", function() {
        var CustomView;
        var view;
        var rootScene;
        var parentScene;
        var childScene;

        beforeAll(function() {
          CustomView = View.extend();
        });

        beforeEach(function() {
          view = new CustomView();
          rootScene = new Scene(null, view);
          parentScene = new Scene(rootScene);

          // eslint-disable-next-line no-unused-vars
          var childScene1 = new Scene(parentScene);

          childScene = new Scene(parentScene);
        });

        it("should create a scene instance", function() {
          expect(childScene instanceof Scene).toBe(true);
        });

        it("should have #parent be the given parent", function() {
          expect(childScene.parent).toBe(parentScene);
          expect(childScene.index).toBe(1);
        });

        it("should have #index be that of the last child", function() {
          expect(childScene.index).toBe(childScene.parent.children.length - 1);
        });

        it("should have #root be the root scene", function() {
          expect(childScene.root).toBe(rootScene);
        });

        it("should have #view be the root's view", function() {
          expect(childScene.view).toBe(view);
        });

        it("should have #vars have the parent's #vars as prototype", function() {
          expect(childScene.vars != null).toBe(true);
          expect(Object.getPrototypeOf(childScene.vars)).toBe(parentScene.vars);
        });

        // In the sense of own enumerable ;-)
        it("should have #vars be empty", function() {
          expect(Object.keys(childScene.vars).length).toBe(0);
        });
      });
    });

    describe("#setVar(name, value, formatted)", function() {

      var CustomView;
      var view;
      var parentScene;
      var childScene;

      beforeAll(function() {
        CustomView = View.extend();
      });

      beforeEach(function() {
        view = new CustomView();
        parentScene = new Scene(null, view);
        childScene = new Scene(parentScene);
      });

      it("should create a local variable", function() {
        parentScene.setVar("category", "Portugal", "Portucale");

        // `vars` has a null prototype!
        expect(Object.prototype.hasOwnProperty.call(parentScene.vars, "category"));
      });

      it("should create an enumerable local variable", function() {

        parentScene.setVar("category", "Portugal", "Portucale");

        expect(Object.keys(parentScene.vars).length).toBe(1);
      });

      it("should create a deletable local variable", function() {

        parentScene.setVar("category", "Portugal", "Portucale");

        delete parentScene.vars.category;

        expect(Object.keys(parentScene.vars).length).toBe(0);
      });

      it("should create a variable that exposes the given values according to IVariable", function() {

        parentScene.setVar("category", "Portugal", "Portucale");

        var categoryVar = parentScene.vars.category;

        expect(categoryVar instanceof Object).toBe(true);

        expect(categoryVar.value).toBe("Portugal");
        expect(categoryVar.valueOf()).toBe("Portugal");

        expect(categoryVar.formatted).toBe("Portucale");
        expect(categoryVar.toString()).toBe("Portucale");
      });

      it("should convert a missing formatted argument to null", function() {

        parentScene.setVar("category", "Portugal");

        var categoryVar = parentScene.vars.category;

        expect(categoryVar instanceof Object).toBe(true);

        expect(categoryVar.value).toBe("Portugal");
        expect(categoryVar.valueOf()).toBe("Portugal");

        expect(categoryVar.formatted).toBe(null);
        expect(categoryVar.toString()).toBe(null);
      });

      it("should return the scene", function() {
        var result = parentScene.setVar("category", "Portugal", "Portucale");
        expect(result).toBe(parentScene);
      });

      it("should shadow a same named parent variable", function() {

        parentScene.setVar("category", "Portugal", "Portucale");
        childScene.setVar("category", "Ireland", "Irlanda");

        var parentCategoryVar = parentScene.vars.category;
        var childCategoryVar = childScene.vars.category;

        expect(parentCategoryVar.value).toBe("Portugal");
        expect(parentCategoryVar.formatted).toBe("Portucale");

        expect(childCategoryVar.value).toBe("Ireland");
        expect(childCategoryVar.formatted).toBe("Irlanda");
      });

      it("should replace an existing variable with the same name", function() {

        parentScene.setVar("category", "Portugal", "Portucale");

        var categoryVar1 = parentScene.vars.category;

        parentScene.setVar("category", "Ireland", "Irlanda");

        var categoryVar2 = parentScene.vars.category;

        expect(categoryVar2 instanceof Object).toBe(true);

        expect(categoryVar2).not.toBe(categoryVar1);

        expect(categoryVar2.value).toBe("Ireland");
        expect(categoryVar2.formatted).toBe("Irlanda");
      });
    });

    describe("#createFilter()", function() {

      var CustomView;
      var CustomModel;

      var view;
      var model;

      var parentScene;

      beforeAll(function() {
        CustomView = View.extend();
        CustomModel = VisualModel.extend();
      });

      beforeEach(function() {
        model = new CustomModel();
        view = new CustomView({model: model});

        parentScene = new Scene(null, view);
      });

      it("should call scene.util.createFilterForVars with this vars and this view's model", function() {

        spyOn(sceneUtil, "createFilterForVars");

        parentScene.createFilter();

        expect(sceneUtil.createFilterForVars).toHaveBeenCalledWith(parentScene.vars, model);
      });

      it("should call scene.util.createFilterForVars and return the returned filter", function() {

        var filter = {};
        spyOn(sceneUtil, "createFilterForVars").and.returnValue(filter);

        var result = parentScene.createFilter();

        expect(result).toBe(filter);
      });
    });

    describe("#invert(keyArgs)", function() {

      var CustomView;
      var CustomModel;

      var view;
      var model;

      var parentScene;

      beforeAll(function() {
        CustomView = View.extend();
        CustomModel = VisualModel.extend();
      });

      beforeEach(function() {
        model = new CustomModel();
        view = new CustomView({model: model});

        parentScene = new Scene(null, view);
      });

      it("should call scene.util.invertVars with this vars, this view's model and the given keyArgs", function() {

        spyOn(sceneUtil, "invertVars");

        var keyArgs = {};

        parentScene.invert(keyArgs);

        expect(sceneUtil.invertVars).toHaveBeenCalledWith(parentScene.vars, model, keyArgs);
      });

      it("should call scene.util.invertVars and return the resulting cells map", function() {

        var cellsMap = {};
        spyOn(sceneUtil, "invertVars").and.returnValue(cellsMap);

        var result = parentScene.invert();

        expect(result).toBe(cellsMap);
      });
    });

    describe(".buildScenesFlat(view)", function() {

      var CustomView;
      var CustomModel;

      var view;
      var model;

      beforeAll(function() {
        CustomView = View.extend();

        CustomModel = VisualModel.extend({
          $type: {
            props: [
              {
                name: "category",
                base: "pentaho/visual/role/property"
              },
              {
                name: "series",
                base: "pentaho/visual/role/property"
              },
              {
                name: "measure",
                base: "pentaho/visual/role/property",
                modes: [{dataType: "number"}]
              }
            ]
          }
        });
      });

      beforeEach(function() {

        model = new CustomModel({
          data: new DataTable(getDatasetDT1WithTwoKeyColumns()),
          category: {
            fields: ["country", "city"]
          },
          measure: {
            fields: ["sales"]
          }
        });

        view = new CustomView({model: model});
      });

      it("should return a root scene", function() {

        var parentScene = Scene.buildScenesFlat(view);

        // ---

        expect(parentScene.root).toBe(parentScene);
      });

      it("should return a scene whose view is the given view", function() {

        var parentScene = Scene.buildScenesFlat(view);

        // ---

        expect(parentScene.view).toBe(view);
      });

      it("should return a scene with as many child scenes as there are data table rows", function() {

        var parentScene = Scene.buildScenesFlat(view);

        // ---

        expect(parentScene.children.length).toBe(view.model.data.getNumberOfRows());
      });

      it("should return a scene whose child scenes have one variable for each of the mapped visual roles", function() {

        var parentScene = Scene.buildScenesFlat(view);

        // ---

        var childScene = parentScene.children[0];

        expect(childScene.vars.category.value).toBe("Portugal~Lisbon");
        expect(childScene.vars.category.formatted).toBe("Portucale ~ Lisboa");

        expect(Object.prototype.hasOwnProperty.call(childScene.vars, "series")).toBe(false);

        expect(childScene.vars.measure.value).toBe(12000);
        expect(childScene.vars.measure.formatted).toBe("12000");

        // ---

        childScene = parentScene.children[1];

        expect(childScene.vars.category.value).toBe("Ireland~Edinburgh");
        expect(childScene.vars.category.formatted).toBe("Ireland ~ Edinburgh");

        expect(Object.prototype.hasOwnProperty.call(childScene.vars, "series")).toBe(false);

        expect(childScene.vars.measure.value).toBe(6000);
        expect(childScene.vars.measure.formatted).toBe("6000");
      });
    });
  });
});
