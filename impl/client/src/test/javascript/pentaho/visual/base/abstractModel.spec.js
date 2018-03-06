/*!
 * Copyright 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/Context",
  "pentaho/data/Table"
], function(Context, Table) {

  "use strict";

  /* globals jasmine, console, expect, it, describe, beforeEach */

  describe("pentaho.visual.base.AbstractModel", function() {

    var context;
    var Model;
    var RoleBaseProperty;
    var PaletteProperty;
    var dataSpec;

    beforeEach(function(done) {

      Context.createAsync()
          .then(function(_context) {
            context = _context;

            return context.getDependencyApplyAsync([
              "pentaho/visual/base/abstractModel",
              "pentaho/visual/role/baseProperty",
              "pentaho/visual/color/paletteProperty"
            ], function(_AbstractModel, _RoleBaseProperty, _PaletteProperty) {
              var AbstractModel = _AbstractModel;
              RoleBaseProperty = _RoleBaseProperty;
              PaletteProperty = _PaletteProperty;

              Model = AbstractModel.extend();
            });
          })
          .then(done, done.fail);

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
        v: new Table(data)
      };
    });

    it("can be instantiated with a well-formed spec", function() {
      expect(function() {
        return new Model({
          data: dataSpec
        });
      }).not.toThrowError();
    });

    it("can be instantiated without arguments", function() {
      expect(function() {
        return new Model();
      }).not.toThrowError();
    });

    it("should preload registered filter types", function(done) {

      require.using(["pentaho/type/Context"], function(Context) {

        return Context.createAsync().then(function(context) {

          return context.getDependencyApplyAsync(["pentaho/visual/base/abstractModel"], function() {

            context.get("pentaho/data/filter/or");
          });
        });
      })
      .then(done, done.fail);
    });

    it("should pre-load all standard base visual role related modules", function(done) {

      require.using(["pentaho/type/Context"], function(Context) {

        return Context.createAsync().then(function(context) {

          return context.getDependencyApplyAsync(["pentaho/visual/base/abstractModel"], function() {

            context.get("pentaho/visual/role/baseProperty");
          });
        });
      })
      .then(done, done.fail);
    });

    describe("#application", function() {

      it("should have a default application of null", function() {
        var model = new Model();
        expect(model.application).toBe(null);
      });
    });

    describe("#selectionFilter", function() {

      it("should have a default selectionFilter", function() {
        var model = new Model();
        var selectionFilter = model.selectionFilter;

        var AbstractFilter = context.get("pentaho/data/filter/abstract");
        expect(selectionFilter).toBeDefined();
        expect(selectionFilter instanceof AbstractFilter).toBe(true);
      });
    });

    describe("#validate()", function() {

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
          data: dataSpec
        });
      });

      it("a model spec is invalid if at least one required property is omitted", function() {
        invalidSpec();
        invalidSpec({});
      });

    });

    describe("#toJSON()", function() {
      it("should not serialize the `data` property by default", function() {
        var model = new Model({
          data: {v: new Table({})}
        });

        expect(!!model.get("data")).toBe(true);

        var json = model.toJSON();

        expect(json instanceof Object).toBe(true);
        expect("data" in json).toBe(false);
      });

      it("should serialize the `data` property if keyArgs.omitProps.data = false", function() {
        var model = new Model({
          data: {v: new Table({})}
        });

        expect(!!model.get("data")).toBe(true);

        var json = model.toSpec({isJson: true, omitProps: {data: false}});

        expect(json instanceof Object).toBe(true);
        expect("data" in json).toBe(true);
      });

      it("should not serialize the `selectionFilter` property by default", function() {
        var model = new Model({
          selectionFilter: {_: "pentaho/data/filter/and"}
        });

        expect(!!model.get("selectionFilter")).toBe(true);

        var json = model.toJSON();

        expect(json instanceof Object).toBe(true);
        expect("selectionFilter" in json).toBe(false);
      });

      it("should not serialize the `application` property by default", function() {
        var model = new Model({application: {}});
        expect(model.application != null).toBe(true);

        var result = model.toSpec({isJson: true});
        expect("application" in result).toBe(false);
      });

      it("should serialize the `application` property if keyArgs.omitProps.application = false", function() {
        var model = new Model({application: {}});
        expect(model.application != null).toBe(true);

        var result = model.toSpec({isJson: true, omitProps: {application: false}});
        expect(result.application != null).toBe(true);
        expect(typeof result.application).toBe("object");
      });

      it("should serialize the `selectionFilter` property if keyArgs.omitProps.selectionFilter = false", function() {
        var model = new Model({
          selectionFilter: {_: "pentaho/data/filter/and"}
        });

        expect(!!model.get("selectionFilter")).toBe(true);

        var json = model.toSpec({isJson: true, omitProps: {selectionFilter: false}});

        expect(json instanceof Object).toBe(true);
        expect("selectionFilter" in json).toBe(true);
      });
    });

    describe("#toSpec()", function() {

      it("should serialize the `data` property", function() {
        var model = new Model({
          data: {v: new Table({})}
        });

        expect(!!model.get("data")).toBe(true);

        var json = model.toSpec();

        expect(json instanceof Object).toBe(true);
        expect("data" in json).toBe(true);
      });

      it("should serialize the `selectionFilter` property", function() {
        var model = new Model({
          width: 1,
          height: 1,
          selectionFilter: {_: "pentaho/data/filter/and"}
        });

        expect(!!model.get("selectionFilter")).toBe(true);

        var json = model.toSpec();

        expect(json instanceof Object).toBe(true);
        expect("selectionFilter" in json).toBe(true);
      });

      it("should serialize the `application` property", function() {
        var model = new Model({application: {}});
        expect(model.application != null).toBe(true);

        var result = model.toSpec();
        expect(result.application != null).toBe(true);
        expect(typeof result.application).toBe("object");
      });
    });

    describe(".Type", function() {

      describe("#isVisualRole()", function() {

        it("should return true if property type is a role.Property", function() {

          var SubRoleProperty = RoleBaseProperty.extend();

          expect(Model.type.isVisualRole(RoleBaseProperty.type)).toBe(true);
          expect(Model.type.isVisualRole(SubRoleProperty.type)).toBe(true);
        });

        it("should return false if type is not a Mapping", function() {
          var NotRoleProp = context.get("complex");

          expect(Model.type.isVisualRole(NotRoleProp.type)).toBe(false);
        });
      });

      describe("#isColorPalette()", function() {

        it("should return true if property type is a color.PaletteProperty", function() {

          var SubColorPaletteProperty = PaletteProperty.extend();

          expect(Model.type.isColorPalette(PaletteProperty.type)).toBe(true);
          expect(Model.type.isColorPalette(SubColorPaletteProperty.type)).toBe(true);
        });

        it("should return false if type is not a Color Palette", function() {

          var NotPaletteProp = context.get("complex");

          expect(Model.type.isColorPalette(NotPaletteProp.type)).toBe(false);
        });
      });

      describe("#eachVisualRole()", function() {

        var DerivedModel;

        var forEachSpy;
        var forEachContext;

        beforeEach(function() {

          DerivedModel = Model.extend({$type: {
            props: [
              {name: "vr1", base: RoleBaseProperty},
              {name: "vr2", base: RoleBaseProperty},
              {name: "vr3", base: RoleBaseProperty}
            ]
          }});

          forEachSpy = jasmine.createSpy("forEachSpy");
          forEachContext = {};
        });

        it("should call function for each defined visual role property", function() {

          DerivedModel.type.eachVisualRole(forEachSpy);

          expect(forEachSpy).toHaveBeenCalledTimes(3);

          expect(forEachSpy).toHaveBeenCalledWith(DerivedModel.type.get("vr1"), 0, DerivedModel.type);
          expect(forEachSpy).toHaveBeenCalledWith(DerivedModel.type.get("vr2"), 1, DerivedModel.type);
          expect(forEachSpy).toHaveBeenCalledWith(DerivedModel.type.get("vr3"), 2, DerivedModel.type);
        });

        it("should break iteration if function returns false", function() {

          forEachSpy.and.returnValues(true, false);

          DerivedModel.type.eachVisualRole(forEachSpy);

          expect(forEachSpy).toHaveBeenCalledTimes(2);

          expect(forEachSpy).toHaveBeenCalledWith(DerivedModel.type.get("vr1"), 0, DerivedModel.type);
          expect(forEachSpy).toHaveBeenCalledWith(DerivedModel.type.get("vr2"), 1, DerivedModel.type);
        });

        it("should set context object on which the function is called", function() {

          DerivedModel.type.eachVisualRole(forEachSpy, forEachContext);

          forEachSpy.calls.all().forEach(function(info) {
            expect(info.object).toBe(forEachContext);
          });
        });
      });
    });
  });
});
