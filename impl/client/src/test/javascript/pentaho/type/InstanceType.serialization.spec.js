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
  "pentaho/type/Instance",
  "pentaho/type/SpecificationScope",
  "pentaho/type/SpecificationContext",
  "tests/pentaho/type/serializationUtil"
], function(Instance, SpecificationScope, SpecificationContext, serializationUtil) {

  "use strict";

  describe("pentaho.type.Type", function() {

    function getInstance() {
      return Instance;
    }

    describe("#toSpec(keyArgs)", function() {

      var derivedType;

      describe("when type has an identifier", function() {

        it("should return the #id of the type when it has an id and no alias", function() {

          var derivedType = Instance.extend({$type: {id: "pentaho/type/test"}}).type;

          var typeRef = derivedType.toSpec();

          expect(typeRef).toBe(derivedType.id);
        });

        it("should return the #alias of the type when it has an id and an alias", function() {
          var derivedType = Instance.extend({$type: {id: "pentaho/type/test", alias: "test"}}).type;

          var typeRef = derivedType.toSpec();

          expect(typeRef).toBe(derivedType.alias);
        });
      });

      describe("when type is anonymous", function() {

        beforeEach(function() {
          derivedType = Instance.extend().type;
        });

        it("should call #toSpecInContext", function() {
          spyOn(derivedType, "toSpecInContext");

          derivedType.toSpec();

          expect(derivedType.toSpecInContext.calls.count()).toBe(1);
        });

        it("should pass a keyArgs object to toSpecInContext even when not given keyArgs", function() {
          spyOn(derivedType, "toSpecInContext");

          derivedType.toSpec();

          var keyArgs2 = derivedType.toSpecInContext.calls.mostRecent().args[0];
          expect(keyArgs2 instanceof Object).toBe(true);
        });

        it("should pass every given key argument to toSpecInContext", function() {
          spyOn(derivedType, "toSpecInContext");

          var keyArgs = {
            foo: "foo",
            bar: "bar"
          };

          derivedType.toSpec(keyArgs);

          var keyArgs2 = derivedType.toSpecInContext.calls.mostRecent().args[0];
          expect(keyArgs2 instanceof Object).toBe(true);
          expect(keyArgs2.foo).toBe(keyArgs.foo);
          expect(keyArgs2.bar).toBe(keyArgs.bar);
        });

        it("should return the spec returned by toSpecInContext", function() {
          var spec = {};
          spyOn(derivedType, "toSpecInContext").and.returnValue(spec);

          var spec2 = derivedType.toSpec();

          expect(spec2).toBe(spec);
        });
      });
    });

    describe("#toSpecInContext(keyArgs)", function() {

      it("should call #_fillSpecInContext", function() {
        var derivedType = Instance.extend().type;

        spyOn(derivedType, "_fillSpecInContext");

        var scope = new SpecificationScope();

        derivedType.toSpecInContext();

        scope.dispose();

        expect(derivedType._fillSpecInContext.calls.count()).toBe(1);
      });

      it("should call #_fillSpecInContext with a spec object", function() {
        var derivedType = Instance.extend().type;

        spyOn(derivedType, "_fillSpecInContext");

        var scope = new SpecificationScope();

        derivedType.toSpecInContext();

        scope.dispose();

        var spec = derivedType._fillSpecInContext.calls.mostRecent().args[0];
        expect(spec instanceof Object).toBe(true);
      });

      it("should call #_fillSpecInContext with all keyword arguments given in keyArgs", function() {
        var derivedType = Instance.extend().type;

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

      it("should return a specification object having the id of the type, " +
        "if an alias is defined but keyArgs.noAlias=true", function() {
        var derivedType = Instance.extend({$type: {id: "pentaho/type/test", alias: "testAlias"}}).type;

        var scope = new SpecificationScope();

        var spec = derivedType.toSpecInContext({noAlias: true});

        scope.dispose();

        expect(spec).toBe(derivedType.id);
      });

      it("should return a specification object having the alias of the type, if it is defined", function() {

        var derivedType = Instance.extend({$type: {id: "pentaho/type/test", alias: "testAlias"}}).type;

        var scope = new SpecificationScope();

        var spec = derivedType.toSpecInContext();

        scope.dispose();

        expect(spec).toBe(derivedType.alias);
      });

      it("should return a specification object having the id of the type, if no alias is defined", function() {
        var derivedType = Instance.extend({$type: {id: "pentaho/type/test"}}).type;

        var scope = new SpecificationScope();

        var spec = derivedType.toSpecInContext();

        scope.dispose();

        expect(spec).toBe(derivedType.id);
      });

      it("should return a spec with an anonymous #id when the type is anonymous; the first occurrence", function() {
        // Force generic object spec by specifying a label.
        var derivedType = Instance.extend().type;

        var scope = new SpecificationScope();

        var typeRef = derivedType.toSpecInContext();

        scope.dispose();

        expect(typeRef instanceof Object).toBe(true);
        expect(typeof typeRef.id).toBe("string");
        expect(typeRef.id[0]).toBe("_");
      });

      it("should return the existing anonymous id, already in the context, when the type is anonymous; " +
        "the 2nd occurrence", function() {
        var derivedType = Instance.extend().type;

        var scope = new SpecificationScope();

        var typeRef1 = derivedType.toSpecInContext();
        var typeRef2 = derivedType.toSpecInContext();

        scope.dispose();

        expect(typeRef2).toBe(typeRef1.id);
      });
    });

    describe("#_fillSpecInContext(spec, keyArgs)", function() {

      it("should return false when there are no attributes to serialize", function() {
        expect(serializationUtil.fillSpec(Instance, {}, {})).toBe(false);
      });

      describe("#label", function() {
        // Label is either local an not-null, not-empty or is inherited.
        serializationUtil.itFillSpecAttribute(getInstance, "label", "foo", true);
        serializationUtil.itFillSpecAttribute(getInstance, "label", null, false);
        serializationUtil.itFillSpecAttribute(getInstance, "label", undefined, false);
      });

      describe("#description", function() {
        // Description can be null or a non-empty string, or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "description", "foo", true);
        serializationUtil.itFillSpecAttribute(getInstance, "description", null, true);
        serializationUtil.itFillSpecAttribute(getInstance, "description", undefined, false);
      });

      describe("#category", function() {
        // Category can be null or a non-empty string, or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "category", "foo", true);
        serializationUtil.itFillSpecAttribute(getInstance, "category", null, true);
        serializationUtil.itFillSpecAttribute(getInstance, "category", undefined, false);
      });

      describe("#helpUrl", function() {
        // HelpUrl can be null or a non-empty string, or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "helpUrl", "foo", true);
        serializationUtil.itFillSpecAttribute(getInstance, "helpUrl", null, true);
        serializationUtil.itFillSpecAttribute(getInstance, "helpUrl", undefined, false);
      });

      describe("#isBrowsable", function() {
        // `isBrowsable` can be true, false or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "isBrowsable", true, true);
        serializationUtil.itFillSpecAttribute(getInstance, "isBrowsable", false, true);
        serializationUtil.itFillSpecAttribute(getInstance, "isBrowsable", null, false);
        serializationUtil.itFillSpecAttribute(getInstance, "isBrowsable", undefined, false);
      });

      describe("#isAdvanced", function() {
        // `isAdvanced` can be true, false or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "isAdvanced", true, true);
        serializationUtil.itFillSpecAttribute(getInstance, "isAdvanced", false, true);
        serializationUtil.itFillSpecAttribute(getInstance, "isAdvanced", null, false);
        serializationUtil.itFillSpecAttribute(getInstance, "isAdvanced", undefined, false);
      });

      describe("#ordinal", function() {
        // `ordinal` can be a number or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "ordinal", 1, true);
        serializationUtil.itFillSpecAttribute(getInstance, "ordinal", 2, true);
        serializationUtil.itFillSpecAttribute(getInstance, "ordinal", null, false);
        serializationUtil.itFillSpecAttribute(getInstance, "ordinal", undefined, false);
      });

      describe("#defaultView", function() {
        // View can be null, function or string, or not local.
        var f = function() {};

        serializationUtil.itFillSpecAttribute(getInstance, "defaultView", f, true);
        serializationUtil.itFillSpecAttribute(getInstance, "defaultView", "/my/View", true);
        serializationUtil.itFillSpecAttribute(getInstance, "defaultView", null, true);
        serializationUtil.itFillSpecAttribute(getInstance, "defaultView", undefined, false);

        it("should not output a local defaultView constructor when isJson: true", function() {
          var spec = {};
          var typeSpec = {defaultView: f};
          var result = serializationUtil.fillSpec(Instance, spec, typeSpec, {isJson: true});

          expect(result).toBe(false);
        });

        it("should output a local defaultView id when isJson: true", function() {
          var spec = {};
          var typeSpec = {defaultView: "/my/View/"};
          var result = serializationUtil.fillSpec(Instance, spec, typeSpec, {isJson: true});

          expect(result).toBe(true);
          expect(spec.defaultView).toBe("/my/View/");
        });
      });

      describe("#mixins", function() {

        function defineSampleMixins(localRequire) {

          localRequire.define("tests/mixins/A", ["pentaho/type/Value"], function(Value) {

            return Value.extend({
              testMethodAInst: function() {},
              $type: {
                id: "tests/mixins/A",
                testMethodA: function() {}
              }
            });
          });

          localRequire.define("tests/mixins/B", ["pentaho/type/Value"], function(Value) {

            return Value.extend({
              testMethodBInst: function() {},
              $type: {
                id: "tests/mixins/B",
                testMethodB: function() {}
              }
            });
          });
        }

        it("should include all local mixin ids", function() {

          return require.using([
            "pentaho/type/Value",
            "tests/mixins/A",
            "tests/mixins/B"
          ], defineSampleMixins, function(Value, MixinA, MixinB) {

            var DerivedValue1 = Value.extend({
              $type: {
                id: "tests/types/foo1",
                mixins: [MixinA]
              }
            });

            var DerivedValue2 = DerivedValue1.extend({
              $type: {
                id: "tests/types/foo2",
                mixins: [MixinB]
              }
            });

            var scope = new SpecificationScope();
            var spec = {};

            var result = DerivedValue2.type._fillSpecInContext(spec, {});

            scope.dispose();

            expect(result).toBe(true);
            expect(spec.mixins).toEqual(["tests/mixins/B"]);
          });
        });
      });
    });

    describe("#toJSON()", function() {

      var derivedType;

      beforeEach(function() {
        derivedType = Instance.extend().type;
      });

      it("should call #toSpec({isJson: true})", function() {

        spyOn(derivedType, "toSpec");

        derivedType.toJSON();

        expect(derivedType.toSpec.calls.count()).toBe(1);

        var args = derivedType.toSpec.calls.first().args;
        expect(args.length).toBe(1);
        expect(args[0].constructor).toBe(Object);
        expect(args[0].isJson).toBe(true);
      });

      it("should return the result of calling #toSpec", function() {

        var result = {};

        spyOn(derivedType, "toSpec").and.returnValue(result);

        expect(derivedType.toJSON()).toBe(result);
      });

      it("should really be called when JSON.stringify(.) is used", function() {

        var result = {};

        spyOn(derivedType, "toJSON").and.returnValue(result);

        JSON.stringify(derivedType);

        expect(derivedType.toJSON).toHaveBeenCalled();
        expect(derivedType.toJSON.calls.first().object).toBe(derivedType);
      });
    });
  });
});
