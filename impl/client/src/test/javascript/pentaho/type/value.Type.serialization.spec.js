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
  "pentaho/type/Context",
  "pentaho/type/SpecificationScope",
  "tests/pentaho/type/serializationUtil"
], function(Context, SpecificationScope, serializationUtil) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, spyOn:false, jasmine:false,
           JSON:false */

  /* eslint max-nested-callbacks: 0 */

  describe("pentaho.type.Value.Type", function() {

    var context;
    var Value;

    function getValue() {
      return Value;
    }

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Value = context.get("pentaho/type/value");
          })
          .then(done, done.fail);
    });

    describe("#toSpecInContext(keyArgs)", function() {

      it("should call #_fillSpecInContext", function() {
        var derivedType = Value.extend().type;

        spyOn(derivedType, "_fillSpecInContext");

        var scope = new SpecificationScope();

        derivedType.toSpecInContext();

        scope.dispose();

        expect(derivedType._fillSpecInContext.calls.count()).toBe(1);
      });

      it("should call #_fillSpecInContext with a spec object", function() {
        var derivedType = Value.extend().type;

        spyOn(derivedType, "_fillSpecInContext");

        var scope = new SpecificationScope();

        derivedType.toSpecInContext();

        scope.dispose();

        var spec = derivedType._fillSpecInContext.calls.mostRecent().args[0];
        expect(spec instanceof Object).toBe(true);
      });

      it("should call #_fillSpecInContext with a keyArgs object", function() {
        var derivedType = Value.extend().type;

        spyOn(derivedType, "_fillSpecInContext");

        var scope = new SpecificationScope();

        derivedType.toSpecInContext();

        scope.dispose();

        var keyArgs = derivedType._fillSpecInContext.calls.mostRecent().args[1];
        expect(keyArgs instanceof Object).toBe(true);
      });

      it("should call #_fillSpecInContext with all keyword arguments given in keyArgs", function() {
        var derivedType = Value.extend().type;

        spyOn(derivedType, "_fillSpecInContext");

        var scope = new SpecificationScope();

        var keyArgs = {
          foo: "foo",
          bar: "bar"
        };

        derivedType.toSpecInContext(keyArgs);

        scope.dispose();

        var keyArgs2 = derivedType._fillSpecInContext.calls.mostRecent().args[1];
        expect(keyArgs2 instanceof Object).toBe(true);
        expect(keyArgs2.foo).toBe(keyArgs.foo);
        expect(keyArgs2.bar).toBe(keyArgs.bar);
      });

      describe("#id", function() {
        it("should serialize the #id of a type using #shortId, if an #alias is defined", function() {
          var derivedType = Value.extend({$type: {id: "pentaho/type/test", alias: "testAlias"}}).type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec instanceof Object).toBe(true);
          expect(spec.id).toBe(derivedType.id);
        });

        it("should serialize the #id of a type using #shortId, if an #alias is not defined", function() {
          var derivedType = Value.extend({$type: {id: "pentaho/type/test"}}).type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec instanceof Object).toBe(true);
          expect(spec.id).toBe(derivedType.shortId);
        });

        it("should serialize with an anonymous #id when the type is anonymous", function() {
          var derivedType = Value.extend().type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec instanceof Object).toBe(true);
          expect(typeof spec.id).toBe("string");
          expect(spec.id[0]).toBe("_");
        });

        it("should serialize with the existing anonymous id, " +
            "already in the scope, when the type is anonymous", function() {
          var derivedType = Value.extend().type;

          var scope = new SpecificationScope();

          var spec1 = derivedType.toSpecInContext();
          var spec2 = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec2.id).toBe(spec1.id);
        });
      });

      describe("#base", function() {

        it("should serialize the #base type as a reference", function() {
          var derivedType = Value.extend().type;

          spyOn(Value.type, "toRefInContext").and.callThrough();

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(Value.type.toRefInContext).toHaveBeenCalled();

          expect(spec.base).toBe("value");
        });

        it("should serialize the #base type as a reference", function() {
          var derivedType = Value.extend().type;

          spyOn(Value.type, "toRefInContext").and.callThrough();

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(Value.type.toRefInContext).toHaveBeenCalled();

          expect(spec.base).toBe("value");
        });

        it("should serialize the root Value type with base 'instance'", function() {
          var scope = new SpecificationScope();

          var spec = Value.type.toSpecInContext();

          scope.dispose();

          expect(spec.base).toBe("instance");
        });

        it("should not serialize base when it is Complex", function() {
          var Complex = context.get("pentaho/type/complex");
          var DerivedComplex = Complex.extend();

          var scope = new SpecificationScope();

          var spec = DerivedComplex.type.toSpecInContext();

          scope.dispose();

          expect("base" in spec).toBe(false);
        });
      });
    });

    describe("#_fillSpecInContext(spec, keyArgs)", function() {

      it("should return false when there are no attributes to serialize", function() {
        expect(serializationUtil.fillSpec(Value, {}, {})).toBe(false);
      });

      describe("#isAbstract", function() {
        // isAbstract is always local. Non-nullable. false by default.

        serializationUtil.itFillSpecAttribute(getValue, "isAbstract", true, true);
        serializationUtil.itFillSpecAttribute(getValue, "isAbstract", false, false);
      });
    });
  });
});
