/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/util/fun"
], function(fun) {

  "use strict";

  describe("pentaho.util.fun", function() {

    it("is defined", function() {
      expect(fun instanceof Object).toBe(true);
    });

    describe(".is(value)", function() {

      function expectIsFunction(obj, expected) {
        obj = Array.isArray(obj) ? obj :[obj];
        obj.forEach(function(elem) {
          expect(fun.is(elem)).toBe(expected);
        });
      }

      it("should only return true if the value is a function", function() {
        expectIsFunction(function() {}, true);
        expectIsFunction([null, 123, "string", true, {}], false);
      });
    });
    
    describe(".constant(value)", function() {

      it("should convert any value to a function that returns that same value", function() {
        [function() {}, null, 123, "string", true, {}].forEach(function(elem) {
            var constant = fun.constant(elem);
            expect(typeof constant).toBe("function");
            expect(constant()).toBe(elem);
        });
      });
    });

    describe(".compare(a, b)", function() {

      function expectCompare(valueA, valueB, result) {
        expect(fun.compare(valueA, valueB)).toBe(result);
      }

      it("should return '0' when values are equal", function() {
        [["a", "a"], [123, 123], [true, true]].forEach(function(elem) {
          expectCompare(elem[0], elem[1], 0);
        });
      });

      it("should return '-1' when the first value is smaller than the second", function() {
        [["a", "b"], [123, 456], [false, true]].forEach(function(elem) {
          expectCompare(elem[0], elem[1], -1);
        });
      });

      it("should return '1' when the first value is greater than the second", function() {
        [["b", "a"], [456, 123], [true, false]].forEach(function(elem) {
          expectCompare(elem[0], elem[1], 1);
        });
      });
    });

    describe(".predicate(attrs)", function() {
      var predicate = null,
          attrs = {
            "test": 123,
            "foo":  "bar"
          },
          inc_attrs = {
            "test": 123
          };

      it("should return a function", function() {
        predicate = fun.predicate(attrs);
        expect(typeof predicate).toBe("function");
      });

      it("should only return true when the given value passes all the conditions", function() {
        expect(predicate(attrs)).toBe(true);
        expect(predicate(inc_attrs)).toBe(false);
        expect(predicate()).toBe(false);
      });
    });
  });
});
