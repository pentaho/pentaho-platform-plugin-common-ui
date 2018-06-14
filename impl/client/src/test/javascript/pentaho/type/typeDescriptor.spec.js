/*!
 * Copyright 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/TypeDescriptor",
  "pentaho/type/Simple",
  "pentaho/type/Boolean",
  "tests/pentaho/util/errorMatch"
], function(TypeDescriptor, Simple, PentahoBoolean, errorMatch) {

  "use strict";

  /* eslint-disable no-unused-vars */

  describe("pentaho.type.TypeDescriptor", function() {

    describe("new TypeDescriptor(spec)", function() {

      it("should be a function", function() {
        expect(typeof TypeDescriptor).toBe("function");
      });

      it("should return an object", function() {
        expect(typeof new TypeDescriptor({v: PentahoBoolean.type})).toBe("object");
      });

      it("should return an instance of Simple", function() {
        expect(new TypeDescriptor({v: PentahoBoolean.type}) instanceof Simple).toBe(true);
      });

      it("should accept spec.v as an id or alias exposing its type object in #value", function() {
        expect(new TypeDescriptor({v: "boolean"}).value).toBe(PentahoBoolean.type);
      });

      it("should accept spec.v as a type object exposing it in #value", function() {
        expect(new TypeDescriptor({v: PentahoBoolean.type}).value).toBe(PentahoBoolean.type);
      });

      it("should accept spec.v as an Instance constructor and expose its type object in #value", function() {
        expect(new TypeDescriptor({v: PentahoBoolean}).value).toBe(PentahoBoolean.type);
      });

      it("should accept spec.v as a generic object spec and expose its type object in #value", function() {
        expect(new TypeDescriptor({v: {base: "complex"}}).value.ancestor.id).toBe("pentaho/type/Complex");
      });

      it("should accept spec as an id or alias exposing its type object in #value", function() {
        expect(new TypeDescriptor("boolean").value).toBe(PentahoBoolean.type);
      });

      it("should accept spec as a type object exposing it in #value", function() {
        expect(new TypeDescriptor(PentahoBoolean.type).value).toBe(PentahoBoolean.type);
      });

      it("should accept spec as an Instance constructor and expose its type object in #value", function() {
        expect(new TypeDescriptor(PentahoBoolean).value).toBe(PentahoBoolean.type);
      });

      it("should not accept an object literal with a null value", function() {
        expect(function() {
          var foo = new TypeDescriptor({v: null});
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept empty object literal", function() {
        expect(function() {
          var foo = new TypeDescriptor({});
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept null", function() {
        expect(function() {
          var foo = new TypeDescriptor(null);
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept undefined", function() {
        expect(function() {
          var foo = new TypeDescriptor(undefined);
        }).toThrow(errorMatch.argRequired("value"));
      });
    });

    describe("#$key -", function() {

      it("should return a string value", function() {
        var key = new TypeDescriptor({v: PentahoBoolean.type}).$key;
        expect(typeof key).toBe("string");
      });

      it("should have distinct values for distinct types", function() {
        var keyA = new TypeDescriptor({v: PentahoBoolean.type}).$key;
        var keyB = new TypeDescriptor({v: Simple.type}).$key;
        expect(keyA).not.toBe(keyB);
      });

      it("should have the same value for the same types", function() {
        var key1 = new TypeDescriptor({v: PentahoBoolean.type}).$key;
        var key2 = new TypeDescriptor({v: PentahoBoolean.type}).$key;
        expect(key1).toBe(key2);
      });
    });
  });
});
