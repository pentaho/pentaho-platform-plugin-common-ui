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
  "pentaho/type/Context",
  "pentaho/visual/base",
  "pentaho/type/filter/or",
  "pentaho/type/filter/and",
  "pentaho/lang/UserError",
  "pentaho/visual/role/mapping"
], function(Context, modelFactory, orFilterFactory, andFilterFactory, UserError, mappingFactory) {
  "use strict";

  /* global jasmine:false, console:false, expect:false */

  describe("pentaho.visual.base.Model", function() {
    var context;
    var Model;
    var dataSpec;
    var OrFilter;
    var AndFilter;

    beforeEach(function() {
      context = new Context();
      Model = context.get(modelFactory);
      OrFilter = context.get(orFilterFactory);
      AndFilter = context.get(andFilterFactory);

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
        v: data
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

    it("should pre-load all standard visual role related modules", function() {
      function expectIt(lid) {
        expect(function() {
          expect(typeof require("pentaho/visual/role/" + lid)).toBe("function");
        }).not.toThrow();
      }

      expectIt("mapping");
      expectIt("quantitative");
      expectIt("ordinal");
      expectIt("nominal");
      expectIt("level");
      expectIt("aggregation");
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
          data: {v: {}}
        });

        expect(!!model.get("data")).toBe(true);

        var json = model.toJSON();

        expect(json instanceof Object).toBe(true);
        expect("data" in json).toBe(false);
      });

      it("should serialize the `data` property if keyArgs.omitProps.data = false", function() {
        var model = new Model({
          data: {v: {}}
        });

        expect(!!model.get("data")).toBe(true);

        var json = model.toSpec({isJson: true, omitProps: {data: false}});

        expect(json instanceof Object).toBe(true);
        expect("data" in json).toBe(true);
      });
    });

    describe("#toSpec()", function() {
      it("should serialize the `data` property", function() {
        var model = new Model({
          data: {v: {}}
        });

        expect(!!model.get("data")).toBe(true);

        var json = model.toSpec();

        expect(json instanceof Object).toBe(true);
        expect("data" in json).toBe(true);
      });
    });

    describe(".Type", function() {

      describe("#isVisualRole()", function() {
        it("should return true if type is a Mapping", function() {
          var Mapping = context.get(mappingFactory);
          var SubMapping = Mapping.extend({type: {levels: ["nominal"]}});

          expect(Model.type.isVisualRole(Mapping.type)).toBe(true);
          expect(Model.type.isVisualRole(SubMapping.type)).toBe(true);
        });

        it("should return false if type is not a Mapping", function() {
          var NotMapping = context.get("complex");

          expect(Model.type.isVisualRole(NotMapping.type)).toBe(false);
        });
      });

      describe("#eachVisualRole()", function() {
        var Mapping;
        var DerivedMapping;

        var DerivedModel;

        var forEachSpy;
        var forEachContext;

        beforeEach(function() {
          Mapping = context.get(mappingFactory);

          DerivedMapping = Mapping.extend({type: {levels: ["nominal"]}});

          DerivedModel = Model.extend({type: {
            props: [
              {name: "vr1", type: DerivedMapping},
              {name: "vr2", type: DerivedMapping},
              {name: "vr3", type: DerivedMapping}
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
