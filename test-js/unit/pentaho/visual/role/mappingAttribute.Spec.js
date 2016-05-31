define([
  "pentaho/type/Context",
  "pentaho/visual/role/mappingAttribute",
  "pentaho/type/SpecificationScope"
], function(Context, mappingAttributeFactory, SpecificationScope) {
  "use strict";

  describe("pentaho.visual.role.MappingAttribute", function() {

    var MappingAttribute, scope;

    beforeEach(function () {
      scope = new SpecificationScope();
      var context = new Context();
      MappingAttribute = context.get(mappingAttributeFactory);
    });

    describe("constructor(name|spec)", function () {
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

    describe("#keyQualitative", function() {
      it("should be equal if the names are equal and all other properties different", function() {
        var a = new MappingAttribute({name: "a", aggregation: "sum", isReversed: true });
        var b = new MappingAttribute({name: "a", aggregation: "avg", isReversed: false});

        expect(a.keyQualitative).toBe(b.keyQualitative);
      });

      it("should be equal if the names are empty and all other properties different", function() {
        var a = new MappingAttribute({aggregation: "sum", isReversed: true });
        var b = new MappingAttribute({aggregation: "avg", isReversed: false});

        expect(a.keyQualitative).toBe(b.keyQualitative);
      });

      it("should be different if the names are different and all other properties equal", function() {
        var a = new MappingAttribute({name: "a"});
        var b = new MappingAttribute({name: "b"});

        expect(a.keyQualitative).not.toBe(b.keyQualitative);
      });
    });

    describe("#keyQuantitative", function() {
      it("should be equal if the names and aggregations are equal and all other properties different", function() {
        var a = new MappingAttribute({name: "a", aggregation: "sum", isReversed: true });
        var b = new MappingAttribute({name: "a", aggregation: "sum", isReversed: false});

        expect(a.keyQuantitative).toBe(b.keyQuantitative);
      });

      it("should be equal if the names and aggregations are empty and all other properties different", function() {
        var a = new MappingAttribute({isReversed: true });
        var b = new MappingAttribute({isReversed: false});

        expect(a.keyQuantitative).toBe(b.keyQuantitative);
      });

      it("should be different if the names are different and all other properties equal", function() {
        var a = new MappingAttribute({name: "a"});
        var b = new MappingAttribute({name: "b"});

        expect(a.keyQuantitative).not.toBe(b.keyQuantitative);
      });

      it("should be different if the aggregations are different and all other properties equal", function() {
        var a = new MappingAttribute({aggregation: "sum"});
        var b = new MappingAttribute({aggregation: "avg"});

        expect(a.keyQuantitative).not.toBe(b.keyQuantitative);
      });
    });

    describe("#toSpecInContext(keyArgs)", function () {

      it("should return a string when only the name property is serialized", function () {
        var name = "foo";
        var mapping = new MappingAttribute({name: name});

        var result = mapping.toSpecInContext({includeDefaults: false});

        scope.dispose();

        expect(result).toBe(name);
      });

      it("should return an array when the base serialization is an array", function () {
        var mapping = new MappingAttribute({name: "foo"});

        var result = mapping.toSpecInContext({includeDefaults: false, preferPropertyArray: true});

        scope.dispose();

        expect(Array.isArray(result)).toBe(true);
      });

      it("should return a generic spec object when more than the name property is serialized", function () {
        var name = "foo";
        var mapping = new MappingAttribute({name: name});

        var result = mapping.toSpecInContext({includeDefaults: true});

        scope.dispose();

        expect(result instanceof Object).toBe(true);
        expect(result.name).toBe(name);
      });
    });
  });
});
