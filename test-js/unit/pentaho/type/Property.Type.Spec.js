/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/Property",
  "tests/pentaho/util/errorMatch"
], function(Context, Property, errorMatch) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true, jasmine:true*/

  var context = new Context(),
      PropertyType = Property.Type,
      PentahoBoolean = context.get("pentaho/type/boolean"),
      Complex = context.get("pentaho/type/complex"),
      PentahoString = context.get("pentaho/type/string"),
      PentahoNumber  = context.get("pentaho/type/number");

  describe("pentaho.type.Property.Type -", function() {

    it("is a function", function() {
      expect(typeof PropertyType).toBe("function");
    });

    describe("define a root property -", function() {

      var Derived;

      function createRootPropType(typeSpec) {
        return Property.extendProto(
            null,
            {
              type: typeSpec
            },
            {
              declaringType: Derived.type,
              index: 1,
              instance: Derived.prototype,
              isRoot: true
            }).type;
      }

      beforeEach(function() {
        Derived = Complex.extend();
      });

      describe("when spec is a string -", function() {
        var propType;

        beforeEach(function() {
          propType = createRootPropType("fooBarGuru");
        });

        it("should build a property type object", function() {
          expect(propType instanceof PropertyType).toBe(true);
        });

        it("should have `declaringType` equal to containing Complex type instance", function() {
          expect(propType.declaringType).toBe(Derived.type);
        });

        it("should have `root` equal to itself", function() {
          expect(propType.root).toBe(propType);
        });

        it("should have `ancestor` equal to `null`", function() {
          expect(propType.ancestor).toBe(null);
        });

        it("should have `name` equal to the spec string", function() {
          expect(propType.name).toBe("fooBarGuru");
        });

        it("should have `label` be a capitalization of `name`", function() {
          // only resolved after type is instantiated and, possibly, configured.
          expect(propType.label).toBe("Foo Bar Guru");
        });

        it("should have `type` string", function() {
          expect(propType.type).toBe(PentahoString.type);
        });

        it("should have `isList=false`", function() {
          expect(propType.isList).toBe(false);
        });

        it("should have `index` equal to the specified value", function() {
          expect(propType.index).toBe(1);
        });
      }); // end when spec is a string

      describe("when spec is an object -", function() {

        var propType;

        beforeEach(function() {
          propType = createRootPropType({name: "foo"});
        });

        it("should build a property type object", function() {
          expect(propType instanceof PropertyType).toBe(true);
        });

        it("should have `declaringType` equal to containing Complex type instance", function() {
          expect(propType.declaringType).toBe(Derived.type);
        });

        it("should have `root` equal to itself", function() {
          expect(propType.root).toBe(propType);
        });

        it("should have `ancestor` equal to `null`", function() {
          expect(propType.ancestor).toBe(null);
        });
      }); // end when spec is an object

      //region Type Attributes
      // TODO: unify with value tests
      describe("label - ", function() {
        it("should default to the capitalization of `name`", function() {
          var propType = createRootPropType({name: "foo"});
          expect(propType.label).toBe("Foo");
        });

        it("should convert empty to default", function() {
          var propType = createRootPropType({name: "foo", label: ""});
          expect(propType.label).toBe("Foo");
        });

        it("should convert null to default", function() {
          var propType = createRootPropType({name: "foo", label: null});
          expect(propType.label).toBe("Foo");
        });

        it("should convert undefined to default", function() {
          var propType = createRootPropType({name: "foo", label: undefined});
          expect(propType.label).toBe("Foo");
        });

        it("should respect the specified value", function() {
          var propType = createRootPropType({name: "foo", label: "MyFoo"});
          expect(propType.label).toBe("MyFoo");
        });
      }); // end label

      describe("description - ", function() {
        it("should default to null", function() {
          var propType = createRootPropType({name: "foo1"});
          expect(propType.description).toBe(null);

          propType = createRootPropType({name: "foo2", description: undefined});
          expect(propType.description).toBe(null);
        });

        it("should convert empty to null", function() {
          var propType = createRootPropType({name: "foo", description: ""});
          expect(propType.description).toBe(null);
        });

        it("should respect null", function() {
          var propType = createRootPropType({name: "foo", description: null});
          expect(propType.description).toBe(null);
        });

        it("should respect the specified value", function() {
          var propType = createRootPropType({name: "foo", description: "MyFoo"});
          expect(propType.description).toBe("MyFoo");
        });
      }); // end description

      describe("category - ", function() {
        it("should default to null", function() {
          var propType = createRootPropType({name: "foo1"});
          expect(propType.category).toBe(null);

          propType = createRootPropType({name: "foo2", category: undefined});
          expect(propType.category).toBe(null);
        });

        it("should convert empty to null", function() {
          var propType = createRootPropType({name: "foo", category: ""});
          expect(propType.category).toBe(null);
        });

        it("should respect null", function() {
          var propType = createRootPropType({name: "foo", category: null});
          expect(propType.category).toBe(null);
        });

        it("should respect the specified value", function() {
          var propType = createRootPropType({name: "foo", category: "MyFoo"});
          expect(propType.category).toBe("MyFoo");
        });
      }); // end category

      describe("helpUrl - ", function() {
        it("should default to null", function() {
          var propType = createRootPropType({name: "foo1"});
          expect(propType.helpUrl).toBe(null);

          propType = createRootPropType({name: "foo2", helpUrl: undefined});
          expect(propType.helpUrl).toBe(null);
        });

        it("should convert empty to null", function() {
          var propType = createRootPropType({name: "foo", helpUrl: ""});
          expect(propType.helpUrl).toBe(null);
        });

        it("should respect null", function() {
          var propType = createRootPropType({name: "foo", helpUrl: null});
          expect(propType.helpUrl).toBe(null);
        });

        it("should respect the specified value", function() {
          var propType = createRootPropType({name: "foo", helpUrl: "MyFoo"});
          expect(propType.helpUrl).toBe("MyFoo");
        });
      }); // end helpUrl

      describe("isBrowsable - ", function() {
        it("should default to true", function() {
          var propType = createRootPropType({name: "foo"});
          expect(propType.isBrowsable).toBe(true);
        });

        it("should convert undefined to default", function() {
          var propType = createRootPropType({name: "foo", isBrowsable: undefined});
          expect(propType.isBrowsable).toBe(true);
        });

        it("should convert null to default", function() {
          var propType = createRootPropType({name: "foo", isBrowsable: null});
          expect(propType.isBrowsable).toBe(true);
        });

        it("should cast other values to boolean", function() {
          var propType = createRootPropType({name: "foo1", isBrowsable: 1});
          expect(propType.isBrowsable).toBe(true);

          propType = createRootPropType({name: "foo2", isBrowsable: 0});
          expect(propType.isBrowsable).toBe(false);

          propType = createRootPropType({name: "foo3", isBrowsable: ""});
          expect(propType.isBrowsable).toBe(false);

          propType = createRootPropType({name: "foo4", isBrowsable: true});
          expect(propType.isBrowsable).toBe(true);

          propType = createRootPropType({name: "foo5", isBrowsable: "yes"});
          expect(propType.isBrowsable).toBe(true);

          propType = createRootPropType({name: "foo6", isBrowsable: "no"});
          expect(propType.isBrowsable).toBe(true);
        });
      }); // end isBrowsable

      describe("isAdvanced - ", function() {
        it("should default to false", function() {
          var propType = createRootPropType({name: "foo"});
          expect(propType.isAdvanced).toBe(false);
        });

        it("should convert undefined to default", function() {
          var propType = createRootPropType({name: "foo", isAdvanced: undefined});
          expect(propType.isAdvanced).toBe(false);
        });

        it("should convert null to default", function() {
          var propType = createRootPropType({name: "foo", isAdvanced: null});
          expect(propType.isAdvanced).toBe(false);
        });

        it("should cast other values to boolean", function() {
          var propType = createRootPropType({name: "foo1", isAdvanced: 1});
          expect(propType.isAdvanced).toBe(true);

          propType = createRootPropType({name: "foo2", isAdvanced: 0});
          expect(propType.isAdvanced).toBe(false);

          propType = createRootPropType({name: "foo3", isAdvanced: ""});
          expect(propType.isAdvanced).toBe(false);

          propType = createRootPropType({name: "foo4", isAdvanced: true});
          expect(propType.isAdvanced).toBe(true);

          propType = createRootPropType({name: "foo5", isAdvanced: "yes"});
          expect(propType.isAdvanced).toBe(true);

          propType = createRootPropType({name: "foo6", isAdvanced: "no"});
          expect(propType.isAdvanced).toBe(true);
        });
      }); // end isAdvanced
      //endregion

      //region Defining Attributes
      describe("name - ", function() {

        it("should throw when spec is falsy", function() {
          function expectIt(name) {
            expect(function() {
              createRootPropType({
                name: name,
                type: "string"
              });
            }).toThrow(errorMatch.argRequired("name"));
          }

          expectIt(undefined);
          expectIt(null);
          expectIt("");
        });

        it("should respect a truthy spec value -", function() {
          var propType = createRootPropType({
            name: "fooBar",
            type: "string"
          });

          expect(propType.name).toBe("fooBar");
        });

        it("should throw when changed", function() {
          var propType = createRootPropType({
            name: "fooBar",
            type: "string"
          });

          expect(function() {
            propType.name = "fooBar2";
          }).toThrow(); // message varies with JS engine...
        });

        it("should not throw when set but not changed", function() {
          var propType = createRootPropType({
            name: "fooBar",
            type: "string"
          });

          propType.name = "fooBar";
        });
      }); // end name

      describe("isList - ", function() {
        it("should return `true` when the type is a list type", function() {
          var propType = createRootPropType({name: "foo", type: ["string"]});
          expect(propType.isList).toBe(true);
        });

        it("should return `false` when the type is an element type", function() {
          var propType = createRootPropType({name: "foo", type: "string"});
          expect(propType.isList).toBe(false);
        });
      }); // end isList

      describe("type - ", function() {

        // NOTE: tests of Context#get test type resolution more thoroughly.

        it("should default to String", function() {
          var propType = createRootPropType({name: "foo"});
          expect(propType.type).toBe(PentahoString.type);
        });

        it("should resolve the specified spec value", function() {
          var propType = createRootPropType({name: "foo1", type: "string"});
          expect(propType.type).toBe(PentahoString.type);

          propType = createRootPropType({name: "foo2", type: "boolean"});
          expect(propType.type).toBe(PentahoBoolean.type);
        });

        it("should throw if the specified spec value is the id of an unloaded module", function() {
          expect(function() {
            createRootPropType({name: "foo", type: "bar/oof"});
          }).toThrowError(/bar\/oof/);
        });

        // A root property does not have a base type to respect...
        it("should respect change to any type", function() {
          var propType = createRootPropType({name: "foo1", type: "number"});

          var Integer = PentahoNumber.extend();
          propType.type = Integer.type;
          expect(propType.type).toBe(Integer.type);

          propType.type = PentahoString.type;
          expect(propType.type).toBe(PentahoString.type);
        });
      }); // end type

      describe("elemType - ", function() {
        it("for singular values, should provide same output as `type`", function() {
          ["string", "number", "boolean", "date", "complex"].forEach(function(type) {
            var propType = createRootPropType({name: "foo1", type: type});
            expect(propType.elemType).toBe(propType.type);
          });
        });

        it("for list values, should return the type of its elements (base/of syntax)", function() {
          ["string", "number", "boolean", "date", "complex"].forEach(function(type) {
            var propType = createRootPropType({name: "foo1", type: {base: "list", of: type}});
            expect(propType.elemType).toBe(propType.type.of);
          });
        });

      }); // end elemType

      describe("value - ", function(){

        var propType;
        beforeEach(function(){
          propType = createRootPropType({name: "foo", type: "string",  value: "Foo"});
        });

        it("should honor the default value", function(){
          expect(propType.value.value).toBe("Foo");
          expect(propType.value.formatted).toBe(null);
        });

      }); //end value
      //endregion

      //region Dynamic Attributes
      describe("isRequired - ", function() {
        it("should be immutable", function() {
          var propType = Property.type;
          var isRequired = propType.isRequired;
          propType.isRequired = true;
          expect(propType.isRequired).toBe(isRequired);
        });

        it("should default to an unset local value", function() {
          var propType = createRootPropType({name: "foo"});
          expect(propType.isRequired).toBe(undefined);
        });

        it("should convert undefined spec value to default", function() {
          var propType = createRootPropType({name: "foo", isRequired: true});
          expect(propType.isRequired).toBe(true);
          propType.isRequired = undefined;
          expect(propType.isRequired).toBe(undefined);
        });

        it("should convert null spec value to default", function() {
          var propType = createRootPropType({name: "foo", isRequired: true});
          expect(propType.isRequired).toBe(true);
          propType.isRequired = null;
          expect(propType.isRequired).toBe(undefined);
        });

        it("should cast other non-function spec values to boolean", function() {
          var propType = createRootPropType({name: "foo1", isRequired: 1});
          expect(propType.isRequired).toBe(true);

          propType = createRootPropType({name: "foo2", isRequired: 0});
          expect(propType.isRequired).toBe(false);

          propType = createRootPropType({name: "foo3", isRequired: ""});
          expect(propType.isRequired).toBe(false);

          propType = createRootPropType({name: "foo4", isRequired: true});
          expect(propType.isRequired).toBe(true);

          propType = createRootPropType({name: "foo5", isRequired: "yes"});
          expect(propType.isRequired).toBe(true);

          propType = createRootPropType({name: "foo6", isRequired: "no"});
          expect(propType.isRequired).toBe(true);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propType = createRootPropType({name: "foo1", isRequired: f});
          expect(propType.isRequired).toBe(f);
        });

        it("should evaluate a function spec value", function() {
          var f = jasmine.createSpy().and.callFake(function() { return true; });
          var propType = createRootPropType({name: "foo1", isRequired: f});

          var owner = {};
          expect(propType.isRequiredEval(owner)).toBe(true);
          expect(f.calls.count()).toBe(1);
        });

        it("should evaluate a function spec value and cast its result", function() {
          var owner = {};
          var f = function() { return 1; };
          var propType = createRootPropType({name: "foo1", isRequired: f});
          expect(propType.isRequiredEval(owner)).toBe(true);

          // ----

          f = function() { return 0; };
          propType = createRootPropType({name: "foo2", isRequired: f});
          expect(propType.isRequiredEval(owner)).toBe(false);

          // ---

          f = function() { return {}; };
          propType = createRootPropType({name: "foo2", isRequired: f});
          expect(propType.isRequiredEval(owner)).toBe(true);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propType = createRootPropType({name: "foo1", isRequired: f});
          expect(propType.isRequiredEval(owner)).toBe(false);

          // ----

          f = function() { return undefined; };
          propType = createRootPropType({name: "foo2", isRequired: f});
          expect(propType.isRequiredEval(owner)).toBe(false);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = createRootPropType({name: "foo1", isRequired: f});
          propType.isRequiredEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = createRootPropType({name: "foo1", isRequired: f});
          propType.isRequiredEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end required

      describe("countMin - ", function() {
        it("should be immutable", function() {
          var propType = Property.type;
          var countMin = propType.countMin;
          propType.countMin = 42;
          expect(propType.countMin).toBe(countMin);
        });

        it("should default to an unset local value", function() {
          var propType = createRootPropType({name: "foo"});
          expect(propType.countMin).toBe(undefined);
        });

        it("should convert undefined spec value to an unset local value", function() {
          var propType = createRootPropType({name: "foo", countMin: 1});
          expect(propType.countMin).toBe(1);
          propType.countMin = undefined;
          expect(propType.countMin).toBe(undefined);
        });

        it("should convert null spec value to an unset local value", function() {
          var propType = createRootPropType({name: "foo", countMin: 1});
          expect(propType.countMin).toBe(1);
          propType.countMin = null;
          expect(propType.countMin).toBe(undefined);
        });

        it("should convert negative spec values to an unset local value", function() {
          var propType = createRootPropType({name: "foo1", countMin: -1});
          expect(propType.countMin).toBe(undefined);
        });

        it("should convert NaN spec values to an unset local value", function() {
          var propType = createRootPropType({name: "foo1", countMin: NaN});
          expect(propType.countMin).toBe(undefined);
        });

        it("should convert positive float spec values to its floored integer", function() {
          var propType = createRootPropType({name: "foo1", countMin: 1.1});
          expect(propType.countMin).toBe(1);
        });

        it("should parse string spec values", function() {
          var propType = createRootPropType({name: "foo1", countMin: "1"});
          expect(propType.countMin).toBe(1);

          propType = createRootPropType({name: "foo2", countMin: "+1"});
          expect(propType.countMin).toBe(1);
        });

        it("should convert an invalid spec value to an unset local value", function() {
          var propType = createRootPropType({name: "foo1", countMin: "foo"});
          expect(propType.countMin).toBe(undefined);

          propType = createRootPropType({name: "foo2", countMin: "-1"});
          expect(propType.countMin).toBe(undefined);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propType = createRootPropType({name: "foo1", countMin: f});
          expect(propType.countMin).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propType = createRootPropType({name: "foo1", countMin: f});
          expect(propType.countMinEval(owner)).toBe(0);

          // ----

          f = function() { return undefined; };
          propType = createRootPropType({name: "foo2", countMin: f});
          expect(propType.countMinEval(owner)).toBe(0);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = createRootPropType({name: "foo1", countMin: f});
          propType.countMinEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = createRootPropType({name: "foo1", countMin: f});
          propType.countMinEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end countMin

      describe("countMax - ", function() {
        it("should be immutable", function() {
          var propType = Property.type;
          var countMax = propType.countMax;
          propType.countMax = 42;
          expect(propType.countMax).toBe(countMax);
        });

        it("should default to an unset local value", function() {
          var propType = createRootPropType({name: "foo"});
          expect(propType.countMax).toBe(undefined);
        });

        it("should convert undefined spec value to an unset local value", function() {
          var propType = createRootPropType({name: "foo", countMax: 1});
          expect(propType.countMax).toBe(1);
          propType.countMax = undefined;
          expect(propType.countMax).toBe(undefined);
        });

        it("should convert null spec value to an unset local value", function() {
          var propType = createRootPropType({name: "foo", countMax: 1});
          expect(propType.countMax).toBe(1);
          propType.countMax = null;
          expect(propType.countMax).toBe(undefined);
        });

        it("should convert negative spec value to an unset local value", function() {
          var propType = createRootPropType({name: "foo1", countMax: -1});
          expect(propType.countMax).toBe(undefined);
        });

        it("should convert NaN spec values to an unset local value", function() {
          var propType = createRootPropType({name: "foo1", countMax: NaN});
          expect(propType.countMax).toBe(undefined);
        });

        it("should convert positive float spec values to its floored integer", function() {
          var propType = createRootPropType({name: "foo1", countMax: 1.1});
          expect(propType.countMax).toBe(1);
        });

        it("should parse string spec values", function() {
          var propType = createRootPropType({name: "foo1", countMax: "1"});
          expect(propType.countMax).toBe(1);

          propType = createRootPropType({name: "foo2", countMax: "+1"});
          expect(propType.countMax).toBe(1);
        });

        it("should parse an 'Infinity' string spec value", function() {
          var propType = createRootPropType({name: "foo1", countMax: "Infinity"});
          expect(propType.countMax).toBe(Infinity);
        });

        it("should convert invalid string spec values to an unset local value", function() {
          var propType = createRootPropType({name: "foo1", countMax: "foo"});
          expect(propType.countMax).toBe(undefined);

          propType = createRootPropType({name: "foo2", countMax: "-1"});
          expect(propType.countMax).toBe(undefined);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propType = createRootPropType({name: "foo1", countMax: f});
          expect(propType.countMax).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propType = createRootPropType({name: "foo1", countMax: f});
          expect(propType.countMaxEval(owner)).toBe(Infinity);

          // ----

          f = function() { return undefined; };
          propType = createRootPropType({name: "foo2", countMax: f});
          expect(propType.countMaxEval(owner)).toBe(Infinity);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = createRootPropType({name: "foo1", countMax: f});
          propType.countMaxEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = createRootPropType({name: "foo1", countMax: f});
          propType.countMaxEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end countMax

      describe("isApplicable - ", function() {
        it("should be immutable", function() {
          var propType = Property.type;
          var isApplicable = propType.isApplicable;
          propType.isApplicable = false;
          expect(propType.isApplicable).toBe(isApplicable);
        });

        it("should default to an unset local value", function() {
          var propType = createRootPropType({name: "foo"});
          expect(propType.isApplicable).toBe(undefined);
        });

        it("should convert undefined spec value to an unset local value", function() {
          var propType = createRootPropType({name: "foo", isApplicable: false});
          expect(propType.isApplicable).toBe(false);
          propType.isApplicable = undefined;
          expect(propType.isApplicable).toBe(undefined);
        });

        it("should convert null spec value to an unset local value", function() {
          var propType = createRootPropType({name: "foo", isApplicable: false});
          expect(propType.isApplicable).toBe(false);
          propType.isApplicable = null;
          expect(propType.isApplicable).toBe(undefined);
        });

        it("should cast other non-function spec values to boolean", function() {
          var propType = createRootPropType({name: "foo1", isApplicable: 1});
          expect(propType.isApplicable).toBe(true);

          propType = createRootPropType({name: "foo2", isApplicable: 0});
          expect(propType.isApplicable).toBe(false);

          propType = createRootPropType({name: "foo3", isApplicable: ""});
          expect(propType.isApplicable).toBe(false);

          propType = createRootPropType({name: "foo4", isApplicable: true});
          expect(propType.isApplicable).toBe(true);

          propType = createRootPropType({name: "foo5", isApplicable: "yes"});
          expect(propType.isApplicable).toBe(true);

          propType = createRootPropType({name: "foo6", isApplicable: "no"});
          expect(propType.isApplicable).toBe(true);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propType = createRootPropType({name: "foo1", isApplicable: f});
          expect(propType.isApplicable).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propType = createRootPropType({name: "foo1", isApplicable: f});
          expect(propType.isApplicableEval(owner)).toBe(true);

          // ----

          f = function() { return undefined; };
          propType = createRootPropType({name: "foo2", isApplicable: f});
          expect(propType.isApplicableEval(owner)).toBe(true);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = createRootPropType({name: "foo1", isApplicable: f});
          propType.isApplicableEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = createRootPropType({name: "foo1", isApplicable: f});
          propType.isApplicableEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end applicable

      describe("isReadOnly - ", function() {
        it("should be immutable", function() {
          var propType = Property.type;
          var isReadOnly = propType.isReadOnly;
          propType.isReadOnly = true;
          expect(propType.isReadOnly).toBe(isReadOnly);
        });

        it("should default to an unset local value", function() {
          var propType = createRootPropType({name: "foo"});
          expect(propType.isReadOnly).toBe(undefined);
        });

        it("should convert undefined spec value to default", function() {
          var propType = createRootPropType({name: "foo", isReadOnly: true});
          expect(propType.isReadOnly).toBe(true);
          propType.isReadOnly = undefined;
          expect(propType.isReadOnly).toBe(undefined);
        });

        it("should convert null spec to default", function() {
          var propType = createRootPropType({name: "foo", isReadOnly: true});
          expect(propType.isReadOnly).toBe(true);
          propType.isReadOnly = null;
          expect(propType.isReadOnly).toBe(undefined);
        });

        it("should cast other non-function spec values to boolean", function() {
          var propType = createRootPropType({name: "foo1", isReadOnly: 1});
          expect(propType.isReadOnly).toBe(true);

          propType = createRootPropType({name: "foo2", isReadOnly: 0});
          expect(propType.isReadOnly).toBe(false);

          propType = createRootPropType({name: "foo3", isReadOnly: ""});
          expect(propType.isReadOnly).toBe(false);

          propType = createRootPropType({name: "foo4", isReadOnly: true});
          expect(propType.isReadOnly).toBe(true);

          propType = createRootPropType({name: "foo5", isReadOnly: "yes"});
          expect(propType.isReadOnly).toBe(true);

          propType = createRootPropType({name: "foo6", isReadOnly: "no"});
          expect(propType.isReadOnly).toBe(true);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propType = createRootPropType({name: "foo1", isReadOnly: f});
          expect(propType.isReadOnly).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propType = createRootPropType({name: "foo1", isReadOnly: f});
          expect(propType.isReadOnlyEval(owner)).toBe(false);

          // ----

          f = function() { return undefined; };
          propType = createRootPropType({name: "foo2", isReadOnly: f});
          expect(propType.isReadOnlyEval(owner)).toBe(false);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = createRootPropType({name: "foo1", isReadOnly: f});
          propType.isReadOnlyEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = createRootPropType({name: "foo1", isReadOnly: f});
          propType.isReadOnlyEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end isReadOnly

      describe("countRange -", function() {
        // 1. when !isList => min and max <= 1
        // 2. required => countMin >= 1
        // 3. min <= max

        it("should limit min and max to 1 when isList = false", function() {
          var propType = createRootPropType({name: "foo", countMin: 10, countMax: 10});
          expect(propType.countMin).toBe(10);
          expect(propType.countMax).toBe(10);
          expect(propType.countRangeEval({})).toEqual({min: 1, max: 1});
        });

        it("should not limit min and max to 1 when isList = true", function() {
          var propType = createRootPropType({name: "foo", countMin: 10, countMax: 10, type: ["string"]});
          expect(propType.countMin).toBe(10);
          expect(propType.countMax).toBe(10);
          expect(propType.countRangeEval({})).toEqual({min: 10, max: 10});
        });

        it("should have min = 1 when required", function() {
          var propType = createRootPropType({name: "foo", isRequired: true});
          expect(propType.countMin).toBe(undefined);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(1);
        });

        it("should have min = 1 when required and countMin = 0", function() {
          var propType = createRootPropType({name: "foo", isRequired: true, countMin: 0});
          expect(propType.countMin).toBe(0);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(1);
        });

        it("should have min equal to countMin when countMin >= 1 and any required value", function() {
          var propType = createRootPropType({name: "foo1", isRequired: true, countMin: 1});
          expect(propType.countMin).toBe(1);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(1);

          propType = createRootPropType({name: "foo2", isRequired: false, countMin: 1});
          expect(propType.countMin).toBe(1);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(1);

          propType = createRootPropType({name: "foo3", isRequired: true, countMin: 3, type: ["string"]});
          expect(propType.countMin).toBe(3);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(3);

          propType = createRootPropType({name: "foo4", isRequired: false, countMin: 3, type: ["string"]});
          expect(propType.countMin).toBe(3);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(3);
        });

        // required <= max
        it("should have max = 1 when countMax = 0 and required = true", function() {
          var propType = createRootPropType({name: "foo", isRequired: true, countMax: 0});
          expect(propType.countMin).toBe(undefined);
          expect(propType.countMax).toBe(0);
          expect(propType.countRangeEval({}).max).toBe(1);
        });

        it("should have max = 1 when countMax is 0 and countMin = 1", function() {
          var propType = createRootPropType({name: "foo", countMin: 1, countMax: 0});
          expect(propType.countMin).toBe(1);
          expect(propType.countMax).toBe(0);
          expect(propType.countRangeEval({}).max).toBe(1);
        });

        it("should have max = 10 when countMin = 10, countMax = 5 and isList = true", function() {
          var propType = createRootPropType({name: "foo", countMin: 10, countMax: 5, type: ["string"]});
          expect(propType.countMin).toBe(10);
          expect(propType.countMax).toBe(5);
          expect(propType.countRangeEval({}).max).toBe(10);
        });

        it("should have max = Infinity when countMin = 10 and isList = true", function() {
          var propType = createRootPropType({name: "foo", countMin: 10, type: ["string"]});
          expect(propType.countMin).toBe(10);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).max).toBe(Infinity);
        });

        it("should have min = 0 when countMax = 10 and isList = true", function() {
          var propType = createRootPropType({name: "foo", countMax: 10, type: []});
          expect(propType.countMin).toBe(undefined);
          expect(propType.countMax).toBe(10);
          expect(propType.countRangeEval({}).min).toBe(0);
        });

        it("should have min = 0 when countMax = 1", function() {
          var propType = createRootPropType({name: "foo", countMax: 1});
          expect(propType.countMin).toBe(undefined);
          expect(propType.countMax).toBe(1);
          expect(propType.countRangeEval({}).min).toBe(0);
        });
      });
      //endregion
    }); // end define a root property

    describe("override a property -", function() {

      function extendProp(declaringType, propName, subPropTypeSpec) {
        var basePropType = declaringType.ancestor.get(propName);

        return Property.extendProto(
            basePropType.instance, {
              type: subPropTypeSpec
            },
            {
              declaringType: declaringType,
              instance: declaringType.instance
            }).type;
      }

      it("should throw if spec.name is not the name of the base property", function() {
        var Base = Complex.extend();

        Base.type.add({name: "baseStr"});

        var Derived = Base.extend();

        expect(function() {
          extendProp(Derived.type, "baseStr", {name: "baseStr2"});
        }).toThrow(errorMatch.argInvalid("name"));
      });

      describe("basic characteristics -", function() {
        var propType, basePropType, Derived;

        beforeEach(function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          Derived = Base.extend();

          basePropType = Base.type.get("baseStr");

          propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});
        });

        it("should be an instance of `PropertyType`", function() {
          expect(propType instanceof PropertyType).toBe(true);
        });

        it("should have the overridden property as `ancestor`", function() {
          expect(propType).not.toBe(basePropType);
          expect(propType.ancestor).toBe(basePropType);
        });

        it("should have `declaringType` equal to the derived class' instance", function() {
          expect(propType.declaringType).toBe(Derived.type);
        });

        it("should have `root` equal to the base property", function() {
          expect(propType.root).toBe(basePropType);
        });
      });

      //region Type attributes
      describe("label -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", label: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo"});

          expect(propType.label).toBe("FooABC");
        });

        it("should respect the spec value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", label: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", label: "XYZ"});

          expect(propType.label).toBe("XYZ");
        });

        it("should respect a set value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", label: "ABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", label: "XYZ"});

          expect(propType.label).toBe("XYZ");

          propType.label = "WWW";

          expect(propType.label).toBe("WWW");
        });

        it("should inherit the base value when set to nully or empty", function() {
          var Base = Complex.extend();

          var baseLabel = "ABC";
          Base.type.add({name: "foo", label: baseLabel});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", label: "XYZ"});

          expect(propType.label).toBe("XYZ");
          propType.label = null;
          expect(propType.label).toBe(baseLabel);

          // -----

          propType.label = "XYZ";
          expect(propType.label).toBe("XYZ");
          propType.label = undefined;
          expect(propType.label).toBe(baseLabel);

          // -----

          propType.label = "XYZ";
          expect(propType.label).toBe("XYZ");
          propType.label = "";
          expect(propType.label).toBe(baseLabel);
        });
      }); // end label

      describe("description -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo"});

          expect(propType.description).toBe("FooABC");
        });

        it("should inherit the base value if spec is undefined", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", description: undefined});

          expect(propType.description).toBe("FooABC");
        });

        it("should respect the spec null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", description: null});

          expect(propType.description).toBe(null);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", description: "XYZ"});

          expect(propType.description).toBe("XYZ");
        });

        it("should respect a set null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "ABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", description: "XYZ"});

          propType.description = null;

          expect(propType.description).toBe(null);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "ABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", description: "XYZ"});

          expect(propType.description).toBe("XYZ");

          propType.description = "WWW";

          expect(propType.description).toBe("WWW");
        });

        it("should inherit the base value when set to undefined", function() {
          var Base = Complex.extend();

          var baseDesc = "ABC";
          Base.type.add({name: "foo", description: baseDesc});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", description: "XYZ"});

          expect(propType.description).toBe("XYZ");

          propType.description = undefined;

          expect(propType.description).toBe(baseDesc);
        });
      }); // end description

      describe("category -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo"});

          expect(propType.category).toBe("FooABC");
        });

        it("should inherit the base value if spec is undefined", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", category: undefined});

          expect(propType.category).toBe("FooABC");
        });

        it("should respect the spec null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", category: null});

          expect(propType.category).toBe(null);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", category: "XYZ"});

          expect(propType.category).toBe("XYZ");
        });

        it("should respect a set null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "ABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", category: "XYZ"});

          propType.category = null;

          expect(propType.category).toBe(null);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "ABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", category: "XYZ"});

          expect(propType.category).toBe("XYZ");

          propType.category = "WWW";

          expect(propType.category).toBe("WWW");
        });

        it("should inherit the base value when set to undefined", function() {
          var Base = Complex.extend();

          var baseValue = "ABC";
          Base.type.add({name: "foo", category: baseValue});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", category: "XYZ"});

          expect(propType.category).toBe("XYZ");

          propType.category = undefined;

          expect(propType.category).toBe(baseValue);
        });
      }); // end category

      describe("helpUrl -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo"});

          expect(propType.helpUrl).toBe("FooABC");
        });

        it("should inherit the base value if spec is undefined", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", helpUrl: undefined});

          expect(propType.helpUrl).toBe("FooABC");
        });

        it("should respect the spec null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", helpUrl: null});

          expect(propType.helpUrl).toBe(null);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", helpUrl: "XYZ"});

          expect(propType.helpUrl).toBe("XYZ");
        });

        it("should respect a set null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "ABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", helpUrl: "XYZ"});

          propType.helpUrl = null;

          expect(propType.helpUrl).toBe(null);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "ABC"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", helpUrl: "XYZ"});

          expect(propType.helpUrl).toBe("XYZ");

          propType.helpUrl = "WWW";

          expect(propType.helpUrl).toBe("WWW");
        });

        it("should inherit the base value when set to undefined", function() {
          var Base = Complex.extend();

          var baseValue = "ABC";
          Base.type.add({name: "foo", helpUrl: baseValue});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", helpUrl: "XYZ"});

          expect(propType.helpUrl).toBe("XYZ");

          propType.helpUrl = undefined;

          expect(propType.helpUrl).toBe(baseValue);
        });
      }); // end helpUrl

      describe("isBrowsable -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: false});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo"});

          expect(propType.isBrowsable).toBe(false);

          // ----

          Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: true});

          Derived = Base.extend();

          propType = extendProp(Derived.type, "foo", {name: "foo"});

          expect(propType.isBrowsable).toBe(true);
        });

        it("should inherit the base value if spec is nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: false});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", isBrowsable: undefined});

          expect(propType.isBrowsable).toBe(false);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: false});

          Derived = Base.extend();

          propType = extendProp(Derived.type, "foo", {name: "foo", isBrowsable: null});

          expect(propType.isBrowsable).toBe(false);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: true});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", isBrowsable: false});

          expect(propType.isBrowsable).toBe(false);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: true});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo"});

          expect(propType.isBrowsable).toBe(true);

          propType.isBrowsable = false;

          expect(propType.isBrowsable).toBe(false);
        });

        it("should inherit the base value when set to nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: true});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", isBrowsable: false});

          expect(propType.isBrowsable).toBe(false);

          propType.isBrowsable = undefined;

          expect(propType.isBrowsable).toBe(true);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: true});

          Derived = Base.extend();

          propType = extendProp(Derived.type, "foo", {name: "foo", isBrowsable: false});

          expect(propType.isBrowsable).toBe(false);

          propType.isBrowsable = null;

          expect(propType.isBrowsable).toBe(true);
        });
      }); // end isBrowsable

      describe("isAdvanced -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: false});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo"});

          expect(propType.isAdvanced).toBe(false);

          // ----

          Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: true});

          Derived = Base.extend();

          propType = extendProp(Derived.type, "foo", {name: "foo"});

          expect(propType.isAdvanced).toBe(true);
        });

        it("should inherit the base value if spec is nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: true});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", isAdvanced: undefined});

          expect(propType.isAdvanced).toBe(true);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: true});

          Derived = Base.extend();

          propType = extendProp(Derived.type, "foo", {name: "foo", isAdvanced: null});

          expect(propType.isAdvanced).toBe(true);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: false});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", isAdvanced: true});

          expect(propType.isAdvanced).toBe(true);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: false});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo"});

          expect(propType.isAdvanced).toBe(false);

          propType.isAdvanced = true;

          expect(propType.isAdvanced).toBe(true);
        });

        it("should inherit the base value when set to nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: false});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "foo", {name: "foo", isAdvanced: true});

          expect(propType.isAdvanced).toBe(true);

          propType.isAdvanced = undefined;

          expect(propType.isAdvanced).toBe(false);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: false});

          Derived = Base.extend();

          propType = extendProp(Derived.type, "foo", {name: "foo", isAdvanced: true});

          expect(propType.isAdvanced).toBe(true);

          propType.isAdvanced = null;

          expect(propType.isAdvanced).toBe(false);
        });
      }); // end isAdvanced
      //endregion

      //region Defining attributes
      describe("name - ", function() {
        var propType;

        beforeEach(function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});
        });

        it("should have the same name", function() {
          expect(propType.name).toBe("baseStr");
        });

        it("should throw when changed", function() {
          expect(function() {
            propType.name = "baseStrXYZ";
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should not throw when set but not changed", function() {
          propType.name = "baseStr";
        });
      }); // end name

      // mutable, but must always inherit from the base type.
      // should not change after the complex class has been sub-classed or has any instances of it (not enforced).
      // NOTE: see also refinement.Spec.js, property usage unit tests
      describe("type - ", function() {
        it("should inherit base type value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseNum", type: PentahoNumber});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseNum", {name: "baseNum"});

          expect(propType.type).toBe(PentahoNumber.type);
        });

        it("should accept a spec type that is a sub-type of the base property's type", function() {
          var PostalCode = PentahoString.extend();

          var Base = Complex.extend();

          Base.type.add({name: "postalCode", type: PentahoString});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "postalCode", {name: "postalCode", type: PostalCode});

          expect(propType.type).toBe(PostalCode.type);
        });

        it("should accept a _set_ type that is a sub-type of the base property's type", function() {
          var PostalCode1 = PentahoString.extend();
          var PostalCode2 = PentahoString.extend();

          // ----

          var Base = Complex.extend();

          Base.type.add({name: "postalCode", type: PentahoString});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "postalCode", {name: "postalCode"});

          propType.type = PostalCode1;
          expect(propType.type).toBe(PostalCode1.type);

          propType.type = PostalCode2;
          expect(propType.type).toBe(PostalCode2.type);
        });

        it("should throw on a spec type that is not a sub-type of the base property's type", function() {

          var Base = Complex.extend();

          Base.type.add({name: "num", type: PentahoString});

          var Derived = Base.extend();

          expect(function() {
            extendProp(Derived.type, "num", {name: "num", type: PentahoNumber});
          }).toThrow(errorMatch.argInvalid("type"));
        });

        it("should throw on a set type that is not a sub-type of the base property's type", function() {

          var Base = Complex.extend();

          Base.type.add({name: "num", type: PentahoString});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "num", {name: "num"});

          expect(function() {
            propType.type = PentahoNumber;
          }).toThrow(errorMatch.argInvalid("type"));
        });
      });
      //endregion

      //region Dynamic attributes
      describe("required -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});

          expect(propType.isRequired).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr", isRequired: true});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propType.isRequiredEval(owner)).toBe(true);
        });

        it("should respect the specified value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isRequired: false});

          expect(propType.isRequired).toBe(false);
        });

        it("should evaluate a base function and, if false, only then the sub function", function() {
          var index = 1;

          var Base = Complex.extend();

          var baseIndex = -1;
          var baseSpy = jasmine.createSpy().and.callFake(function() { baseIndex = index++; return false; });

          Base.type.add({name: "baseStr", isRequired: baseSpy});

          var Derived = Base.extend();

          var subIndex = -1;
          var subSpy = jasmine.createSpy().and.callFake(function() { subIndex = index++; return false; });

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isRequired: subSpy});

          var owner = {};

          propType.isRequiredEval(owner);
          expect(baseIndex).toBe(1);
          expect(subIndex ).toBe(2);
        });

        it("should not evaluate the sub function if the base function evaluates to true", function() {
          var Base = Complex.extend();

          var baseSpy = jasmine.createSpy().and.returnValue(true);

          Base.type.add({name: "baseStr", isRequired: baseSpy});

          var Derived = Base.extend();

          var subSpy = jasmine.createSpy().and.returnValue(true);

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isRequired: subSpy});

          var owner = {};

          expect(propType.isRequiredEval(owner)).toBe(true);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(0);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "baseStr", isRequired: true});

          Derived = Base.extend();

          subSpy = jasmine.createSpy().and.returnValue(true);

          propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isRequired: subSpy});

          owner = {};

          expect(propType.isRequiredEval(owner)).toBe(true);
          expect(subSpy.calls.count()).toBe(0);
        });
      }); // end required

      describe("countMin -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});

          expect(propType.countMin).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr", countMin: 1});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propType.countMinEval(owner)).toBe(1);
        });

        it("should respect the specified value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", countMin: 2});

          var owner = {};

          expect(propType.countMinEval(owner)).toBe(2);
        });

        it("should evaluate the base function and then, always, the sub function", function() {
          var index = 1;

          var Base = Complex.extend();

          var baseIndex = -1;
          var baseSpy = jasmine.createSpy().and.callFake(function() { baseIndex = index++; return 1; });

          Base.type.add({name: "baseStr", countMin: baseSpy});

          var Derived = Base.extend();

          var subIndex = -1;
          var subSpy = jasmine.createSpy().and.callFake(function() { subIndex = index++; return 1; });

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", countMin: subSpy});

          var owner = {};

          propType.countMinEval(owner);
          expect(baseIndex).toBe(1);
          expect(subIndex ).toBe(2);
        });

        it("should evaluate to the maximum result of the base and sub functions", function() {
          var Base = Complex.extend();

          var baseSpy = jasmine.createSpy().and.returnValue(1);

          Base.type.add({name: "baseStr", countMin: baseSpy});

          var Derived = Base.extend();

          var subSpy = jasmine.createSpy().and.returnValue(3);

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", countMin: subSpy});

          var owner = {};

          expect(propType.countMinEval(owner)).toBe(3);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(1);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "baseStr", countMin: 2});

          Derived = Base.extend();

          subSpy = function() { return 1; };

          propType = extendProp(Derived.type, "baseStr", {name: "baseStr", countMin: subSpy});

          owner = {};

          expect(propType.countMinEval(owner)).toBe(2);
        });
      }); // end countMin

      describe("countMax -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});

          expect(propType.countMax).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr", countMax: 5});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propType.countMaxEval(owner)).toBe(5);
        });

        it("should respect the specified value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", countMax: 2});

          var owner = {};

          expect(propType.countMaxEval(owner)).toBe(2);
        });

        it("should evaluate the base function and then, always, the sub function", function() {
          var index = 1;

          var Base = Complex.extend();

          var baseIndex = -1;
          var baseSpy = jasmine.createSpy().and.callFake(function() { baseIndex = index++; return 1; });

          Base.type.add({name: "baseStr", countMax: baseSpy});

          var Derived = Base.extend();

          var subIndex = -1;
          var subSpy = jasmine.createSpy().and.callFake(function() { subIndex = index++; return 1; });

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", countMax: subSpy});

          var owner = {};

          propType.countMaxEval(owner);
          expect(baseIndex).toBe(1);
          expect(subIndex ).toBe(2);
        });

        it("should evaluate to the minimum result of the base and sub functions", function() {
          var Base = Complex.extend();

          var baseSpy = jasmine.createSpy().and.returnValue(1);

          Base.type.add({name: "baseStr", countMax: baseSpy});

          var Derived = Base.extend();

          var subSpy = jasmine.createSpy().and.returnValue(3);

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", countMax: subSpy});

          var owner = {};

          expect(propType.countMaxEval(owner)).toBe(1);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(1);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "baseStr", countMax: 2});

          Derived = Base.extend();

          subSpy = function() { return 1; };

          propType = extendProp(Derived.type, "baseStr", {name: "baseStr", countMax: subSpy});

          owner = {};

          expect(propType.countMaxEval(owner)).toBe(1);
        });
      }); // end countMax

      describe("isApplicable -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});

          expect(propType.isApplicable).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr", isApplicable: false});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propType.isApplicableEval(owner)).toBe(false);
        });

        it("should respect the specified value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isApplicable: false});

          expect(propType.isApplicable).toBe(false);
        });

        it("should evaluate a base function and, if true, only then the sub function", function() {
          var index = 1;

          var Base = Complex.extend();

          var baseIndex = -1;
          var baseSpy = jasmine.createSpy().and.callFake(function() { baseIndex = index++; return true; });

          Base.type.add({name: "baseStr", isApplicable: baseSpy});

          var Derived = Base.extend();

          var subIndex = -1;
          var subSpy = jasmine.createSpy().and.callFake(function() { subIndex = index++; return true; });

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isApplicable: subSpy});

          var owner = {};

          propType.isApplicableEval(owner);
          expect(baseIndex).toBe(1);
          expect(subIndex ).toBe(2);
        });

        it("should not evaluate the sub function if the base function evaluates to false", function() {
          var Base = Complex.extend();

          var baseSpy = jasmine.createSpy().and.returnValue(false);

          Base.type.add({name: "baseStr", isApplicable: baseSpy});

          var Derived = Base.extend();

          var subSpy = jasmine.createSpy().and.returnValue(true);

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isApplicable: subSpy});

          var owner = {};

          expect(propType.isApplicableEval(owner)).toBe(false);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(0);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "baseStr", isApplicable: false});

          Derived = Base.extend();

          subSpy = jasmine.createSpy().and.returnValue(true);

          propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isApplicable: subSpy});

          owner = {};

          expect(propType.isApplicableEval(owner)).toBe(false);
          expect(subSpy.calls.count()).toBe(0);
        });
      }); // end applicable

      describe("isReadOnly -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});

          expect(propType.isReadOnly).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr", isReadOnly: true});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propType.isReadOnlyEval(owner)).toBe(true);
        });

        it("should respect the specified value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isReadOnly: false});

          expect(propType.isReadOnly).toBe(false);
        });

        it("should evaluate a base function and, if false, only then the sub function", function() {
          var index = 1;

          var Base = Complex.extend();

          var baseIndex = -1;
          var baseSpy = jasmine.createSpy().and.callFake(function() { baseIndex = index++; return false; });

          Base.type.add({name: "baseStr", isReadOnly: baseSpy});

          var Derived = Base.extend();

          var subIndex = -1;
          var subSpy = jasmine.createSpy().and.callFake(function() { subIndex = index++; return false; });

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isReadOnly: subSpy});

          var owner = {};

          propType.isReadOnlyEval(owner);
          expect(baseIndex).toBe(1);
          expect(subIndex ).toBe(2);
        });

        it("should not evaluate the sub function if the base function evaluates to true", function() {
          var Base = Complex.extend();

          var baseSpy = jasmine.createSpy().and.returnValue(true);

          Base.type.add({name: "baseStr", isReadOnly: baseSpy});

          var Derived = Base.extend();

          var subSpy = jasmine.createSpy().and.returnValue(true);

          var propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isReadOnly: subSpy});

          var owner = {};

          expect(propType.isReadOnlyEval(owner)).toBe(true);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(0);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "baseStr", isReadOnly: true});

          Derived = Base.extend();

          subSpy = jasmine.createSpy().and.returnValue(true);

          propType = extendProp(Derived.type, "baseStr", {name: "baseStr", isReadOnly: subSpy});

          owner = {};

          expect(propType.isReadOnlyEval(owner)).toBe(true);
          expect(subSpy.calls.count()).toBe(0);
        });
      }); // end isReadOnly

      describe("value -", function(){
        var propType;
        beforeEach(function(){
          var Base = Complex.extend();
          Base.type.add({name: "baseNum", type: PentahoNumber});
          var Derived = Base.extend();

          propType = extendProp(Derived.type, "baseNum", {name: "baseNum"});
        });

        it("should be null by default", function() {
          expect(propType.value).toBeNull();
        });

        it("should inherit base type value by default", function() {
          propType.value = 42;
          expect(propType.value.value).toBe(42);
        });
        it("should inherit base type value by default", function() {
          propType.value = {value: 42, formatted: "Forty-two"};
          expect(propType.value.value).toBe(42);
        });

        it("should be resettable to the default value", function() {
          propType.value = 42;
          propType.value = undefined;
          expect(propType.value).toBeNull();
        });

      }); // end value
      //endregion
    }); // end override a property

    // TODO: toValue

  }); // pentaho.type.Property.Type
});