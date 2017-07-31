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
  "pentaho/type/Context",
  "tests/pentaho/util/errorMatch"
], function(Context, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Object -", function() {

    var context;
    var PentahoObject;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            PentahoObject = context.get("pentaho/type/object");
          })
          .then(done, done.fail);
    });

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
  }); // pentaho.type.Object
});
