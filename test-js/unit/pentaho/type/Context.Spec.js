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
  "pentaho/type/standard",
  "tests/test-utils"
], function(standard, testUtils) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, Promise:false, spyOn:false*/

  // Use alternate, promise-aware version of `it`.
  var it = testUtils.itAsync;
  var expectToRejectWith = testUtils.expectToRejectWith;

  describe("pentaho.type.Context -", function() {

    it("is a function", function() {

      return require.using(["pentaho/type/Context"], function(Context) {
        expect(typeof Context).toBe("function");
      });
    });

    describe("new Context([contextVars]) -", function() {

      it("should return a context instance", function() {

        return require.using(["pentaho/type/Context"], function(Context) {
          var context = new Context();
          expect(context instanceof Context).toBe(true);
        });
      });

      it("should create a context that has a ContextVars in #vars", function() {

        return require.using(["pentaho/type/Context"], function(Context) {
          var context = new Context();
          expect(context.vars instanceof Object).toBe(true);
        });
      });

      it("should create a context that has a GlobalContextVars by default", function() {

        return require.using(["pentaho/type/Context", "pentaho/GlobalContextVars"],
        function(Context, GlobalContextVars) {
          var context = new Context();
          expect(context.vars instanceof GlobalContextVars).toBe(true);
        });
      });

      it("should respect a given contextVars instance", function() {

        return require.using(["pentaho/type/Context", "pentaho/GlobalContextVars"],
        function(Context, GlobalContextVars) {
          var vars = new GlobalContextVars();
          var context = new Context(vars);
          expect(context.vars).toBe(vars);
        });
      });
    });

    describe("#get|getAsync(type)", function() {

      //region get test helpers
      /**
       * Each of the following tests is performed both synchronously and asynchronously
       * using a single tester function.
       *
       * A test that should succeed uses testGet.
       * A test that should fail uses testGet and expectToRejectWith.
       */

      /**
       * Creates an async test function suitable for `it`.
       *
       * Receives a _get-test_ function, `tester`, that is called in two modes: sync and async.
       *
       * The `tester` function has the signature `function(sync, Context) : ?Promise`.
       *
       * The `tester` function should use `callGet(context, sync, spec)` to actually call the
       * corresponding get method, sync or async, while providing the test's specific spec argument.
       *
       * If the `tester` function returns a promise, it is resolved and expected to succeed.
       */

      function testGet(getTester) {

        return testUtils.modal([true, false], function(sync) {
          return require.using(
              ["pentaho/type/Context", "require", "tests/pentaho/util/errorMatch"],
              getTester.bind(null, sync));
        });
      }

      /**
       * Calls the get or getAsync method depending on the `sync` argument value.
       */
      function callGet(context, sync, spec) {
        var result = context[sync ? "get" : "getAsync"](spec);

        if(sync) {
          if(result) expect(result instanceof Promise).toBe(false);
        } else {
          expect(result instanceof Promise).toBe(true);
        }

        return Promise.resolve(result);
      }
      //endregion

      it("should have preloaded standard primitive types and facets", function() {

        return require.using(["require", "pentaho/type/Context"], function(localRequire, Context) {
          var context = new Context();
          var p;

          for(p in standard)
            if(standard.hasOwnProperty(p))
              if(p !== "facets" && p !== "Instance")
                expect(!!context.get("pentaho/type/" + p)).toBe(true);

          for(p in standard.facets)
            if(standard.facets.hasOwnProperty(p))
              localRequire("pentaho/type/facets/" + p);
        });
      });

      describe("by id", function() {

        it("should be able to get a standard type given its relative id", function() {

          return testGet(function(sync, Context) {
            var context = new Context();
            var promise = callGet(context, sync, "string");

            return promise.then(function(InstCtor) {
              expect(InstCtor.type.id).toBe("pentaho/type/string");
            });
          });
        });

        it("should be able to get a standard type given its absolute id", function() {

          return testGet(function(sync, Context) {
            var context = new Context();
            var promise = callGet(context, sync, "pentaho/type/string");

            return promise.then(function(InstCtor) {
              expect(InstCtor.type.id).toBe("pentaho/type/string");
            });
          });
        });

        it("should be able to get an already loaded non-standard type given its absolute id", function() {

          return testGet(function(sync, Context, localRequire) {

            var mid = "pentaho/foo/bar";

            localRequire.define(mid,[], function() {
              return function(context) {
                var Simple = context.get("pentaho/type/simple");
                return Simple.extend({type: {id: mid}});
              };
            });

            return localRequire.promise([mid])
                .then(function() {
                  var context = new Context();
                  return callGet(context, sync, mid);
                })
                .then(function(InstCtor) {
                  expect(InstCtor.type.id).toBe(mid);
                });
          });
        });
      });

      describe("by type factory function", function() {

        it("should be able to get a standard type", function() {

          return testGet(function(sync, Context, localRequire) {
            var context = new Context();
            var valueFactory = localRequire("pentaho/type/value");
            var promise = callGet(context, sync, valueFactory);

            return promise.then(function(InstCtor) {
              expect(InstCtor.type.id).toBe("pentaho/type/value");
            });
          });
        });
      });

      describe("by type instance constructor (Instance)", function() {

        it("should be able to get a standard type", function() {

          return testGet(function(sync, Context) {
            var context = new Context();
            var Value   = context.get("pentaho/type/value");
            var promise = callGet(context, sync, Value);

            return promise.then(function(InstCtor) {
              expect(InstCtor.type.id).toBe("pentaho/type/value");
            });
          });
        });

        it("should configure a type", function() {

          return testGet(function(sync, Context) {
            // "value" is configured on the Context constructor, so need to wire the prototype...

            spyOn(Context.prototype, "_getConfig").and.callFake(function(id) {
              if(id === "pentaho/type/value") {
                return {foo: "bar", instance: {bar: "foo"}};
              }
            });

            var context = new Context();

            var promise = callGet(context, sync, "pentaho/type/value");

            return promise.then(function(InstCtor) {
              expect(Context.prototype._getConfig).toHaveBeenCalledWith("pentaho/type/value");

              expect(InstCtor.prototype.bar).toBe("foo");
              expect(InstCtor.type.foo).toBe("bar");
            });
          });
        });
      });

      describe("by type object", function() {

        it("should be able to get a standard type given its type object", function() {

          return testGet(function(sync, Context) {
            var context = new Context();
            var Value   = context.get("pentaho/type/value");
            var promise = callGet(context, sync, Value.type);

            return promise.then(function(InstCtor) {
              expect(InstCtor.type.id).toBe("pentaho/type/value");
            });
          });
        });
      });

      describe("by others, invalid", function() {

        it("should throw/reject when given the type-constructor (Type)", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {

            var context = new Context();
            var Value   = context.get("pentaho/type/value");

            return expectToRejectWith(
                function() { return callGet(context, sync, Value.type.constructor); },
                errorMatch.argInvalid("typeRef"));
          });
        });

        it("should throw/reject when given null", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {
            var context = new Context();

            return expectToRejectWith(
                function() { return callGet(context, sync, null); },
                errorMatch.argRequired("typeRef"));
          });
        });

        it("should throw/reject when given undefined", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {
            var context = new Context();

            return expectToRejectWith(
                function() { return callGet(context, sync, undefined); },
                errorMatch.argRequired("typeRef"));
          });
        });

        it("should throw/reject when given an empty string", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {
            var context = new Context();

            return expectToRejectWith(
                function() {
                  return callGet(context, sync, "");
                },
                errorMatch.argRequired("typeRef"));
          });
        });

        it("should throw/reject when given a standard type instance prototype", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {
            var context = new Context();
            var Value   = context.get("pentaho/type/value");

            return expectToRejectWith(
                function() { return callGet(context, sync, Value.prototype); },
                errorMatch.argInvalid("typeRef"));
          });
        });

        it("should throw/reject if given a number (not a string, function or object)", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {
            var context = new Context();

            return expectToRejectWith(
                function() { return callGet(context, sync, 1); },
                errorMatch.argInvalid("typeRef"));
          });
        });

        it("should throw/reject if given a boolean (not a string, function or object)", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {
            var context = new Context();

            return expectToRejectWith(
                function() { return callGet(context, sync, true); },
                errorMatch.argInvalid("typeRef"));
          });
        });
      });

      describe("by generic or specialized type specification syntax", function() {
        // Generic type specification syntax:
        // {id: "foo", base: "complex", ...}

        describe("`base` and `id`", function() {

          describe("when `base` is not specified", function() {

            it("should default `base` to `null` when `id` is 'value'", function() {

              return testGet(function(sync, Context) {
                var context = new Context();
                var promise = callGet(context, sync, {id: 'value'});

                return promise.then(function(InstCtor) {
                  var Value = context.get("pentaho/type/value");

                  expect(InstCtor).toBe(Value);
                });
              });
            });

            it("should default `base` to 'complex' when `id` is not specified", function() {

              return testGet(function(sync, Context) {
                var context = new Context();
                var promise = callGet(context, sync, {props: ["a", "b"]});

                return promise.then(function(InstCtor) {
                  var Complex = context.get("pentaho/type/complex");

                  expect(InstCtor.type.isSubtypeOf(Complex.type)).toBe(true);

                  expect(InstCtor.ancestor).toBe(Complex);
                  expect(InstCtor.type.has("a")).toBe(true);
                  expect(InstCtor.type.has("b")).toBe(true);
                });
              });
            });
          });

          describe("when `base` is `undefined`", function() {

            it("should default `base` to 'complex'", function() {

              return testGet(function(sync, Context) {
                var context = new Context();
                var promise = callGet(context, sync, {base: undefined, props: ["a", "b"]});

                return promise.then(function(InstCtor) {
                  var Complex = context.get("pentaho/type/complex");

                  expect(InstCtor.type.isSubtypeOf(Complex.type)).toBe(true);

                  expect(InstCtor.ancestor).toBe(Complex);
                  expect(InstCtor.type.has("a")).toBe(true);
                  expect(InstCtor.type.has("b")).toBe(true);
                });
              });
            });
          });

          describe("when `base` is `null`", function() {

            it("should default `base` to 'complex'", function() {

              return testGet(function(sync, Context) {
                var context = new Context();
                var promise = callGet(context, sync, {base: null, props: ["a", "b"]});

                return promise.then(function(InstCtor) {
                  var Complex = context.get("pentaho/type/complex");

                  expect(InstCtor.type.isSubtypeOf(Complex.type)).toBe(true);

                  expect(InstCtor.ancestor).toBe(Complex);
                  expect(InstCtor.type.has("a")).toBe(true);
                  expect(InstCtor.type.has("b")).toBe(true);
                });
              });
            });
          });
        });

        //region complex
        it("should be able to create an anonymous complex type with base complex", function() {

          return testGet(function(sync, Context) {
            var context = new Context();
            var promise = callGet(context, sync, {base: "complex", props: ["a", "b"]});

            return promise.then(function(InstCtor) {
              var Complex = context.get("pentaho/type/complex");

              expect(InstCtor.type.isSubtypeOf(Complex.type)).toBe(true);

              expect(InstCtor.ancestor).toBe(Complex);
              expect(InstCtor.type.has("a")).toBe(true);
              expect(InstCtor.type.has("b")).toBe(true);
            });
          });
        });
        //endregion

        //region list
        it("should be able to create a list type using generic notation", function() {

          return testGet(function(sync, Context) {
            var context = new Context();
            var promise = callGet(context, sync, {
                base: "list",
                of:   {props: ["a", "b"]}
              });

            return promise.then(function(InstCtor) {
              expect(InstCtor.prototype instanceof context.get("list")).toBe(true);

              var ofType = InstCtor.type.of;
              expect(ofType.instance instanceof context.get("complex")).toBe(true);
              expect(ofType.count).toBe(2);
              expect(ofType.has("a")).toBe(true);
              expect(ofType.has("b")).toBe(true);
            });
          });
        });

        it("should be able to create a list type using the shorthand list-type notation", function() {

          return testGet(function(sync, Context) {
            var context = new Context();
            var promise = callGet(context, sync, [
              {props: ["a", "b"]}
            ]);

            return promise.then(function(InstCtor) {
              expect(InstCtor.prototype instanceof context.get("list")).toBe(true);

              var ofType = InstCtor.type.of;
              expect(ofType.instance instanceof context.get("complex")).toBe(true);
              expect(ofType.count).toBe(2);
              expect(ofType.has("a")).toBe(true);
              expect(ofType.has("b")).toBe(true);
            });
          });
        });

        it("should throw/reject if the shorthand list-type notation has two entries", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {
            var context = new Context();

            return expectToRejectWith(
                function() { return callGet(context, sync, [123, 234]); },
                errorMatch.argInvalid("typeRef"));
          });
        });
        //endregion

        //region refinement
        it("should be able to create a refinement type using generic notation", function() {

          return testGet(function(sync, Context) {
            var context = new Context();
            var promise = callGet(context, sync, {
              base: "refinement",
              of:   "number"
            });

            return promise.then(function(InstCtor) {
              var Refinement = context.get("refinement");
              expect(InstCtor.type.isSubtypeOf(Refinement.type)).toBe(true);

              expect(InstCtor.ancestor).toBe(Refinement);
            });
          });
        });
        //endregion

        //region temporary ids
        it("should allow creating a type that contains a temporary type id", function() {

          return testGet(function(sync, Context) {
            var typeSpec = {
              props: [
                {name: "a", type: {id: "_:ab1", base: "number", label: "My Number"}},
                {name: "b", type: "_:ab1"}
              ]
            };
            var context = new Context();
            var promise = callGet(context, sync, typeSpec);

            return promise.then(function(InstCtor) {
              var type = InstCtor.type;
              var myNumberType = type.get("a").type;

              expect(myNumberType.ancestor.shortId).toBe("number");
              expect(myNumberType.label).toBe("My Number");

              expect(type.get("b").type).toBe(myNumberType);
            });
          });
        });

        it("should use the same type instance for all temporary type id references", function() {

          return testGet(function(sync, Context) {
            var typeSpec = {
              props: [
                {name: "a", type: {id: "_:1", base: "number", label: "My Number"}},
                {name: "b", type: "_:1"}
              ]
            };
            var context = new Context();
            var promise = callGet(context, sync, typeSpec);

            return promise.then(function(InstCtor) {
              var type = InstCtor.type;

              expect(type.get("a").type).toBe(type.get("b").type);
            });
          });
        });

        // coverage
        // although, because we do not yet support recursive types, this is not useful
        it("should allow a top-level temporary type id", function() {

          return testGet(function(sync, Context) {
            var typeSpec = {
              id: "_:1",
              props: [
                {name: "a", type: "string"},
                {name: "b", type: "string"}
              ]
            };
            var context = new Context();

            return callGet(context, sync, typeSpec);
          });
        });

        it("should allow two generic type specifications with the same temporary id " +
           "but only the second spec is ignored", function() {

          return testGet(function(sync, Context) {
            var typeSpec = {
              props: [
                {name: "a", type: {id: "_:1", base: "string"}},
                {name: "b", type: {id: "_:1", base: "number"}}
              ]
            };
            var context = new Context();

            var promise = callGet(context, sync, typeSpec);

            return promise.then(function(InstCtor) {
              var type = InstCtor.type;

              expect(type.get("a").type).toBe(type.get("b").type);

              expect(type.get("a").type.ancestor.shortId).toBe("string");
            });
          });
        });

        it("should throw if trying to get a temporary id, directly, " +
           "and there is no ambient specification context", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {
            var context = new Context();

            return expectToRejectWith(
                function() { return callGet(context, sync, "_:1"); },
                errorMatch.argInvalid("typeRef"));
          });
        });

        // The async case is not testable.
        it("should throw if trying to get a temporary id, directly, and it does not exist " +
           "in the ambient specification context", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/SpecificationScope",
            "tests/pentaho/util/errorMatch"
          ], function(Context, SpecificationScope, errorMatch) {

            var context = new Context();
            var scope = new SpecificationScope();

            expect(function() {
              context.get("_:1");
            }).toThrow(errorMatch.argInvalid("typeRef"));

            scope.dispose();
          });
        });

        //endregion
      });

      describe("type factory function", function() {

        it("should throw if it does not return a function", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {
            var mid = "pentaho/foo/bar2";

            localRequire.define(mid,[], function() {
              return function(context) {
                return "not a function";
              };
            });

            return localRequire.promise([mid])
                .then(function() {
                  var context = new Context();
                  return callGet(context, sync, mid);
                })
                .then(function() {
                  expect("to throw").toBe(true);
                }, function(ex) {
                  expect(ex).toEqual(errorMatch.operInvalid());
                });
          });
        });

        it("should throw if it does return a function that is not an Instance", function() {

          return testGet(function(sync, Context, localRequire, errorMatch) {
            var mid = "pentaho/foo/bar2";

            localRequire.define(mid,[], function() {
              return function(context) {
                return function(){};
              };
            });

            return localRequire.promise([mid])
                .then(function() {
                  var context = new Context();
                  return callGet(context, sync, mid);
                })
                .then(function() {
                  expect("to throw").toBe(true);
                }, function(ex) {
                  expect(ex).toEqual(errorMatch.operInvalid());
                });
          });
        });
      });

      it("should collect non-standard type ids in getAsync", function() {

        return require.using(["require", "pentaho/type/Context"], function(localRequire, Context) {

          function defineTempModule(mid) {
            localRequire.define(mid, [], function() {
              return function(context) {
                return context.get("pentaho/type/simple").extend({type: {id: mid}});
              };
            });
          }

          function defineTempFacet(mid) {
            localRequire.define(mid, ["pentaho/type/facets/Refinement"], function(Refinement) {
              return Refinement.extend(null, {id: mid});
            });
          }

          function defineTempProp(mid) {
            localRequire.define(mid, [], function() {
              return function(context) {
                return context.get("pentaho/type/property").extend({type: {id: mid}});
              };
            });
          }

          defineTempModule("pentaho/foo/dudu1");
          defineTempModule("pentaho/foo/dudu2");
          defineTempModule("pentaho/foo/dudu3");
          defineTempModule("pentaho/foo/dudu4");
          defineTempFacet("pentaho/foo/facets/Mixin1");
          defineTempFacet("pentaho/foo/facets/Mixin2");
          defineTempFacet("pentaho/foo/facets/Mixin3");
          defineTempProp("pentaho/foo/prop1");

          // -----

          var context = new Context();
          var RefinementMixin2 = localRequire("pentaho/type/facets/Refinement").extend(null, {id: "my/facets/foo"});
          var spec = {
            base: "complex",
            props: [
              {name: "foo1", type: "pentaho/foo/dudu1"},
              {name: "foo2", type: {base: "pentaho/foo/dudu2"}},
              {name: "foo3", type: {base: "list", of: "pentaho/foo/dudu3"}},
              {name: "foo4", type: ["pentaho/foo/dudu3"]},
              //{name: "foo5", type: ["string"]},
              {name: "foo6", type: {
                base: "refinement",
                of: "pentaho/foo/dudu3",
                facets: [
                  "pentaho/foo/facets/Mixin1",
                  "pentaho/foo/facets/Mixin2",
                  "DiscreteDomain",
                  RefinementMixin2
                ]
              }},
              {name: "foo7", type: {props: {
                a: {type: "pentaho/foo/dudu4"},
                b: {type: "pentaho/foo/dudu3"}
              }}},
              {name: "foo8", type: {
                base: "refinement",
                of: "string",
                facets: "pentaho/foo/facets/Mixin3"
              }},
              {name: "foo9", base: "pentaho/foo/prop1", type: "string"}
            ]
          };

          return context.getAsync(spec)
              .then(function(InstCtor) {
                expect(InstCtor.type.get("foo1").type.id).toBe("pentaho/foo/dudu1");
                expect(InstCtor.type.get("foo2").type.ancestor.id).toBe("pentaho/foo/dudu2");
                expect(InstCtor.type.get("foo3").type.of.id).toBe("pentaho/foo/dudu3");
                expect(InstCtor.type.get("foo7").type.get("a").type.id).toBe("pentaho/foo/dudu4");
                expect(InstCtor.type.get("foo8").type.facets[0]).toBe(localRequire("pentaho/foo/facets/Mixin3"));
                expect(InstCtor.type.get("foo9").isSubtypeOf(context.get("pentaho/foo/prop1").type)).toBe(true);
              });
        });
      });

      // should throw when sync and the requested module is not defined
      // should throw when sync and the requested module is not yet loaded
      // should not throw when async and the requested module is not defined
      // should not throw when async and the requested module is not yet loaded
    }); // #get|getAsync

    describe("#getAllAsync(baseTypeId, ka)", function() {

      function configRequire(localRequire) {
        // Reset current service configuration
        localRequire.config({
          config: {"pentaho/service": null}
        });

        // ---

        localRequire.define("exp/foo", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({type: {id: "exp/foo"}});
          };
        });

        // ---

        localRequire.define("exp/bar", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({type: {id: "exp/bar", isBrowsable: false}});
          };
        });

        // ---

        localRequire.define("exp/dude", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({type: {id: "exp/dude"}});
          };
        });

        // ---

        localRequire.config({
          config: {
            "pentaho/service": {
              "exp/foo": "exp/thing",
              "exp/bar": "exp/thing",
              "exp/dude": "pentaho/type/value"
            }
          }
        });
      }

      it("should return a promise", function() {

        return require.using(["require", "pentaho/type/Context"], configRequire, function(localRequire, Context) {

          var context = new Context();
          var p = context.getAllAsync();
          expect(p instanceof Promise).toBe(true);
        });
      });

      it("should return all registered Types under 'pentaho/type/value' by default", function() {

        return require.using(["require", "pentaho/type/Context"], configRequire, function(localRequire, Context) {

          var context = new Context();

          return context
              .getAllAsync()
              .then(function(InstCtors) {
                expect(InstCtors instanceof Array).toBe(true);
                expect(InstCtors.length).toBe(1);
                expect(InstCtors[0].type.id).toBe("exp/dude");
              });
        });
      });

      it("should return an empty array when the specified baseType has no registrations", function() {

        return require.using(["require", "pentaho/type/Context"], configRequire, function(localRequire, Context) {

          var context = new Context();

          return context
              .getAllAsync("abcdefgh")
              .then(function(InstCtors) {
                expect(InstCtors instanceof Array).toBe(true);
                expect(InstCtors.length).toBe(0);
              });
        });
      });

      it("should return all registered Types under a given base type id", function() {

        return require.using(["require", "pentaho/type/Context"], configRequire, function(localRequire, Context) {

          var context  = new Context();

          return context
              .getAllAsync("exp/thing")
              .then(function(InstCtors) {
                expect(InstCtors instanceof Array).toBe(true);
                expect(InstCtors.length).toBe(2);

                var typeIds = InstCtors.map(function(InstCtor) { return InstCtor.type.id; });
                var iFoo = typeIds.indexOf("exp/foo");
                var iBar = typeIds.indexOf("exp/bar");
                expect(iFoo).not.toBeLessThan(0);
                expect(iBar).not.toBeLessThan(0);
                expect(iFoo).not.toBe(iBar);
              });
        });
      });

      it("should return all registered Types that satisfy the isBrowsable filter", function() {

        return require.using(["require", "pentaho/type/Context"], configRequire, function(localRequire, Context) {

          var context  = new Context();

          return context
              .getAllAsync("exp/thing", {"isBrowsable": true})
              .then(function(InstCtors) {
                expect(InstCtors instanceof Array).toBe(true);
                expect(InstCtors.length).toBe(1);
                expect(InstCtors[0].type.id).toBe("exp/foo");
              });
        });
      });
    }); // #getAllAsync
  }); // pentaho.type.Context
});
