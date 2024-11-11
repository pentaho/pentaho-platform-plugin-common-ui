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
  "pentaho/type/Function",
  "tests/pentaho/util/errorMatch"
], function(PentahoFunction, errorMatch) {

  "use strict";

  describe("pentaho.type.Function -", function() {

    describe("new Function()", function() {

      var testFun;

      beforeEach(function() {
        testFun = new PentahoFunction(function() {});
      });

      it("should be a function", function() {
        expect(typeof PentahoFunction).toBe("function");
      });

      it("should be a function", function() {
        expect(typeof testFun.value).toBe("function");
      });

      it("should return an object", function() {
        expect(typeof testFun).toBe("object");
      });

      it("should accept a function value as a string as an object", function() {
        var identity = function(v) { return v; };
        var test = new PentahoFunction(identity.toString());
        var identity2 = test.value;
        expect(typeof identity2).toBe("function");
        var uniqueValue = {};
        expect(identity2(uniqueValue)).toBe(uniqueValue);
      });

      it("should not accept null", function() {
        expect(function() {
          var foo = new PentahoFunction(null);
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept undefined", function() {
        expect(function() {
          var foo = new PentahoFunction(undefined);
        }).toThrow(errorMatch.argRequired("value"));
      });
    });

    describe("#toJSON()", function() {
      var testFun;

      beforeEach(function() {
        testFun = function(foo) { return foo; };
      });

      it("should return the function's code as a string", function() {
        var fun = new PentahoFunction(testFun);
        expect(fun.toJSON()).toBe(testFun.toString());
      });

      it("should return `null` if the function is native", function() {
        var fun = new PentahoFunction(String);
        expect(fun.toJSON()).toBe(null);
      });
    });
  });
});
