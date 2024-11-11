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
  "pentaho/type/Object",
  "tests/pentaho/util/errorMatch"
], function(PentahoObject, errorMatch) {

  "use strict";

  describe("pentaho.type.Object -", function() {

    describe("new Object() -", function() {

      var emptyObj;
      var dateObj;

      beforeEach(function() {
        emptyObj = {};
        dateObj = new Date();
      });

      it("should be a function", function() {
        expect(typeof PentahoObject).toBe("function");
      });

      it("should return an object", function() {
        expect(typeof new PentahoObject({v: emptyObj})).toBe("object");
      });

      it("should accept an empty object as an object", function() {
        expect(new PentahoObject({v: emptyObj}).value).toBe(emptyObj);
      });

      it("should accept a date object as an object", function() {
        expect(new PentahoObject({v: dateObj}).value).toBe(dateObj);
      });

      it("should not accept an object literal with a null value", function() {
        expect(function() {
          var foo = new PentahoObject({v: null});
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept empty object literal", function() {
        expect(function() {
          var foo = new PentahoObject({});
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept null", function() {
        expect(function() {
          var foo = new PentahoObject(null);
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept undefined", function() {
        expect(function() {
          var foo = new PentahoObject(undefined);
        }).toThrow(errorMatch.argRequired("value"));
      });
    });

    describe("#$key -", function() {

      it("should return a string value", function() {
        var key = new PentahoObject({v: {}}).$key;
        expect(typeof key).toBe("string");
      });

      it("should have distinct values for distinct primitive instances", function() {
        var emptyObjA = {};
        var emptyObjB = {};
        var keyA = new PentahoObject({v: emptyObjA}).$key;
        var keyB = new PentahoObject({v: emptyObjB}).$key;
        expect(keyA).not.toBe(keyB);
      });

      it("should have the same value for the same primitive instance", function() {
        var emptyObj = {};
        var key1 = new PentahoObject({v: emptyObj}).$key;
        var key2 = new PentahoObject({v: emptyObj}).$key;
        expect(key1).toBe(key2);
      });
    });
  });
});
