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
  "pentaho/type/number",
  "pentaho/type/Context",
  "tests/pentaho/util/errorMatch"
], function(numberFactory, Context, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Number -", function() {

    it("the AMD module returns a factory function", function() {
      expect(typeof numberFactory).toBe("function");
    });

    it("factory function should accept a context and return a function", function() {
      expect(typeof numberFactory(new Context())).toBe("function");
    });

    describe("new Number()", function() {
      var PentahoNumber;

      beforeEach(function() {
        PentahoNumber = numberFactory(new Context());
      });

      it("should return an object", function() {
        expect(typeof new PentahoNumber(1)).toBe("object");
      });

      it("should accept a number 1 and return the number 1", function() {
        expect(new PentahoNumber(1).value).toBe(1);
      });

      it("should accept a string '1' and return the number 1", function() {
        expect(new PentahoNumber('1').value).toBe(1);
      });

      it("should throw and not accept a 'non-numeric' argument", function() {
        expect(function() {
          var foo = new PentahoNumber("one");
        }).toThrow(errorMatch.argInvalid("value"));
      });

      it("should throw and not accept null", function() {
        expect(function() {
          var foo = new PentahoNumber(null);
        }).toThrow(errorMatch.argRequired("value"));
      });

    });
  }); // pentaho.type.Number
});
