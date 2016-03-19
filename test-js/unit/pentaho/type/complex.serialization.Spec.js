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
  "pentaho/type/SpecificationScope"
], function(Context, SpecificationScope) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, Date:false */

  describe("pentaho.type.Complex", function() {

    var context = new Context();

    var Complex = context.get("pentaho/type/complex");

    var TestLevel1 = Complex.extend("TestLevel1", {
      type: {
        label: "TestLevel1",
        props: [
          "type"
        ]
      }
    });

    var TestLevel2 = TestLevel1.extend("TestLevel2", {
      type: {
        label: "TestLevel2",
        props: [
          "name"
        ]
      }
    });

    var Derived = Complex.extend({
      type: {
        label: "Derived",
        props: [
          {name: "quantity", type: "number"},
          "type",
          {name: "noFormat", type: "number"},
          {name: "anything", type: TestLevel1},
          {
            name: "sub",
            type: {
              props: [
                {name: "truth", type: "boolean"},
                {name: "when", type: "date"}
              ]
            }
          },
          {name: "sameAsDefault", type: "number", value: 0},
          {name: "noValue", type: "number"}
        ]
      }
    });

    var whenDate = new Date();
    var originalSpec = {
      quantity: {v: 20, f: "I'm a simple 20"},
      type: {v: "bar", f: "I'm a bar"},
      noFormat: 50,
      anything: new TestLevel2({"name": "concrete", "type": "Level2"}),
      sub: {
        truth: {v: true, f: "I'm a nested true"},
        when: whenDate
      },
      sameAsDefault: 0,
      noValue: null
    };

    var value;

    describe("#toSpecInScope(scope, requireType, keyArgs)", function() {
      var scope;

      function spyProperty(name) {
        var v = value.get(name);
        if(v) spyOn(v, "toSpecInScope").and.callThrough();
      }

      beforeEach(function() {
        value = new Derived(originalSpec);
        scope = new SpecificationScope();
      });

      describe("when requireType", function() {

        describe("= false", function() {

          describe("when keyArgs.preferPropertyArray: false", function() {

            it("should return a plain Object", function() {
              var requireType = false;
              var spec = value.toSpecInScope(scope, requireType, {preferPropertyArray: false});
              expect(spec.constructor).toBe(Object);
            });

          });

          describe("when keyArgs.preferPropertyArray: true", function() {

            it("should return an Array", function() {
              var requireType = false;
              var spec = value.toSpecInScope(scope, requireType, {preferPropertyArray: true});
              expect(Array.isArray(spec)).toBe(true);
            });

          });

        });

        describe("= true", function() {

          describe("when keyArgs.preferPropertyArray: false", function() {

            it("should return a plain Object", function() {
              var requireType = true;
              var spec = value.toSpecInScope(scope, requireType, {preferPropertyArray: false});
              expect(spec.constructor).toBe(Object);
            });

          });

          describe("when keyArgs.preferPropertyArray: true", function() {

            it("should return a plain Object", function() {
              var requireType = true;
              var spec = value.toSpecInScope(scope, requireType, {preferPropertyArray: true});
              expect(spec.constructor).toBe(Object);
            });

          });

        });

      });

      describe("when calling property values #toSpecInScope", function() {

        it("should pass the given `scope`", function() {

          function expectProperty(name) {
            var v = value.get(name);
            if(v) {
              expect(v.toSpecInScope.calls.count()).toBe(1);

              var args = v.toSpecInScope.calls.first().args;
              expect(args[0]).toBe(scope);
            }
          }

          Derived.type.each(function(pType) { spyProperty(pType.name); });

          var requireType = false;

          value.toSpecInScope(scope, requireType, {includeDefaults: true});

          Derived.type.each(function(pType) { expectProperty(pType.name); });
        });

        it("should pass through all options of `keyArgs`", function() {
          var keyArgs = {
            includeDefaults: true,
            foo:  {},
            bar:  {},
            dudu: {}
          };

          function expectProperty(name) {
            var v = value.get(name);
            if(v) {
              expect(v.toSpecInScope.calls.count()).toBe(1);

              var args = v.toSpecInScope.calls.first().args;
              expect(args[0] instanceof SpecificationScope);

              var keyArgs2 = args[2];
              expect(keyArgs2).toEqual(jasmine.any(Object));

              expect(keyArgs2.foo).toBe(keyArgs.foo);
              expect(keyArgs2.bar).toBe(keyArgs.bar);
              expect(keyArgs2.dudu).toBe(keyArgs.dudu);
            }
          }

          Derived.type.each(function(pType) { spyProperty(pType.name); });

          var requireType = false;
          value.toSpecInScope(scope, requireType, keyArgs);

          Derived.type.each(function(pType) { expectProperty(pType.name); });
        });

        it("should pass requireType=true when the value is not of the same type of the property", function() {

          function expectProperty(name) {
            var v = value.get(name);
            if(v) {
              expect(v.toSpecInScope.calls.count()).toBe(1);

              var args = v.toSpecInScope.calls.first().args;

              expect(args[1]).toBe(true);
            }
          }

          spyProperty("anything");

          var requireType = false;
          value.toSpecInScope(scope, requireType, {});

          expectProperty("anything");
        });

        it("should pass requireType=false when the value is of the same type of the property", function() {

          function expectProperty(name) {
            var v = value.get(name);
            if(v) {
              expect(v.toSpecInScope.calls.count()).toBe(1);

              var args = v.toSpecInScope.calls.first().args;

              expect(args[1]).toBe(false);
            }
          }

          spyProperty("noFormat");

          var requireType = false;
          value.toSpecInScope(scope, requireType, {});

          expectProperty("noFormat");
        });

      });

      describe("when returning a complex in array form", function() {
        var spec;

        beforeEach(function() {
          var requireType = false;
          spec = value.toSpecInScope(scope, requireType, {preferPropertyArray: true});
        });

        it("should have one entry for each of the complex type's properties", function() {
          expect(spec.length).toBe(Derived.type.count);
        });

        it("should prefer nested complexes as arrays as well (when possible)", function() {
          var index = Derived.type.get("sub").index;

          expect(spec[index] != null).toBe(true);
          expect(Array.isArray(spec[index])).toBe(true);
        });

        describe("keyArgs.includeDefaults", function() {

          describe(": false", function() {

            it("should return an array with nulls where the value equal to the default value", function() {

              var requireType = false;
              var spec = value.toSpecInScope(scope, requireType, {includeDefaults: false, preferPropertyArray: true});

              expect(spec.length).toBe(Derived.type.count);

              Derived.type.each(function(pType, index) {
                if(Derived.type.areEqual(pType.value, value.get(pType))) {
                  expect(spec[index]).toBe(null);
                } else {
                  expect(spec[index]).not.toBe(null);
                }
              });
            });

          });

          describe(": true", function() {

            it("should return an array with entries for all complex type's properties, " +
                "some with the default values", function() {

              var requireType = false;
              var spec = value.toSpecInScope(scope, requireType, {includeDefaults: true, preferPropertyArray: true});

              expect(spec.length).toBe(Derived.type.count);
            });

          });

        });

      });

      describe("when returning a complex in object form", function() {

        it("should return nested complexes in object form as well", function() {
          var requireType = false;
          var spec = value.toSpecInScope(scope, requireType, {preferPropertyArray: false});

          expect(spec.anything != null).toBe(true);
          expect(spec.anything.constructor).toBe(Object);
        });

        describe("keyArgs.includeDefaults", function() {

          describe(": false", function() {

            it("should return a plain object with properties only for each of " +
               "the non-default-valued complex type's properties", function() {

              var requireType = false;
              var spec = value.toSpecInScope(scope, requireType, {includeDefaults: false, preferPropertyArray: false});

              Derived.type.each(function(pType) {
                if(Derived.type.areEqual(pType.value, value.get(pType))) {
                  expect(pType.name in spec).toBe(false);
                } else {
                  expect(pType.name in spec).toBe(true);
                }
              });
            });

          });

          describe(": true", function() {

            it("should return a plain object with properties for all complex type's properties, " +
               "even those with default values", function() {

              var requireType = false;
              var spec = value.toSpecInScope(scope, requireType, {includeDefaults: true, preferPropertyArray: false});

              Derived.type.each(function(pType) {
                expect(pType.name in spec).toBe(true);
              });
            });

          });

        });

      });

    }); // toSpecInScope

  });
});
