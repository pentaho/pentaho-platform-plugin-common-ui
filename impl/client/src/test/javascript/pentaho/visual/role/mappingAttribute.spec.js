define([
  "pentaho/type/Context",
  "pentaho/type/SpecificationScope",
  "pentaho/data/Table"
], function(Context, SpecificationScope, Table) {

  "use strict";

  /* globals describe, it, beforeEach, spyOn */

  describe("pentaho.visual.role.MappingAttribute", function() {

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
    var MappingAttribute;

    beforeEach(function(done) {

      Context.createAsync()
          .then(function(context) {

            return context.getDependencyApplyAsync([
              "pentaho/visual/base/model",
              "pentaho/visual/role/mapping",
              "pentaho/visual/role/mappingAttribute"
            ], function(_Model, _Mapping, _MappingAttribute) {
              VisualModel = _Model;
              Mapping = _Mapping;
              MappingAttribute = _MappingAttribute;
            });
          })
          .then(done, done.fail);

    });

    describe("constructor(name|spec)", function() {

      it("should allow creating with a spec object", function() {

        var name = "foo";
        var mapping = new MappingAttribute({name: name});
        expect(mapping instanceof MappingAttribute).toBe(true);

        expect(mapping.name).toBe(name);
      });

      it("should allow creating with a string and recognize it as the name property", function() {

        var name = "foo";
        var mapping = new MappingAttribute(name);
        expect(mapping instanceof MappingAttribute).toBe(true);

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
          propRole: {attributes: ["a", "b", "c"]}
        });
        mapping = derived.propRole;
      });

      it("should have #mapping return the parent mapping", function() {
        expect(mapping.attributes.at(0).mapping).toBe(mapping);
      });

      it("should have #mapping return `null` when there is no parent mapping", function() {
        expect(new MappingAttribute().mapping).toBe(null);
      });

      it("should have #model return the parent mapping's model", function() {
        expect(mapping.attributes.at(0).model).toBe(derived);
      });

      it("should have #model return `null` when there is no parent mapping", function() {
        expect(new MappingAttribute().model).toBe(null);
      });

      it("should have #model return `null` when the parent mapping has no model", function() {
        var mappingNoModel = new Mapping({attributes: ["a", "b", "c"]});

        expect(mappingNoModel.attributes.at(0).model).toBe(null);
      });
    });

    describe("#__dataAttribute", function() {

      var derived;
      var mapping;

      beforeEach(function() {

        var DerivedModel = VisualModel.extend({$type: {
          props: [
            {name: "propRole", base: "pentaho/visual/role/property"}
          ]
        }});

        derived = new DerivedModel({
          propRole: {
            attributes: ["undefined", "country", "date"]
          }
        });

        mapping = derived.propRole;
      });

      it("should return null if the mapping attribute has no name", function() {

        expect(new MappingAttribute().__dataAttribute).toBe(null);
      });

      it("should return null if the mapping attribute has name but no parent mapping", function() {

        expect(new MappingAttribute({name: "a"}).__dataAttribute).toBe(null);
      });

      it("should return null if the mapping attribute has name, parent mapping, but no model", function() {

        var mappingWithNoModel = new Mapping({
          attributes: ["a", "b", "c"]
        });

        expect(mappingWithNoModel.attributes.at(0).__dataAttribute).toBe(null);
      });

      it("should return null if the mapping attribute has name, parent mapping, model but no data", function() {

        expect(mapping.attributes.at(0).__dataAttribute).toBe(null);
      });

      it("should return null if the mapping attribute has name, parent mapping, model, data, " +
         "but attribute is not defined", function() {

        derived.data = new Table(getDataSpec1());

        expect(mapping.attributes.at(0).__dataAttribute).toBe(null);
      });

      it("should return the data table attribute if the mapping attribute has name, parent mapping, model, data, " +
          "and exists in the data table", function() {

        var data = derived.data = new Table(getDataSpec1());

        expect(mapping.attributes.at(1).__dataAttribute).toBe(data.model.attributes.get("country"));
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
          var mapping = new MappingAttribute({name: name});

          var result = mapping.toSpecInContext(serializeOptions);

          specScope.dispose();

          expect(result).toBe(name);
        }

        expectIt({includeDefaults: false});
        expectIt({includeDefaults: true});
      });

      it("should return an array when the base serialization is an array", function() {

        var mapping = new MappingAttribute({name: "foo"});

        var result = mapping.toSpecInContext({includeDefaults: false, preferPropertyArray: true});

        specScope.dispose();

        expect(Array.isArray(result)).toBe(true);
      });
    });
  });
});
