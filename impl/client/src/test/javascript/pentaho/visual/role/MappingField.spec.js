/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/visual/role/MappingField",
  "pentaho/type/SpecificationScope"
], function(MappingField, SpecificationScope) {

  "use strict";

  describe("pentaho.visual.role.MappingField", function() {

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
