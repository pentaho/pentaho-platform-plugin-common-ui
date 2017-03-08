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
  "pentaho/type/function",
  "pentaho/type/Context",
  "tests/pentaho/util/errorMatch"
], function(functionFactory, Context, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Function -", function() {
    it("is a function", function() {
      expect(typeof functionFactory).toBe("function");
    });

    describe("new Function()", function() {
      var PentahoFunction, testFunc;

      beforeEach(function() {
        PentahoFunction = functionFactory(new Context());
        testFunc = new PentahoFunction(function() {});
      });

      it("should be a function", function() {
        expect(typeof PentahoFunction).toBe("function");
      });

      it("should be a function", function() {
        expect(typeof testFunc.value).toBe("function");
      });

      it("should return an object", function() {
        expect(typeof testFunc).toBe("object");
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
      var PentahoFun;
      var testFun = function(foo) { return foo; };

      beforeEach(function () {
        PentahoFun = functionFactory(new Context());
      });

      it("should return the function's code as a string", function() {
        var fun = new PentahoFun(testFun);
        expect(fun.toJSON()).toBe(testFun.toString());
      });

      it("should return `null` if the function is native", function() {
        var fun = new PentahoFun(String);
        expect(fun.toJSON()).toBe(null);
      });
    });
  }); // pentaho.type.Function
});
