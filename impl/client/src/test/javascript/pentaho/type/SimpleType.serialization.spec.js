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
  "pentaho/type/Simple",
  "tests/pentaho/type/serializationUtil"
], function(Simple, serializationUtil) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, spyOn:false*/

  describe("pentaho.type.SimpleType", function() {

    describe("#_fillSpecInContext(spec, keyArgs)", function() {

      it("should return false when there are no attributes to serialize", function() {
        var spec = {};
        var typeSpec = {};
        expect(serializationUtil.fillSpec(Simple, spec, typeSpec)).toBe(false);
      });

      it("should return true when there are attributes to serialize", function() {
        var spec = {};
        var typeSpec = {label: "Foo"};

        expect(serializationUtil.fillSpec(Simple, spec, typeSpec)).toBe(true);
      });

      describe("#cast", function() {
        serializationUtil.itFillSpecMethodAttribute(function() { return Simple; }, "cast");

        it("should not serialize when value is local and isJson: true", function() {
          var spec = {};
          var typeSpec = {cast: function() {}};
          var result = serializationUtil.fillSpec(Simple, spec, typeSpec, {isJson: true});

          expect(result).toBe(false);
        });
      });
    });
  });
});
