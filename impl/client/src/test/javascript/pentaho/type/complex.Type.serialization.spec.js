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
  "pentaho/type/Complex",
  "pentaho/type/SpecificationScope",
  "tests/pentaho/type/serializationUtil"
], function(Complex, SpecificationScope, serializationUtil) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false */

  describe("pentaho.type.Complex.Type", function() {

    var CustomComplex;

    beforeAll(function() {
      CustomComplex = Complex.extend({$type: {props: ["x"]}});
    });

    describe("#_fillSpecInContext(spec, keyArgs)", function() {

      it("should return false when there are no properties to serialize", function() {
        expect(serializationUtil.fillSpec(Complex, {}, {})).toBe(false);
      });

      it("should not create a props array when there are no properties to serialize", function() {
        var spec = {};
        serializationUtil.fillSpec(Complex, spec, {});
        expect("props" in spec).toBe(false);
      });

      it("should not create a props array when there are no local properties to serialize", function() {
        var Derived = Complex.extend({$type: {props: ["foo"]}});

        var spec = {};
        serializationUtil.fillSpec(Derived, spec, {});
        expect("props" in spec).toBe(false);
      });

      it("should return true when isReadOnly is specified", function() {
        expect(serializationUtil.fillSpec(Complex, {}, {isReadOnly: true})).toBe(true);
      });

      it("should create property isReadOnly when isReadOnly is specified", function() {
        var spec = {};
        serializationUtil.fillSpec(Complex, spec, {isReadOnly: true});
        expect(spec.isReadOnly).toBe(true);
      });

      it("should return true when isEntity is specified", function() {
        expect(serializationUtil.fillSpec(Complex, {}, {isEntity: true})).toBe(true);
      });

      it("should create property isEntity when isEntity is specified", function() {
        var spec = {};
        serializationUtil.fillSpec(Complex, spec, {isEntity: true});
        expect(spec.isEntity).toBe(true);
      });

      it("should return true when there are properties to serialize", function() {
        expect(serializationUtil.fillSpec(Complex, {}, {props: ["foo"]})).toBe(true);
      });

      it("should create a props array when there are local properties to serialize", function() {
        var spec = {};
        serializationUtil.fillSpec(Complex, spec, {props: ["x"]});
        expect(Array.isArray(spec.props)).toBe(true);
      });

      it("should call propertyType#toSpecInContext when the property is root", function() {

        var derivedType = CustomComplex.type;
        var xPropType = derivedType.get("x");

        spyOn(xPropType, "toSpecInContext").and.returnValue({});

        var scope = new SpecificationScope();

        derivedType._fillSpecInContext({}, {});

        scope.dispose();

        expect(xPropType.toSpecInContext.calls.count()).toBe(1);
      });

      it("should call propertyType#toSpecInContext when the property is overridden", function() {

        var Derived2 = CustomComplex.extend({$type: {props: [{name: "x", label: "Bar"}]}});

        var xPropType = Derived2.type.get("x");

        spyOn(xPropType, "toSpecInContext").and.returnValue({});

        var scope = new SpecificationScope();

        Derived2.type._fillSpecInContext({}, {});

        scope.dispose();

        expect(xPropType.toSpecInContext.calls.count()).toBe(1);
      });

      it("should not call propertyType#toSpecInContext when the property is inherited", function() {

        var Derived2 = CustomComplex.extend();

        var xPropType = Derived2.type.get("x");

        spyOn(xPropType, "toSpecInContext").and.returnValue({});

        var scope = new SpecificationScope();

        Derived2.type._fillSpecInContext({}, {});

        scope.dispose();

        expect(xPropType.toSpecInContext).not.toHaveBeenCalled();
      });

      it("should call propertyType#toSpecInContext and pass every keyword argument in keyArgs", function() {
        var keyArgs = {
          foo: {},
          bar: {}
        };

        var derivedType = CustomComplex.type;
        var xPropType = derivedType.get("x");

        spyOn(xPropType, "toSpecInContext").and.returnValue({});

        var scope = new SpecificationScope();

        derivedType._fillSpecInContext({}, keyArgs);

        scope.dispose();

        var keyArgs2 = xPropType.toSpecInContext.calls.first().args[0];
        expect(keyArgs2 instanceof Object).toBe(true);
        expect(keyArgs2.foo).toBe(keyArgs.foo);
        expect(keyArgs2.bar).toBe(keyArgs.bar);
      });

      it("should call propertyType#toSpecInContext and push its result to spec.props", function() {
        var derivedType = CustomComplex.type;
        var fooPropType = derivedType.get("x");

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
