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
  "pentaho/type/List",
  "pentaho/type/SpecificationScope"
], function(List, SpecificationScope) {

  "use strict";

  describe("pentaho.type.ListType", function() {

    describe("#toSpecInScope(keyArgs)", function() {

      it("should call #_fillSpecInContext", function() {

        var derivedType = List.extend().type;

        spyOn(derivedType, "_fillSpecInContext");

        var scope = new SpecificationScope();

        derivedType.toSpecInContext();

        scope.dispose();

        expect(derivedType._fillSpecInContext.calls.count()).toBe(1);
      });

      it("should call #_fillSpecInContext with a spec object", function() {
        var derivedType = List.extend().type;

        spyOn(derivedType, "_fillSpecInContext");

        var scope = new SpecificationScope();

        derivedType.toSpecInContext();

        scope.dispose();

        var spec = derivedType._fillSpecInContext.calls.mostRecent().args[0];
        expect(spec instanceof Object).toBe(true);
      });

      it("should call #_fillSpecInContext with all keyword arguments given in keyArgs", function() {
        var derivedType = List.extend().type;

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
        it("should serialize the #id of a type using #id when no alias is defined", function() {
          var derivedType = List.extend({$type: {id: "pentaho/type/test"}}).type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec instanceof Object).toBe(true);
          expect(spec.id).toBe(derivedType.id);
        });

        it("should serialize the #id of a type using #alias when an alias is defined", function() {
          var derivedType = List.extend({$type: {id: "pentaho/type/test", alias: "test"}}).type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec instanceof Object).toBe(true);
          expect(spec.id).toBe(derivedType.alias);
        });

        it("should serialize with an anonymous #id when the type is anonymous", function() {
          // Force generic object spec by specifying a label.
          var derivedType = List.extend({$type: {label: "Foo"}}).type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec instanceof Object).toBe(true);
          expect(typeof spec.id).toBe("string");
          expect(spec.id[0]).toBe("_");
        });

        it("should serialize with the existing anonymous id, " +
            "already in the scope, when the type is anonymous", function() {
          var derivedType = List.extend({$type: {label: "Foo"}}).type;

          var scope = new SpecificationScope();

          var spec1 = derivedType.toSpecInContext();
          var spec2 = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec2.id).toBe(spec1.id);
        });
      });

      describe("shorthand list type syntax", function() {

        it("should be used when type is anonymous and has list base and no other attributes", function() {

          var derivedType = List.extend().type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec).toEqual(["element"]);
        });
      });

      describe("#of", function() {
        it("should serialize the #of of a type when it is different from base", function() {
          // Force generic object spec by specifying a label.
          var derivedType = List.extend({$type: {of: "string", label: "Foo"}}).type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec instanceof Object).toBe(true);
          expect(spec.of).toBe("string");
        });

        it("should not serialize the #of of a type when it is inherited", function() {
          // Force generic object spec by specifying a label.
          var derivedType = List.extend({$type: {label: "Foo"}}).type;

          var scope = new SpecificationScope();

          var spec = derivedType.toSpecInContext();

          scope.dispose();

          expect(spec instanceof Object).toBe(true);
          expect("of" in spec).toBe(false);
        });
      });

      // coverage
      it("should serialize the List type", function() {
        var derivedType = List.type;
        var scope = new SpecificationScope();
        var keyArgs = {};

        derivedType.toSpecInContext(keyArgs);

        scope.dispose();
      });
    });
  });
});
