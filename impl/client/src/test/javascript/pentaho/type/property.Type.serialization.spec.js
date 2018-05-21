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
  "pentaho/type/Property",
  "pentaho/type/Complex",
  "pentaho/type/String",
  "pentaho/type/SpecificationScope",
  "tests/pentaho/type/propertyTypeUtil"
], function(Property, Complex, PentahoString, SpecificationScope, propertyTypeUtil) {

  "use strict";

  describe("pentaho.type.PropertyType", function() {

    var Derived;

    beforeAll(function() {
      Derived = Complex.extend();
    });

    describe("#toSpecInContext(keyArgs)", function() {

      it("should call #_fillSpecInContext", function() {
        var scope = new SpecificationScope();

        var propType = propertyTypeUtil.createRoot(Derived.type, "foo");

        spyOn(propType, "_fillSpecInContext");

        propType.toSpecInContext();

        scope.dispose();

        expect(propType._fillSpecInContext.calls.count()).toBe(1);
      });

      it("should call #_fillSpecInContext with a spec", function() {
        var scope = new SpecificationScope();

        var propType = propertyTypeUtil.createRoot(Derived.type, "foo");

        spyOn(propType, "_fillSpecInContext");

        propType.toSpecInContext();

        scope.dispose();

        var keyArgs = propType._fillSpecInContext.calls.first().args[0];
        expect(keyArgs instanceof Object).toBe(true);
      });

      it("should call #_fillSpecInContext with keyArgs", function() {
        var scope = new SpecificationScope();

        var propType = propertyTypeUtil.createRoot(Derived.type, "foo");

        spyOn(propType, "_fillSpecInContext");

        propType.toSpecInContext();

        scope.dispose();

        var keyArgs = propType._fillSpecInContext.calls.first().args[1];
        expect(keyArgs instanceof Object).toBe(true);
      });

      it("should call #_fillSpecInContext with all keyword arguments given in keyArgs", function() {
        var scope = new SpecificationScope();

        var keyArgs = {
          foo: "foo",
          bar: "bar"
        };

        var propType = propertyTypeUtil.createRoot(Derived.type, "foo");

        spyOn(propType, "_fillSpecInContext");

        propType.toSpecInContext(keyArgs);

        scope.dispose();

        var keyArgs2 = propType._fillSpecInContext.calls.first().args[1];
        expect(keyArgs2 instanceof Object).toBe(true);
        expect(keyArgs2.foo).toBe(keyArgs.foo);
        expect(keyArgs2.bar).toBe(keyArgs.bar);
      });

      it("should return the name when there are no special attributes and type is 'string'", function() {
        var scope = new SpecificationScope();

        var propType = propertyTypeUtil.createRoot(Derived.type, "foo");

        spyOn(propType, "_fillSpecInContext").and.returnValue(false);

        var spec = propType.toSpecInContext();

        scope.dispose();

        expect(spec).toBe("foo");
      });

      it("should return a specification when the type is not 'string'", function() {
        var scope = new SpecificationScope();

        var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", valueType: "number"});

        spyOn(propType, "_fillSpecInContext").and.returnValue(false);

        var spec = propType.toSpecInContext();

        scope.dispose();

        expect(spec instanceof Object).toBe(true);
      });

      it("should not include `base` when a root property has PropertyType as base", function() {
        var scope = new SpecificationScope();

        var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", valueType: "number"});

        spyOn(propType, "_fillSpecInContext").and.returnValue(false);

        var spec = propType.toSpecInContext();

        scope.dispose();

        expect("base" in spec).toBe(false);
      });

      it("should include `base` when a root property has subtype of PropertyType as base", function() {
        var scope = new SpecificationScope();

        var SubProperty = Property.extend();
        var propType = propertyTypeUtil.createRoot(Derived.type, {base: SubProperty, name: "foo", valueType: "number"});

        expect(propType).not.toBe(SubProperty.type);
        expect(propType.isSubtypeOf(SubProperty.type)).toBe(true);

        spyOn(propType, "_fillSpecInContext").and.returnValue(false);

        var spec = propType.toSpecInContext();

        scope.dispose();

        expect("base" in spec).toBe(true);

        // console.log(JSON.stringify(spec));
        /* > {
               "base": { // SubProperty
                 "base": "property"
               },
               "name": "foo",
               "valueType": "number"
             }
         */
      });

      it("should not include `base` on a non-root property", function() {
        var scope = new SpecificationScope();

        Derived.type.add({name: "foo", valueType: "number"});

        var Derived2 = Derived.extend();

        var propType = propertyTypeUtil.extend(Derived2.type, "foo", {name: "foo"});

        spyOn(propType, "_fillSpecInContext").and.returnValue(false);

        var spec = propType.toSpecInContext();

        scope.dispose();

        expect("base" in spec).toBe(false);
      });

      it("should not include `name` when serializing an abstract property", function() {
        var scope = new SpecificationScope();

        var propType = Property.type;
        // var SubProperty = Property.extend();

        spyOn(propType, "_fillSpecInContext").and.returnValue(false);

        var spec = propType.toSpecInContext();

        scope.dispose();

        expect("name" in spec).toBe(false);

        // console.log(JSON.stringify(spec));
        // > {"id": "property"}

        // ---
        scope = new SpecificationScope();

        var SubProperty = Property.extend();
        propType = SubProperty.type;

        // spyOn(propType, "_fillSpecInContext").and.returnValue(false);

        spec = propType.toSpecInContext();

        scope.dispose();

        expect("name" in spec).toBe(false);

        // console.log(JSON.stringify(spec));
        // > {"base":"property"}
      });

      it("should omit `type` equal to 'value' when serializing an abstract property", function() {
        var scope = new SpecificationScope();

        var propType = Property.type;
        // var SubProperty = Property.extend();

        spyOn(propType, "_fillSpecInContext").and.returnValue(false);

        var spec = propType.toSpecInContext();

        scope.dispose();

        expect("value" in spec).toBe(false);

        // console.log(JSON.stringify(spec));
        // > {"id": "property"}

        // ---
        scope = new SpecificationScope();

        var SubProperty = Property.extend();
        propType = SubProperty.type;

        spec = propType.toSpecInContext();

        scope.dispose();

        expect("value" in spec).toBe(false);

        // console.log(JSON.stringify(spec));
        // > {"base":"property"}
      });

      it("should include `type` if != from 'value' when serializing an abstract property", function() {
        var scope = new SpecificationScope();

        var SubProperty = Property.extend({$type: {valueType: "string"}});
        var propType = SubProperty.type;

        spyOn(propType, "_fillSpecInContext").and.returnValue(false);

        var spec = propType.toSpecInContext();

        scope.dispose();

        expect(spec.valueType).toBe("string");

        // console.log(JSON.stringify(spec));
        // > {"base": "property", "valueType": "string"}
      });

      it("should include `id` if defined when serializing an abstract property", function() {
        var scope = new SpecificationScope();

        spyOn(Property.type, "_fillSpecInContext").and.returnValue(false);

        var SubProperty = Property.extend({$type: {id: "my/foo"}});
        var propType = SubProperty.type;

        var spec = propType.toSpecInContext();

        scope.dispose();

        expect(spec.id).toBe("my/foo");

        // console.log(JSON.stringify(spec));
        // > {"id": "my/foo", "base": "property"}

        // ---

        scope = new SpecificationScope();

        propType = Property.type;

        spec = propType.toSpecInContext();

        scope.dispose();

        expect(spec.id).toBe("property");

        // console.log(JSON.stringify(spec));
        // > {"id":"property"}
      });
    });

    describe("_fillSpecInContext(spec, keyArgs)", function() {

      it("should return false, if only name and type were set", function() {
        var scope = new SpecificationScope();

        var propType = propertyTypeUtil.createRoot(Derived.type, "foo");

        var spec = {};
        var keyArgs = {};
        var result = propType._fillSpecInContext(spec, keyArgs);

        scope.dispose();

        expect(result).toBe(false);
      });

      describe("#label", function() {

        it("should return true when label is set to the default label", function() {
          var scope = new SpecificationScope();

          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", label: "Foo"});

          var spec = {};
          var keyArgs = {};
          var result = propType._fillSpecInContext(spec, keyArgs);

          scope.dispose();

          expect(result).toBe(true);
          expect(spec.label).toBe("Foo");
        });
      });

      describe("#defaultValue", function() {

        it("should not serialize when undefined (root)", function() {
          var scope = new SpecificationScope();

          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});

          var spec = {};
          var keyArgs = {};
          var result = propType._fillSpecInContext(spec, keyArgs);

          scope.dispose();

          expect(result).toBe(false);
          expect("defaultValue" in spec).toBe(false);
        });

        it("should not serialize when undefined (non-root)", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var scope = new SpecificationScope();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {});

          var spec = {};
          var keyArgs = {};
          var result = propType._fillSpecInContext(spec, keyArgs);

          scope.dispose();

          expect(result).toBe(false);
          expect("defaultValue" in spec).toBe(false);
        });

        it("should serialize when null (non-root)", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var scope = new SpecificationScope();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {defaultValue: null});

          var spec = {};
          var keyArgs = {};
          var result = propType._fillSpecInContext(spec, keyArgs);

          scope.dispose();
          expect(result).toBe(true);
          expect(spec.defaultValue).toBe(null);
        });

        it("should serialize without type annotation when of the same type", function() {

          var scope = new SpecificationScope();

          var propType = propertyTypeUtil.createRoot(Derived.type, {
            name: "foo",
            valueType: "string",
            defaultValue: "Foo"
          });

          var spec = {};
          var keyArgs = {};
          var result = propType._fillSpecInContext(spec, keyArgs);

          scope.dispose();
          expect(result).toBe(true);
          expect(spec.defaultValue).toBe("Foo");
        });

        it("should serialize with type annotation when of different subtype", function() {

          var PostalCode = PentahoString.extend();

          var scope = new SpecificationScope();

          var propType = propertyTypeUtil.createRoot(Derived.type, {
            name:  "foo",
            valueType:  "string",
            defaultValue: new PostalCode("Foo")
          });

          var spec = {};
          var keyArgs = {};
          var result = propType._fillSpecInContext(spec, keyArgs);

          scope.dispose();
          expect(result).toBe(true);

          expect(spec.defaultValue).toEqual({
            _: jasmine.any(Object),
            v: "Foo"
          });
        });
      });

      // region Dynamic Attributes
      describe("#isRequired", function() {

        propertyTypeUtil.itDynamicAttribute("isRequired", true);

      });

      describe("#isApplicable", function() {

        propertyTypeUtil.itDynamicAttribute("isApplicable", false);

      });

      describe("#isEnabled", function() {

        propertyTypeUtil.itDynamicAttribute("isEnabled", false);

      });

      describe("#countMin", function() {

        propertyTypeUtil.itDynamicAttribute("countMin", 1);

      });

      describe("#countMax", function() {

        propertyTypeUtil.itDynamicAttribute("countMax", 2);

      });
      // endregion
    });
  });
});
