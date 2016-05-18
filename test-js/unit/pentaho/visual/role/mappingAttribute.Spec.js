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

    describe("#toSpecInContext(keyArgs)", function () {
      it("should return a string when only the name property is serialized", function () {
        var name = "foo";
        var mapping = new MappingAttribute({name: name});

        var result = mapping.toSpecInContext({includeDefaults: false});

        scope.dispose();

        expect(result).toBe(name);
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
