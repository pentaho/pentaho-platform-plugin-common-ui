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
  "pentaho/type/Boolean",
  "tests/pentaho/util/errorMatch"
], function(PentahoBoolean, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Boolean", function() {

    describe("new ()", function() {

      it("should be a function", function() {
        expect(typeof PentahoBoolean).toBe("function");
      });

      it("should return an object", function() {
        expect(typeof new PentahoBoolean(1)).toBe("object");
      });

      it("should accept 1 as true", function() {
        expect(new PentahoBoolean(1).value).toBe(true);
      });

      it("should accept '1' as true", function() {
        expect(new PentahoBoolean("1").value).toBe(true);
      });

      it("should accept 0 as false", function() {
        expect(new PentahoBoolean(0).value).toBe(false);
      });

      it("should accept '0' as true", function() {
        expect(new PentahoBoolean("0").value).toBe(true);
      });

      it("should accept true as true", function() {
        expect(new PentahoBoolean(true).value).toBe(true);
      });

      it("should accept false as false", function() {
        expect(new PentahoBoolean(false).value).toBe(false);
      });

      it("should accept 'false' as true", function() {
        expect(new PentahoBoolean("false").value).toBe(true);
      });

      it("should accept new Date() as true", function() {
        expect(new PentahoBoolean(new Date()).value).toBe(true);
      });

      it("should accept empty string as false", function() {
        expect(new PentahoBoolean("").value).toBe(false);
      });

      it("should accept some random string as true", function() {
        expect(new PentahoBoolean("someRandom string").value).toBe(true);
      });

      it("should not accept null", function() {
        expect(function() {
          var foo = new PentahoBoolean(null);
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept undefined", function() {
        expect(function() {
          var foo = new PentahoBoolean(undefined);
        }).toThrow(errorMatch.argRequired("value"));
      });
    });
  }); // pentaho.type.Boolean
});
