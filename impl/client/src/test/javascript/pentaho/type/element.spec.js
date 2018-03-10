/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/Context"
], function(Context) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.Element -", function() {

    var context;
    var Value;
    var Element;
    var PentahoNumber;
    var Complex;
    var ComplexEntity;
    var ComplexNonEntity;
    var ComplexNonEntityReadOnly;

    beforeAll(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Value = context.get("pentaho/type/value");
            Element = context.get("pentaho/type/element");
            PentahoNumber = context.get("pentaho/type/number");
            Complex = context.get("pentaho/type/complex");

            ComplexEntity = Complex.extend({
              get $key() {
                return this.name;
              },
              $type: {
                isEntity: true,
                props: [
                  "name",
                  {name: "age", valueType: "number"}
                ]
              }
            });

            ComplexNonEntity = Complex.extend({
              $type: {
                props: [
                  "name", {name: "age", valueType: "number"}
                ]
              }
            });

            ComplexNonEntityReadOnly = Complex.extend({
              $type: {
                isReadOnly: true,
                props: [
                  "name", {name: "age", valueType: "number"}
                ]
              }
            });
          })
          .then(done, done.fail);
    });

    it("should be a function", function() {
      expect(typeof Element).toBe("function");
    });

    it("should be a sub-class of `Value`", function() {
      expect(Element.prototype instanceof Value).toBe(true);
    });

    // region compare
    describe("compare(other)", function() {

      it("should return 1 if other is nully", function() {

        expect(new Element().compare(null)).toBe(1);
        expect(new Element().compare(undefined)).toBe(1);
      });

      it("should return 0 if other is identical to this", function() {
        var instance = new Element();
        var other = instance;
        expect(instance.compare(other)).toBe(0);
      });

      it("should return 0 if other has a different constructor than this", function() {
        var instance = new Element();

        var Element2 = Element.extend();
        var other = new Element2();

        expect(instance.compare(other)).toBe(0);
      });

      it("should return 0 if other is equals to this", function() {

        var instance = new Element();

        spyOn(instance, "_equals").and.returnValue(true);

        var other = new Element();

        expect(instance.compare(other)).toBe(0);
      });

      it("should delegate to _compare if other is distinct has the same constructor and is not equal", function() {

        var instance = new Element();

        spyOn(instance, "_equals").and.returnValue(false);
        spyOn(instance, "_compare").and.returnValue(-1);

        var other = new Element();

        expect(instance.compare(other)).toBe(-1);

        expect(instance._compare).toHaveBeenCalledWith(other);
      });
    });

    describe("_compare(other)", function() {

      it("should sort according to the elements' $key lexicographically", function() {
        var first = new Element();
        var second = new Element();

        var spyFirst = spyOnProperty(first, "$key", "get").and.returnValue(1);
        var spySecond = spyOnProperty(second, "$key", "get").and.returnValue(2);
        expect(first._compare(second)).toBe(-1);

        // ---

        spyFirst.and.returnValue("10");
        spySecond.and.returnValue("2");
        expect(first._compare(second)).toBe(-1);

        // ---

        spyFirst.and.returnValue("B");
        spySecond.and.returnValue("A");
        expect(first._compare(second)).toBe(1);
      });
    });
    // endregion
    describe("Type -", function() {

      var ElemType;

      beforeEach(function() {
        ElemType = Element.Type;
      });

      it("should be a function", function() {
        expect(typeof ElemType).toBe("function");
      });

      it("should be a sub-class of `Value.Type`", function() {
        expect(ElemType.prototype instanceof Value.Type).toBe(true);
      });

      describe("#isElement", function() {

        it("should return the value `true`", function() {
          expect(Element.type.isElement).toBe(true);
        });
      });

      describe("#compareElements(va, vb)", function() {

        it("should return 0 if both are nully", function() {

          expect(Element.type.compareElements(null, null)).toBe(0);
          expect(Element.type.compareElements(null, undefined)).toBe(0);
          expect(Element.type.compareElements(undefined, null)).toBe(0);
          expect(Element.type.compareElements(undefined, undefined)).toBe(0);
        });

        it("should return -1 if the first is nully and the second not", function() {

          expect(Element.type.compareElements(null, new Element())).toBe(-1);
          expect(Element.type.compareElements(undefined, new Element())).toBe(-1);
        });

        it("should delegate to the first value's compare method, " +
            "if the first is not nully but the second is", function() {
          var first = new Element();
          var second = null;

          spyOn(first, "compare").and.returnValue(1);

          var result = Element.type.compareElements(first, second);

          expect(result).toBe(1);

          expect(first.compare).toHaveBeenCalledWith(second);
        });

        it("should delegate to the first value's compare method, if both are not nully", function() {
          var first = new Element();
          var second = new Element();

          spyOn(first, "compare").and.returnValue(1);

          var result = Element.type.compareElements(first, second);

          expect(result).toBe(1);

          expect(first.compare).toHaveBeenCalledWith(second);
        });
      });

      describe("#createLike(value, config)", function() {

        it("should create another value of the same type and with the configuration applied", function() {

          var value = new ComplexEntity({name: "John", age: 12});
          var config = {age: 10};

          var result = Element.type.createLike(value, config);

          expect(result).not.toBe(value);
          expect(result).not.toBe(config);
          expect(result instanceof ComplexEntity).toBe(true);
          expect(result.age).toBe(10);
        });
      });

      // TODO: format
    });
  });
});
