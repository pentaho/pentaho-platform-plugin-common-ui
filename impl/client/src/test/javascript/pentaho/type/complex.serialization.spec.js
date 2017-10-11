/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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

    var context;
    var Complex;
    var TestLevel1;
    var TestLevel2;
    var Derived;
    var whenDate;
    var originalSpec;
    var value;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Complex = context.get("pentaho/type/complex");

            TestLevel1 = Complex.extend("TestLevel1", {
              $type: {
                label: "TestLevel1",
                props: [
                  "type"
                ]
              }
            });

            TestLevel2 = TestLevel1.extend("TestLevel2", {
              $type: {
                label: "TestLevel2",
                props: [
                  "name"
                ]
              }
            });

            Derived = Complex.extend({
              $type: {
                label: "Derived",
                props: [
                  {name: "quantity", valueType: "number"},
                  "type",
                  {name: "noFormat", valueType: "number"},
                  {name: "anything", valueType: TestLevel1},
                  {
                    name: "sub",
                    valueType: {
                      props: [
                        {name: "truth", valueType: "boolean"},
                        {name: "when", valueType: "date"}
                      ]
                    }
                  },
                  {name: "sameAsDefaultSpecified", valueType: "number", defaultValue: 0},
                  {name: "noValue", valueType: "number"},
                  {name: "emptyListEmptyDefaultSpecified", valueType: ["number"]},
                  {name: "emptyListWithDefaultSpecified", valueType: ["number"], defaultValue: [1, 2, 3]},
                  {name: "nonEmptyList", valueType: ["number"]},
                  {name: "sameAsDefaultUnspecified", valueType: "number", defaultValue: 0},
                  {name: "emptyListEmptyDefaultUnspecified", valueType: ["number"]},
                  {name: "emptyListWithDefaultUnspecified", valueType: ["number"], defaultValue: [1, 2, 3]}
                ]
              }
            });

            whenDate = new Date();

            originalSpec = {
              quantity: {v: 20, f: "I'm a simple 20"},
              type: {v: "bar", f: "I'm a bar"},
              noFormat: 50,
              anything: new TestLevel2({"name": "concrete", "type": "Level2"}),
              sub: {
                truth: {v: true, f: "I'm a nested true"},
                when: whenDate
              },
              sameAsDefaultSpecified: 0,
              noValue: null,
              emptyListEmptyDefaultSpecified: [],
              emptyListWithDefaultSpecified: [],
              nonEmptyList: [1, 2, 3]
            };
          })
          .then(done, done.fail);
    });

    describe("#toSpecInContext(keyArgs)", function() {
      var scope;

      function spyProperty(name, fake) {
        var v = value.get(name);
        if(v) {
          var spy = spyOn(v, "toSpecInContext");
          if(fake) {
            spy.and.callFake(fake);
          } else {
            spy.and.callThrough();
          }
        }
      }

      beforeEach(function() {
        value = new Derived(originalSpec);
        scope = new SpecificationScope();
      });

      describe("when keyArgs.declaredType", function() {

        describe("= unspecified", function() {

          describe("when keyArgs.forceType", function() {

            describe("= unspecified", function() {

              it("should not include", function() {
                var spec = value.toSpecInContext();

                scope.dispose();

                expect(spec.constructor).toBe(Object);
                expect("_" in spec).toBe(false);
              });
            });

            describe("= false", function() {

              it("should not include", function() {
                var spec = value.toSpecInContext();

                scope.dispose();

                expect(spec.constructor).toBe(Object);
                expect("_" in spec).toBe(false);
              });
            });

            describe("= true", function() {

              it("should include", function() {
                var spec = value.toSpecInContext({forceType: true});

                scope.dispose();

                expect(spec.constructor).toBe(Object);
                expect("_" in spec).toBe(true);
              });
            });

          });
        });

        describe("= value.$type", function() {

          describe("when keyArgs.forceType", function() {

            describe("= unspecified", function() {

              describe("when keyArgs.preferPropertyArray: false", function() {

                it("should return a plain Object", function() {
                  var spec = value.toSpecInContext({declaredType: value.$type, preferPropertyArray: false});

                  scope.dispose();

                  expect(spec.constructor).toBe(Object);
                });

                it("should not include the type", function() {
                  var spec = value.toSpecInContext({declaredType: value.$type, preferPropertyArray: false});

                  scope.dispose();

                  expect("_" in spec).toBe(false);
                });
              });

              describe("when keyArgs.preferPropertyArray: true", function() {

                it("should return an Array", function() {
                  var spec = value.toSpecInContext({declaredType: value.$type, preferPropertyArray: true});

                  scope.dispose();

                  expect(Array.isArray(spec)).toBe(true);
                });
              });
            });

            describe("= false", function() {

              describe("when keyArgs.preferPropertyArray: false", function() {

                it("should return a plain Object", function() {
                  var spec = value.toSpecInContext({
                    forceType: false,
                    declaredType: value.$type,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect(spec.constructor).toBe(Object);
                });

                it("should not include the type", function() {
                  var spec = value.toSpecInContext({
                    forceType: false,
                    declaredType: value.$type,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect("_" in spec).toBe(false);
                });
              });

              describe("when keyArgs.preferPropertyArray: true", function() {

                it("should return an Array", function() {
                  var spec = value.toSpecInContext({
                    forceType: false,
                    declaredType: value.$type,
                    preferPropertyArray: true
                  });

                  scope.dispose();

                  expect(Array.isArray(spec)).toBe(true);
                });
              });
            });

            describe("= true", function() {

              describe("when keyArgs.preferPropertyArray: false", function() {

                it("should return a plain Object", function() {
                  var spec = value.toSpecInContext({
                    forceType: true,
                    declaredType: value.$type,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect(spec.constructor).toBe(Object);
                });

                it("should include the type", function() {
                  var spec = value.toSpecInContext({
                    forceType: true,
                    declaredType: value.$type,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect("_" in spec).toBe(true);
                });
              });

              describe("when keyArgs.preferPropertyArray: true", function() {

                it("should return a plain Object", function() {
                  var spec = value.toSpecInContext({
                    forceType: true,
                    declaredType: value.$type,
                    preferPropertyArray: true
                  });

                  scope.dispose();

                  expect(spec.constructor).toBe(Object);
                });

                it("should include the type", function() {
                  var spec = value.toSpecInContext({
                    forceType: true,
                    declaredType: value.$type,
                    preferPropertyArray: true
                  });

                  scope.dispose();

                  expect("_" in spec).toBe(true);
                });
              });
            });
          });
        });

        describe("= ascendant.$type", function() {

          describe("when keyArgs.forceType", function() {

            describe("= unspecified", function() {

              describe("when keyArgs.preferPropertyArray: false", function() {

                it("should return a plain Object", function() {

                  var spec = value.toSpecInContext({
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect(spec.constructor).toBe(Object);
                });

                it("should include the type", function() {

                  var spec = value.toSpecInContext({
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect("_" in spec).toBe(true);
                });
              });

              describe("when keyArgs.preferPropertyArray: true", function() {

                it("should return a plain Object", function() {

                  var spec = value.toSpecInContext({
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect(spec.constructor).toBe(Object);
                });

                it("should include the type", function() {

                  var spec = value.toSpecInContext({
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect("_" in spec).toBe(true);
                });
              });
            });

            describe("= false", function() {

              describe("when keyArgs.preferPropertyArray: false", function() {

                it("should return a plain Object", function() {

                  var spec = value.toSpecInContext({
                    forceType: false,
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect(spec.constructor).toBe(Object);
                });

                it("should include the type", function() {

                  var spec = value.toSpecInContext({
                    forceType: false,
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect("_" in spec).toBe(true);
                });
              });

              describe("when keyArgs.preferPropertyArray: true", function() {

                it("should return a plain Object", function() {

                  var spec = value.toSpecInContext({
                    forceType: false,
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect(spec.constructor).toBe(Object);
                });

                it("should not include the type", function() {

                  var spec = value.toSpecInContext({
                    forceType: false,
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect("_" in spec).toBe(true);
                });
              });
            });

            describe("= true", function() {

              describe("when keyArgs.preferPropertyArray: false", function() {

                it("should return a plain Object", function() {
                  var spec = value.toSpecInContext({
                    forceType: true,
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect(spec.constructor).toBe(Object);
                });

                it("should include the type", function() {
                  var spec = value.toSpecInContext({
                    forceType: true,
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: false
                  });

                  scope.dispose();

                  expect("_" in spec).toBe(true);
                });
              });

              describe("when keyArgs.preferPropertyArray: true", function() {

                it("should return a plain Object", function() {
                  var spec = value.toSpecInContext({
                    forceType: true,
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: true
                  });

                  scope.dispose();

                  expect(spec.constructor).toBe(Object);
                });

                it("should include the type", function() {
                  var spec = value.toSpecInContext({
                    forceType: true,
                    declaredType: value.$type.ancestor,
                    preferPropertyArray: true
                  });

                  scope.dispose();

                  expect("_" in spec).toBe(true);
                });
              });
            });
          });
        });
      });

      describe("when calling properties values' #toSpecInContext", function() {

        it("should pass-through all options of `keyArgs`", function() {
          var keyArgs = {
            includeDefaults: true,
            foo:  {},
            bar:  {},
            dudu: {}
          };

          function expectProperty(name) {
            var v = value.get(name);
            if(v) {
              expect(v.toSpecInContext.calls.count()).toBe(1);

              var args = v.toSpecInContext.calls.first().args;

              var keyArgs2 = args[0];
              expect(keyArgs2).toEqual(jasmine.any(Object));

              expect(keyArgs2.foo).toBe(keyArgs.foo);
              expect(keyArgs2.bar).toBe(keyArgs.bar);
              expect(keyArgs2.dudu).toBe(keyArgs.dudu);
            }
          }

          Derived.type.each(function(pType) { spyProperty(pType.name); });

          value.toSpecInContext(keyArgs);

          scope.dispose();

          Derived.type.each(function(pType) { expectProperty(pType.name); });
        });

        it("should pass keyArgs.declaredType with the propertyType's value type", function() {
          var declaredType;

          function expectProperty(name) {
            var v = value.get(name);
            if(v) {
              expect(v.toSpecInContext.calls.count()).toBe(1);

              expect(declaredType).toBe(TestLevel1.type);
            }
          }

          spyProperty("anything", function(keyArgs) {
            declaredType = keyArgs.declaredType;
            return {};
          });

          value.toSpecInContext({});

          scope.dispose();

          expectProperty("anything");
        });

        it("should omit a property if its name is in keyArgs.omitProps with a true value", function() {
          var spec = value.toSpecInContext({omitProps: {type: true}});

          scope.dispose();

          expect("type" in spec).toBe(false);
        });

        it("should not omit a property if its name is in keyArgs.omitProps with a false value", function() {
          var spec = value.toSpecInContext({omitProps: {type: 0}});

          scope.dispose();

          expect("type" in spec).toBe(true);
        });

        it("should not omit a property if its name is in keyArgs.omitProps with a null value", function() {
          var spec = value.toSpecInContext({omitProps: {type: null}});

          scope.dispose();

          expect("type" in spec).toBe(true);
        });

        it("should omit a property if its value's toSpecInContext returns null", function() {
          spyProperty("type", function() { return null; });

          var spec = value.toSpecInContext({});

          scope.dispose();

          expect("type" in spec).toBe(false);
        });

        it("should include a property as null if its value's toSpecInContext " +
           "returns null and array form is used", function() {
          spyProperty("type", function() { return null; });

          var spec = value.toSpecInContext({preferPropertyArray: true});

          scope.dispose();

          expect(spec[1]).toBe(null);
        });

        it("should not include a property if its value's toSpecInContext returns null", function() {

          spyProperty("type", function() { return null; });

          var spec = value.toSpecInContext({includeDefaults: true});

          scope.dispose();

          expect("type" in spec).toBe(false);
        });
      });

      describe("when returning a complex in array form", function() {
        var spec;

        beforeEach(function() {
          spec = value.toSpecInContext({preferPropertyArray: true});
        });

        it("should have one entry for each of the complex type's properties", function() {
          scope.dispose();

          expect(spec.length).toBe(Derived.type.count);
        });

        it("should prefer nested complexes as arrays as well (when possible)", function() {
          scope.dispose();

          var index = Derived.type.get("sub").index;

          expect(spec[index] != null).toBe(true);
          expect(Array.isArray(spec[index])).toBe(true);
        });

        describe("keyArgs.includeDefaults", function() {

          describe(": false", function() {
            describe("non-list properties", function() {
              it("should return an array with nulls where the value is defaulted", function() {

                var spec = value.toSpecInContext({includeDefaults: false, preferPropertyArray: true});

                scope.dispose();

                expect(spec.length).toBe(Derived.type.count);

                Derived.type.each(function(pType, index) {
                  if(!pType.isList) {
                    if(value.isDefaultedOf(pType)) {
                      expect(spec[index]).toBe(null);
                    } else {
                      expect(spec[index]).not.toBe(null);
                    }
                  }
                });
              });
            });

            describe("list properties", function() {

              it("should return an empty array for an specified empty list " +
                  "that has an empty default value", function() {

                var spec = value.toSpecInContext({
                  preferPropertyArray: true,
                  includeDefaults: false
                });

                scope.dispose();

                // emptyListEmptyDefaultSpecified
                expect(spec[7]).toEqual([]);
              });

              it("should not return an empty array for an unspecified empty list " +
                  "that has an empty default value", function() {

                var spec = value.toSpecInContext({
                  preferPropertyArray: true,
                  includeDefaults: false
                });

                scope.dispose();

                // emptyListEmptyDefaultUnspecified
                expect(spec[11]).toBe(null);
              });

              it("should return an empty array for specified empty list that has non-empty default value", function() {

                var spec = value.toSpecInContext({
                  preferPropertyArray: true,
                  includeDefaults: false
                });

                scope.dispose();

                expect(spec[8]).toEqual([]);
              });

              it("should serialize a non-empty list", function() {

                var spec = value.toSpecInContext({
                  preferPropertyArray: true,
                  includeDefaults: false
                });

                scope.dispose();

                expect(spec[9]).toEqual([1, 2, 3]);
              });
            });
          });

          describe(": true", function() {

            it("should return an array with entries for all complex type's properties, " +
               "some with the default values", function() {

              var spec = value.toSpecInContext({includeDefaults: true, preferPropertyArray: true});

              scope.dispose();

              expect(spec.length).toBe(Derived.type.count);
            });

            describe("list properties", function() {
              it("should return an empty array for an empty list that has an empty default value", function() {
                var spec = value.toSpecInContext({preferPropertyArray: true, includeDefaults: true});

                scope.dispose();

                expect(spec[7]).toEqual([]);
              });

              it("should return an empty array for an empty list that has non-empty default value", function() {
                var spec = value.toSpecInContext({preferPropertyArray: true, includeDefaults: true});

                scope.dispose();

                expect(spec[8]).toEqual([]);
              });

              it("should serialize a non-empty list", function() {
                var spec = value.toSpecInContext({preferPropertyArray: true, includeDefaults: true});

                scope.dispose();

                expect(spec[9]).toEqual([1, 2, 3]);
              });
            });
          });
        });
      });

      describe("when returning a complex in object form", function() {

        it("should return nested complexes in object form as well", function() {
          var spec = value.toSpecInContext({preferPropertyArray: false});

          scope.dispose();

          expect(spec.anything != null).toBe(true);
          expect(spec.anything.constructor).toBe(Object);
        });

        describe("keyArgs.includeDefaults", function() {

          describe(": false", function() {
            describe("non-list properties", function() {
              it("should return a plain object with properties only for each of " +
                 "the non-default-valued complex type's properties", function() {

                var spec = value.toSpecInContext({includeDefaults: false, preferPropertyArray: false});

                scope.dispose();

                Derived.type.each(function(pType) {
                  if(!pType.isList) {
                    if(value.isDefaultedOf(pType)) {
                      expect(pType.name in spec).toBe(false);
                    } else {
                      expect(pType.name in spec).toBe(true);
                    }
                  }
                });
              });
            });

            describe("list properties", function() {
              it("should return an empty array for a property specified as an empty list and " +
                  "that has an empty default value", function() {

                var spec = value.toSpecInContext({preferPropertyArray: false, includeDefaults: false});

                scope.dispose();

                expect("emptyListEmptyDefaultSpecified" in spec).toBe(true);
              });

              it("should not return an empty array for a property defaulted to an empty list and " +
                  "that has an empty default value", function() {

                var spec = value.toSpecInContext({preferPropertyArray: false, includeDefaults: false});

                scope.dispose();

                expect("emptyListEmptyDefaultUnspecified" in spec).toBe(false);
              });

              it("should return an empty array for a property specified as an empty list " +
                  "that has non-empty default value", function() {
                var spec = value.toSpecInContext({preferPropertyArray: false, includeDefaults: false});

                scope.dispose();

                expect("emptyListWithDefaultSpecified" in spec).toBe(true);
                expect(spec.emptyListWithDefaultSpecified).toEqual([]);
              });

              it("should serialize a non-empty list", function() {
                var spec = value.toSpecInContext({preferPropertyArray: false, includeDefaults: false});

                scope.dispose();

                expect("nonEmptyList" in spec).toBe(true);
                expect(spec.nonEmptyList).toEqual([1, 2, 3]);
              });
            });
          });

          describe(": true", function() {

            it("should return a plain object with properties for all complex type's properties, " +
               "even those with default values", function() {

              var spec = value.toSpecInContext({includeDefaults: true, preferPropertyArray: false});

              scope.dispose();

              Derived.type.each(function(pType) {
                expect(pType.name in spec).toBe(true);
              });
            });

            describe("list properties", function() {

              it("should return an empty array for a property specified as an empty list " +
                  "that has an empty default value", function() {
                var spec = value.toSpecInContext({preferPropertyArray: false, includeDefaults: true});

                scope.dispose();

                expect("emptyListEmptyDefaultSpecified" in spec).toBe(true);
                expect(spec.emptyListEmptyDefaultSpecified).toEqual([]);
              });

              it("should return an empty array for an empty list that has non-empty default value", function() {
                var spec = value.toSpecInContext({preferPropertyArray: false, includeDefaults: true});

                scope.dispose();

                expect("emptyListWithDefaultSpecified" in spec).toBe(true);
                expect(spec.emptyListWithDefaultSpecified).toEqual([]);
              });

              it("should serialize a non-empty list", function() {
                var spec = value.toSpecInContext({preferPropertyArray: false, includeDefaults: true});

                scope.dispose();

                expect("nonEmptyList" in spec).toBe(true);
                expect(spec.nonEmptyList).toEqual([1, 2, 3]);
              });
            });
          });
        });
      });
    }); // toSpecInContext
  });
});
