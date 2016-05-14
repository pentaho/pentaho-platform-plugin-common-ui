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
  "./propertyTypeUtil",
  "tests/pentaho/util/errorMatch"
], function(Context, propertyTypeUtil, errorMatch) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, jasmine:false*/

  var context = new Context(),
      Property = context.get("property"),
      PropertyType = Property.Type,
      PentahoBoolean = context.get("pentaho/type/boolean"),
      Complex = context.get("pentaho/type/complex"),
      PentahoString = context.get("pentaho/type/string"),
      PentahoNumber  = context.get("pentaho/type/number");

  describe("pentaho.type.Property.Type -", function() {

    it("is a function", function() {
      expect(typeof PropertyType).toBe("function");
    });

    describe("#isProperty", function() {
      it("should have `isProperty` equal to `true`", function () {
        expect(Property.type.isProperty).toBe(true);
      });
    });

    describe("define a root property -", function() {

      var Derived;

      beforeEach(function() {
        Derived = Complex.extend();
      });

      describe("when spec is a string -", function() {
        var propType;

        beforeEach(function() {
          propType = propertyTypeUtil.createRoot(Derived.type, "fooBarGuru");
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
          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});
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
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});
          expect(propType.label).toBe("Foo");
        });

        it("should convert empty to default", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", label: ""});
          expect(propType.label).toBe("Foo");
        });

        it("should convert null to default", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", label: null});
          expect(propType.label).toBe("Foo");
        });

        it("should convert undefined to default", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", label: undefined});
          expect(propType.label).toBe("Foo");
        });

        it("should respect the specified value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", label: "MyFoo"});
          expect(propType.label).toBe("MyFoo");
        });
      }); // end label

      describe("description - ", function() {
        it("should default to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1"});
          expect(propType.description).toBe(null);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", description: undefined});
          expect(propType.description).toBe(null);
        });

        it("should convert empty to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", description: ""});
          expect(propType.description).toBe(null);
        });

        it("should respect null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", description: null});
          expect(propType.description).toBe(null);
        });

        it("should respect the specified value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", description: "MyFoo"});
          expect(propType.description).toBe("MyFoo");
        });
      }); // end description

      describe("category - ", function() {
        it("should default to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1"});
          expect(propType.category).toBe(null);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", category: undefined});
          expect(propType.category).toBe(null);
        });

        it("should convert empty to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", category: ""});
          expect(propType.category).toBe(null);
        });

        it("should respect null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", category: null});
          expect(propType.category).toBe(null);
        });

        it("should respect the specified value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", category: "MyFoo"});
          expect(propType.category).toBe("MyFoo");
        });
      }); // end category

      describe("helpUrl - ", function() {
        it("should default to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1"});
          expect(propType.helpUrl).toBe(null);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", helpUrl: undefined});
          expect(propType.helpUrl).toBe(null);
        });

        it("should convert empty to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", helpUrl: ""});
          expect(propType.helpUrl).toBe(null);
        });

        it("should respect null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", helpUrl: null});
          expect(propType.helpUrl).toBe(null);
        });

        it("should respect the specified value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", helpUrl: "MyFoo"});
          expect(propType.helpUrl).toBe("MyFoo");
        });
      }); // end helpUrl

      describe("isBrowsable - ", function() {
        it("should default to true", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});
          expect(propType.isBrowsable).toBe(true);
        });

        it("should convert undefined to default", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isBrowsable: undefined});
          expect(propType.isBrowsable).toBe(true);
        });

        it("should convert null to default", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isBrowsable: null});
          expect(propType.isBrowsable).toBe(true);
        });

        it("should cast other values to boolean", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isBrowsable: 1});
          expect(propType.isBrowsable).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isBrowsable: 0});
          expect(propType.isBrowsable).toBe(false);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo3", isBrowsable: ""});
          expect(propType.isBrowsable).toBe(false);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo4", isBrowsable: true});
          expect(propType.isBrowsable).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo5", isBrowsable: "yes"});
          expect(propType.isBrowsable).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo6", isBrowsable: "no"});
          expect(propType.isBrowsable).toBe(true);
        });
      }); // end isBrowsable

      describe("isAdvanced - ", function() {
        it("should default to false", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});
          expect(propType.isAdvanced).toBe(false);
        });

        it("should convert undefined to default", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isAdvanced: undefined});
          expect(propType.isAdvanced).toBe(false);
        });

        it("should convert null to default", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isAdvanced: null});
          expect(propType.isAdvanced).toBe(false);
        });

        it("should cast other values to boolean", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isAdvanced: 1});
          expect(propType.isAdvanced).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isAdvanced: 0});
          expect(propType.isAdvanced).toBe(false);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo3", isAdvanced: ""});
          expect(propType.isAdvanced).toBe(false);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo4", isAdvanced: true});
          expect(propType.isAdvanced).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo5", isAdvanced: "yes"});
          expect(propType.isAdvanced).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo6", isAdvanced: "no"});
          expect(propType.isAdvanced).toBe(true);
        });
      }); // end isAdvanced
      //endregion

      //region Defining Attributes
      describe("name - ", function() {

        it("should throw when spec is falsy", function() {
          function expectIt(name) {
            expect(function() {
              propertyTypeUtil.createRoot(Derived.type, {
                name: name,
                type: "string"
              });
            }).toThrow(errorMatch.argRequired("name"));
          }

          expectIt(undefined);
          expectIt(null);
          expectIt("");

          // name is absent
          expect(function() {
            propertyTypeUtil.createRoot(Derived.type, {
              type: "string"
            });
          }).toThrow(errorMatch.argRequired("name"));
        });

        it("should respect a truthy spec value -", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {
            name: "fooBar",
            type: "string"
          });

          expect(propType.name).toBe("fooBar");
        });

        it("should throw when changed", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {
            name: "fooBar",
            type: "string"
          });

          expect(function() {
            propType.name = "fooBar2";
          }).toThrow(); // message varies with JS engine...
        });

        it("should not throw when set but not changed", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {
            name: "fooBar",
            type: "string"
          });

          propType.name = "fooBar";
        });
      }); // end name

      describe("isList - ", function() {
        it("should return `true` when the type is a list type", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: ["string"]});
          expect(propType.isList).toBe(true);
        });

        it("should return `false` when the type is an element type", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: "string"});
          expect(propType.isList).toBe(false);
        });
      }); // end isList

      // Monotonic
      describe("type - ", function() {

        // NOTE: tests of Context#get test type resolution more thoroughly.

        it("should default to String", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});
          expect(propType.type).toBe(PentahoString.type);
        });

        it("ignore a nully value specification and assume the default", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: null});

          expect(propType.type).toBe(PentahoString.type);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: undefined});

          expect(propType.type).toBe(PentahoString.type);
        });

        it("should throw when set and property already has descendant properties", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", type: "string"});

          var Derived2 = Derived.extend();

          // Create a descendant property
          propType.extendProto(
              {name: "foo1"}, // spec
              {declaringType: Derived2.type}); // keyArgs

          var PostalCode = PentahoString.extend();

          expect(function() {
            propType.type = PostalCode.type;
          }).toThrow(errorMatch.operInvalid());
        });

        it("should resolve the specified spec value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", type: "string"});
          expect(propType.type).toBe(PentahoString.type);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", type: "boolean"});
          expect(propType.type).toBe(PentahoBoolean.type);
        });

        it("should throw if the specified spec value is the id of an unloaded module", function() {
          expect(function() {
            propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: "bar/oof"});
          }).toThrowError(/bar\/oof/);
        });

        it("should allow changing to a subtype of the previous type", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", type: "number"});

          var Integer = PentahoNumber.extend();
          propType.type = Integer.type;
          expect(propType.type).toBe(Integer.type);
        });

        it("should throw when changing to a type that is not a subtype of the previous type", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", type: "number"});

          expect(function() {
            propType.type = PentahoString.type;
          }).toThrow(errorMatch.argInvalid("type"));

        });

        it("should preserve a local default value " +
           "when changing to a subtype of the previous type, if it is an instance of the new type", function() {

          var Integer = PentahoNumber.extend();
          var dv = new Integer(1);
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", type: "number", value: dv});

          expect(propType.value).toBe(dv);

          propType.type = Integer.type;

          expect(propType.value).toBe(dv);
        });

        it("should set a local default value to null " +
            "when changing to a subtype of the previous type, if it is not an instance of the new type", function() {

          var Integer = PentahoNumber.extend();
          var dv = new PentahoNumber(1);
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", type: "number", value: dv});

          expect(propType.value).toBe(dv);

          propType.type = Integer.type;

          expect(propType.value).toBe(null);
        });
      }); // end type

      describe("elemType - ", function() {
        it("for singular values, should provide same output as `type`", function() {
          ["string", "number", "boolean", "date", "complex"].forEach(function(type) {
            var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", type: type});
            expect(propType.elemType).toBe(propType.type);
          });
        });

        it("for list values, should return the type of its elements (base/of syntax)", function() {
          ["string", "number", "boolean", "date", "complex"].forEach(function(type) {
            var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", type: {base: "list", of: type}});
            expect(propType.elemType).toBe(propType.type.of);
          });
        });

      }); // end elemType

      describe("value - ", function() {

        it("should default to `null`, when unspecified", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: "string"});
          expect(propType.value).toBe(null);
        });

        it("should default to `null`, when specified as `undefined`", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: "string", value: undefined});
          expect(propType.value).toBe(null);
        });

        it("should get `null`, when specified as `null`", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: "string", value: null});
          expect(propType.value).toBe(null);
        });

        it("should get a non-nully, specified default value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: "string", value: "Foo"});
          var value = propType.value;
          expect(value.value).toBe("Foo");
          expect(value.formatted).toBe(null);
        });

        it("should allow setting to a different value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: "string", value: "Foo"});

          propType.value = "Bar";

          var value = propType.value;
          expect(value.value).toBe("Bar");
          expect(value.formatted).toBe(null);
        });

        it("should allow setting to null after having a non-null value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", type: "string", value: "Foo"});

          propType.value = null;

          expect(propType.value).toBe(null);
        });

        it("should throw when set and property already has descendant properties", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", type: "string"});

          // Create a descendant property
          var Derived2 = Derived.extend();

          propType.extendProto(
              {name: "foo1"}, // spec
              {declaringType: Derived2.type}); // keyArgs

          expect(function() {
            propType.value = null;
          }).toThrow(errorMatch.operInvalid());
        });
      }); //end value
      //endregion

      //region Dynamic & Monotonic Attributes
      describe("isRequired - ", function() {
        it("should not allow changing the Property.type attribute value", function() {
          var propType = Property.type;
          var isRequired = propType.isRequired;
          propType.isRequired = true;
          expect(propType.isRequired).toBe(isRequired);
        });

        it("should default to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});
          expect(propType.isRequired).toBe(undefined);
        });

        it("should ignore setting to undefined", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isRequired: true});
          expect(propType.isRequired).toBe(true);
          propType.isRequired = undefined;
          expect(propType.isRequired).toBe(true);
        });

        it("should ignore setting to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isRequired: true});
          expect(propType.isRequired).toBe(true);
          propType.isRequired = null;
          expect(propType.isRequired).toBe(true);
        });

        it("should throw when set and property already has descendant properties", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});

          var Derived2 = Derived.extend();

          // Create a descendant property
          propType.extendProto(
              {name: "foo"}, // spec
              {declaringType: Derived2.type}); // keyArgs

          expect(function() {
            propType.isRequired = true;
          }).toThrow(errorMatch.operInvalid());
        });

        it("should cast other non-function spec values to boolean", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isRequired: 1});
          expect(propType.isRequired).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isRequired: 0});
          expect(propType.isRequired).toBe(false);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo3", isRequired: ""});
          expect(propType.isRequired).toBe(false);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo4", isRequired: true});
          expect(propType.isRequired).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo5", isRequired: "yes"});
          expect(propType.isRequired).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo6", isRequired: "no"});
          expect(propType.isRequired).toBe(true);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isRequired: f});
          expect(propType.isRequired).toBe(f);
        });

        it("should evaluate a function spec value", function() {
          var f = jasmine.createSpy().and.callFake(function() { return true; });
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isRequired: f});

          var owner = {};
          expect(propType.isRequiredEval(owner)).toBe(true);
          expect(f.calls.count()).toBe(1);
        });

        it("should evaluate a function spec value and cast its result", function() {
          var owner = {};
          var f = function() { return 1; };
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isRequired: f});
          expect(propType.isRequiredEval(owner)).toBe(true);

          // ----

          f = function() { return 0; };
          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isRequired: f});
          expect(propType.isRequiredEval(owner)).toBe(false);

          // ---

          f = function() { return {}; };
          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isRequired: f});
          expect(propType.isRequiredEval(owner)).toBe(true);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isRequired: f});
          expect(propType.isRequiredEval(owner)).toBe(false);

          // ----

          f = function() { return undefined; };
          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isRequired: f});
          expect(propType.isRequiredEval(owner)).toBe(false);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isRequired: f});
          propType.isRequiredEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isRequired: f});
          propType.isRequiredEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });
      }); // end isRequired

      describe("countMin - ", function() {
        it("should not allow changing the Property.type attribute value", function() {
          var propType = Property.type;
          var countMin = propType.countMin;
          propType.countMin = 42;
          expect(propType.countMin).toBe(countMin);
        });

        it("should default to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});
          expect(propType.countMin).toBe(undefined);
        });

        it("should ignore setting to undefined", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", countMin: 1});
          expect(propType.countMin).toBe(1);
          propType.countMin = undefined;
          expect(propType.countMin).toBe(1);
        });

        it("should ignore setting to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", countMin: 1});
          expect(propType.countMin).toBe(1);
          propType.countMin = null;
          expect(propType.countMin).toBe(1);
        });

        it("should convert negative spec values to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMin: -1});
          expect(propType.countMin).toBe(undefined);
        });

        it("should convert NaN spec values to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMin: NaN});
          expect(propType.countMin).toBe(undefined);
        });

        it("should convert positive float spec values to its floored integer", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMin: 1.1});
          expect(propType.countMin).toBe(1);
        });

        it("should parse string spec values", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMin: "1"});
          expect(propType.countMin).toBe(1);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", countMin: "+1"});
          expect(propType.countMin).toBe(1);
        });

        it("should convert an invalid spec value to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMin: "foo"});
          expect(propType.countMin).toBe(undefined);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", countMin: "-1"});
          expect(propType.countMin).toBe(undefined);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMin: f});
          expect(propType.countMin).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMin: f});
          expect(propType.countMinEval(owner)).toBe(0);

          // ----

          f = function() { return undefined; };
          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", countMin: f});
          expect(propType.countMinEval(owner)).toBe(0);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMin: f});
          propType.countMinEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMin: f});
          propType.countMinEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });

        it("should throw when set and property already has descendant properties", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});

          var Derived2 = Derived.extend();

          // Create a descendant property
          propType.extendProto(
              {name: "foo"}, // spec
              {declaringType: Derived2.type}); // keyArgs

          expect(function() {
            propType.countMin = 2;
          }).toThrow(errorMatch.operInvalid());
        });
      }); // end countMin

      describe("countMax - ", function() {
        it("should not allow changing the Property.type attribute value", function() {
          var propType = Property.type;
          var countMax = propType.countMax;
          propType.countMax = 42;
          expect(propType.countMax).toBe(countMax);
        });

        it("should default to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});
          expect(propType.countMax).toBe(undefined);
        });

        it("should ignore setting to undefined", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", countMax: 1});
          expect(propType.countMax).toBe(1);
          propType.countMax = undefined;
          expect(propType.countMax).toBe(1);
        });

        it("should ignore setting to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", countMax: 1});
          expect(propType.countMax).toBe(1);
          propType.countMax = null;
          expect(propType.countMax).toBe(1);
        });

        it("should convert negative spec value to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMax: -1});
          expect(propType.countMax).toBe(undefined);
        });

        it("should convert NaN spec values to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMax: NaN});
          expect(propType.countMax).toBe(undefined);
        });

        it("should convert positive float spec values to its floored integer", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMax: 1.1});
          expect(propType.countMax).toBe(1);
        });

        it("should parse string spec values", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMax: "1"});
          expect(propType.countMax).toBe(1);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", countMax: "+1"});
          expect(propType.countMax).toBe(1);
        });

        it("should parse an 'Infinity' string spec value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMax: "Infinity"});
          expect(propType.countMax).toBe(Infinity);
        });

        it("should convert invalid string spec values to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMax: "foo"});
          expect(propType.countMax).toBe(undefined);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", countMax: "-1"});
          expect(propType.countMax).toBe(undefined);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMax: f});
          expect(propType.countMax).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMax: f});
          expect(propType.countMaxEval(owner)).toBe(Infinity);

          // ----

          f = function() { return undefined; };
          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", countMax: f});
          expect(propType.countMaxEval(owner)).toBe(Infinity);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMax: f});
          propType.countMaxEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", countMax: f});
          propType.countMaxEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });

        it("should throw when set and property already has descendant properties", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});

          var Derived2 = Derived.extend();

          // Create a descendant property
          propType.extendProto(
              {name: "foo"}, // spec
              {declaringType: Derived2.type}); // keyArgs

          expect(function() {
            propType.countMax = 2;
          }).toThrow(errorMatch.operInvalid());
        });
      }); // end countMax

      describe("isApplicable - ", function() {
        it("should not allow changing the Property.type attribute value", function() {
          var propType = Property.type;
          var isApplicable = propType.isApplicable;
          propType.isApplicable = false;
          expect(propType.isApplicable).toBe(isApplicable);
        });

        it("should default to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});
          expect(propType.isApplicable).toBe(undefined);
        });

        it("should ignore setting to undefined", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isApplicable: false});
          expect(propType.isApplicable).toBe(false);
          propType.isApplicable = undefined;
          expect(propType.isApplicable).toBe(false);
        });

        it("should ignore setting to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isApplicable: false});
          expect(propType.isApplicable).toBe(false);
          propType.isApplicable = null;
          expect(propType.isApplicable).toBe(false);
        });

        it("should cast other non-function spec values to boolean", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isApplicable: 1});
          expect(propType.isApplicable).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isApplicable: 0});
          expect(propType.isApplicable).toBe(false);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo3", isApplicable: ""});
          expect(propType.isApplicable).toBe(false);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo4", isApplicable: true});
          expect(propType.isApplicable).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo5", isApplicable: "yes"});
          expect(propType.isApplicable).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo6", isApplicable: "no"});
          expect(propType.isApplicable).toBe(true);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isApplicable: f});
          expect(propType.isApplicable).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isApplicable: f});
          expect(propType.isApplicableEval(owner)).toBe(true);

          // ----

          f = function() { return undefined; };
          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isApplicable: f});
          expect(propType.isApplicableEval(owner)).toBe(true);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isApplicable: f});
          propType.isApplicableEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isApplicable: f});
          propType.isApplicableEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });

        it("should throw when set and property already has descendant properties", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});

          var Derived2 = Derived.extend();

          // Create a descendant property
          propType.extendProto(
              {name: "foo"}, // spec
              {declaringType: Derived2.type}); // keyArgs

          expect(function() {
            propType.isApplicable = false;
          }).toThrow(errorMatch.operInvalid());
        });
      }); // end isApplicable

      describe("isReadOnly - ", function() {
        it("should not allow changing the Property.type attribute value", function() {
          var propType = Property.type;
          var isReadOnly = propType.isReadOnly;
          propType.isReadOnly = true;
          expect(propType.isReadOnly).toBe(isReadOnly);
        });

        it("should default to an unset local value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});
          expect(propType.isReadOnly).toBe(undefined);
        });

        it("should ignore setting to undefined", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isReadOnly: true});
          expect(propType.isReadOnly).toBe(true);
          propType.isReadOnly = undefined;
          expect(propType.isReadOnly).toBe(true);
        });

        it("should ignore setting to null", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isReadOnly: true});
          expect(propType.isReadOnly).toBe(true);
          propType.isReadOnly = null;
          expect(propType.isReadOnly).toBe(true);
        });

        it("should cast other non-function spec values to boolean", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isReadOnly: 1});
          expect(propType.isReadOnly).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isReadOnly: 0});
          expect(propType.isReadOnly).toBe(false);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo3", isReadOnly: ""});
          expect(propType.isReadOnly).toBe(false);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo4", isReadOnly: true});
          expect(propType.isReadOnly).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo5", isReadOnly: "yes"});
          expect(propType.isReadOnly).toBe(true);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo6", isReadOnly: "no"});
          expect(propType.isReadOnly).toBe(true);
        });

        it("should accept a function spec value", function() {
          var f = function() {};
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isReadOnly: f});
          expect(propType.isReadOnly).toBe(f);
        });

        it("should evaluate a function spec value and return the default value if it returns nully", function() {
          var owner = {};
          var f = function() { return null; };
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isReadOnly: f});
          expect(propType.isReadOnlyEval(owner)).toBe(false);

          // ----

          f = function() { return undefined; };
          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isReadOnly: f});
          expect(propType.isReadOnlyEval(owner)).toBe(false);
        });

        it("should evaluate a function spec value in the context of the owner value", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isReadOnly: f});
          propType.isReadOnlyEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().object).toBe(owner);
        });

        it("should evaluate a function spec value without arguments", function() {
          var owner = {};
          var f = jasmine.createSpy();
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isReadOnly: f});
          propType.isReadOnlyEval(owner);
          expect(f.calls.count()).toBe(1);
          expect(f.calls.first().args.length).toBe(0);
        });

        it("should throw when set and property already has descendant properties", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo"});

          var Derived2 = Derived.extend();

          // Create a descendant property
          propType.extendProto(
              {name: "foo"}, // spec
              {declaringType: Derived2.type}); // keyArgs

          expect(function() {
            propType.isReadOnly = true;
          }).toThrow(errorMatch.operInvalid());
        });
      }); // end isReadOnly

      describe("countRange -", function() {
        // 1. when !isList => min and max <= 1
        // 2. required => countMin >= 1
        // 3. min <= max

        it("should limit min and max to 1 when isList = false", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", countMin: 10, countMax: 10});
          expect(propType.countMin).toBe(10);
          expect(propType.countMax).toBe(10);
          expect(propType.countRangeEval({})).toEqual({min: 1, max: 1});
        });

        it("should not limit min and max to 1 when isList = true", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {
            name: "foo",
            countMin: 10,
            countMax: 10,
            type: ["string"]
          });
          expect(propType.countMin).toBe(10);
          expect(propType.countMax).toBe(10);
          expect(propType.countRangeEval({})).toEqual({min: 10, max: 10});
        });

        it("should have min = 1 when required", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isRequired: true});
          expect(propType.countMin).toBe(undefined);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(1);
        });

        it("should have min = 1 when required and countMin = 0", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isRequired: true, countMin: 0});
          expect(propType.countMin).toBe(0);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(1);
        });

        it("should have min equal to countMin when countMin >= 1 and any required value", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo1", isRequired: true, countMin: 1});
          expect(propType.countMin).toBe(1);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(1);

          propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo2", isRequired: false, countMin: 1});
          expect(propType.countMin).toBe(1);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(1);

          propType = propertyTypeUtil.createRoot(Derived.type, {
            name: "foo3",
            isRequired: true,
            countMin: 3,
            type: ["string"]
          });
          expect(propType.countMin).toBe(3);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(3);

          propType = propertyTypeUtil.createRoot(Derived.type, {
            name: "foo4",
            isRequired: false,
            countMin: 3,
            type: ["string"]
          });
          expect(propType.countMin).toBe(3);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).min).toBe(3);
        });

        // required <= max
        it("should have max = 1 when countMax = 0 and required = true", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", isRequired: true, countMax: 0});
          expect(propType.countMin).toBe(undefined);
          expect(propType.countMax).toBe(0);
          expect(propType.countRangeEval({}).max).toBe(1);
        });

        it("should have max = 1 when countMax is 0 and countMin = 1", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", countMin: 1, countMax: 0});
          expect(propType.countMin).toBe(1);
          expect(propType.countMax).toBe(0);
          expect(propType.countRangeEval({}).max).toBe(1);
        });

        it("should have max = 10 when countMin = 10, countMax = 5 and isList = true", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {
            name: "foo",
            countMin: 10,
            countMax: 5,
            type: ["string"]
          });
          expect(propType.countMin).toBe(10);
          expect(propType.countMax).toBe(5);
          expect(propType.countRangeEval({}).max).toBe(10);
        });

        it("should have max = Infinity when countMin = 10 and isList = true", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", countMin: 10, type: ["string"]});
          expect(propType.countMin).toBe(10);
          expect(propType.countMax).toBe(undefined);
          expect(propType.countRangeEval({}).max).toBe(Infinity);
        });

        it("should have min = 0 when countMax = 10 and isList = true", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", countMax: 10, type: ["string"]});
          expect(propType.countMin).toBe(undefined);
          expect(propType.countMax).toBe(10);
          expect(propType.countRangeEval({}).min).toBe(0);
        });

        it("should have min = 0 when countMax = 1", function() {
          var propType = propertyTypeUtil.createRoot(Derived.type, {name: "foo", countMax: 1});
          expect(propType.countMin).toBe(undefined);
          expect(propType.countMax).toBe(1);
          expect(propType.countRangeEval({}).min).toBe(0);
        });
      });
      //endregion
    }); // end define a root property

    describe("override a property -", function() {

      it("should throw if spec.name is not the name of the base property", function() {
        var Base = Complex.extend();

        Base.type.add({name: "baseStr"});

        var Derived = Base.extend();

        expect(function() {
          propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr2"});
        }).toThrowError(TypeError);
      });

      describe("basic characteristics -", function() {
        var propType, basePropType, Derived;

        beforeEach(function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          Derived = Base.extend();

          basePropType = Base.type.get("baseStr");

          propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});
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

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo"});

          expect(propType.label).toBe("FooABC");
        });

        it("should respect the spec value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", label: "FooABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", label: "XYZ"});

          expect(propType.label).toBe("XYZ");
        });

        it("should respect a set value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", label: "ABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", label: "XYZ"});

          expect(propType.label).toBe("XYZ");

          propType.label = "WWW";

          expect(propType.label).toBe("WWW");
        });

        it("should inherit the base value when set to nully or empty", function() {
          var Base = Complex.extend();

          var baseLabel = "ABC";
          Base.type.add({name: "foo", label: baseLabel});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", label: "XYZ"});

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

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo"});

          expect(propType.description).toBe("FooABC");
        });

        it("should inherit the base value if spec is undefined", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", description: undefined});

          expect(propType.description).toBe("FooABC");
        });

        it("should respect the spec null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", description: null});

          expect(propType.description).toBe(null);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "FooABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", description: "XYZ"});

          expect(propType.description).toBe("XYZ");
        });

        it("should respect a set null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "ABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", description: "XYZ"});

          propType.description = null;

          expect(propType.description).toBe(null);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", description: "ABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", description: "XYZ"});

          expect(propType.description).toBe("XYZ");

          propType.description = "WWW";

          expect(propType.description).toBe("WWW");
        });

        it("should inherit the base value when set to undefined", function() {
          var Base = Complex.extend();

          var baseDesc = "ABC";
          Base.type.add({name: "foo", description: baseDesc});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", description: "XYZ"});

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

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo"});

          expect(propType.category).toBe("FooABC");
        });

        it("should inherit the base value if spec is undefined", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", category: undefined});

          expect(propType.category).toBe("FooABC");
        });

        it("should respect the spec null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", category: null});

          expect(propType.category).toBe(null);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "FooABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", category: "XYZ"});

          expect(propType.category).toBe("XYZ");
        });

        it("should respect a set null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "ABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", category: "XYZ"});

          propType.category = null;

          expect(propType.category).toBe(null);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", category: "ABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", category: "XYZ"});

          expect(propType.category).toBe("XYZ");

          propType.category = "WWW";

          expect(propType.category).toBe("WWW");
        });

        it("should inherit the base value when set to undefined", function() {
          var Base = Complex.extend();

          var baseValue = "ABC";
          Base.type.add({name: "foo", category: baseValue});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", category: "XYZ"});

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

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo"});

          expect(propType.helpUrl).toBe("FooABC");
        });

        it("should inherit the base value if spec is undefined", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", helpUrl: undefined});

          expect(propType.helpUrl).toBe("FooABC");
        });

        it("should respect the spec null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", helpUrl: null});

          expect(propType.helpUrl).toBe(null);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "FooABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", helpUrl: "XYZ"});

          expect(propType.helpUrl).toBe("XYZ");
        });

        it("should respect a set null value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "ABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", helpUrl: "XYZ"});

          propType.helpUrl = null;

          expect(propType.helpUrl).toBe(null);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", helpUrl: "ABC"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", helpUrl: "XYZ"});

          expect(propType.helpUrl).toBe("XYZ");

          propType.helpUrl = "WWW";

          expect(propType.helpUrl).toBe("WWW");
        });

        it("should inherit the base value when set to undefined", function() {
          var Base = Complex.extend();

          var baseValue = "ABC";
          Base.type.add({name: "foo", helpUrl: baseValue});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", helpUrl: "XYZ"});

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

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo"});

          expect(propType.isBrowsable).toBe(false);

          // ----

          Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: true});

          Derived = Base.extend();

          propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo"});

          expect(propType.isBrowsable).toBe(true);
        });

        it("should inherit the base value if spec is nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: false});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", isBrowsable: undefined});

          expect(propType.isBrowsable).toBe(false);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: false});

          Derived = Base.extend();

          propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", isBrowsable: null});

          expect(propType.isBrowsable).toBe(false);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: true});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", isBrowsable: false});

          expect(propType.isBrowsable).toBe(false);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: true});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo"});

          expect(propType.isBrowsable).toBe(true);

          propType.isBrowsable = false;

          expect(propType.isBrowsable).toBe(false);
        });

        it("should inherit the base value when set to nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: true});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", isBrowsable: false});

          expect(propType.isBrowsable).toBe(false);

          propType.isBrowsable = undefined;

          expect(propType.isBrowsable).toBe(true);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "foo", isBrowsable: true});

          Derived = Base.extend();

          propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", isBrowsable: false});

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

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo"});

          expect(propType.isAdvanced).toBe(false);

          // ----

          Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: true});

          Derived = Base.extend();

          propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo"});

          expect(propType.isAdvanced).toBe(true);
        });

        it("should inherit the base value if spec is nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: true});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", isAdvanced: undefined});

          expect(propType.isAdvanced).toBe(true);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: true});

          Derived = Base.extend();

          propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", isAdvanced: null});

          expect(propType.isAdvanced).toBe(true);
        });

        it("should respect the spec value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: false});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", isAdvanced: true});

          expect(propType.isAdvanced).toBe(true);
        });

        it("should respect a set value if not nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: false});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo"});

          expect(propType.isAdvanced).toBe(false);

          propType.isAdvanced = true;

          expect(propType.isAdvanced).toBe(true);
        });

        it("should inherit the base value when set to nully", function() {
          var Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: false});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", isAdvanced: true});

          expect(propType.isAdvanced).toBe(true);

          propType.isAdvanced = undefined;

          expect(propType.isAdvanced).toBe(false);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "foo", isAdvanced: false});

          Derived = Base.extend();

          propType = propertyTypeUtil.extend(Derived.type, "foo", {name: "foo", isAdvanced: true});

          expect(propType.isAdvanced).toBe(true);

          propType.isAdvanced = null;

          expect(propType.isAdvanced).toBe(false);
        });
      }); // end isAdvanced
      //endregion

      //region Defining attributes
      // Cannot change.
      describe("name - ", function() {
        var propType;

        beforeEach(function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});
        });

        it("should have the same name", function() {
          expect(propType.name).toBe("baseStr");
        });

        it("should throw when changed", function() {
          expect(function() {
            propType.name = "baseStrXYZ";
          }).toThrowError(TypeError);
        });

        it("should not throw when set but not changed", function() {
          propType.name = "baseStr";
        });
      }); // end name

      // Monotonic. Cannot change if has descendants.
      describe("type - ", function() {
        it("should inherit base type value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseNum", type: PentahoNumber});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseNum", {name: "baseNum"});

          expect(propType.type).toBe(PentahoNumber.type);
        });

        it("should ignore a nully value specification and assume the default", function() {
          var Base = Complex.extend();
          Base.type.add({name: "postalCode", type: PentahoString});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "postalCode", {name: "postalCode", type: null});

          expect(propType.type).toBe(PentahoString.type);

          // ---

          Derived = Base.extend();

          propType = propertyTypeUtil.extend(Derived.type, "postalCode", {name: "postalCode", type: undefined});

          expect(propType.type).toBe(PentahoString.type);
        });

        it("should ignore setting to a nully value", function() {
          var Base = Complex.extend();
          Base.type.add({name: "postalCode", type: PentahoString});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "postalCode", {name: "postalCode"});

          expect(propType.type).toBe(PentahoString.type);

          propType.type = null;

          expect(propType.type).toBe(PentahoString.type);

          // ---

          propType.type = undefined;

          expect(propType.type).toBe(PentahoString.type);
        });

        it("should accept a spec type that is a sub-type of the base property's type", function() {
          var PostalCode = PentahoString.extend();

          var Base = Complex.extend();

          Base.type.add({name: "postalCode", type: PentahoString});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "postalCode", {name: "postalCode", type: PostalCode});

          expect(propType.type).toBe(PostalCode.type);
        });

        it("should allow a _set_ type that is a sub-type of the property's **previous** type", function() {
          var PostalCode1 = PentahoString.extend();
          var PostalCode2 = PostalCode1.extend();

          // ----

          var Base = Complex.extend();

          Base.type.add({name: "postalCode", type: PentahoString});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "postalCode", {name: "postalCode"});

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
            propertyTypeUtil.extend(Derived.type, "num", {name: "num", type: PentahoNumber});
          }).toThrow(errorMatch.argInvalid("type"));
        });

        it("should throw on a set type that is not a sub-type of the property's previous type", function() {

          var Base = Complex.extend();

          Base.type.add({name: "num", type: PentahoString});

          var PostalCode1 = PentahoString.extend();

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "num", {name: "num", type: PostalCode1});

          expect(function() {
            propType.type = PentahoNumber;
          }).toThrow(errorMatch.argInvalid("type"));
        });
      });

      // Cannot change if has descendants.
      describe("value -", function() {
        it("should get null if an inherited default value is not an instance of the local value type", function() {
          var Integer = PentahoNumber.extend();

          var dv = new PentahoNumber(1);

          var Base = Complex.extend();
          Base.type.add({name: "baseNum", type: PentahoNumber, value: dv});

          expect(Base.type.get("baseNum").value).toBe(dv);

          var Derived = Base.extend();
          var propType = propertyTypeUtil.extend(Derived.type, "baseNum", {name: "baseNum", type: Integer.type});

          expect(propType.value).toBe(null);
        });

        it("should get null if an inherited default value is not an instance of the inherited value type", function() {
          var Integer = PentahoNumber.extend();

          var dv = new PentahoNumber(1);

          var Base = Complex.extend();
          Base.type.add({name: "baseNum", type: PentahoNumber, value: dv});

          var Derived1 = Base.extend();
          Derived1.type.add({name: "baseNum", type: Integer.type});

          var Derived2 = Derived1.extend();
          var propType2 = propertyTypeUtil.extend(Derived2.type, "baseNum", {name: "baseNum"});

          expect(propType2.value).toBe(null);
        });

        describe("test group", function() {
          var Derived;

          beforeEach(function(){
            var Base = Complex.extend();

            Base.type.add({name: "baseNum", type: PentahoNumber});
            Base.type.add({name: "baseStr", type: PentahoString, value: "a"});

            Derived = Base.extend();
          });

          // ----

          it("should inherit the base default value when unspecified", function() {
            var propType = propertyTypeUtil.extend(Derived.type, "baseNum", {name: "baseNum"});
            expect(propType.value).toBe(null);

            propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});
            expect(propType.value.value).toBe("a");
          });

          it("should inherit the base default value when specified as undefined", function() {
            var propType = propertyTypeUtil.extend(Derived.type, "baseNum", {name: "baseNum", value: undefined});
            expect(propType.value).toBe(null);

            propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", value: undefined});
            expect(propType.value.value).toBe("a");
          });

          it("should shadow the base value when specified as null", function() {
            var propType = propertyTypeUtil.extend(Derived.type, "baseNum", {name: "baseNum", value: null});
            expect(propType.value).toBe(null);

            propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", value: null});
            expect(propType.value).toBe(null);
          });

          it("should shadow the base value when specified", function() {
            var propType = propertyTypeUtil.extend(Derived.type, "baseNum", {name: "baseNum", value: 1});
            expect(propType.value.value).toBe(1);

            propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", value: "b"});
            expect(propType.value.value).toBe("b");
          });

          it("should be settable to a non-nully value", function() {
            var propType = propertyTypeUtil.extend(Derived.type, "baseNum", {name: "baseNum"});
            propType.value = 1;

            expect(propType.value.value).toBe(1);

            // ---

            propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});
            propType.value = "b";

            expect(propType.value.value).toBe("b");
          });

          it("should be settable to value `null`", function() {
            var propType = propertyTypeUtil.extend(Derived.type, "baseNum", {name: "baseNum", value: 1});
            propType.value = null;

            expect(propType.value).toBe(null);

            // ---

            propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", value: "b"});
            propType.value = null;

            expect(propType.value).toBe(null);
          });

          it("should be reset to the inherited value when set to undefined", function() {
            var propType = propertyTypeUtil.extend(Derived.type, "baseNum", {name: "baseNum", value: 1});
            propType.value = undefined;

            expect(propType.value).toBe(null);

            // ---

            propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", value: "b"});
            propType.value = undefined;

            expect(propType.value.value).toBe("a");
          });
        });
      });
      //endregion

      //region Dynamic & Monotonic attributes
      // Dynamic. Monotonic. Cannot change if has descendants.

      describe("isRequired -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});

          expect(propType.isRequired).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr", isRequired: true});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propType.isRequiredEval(owner)).toBe(true);
        });

        it("should get the specification value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isRequired: false});

          expect(propType.isRequired).toBe(false);
        });

        it("should get the last set non-nully value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isRequired: false});

          expect(propType.isRequired).toBe(false);

          propType.isRequired = true;

          expect(propType.isRequired).toBe(true);

          propType.isRequired = false;

          expect(propType.isRequired).toBe(false);
        });

        it("should let change the local value, but all sets are combined monotonically " +
           "to later evaluate the effective value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isRequired: false});

          propType.isRequired = true;

          // non-monotonic change
          propType.isRequired = false;

          var owner = {};

          var isRequired = propType.isRequiredEval(owner);
          expect(isRequired).toBe(true);
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

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isRequired: subSpy});

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

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isRequired: subSpy});

          var owner = {};

          expect(propType.isRequiredEval(owner)).toBe(true);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(0);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "baseStr", isRequired: true});

          Derived = Base.extend();

          subSpy = jasmine.createSpy().and.returnValue(true);

          propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isRequired: subSpy});

          owner = {};

          expect(propType.isRequiredEval(owner)).toBe(true);
          expect(subSpy.calls.count()).toBe(0);
        });
      }); // end isRequired

      describe("countMin -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});

          expect(propType.countMin).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr", countMin: 1});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propType.countMinEval(owner)).toBe(1);
        });

        it("should get the specification value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMin: 2});

          expect(propType.countMin).toBe(2);
        });

        it("should evaluate to the specified value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMin: 2});

          var owner = {};

          expect(propType.countMinEval(owner)).toBe(2);
        });

        it("should allow changing the local value multiple times, but can never change non-monotonically", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMin: 2});

          propType.countMin = 0;

          var owner = {};

          expect(propType.countMinEval(owner)).toBe(2);

          propType.countMin = 4;
          expect(propType.countMin).toBe(4); // last set static value
          expect(propType.countMinEval(owner)).toBe(4);

          propType.countMin = 6;
          expect(propType.countMin).toBe(6); // last set static value
          expect(propType.countMinEval(owner)).toBe(6);

          propType.countMin = 2;
          expect(propType.countMin).toBe(2); // last set static value
          expect(propType.countMinEval(owner)).toBe(6);
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

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMin: subSpy});

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

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMin: subSpy});

          var owner = {};

          expect(propType.countMinEval(owner)).toBe(3);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(1);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "baseStr", countMin: 2});

          Derived = Base.extend();

          subSpy = function() { return 1; };

          propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMin: subSpy});

          owner = {};

          expect(propType.countMinEval(owner)).toBe(2);
        });
      }); // end countMin

      describe("countMax -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});

          expect(propType.countMax).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr", countMax: 5});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propType.countMaxEval(owner)).toBe(5);
        });

        it("should get the specification value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMax: 2});

          expect(propType.countMax).toBe(2);
        });

        it("should evaluate to the specified value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMax: 2});

          var owner = {};

          expect(propType.countMaxEval(owner)).toBe(2);
        });

        it("should allow changing the local value multiple times, but can never change non-monotonically", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMax: 5});

          propType.countMax = 7;

          var owner = {};

          expect(propType.countMaxEval(owner)).toBe(5);

          propType.countMax = 4;
          expect(propType.countMax).toBe(4); // last set static value
          expect(propType.countMaxEval(owner)).toBe(4);

          propType.countMax = 2;
          expect(propType.countMax).toBe(2); // last set static value
          expect(propType.countMaxEval(owner)).toBe(2);

          propType.countMax = 3;
          expect(propType.countMax).toBe(3); // last set static value
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

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMax: subSpy});

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

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMax: subSpy});

          var owner = {};

          expect(propType.countMaxEval(owner)).toBe(1);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(1);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "baseStr", countMax: 2});

          Derived = Base.extend();

          subSpy = function() { return 1; };

          propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", countMax: subSpy});

          owner = {};

          expect(propType.countMaxEval(owner)).toBe(1);
        });
      }); // end countMax

      describe("isApplicable -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});

          expect(propType.isApplicable).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr", isApplicable: false});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propType.isApplicableEval(owner)).toBe(false);
        });

        it("should get the specification value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isApplicable: false});

          expect(propType.isApplicable).toBe(false);
        });

        it("should get the last set non-nully value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isApplicable: true});

          expect(propType.isApplicable).toBe(true);

          propType.isApplicable = false;

          expect(propType.isApplicable).toBe(false);

          propType.isApplicable = true;

          expect(propType.isApplicable).toBe(true);
        });

        it("should let change the local value, but all sets are combined monotonically " +
            "to later evaluate the effective value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isApplicable: true});

          propType.isApplicable = false;

          // non-monotonic change
          propType.isApplicable = true;

          var owner = {};

          var isApplicable = propType.isApplicableEval(owner);
          expect(isApplicable).toBe(false);
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

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isApplicable: subSpy});

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

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isApplicable: subSpy});

          var owner = {};

          expect(propType.isApplicableEval(owner)).toBe(false);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(0);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "baseStr", isApplicable: false});

          Derived = Base.extend();

          subSpy = jasmine.createSpy().and.returnValue(true);

          propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isApplicable: subSpy});

          owner = {};

          expect(propType.isApplicableEval(owner)).toBe(false);
          expect(subSpy.calls.count()).toBe(0);
        });
      }); // end isApplicable

      describe("isReadOnly -", function() {
        it("should default to an unset local value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});

          expect(propType.isReadOnly).toBe(undefined);
        });

        it("should evaluate to the base value by default", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr", isReadOnly: true});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr"});

          var owner = {};

          expect(propType.isReadOnlyEval(owner)).toBe(true);
        });

        it("should get the specification value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isReadOnly: false});

          expect(propType.isReadOnly).toBe(false);
        });

        it("should get the last set non-nully value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isReadOnly: false});

          expect(propType.isReadOnly).toBe(false);

          propType.isReadOnly = true;

          expect(propType.isReadOnly).toBe(true);

          propType.isReadOnly = false;

          expect(propType.isReadOnly).toBe(false);
        });

        it("should let change the local value, but all sets are combined monotonically " +
            "to later evaluate the effective value", function() {
          var Base = Complex.extend();

          Base.type.add({name: "baseStr"});

          var Derived = Base.extend();

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isReadOnly: false});

          propType.isReadOnly = true;

          // non-monotonic change
          propType.isReadOnly = false;

          var owner = {};

          var isReadOnly = propType.isReadOnlyEval(owner);
          expect(isReadOnly).toBe(true);
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

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isReadOnly: subSpy});

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

          var propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isReadOnly: subSpy});

          var owner = {};

          expect(propType.isReadOnlyEval(owner)).toBe(true);
          expect(baseSpy.calls.count()).toBe(1);
          expect(subSpy.calls.count()).toBe(0);

          // ---

          Base = Complex.extend();

          Base.type.add({name: "baseStr", isReadOnly: true});

          Derived = Base.extend();

          subSpy = jasmine.createSpy().and.returnValue(true);

          propType = propertyTypeUtil.extend(Derived.type, "baseStr", {name: "baseStr", isReadOnly: subSpy});

          owner = {};

          expect(propType.isReadOnlyEval(owner)).toBe(true);
          expect(subSpy.calls.count()).toBe(0);
        });
      }); // end isReadOnly
      //endregion
    }); // end override a property

  }); // pentaho.type.Property.Type
});
