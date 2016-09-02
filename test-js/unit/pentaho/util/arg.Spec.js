/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/util/arg",
  "tests/pentaho/util/errorMatch"
], function(arg, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.util.arg -", function() {
    it("is an object", function() {
      expect(typeof arg).toBe("object");
    });

    describe("required(o, p, pscope)", function() {
      it("should require the testProperty to be present and return the value of the property.", function() {
        expect(arg.required({testProp: "value"}, "testProp", "testArgs")).toBe("value");
        expect(arg.required({testProp: 1}, "testProp", "testArgs")).toBe(1);
        expect(arg.required({testProp: -1}, "testProp", "testArgs")).toBe(-1);
        expect(arg.required({testProp: true}, "testProp", "testArgs")).toBe(true);
        expect(arg.required({testProp: false}, "testProp", "testArgs")).toBe(false);
        expect(arg.required({testProp: "value"}, "testProp")).toBe("value");
        expect(arg.required({testProp: 1}, "testProp")).toBe(1);
        expect(arg.required({testProp: -1}, "testProp")).toBe(-1);
        expect(arg.required({testProp: true}, "testProp")).toBe(true);
        expect(arg.required({testProp: false}, "testProp")).toBe(false);
      });

      it("should require the testProperty to be present and throw an Argument required error if it is not.", function() {
        expect(function () {
          arg.required({testProp: "value"}, "testProp2", "testArgs");
        }).toThrow(errorMatch.argRequired("testArgs.testProp2"));
        expect(function () {
          arg.required({testProp: null}, "testProp", "testArgs");
        }).toThrow(errorMatch.argRequired("testArgs.testProp"));
        expect(function () {
          arg.required({testProp: undefined}, "testProp", "testArgs");
        }).toThrow(errorMatch.argRequired("testArgs.testProp"));
        expect(function () {
          arg.required({testProp: "value"}, "testProp2");
        }).toThrow(errorMatch.argRequired("testProp2"));
        expect(function () {
          arg.required({testProp: null}, "testProp");
        }).toThrow(errorMatch.argRequired("testProp"));
        expect(function () {
          arg.required({testProp: undefined}, "testProp");
        }).toThrow(errorMatch.argRequired("testProp"));
        expect(function () {
          arg.required(undefined, "testProp");
        }).toThrow(errorMatch.argRequired("testProp"));
        expect(function () {
          arg.required(null, "testProp");
        }).toThrow(errorMatch.argRequired("testProp"));
      });
    });

    describe("optional(o, p, dv)", function() {
      it("should return the value of the p param from the o param if it exists.", function() {
        expect(arg.optional({testProp: "value"}, "testProp", "testArgs")).toBe("value");
        expect(arg.optional({testProp: 1}, "testProp", "testArgs")).toBe(1);
        expect(arg.optional({testProp: -1}, "testProp", "testArgs")).toBe(-1);
        expect(arg.optional({testProp: true}, "testProp", "testArgs")).toBe(true);
        expect(arg.optional({testProp: false}, "testProp", "testArgs")).toBe(false);
        expect(arg.optional({testProp: "value"}, "testProp")).toBe("value");
        expect(arg.optional({testProp: 1}, "testProp")).toBe(1);
        expect(arg.optional({testProp: -1}, "testProp")).toBe(-1);
        expect(arg.optional({testProp: true}, "testProp")).toBe(true);
        expect(arg.optional({testProp: false}, "testProp")).toBe(false);
        expect(arg.optional(undefined, "testProp")).toBe(undefined);
        expect(arg.optional(null, "testProp")).toBe(undefined);
      });

      it("should return the value of the p param from the o param if it exists and return the default value otherwise.", function() {
        expect(arg.optional({}, "testProp", "testArgs")).toBe("testArgs");
      });

      it("should return the value of the p param from the o param if it exists and return undefined if the default value is not provided.", function() {
        expect(arg.optional({}, "testProp")).toBe(undefined);
      });
    });


    describe("defined(o, p, dv)", function() {
      it("should return the value of the p param from the o param if it exists.", function() {
        expect(arg.defined({testProp: "value"}, "testProp", "testArgs")).toBe("value");
        expect(arg.defined({testProp: 1}, "testProp", "testArgs")).toBe(1);
        expect(arg.defined({testProp: -1}, "testProp", "testArgs")).toBe(-1);
        expect(arg.defined({testProp: true}, "testProp", "testArgs")).toBe(true);
        expect(arg.defined({testProp: false}, "testProp", "testArgs")).toBe(false);
        expect(arg.defined({testProp: null}, "testProp", "testArgs")).toBe(null);
        expect(arg.defined({testProp: undefined}, "testProp", "testArgs")).toBe("testArgs");
        expect(arg.defined({testProp: "value"}, "testProp")).toBe("value");
        expect(arg.defined({testProp: 1}, "testProp")).toBe(1);
        expect(arg.defined({testProp: -1}, "testProp")).toBe(-1);
        expect(arg.defined({testProp: true}, "testProp")).toBe(true);
        expect(arg.defined({testProp: false}, "testProp")).toBe(false);
        expect(arg.defined({testProp: null}, "testProp")).toBe(null);
        expect(arg.defined({testProp: undefined}, "testProp")).toBe(undefined);
        expect(arg.defined(undefined, "testProp")).toBe(undefined);
        expect(arg.defined(null, "testProp")).toBe(undefined);
      });

      it("should return the value of the p param from the o param if it exists and return the default value otherwise.", function() {
        expect(arg.defined({}, "testProp", "testArgs")).toBe("testArgs");
      });

      it("should return the value of the p param from the o param if it exists and return undefined if the default value is not provided.", function() {
        expect(arg.defined({}, "testProp")).toBe(undefined);
      });
    });

    describe("slice(args, start, end)", function() {
      var testArray;

      beforeEach(function () {
        testArray = [{testProp: "value"}, {testProp2: "value2"}];
      });

      it("should return an array containing only the first element of the sliced array.", function() {
        expect(arg.slice(testArray, 0, 1).toString()).toBe([testArray[0]].toString());
      });
      it("should return an array containing only the second element of the sliced array.", function() {
        expect(arg.slice(testArray, 1, 2).toString()).toBe([testArray[1]].toString());
      });
      it("should return the original array.", function() {
        expect(arg.slice(testArray, 0).toString()).toBe(testArray.toString());
      });
      it("should return the an array containing only the element of the original array at index 1.", function() {
        expect(arg.slice(testArray, 1).toString()).toBe([testArray[1]].toString());
      });
      it("should throw an arg required error message when no array provided.", function() {
        expect(function () {
          arg.slice();
        }).toThrow(errorMatch.argRequired("args"));
      });
      it("should throw an error when undefined provided.", function() {
        expect(function () {
          arg.slice(undefined);
        }).toThrow(errorMatch.argRequired("args"));
      });
      it("should throw an error when null provided.", function() {
        expect(function () {
          arg.slice(null);
        }).toThrow(errorMatch.argRequired("args"));
      });
    });
  }); // pentaho.util.arg
});