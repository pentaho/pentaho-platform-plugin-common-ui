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
  "pentaho/type/complex",
  "pentaho/type/string",
  "pentaho/type/boolean",
  "pentaho/type/number",
  "pentaho/i18n!/pentaho/type/i18n/types",
  "pentaho/util/error"
], function(Context, Property, complexFactory, stringFactory, booleanFactory, numberFactory, bundle, error) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true, jasmine:true*/

  var context = new Context(),
      PropertyMeta = Property.Meta,
      Boolean = context.get(booleanFactory),
      Complex = context.get(complexFactory),
      String  = context.get(stringFactory),
      Number  = context.get(numberFactory);

  describe("pentaho.type.Property.Meta -", function() {

    it("is a function", function() {
      expect(typeof PropertyMeta).toBe("function");
    });

    describe("define a root property -", function() {

      var Derived;

      function createRootPropMeta(metaSpec) {
        return Property.extendProto(
            null,
            {
              meta: metaSpec
            },
            {
              declaringMeta: Derived.meta,
              index: 1,
              mesa: Derived.prototype,
              isRoot: true
            }).meta;
      }

      beforeEach(function() {
        Derived = Complex.extend();
      });

      describe("when spec is a string -", function() {
        var propMeta;

        beforeEach(function() {
          propMeta = createRootPropMeta("fooBarGuru");
        });

        it("should build a property meta instance", function() {
          expect(propMeta instanceof PropertyMeta).toBe(true);
        });

        it("should have `declaringType` equal to containing Complex type instance", function() {
          expect(propMeta.declaringType).toBe(Derived.meta);
        });

        it("should have `root` equal to itself", function() {
          expect(propMeta.root).toBe(propMeta);
        });

        it("should have `ancestor` equal to `null`", function() {
          expect(propMeta.ancestor).toBe(null);
        });

        it("should have `name` equal to the spec string", function() {
          expect(propMeta.name).toBe("fooBarGuru");
        });

        it("should have `label` be a capitalization of `name`", function() {
          // only resolved after type is instantiated and, possibly, configured.
          expect(propMeta.label).toBe("Foo Bar Guru");
        });

        it("should have `type` string", function() {
          expect(propMeta.type).toBe(String.meta);
        });

        it("should have `list=false`", function() {
          expect(propMeta.list).toBe(false);
        });

        it("should have `index` equal to the specified value", function() {
          expect(propMeta.index).toBe(1);
        });
      }); // end when spec is a string

      describe("when spec is an object -", function() {

        var propMeta;

        beforeEach(function() {
          propMeta = createRootPropMeta({name: "foo"});
        });

        it("should build a property meta instance", function() {
          expect(propMeta instanceof PropertyMeta).toBe(true);
        });

        it("should have `declaringType` equal to containing Complex type instance", function() {
          expect(propMeta.declaringType).toBe(Derived.meta);
        });

        it("should have `root` equal to itself", function() {
          expect(propMeta.root).toBe(propMeta);
        });

        it("should have `ancestor` equal to `null`", function() {
          expect(propMeta.ancestor).toBe(null);
        });
      }); // end when spec is an object

      //region Item.Meta Attributes
      // TODO: unify with value tests
      describe("label - ", function() {
        it("should default to the capitalization of `name`", function() {
          var propMeta = createRootPropMeta({name: "foo"});
          expect(propMeta.label).toBe("Foo");
        });

        it("should convert empty to default", function() {
          var propMeta = createRootPropMeta({name: "foo", label: ""});
          expect(propMeta.label).toBe("Foo");
        });

        it("should convert null to default", function() {
          var propMeta = createRootPropMeta({name: "foo", label: null});
          expect(propMeta.label).toBe("Foo");
        });

        it("should convert undefined to default", function() {
          var propMeta = createRootPropMeta({name: "foo", label: undefined});
          expect(propMeta.label).toBe("Foo");
        });

        it("should respect the specified value", function() {
          var propMeta = createRootPropMeta({name: "foo", label: "MyFoo"});
          expect(propMeta.label).toBe("MyFoo");
        });
      }); // end label

      describe("description - ", function() {
        it("should default to null", function() {
          var propMeta = createRootPropMeta({name: "foo1"});
          expect(propMeta.description).toBe(null);

          propMeta = createRootPropMeta({name: "foo2", description: undefined});
          expect(propMeta.description).toBe(null);
        });

        it("should convert empty to null", function() {
          var propMeta = createRootPropMeta({name: "foo", description: ""});
          expect(propMeta.description).toBe(null);
        });

        it("should respect null", function() {
          var propMeta = createRootPropMeta({name: "foo", description: null});
          expect(propMeta.description).toBe(null);
        });

        it("should respect the specified value", function() {
          var propMeta = createRootPropMeta({name: "foo", description: "MyFoo"});
          expect(propMeta.description).toBe("MyFoo");
        });
      }); // end description

      describe("category - ", function() {
        it("should default to null", function() {
          var propMeta = createRootPropMeta({name: "foo1"});
          expect(propMeta.category).toBe(null);

          propMeta = createRootPropMeta({name: "foo2", category: undefined});
          expect(propMeta.category).toBe(null);
        });

        it("should convert empty to null", function() {
          var propMeta = createRootPropMeta({name: "foo", category: ""});
          expect(propMeta.category).toBe(null);
        });

        it("should respect null", function() {
          var propMeta = createRootPropMeta({name: "foo", category: null});
          expect(propMeta.category).toBe(null);
        });

        it("should respect the specified value", function() {
          var propMeta = createRootPropMeta({name: "foo", category: "MyFoo"});
          expect(propMeta.category).toBe("MyFoo");
        });
      }); // end category

      describe("helpUrl - ", function() {
        it("should default to null", function() {
          var propMeta = createRootPropMeta({name: "foo1"});
          expect(propMeta.helpUrl).toBe(null);

          propMeta = createRootPropMeta({name: "foo2", helpUrl: undefined});
          expect(propMeta.helpUrl).toBe(null);
        });

        it("should convert empty to null", function() {
          var propMeta = createRootPropMeta({name: "foo", helpUrl: ""});
          expect(propMeta.helpUrl).toBe(null);
        });

        it("should respect null", function() {
          var propMeta = createRootPropMeta({name: "foo", helpUrl: null});
          expect(propMeta.helpUrl).toBe(null);
        });

        it("should respect the specified value", function() {
          var propMeta = createRootPropMeta({name: "foo", helpUrl: "MyFoo"});
          expect(propMeta.helpUrl).toBe("MyFoo");
        });
      }); // end helpUrl

      describe("browsable - ", function() {
        it("should default to true", function() {
          var propMeta = createRootPropMeta({name: "foo"});
          expect(propMeta.browsable).toBe(true);
        });

        it("should convert undefined to default", function() {
          var propMeta = createRootPropMeta({name: "foo", browsable: undefined});
          expect(propMeta.browsable).toBe(true);
        });

        it("should convert null to default", function() {
          var propMeta = createRootPropMeta({name: "foo", browsable: null});
          expect(propMeta.browsable).toBe(true);
        });

        it("should cast other values to boolean", function() {
          var propMeta = createRootPropMeta({name: "foo1", browsable: 1});
          expect(propMeta.browsable).toBe(true);

          propMeta = createRootPropMeta({name: "foo2", browsable: 0});
          expect(propMeta.browsable).toBe(false);

          propMeta = createRootPropMeta({name: "foo3", browsable: ""});
          expect(propMeta.browsable).toBe(false);

          propMeta = createRootPropMeta({name: "foo4", browsable: true});
          expect(propMeta.browsable).toBe(true);

          propMeta = createRootPropMeta({name: "foo5", browsable: "yes"});
          expect(propMeta.browsable).toBe(true);

          propMeta = createRootPropMeta({name: "foo6", browsable: "no"});
          expect(propMeta.browsable).toBe(true);
        });
      }); // end browsable

      describe("advanced - ", function() {
        it("should default to false", function() {
          var propMeta = createRootPropMeta({name: "foo"});
          expect(propMeta.advanced).toBe(false);
        });

        it("should convert undefined to default", function() {
          var propMeta = createRootPropMeta({name: "foo", advanced: undefined});
          expect(propMeta.advanced).toBe(false);
        });

        it("should convert null to default", function() {
          var propMeta = createRootPropMeta({name: "foo", advanced: null});
          expect(propMeta.advanced).toBe(false);
        });

        it("should cast other values to boolean", function() {
          var propMeta = createRootPropMeta({name: "foo1", advanced: 1});
          expect(propMeta.advanced).toBe(true);

          propMeta = createRootPropMeta({name: "foo2", advanced: 0});
          expect(propMeta.advanced).toBe(false);

          propMeta = createRootPropMeta({name: "foo3", advanced: ""});
          expect(propMeta.advanced).toBe(false);

          propMeta = createRootPropMeta({name: "foo4", advanced: true});
          expect(propMeta.advanced).toBe(true);

          propMeta = createRootPropMeta({name: "foo5", advanced: "yes"});
          expect(propMeta.advanced).toBe(true);

          propMeta = createRootPropMeta({name: "foo6", advanced: "no"});
          expect(propMeta.advanced).toBe(true);
        });
      }); // end advanced
      //endregion

      //region Defining Attributes
      describe("name - ", function() {

        it("should throw when spec is falsy", function() {
          function expectIt(name) {
            expect(function() {
              createRootPropMeta({
                name: name,
                type: "string"
              });
            }).toThrowError(error.argRequired("name").message);
          }

          expectIt(undefined);
          expectIt(null);
          expectIt("");
        });

        it("should respect a truthy spec value -", function() {
          var propMeta = createRootPropMeta({
            name: "fooBar",
            type: "string"
          });

          expect(propMeta.name).toBe("fooBar");
        });

        it("should throw when changed", function() {
          var propMeta = createRootPropMeta({
            name: "fooBar",
            type: "string"
          });

          expect(function() {
            propMeta.name = "fooBar2";
          }).toThrow(); // message varies with JS engine...
        });

        it("should not throw when set but not changed", function() {
          var propMeta = createRootPropMeta({
            name: "fooBar",
            type: "string"
          });

          propMeta.name = "fooBar";
        });
      }); // end name

      describe("list - ", function() {
        it("should return `true` when the type is a list type", function() {
          var propMeta = createRootPropMeta({name: "foo", type: ["string"]});
          expect(propMeta.list).toBe(true);
        });

        it("should return `false` when the type is an element type", function() {
          var propMeta = createRootPropMeta({name: "foo", type: "string"});
          expect(propMeta.list).toBe(false);
        });
      }); // end list

      describe("type - ", function() {

        // NOTE: tests of Context#get test type resolution more thoroughly.

        it("should default to String", function() {
          var propMeta = createRootPropMeta({name: "foo"});
          expect(propMeta.type).toBe(String.meta);
        });

        it("should resolve the specified spec value", function() {
          var propMeta = createRootPropMeta({name: "foo1", type: "string"});
          expect(propMeta.type).toBe(String.meta);

          propMeta = createRootPropMeta({name: "foo2", type: "boolean"});
          expect(propMeta.type).toBe(Boolean.meta);
        });

        it("should throw if the specified spec value is the id of an unloaded module", function() {
          expect(function() {
            createRootPropMeta({name: "foo", type: "bar/oof"});
          }).toThrowError(/bar\/oof/);
        });

        // A root property does not have a base type to respect...
        it("should respect change to any type", function() {
          var propMeta = createRootPropMeta({name: "foo1", type: "number"});

          var Integer = Number.extend();
          propMeta.type = Integer.meta;
          expect(propMeta.type).toBe(Integer.meta);

          propMeta.type = String.meta;
          expect(propMeta.type).toBe(String.meta);
        });
      }); // end type

      describe("elemType - ", function() {
        it("for singular values, should provide same output as `type`", function() {
          ["string", "number", "boolean", "date", "complex"].forEach(function(type) {
            var propMeta = createRootPropMeta({name: "foo1", type: type});
            expect(propMeta.elemType).toBe(propMeta.type);
          });
        });

        it("for list values, should return the type of its elements (base/of syntax)", function() {
          ["string", "number", "boolean", "date", "complex"].forEach(function(type) {
            var propMeta = createRootPropMeta({name: "foo1", type: {base: "list", of: type}});
            expect(propMeta.elemType).toBe(propMeta.type.of);
          });
        });

      }); // end elemType

      describe("value - ", function(){

        var propMeta;
        beforeEach(function(){
          propMeta = createRootPropMeta({name: "foo", type: "string",  value: "Foo"});
        });

        it("should honor the default value", function(){
          expect(propMeta.value.value).toBe("Foo");
          expect(propMeta.value.formatted).toBe(null);
        });

      }); //end value
      //endregion

      //region Dynamic Attributes
      describe("required - ", function() {
        it("should be immutable", function() {
          var propMeta = Property.meta;
          var isRequired = propMeta.required;
          propMeta.required = true;
          expect(propMeta.required).toBe(isRequired);
        });

        it("should default to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo"});
          expect(propMeta.required).toBe(undefined);
        });

        it("should convert undefined spec value to default", function() {
          var propMeta = createRootPropMeta({name: "foo", required: true});
          expect(propMeta.required).toBe(true);
          propMeta.required = undefined;
          expect(propMeta.required).toBe(undefined);
        });

        it("should convert null spec value to default", function() {
          var propMeta = createRootPropMeta({name: "foo", required: true});
          expect(propMeta.required).toBe(true);
          propMeta.required = null;
          expect(propMeta.required).toBe(undefined);
        });

        it("should cast other non-function spec values to boolean", function() {
          var propMeta = createRootPropMeta({name: "foo1", required: 1});
          expect(propMeta.required).toBe(true);

          propMeta = createRootPropMeta({name: "foo2", required: 0});
          expect(propMeta.required).toBe(false);

          propMeta = createRootPropMeta({name: "foo3", required: ""});
          expect(propMeta.required).toBe(false);

          propMeta = createRootPropMeta({name: "foo4", required: true});
          expect(propMeta.required).toBe(true);

          propMeta = createRootPropMeta({name: "foo5", required: "yes"});
          expect(propMeta.required).toBe(true);

          propMeta = createRootPropMeta({name: "foo6", required: "no"});
          expect(propMeta.required).toBe(true);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propMeta = createRootPropMeta({name: "foo1", required: f});
          expect(propMeta.required).toBe(f);
        });

        it("should evaluate a function spec value", function() {
          var f = jasmine.createSpy().and.callFake(function() { return true; });
          var propMeta = createRootPropMeta({name: "foo1", required: f});

          var owner = {};
          expect(propMeta.requiredEval(owner)).toBe(true);
          expect(f.calls.count()).toBe(1);
        });

        it("should evaluate a function spec value and cast its result", function() {
          var owner = {};
          var f = function() { return 1; };
          var propMeta = createRootPropMeta({name: "foo1", required: f});
          expect(propMeta.requiredEval(owner)).toBe(true);

          // ----

          f = function() { return 0; };
          propMeta = createRootPropMeta({name: "foo2", required: f});
          expect(propMeta.requiredEval(owner)).toBe(false);

          // ---

          f = function() { return {}; };
          propMeta = createRootPropMeta({name: "foo2", required: f});
          expect(propMeta.requiredEval(owner)).toBe(true);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propMeta = createRootPropMeta({name: "foo1", required: f});
          expect(propMeta.requiredEval(owner)).toBe(false);

          // ----

          f = function() { return undefined; };
          propMeta = createRootPropMeta({name: "foo2", required: f});
          expect(propMeta.requiredEval(owner)).toBe(false);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propMeta = createRootPropMeta({name: "foo1", required: f});
          propMeta.requiredEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propMeta = createRootPropMeta({name: "foo1", required: f});
          propMeta.requiredEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end required

      describe("countMin - ", function() {
        it("should be immutable", function() {
          var propMeta = Property.meta;
          var countMin = propMeta.countMin;
          propMeta.countMin = 42;
          expect(propMeta.countMin).toBe(countMin);
        });

        it("should default to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo"});
          expect(propMeta.countMin).toBe(undefined);
        });

        it("should convert undefined spec value to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo", countMin: 1});
          expect(propMeta.countMin).toBe(1);
          propMeta.countMin = undefined;
          expect(propMeta.countMin).toBe(undefined);
        });

        it("should convert null spec value to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo", countMin: 1});
          expect(propMeta.countMin).toBe(1);
          propMeta.countMin = null;
          expect(propMeta.countMin).toBe(undefined);
        });

        it("should convert negative spec values to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMin: -1});
          expect(propMeta.countMin).toBe(undefined);
        });

        it("should convert NaN spec values to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMin: NaN});
          expect(propMeta.countMin).toBe(undefined);
        });

        it("should convert positive float spec values to its floored integer", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMin: 1.1});
          expect(propMeta.countMin).toBe(1);
        });

        it("should parse string spec values", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMin: "1"});
          expect(propMeta.countMin).toBe(1);

          propMeta = createRootPropMeta({name: "foo2", countMin: "+1"});
          expect(propMeta.countMin).toBe(1);
        });

        it("should convert an invalid spec value to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMin: "foo"});
          expect(propMeta.countMin).toBe(undefined);

          propMeta = createRootPropMeta({name: "foo2", countMin: "-1"});
          expect(propMeta.countMin).toBe(undefined);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propMeta = createRootPropMeta({name: "foo1", countMin: f});
          expect(propMeta.countMin).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propMeta = createRootPropMeta({name: "foo1", countMin: f});
          expect(propMeta.countMinEval(owner)).toBe(0);

          // ----

          f = function() { return undefined; };
          propMeta = createRootPropMeta({name: "foo2", countMin: f});
          expect(propMeta.countMinEval(owner)).toBe(0);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propMeta = createRootPropMeta({name: "foo1", countMin: f});
          propMeta.countMinEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propMeta = createRootPropMeta({name: "foo1", countMin: f});
          propMeta.countMinEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end countMin

      describe("countMax - ", function() {
        it("should be immutable", function() {
          var propMeta = Property.meta;
          var countMax = propMeta.countMax;
          propMeta.countMax = 42;
          expect(propMeta.countMax).toBe(countMax);
        });

        it("should default to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo"});
          expect(propMeta.countMax).toBe(undefined);
        });

        it("should convert undefined spec value to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo", countMax: 1});
          expect(propMeta.countMax).toBe(1);
          propMeta.countMax = undefined;
          expect(propMeta.countMax).toBe(undefined);
        });

        it("should convert null spec value to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo", countMax: 1});
          expect(propMeta.countMax).toBe(1);
          propMeta.countMax = null;
          expect(propMeta.countMax).toBe(undefined);
        });

        it("should convert negative spec value to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMax: -1});
          expect(propMeta.countMax).toBe(undefined);
        });

        it("should convert NaN spec values to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMax: NaN});
          expect(propMeta.countMax).toBe(undefined);
        });

        it("should convert positive float spec values to its floored integer", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMax: 1.1});
          expect(propMeta.countMax).toBe(1);
        });

        it("should parse string spec values", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMax: "1"});
          expect(propMeta.countMax).toBe(1);

          propMeta = createRootPropMeta({name: "foo2", countMax: "+1"});
          expect(propMeta.countMax).toBe(1);
        });

        it("should parse an 'Infinity' string spec value", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMax: "Infinity"});
          expect(propMeta.countMax).toBe(Infinity);
        });

        it("should convert invalid string spec values to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo1", countMax: "foo"});
          expect(propMeta.countMax).toBe(undefined);

          propMeta = createRootPropMeta({name: "foo2", countMax: "-1"});
          expect(propMeta.countMax).toBe(undefined);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propMeta = createRootPropMeta({name: "foo1", countMax: f});
          expect(propMeta.countMax).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propMeta = createRootPropMeta({name: "foo1", countMax: f});
          expect(propMeta.countMaxEval(owner)).toBe(Infinity);

          // ----

          f = function() { return undefined; };
          propMeta = createRootPropMeta({name: "foo2", countMax: f});
          expect(propMeta.countMaxEval(owner)).toBe(Infinity);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propMeta = createRootPropMeta({name: "foo1", countMax: f});
          propMeta.countMaxEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propMeta = createRootPropMeta({name: "foo1", countMax: f});
          propMeta.countMaxEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end countMax

      describe("applicable - ", function() {
        it("should be immutable", function() {
          var propMeta = Property.meta;
          var isApplicable = propMeta.applicable;
          propMeta.applicable = false;
          expect(propMeta.applicable).toBe(isApplicable);
        });

        it("should default to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo"});
          expect(propMeta.applicable).toBe(undefined);
        });

        it("should convert undefined spec value to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo", applicable: false});
          expect(propMeta.applicable).toBe(false);
          propMeta.applicable = undefined;
          expect(propMeta.applicable).toBe(undefined);
        });

        it("should convert null spec value to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo", applicable: false});
          expect(propMeta.applicable).toBe(false);
          propMeta.applicable = null;
          expect(propMeta.applicable).toBe(undefined);
        });

        it("should cast other non-function spec values to boolean", function() {
          var propMeta = createRootPropMeta({name: "foo1", applicable: 1});
          expect(propMeta.applicable).toBe(true);

          propMeta = createRootPropMeta({name: "foo2", applicable: 0});
          expect(propMeta.applicable).toBe(false);

          propMeta = createRootPropMeta({name: "foo3", applicable: ""});
          expect(propMeta.applicable).toBe(false);

          propMeta = createRootPropMeta({name: "foo4", applicable: true});
          expect(propMeta.applicable).toBe(true);

          propMeta = createRootPropMeta({name: "foo5", applicable: "yes"});
          expect(propMeta.applicable).toBe(true);

          propMeta = createRootPropMeta({name: "foo6", applicable: "no"});
          expect(propMeta.applicable).toBe(true);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propMeta = createRootPropMeta({name: "foo1", applicable: f});
          expect(propMeta.applicable).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propMeta = createRootPropMeta({name: "foo1", applicable: f});
          expect(propMeta.applicableEval(owner)).toBe(true);

          // ----

          f = function() { return undefined; };
          propMeta = createRootPropMeta({name: "foo2", applicable: f});
          expect(propMeta.applicableEval(owner)).toBe(true);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propMeta = createRootPropMeta({name: "foo1", applicable: f});
          propMeta.applicableEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propMeta = createRootPropMeta({name: "foo1", applicable: f});
          propMeta.applicableEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end applicable

      describe("readOnly - ", function() {
        it("should be immutable", function() {
          var propMeta = Property.meta;
          var isReadOnly = propMeta.readOnly;
          propMeta.readOnly = true;
          expect(propMeta.readOnly).toBe(isReadOnly);
        });

        it("should default to an unset local value", function() {
          var propMeta = createRootPropMeta({name: "foo"});
          expect(propMeta.readOnly).toBe(undefined);
        });

        it("should convert undefined spec value to default", function() {
          var propMeta = createRootPropMeta({name: "foo", readOnly: true});
          expect(propMeta.readOnly).toBe(true);
          propMeta.readOnly = undefined;
          expect(propMeta.readOnly).toBe(undefined);
        });

        it("should convert null spec to default", function() {
          var propMeta = createRootPropMeta({name: "foo", readOnly: true});
          expect(propMeta.readOnly).toBe(true);
          propMeta.readOnly = null;
          expect(propMeta.readOnly).toBe(undefined);
        });

        it("should cast other non-function spec values to boolean", function() {
          var propMeta = createRootPropMeta({name: "foo1", readOnly: 1});
          expect(propMeta.readOnly).toBe(true);

          propMeta = createRootPropMeta({name: "foo2", readOnly: 0});
          expect(propMeta.readOnly).toBe(false);

          propMeta = createRootPropMeta({name: "foo3", readOnly: ""});
          expect(propMeta.readOnly).toBe(false);

          propMeta = createRootPropMeta({name: "foo4", readOnly: true});
          expect(propMeta.readOnly).toBe(true);

          propMeta = createRootPropMeta({name: "foo5", readOnly: "yes"});
          expect(propMeta.readOnly).toBe(true);

          propMeta = createRootPropMeta({name: "foo6", readOnly: "no"});
          expect(propMeta.readOnly).toBe(true);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propMeta = createRootPropMeta({name: "foo1", readOnly: f});
          expect(propMeta.readOnly).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propMeta = createRootPropMeta({name: "foo1", readOnly: f});
          expect(propMeta.readOnlyEval(owner)).toBe(false);

          // ----

          f = function() { return undefined; };
          propMeta = createRootPropMeta({name: "foo2", readOnly: f});
          expect(propMeta.readOnlyEval(owner)).toBe(false);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propMeta = createRootPropMeta({name: "foo1", readOnly: f});
          propMeta.readOnlyEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propMeta = createRootPropMeta({name: "foo1", readOnly: f});
          propMeta.readOnlyEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end readOnly

      describe("countRange -", function() {
        // 1. when !list => min and max <= 1
        // 2. required => countMin >= 1
        // 3. min <= max

        it("should limit min and max to 1 when list = false", function() {
          var propMeta = createRootPropMeta({name: "foo", countMin: 10, countMax: 10});
          expect(propMeta.countMin).toBe(10);
          expect(propMeta.countMax).toBe(10);
          expect(propMeta.countRangeEval({})).toEqual({min: 1, max: 1});
        });

        it("should not limit min and max to 1 when list = true", function() {
          var propMeta = createRootPropMeta({name: "foo", countMin: 10, countMax: 10, type: ["string"]});
          expect(propMeta.countMin).toBe(10);
          expect(propMeta.countMax).toBe(10);
          expect(propMeta.countRangeEval({})).toEqual({min: 10, max: 10});
        });

        it("should have min = 1 when required", function() {
          var propMeta = createRootPropMeta({name: "foo", required: true});
          expect(propMeta.countMin).toBe(undefined);
          expect(propMeta.countMax).toBe(undefined);
          expect(propMeta.countRangeEval({}).min).toBe(1);
        });

        it("should have min = 1 when required and countMin = 0", function() {
          var propMeta = createRootPropMeta({name: "foo", required: true, countMin: 0});
          expect(propMeta.countMin).toBe(0);
          expect(propMeta.countMax).toBe(undefined);
          expect(propMeta.countRangeEval({}).min).toBe(1);
        });

        it("should have min equal to countMin when countMin >= 1 and any required value", function() {
          var propMeta = createRootPropMeta({name: "foo1", required: true, countMin: 1});
          expect(propMeta.countMin).toBe(1);
          expect(propMeta.countMax).toBe(undefined);
          expect(propMeta.countRangeEval({}).min).toBe(1);

          propMeta = createRootPropMeta({name: "foo2", required: false, countMin: 1});
          expect(propMeta.countMin).toBe(1);
          expect(propMeta.countMax).toBe(undefined);
          expect(propMeta.countRangeEval({}).min).toBe(1);

          propMeta = createRootPropMeta({name: "foo3", required: true, countMin: 3, type: ["string"]});
          expect(propMeta.countMin).toBe(3);
          expect(propMeta.countMax).toBe(undefined);
          expect(propMeta.countRangeEval({}).min).toBe(3);

          propMeta = createRootPropMeta({name: "foo4", required: false, countMin: 3, type: ["string"]});
          expect(propMeta.countMin).toBe(3);
          expect(propMeta.countMax).toBe(undefined);
          expect(propMeta.countRangeEval({}).min).toBe(3);
        });

        // required <= max
        it("should have max = 1 when countMax = 0 and required = true", function() {
          var propMeta = createRootPropMeta({name: "foo", required: true, countMax: 0});
          expect(propMeta.countMin).toBe(undefined);
          expect(propMeta.countMax).toBe(0);
          expect(propMeta.countRangeEval({}).max).toBe(1);
        });

        it("should have max = 1 when countMax is 0 and countMin = 1", function() {
          var propMeta = createRootPropMeta({name: "foo", countMin: 1, countMax: 0});
          expect(propMeta.countMin).toBe(1);
          expect(propMeta.countMax).toBe(0);
          expect(propMeta.countRangeEval({}).max).toBe(1);
        });

        it("should have max = 10 when countMin = 10, countMax = 5 and list = true", function() {
          var propMeta = createRootPropMeta({name: "foo", countMin: 10, countMax: 5, type: ["string"]});
          expect(propMeta.countMin).toBe(10);
          expect(propMeta.countMax).toBe(5);
          expect(propMeta.countRangeEval({}).max).toBe(10);
        });

        it("should have max = Infinity when countMin = 10 and list = true", function() {
          var propMeta = createRootPropMeta({name: "foo", countMin: 10, type: ["string"]});
          expect(propMeta.countMin).toBe(10);
          expect(propMeta.countMax).toBe(undefined);
          expect(propMeta.countRangeEval({}).max).toBe(Infinity);
        });

        it("should have min = 0 when countMax = 10 and list = true", function() {
          var propMeta = createRootPropMeta({name: "foo", countMax: 10, type: []});
          expect(propMeta.countMin).toBe(undefined);
          expect(propMeta.countMax).toBe(10);
          expect(propMeta.countRangeEval({}).min).toBe(0);
        });

        it("should have min = 0 when countMax = 1", function() {
          var propMeta = createRootPropMeta({name: "foo", countMax: 1});
          expect(propMeta.countMin).toBe(undefined);
          expect(propMeta.countMax).toBe(1);
          expect(propMeta.countRangeEval({}).min).toBe(0);
        });
      });
      //endregion
    }); // end define a root property

    describe("override a property -", function() {

      function extendProp(declaringMeta, propName, subPropMetaSpec) {
        var basePropMeta = declaringMeta.ancestor.get(propName);

        return Property.extendProto(
            basePropMeta.mesa, {
              meta: subPropMetaSpec
            },
            {
              declaringMeta: declaringMeta,
              mesa: declaringMeta.mesa
            }).meta;
      }

      it("should throw if spec.name is not the name of the base property", function() {
        var Base = Complex.extend();

        Base.meta.add({name: "baseStr"});

        var Derived = Base.extend();

        expect(function() {
          extendProp(Derived.meta, "baseStr", {name: "baseStr2"});
        }).toThrowError(error.argInvalid("name", "Sub-properties cannot change the 'name' attribute.").message);
      });

      describe("basic characteristics -", function() {
        var propMeta, basePropMeta, Derived;

        beforeEach(function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          Derived = Base.extend();

          basePropMeta = Base.meta.get("baseStr");

          propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});
        });

        it("should be an instance of `PropertyMeta`", function() {
          expect(propMeta instanceof PropertyMeta).toBe(true);
        });

        it("should have the overridden property as `ancestor`", function() {
          expect(propMeta).not.toBe(basePropMeta);
          expect(propMeta.ancestor).toBe(basePropMeta);
        });

        it("should have `declaringType` equal to the derived class' instance", function() {
          expect(propMeta.declaringType).toBe(Derived.meta);
        });

        it("should have `root` equal to the base property", function() {
          expect(propMeta.root).toBe(basePropMeta);
        });
      });

      //region Item.Meta attributes
      describe("label -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", label: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo"});

          expect(propMeta.label).toBe("FooABC");
        });

        it("should respect the spec value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", label: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", label: "XYZ"});

          expect(propMeta.label).toBe("XYZ");
        });

        it("should respect a set value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", label: "ABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", label: "XYZ"});

          expect(propMeta.label).toBe("XYZ");

          propMeta.label = "WWW";

          expect(propMeta.label).toBe("WWW");
        });

        it("should inherit the base value when set to nully or empty", function() {
          var Base = Complex.extend();

          var baseLabel = "ABC";
          Base.meta.add({name: "foo", label: baseLabel});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", label: "XYZ"});

          expect(propMeta.label).toBe("XYZ");
          propMeta.label = null;
          expect(propMeta.label).toBe(baseLabel);

          // -----

          propMeta.label = "XYZ";
          expect(propMeta.label).toBe("XYZ");
          propMeta.label = undefined;
          expect(propMeta.label).toBe(baseLabel);

          // -----

          propMeta.label = "XYZ";
          expect(propMeta.label).toBe("XYZ");
          propMeta.label = "";
          expect(propMeta.label).toBe(baseLabel);
        });
      }); // end label

      describe("description -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo"});

          expect(propMeta.description).toBe("FooABC");
        });

        it("should inherit the base value if spec is undefined", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", description: undefined});

          expect(propMeta.description).toBe("FooABC");
        });

        it("should respect the spec null value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", description: null});

          expect(propMeta.description).toBe(null);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", description: "XYZ"});

          expect(propMeta.description).toBe("XYZ");
        });

        it("should respect a set null value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", description: "ABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", description: "XYZ"});

          propMeta.description = null;

          expect(propMeta.description).toBe(null);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", description: "ABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", description: "XYZ"});

          expect(propMeta.description).toBe("XYZ");

          propMeta.description = "WWW";

          expect(propMeta.description).toBe("WWW");
        });

        it("should inherit the base value when set to undefined", function() {
          var Base = Complex.extend();

          var baseDesc = "ABC";
          Base.meta.add({name: "foo", description: baseDesc});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", description: "XYZ"});

          expect(propMeta.description).toBe("XYZ");

          propMeta.description = undefined;

          expect(propMeta.description).toBe(baseDesc);
        });
      }); // end description

      describe("category -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo"});

          expect(propMeta.category).toBe("FooABC");
        });

        it("should inherit the base value if spec is undefined", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", category: undefined});

          expect(propMeta.category).toBe("FooABC");
        });

        it("should respect the spec null value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", category: null});

          expect(propMeta.category).toBe(null);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", category: "XYZ"});

          expect(propMeta.category).toBe("XYZ");
        });

        it("should respect a set null value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", category: "ABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", category: "XYZ"});

          propMeta.category = null;

          expect(propMeta.category).toBe(null);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", category: "ABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", category: "XYZ"});

          expect(propMeta.category).toBe("XYZ");

          propMeta.category = "WWW";

          expect(propMeta.category).toBe("WWW");
        });

        it("should inherit the base value when set to undefined", function() {
          var Base = Complex.extend();

          var baseValue = "ABC";
          Base.meta.add({name: "foo", category: baseValue});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", category: "XYZ"});

          expect(propMeta.category).toBe("XYZ");

          propMeta.category = undefined;

          expect(propMeta.category).toBe(baseValue);
        });
      }); // end category

      describe("helpUrl -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo"});

          expect(propMeta.helpUrl).toBe("FooABC");
        });

        it("should inherit the base value if spec is undefined", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", helpUrl: undefined});

          expect(propMeta.helpUrl).toBe("FooABC");
        });

        it("should respect the spec null value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", helpUrl: null});

          expect(propMeta.helpUrl).toBe(null);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", helpUrl: "XYZ"});

          expect(propMeta.helpUrl).toBe("XYZ");
        });

        it("should respect a set null value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", helpUrl: "ABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", helpUrl: "XYZ"});

          propMeta.helpUrl = null;

          expect(propMeta.helpUrl).toBe(null);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", helpUrl: "ABC"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", helpUrl: "XYZ"});

          expect(propMeta.helpUrl).toBe("XYZ");

          propMeta.helpUrl = "WWW";

          expect(propMeta.helpUrl).toBe("WWW");
        });

        it("should inherit the base value when set to undefined", function() {
          var Base = Complex.extend();

          var baseValue = "ABC";
          Base.meta.add({name: "foo", helpUrl: baseValue});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", helpUrl: "XYZ"});

          expect(propMeta.helpUrl).toBe("XYZ");

          propMeta.helpUrl = undefined;

          expect(propMeta.helpUrl).toBe(baseValue);
        });
      }); // end helpUrl

      describe("browsable -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", browsable: false});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo"});

          expect(propMeta.browsable).toBe(false);

          // ----

          Base = Complex.extend();

          Base.meta.add({name: "foo", browsable: true});

          Derived = Base.extend();

          propMeta = extendProp(Derived.meta, "foo", {name: "foo"});

          expect(propMeta.browsable).toBe(true);
        });

        it("should inherit the base value if spec is nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", browsable: false});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", browsable: undefined});

          expect(propMeta.browsable).toBe(false);

          // ---

          Base = Complex.extend();

          Base.meta.add({name: "foo", browsable: false});

          Derived = Base.extend();

          propMeta = extendProp(Derived.meta, "foo", {name: "foo", browsable: null});

          expect(propMeta.browsable).toBe(false);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", browsable: true});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", browsable: false});

          expect(propMeta.browsable).toBe(false);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", browsable: true});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo"});

          expect(propMeta.browsable).toBe(true);

          propMeta.browsable = false;

          expect(propMeta.browsable).toBe(false);
        });

        it("should inherit the base value when set to nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", browsable: true});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", browsable: false});

          expect(propMeta.browsable).toBe(false);

          propMeta.browsable = undefined;

          expect(propMeta.browsable).toBe(true);

          // ---

          Base = Complex.extend();

          Base.meta.add({name: "foo", browsable: true});

          Derived = Base.extend();

          propMeta = extendProp(Derived.meta, "foo", {name: "foo", browsable: false});

          expect(propMeta.browsable).toBe(false);

          propMeta.browsable = null;

          expect(propMeta.browsable).toBe(true);
        });
      }); // end browsable

      describe("advanced -", function() {
        it("should inherit the base value, by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", advanced: false});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo"});

          expect(propMeta.advanced).toBe(false);

          // ----

          Base = Complex.extend();

          Base.meta.add({name: "foo", advanced: true});

          Derived = Base.extend();

          propMeta = extendProp(Derived.meta, "foo", {name: "foo"});

          expect(propMeta.advanced).toBe(true);
        });

        it("should inherit the base value if spec is nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", advanced: true});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", advanced: undefined});

          expect(propMeta.advanced).toBe(true);

          // ---

          Base = Complex.extend();

          Base.meta.add({name: "foo", advanced: true});

          Derived = Base.extend();

          propMeta = extendProp(Derived.meta, "foo", {name: "foo", advanced: null});

          expect(propMeta.advanced).toBe(true);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", advanced: false});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", advanced: true});

          expect(propMeta.advanced).toBe(true);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", advanced: false});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo"});

          expect(propMeta.advanced).toBe(false);

          propMeta.advanced = true;

          expect(propMeta.advanced).toBe(true);
        });

        it("should inherit the base value when set to nully", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "foo", advanced: false});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "foo", {name: "foo", advanced: true});

          expect(propMeta.advanced).toBe(true);

          propMeta.advanced = undefined;

          expect(propMeta.advanced).toBe(false);

          // ---

          Base = Complex.extend();

          Base.meta.add({name: "foo", advanced: false});

          Derived = Base.extend();

          propMeta = extendProp(Derived.meta, "foo", {name: "foo", advanced: true});

          expect(propMeta.advanced).toBe(true);

          propMeta.advanced = null;

          expect(propMeta.advanced).toBe(false);
        });
      }); // end advanced
      //endregion

      //region Defining attributes
      describe("name - ", function() {
        var propMeta;

        beforeEach(function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});
        });

        it("should have the same name", function() {
          expect(propMeta.name).toBe("baseStr");
        });

        it("should throw when changed", function() {
          expect(function() {
            propMeta.name = "baseStrXYZ";
          }).toThrowError(error.argInvalid("name", "Sub-properties cannot change the 'name' attribute.").message);
        });

        it("should not throw when set but not changed", function() {
          propMeta.name = "baseStr";
        });
      }); // end name

      // mutable, but must always inherit from the base type.
      // should not change after the complex class has been sub-classed or has any instances of it (not enforced).
      // NOTE: see also refinement.Spec.js, property usage unit tests
      describe("type - ", function() {
        it("should inherit base type value by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseNum", type: Number});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseNum", {name: "baseNum"});

          expect(propMeta.type).toBe(Number.meta);
        });

        it("should accept a spec type that is a sub-type of the base property's type", function() {
          var PostalCode = String.extend();

          var Base = Complex.extend();

          Base.meta.add({name: "postalCode", type: String});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "postalCode", {name: "postalCode", type: PostalCode});

          expect(propMeta.type).toBe(PostalCode.meta);
        });

        it("should accept a _set_ type that is a sub-type of the base property's type", function() {
          var PostalCode1 = String.extend();
          var PostalCode2 = String.extend();

          // ----

          var Base = Complex.extend();

          Base.meta.add({name: "postalCode", type: String});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "postalCode", {name: "postalCode"});

          propMeta.type = PostalCode1;
          expect(propMeta.type).toBe(PostalCode1.meta);

          propMeta.type = PostalCode2;
          expect(propMeta.type).toBe(PostalCode2.meta);
        });

        it("should throw on a spec type that is not a sub-type of the base property's type", function() {

          var Base = Complex.extend();

          Base.meta.add({name: "num", type: String});

          var Derived = Base.extend();

          expect(function() {
            extendProp(Derived.meta, "num", {name: "num", type: Number});
          }).toThrowError(error.argInvalid("type", bundle.structured.errors.property.typeNotSubtypeOfBaseType).message);
        });

        it("should throw on a set type that is not a sub-type of the base property's type", function() {

          var Base = Complex.extend();

          Base.meta.add({name: "num", type: String});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "num", {name: "num"});

          expect(function() {
            propMeta.type = Number;
          }).toThrowError(error.argInvalid("type", bundle.structured.errors.property.typeNotSubtypeOfBaseType).message);
        });
      });
      //endregion

      //region Dynamic attributes
      describe("required -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});

          expect(propMeta.required).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr", required: true});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propMeta.requiredEval(owner)).toBe(true);
        });

        it("should respect the specified value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", required: false});

          expect(propMeta.required).toBe(false);
        });

        it("should evaluate a base function and, if false, only then the sub function", function() {
          var index = 1;

          var Base = Complex.extend();

          var baseIndex = -1;
          var baseSpy = jasmine.createSpy().and.callFake(function() { baseIndex = index++; return false; });

          Base.meta.add({name: "baseStr", required: baseSpy});

          var Derived = Base.extend();

          var subIndex = -1;
          var subSpy = jasmine.createSpy().and.callFake(function() { subIndex = index++; return false; });

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", required: subSpy});

          var owner = {};

          propMeta.requiredEval(owner);
          expect(baseIndex).toBe(1);
          expect(subIndex ).toBe(2);
        });

        it("should not evaluate the sub function if the base function evaluates to true", function() {
          var Base = Complex.extend();

          var baseSpy = jasmine.createSpy().and.returnValue(true);

          Base.meta.add({name: "baseStr", required: baseSpy});

          var Derived = Base.extend();

          var subSpy = jasmine.createSpy().and.returnValue(true);

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", required: subSpy});

          var owner = {};

          expect(propMeta.requiredEval(owner)).toBe(true);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(0);

          // ---

          Base = Complex.extend();

          Base.meta.add({name: "baseStr", required: true});

          Derived = Base.extend();

          subSpy = jasmine.createSpy().and.returnValue(true);

          propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", required: subSpy});

          owner = {};

          expect(propMeta.requiredEval(owner)).toBe(true);
          expect(subSpy.calls.count()).toBe(0);
        });
      }); // end required

      describe("countMin -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});

          expect(propMeta.countMin).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr", countMin: 1});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propMeta.countMinEval(owner)).toBe(1);
        });

        it("should respect the specified value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", countMin: 2});

          var owner = {};

          expect(propMeta.countMinEval(owner)).toBe(2);
        });

        it("should evaluate the base function and then, always, the sub function", function() {
          var index = 1;

          var Base = Complex.extend();

          var baseIndex = -1;
          var baseSpy = jasmine.createSpy().and.callFake(function() { baseIndex = index++; return 1; });

          Base.meta.add({name: "baseStr", countMin: baseSpy});

          var Derived = Base.extend();

          var subIndex = -1;
          var subSpy = jasmine.createSpy().and.callFake(function() { subIndex = index++; return 1; });

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", countMin: subSpy});

          var owner = {};

          propMeta.countMinEval(owner);
          expect(baseIndex).toBe(1);
          expect(subIndex ).toBe(2);
        });

        it("should evaluate to the maximum result of the base and sub functions", function() {
          var Base = Complex.extend();

          var baseSpy = jasmine.createSpy().and.returnValue(1);

          Base.meta.add({name: "baseStr", countMin: baseSpy});

          var Derived = Base.extend();

          var subSpy = jasmine.createSpy().and.returnValue(3);

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", countMin: subSpy});

          var owner = {};

          expect(propMeta.countMinEval(owner)).toBe(3);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(1);

          // ---

          Base = Complex.extend();

          Base.meta.add({name: "baseStr", countMin: 2});

          Derived = Base.extend();

          subSpy = function() { return 1; };

          propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", countMin: subSpy});

          owner = {};

          expect(propMeta.countMinEval(owner)).toBe(2);
        });
      }); // end countMin

      describe("countMax -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});

          expect(propMeta.countMax).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr", countMax: 5});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propMeta.countMaxEval(owner)).toBe(5);
        });

        it("should respect the specified value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", countMax: 2});

          var owner = {};

          expect(propMeta.countMaxEval(owner)).toBe(2);
        });

        it("should evaluate the base function and then, always, the sub function", function() {
          var index = 1;

          var Base = Complex.extend();

          var baseIndex = -1;
          var baseSpy = jasmine.createSpy().and.callFake(function() { baseIndex = index++; return 1; });

          Base.meta.add({name: "baseStr", countMax: baseSpy});

          var Derived = Base.extend();

          var subIndex = -1;
          var subSpy = jasmine.createSpy().and.callFake(function() { subIndex = index++; return 1; });

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", countMax: subSpy});

          var owner = {};

          propMeta.countMaxEval(owner);
          expect(baseIndex).toBe(1);
          expect(subIndex ).toBe(2);
        });

        it("should evaluate to the minimum result of the base and sub functions", function() {
          var Base = Complex.extend();

          var baseSpy = jasmine.createSpy().and.returnValue(1);

          Base.meta.add({name: "baseStr", countMax: baseSpy});

          var Derived = Base.extend();

          var subSpy = jasmine.createSpy().and.returnValue(3);

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", countMax: subSpy});

          var owner = {};

          expect(propMeta.countMaxEval(owner)).toBe(1);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(1);

          // ---

          Base = Complex.extend();

          Base.meta.add({name: "baseStr", countMax: 2});

          Derived = Base.extend();

          subSpy = function() { return 1; };

          propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", countMax: subSpy});

          owner = {};

          expect(propMeta.countMaxEval(owner)).toBe(1);
        });
      }); // end countMax

      describe("applicable -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});

          expect(propMeta.applicable).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr", applicable: false});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propMeta.applicableEval(owner)).toBe(false);
        });

        it("should respect the specified value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", applicable: false});

          expect(propMeta.applicable).toBe(false);
        });

        it("should evaluate a base function and, if true, only then the sub function", function() {
          var index = 1;

          var Base = Complex.extend();

          var baseIndex = -1;
          var baseSpy = jasmine.createSpy().and.callFake(function() { baseIndex = index++; return true; });

          Base.meta.add({name: "baseStr", applicable: baseSpy});

          var Derived = Base.extend();

          var subIndex = -1;
          var subSpy = jasmine.createSpy().and.callFake(function() { subIndex = index++; return true; });

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", applicable: subSpy});

          var owner = {};

          propMeta.applicableEval(owner);
          expect(baseIndex).toBe(1);
          expect(subIndex ).toBe(2);
        });

        it("should not evaluate the sub function if the base function evaluates to false", function() {
          var Base = Complex.extend();

          var baseSpy = jasmine.createSpy().and.returnValue(false);

          Base.meta.add({name: "baseStr", applicable: baseSpy});

          var Derived = Base.extend();

          var subSpy = jasmine.createSpy().and.returnValue(true);

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", applicable: subSpy});

          var owner = {};

          expect(propMeta.applicableEval(owner)).toBe(false);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(0);

          // ---

          Base = Complex.extend();

          Base.meta.add({name: "baseStr", applicable: false});

          Derived = Base.extend();

          subSpy = jasmine.createSpy().and.returnValue(true);

          propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", applicable: subSpy});

          owner = {};

          expect(propMeta.applicableEval(owner)).toBe(false);
          expect(subSpy.calls.count()).toBe(0);
        });
      }); // end applicable

      describe("readOnly -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});

          expect(propMeta.readOnly).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr", readOnly: true});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propMeta.readOnlyEval(owner)).toBe(true);
        });

        it("should respect the specified value", function() {
          var Base = Complex.extend();

          Base.meta.add({name: "baseStr"});

          var Derived = Base.extend();

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", readOnly: false});

          expect(propMeta.readOnly).toBe(false);
        });

        it("should evaluate a base function and, if false, only then the sub function", function() {
          var index = 1;

          var Base = Complex.extend();

          var baseIndex = -1;
          var baseSpy = jasmine.createSpy().and.callFake(function() { baseIndex = index++; return false; });

          Base.meta.add({name: "baseStr", readOnly: baseSpy});

          var Derived = Base.extend();

          var subIndex = -1;
          var subSpy = jasmine.createSpy().and.callFake(function() { subIndex = index++; return false; });

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", readOnly: subSpy});

          var owner = {};

          propMeta.readOnlyEval(owner);
          expect(baseIndex).toBe(1);
          expect(subIndex ).toBe(2);
        });

        it("should not evaluate the sub function if the base function evaluates to true", function() {
          var Base = Complex.extend();

          var baseSpy = jasmine.createSpy().and.returnValue(true);

          Base.meta.add({name: "baseStr", readOnly: baseSpy});

          var Derived = Base.extend();

          var subSpy = jasmine.createSpy().and.returnValue(true);

          var propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", readOnly: subSpy});

          var owner = {};

          expect(propMeta.readOnlyEval(owner)).toBe(true);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(0);

          // ---

          Base = Complex.extend();

          Base.meta.add({name: "baseStr", readOnly: true});

          Derived = Base.extend();

          subSpy = jasmine.createSpy().and.returnValue(true);

          propMeta = extendProp(Derived.meta, "baseStr", {name: "baseStr", readOnly: subSpy});

          owner = {};

          expect(propMeta.readOnlyEval(owner)).toBe(true);
          expect(subSpy.calls.count()).toBe(0);
        });
      }); // end readOnly

      describe("value -", function(){
        var propMeta;
        beforeEach(function(){
          var Base = Complex.extend();
          Base.meta.add({name: "baseNum", type: Number});
          var Derived = Base.extend();

          propMeta = extendProp(Derived.meta, "baseNum", {name: "baseNum"});
        });

        it("should be null by default", function() {
          expect(propMeta.value).toBeNull();
        });

        it("should inherit base type value by default", function() {
          propMeta.value = 42;
          expect(propMeta.value.value).toBe(42);
        });
        it("should inherit base type value by default", function() {
          propMeta.value = {value: 42, formatted: "Forty-two"};
          expect(propMeta.value.value).toBe(42);
        });

        it("should be resettable to the default value", function() {
          propMeta.value = 42;
          propMeta.value = undefined;
          expect(propMeta.value).toBeNull();
        });

      }); // end value
      //endregion
    }); // end override a property

    // TODO: toValue

  }); // pentaho.type.Property.Meta
});