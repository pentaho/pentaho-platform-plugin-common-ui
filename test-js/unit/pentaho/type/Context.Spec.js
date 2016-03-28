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

// Must be executed out of strict scope
var __global__ = this;

define([
  "pentaho/type/standard",
  "tests/pentaho/util/errorMatch",
  "pentaho/util/promise"
], function(standard, errorMatch, promiseUtil) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, Promise:false*/

  // These should really be writable, i.e. globalVar: true
  /*global SESSION_NAME:true, active_theme:true, SESSION_LOCALE:true */

  // NOTE: can only be used with `it`; does not work in `describe`.
  function withContext(testFun) {
    var localRequire = require.new();

    return function(done) {

      // load fresh Context class
      localRequire(["pentaho/type/Context", "tests/pentaho/util/errorMatch"], function(Context, errorMatch) {
        try {
          var promise = testFun(Context, localRequire, errorMatch);
          if(!promise) {
            done();
            localRequire.dispose();
          } else {
            promise.then(function() {
              done();
              localRequire.dispose();
            }, function(ex) {
              done.fail(ex);
              localRequire.dispose();
            });
          }
        } catch(ex) {
          done.fail(ex);
          localRequire.dispose();
        }
      }, function(ex) {
        done.fail(ex);
        localRequire.dispose();
      });
    };
  }

  describe("pentaho.type.Context -", function() {

    it("is a function", withContext(function(Context) {
      expect(typeof Context).toBe("function");
    }));

    describe("new Context(spec) -", function() {

      it("should return a context instance", withContext(function(Context) {
        var context = new Context();
        expect(context instanceof Context).toBe(true);
      }));

      describe("container -", function() {
        it("should have a null value when unspecified and there is no current one", withContext(function(Context) {
          var context = new Context();
          expect(context.container).toBe(null);
        }));

        it("should have a null value when specified empty", withContext(function(Context) {
          var context = new Context({container: ""});
          expect(context.container).toBe(null);
        }));

        it("should respect a specified non-empty value", withContext(function(Context) {
          var context = new Context({container: "FOO"});
          expect(context.container).toBe("FOO");
        }));
      });

      describe("user -", function() {
        var _SESSION_NAME;

        beforeEach(function() {
          _SESSION_NAME = __global__.SESSION_NAME;
          __global__.SESSION_NAME = undefined;
        });

        afterEach(function() {
          __global__.SESSION_NAME = _SESSION_NAME;
        });

        it("should have a null value when unspecified and there is no current one", withContext(function(Context) {
          var context = new Context();
          expect(context.user).toBe(null);
        }));

        it("should have a null value when specified empty", withContext(function(Context) {
          var context = new Context({user: ""});
          expect(context.user).toBe(null);
        }));

        it("should respect a specified non-empty value", withContext(function(Context) {
          var context = new Context({user: "FOO"});
          expect(context.user).toBe("FOO");
        }));

        it("should default to the existing current one", withContext(function(Context) {
          __global__.SESSION_NAME = "ABC";
          var context = new Context();
          expect(context.user).toBe("ABC");
        }));
      });

      describe("theme -", function() {
        var _active_theme;
        beforeEach(function() {
          _active_theme = __global__.active_theme;
          __global__.active_theme = undefined;
        });

        afterEach(function() {
          __global__.active_theme = _active_theme;
        });

        it("should have a null value when unspecified and there is no current one", withContext(function(Context) {
          var context = new Context();
          expect(context.theme).toBe(null);
        }));

        it("should have a null value when specified empty", withContext(function(Context) {
          var context = new Context({theme: ""});
          expect(context.theme).toBe(null);
        }));

        it("should respect a specified non-empty value", withContext(function(Context) {
          var context = new Context({theme: "FOO"});
          expect(context.theme).toBe("FOO");
        }));

        it("should default to the existing current one", withContext(function(Context) {
          __global__.active_theme = "ABC";
          var context = new Context();
          expect(context.theme).toBe("ABC");
        }));
      });

      describe("locale -", function() {
        var _SESSION_LOCALE;
        beforeEach(function() {
          _SESSION_LOCALE = __global__.SESSION_LOCALE;
          __global__.SESSION_LOCALE = undefined;
        });

        afterEach(function() {
          SESSION_LOCALE = _SESSION_LOCALE;
        });

        it("should have a null value when unspecified and there is no current one", withContext(function(Context) {
          var context = new Context();
          expect(context.locale).toBe(null);
        }));

        it("should have a null value when specified empty", withContext(function(Context) {
          var context = new Context({locale: ""});
          expect(context.locale).toBe(null);
        }));

        it("should respect a specified non-empty value", withContext(function(Context) {
          var context = new Context({locale: "FOO"});
          expect(context.locale).toBe("FOO");
        }));

        it("should default to the existing current one", withContext(function(Context) {
          __global__.SESSION_LOCALE = "ABC";
          var context = new Context();
          expect(context.locale).toBe("ABC");
        }));
      });
    });

    describe("#get|getAsync(type)", function() {

      /**
       * Each of the following tests is performed both synchronously and asynchronously
       * using a single tester function.
       *
       * A test that should succeed uses testGet.
       * A test that should fail uses testGetError.
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
      function testGet(tester) {

        return function testStub(overallDone) {

          var syncDone = function() {
            // Test async
            withContext(tester.bind(null, false))(overallDone);
          };

          syncDone.fail = overallDone.fail;

          withContext(tester.bind(null, true))(syncDone);
        };
      }

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
       * When async, the `tester` function should return a promise that should be rejected.
       * When sync, the `tester` is expected to throw...
       *
       * In both cases, the error should be `exExpected`.
       */
      function testGetError(tester, funCreateExpectedError) {

        return function testStub(overallDone) {

          var syncDone = function() {
            // Async test
            withContext(function(Context, localRequire, errorMatch) {

              var promise = tester(false, Context, localRequire);
              expect(promise instanceof Promise);
              return promise
                  .then(overallDone.fail, function(ex) {
                    expect(ex).toEqual(funCreateExpectedError(errorMatch));
                  });

            })(overallDone);
          };

          syncDone.fail = overallDone.fail;

          // Sync test
          withContext(function(Context, localRequire, errorMatch) {

            expect(function() {
              tester(true, Context, localRequire);
            }).toThrow(funCreateExpectedError(errorMatch));

          })(syncDone);
        };
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

      // ---

      it("should have preloaded standard primitive types and facets", withContext(function(Context, localRequire) {
        var context = new Context();
        var p;

        for(p in standard)
          if(standard.hasOwnProperty(p))
            if(p !== "facets" && p !== "Instance")
              expect(!!context.get("pentaho/type/" + p)).toBe(true);

        for(p in standard.facets)
          if(standard.facets.hasOwnProperty(p))
            localRequire("pentaho/type/facets/" + p);
      }));

      it("should be able to get a standard type given its relative id", testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, "string");

        return promise.then(function(InstCtor) {
          expect(InstCtor.type.id).toBe("pentaho/type/string");
        });
      }));

      it("should be able to get a standard type given its absolute id", testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, "pentaho/type/string");

        return promise.then(function(InstCtor) {
          expect(InstCtor.type.id).toBe("pentaho/type/string");
        });
      }));

      it("should be able to get a standard type given its factory function",
      testGet(function(sync, Context, localRequire) {
        var context = new Context();
        var valueFactory = localRequire("pentaho/type/value");
        var promise = callGet(context, sync, valueFactory);

        return promise.then(function(InstCtor) {
          expect(InstCtor.type.id).toBe("pentaho/type/value");
        });
      }));

      it("should throw/reject when given a type constructor (Type)", testGetError(function(sync, Context) {
        var context = new Context();
        var Value   = context.get("pentaho/type/value");
        return callGet(context, sync, Value.type.constructor);
      }, function(errorMatch) { return errorMatch.argInvalid("typeRef"); }));

      it("should throw/reject when given null", testGetError(function(sync, Context) {
        var context = new Context();
        return callGet(context, sync, null);
      }, function(errorMatch) { return errorMatch.argRequired("typeRef"); }));

      it("should throw/reject when given undefined", testGetError(function(sync, Context) {
        var context = new Context();
        return callGet(context, sync, undefined);
      }, function(errorMatch) { return errorMatch.argRequired("typeRef"); }));

      it("should throw/reject when given an empty string", testGetError(function(sync, Context) {
        var context = new Context();
        return callGet(context, sync, "");
      }, function(errorMatch) { return errorMatch.argRequired("typeRef"); }));

      it("should be able to get a standard type given its type instance constructor",
      testGet(function(sync, Context) {
        var context = new Context();
        var Value   = context.get("pentaho/type/value");
        var promise = callGet(context, sync, Value);

        return promise.then(function(InstCtor) {
          expect(InstCtor.type.id).toBe("pentaho/type/value");
        });
      }));

      it("should be able to get a standard type given its type object", testGet(function(sync, Context) {
        var context = new Context();
        var Value   = context.get("pentaho/type/value");
        var promise = callGet(context, sync, Value.type);

        return promise.then(function(InstCtor) {
          expect(InstCtor.type.id).toBe("pentaho/type/value");
        });
      }));

      it("should throw/reject when given a standard type instance prototype",
      testGetError(function(sync, Context) {
        var context = new Context();
        var Value   = context.get("pentaho/type/value");

        return callGet(context, sync, Value.prototype);
      }, function(errorMatch) { return errorMatch.argInvalid("typeRef"); }));

      it("should be able to create an anonymous complex type with base complex", testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, {base: "complex", props: ["a", "b"]});

        return promise.then(function(InstCtor) {
          var Complex = context.get("pentaho/type/complex");

          expect(InstCtor.type.isSubtypeOf(Complex.type)).toBe(true);

          expect(InstCtor.ancestor).toBe(Complex);
          expect(InstCtor.type.has("a")).toBe(true);
          expect(InstCtor.type.has("b")).toBe(true);
        });
      }));

      it("should be able to create an anonymous complex type with implied base complex",
      testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, {props: ["a", "b"]});

        return promise.then(function(InstCtor) {
          var Complex = context.get("pentaho/type/complex");

          expect(InstCtor.type.isSubtypeOf(Complex.type)).toBe(true);

          expect(InstCtor.ancestor).toBe(Complex);
          expect(InstCtor.type.has("a")).toBe(true);
          expect(InstCtor.type.has("b")).toBe(true);
        });
      }));

      it("should be able to create a list type using normal notation", testGet(function(sync, Context) {
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
      }));

      it("should be able to create a list type using the shorthand list-type notation",
      testGet(function(sync, Context) {
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
      }));

      it("should throw/reject if the shorthand list-type notation has two entries",
      testGetError(function(sync, Context) {
        var context = new Context();

        return callGet(context, sync, [123, 234]);
      }, function(errorMatch) { return errorMatch.argInvalid("typeRef"); }));

      it("should be able to create a refinement type using normal notation", testGet(function(sync, Context) {
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
      }));

      it("should throw/reject if given a number (not a string, function or object)",
      testGetError(function(sync, Context) {
        var context = new Context();

        return callGet(context, sync, 1);

      }, function(errorMatch) { return errorMatch.argInvalid("typeRef"); }));

      it("should throw/reject if given a boolean (not a string, function or object)",
      testGetError(function(sync, Context) {
        var context = new Context();

        return callGet(context, sync, true);

      }, function(errorMatch) { return errorMatch.argInvalid("typeRef"); }));

      it("should be able to get an already loaded non-standard type given its absolute id",
      testGet(function(sync, Context, localRequire) {
        var mid = "pentaho/foo/bar";
        localRequire.define(mid,[], function() {
          return function(context) {
            var Simple = context.get("pentaho/type/simple");
            return Simple.extend({type: {id: mid}});
          };
        });

        return promiseUtil.require(mid, localRequire)
            .then(function() {
              var context = new Context();
              return callGet(context, sync, mid);
            })
            .then(function(InstCtor) {
              expect(InstCtor.type.id).toBe(mid);
            });
      }));

      it("should throw if type factory does not return a function",
      testGet(function(sync, Context, localRequire, errorMatch) {
        var mid = "pentaho/foo/bar2";

        localRequire.define(mid,[], function() {
          return function(context) {
            return "not a function";
          };
        });

        return promiseUtil.require(mid, localRequire)
            .then(function() {
              var context = new Context();
              return callGet(context, sync, mid);
            })
            .then(function() {
              expect("to throw").toBe(true);
            }, function(ex) {
              expect(ex).toEqual(errorMatch.operInvalid());
            });
      }));

      it("should throw if type factory does return a function that is not an Instance",
      testGet(function(sync, Context, localRequire, errorMatch) {
        var mid = "pentaho/foo/bar2";

        localRequire.define(mid,[], function() {
          return function(context) {
            return function(){};
          };
        });

        return promiseUtil.require(mid, localRequire)
            .then(function() {
              var context = new Context();
              return callGet(context, sync, mid);
            })
            .then(function() {
              expect("to throw").toBe(true);
            }, function(ex) {
              expect(ex).toEqual(errorMatch.operInvalid());
            });
      }));

      it("should collect non-standard type ids in getAsync", withContext(function(Context, localRequire) {
        function defineTempModule(mid) {
          localRequire.define(mid, [], function() {
            return function(context) {
              return context.get("pentaho/type/simple").extend({type: {id: mid}});
            };
          });
        }

        function defineTempFacet(mid) {
          localRequire.define(mid, ["pentaho/type/facets/Refinement"], function(Refinement) {
            return Refinement.extend();
          });
        }

        defineTempModule("pentaho/foo/dudu1");
        defineTempModule("pentaho/foo/dudu2");
        defineTempModule("pentaho/foo/dudu3");
        defineTempModule("pentaho/foo/dudu4");
        defineTempFacet("pentaho/foo/facets/Mixin1");
        defineTempFacet("pentaho/foo/facets/Mixin2");
        defineTempFacet("pentaho/foo/facets/Mixin3");
        // -----

        var context = new Context();
        var RefinementMixin2 = localRequire("pentaho/type/facets/Refinement").extend();
        var spec = {
          base: "complex",
          props: [
            {name: "foo1", type: "pentaho/foo/dudu1"},
            {name: "foo2", type: {base: "pentaho/foo/dudu2"}},
            {name: "foo3", type: {base: "list", of: "pentaho/foo/dudu3"}},
            {name: "foo4", type: ["pentaho/foo/dudu3"]},
            {name: "foo5", type: []},
            {name: "foo6", type: {
              base: "refinement",
              of: "pentaho/foo/dudu3",
              facets: ["pentaho/foo/facets/Mixin1", "pentaho/foo/facets/Mixin2", "DiscreteDomain", RefinementMixin2]
            }},
            {name: "foo7", type: {props: {
              a: {type: "pentaho/foo/dudu4"},
              b: {type: "pentaho/foo/dudu3"}
            }}},
            {name: "foo8", type: {
              base: "refinement",
              of: "string",
              facets: "pentaho/foo/facets/Mixin3"
            }}
          ]
        };

        return context.getAsync(spec)
            .then(function(InstCtor) {
              expect(InstCtor.type.get("foo1").type.id).toBe("pentaho/foo/dudu1");
              expect(InstCtor.type.get("foo2").type.ancestor.id).toBe("pentaho/foo/dudu2");
              expect(InstCtor.type.get("foo3").type.of.id).toBe("pentaho/foo/dudu3");
              expect(InstCtor.type.get("foo7").type.get("a").type.id).toBe("pentaho/foo/dudu4");
              expect(InstCtor.type.get("foo8").type.facets[0]).toBe(localRequire("pentaho/foo/facets/Mixin3"));
            });
      }));

      // should throw when sync and the requested module is not defined
      // should throw when sync and the requested module is not yet loaded
      // should not throw when async and the requested module is not defined
      // should not throw when async and the requested module is not yet loaded
    }); // #get

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

      it("should return a promise", withContext(function(Context, localRequire) {
        configRequire(localRequire);

        var context  = new Context();
        var p = context.getAllAsync();
        expect(p instanceof Promise).toBe(true);
      }));

      it("should return all registered Types under 'pentaho/type/value' by default",
      withContext(function(Context, localRequire) {
        configRequire(localRequire);

        var context = new Context();

        return context
            .getAllAsync()
            .then(function(InstCtors) {
              expect(InstCtors instanceof Array).toBe(true);
              expect(InstCtors.length).toBe(1);
              expect(InstCtors[0].type.id).toBe("exp/dude");
            });
      }));

      it("should return an empty array when the specified baseType has no registrations",
      withContext(function(Context, localRequire) {
        configRequire(localRequire);

        var context  = new Context();

        return context
            .getAllAsync("abcdefgh")
            .then(function(InstCtors) {
              expect(InstCtors instanceof Array).toBe(true);
              expect(InstCtors.length).toBe(0);
            });
      }));

      it("should return all registered Types under a given base type id",
      withContext(function(Context, localRequire) {
        configRequire(localRequire);

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
      }));

      it("should return all registered Types that satisfy the isBrowsable filter",
      withContext(function(Context, localRequire) {
        configRequire(localRequire);
        var context  = new Context();

        return context
            .getAllAsync("exp/thing", {"isBrowsable": true})
            .then(function(InstCtors) {
              expect(InstCtors instanceof Array).toBe(true);
              expect(InstCtors.length).toBe(1);
              expect(InstCtors[0].type.id).toBe("exp/foo");
            });
      }));
    }); // #getAll
  }); // pentaho.type.Context
});
