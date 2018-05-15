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
  "pentaho/type/Value",
  "pentaho/type/Complex",
  "pentaho/type/SpecificationScope",
  "tests/pentaho/type/serializationUtil"
], function(Value, Complex, SpecificationScope, serializationUtil) {

  "use strict";

  /* eslint max-nested-callbacks: 0 */

  describe("pentaho.type.ValueType", function() {

    function getValue() {
      return Value;
    }

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
        it("should serialize the #id of a type, if an #alias is defined yet keyArgs.noAlias=true", function() {
          var derivedType = Value.extend({$type: {id: "pentaho/type/test", alias: "testAlias"}}).type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext({noAlias: true});

          scope.dispose();

          expect(spec).toBe(derivedType.id);
        });

        it("should serialize the #alias of a type, if an #alias is defined", function() {
          var derivedType = Value.extend({$type: {id: "pentaho/type/test", alias: "testAlias"}}).type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec).toBe(derivedType.alias);
        });

        it("should serialize the #id of a type using #shortId, if an #alias is not defined", function() {
          var derivedType = Value.extend({$type: {id: "pentaho/type/test"}}).type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec).toBe(derivedType.shortId);
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

          expect(spec2).toBe(spec1.id);
        });
      });

      describe("#base", function() {

        it("should serialize the #base type", function() {

          var derivedType = Value.extend().type;

          derivedType.toSpecInContext = Value.type.toSpecInContext;

          spyOn(Value.type, "toSpecInContext").and.callThrough();

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(Value.type.toSpecInContext).toHaveBeenCalled();

          expect(spec.base).toBe("value");
        });

        it("should serialize the #base type as a reference", function() {

          var derivedType = Value.extend().type;

          derivedType.toSpecInContext = Value.type.toSpecInContext;

          spyOn(Value.type, "toSpecInContext").and.callThrough();

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(Value.type.toSpecInContext).toHaveBeenCalled();

          expect(spec.base).toBe("value");
        });

        it("should serialize the root Value type as 'value'", function() {
          var scope = new SpecificationScope();

          var spec = Value.type.toSpecInContext();

          scope.dispose();

          expect(spec).toBe("value");
        });

        it("should not serialize base when it is Complex", function() {

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
