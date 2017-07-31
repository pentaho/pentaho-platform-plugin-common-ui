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
  "pentaho/type/SpecificationContext",
  "tests/pentaho/type/serializationUtil",
  "tests/test-utils"
], function(Context, SpecificationScope, SpecificationContext, serializationUtil, testUtils) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, spyOn:false, jasmine:false,
           JSON:false */

  var it = testUtils.itAsync;

  describe("pentaho.type.Type", function() {
    var context;
    var Instance;

    function getInstance() {
      return Instance;
    }

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Instance = context.get("instance");
          })
          .then(done, done.fail);
    });

    describe("#toSpec(keyArgs)", function() {
      var derivedType;

      beforeEach(function() {
        derivedType = Instance.extend({$type: {id: "pentaho/type/test"}}).type;
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
    }); // toSpec

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

      it("should return a specification object having the id of the type, if an alias is defined", function() {
        var derivedType = Instance.extend({$type: {id: "pentaho/type/test", alias: "testAlias"}}).type;

        var scope = new SpecificationScope();

        var spec = derivedType.toSpecInContext();

        scope.dispose();

        expect(spec instanceof Object).toBe(true);
        expect(spec.id).toBe(derivedType.id);
      });

      it("should return a specification object having the alias of the type, if it is defined", function() {
        var derivedType = Instance.extend({$type: {id: "pentaho/type/test", alias: "testAlias"}}).type;

        var scope = new SpecificationScope();

        var spec = derivedType.toSpecInContext();

        scope.dispose();

        expect(spec instanceof Object).toBe(true);
        expect(spec.alias).toBe(derivedType.alias);
      });

      it("should return a specification object having the id of the type, if no alias is defined", function() {
        var derivedType = Instance.extend({$type: {id: "pentaho/type/test"}}).type;

        var scope = new SpecificationScope();

        var spec = derivedType.toSpecInContext();

        scope.dispose();

        expect(spec instanceof Object).toBe(true);
        expect(spec.id).toBe(derivedType.id);
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
        serializationUtil.itFillSpecAttribute(getInstance, "description", null,  true);
        serializationUtil.itFillSpecAttribute(getInstance, "description", undefined, false);
      });

      describe("#category", function() {
        // Category can be null or a non-empty string, or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "category", "foo", true);
        serializationUtil.itFillSpecAttribute(getInstance, "category", null,  true);
        serializationUtil.itFillSpecAttribute(getInstance, "category", undefined, false);
      });

      describe("#helpUrl", function() {
        // HelpUrl can be null or a non-empty string, or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "helpUrl", "foo", true);
        serializationUtil.itFillSpecAttribute(getInstance, "helpUrl", null,  true);
        serializationUtil.itFillSpecAttribute(getInstance, "helpUrl", undefined, false);
      });

      describe("#isBrowsable", function() {
        // isBrowsable can be true, false or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "isBrowsable", true,  true);
        serializationUtil.itFillSpecAttribute(getInstance, "isBrowsable", false, true);
        serializationUtil.itFillSpecAttribute(getInstance, "isBrowsable", null, false);
        serializationUtil.itFillSpecAttribute(getInstance, "isBrowsable", undefined, false);
      });

      describe("#isAdvanced", function() {
        // isAdvanced can be true, false or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "isAdvanced", true,  true);
        serializationUtil.itFillSpecAttribute(getInstance, "isAdvanced", false, true);
        serializationUtil.itFillSpecAttribute(getInstance, "isAdvanced", null, false);
        serializationUtil.itFillSpecAttribute(getInstance, "isAdvanced", undefined, false);
      });

      describe("#ordinal", function() {
        // ordinal can be a number or not local.

        serializationUtil.itFillSpecAttribute(getInstance, "ordinal", 1, true);
        serializationUtil.itFillSpecAttribute(getInstance, "ordinal", 2, true);
        serializationUtil.itFillSpecAttribute(getInstance, "ordinal", null, false);
        serializationUtil.itFillSpecAttribute(getInstance, "ordinal", undefined, false);
      });

      describe("#defaultView", function() {
        // view can be null, function or string, or not local.
        var f = function() {};

        serializationUtil.itFillSpecAttribute(getInstance, "defaultView", f, true);
        serializationUtil.itFillSpecAttribute(getInstance, "defaultView", "/my/view", true);
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
          var typeSpec = {defaultView: "/my/view/"};
          var result = serializationUtil.fillSpec(Instance, spec, typeSpec, {isJson: true});

          expect(result).toBe(true);
          expect(spec.defaultView).toBe("/my/view/");
        });
      });

      describe("#mixins", function() {

        function defineSampleMixins(localRequire) {

          localRequire.define("tests/mixins/A", [], function() {

            return ["pentaho/type/value", function(Value) {

              return Value.extend({
                testMethodAInst: function() {},
                $type: {
                  id: "tests/mixins/A",
                  testMethodA: function() {}
                }
              });
            }];
          });

          localRequire.define("tests/mixins/B", [], function() {

            return ["pentaho/type/value", function(Value) {

              return Value.extend({
                testMethodBInst: function() {},
                $type: {
                  id: "tests/mixins/B",
                  testMethodB: function() {}
                }
              });
            }];
          });
        }

        it("should include all local mixin ids", function() {

          return require.using(["pentaho/type/Context"], defineSampleMixins, function(Context) {

            return Context.createAsync().then(function(context) {

              return context.applyAsync([
                "pentaho/type/value",
                "tests/mixins/A",
                "tests/mixins/B"
              ], function(Value, MixinA, MixinB) {

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
      });
    });

    describe("#toRef(keyArgs)", function() {

      it("should return the #id of the type when it has an id and no alias", function() {
        var derivedType = Instance.extend({$type: {id: "pentaho/type/test"}}).type;

        var typeRef = derivedType.toRef();

        expect(typeRef).toBe(derivedType.id);
      });

      it("should return the #alias of the type when it has an id and an alias", function() {
        var derivedType = Instance.extend({$type: {id: "pentaho/type/test", alias: "test"}}).type;

        var typeRef = derivedType.toRef();

        expect(typeRef).toBe(derivedType.alias);
      });

      it("should call #toRefInContext when the type is anonymous", function() {
        var derivedType = Instance.extend().type;

        spyOn(derivedType, "toRefInContext").and.callThrough();

        derivedType.toRef();

        expect(derivedType.toRefInContext.calls.count()).toBe(1);
      });

      it("should call #toRefInContext under a specification context", function() {
        var derivedType = Instance.extend().type;
        var specContext;

        spyOn(derivedType, "toRefInContext").and.callFake(function() {
          specContext = SpecificationContext.current;
        });

        expect(SpecificationContext.current).toBe(null);

        derivedType.toRef();

        expect(specContext instanceof SpecificationContext).toBe(true);
      });

      it("should call #toRefInContext under an existing specification context", function() {
        var derivedType = Instance.extend().type;
        var theSpecContext = new SpecificationContext();
        var specContext;

        spyOn(derivedType, "toRefInContext").and.callFake(function() {
          specContext = SpecificationContext.current;
        });

        SpecificationContext.current = theSpecContext;

        derivedType.toRef();

        expect(specContext).toBe(theSpecContext);

        SpecificationContext.current = null;
      });

      it("should call #toRefInContext with a keyword arguments object", function() {
        var derivedType = Instance.extend().type;

        spyOn(derivedType, "toRefInContext").and.callThrough();

        derivedType.toRef();

        var keyArgs = derivedType.toRefInContext.calls.first().args[0];
        expect(keyArgs instanceof Object).toBe(true);
      });

      it("should call #toRefInContext with all keyword arguments given in keyArgs", function() {
        var derivedType = Instance.extend().type;

        spyOn(derivedType, "toRefInContext").and.callThrough();

        var keyArgs = {
          foo: "foo",
          bar: "bar"
        };

        derivedType.toRef(keyArgs);

        var keyArgs2 = derivedType.toRefInContext.calls.first().args[0];
        expect(keyArgs2 instanceof Object).toBe(true);
        expect(keyArgs2.foo).toBe(keyArgs.foo);
        expect(keyArgs2.bar).toBe(keyArgs.bar);
      });

      it("should call #toRefInContext and return its result", function() {
        var derivedType = Instance.extend().type;
        var result = {};
        spyOn(derivedType, "toRefInContext").and.returnValue(result);

        expect(derivedType.toRef()).toBe(result);
      });
    });

    describe("#toRefInContext(keyArgs)", function() {

      it("should return the #id of the type when it has an id and no alias", function() {
        var derivedType = Instance.extend({$type: {id: "pentaho/type/test"}}).type;

        var scope = new SpecificationScope();

        var typeRef = derivedType.toRefInContext();

        scope.dispose();

        expect(typeRef).toBe(derivedType.id);
      });

      it("should return the #alias of the type when it has an id and an alias", function() {
        var derivedType = Instance.extend({$type: {id: "pentaho/type/test", alias: "test"}}).type;

        var scope = new SpecificationScope();

        var typeRef = derivedType.toRefInContext();

        scope.dispose();

        expect(typeRef).toBe(derivedType.alias);
      });

      it("should return a spec with an anonymous #id when the type is anonymous; the first occurrence", function() {
        // Force generic object spec by specifying a label.
        var derivedType = Instance.extend().type;

        var scope = new SpecificationScope();

        var typeRef = derivedType.toRefInContext();

        scope.dispose();

        expect(typeRef instanceof Object).toBe(true);
        expect(typeof typeRef.id).toBe("string");
        expect(typeRef.id[0]).toBe("_");
      });

      it("should return the existing anonymous id, already in the context, when the type is anonymous; " +
         "the 2nd occurrence", function() {
        var derivedType = Instance.extend().type;

        var scope = new SpecificationScope();

        var typeRef1 = derivedType.toRefInContext();
        var typeRef2 = derivedType.toRefInContext();

        scope.dispose();

        expect(typeRef2).toBe(typeRef1.id);
      });
    });

    describe("#toJSON()", function() {

      var derivedType;

      beforeEach(function() {
        derivedType = Instance.extend({$type: {id: "pentaho/type/test"}}).type;
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
    }); // toJSON
  });
});
