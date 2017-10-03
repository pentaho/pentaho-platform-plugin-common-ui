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
  "tests/test-utils"
], function(Context, testUtils) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  /* eslint max-nested-callbacks: 0 */

  // Use alternate, promise-aware version of `it`.
  var it = testUtils.itAsync;

  describe("pentaho.type.Instance -", function() {

    var context;
    var Instance;
    var Type;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Instance = context.get("instance");
            Type = Instance.Type;
          })
          .then(done, done.fail);
    });

    it("is a function", function() {
      expect(typeof Instance).toBe("function");
    });

    it("should have .Type as a different function", function() {
      expect(Instance).not.toBe(Type);
      expect(typeof Type).toBe("function");
    });

    it("should have .type be Type#", function() {
      expect(Instance.type).toBe(Type.prototype);
    });

    describe(".extend({...}) -", function() {

      it("should return a function", function() {
        var Derived = Instance.extend();
        expect(typeof Derived).toBe("function");
      });

      it("should return a sub-class of Instance", function() {
        var Derived = Instance.extend();
        expect(Derived.prototype instanceof Instance).toBe(true);
      });

      it("should have .Type as a function", function() {
        var Derived = Instance.extend();
        expect(typeof Derived.Type).toBe("function");
      });

      it("should have .Type as a sub-class of Type", function() {
        var Derived = Instance.extend();
        expect(Derived.Type.prototype instanceof Type).toBe(true);
      });

      it("should have .type be Derived.Type#", function() {
        var Derived = Instance.extend();
        expect(Derived.type).toBe(Derived.Type.prototype);
      });

      it("should accept a given name", function() {
        var Derived = Instance.extend("foo");
        expect(Derived.name || Derived.displayName).toBe("foo");
      });

      it("should set the corresponding type constructor name by suffixing '.Type' to the name " +
         "of the instance constructor", function() {
        var Derived = Instance.extend("foo");
        expect(Derived.Type.name || Derived.Type.displayName).toBe("foo.Type");
      });

      it("should have name receive the type `id` when name is not specified", function() {
        var Derived = Instance.extend({$type: {id: "foo"}});
        expect(Derived.name || Derived.displayName).toBe("foo");
      });

      it("should set the corresponding type constructor name by suffixing '.Type' when " +
          "the name name of the instance constructor is defaulted from the id", function() {
        var Derived = Instance.extend({$type: {id: "foo"}});
        expect(Derived.Type.name || Derived.Type.displayName).toBe("foo.Type");
      });

      it("should have name receive the type's `sourceId` when name is not specified", function() {
        var Derived = Instance.extend({$type: {sourceId: "foo"}});
        expect(Derived.name || Derived.displayName).toBe("foo");
      });

      it("should respect name when specified and not use the type's `id` or `sourceId`", function() {
        var Derived = Instance.extend("foo", {$type: {id: "bar"}});

        expect(Derived.name || Derived.displayName).toBe("foo");

        // ----

        Derived = Instance.extend("foo", {$type: {sourceId: "bar"}});

        expect(Derived.name || Derived.displayName).toBe("foo");
      });

      it("should allow a type factory module id to default the type name", function() {
        var Derived = Instance.extend({$type: {id: "my/special/model"}});
        expect(Derived.name || Derived.displayName).toBe("my.special.Model");
      });
    }); // .extend({...})

    describe("get/set type of a derived class - ", function() {
      var Derived;
      beforeEach(function() {
        Derived = Instance.extend({$type: {"someAttribute": "someValue"}});
      });

      it("setting a falsy type has no consequence", function() {
        ["", null, undefined, false, 0, {}].forEach(function(type) {
          Derived.type = type;
          var inst = new Derived();
          expect(inst.$type.someAttribute).toBe("someValue");
        });
      });

      it("allows setting a .type property", function() {
        Derived.type = {"someAttribute": "someOtherValue"};
        expect(Derived.Type.someAttribute).toBe("someOtherValue");
      });

    });

    describe("get/set type of an instance - ", function() {
      var inst;
      beforeEach(function() {
        inst = new Instance();
      });

      it("sets/gets some type attribute correctly", function() {
        expect(inst.$type.someAttribute).toBeUndefined();
        inst.$type = {someAttribute: "someValue"};
        expect(inst.$type.someAttribute).toBe("someValue");
      });

      it("setting type to a falsy value has no consequence", function() {
        ["", null, undefined, false, 0].forEach(function(value) {
          inst.$type = value;
          expect(inst.$type).not.toBeFalsy();
        });
      });

      it("setting type to an empty object has no consequence", function() {
        var id = inst.$type.id;
        inst.$type = {};
        expect(inst.$type).not.toBeFalsy();
        expect(inst.$type.id).toBe(id);
      });
    });
  }); // pentaho.type.Instance

  describe("pentaho.type.Instance - custom AMD context", function() {

    describe(".extend()", function() {

      describe("$type.id defaulting", function() {

        it("should not default $type.id when it is specified", function() {

          function configAmd(localRequire) {
            localRequire.define("test/module/id", function() {

              return ["complex", function(Complex) {
                return Complex.extend({
                  $type: {
                    id: "test/type/id"
                  }
                });
              }];
            });
          }

          return require.using(["pentaho/type/Context"], configAmd, function(Context) {

            return Context.createAsync()
              .then(function(context) {
                return context.getAsync("test/module/id");
              })
              .then(function(TestType) {

                expect(TestType.type.id).toBe("test/type/id");
              });
          });
        });

        it("should not default $type.id when $type.sourceId is specified", function() {

          function configAmd(localRequire) {
            localRequire.define("test/module/id", function() {

              return ["complex", function(Complex) {
                return Complex.extend({
                  $type: {
                    sourceId: "test/module/sourceId"
                  }
                });
              }];
            });
          }

          return require.using(["pentaho/type/Context"], configAmd, function(Context) {

            return Context.createAsync()
                .then(function(context) {
                  return context.getAsync("test/module/id");
                })
                .then(function(TestType) {

                  expect(TestType.type.sourceId).toBe("test/module/sourceId");
                  expect(TestType.type.id).toBe("test/module/sourceId");
                });
          });
        });

        it("should default $type.id when instSpec is not specified", function() {

          function configAmd(localRequire) {
            localRequire.define("test/module/id", function() {

              return ["complex", function(Complex) {
                return Complex.extend();
              }];
            });
          }

          return require.using(["pentaho/type/Context"], configAmd, function(Context) {

            return Context.createAsync()
                .then(function(context) {
                  return context.getAsync("test/module/id");
                })
                .then(function(TestType) {
                  expect(TestType.type.id).toBe("test/module/id");
                });
          });
        });

        it("should default $type.id when instSpec is specified but not instSpec.$type", function() {

          var instSpec = {};

          function configAmd(localRequire) {
            localRequire.define("test/module/id", function() {

              return ["complex", function(Complex) {
                return Complex.extend(instSpec);
              }];
            });
          }

          return require.using(["pentaho/type/Context"], configAmd, function(Context) {

            return Context.createAsync()
                .then(function(context) {
                  return context.getAsync("test/module/id");
                })
                .then(function(TestType) {
                  expect(TestType.type.id).toBe("test/module/id");

                  // Should not modify instSpec
                  expect(instSpec).toEqual({});
                });
          });
        });

        it("should default $type.id when instSpec.$type is specified but id and sourceId aren't", function() {

          // Must not modify instSpec or typeSpec
          var typeSpec = {};
          var instSpec = {$type: typeSpec};

          function configAmd(localRequire) {
            localRequire.define("test/module/id", function() {

              return ["complex", function(Complex) {
                return Complex.extend(instSpec);
              }];
            });
          }

          return require.using(["pentaho/type/Context"], configAmd, function(Context) {

            return Context.createAsync()
                .then(function(context) {
                  return context.getAsync("test/module/id");
                })
                .then(function(TestType) {
                  expect(TestType.type.id).toBe("test/module/id");

                  // Should not modify instSpec or typeSpec
                  expect(instSpec).toEqual({$type: {}});
                  expect(typeSpec).toEqual({});
                });
          });
        });
      });
    });
  });
});
