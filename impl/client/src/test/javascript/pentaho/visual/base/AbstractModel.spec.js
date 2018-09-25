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
  "pentaho/visual/base/AbstractModel",
  "pentaho/visual/base/KeyTypes",
  "pentaho/visual/role/AbstractProperty",
  "pentaho/visual/role/AbstractMapping",
  "pentaho/visual/color/PaletteProperty",
  "pentaho/data/filter/Abstract",
  "pentaho/data/Table",
  "pentaho/type/Complex"
], function(AbstractModel, VisualKeyTypes, RoleAbstractProperty, RoleAbstractMapping, PaletteProperty, AbstractFilter, Table, Complex) {

  "use strict";

  describe("pentaho.visual.base.AbstractModel", function() {

    var Model;
    var dataSpec;

    beforeAll(function() {
      Model = AbstractModel.extend({
        $type: {
          visualKeyType: VisualKeyTypes.dataKey
        }
      });
    });

    beforeEach(function() {

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

    it("should preload registered filter types", function() {

      require.using(["require", "pentaho/visual/base/AbstractModel"], function(localRequire) {
        localRequire("pentaho/data/filter/Or");
      });
    });

    it("should pre-load all standard base visual role related modules", function() {

      require.using(["require", "pentaho/visual/base/AbstractModel"], function(localRequire) {
        localRequire("pentaho/visual/role/AbstractProperty");
      });
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
          selectionFilter: {_: "pentaho/data/filter/And"}
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
          selectionFilter: {_: "pentaho/data/filter/And"}
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
          selectionFilter: {_: "pentaho/data/filter/And"}
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

    describe("#keyFieldNames", function() {

      var DerivedModel;

      beforeEach(function() {

        var RoleMapping = RoleAbstractMapping.extend({
          $type: {
          }
        });

        var RoleProperty = RoleAbstractProperty.extend({
          $type: {
            valueType: RoleMapping
          }
        });

        DerivedModel = Model.extend({$type: {
          props: [
            {name: "vr1", base: RoleProperty, get isVisualKey() { return true; }},
            {name: "vr2", base: RoleProperty, get isVisualKey() { return false; }},
            {name: "vr3", base: RoleProperty, get isVisualKey() { return true; }}
          ]
        }});
      });

      // Cannot isEqual([]) cause the array has the `set` property.
      function expectArray(result, expected) {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(expected.length);

        var i = -1;
        var L = Math.min(result.length, expected.length);
        while(++i < L) {
          expect(result[i]).toBe(expected[i]);
        }
      }

      it("should return an empty array when key visual roles are not mapped", function() {

        var model = new DerivedModel();

        var result = model.keyFieldNames;

        expectArray(result, []);
      });

      it("should return an array of the fields mapped to key visual roles", function() {

        var model = new DerivedModel({
          vr1: {fields: ["a", "b"]},
          vr2: {fields: ["c", "d"]},
          vr3: {fields: ["e", "f"]}
        });

        var result = model.keyFieldNames;

        expectArray(result, ["a", "b", "e", "f"]);
      });

      it("should return an array of distinct fields", function() {

        var model = new DerivedModel({
          vr1: {fields: ["a", "b"]},
          vr2: {fields: ["c", "d"]},
          vr3: {fields: ["a", "f"]}
        });

        var result = model.keyFieldNames;

        expectArray(result, ["a", "b", "f"]);
      });

      it("should return an array of key fields even if some are also mapped to measure visual roles", function() {

        var model = new DerivedModel({
          vr1: {fields: ["a", "b"]},
          vr2: {fields: ["b", "d"]},
          vr3: {fields: ["e", "f"]}
        });

        var result = model.keyFieldNames;

        expectArray(result, ["a", "b", "e", "f"]);
      });

      it("should return an empty array if the visualKeyType is not dataKey", function() {

        DerivedModel.type.visualKeyType = VisualKeyTypes.dataOrdinal;

        var model = new DerivedModel({
          vr1: {fields: ["a", "b"]},
          vr2: {fields: ["c", "d"]},
          vr3: {fields: ["e", "f"]}
        });

        var result = model.keyFieldNames;

        expectArray(result, []);
      });
    });

    describe("#measureFieldNames", function() {

      var DerivedModel;

      beforeEach(function() {

        var RoleMapping = RoleAbstractMapping.extend({
          $type: {
          }
        });

        var RoleProperty = RoleAbstractProperty.extend({
          $type: {
            valueType: RoleMapping
          }
        });

        DerivedModel = Model.extend({$type: {
          props: [
            {name: "vr1", base: RoleProperty, get isVisualKey() { return false; }},
            {name: "vr2", base: RoleProperty, get isVisualKey() { return true; }},
            {name: "vr3", base: RoleProperty, get isVisualKey() { return false; }}
          ]
        }});
      });

      // Cannot isEqual([]) cause the array has the `set` property.
      function expectArray(result, expected) {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(expected.length);

        var i = -1;
        var L = Math.min(result.length, expected.length);
        while(++i < L) {
          expect(result[i]).toBe(expected[i]);
        }
      }

      it("should return an empty array when measure visual roles are not mapped", function() {

        var model = new DerivedModel();

        var result = model.measureFieldNames;

        expectArray(result, []);
      });

      it("should return an array of the fields mapped to measure visual roles", function() {

        var model = new DerivedModel({
          vr1: {fields: ["a", "b"]},
          vr2: {fields: ["c", "d"]},
          vr3: {fields: ["e", "f"]}
        });

        var result = model.measureFieldNames;

        expectArray(result, ["a", "b", "e", "f"]);
      });

      it("should return an array of distinct fields", function() {

        var model = new DerivedModel({
          vr1: {fields: ["a", "b"]},
          vr2: {fields: ["c", "d"]},
          vr3: {fields: ["a", "f"]}
        });

        var result = model.measureFieldNames;

        expectArray(result, ["a", "b", "f"]);
      });

      it("should return an empty array if the visualKeyType is not dataKey", function() {

        DerivedModel.type.visualKeyType = VisualKeyTypes.dataOrdinal;

        var model = new DerivedModel({
          vr1: {fields: ["a", "b"]},
          vr2: {fields: ["c", "d"]},
          vr3: {fields: ["a", "f"]}
        });

        var result = model.measureFieldNames;

        expectArray(result, []);
      });

      it("should return an array of the measure fields not also mapped to key visual roles", function() {

        var model = new DerivedModel({
          vr1: {fields: ["a", "b"]},
          vr2: {fields: ["b", "d"]},
          vr3: {fields: ["e", "f"]}
        });

        var result = model.measureFieldNames;

        expectArray(result, ["a", "e", "f"]);
      });
    });

    describe(".Type", function() {

      describe("#isVisualRole()", function() {

        it("should return true if property type is a role.Property", function() {

          var SubRoleProperty = RoleAbstractProperty.extend();

          expect(Model.type.isVisualRole(RoleAbstractProperty.type)).toBe(true);
          expect(Model.type.isVisualRole(SubRoleProperty.type)).toBe(true);
        });

        it("should return false if type is not a Mapping", function() {

          var NotRoleProp = Complex;

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

          var NotPaletteProp = Complex;

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
              {name: "vr1", base: RoleAbstractProperty},
              {name: "vr2", base: RoleAbstractProperty},
              {name: "vr3", base: RoleAbstractProperty}
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
