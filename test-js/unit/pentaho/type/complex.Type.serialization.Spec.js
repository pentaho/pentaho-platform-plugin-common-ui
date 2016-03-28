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
  "./serializationUtil"
], function(Context, SpecificationScope, serializationUtil) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false */

  describe("pentaho.type.Complex.Type", function() {

    describe("#_fillSpecInContext(spec, keyArgs)", function() {
      var context, Complex;

      beforeEach(function() {
        context = new Context();
        Complex = context.get("pentaho/type/complex");
      });

      it("should return false when there are no properties to serialize", function() {
        expect(serializationUtil.fillSpec(Complex, {}, {})).toBe(false);
      });

      it("should not create a props array when there are no properties to serialize", function() {
        var spec = {};
        serializationUtil.fillSpec(Complex, spec, {});
        expect("props" in spec).toBe(false);
      });

      it("should return true when there are properties to serialize", function() {
        expect(serializationUtil.fillSpec(Complex, {}, {props: ["foo"]})).toBe(true);
      });

      it("should create a props array when there are properties to serialize", function() {
        var spec = {};
        serializationUtil.fillSpec(Complex, spec, {props: ["foo"]});
        expect(Array.isArray(spec.props)).toBe(true);
      });

      it("should call propertyType#toSpecInContext when the property is root", function() {

        var derivedType = Complex.extend({type: {props: ["foo"]}}).type;
        var fooPropType = derivedType.get("foo");

        spyOn(fooPropType, "toSpecInContext").and.returnValue({});

        var scope = new SpecificationScope();

        derivedType._fillSpecInContext({}, {});

        scope.dispose();

        expect(fooPropType.toSpecInContext.calls.count()).toBe(1);
      });

      it("should call propertyType#toSpecInContext when the property is overridden", function() {

        var Derived = Complex.extend({type: {props: ["foo"]}});
        var Derived2 = Derived.extend({type: {props: [{name: "foo", label: "Bar"}]}});

        var fooPropType = Derived2.type.get("foo");

        spyOn(fooPropType, "toSpecInContext").and.returnValue({});

        var scope = new SpecificationScope();

        Derived2.type._fillSpecInContext({}, {});

        scope.dispose();

        expect(fooPropType.toSpecInContext.calls.count()).toBe(1);
      });

      it("should not call propertyType#toSpecInContext when the property is inherited", function() {

        var Derived = Complex.extend({type: {props: ["foo"]}});
        var Derived2 = Derived.extend();

        var fooPropType = Derived2.type.get("foo");

        spyOn(fooPropType, "toSpecInContext").and.returnValue({});

        var scope = new SpecificationScope();

        Derived2.type._fillSpecInContext({}, {});

        scope.dispose();

        expect(fooPropType.toSpecInContext).not.toHaveBeenCalled();
      });

      it("should call propertyType#toSpecInContext and pass every keyword argument in keyArgs", function() {
        var keyArgs = {
          foo: {},
          bar: {}
        };

        var derivedType = Complex.extend({type: {props: ["foo"]}}).type;
        var fooPropType = derivedType.get("foo");

        spyOn(fooPropType, "toSpecInContext").and.returnValue({});

        var scope = new SpecificationScope();

        derivedType._fillSpecInContext({}, keyArgs);

        scope.dispose();

        var keyArgs2 = fooPropType.toSpecInContext.calls.first().args[0];
        expect(keyArgs2 instanceof Object).toBe(true);
        expect(keyArgs2.foo).toBe(keyArgs.foo);
        expect(keyArgs2.bar).toBe(keyArgs.bar);
      });

      it("should call propertyType#toSpecInContext and push its result to spec.props", function() {
        var derivedType = Complex.extend({type: {props: ["foo"]}}).type;
        var fooPropType = derivedType.get("foo");

        var propTypeSpec = {};
        spyOn(fooPropType, "toSpecInContext").and.returnValue(propTypeSpec);

        var scope = new SpecificationScope();

        var spec = {};
        derivedType._fillSpecInContext(spec, {});

        scope.dispose();

        expect(spec.props[0]).toBe(propTypeSpec);
      });
    });
  });
});
