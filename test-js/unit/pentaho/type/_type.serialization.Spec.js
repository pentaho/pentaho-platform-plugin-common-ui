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
  "pentaho/type/SpecificationScope",
  "pentaho/type/SpecificationContext",
  "./serializationUtil"
], function(Context, SpecificationScope, SpecificationContext, serializationUtil) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, spyOn:false, jasmine:false,
           JSON:false */

  describe("pentaho.type.Type", function() {

    var context = new Context();
    var Instance = context.get("instance");

    describe("#toSpec(keyArgs)", function() {
      var derivedType;

      beforeEach(function() {
        derivedType = Instance.extend({type: {id: "pentaho/type/test"}}).type;
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

      it("should return a specification object having the shortId of the type", function() {
        var derivedType = Instance.extend({type: {id: "pentaho/type/test"}}).type;

        var scope = new SpecificationScope();

        var spec = derivedType.toSpecInContext();

        scope.dispose();

        expect(spec instanceof Object).toBe(true);
        expect(spec.id).toBe("test");
      });
    });

    describe("#_fillSpecInContext(spec, keyArgs)", function() {

      it("should return false when there are no attributes to serialize", function() {
        expect(serializationUtil.fillSpec(Instance, {}, {})).toBe(false);
      });

      describe("#label", function() {
        // Label is either local an not-null, not-empty or is inherited.
        serializationUtil.itFillSpecAttribute(Instance, "label", "foo", true);
        serializationUtil.itFillSpecAttribute(Instance, "label", null, false);
        serializationUtil.itFillSpecAttribute(Instance, "label", undefined, false);
      });

      describe("#description", function() {
        // Description can be null or a non-empty string, or not local.

        serializationUtil.itFillSpecAttribute(Instance, "description", "foo", true);
        serializationUtil.itFillSpecAttribute(Instance, "description", null,  true);
        serializationUtil.itFillSpecAttribute(Instance, "description", undefined, false);
      });

      describe("#category", function() {
        // Category can be null or a non-empty string, or not local.

        serializationUtil.itFillSpecAttribute(Instance, "category", "foo", true);
        serializationUtil.itFillSpecAttribute(Instance, "category", null,  true);
        serializationUtil.itFillSpecAttribute(Instance, "category", undefined, false);
      });

      describe("#helpUrl", function() {
        // HelpUrl can be null or a non-empty string, or not local.

        serializationUtil.itFillSpecAttribute(Instance, "helpUrl", "foo", true);
        serializationUtil.itFillSpecAttribute(Instance, "helpUrl", null,  true);
        serializationUtil.itFillSpecAttribute(Instance, "helpUrl", undefined, false);
      });

      describe("#isBrowsable", function() {
        // isBrowsable can be true, false or not local.

        serializationUtil.itFillSpecAttribute(Instance, "isBrowsable", true,  true);
        serializationUtil.itFillSpecAttribute(Instance, "isBrowsable", false, true);
        serializationUtil.itFillSpecAttribute(Instance, "isBrowsable", null, false);
        serializationUtil.itFillSpecAttribute(Instance, "isBrowsable", undefined, false);
      });

      describe("#isAdvanced", function() {
        // isAdvanced can be true, false or not local.

        serializationUtil.itFillSpecAttribute(Instance, "isAdvanced", true,  true);
        serializationUtil.itFillSpecAttribute(Instance, "isAdvanced", false, true);
        serializationUtil.itFillSpecAttribute(Instance, "isAdvanced", null, false);
        serializationUtil.itFillSpecAttribute(Instance, "isAdvanced", undefined, false);
      });

      describe("#ordinal", function() {
        // ordinal can be a number or not local.

        serializationUtil.itFillSpecAttribute(Instance, "ordinal", 1, true);
        serializationUtil.itFillSpecAttribute(Instance, "ordinal", 2, true);
        serializationUtil.itFillSpecAttribute(Instance, "ordinal", null, false);
        serializationUtil.itFillSpecAttribute(Instance, "ordinal", undefined, false);
      });

      describe("#view", function() {
        // view can be null, function or string, or not local.
        var f = function() {};

        serializationUtil.itFillSpecAttribute(Instance, "view", f, true);
        serializationUtil.itFillSpecAttribute(Instance, "view", "/my/view", true);
        serializationUtil.itFillSpecAttribute(Instance, "view", null, true);
        serializationUtil.itFillSpecAttribute(Instance, "view", undefined, false);

        it("should not output a local view constructor when isJson: true", function() {
          var spec = {};
          var typeSpec = {view: f};
          var result = serializationUtil.fillSpec(Instance, spec, typeSpec, {isJson: true});

          expect(result).toBe(false);
        });

        it("should output a local view id when isJson: true", function() {
          var spec = {};
          var typeSpec = {view: "/my/view/"};
          var result = serializationUtil.fillSpec(Instance, spec, typeSpec, {isJson: true});

          expect(result).toBe(true);
          expect(spec.view).toBe("/my/view/");
        });
      });
    });

    describe("#toRef(keyArgs)", function() {

      it("should return the #shortId of the type when it has an id", function() {
        var derivedType = Instance.extend({type: {id: "pentaho/type/test"}}).type;

        var typeRef = derivedType.toRef();

        expect(typeRef).toBe("test");
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

      it("should return the #shortId of the type when it has an id", function() {
        var derivedType = Instance.extend({type: {id: "pentaho/type/test"}}).type;

        var scope = new SpecificationScope();

        var typeRef = derivedType.toRefInContext();

        scope.dispose();

        expect(typeRef).toBe("test");
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
        derivedType = Instance.extend({type: {id: "pentaho/type/test"}}).type;
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
