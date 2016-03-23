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
  "pentaho/type/object",
  "pentaho/type/Context",
  "tests/pentaho/util/errorMatch"
], function(objectFactory, Context, errorMatch) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Object -", function() {
    it("is a function", function() {
      expect(typeof objectFactory).toBe("function");
    });

    describe("new Object() -", function() {
      var PentahoObject, emptyObj, dateObj;

      beforeEach(function () {
        PentahoObject = objectFactory(new Context());
        emptyObj = {};
        dateObj = new Date();
      });

      it("should be a function", function () {
        expect(typeof PentahoObject).toBe("function");
      });

      it("should return an object", function () {
        expect(typeof new PentahoObject({v: emptyObj})).toBe("object");
      });

      it("should accept an empty object as an object", function () {
        expect(new PentahoObject({v: emptyObj}).value).toBe(emptyObj);
      });

      it("should accept a date object as an object", function () {
        expect(new PentahoObject({v: dateObj}).value).toBe(dateObj);
      });

      it("should not accept empty object literal", function () {
        expect(function () {
          var foo = new PentahoObject({});
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept null", function () {
        expect(function () {
          var foo = new PentahoObject(null);
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept undefined", function () {
        expect(function () {
          var foo = new PentahoObject(undefined);
        }).toThrow(errorMatch.argRequired("value"));
      });
    });

    describe("#key -", function() {
      var PentahoObject;

      beforeEach(function () {
        PentahoObject = objectFactory(new Context());
      });

      it("should return a string value", function() {
        var key = new PentahoObject({v: {}}).key;
        expect(typeof key).toBe("string");
      });

      it("should have a distinct value for every instance", function() {
        var emptyObj = {},
            key1 = new PentahoObject({v: emptyObj}).key,
            key2 = new PentahoObject({v: emptyObj}).key,
            key3 = new PentahoObject({v: emptyObj}).key;
        expect(key1).not.toBe(key2);
        expect(key2).not.toBe(key3);
        expect(key3).not.toBe(key1);
      });
    });
  }); // pentaho.type.Object
});