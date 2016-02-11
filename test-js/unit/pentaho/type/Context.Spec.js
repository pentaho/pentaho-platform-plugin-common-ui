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
  "pentaho/util/error",
  "pentaho/util/promise",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(standard, error, promiseUtil, bundle) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, afterEach:false*/

  /*global SESSION_NAME:false, active_theme:false, SESSION_LOCALE:false, Promise:false*/

  // NOTE: can only be used with `it`; does not work in `describe`.
  function withContext(testFun) {
    return function(done) {
      unloadContext();

      // load fresh Context class
      require(["pentaho/type/Context"], function(Context) {
        try {
          var promise = testFun(Context);
          if(!promise) {
            done();
          } else {
            promise.then(done, done.fail);
          }
        } catch(ex) {
          done.fail(ex);
        }
      }, done.fail);
    };
  }

  function unloadContext() {
    // unload modules
    var p;
    for(p in standard)
      if(standard.hasOwnProperty(p))
        if(p !== "facets")
          require.undef("pentaho/type/" + p);

    for(p in standard.facets)
      if(standard.facets.hasOwnProperty(p))
        require.undef("pentaho/type/facets/" + p);

    require.undef("pentaho/type/standard");
    require.undef("pentaho/type/Context");
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

    describe("#get(type)", function() {

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

      function callGet(context, sync, spec) {
        var result = context[sync ? "get" : "getAsync"](spec);

        if(sync) {
          expect(typeof result.then).not.toBe("function");
        } else {
          // A promise
          expect(typeof result.then).toBe("function");
        }

        return Promise.resolve(result);
      }

      it("should have preloaded standard primitive types and facets", withContext(function(Context) {
        var context = new Context();
        var p;

        for(p in standard)
          if(standard.hasOwnProperty(p))
            if(p !== "facets" && p !== "Item")
              expect(!!context.get("pentaho/type/" + p)).toBe(true);

        for(p in standard.facets)
          if(standard.facets.hasOwnProperty(p))
            require("pentaho/type/facets/" + p);
      }));

      it("should be able to get a standard type given its relative id", testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, "string");

        return promise.then(function(Type) {
          expect(Type.meta.id).toBe("pentaho/type/string");
        });
      }));

      it("should be able to get a standard type given its absolute id", testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, "pentaho/type/string");

        return promise.then(function(Type) {
          expect(Type.meta.id).toBe("pentaho/type/string");
        });
      }));

      it("should be able to get a standard type given its factory function", testGet(function(sync, Context) {
        var context = new Context();
        var valueFactory = require("pentaho/type/value");
        var promise = callGet(context, sync, valueFactory);

        return promise.then(function(Type) {
          expect(Type.meta.id).toBe("pentaho/type/value");
        });
      }));

      it("should throw when given a type metadata constructor (Meta)", testGet(function(sync, Context) {
        var context = new Context();
        var Value   = context.get("pentaho/type/value");
        expect(function() {
          callGet(context, sync, Value.meta.constructor);
        }).toThrowError(error.argInvalid("typeRef", "Type constructor is not supported.").message);
      }));

      it("should be able to get a standard type given its type instance constructor (Mesa)", testGet(function(sync, Context) {
        var context = new Context();
        var Value   = context.get("pentaho/type/value");
        var promise = callGet(context, sync, Value);

        return promise.then(function(Type) {
          expect(Type.meta.id).toBe("pentaho/type/value");
        });
      }));

      it("should be able to get a standard type given its type instance (meta)", testGet(function(sync, Context) {
        var context = new Context();
        var Value   = context.get("pentaho/type/value");
        var promise = callGet(context, sync, Value.meta);

        return promise.then(function(Type) {
          expect(Type.meta.id).toBe("pentaho/type/value");
        });
      }));

      it("should be able to get a standard type given its instance prototype (mesa)", testGet(function(sync, Context) {
        var context = new Context();
        var Value   = context.get("pentaho/type/value");

        expect(function() {
          callGet(context, sync, Value.prototype);
        }).toThrowError(error.argInvalid("typeRef", "Value instance is not supported.").message);
      }));

      it("should be able to create an anonymous complex type with base complex", testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, {base: "complex", props: ["a", "b"]});

        return promise.then(function(Type) {
          var Complex = context.get("pentaho/type/complex");

          expect(Type.meta.isSubtypeOf(Complex.meta)).toBe(true);

          expect(Type.ancestor).toBe(Complex);
          expect(Type.meta.has("a")).toBe(true);
          expect(Type.meta.has("b")).toBe(true);
        });
      }));

      it("should be able to create an anonymous complex type with implied base complex", testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, {props: ["a", "b"]});

        return promise.then(function(Type) {
          var Complex = context.get("pentaho/type/complex");

          expect(Type.meta.isSubtypeOf(Complex.meta)).toBe(true);

          expect(Type.ancestor).toBe(Complex);
          expect(Type.meta.has("a")).toBe(true);
          expect(Type.meta.has("b")).toBe(true);
        });
      }));

      it("should be able to create a list type using normal notation", testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, {
            base: "list",
            of:   {props: ["a", "b"]}
          });

        return promise.then(function(Type) {
          expect(Type.prototype instanceof context.get("list")).toBe(true);

          var ofMeta = Type.meta.of;
          expect(ofMeta.mesa instanceof context.get("complex")).toBe(true);
          expect(ofMeta.count).toBe(2);
          expect(ofMeta.has("a")).toBe(true);
          expect(ofMeta.has("b")).toBe(true);
        });
      }));

      it("should be able to create a list type using the shorthand list-type notation", testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, [
          {props: ["a", "b"]}
        ]);

        return promise.then(function(Type) {
          expect(Type.prototype instanceof context.get("list")).toBe(true);

          var ofMeta = Type.meta.of;
          expect(ofMeta.mesa instanceof context.get("complex")).toBe(true);
          expect(ofMeta.count).toBe(2);
          expect(ofMeta.has("a")).toBe(true);
          expect(ofMeta.has("b")).toBe(true);
        });
      }));

      it("should throw if the shorthand list-type notation has two entries", testGet(function(sync, Context) {
        var context = new Context();

        expect(function() {
          callGet(context, sync, [123, 234]);
        }).toThrowError(
            error.argInvalid("typeSpec", "List type specification should have at most one child element type spec.").message);
      }));

      it("should be able to create a refinement type using normal notation", testGet(function(sync, Context) {
        var context = new Context();
        var promise = callGet(context, sync, {
          base: "refinement",
          of:   "number"
        });

        return promise.then(function(Type) {
          var Refinement = context.get("refinement");
          expect(Type.meta.isSubtypeOf(Refinement.meta)).toBe(true);

          expect(Type.ancestor).toBe(Refinement);
        });
      }));

      it("should throw if given something other than a string, function or object", testGet(function(sync, Context) {
        var context = new Context();
        expect(function() {
          callGet(context, sync, 1);
        }).toThrowError(error.argInvalid("typeRef").message);

        expect(function() {
          callGet(context, sync, true);
        }).toThrowError(error.argInvalid("typeRef").message);
      }));

      it("should be able to get an already loaded non-standard type given its absolute id", testGet(function(sync, Context) {
        var mid = "pentaho/foo/bar";
        require.undef(mid);
        define(mid,[], function() {
          return function(context) {
            var Simple = context.get("pentaho/type/simple");
            return Simple.extend({meta: {id: mid}});
          };
        });

        return promiseUtil.require(mid)
            .then(function() {
              var context = new Context();
              return callGet(context, sync, mid);
            })
            .then(function(Type) {
              expect(Type.meta.id).toBe(mid);
              require.undef(mid);
            });
      }));

      it("should throw if type factory does not return a function", testGet(function(sync, Context) {
        var mid = "pentaho/foo/bar2";
        require.undef(mid);
        define(mid,[], function() {
          return function(context) {
            return "not a function";
          };
        });

        return promiseUtil.require(mid)
            .then(function() {
              var context = new Context();
              return callGet(context, sync, mid);
            })
            .then(function() {
              expect("to throw").toBe(true);
              require.undef(mid);
            }, function(ex) {
              expect(ex.message).toBe(error.operInvalid("Type factory must return a sub-class of 'pentaho/type/Item'.").message);
              require.undef(mid);
            });
      }));

      it("should throw if type factory does return a function that is not an Item", testGet(function(sync, Context) {
        var mid = "pentaho/foo/bar2";
        require.undef(mid);
        define(mid,[], function() {
          return function(context) {
            return function(){};
          };
        });

        return promiseUtil.require(mid)
            .then(function() {
              var context = new Context();
              return callGet(context, sync, mid);
            })
            .then(function() {
              expect("to throw").toBe(true);
              require.undef(mid);
            }, function(ex) {
              expect(ex.message).toBe(error.operInvalid("Type factory must return a sub-class of 'pentaho/type/Item'.").message);
              require.undef(mid);
            });
      }));

      it("should collect non-standard type ids in getAsync", withContext(function(Context) {
        function defineTempModule(mid) {
          require.undef(mid);
          define(mid, [], function() {
            return function(context) {
              return context.get("pentaho/type/simple").extend({meta: {id: mid}});
            };
          });
        }

        function defineTempFacet(mid) {
          require.undef(mid);
          define(mid, ["pentaho/type/facets/Refinement"], function(Refinement) {
            return Refinement.extend();
          });
        }

        defineTempModule("pentaho/foo/dudu1");
        defineTempModule("pentaho/foo/dudu2");
        defineTempModule("pentaho/foo/dudu3");
        defineTempFacet("pentaho/foo/facets/Mixin1");
        defineTempFacet("pentaho/foo/facets/Mixin2");
        // -----

        var context = new Context();
        var RefinementMixin2 = require("pentaho/type/facets/Refinement").extend();
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
            }}
          ]
        };

        return context.getAsync(spec)
            .then(function(Type) {
              expect(Type.meta.get("foo1").type.id).toBe("pentaho/foo/dudu1");
              expect(Type.meta.get("foo2").type.ancestor.id).toBe("pentaho/foo/dudu2");
              expect(Type.meta.get("foo3").type.of.id).toBe("pentaho/foo/dudu3");

              require.undef("pentaho/foo/dudu1");
              require.undef("pentaho/foo/dudu2");
              require.undef("pentaho/foo/dudu3");
              require.undef("pentaho/foo/facets/Mixin1");
              require.undef("pentaho/foo/facets/Mixin2");
            });
      }));

      // should throw when sync and the requested module is not defined
      // should throw when sync and the requested module is not yet loaded
      // should not throw when async and the requested module is not defined
      // should not throw when async and the requested module is not yet loaded
      // should get a Type given an arbitrary instance ?
    }); // #get

    describe("#getAllAsync(baseTypeId, ka)", function() {

      beforeEach(function() {
        require.undef("pentaho/service");

        require.undef("exp/foo");
        require.undef("pentaho/service!exp/foo");

        // Reset current service configuration
        require.config({
          config: {"pentaho/service": null}
        });

        // ---

        define("exp/foo", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({meta: {id: "exp/foo"}});
          };
        });

        // ---

        require.undef("exp/bar");
        require.undef("pentaho/service!exp/bar");

        define("exp/bar", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({meta: {id: "exp/bar", browsable: false}});
          };
        });

        // ---

        require.undef("exp/dude");
        require.undef("pentaho/service!exp/dude");

        define("exp/dude", ["pentaho/type/simple"], function(simpleFactory) {
          return function(context) {
            return context.get(simpleFactory).extend({meta: {id: "exp/dude"}});
          };
        });

        // ---

        require.config({
          config: {
            "pentaho/service": {
              "exp/foo": "exp/thing",
              "exp/bar": "exp/thing",
              "exp/dude": "pentaho/type/value"
            }
          }
        });
      });

      it("should return a promise", withContext(function(Context) {
        var context  = new Context();
        var p = context.getAllAsync();
        expect(p instanceof Promise).toBe(true);
      }));

      it("should return all registered Types under 'pentaho/type/value' by default", withContext(function(Context) {
        var context = new Context();

        return context
            .getAllAsync()
            .then(function(InstCtors) {
              expect(InstCtors instanceof Array).toBe(true);
              expect(InstCtors.length).toBe(1);
              expect(InstCtors[0].meta.id).toBe("exp/dude");
            });
      }));

      it("should return an empty array when the specified baseType has no registrations", withContext(function(Context) {
        var context  = new Context();

        return context
            .getAllAsync("abcdefgh")
            .then(function(InstCtors) {
              expect(InstCtors instanceof Array).toBe(true);
              expect(InstCtors.length).toBe(0);
            });
      }));

      it("should return all registered Types under a given base type id", withContext(function(Context) {
        var context  = new Context();

        return context
            .getAllAsync("exp/thing")
            .then(function(InstCtors) {
              expect(InstCtors instanceof Array).toBe(true);
              expect(InstCtors.length).toBe(2);

              var metaIds = InstCtors.map(function(InstCtor) { return InstCtor.meta.id; });
              var iFoo = metaIds.indexOf("exp/foo");
              var iBar = metaIds.indexOf("exp/bar");
              expect(iFoo).not.toBeLessThan(0);
              expect(iBar).not.toBeLessThan(0);
              expect(iFoo).not.toBe(iBar);
            });
      }));

      it("should return all registered Types that satisfy the browsable filter", withContext(function(Context) {
        var context  = new Context();

        return context
            .getAllAsync("exp/thing", {"browsable": true})
            .then(function(InstCtors) {
              expect(InstCtors instanceof Array).toBe(true);
              expect(InstCtors.length).toBe(1);
              expect(InstCtors[0].meta.id).toBe("exp/foo");
            });
      }));
    }); // #getAll
  }); // pentaho.type.Context
});