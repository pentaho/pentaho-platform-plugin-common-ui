/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/type/SpecificationScope",
  "pentaho/data/Table"
], function(Context, SpecificationScope, Table) {

  "use strict";

  /* globals describe, it, beforeEach, spyOn */

  describe("pentaho.visual.role.MappingField", function() {

    function getDataSpec1() {
      return {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "product", type: "string", label: "Product"},
          {name: "sales", type: "number", label: "Sales"},
          {name: "date", type: "date", label: "Date"}
        ],
        rows: [
          {c: ["Portugal", "fish", 100, "2016-01-01"]},
          {c: ["Ireland", "beer", 200, "2016-01-02"]}
        ]
      };
    }

    var VisualModel;
    var Mapping;
    var MappingField;

    beforeEach(function(done) {

      Context.createAsync()
          .then(function(context) {

            return context.getDependencyApplyAsync([
              "pentaho/visual/base/model",
              "pentaho/visual/role/mapping",
              "pentaho/visual/role/mappingField"
            ], function(_Model, _Mapping, _MappingField) {
              VisualModel = _Model;
              Mapping = _Mapping;
              MappingField = _MappingField;
            });
          })
          .then(done, done.fail);

    });

    describe("constructor(name|spec)", function() {

      it("should allow creating with a spec object", function() {

        var name = "foo";
        var mapping = new MappingField({name: name});
        expect(mapping instanceof MappingField).toBe(true);

        expect(mapping.name).toBe(name);
      });

      it("should allow creating with a string and recognize it as the name property", function() {

        var name = "foo";
        var mapping = new MappingField(name);
        expect(mapping instanceof MappingField).toBe(true);

        expect(mapping.name).toBe(name);
      });
    });

    describe("#model and #mapping", function() {

      var derived;
      var mapping;

      beforeEach(function() {

        var DerivedModel = VisualModel.extend({$type: {
          props: [
            {name: "propRole", base: "pentaho/visual/role/property"}
          ]
        }});

        derived = new DerivedModel({
          propRole: {fields: ["a", "b", "c"]}
        });
        mapping = derived.propRole;
      });

      it("should have #mapping return the parent mapping", function() {
        expect(mapping.fields.at(0).mapping).toBe(mapping);
      });

      it("should have #mapping return `null` when there is no parent mapping", function() {
        expect(new MappingField().mapping).toBe(null);
      });

      it("should have #model return the parent mapping's model", function() {
        expect(mapping.fields.at(0).model).toBe(derived);
      });

      it("should have #model return `null` when there is no parent mapping", function() {
        expect(new MappingField().model).toBe(null);
      });

      it("should have #model return `null` when the parent mapping has no model", function() {
        var mappingNoModel = new Mapping({fields: ["a", "b", "c"]});

        expect(mappingNoModel.fields.at(0).model).toBe(null);
      });
    });

    describe("#toSpecInContext(keyArgs)", function() {

      var specScope;

      beforeEach(function() {

        specScope = new SpecificationScope();
      });

      it("should return a string when only the name property is serialized", function() {
        function expectIt(serializeOptions) {
          var name = "foo";
          var mapping = new MappingField({name: name});

          var result = mapping.toSpecInContext(serializeOptions);

          specScope.dispose();

          expect(result).toBe(name);
        }

        expectIt({includeDefaults: false});
        expectIt({includeDefaults: true});
      });

      it("should return an array when the base serialization is an array", function() {

        var mapping = new MappingField({name: "foo"});

        var result = mapping.toSpecInContext({includeDefaults: false, preferPropertyArray: true});

        specScope.dispose();

        expect(Array.isArray(result)).toBe(true);
      });
    });
  });
});
