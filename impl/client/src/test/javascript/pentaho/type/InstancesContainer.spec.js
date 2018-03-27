/*!
 * Copyright 2017 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/InstancesContainer",
  "tests/test-utils",
  "tests/pentaho/util/errorMatch"
], function(Context, InstancesContainer, testUtils, errorMatch) {

  "use strict";

  // Use alternate, promise-aware version of `it`.
  var it = testUtils.itAsync;
  var expectToRejectWith = testUtils.expectToRejectWith;

  describe("pentaho.type.InstancesContainer", function() {

    describe("tests with a shared context instance", function() {

      var context;
      var Instance;
      var container;

      beforeEach(function(done) {

        Context.createAsync()
            .then(function(_context) {
              context = _context;
              container = context.instances;
              Instance = context.get("instance");
            })
            .then(done, done.fail);
      });

      describe("new (context, [spec])", function() {

        it("should work if spec is not provided", function() {

          var container = new InstancesContainer(context);
        });
      });

      describe("#context", function() {

        it("should get the associated context", function() {

          expect(container.context).toBe(context);
        });
      });

      describe("#declare(id, typeId, instanceConfig)", function() {

        // region id
        it("should throw if the identifier is falsy", function() {

          expect(function() {
            container.declare(null);
          }).toThrow(errorMatch.argRequired("id"));
        });

        it("should register an instance with the given identifier", function() {

          container.declare("foo", "complex");

          expect(container.__instanceById.foo.id).toBe("foo");
        });
        // endregion

        // region spec.type
        it("should throw if the typeId is falsy", function() {

          expect(function() {
            container.declare("foo", null);
          }).toThrow(errorMatch.argRequired("typeId"));
        });

        it("should register an instance with the given type", function() {

          container.declare("foo", "pentaho/type/complex");

          expect(container.__instanceById.foo.typeId).toBe("pentaho/type/complex");
        });

        it("should register an instance with the given type alias and resolve it", function() {

          container.declare("foo", "complex");

          expect(container.__instanceById.foo.typeId).toBe("pentaho/type/complex");
        });

        it("should register an instance with the given type in the instancesByType map", function() {

          container.declare("foo", "pentaho/type/complex");

          var list = container.__instancesByType["pentaho/type/complex"];
          expect(list != null).toBe(true);
          expect(list.length).toBe(1);
        });

        // Fails only when the instance is loaded...
        it("should allow registering an instance of a non-existing type", function() {

          container.declare("foo", "bar");

          expect(container.__instanceById.foo.typeId).toBe("bar");
        });
        // endregion

        // region spec.ranking
        it("should register an instance with the default ranking of 0", function() {

          container.declare("foo", "complex");

          expect(container.__instanceById.foo.ranking).toBe(0);
        });

        it("should register an instance with the given ranking", function() {

          container.declare("foo", "complex", {ranking: 1});

          expect(container.__instanceById.foo.ranking).toBe(1);
        });

        it("should register an instance and be able to parse a string ranking", function() {

          container.declare("foo", "complex", {ranking: "1"});

          expect(container.__instanceById.foo.ranking).toBe(1);
        });

        it("should register an instance and convert an invalid ranking to 0", function() {

          container.declare("foo", "complex", {ranking: "a"});

          expect(container.__instanceById.foo.ranking).toBe(0);
        });

        it("should register an instance with the given type and ranking in the instancesByType map", function() {

          container.declare("foo3", "pentaho/type/complex", {ranking:  1});
          container.declare("foo1", "pentaho/type/complex", {ranking: 10});
          container.declare("foo2", "pentaho/type/complex", {ranking:  1});

          var list = container.__instancesByType["pentaho/type/complex"];
          expect(list != null).toBe(true);
          expect(list.length).toBe(3);
          expect(list[0].id).toBe("foo1");
          expect(list[1].id).toBe("foo3");
          expect(list[2].id).toBe("foo2");
        });
        // endregion

        // region spec.isEnabled
        it("should register an instance with the default isEnabled of true", function() {

          container.declare("foo", "complex");

          expect(container.__instanceById.foo.isEnabled).toBe(true);
        });

        it("should register an instance with the given ranking", function() {

          container.declare("foo", "complex", {isEnabled: false});

          expect(container.__instanceById.foo.isEnabled).toBe(false);
        });

        it("should register an instance and convert isEnabled to a boolean", function() {

          container.declare("foo", "complex", {isEnabled: "false"});

          expect(container.__instanceById.foo.isEnabled).toBe(true);
        });

        it("should register an instance and use the default isEnabled if it is nully", function() {

          container.declare("foo", "complex", {isEnabled: null});

          expect(container.__instanceById.foo.isEnabled).toBe(true);
        });
        // endregion

        it("should not start loading the instance", function() {

          container.declare("foo", "Foo");

          expect(container.__instanceById.foo.__promise).toBe(null);
        });

        it("should return this", function() {

          var result = container.declare("foo", "Foo");

          expect(result).toBe(container);
        });
      });

      describe("#get(instRef, instKeyArgs, typeBase)", function() {

        it("returns a new instance when given (null, null, pentaho.type.Instance)", function() {

          var result = container.get(null, null, Instance.type);

          expect(result).toEqual(jasmine.any(Instance));
        });

        it("should a new instance when given (nully, null, MyComplex)", function() {

          var Complex = context.get("pentaho/type/complex");
          var MyComplex = Complex.extend();

          var result = container.get(null, null, MyComplex.type);

          expect(result).toEqual(jasmine.any(MyComplex));

          result = container.get(undefined, null, MyComplex.type);

          expect(result).toEqual(jasmine.any(MyComplex));
        });

        it("should create a number instance when given (2, null, null)", function() {

          var Number = context.get("pentaho/type/number");

          var result = container.get(2);

          expect(result).toEqual(jasmine.any(Number));
          expect(result.value).toBe(2);
        });

        it("should create a boolean instance when given (true, null, null)", function() {

          var Boolean = context.get("pentaho/type/boolean");

          var result = container.get(true);

          expect(result).toEqual(jasmine.any(Boolean));
          expect(result.value).toBe(true);
        });

        it("should create an object instance when given ({v: {}}, null, Object)", function() {

          var Object = context.get("pentaho/type/object");
          var primitive = {};
          var result = container.get({v: primitive}, null, Object.type);

          expect(result).toEqual(jasmine.any(Object));
          expect(result.value).toBe(primitive);
        });

        it("should create an instance given ({_: '', ...}, null, null)", function() {

          var Number = context.get("pentaho/type/number");
          var result = container.get({_: "pentaho/type/number", v: 1});

          expect(result).toEqual(jasmine.any(Number));
          expect(result.value).toBe(1);
        });

        it("should throw if given a type-annotated value that does not extend from the typeBase", function() {

          var String = context.get("pentaho/type/string");

          expect(function() {
            container.get({_: "pentaho/type/number", v: 1}, null, String.type);
          }).toThrow(errorMatch.operInvalid());
        });

        it("should not throw if given a type-annotated value that does extend from the given baseType", function() {

          var Simple = context.get("pentaho/type/simple");
          var Number = context.get("pentaho/type/number");

          var result = container.get({_: "pentaho/type/number", v: 1}, null, Simple.type);

          expect(result).toEqual(jasmine.any(Number));
          expect(result.value).toBe(1);
        });

        it("should throw if given a type annotated value of an abstract type", function() {

          var MyAbstract = context.get("pentaho/type/complex").extend({$type: {isAbstract: true}});

          expect(function() {
            container.get({_: MyAbstract}, null, Instance.type);
          }).toThrow(errorMatch.operInvalid());
        });

        it("should throw if given a value and an abstract type typeBase", function() {

          var MyAbstract = context.get("pentaho/type/complex").extend({$type: {isAbstract: true}});

          expect(function() {
            container.get({}, null, MyAbstract.type);
          }).toThrow(errorMatch.operInvalid());
        });

        // ---

        it("should be able to create a type-annotated value of a list type", function() {

          var NumberList = context.get({base: "list", of: "number"});

          var value = container.get({_: NumberList, d: [1, 2]});

          expect(value instanceof NumberList).toBe(true);
          expect(value.count).toBe(2);
          expect(value.at(0).value).toBe(1);
          expect(value.at(1).value).toBe(2);
        });

        it("should be able to create a type-annotated value of an inline list type", function() {

          var value = container.get({
            _: {base: "list", of: "number"},
            d: [1, 2]
          });

          expect(value instanceof context.get("list")).toBe(true);
          expect(value.count).toBe(2);
          expect(value.at(0).value).toBe(1);
          expect(value.at(1).value).toBe(2);
        });

        it("should be able to create a type-annotated value of an inline complex type", function() {

          var value = container.get({
            _: {
              props: ["a", "b"]
            },
            "a": 1,
            "b": 2
          });

          expect(value instanceof context.get("complex")).toBe(true);
          expect(value.get("a").value).toBe("1");
          expect(value.get("b").value).toBe("2");
        });

        it("should be able to create a type-annotated value of an inline list complex type", function() {

          var value = container.get({
            _: [
              {
                props: [
                  {name: "a"},
                  "b"
                ]
              }
            ],
            d: [
              {a: 1, b: 2}
            ]
          });

          expect(value instanceof context.get("list")).toBe(true);
          expect(value.count).toBe(1);
        });

        it("should be able to create a type-annotated value of an inline list complex type in array form", function() {
          var value = container.get({
            _: [{
              props: ["a", "b"]
            }],
            d: [
              [1, 2],
              [3, 4]
            ]
          });

          expect(value instanceof context.get("list")).toBe(true);
          expect(value.count).toBe(2);
        });
      }); // #get

      describe("#getAsync(instRef, instKeyArgs, typeBase)", function() {

        // region selection of the sync tests
        it("returns a new instance when given (null, null, Instance)", function() {

          return container.getAsync(null, null, Instance.type).then(function(inst) {
            expect(inst instanceof Instance).toBe(true);
          });
        });

        it("should return an instance when given (null, null, MyComplex)", function() {

          var Complex = context.get("pentaho/type/complex");
          var MyComplex = Complex.extend();

          return container.getAsync(null, null, MyComplex.type).then(function(inst) {
            expect(inst instanceof MyComplex).toBe(true);
          });
        });

        it("should create a number when given (1)", function() {

          var Number = context.get("pentaho/type/number");

          return Number.type.createAsync(1).then(function(number) {
            expect(number instanceof Number).toBe(true);
            expect(number.value).toBe(1);
          });
        });

        it("should create a boolean when given (true)", function() {

          var Boolean = context.get("pentaho/type/boolean");

          return container.getAsync(true).then(function(value) {
            expect(value instanceof Boolean).toBe(true);
            expect(value.value).toBe(true);
          });
        });

        it("should create an object value when given ({}, null, Object)", function() {
          var Object = context.get("pentaho/type/object");
          var primitive = {};

          return container.getAsync({v: primitive}, null, Object.type).then(function(value) {
            expect(value instanceof Object).toBe(true);
            expect(value.value).toBe(primitive);
          });
        });

        it("should create an instance given an object with a type annotation, '_'", function() {

          return container.getAsync({_: "pentaho/type/number", v: 1}).then(function(value) {

            var Number = context.get("pentaho/type/number");

            expect(value instanceof Number).toBe(true);
            expect(value.value).toBe(1);
          });
        });

        it("should throw if given a type-annotated value that does not extend from the this type", function() {

          var String = context.get("pentaho/type/string");

          return expectToRejectWith(function() {
            return container.getAsync({_: "pentaho/type/number", v: 1}, null, String.type);
          }, errorMatch.operInvalid());
        });

        it("should throw if given a type annotated value and an abstract typeBase", function() {

          var MyAbstract = context.get("pentaho/type/complex").extend({$type: {isAbstract: true}});

          return expectToRejectWith(function() {
            return container.getAsync({_: MyAbstract});
          }, errorMatch.operInvalid());
        });
        // endregion

        // see also top-level tests below

      }); // #getAsync
    });

    describe("tests with a shared container configuration", function() {

      var containerConfig = {
        "myFoo2": {ranking: 10},
        "myBar": {ranking: 20},
        "myFooDisabled": {isEnabled: false}
      };

      function configAmd(localRequire) {

        // Root type
        localRequire.define("Root", function() {
          return ["pentaho/type/complex", function(Complex) {
            return Complex.extend({$type: {id: "Root"}});
          }];
        });

        // Foo type
        localRequire.define("Foo", function() {
          return ["Root", function(Root) {
            return Root.extend({$type: {id: "Foo"}});
          }];
        });

        // Bar type
        localRequire.define("Bar", function() {
          return ["Root", function(Root) {
            return Root.extend({$type: {id: "Bar"}});
          }];
        });

        // Aliased type
        localRequire.define("Aliased", function() {
          return ["simple", function(Simple) {
            return Simple.extend({$type: {id: "Aliased"}});
          }];
        });

        // myFoo instance
        localRequire.define("myFoo", function() {
          return [
            "Foo",
            function(Foo) { return new Foo(); }
          ];
        });

        // myFooDisabled instance
        localRequire.define("myFooDisabled", function() {
          return [
            "Foo",
            function(Foo) { return new Foo(); }
          ];
        });

        // myFoo2 instance
        localRequire.define("myFoo2", function() {
          return [
            "Foo",
            function(Foo) { return new Foo(); }
          ];
        });

        // myBar instance
        localRequire.define("myBar", function() {
          return [
            "Bar",
            function(Bar) { return new Bar(); }
          ];
        });

        // myAliased instance
        localRequire.define("myAliased", function() {
          return [
            "Aliased",
            function(Aliased) { return new Aliased({v: "foo"}); }
          ];
        });

        // instance with relative type dependency
        localRequire.define("folder/dependentRelativeType", function() {
          return [
            "./Relative",
            function(Relative) { return new Relative({v: "foo"}); }
          ];
        });

        localRequire.define("folder/Relative", function() {
          return [
            "simple",
            function(Simple) { return Simple.extend({$type: {id: "folder/Relative"}}); }
          ];
        });

        localRequire.config({
          config: {
            "pentaho/typeInfo": {
              "MissingType":  {base: "complex"},
              "Root": {base: "complex"},
              "Foo":  {base: "Root"},
              "Bar":  {base: "Root"},
              "Aliased": {base: "simple", alias: "A"},
              "NoInstances": {base: "simple"},
              "folder/Relative": {base: "simple"}
            },
            "pentaho/instanceInfo": {
              "myFoo": {type: "Foo"},
              "myFoo2": {type: "Foo"},
              "myFooDisabled": {type: "Foo"},
              "myBar": {type: "Bar"},
              "myAliased": {type: "A"}, // registered using its type alias...
              "missing": {type: "MissingType"},
              "folder/dependentRelativeType": {type: "folder/Relative"}
            }
          }
        });
      }

      describe("#configure(spec)", function() {

        it("should call #declare(id, oneSpec) for each key/value pair of spec", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  spyOn(InstancesContainer.prototype, "declare");

                  var container = new InstancesContainer(context, containerConfig);

                  expect(InstancesContainer.prototype.declare).toHaveBeenCalledWith("myFoo", "Foo", undefined);
                  expect(InstancesContainer.prototype.declare).toHaveBeenCalledWith("myFoo2", "Foo", {ranking: 10});
                  expect(InstancesContainer.prototype.declare).toHaveBeenCalledWith("myBar", "Bar", {ranking: 20});
                });
          });
        });

        it("should register instances with the given type and ranking in the instancesByType map", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  var list = container.__instancesByType["Foo"];

                  expect(list != null).toBe(true);
                  expect(list.length).toBe(3);
                  expect(list[0].id).toBe("myFoo2");
                  expect(list[1].id).toBe("myFoo");
                  expect(list[2].id).toBe("myFooDisabled");
                });
          });
        });
      });

      describe("#getByIdAsync(id)", function() {

        it("should reject if id is falsy", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  return expectToRejectWith(function() {
                    return container.getByIdAsync();
                  }, errorMatch.argRequired("id"));
                });
          });
        });

        it("should reject if the instance is not defined", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  return expectToRejectWith(function() {
                    return container.getByIdAsync("bar");
                  }, errorMatch.argInvalid("id"));
                });
          });
        });

        it("should return the requested instance (scope=singleton)", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByIdAsync("myFoo");
                })
                .then(function(foo) {
                  expect(foo != null).toBe(true);
                });
          });
        });

        it("should return the requested instance, even if disabled (scope=singleton)", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
              .then(function(context) {

                container = new InstancesContainer(context, containerConfig);

                return container.getByIdAsync("myFooDisabled");
              })
              .then(function(foo) {
                expect(foo != null).toBe(true);
              });
          });
        });

        it("should always return the same instance (scope=singleton)", function() {

          var container;
          var foo1;
          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByIdAsync("myFoo");
                })
                .then(function(foo) {

                  foo1 = foo;

                  return container.getByIdAsync("myFoo");
                })
                .then(function(foo2) {

                  expect(foo2).toBe(foo1);
                });
          });
        });

        it("should return an instance with a relative type dependency", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByIdAsync("folder/dependentRelativeType");
                })
                .then(function(relative) {
                  expect(relative != null).toBe(true);
                });
          });
        });

        it("should reject if the instance is defined but its module does not exist", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return expectToRejectWith(function() {
                    return container.getByIdAsync("missing");
                  }, jasmine.any(Error));
                });
          });
        });
      });

      describe("#getById(id, keyArgs)", function() {

        it("should throw if id is falsy", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  expect(function() {
                    container.getById();
                  }).toThrow(errorMatch.argRequired("id"));
                });
          });
        });

        it("should throw if the instance is not defined", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  expect(function() {
                    container.getById("bar");
                  }).toThrow(errorMatch.operInvalid());
                });
          });
        });

        it("should return a previously loaded instance", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByIdAsync("myFoo");
                })
                .then(function(foo) {

                  var foo2 = container.getById("myFoo");

                  expect(foo2).toBe(foo);
                });
          });
        });

        it("should return a previously loaded instance, even if not enabled", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
              .then(function(context) {

                container = new InstancesContainer(context, containerConfig);

                return container.getByIdAsync("myFooDisabled");
              })
              .then(function(foo) {

                var foo2 = container.getById("myFooDisabled");

                expect(foo2).toBe(foo);
              });
          });
        });

        it("should always return the same instance (scope=singleton)", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByIdAsync("myFoo");
                })
                .then(function(foo) {

                  var foo2 = container.getById("myFoo");
                  var foo3 = container.getById("myFoo");

                  expect(foo2).toBe(foo);
                  expect(foo2).toBe(foo3);
                });
          });
        });

        it("should throw if the instance has not been loaded yet", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  expect(function() {
                    container.getById("myFoo");
                  }).toThrow(errorMatch.operInvalid());
                });
          });
        });

        it("should throw the error by which an instance failed loading", function() {

          /* eslint dot-notation: 0, no-unexpected-multiline: 0 */

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByIdAsync("missing");
                })
                .then(function() {
                  // Should have failed assertion.
                  expect(true).toBe(false);
                })
                ["catch"](function(ex) {

                  expect(function() {
                    container.getById("missing");
                  }).toThrow(ex);
                });
          });
        });
      });

      describe("#getAllByTypeAsync(baseTypeId, [{filter, isRequired}])", function() {

        it("should reject if baseTypeId is falsy", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  return expectToRejectWith(function() {
                    return container.getAllByTypeAsync();
                  }, errorMatch.argRequired("baseTypeId"));
                });
          });
        });

        it("should return an empty array if there are no defined instances of the requested type", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  return container.getAllByTypeAsync("undefinedType");
                })
                .then(function(results) {
                  expect(results).toEqual([]);
                });
          });
        });

        it("should reject if there are no matching instances and isRequired: true", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  return expectToRejectWith(function() {
                    return container.getAllByTypeAsync("undefinedType", {isRequired: true});
                  }, errorMatch.operInvalid());
                });
          });
        });

        it("should return enabled registered instances of a direct type (not yet loaded)", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getAllByTypeAsync("Foo");
                })
                .then(function(results) {

                  expect(results).toEqual(jasmine.arrayContaining([
                    container.getById("myFoo"),
                    container.getById("myFoo2")
                  ]));
                  expect(results.length).toBe(2);
                });
          });
        });

        it("should return enabled registered instances of a direct type ordered by desc ranking", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getAllByTypeAsync("Foo");
                })
                .then(function(results) {

                  var index2 = results.indexOf(container.getById("myFoo2"));
                  var index1 = results.indexOf(container.getById("myFoo"));
                  expect(index2).toBeLessThan(index1);
                });
          });
        });

        it("should return enabled registered instances of a base type", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getAllByTypeAsync("Root");
                })
                .then(function(results) {

                  expect(results).toEqual(jasmine.arrayContaining([
                    container.getById("myFoo"),
                    container.getById("myFoo2"),
                    container.getById("myBar")
                  ]));
                });
          });
        });

        it("should return enabled registered instances of a base type ordered by desc ranking", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getAllByTypeAsync("Root");
                })
                .then(function(results) {

                  var index1 = results.indexOf(container.getById("myFoo"));
                  var index2 = results.indexOf(container.getById("myFoo2"));
                  var index3 = results.indexOf(container.getById("myBar"));

                  expect(index3).toBeLessThan(index2);
                  expect(index2).toBeLessThan(index1);
                });
          });
        });

        it("should return enabled registered instances of a base type ignoring failed ones", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getAllByTypeAsync("complex");
                })
                .then(function(results) {

                  expect(results).toEqual(jasmine.arrayContaining([
                    container.getById("myFoo"),
                    container.getById("myFoo2"),
                    container.getById("myBar")
                  ]));
                });
          });
        });

        it("should reject if there are no matching instances and isRequired: true and filter is specified", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  return expectToRejectWith(function() {
                    return container.getAllByTypeAsync("Foo", {
                      isRequired: true,
                      filter: function(instance) { return false; }
                    });
                  }, errorMatch.operInvalid());
                });
          });
        });

        it("should return only instances that match a specified filter", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getAllByTypeAsync("Root", {
                    filter: function(instance) { return instance.$type.id === "Bar"; }
                  });
                })
                .then(function(results) {

                  expect(results).toEqual([
                    container.getById("myBar")
                  ]);
                });
          });
        });
      });

      describe("#getAllByType(baseTypeId, [{filter, isRequired}])", function() {

        it("should throw if baseTypeId is falsy", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  expect(function() {
                    container.getAllByType();
                  }).toThrow(errorMatch.argRequired("baseTypeId"));
                });
          });
        });

        it("should return an empty array if there are no defined instances of the requested type", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  var results = container.getAllByType("undefinedType");

                  expect(results).toEqual([]);
                });
          });
        });

        it("should throw if there are no matching instances and isRequired: true", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  expect(function() {
                    container.getAllByType("undefinedType", {isRequired: true});
                  }).toThrow(errorMatch.operInvalid());
                });
          });
        });

        it("should return all enabled, registered and loaded instances of a direct type", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([
                    container.getByIdAsync("myFoo"),
                    container.getByIdAsync("myFooDisabled")
                  ]);
                })
                .then(function(foos) {

                  var results = container.getAllByType("Foo");

                  expect(results).toEqual([foos[0]]);
                });
          });
        });

        it("should return enabled, registered and loaded instances of " +
          "a direct type ordered by desc ranking", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([container.getByIdAsync("myFoo"), container.getByIdAsync("myFoo2")]);
                })
                .then(function(foos) {

                  var results = container.getAllByType("Foo");

                  var index1 = results.indexOf(foos[0]);
                  var index2 = results.indexOf(foos[1]);
                  expect(index2).toBeLessThan(index1);
                });
          });
        });

        it("should return enabled, registered and loaded instances of a base type", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([container.getByIdAsync("myFoo"), container.getByIdAsync("myFoo2")]);
                })
                .then(function(foos) {

                  var results = container.getAllByType("Root");

                  // Bar should not be in the result.
                  expect(results).toEqual(jasmine.arrayContaining(foos));
                  expect(results.length).toBe(2);
                });
          });
        });

        it("should return enabled, registered and loaded instances of a base type ignoring failed ones", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([
                    container.getByIdAsync("myFoo"),
                    container.getByIdAsync("missing")["catch"](function() { return null; })
                  ]);
                })
                .then(function(fooAndNull) {

                  var results = container.getAllByType("complex");

                  expect(results).toEqual([fooAndNull[0]]);
                });
          });
        });

        it("should reject if there are no loaded matching instances and " +
            "isRequired: true and filter is specified", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByIdAsync("myFoo");
                })
                .then(function(foo) {

                  expect(function() {
                    container.getAllByType("Foo", {
                      isRequired: true,
                      filter: function(instance) { return false; }
                    });
                  }).toThrow(errorMatch.operInvalid());
                });
          });
        });

        it("should return only instances that match a specified filter", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([
                    container.getByIdAsync("myFoo"),
                    container.getByIdAsync("myBar")
                  ]);
                })
                .then(function(fooAndBar) {

                  var results = container.getAllByType("Root", {
                    filter: function(instance) { return instance.$type.id === "Bar"; }
                  });

                  expect(results).toEqual([fooAndBar[1]]);
                });
          });
        });
      });

      describe("#getByTypeAsync(baseTypeId, [{filter, isRequired}])", function() {

        it("should reject if baseTypeId is falsy", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  return expectToRejectWith(function() {
                    return container.getByTypeAsync();
                  }, errorMatch.argRequired("baseTypeId"));
                });
          });
        });

        it("should return null if there are no registered instances whose type is a subtype of baseTypeId", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByTypeAsync("NoInstances");
                })
                .then(function(nop) {
                  expect(nop).toBe(null);
                });
          });
        });

        it("should reject if there are no registered instances whose type is a subtype of baseTypeId " +
            "and isRequired: true", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return expectToRejectWith(function() {
                    return container.getByTypeAsync("NoInstances", {isRequired: true});
                  }, errorMatch.operInvalid());
                });
          });
        });

        it("should return the registered instance whose type is baseTypeId and " +
            "that has the highest ranking", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByTypeAsync("Foo");
                })
                .then(function(bestFoo) {
                  expect(bestFoo).toBe(container.getById("myFoo2"));
                });
          });
        });

        it("should return the registered instance whose type is a subtype of baseTypeId and " +
            "that has the highest ranking", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByTypeAsync("Root");
                })
                .then(function(bestInstance) {
                  expect(bestInstance).toBe(container.getById("myBar"));
                });
          });
        });
      });

      describe("#getByType(baseTypeId, [{filter, isRequired}])", function() {

        it("should throw if baseTypeId is falsy", function() {

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  var container = new InstancesContainer(context, containerConfig);

                  expect(function() {
                    container.getByType();
                  }).toThrow(errorMatch.argRequired("baseTypeId"));
                });
          });
        });

        it("should return null if there are no registered and loaded instances " +
            "whose type is a subtype of baseTypeId", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  var result = container.getByType("NoInstances");
                  expect(result).toBe(null);
                });
          });
        });

        it("should throw if there are no registered and loaded instances whose type is a subtype of baseTypeId " +
            "and isRequired: true", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  expect(function() {
                    container.getByType("NoInstances", {isRequired: true});
                  }).toThrow(errorMatch.operInvalid());
                });
          });
        });

        it("should return the registered and loaded instance whose type is BaseType", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([
                    container.getByIdAsync("myFoo"),
                    container.getByIdAsync("myFoo2")
                  ]);
                })
                .then(function(foos) {

                  var Foo = container.context.get("Foo");

                  var result = container.getByType(Foo);

                  expect(result).toEqual(jasmine.any(Foo));
                });
          });
        });

        it("should return the registered and loaded instance whose type is BaseType.Type", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([
                    container.getByIdAsync("myFoo"),
                    container.getByIdAsync("myFoo2"),
                    container.getByIdAsync("myFooDisabled")
                  ]);
                })
                .then(function(foos) {

                  var Foo = container.context.get("Foo");

                  var result = container.getByType(Foo.type);

                  expect(result).toEqual(jasmine.any(Foo));
                });
          });
        });

        it("should throw if given an anonymous BaseType", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  var Anonymous = container.context.get("complex").extend();

                  expect(function() {
                    container.getByType(Anonymous);
                  }).toThrow(errorMatch.argInvalid("baseTypeId"));
                });
          });
        });

        it("should throw if given an anonymous BaseType.Type", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  var Anonymous = container.context.get("complex").extend();

                  expect(function() {
                    container.getByType(Anonymous.type);
                  }).toThrow(errorMatch.argInvalid("baseTypeId"));
                });
          });
        });

        it("should return the registered and loaded instance whose type is baseTypeId and " +
            "that has the highest ranking", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([
                    container.getByIdAsync("myFoo"),
                    container.getByIdAsync("myFoo2")
                  ]);
                })
                .then(function(foos) {

                  var result = container.getByType("Foo");
                  expect(result).toBe(foos[1]);
                });
          });
        });

        it("should return a registered and loaded instance whose type alias is given", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByIdAsync("myAliased");
                })
                .then(function(aliased) {

                  var result = container.getByType("A");
                  expect(result).toBe(aliased);
                });
          });
        });

        it("should return the registered instance whose type is a subtype of baseTypeId and " +
            "that has the highest ranking", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([
                    container.getByIdAsync("myFoo"),
                    container.getByIdAsync("myFoo2"),
                    container.getByIdAsync("myBar")
                  ]);
                })
                .then(function(foosAndBar) {
                  var result = container.getByType("Root");
                  expect(result).toBe(foosAndBar[2]);
                });
          });
        });

        it("should return the best registered and loaded instance of a base type, ignoring failed ones", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer"
          ], configAmd, function(Context, InstancesContainer) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([
                    container.getByIdAsync("myFoo"),
                    container.getByIdAsync("missing")["catch"](function() { return null; }),
                    container.getByIdAsync("myBar")
                  ]);
                })
                .then(function(fooAndBarAndNull) {

                  var result = container.getByType("complex");

                  expect(result).toBe(fooAndBarAndNull[2]);
                });
          });
        });

        it("should reject if there are no loaded matching instances and " +
            "isRequired: true and filter is specified", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return container.getByIdAsync("myFoo");
                })
                .then(function(foo) {

                  expect(function() {
                    container.getByType("Foo", {
                      isRequired: true,
                      filter: function(instance) { return false; }
                    });
                  }).toThrow(errorMatch.operInvalid());
                });
          });
        });

        it("should return only an instance that matches a specified filter", function() {

          var container;

          return require.using([
            "pentaho/type/Context",
            "pentaho/type/InstancesContainer",
            "tests/pentaho/util/errorMatch"
          ], configAmd, function(Context, InstancesContainer, errorMatch) {

            return Context.createAsync()
                .then(function(context) {

                  container = new InstancesContainer(context, containerConfig);

                  return Promise.all([
                    container.getByIdAsync("myFoo"),
                    container.getByIdAsync("myFoo2"),
                    container.getByIdAsync("myBar")
                  ]);
                })
                .then(function(foosAndBar) {

                  var result = container.getByType("Root", {
                    filter: function(instance) { return instance.$type.id === "Foo"; }
                  });

                  expect(result).toBe(foosAndBar[1]);
                });
          });
        });
      });
    });

    describe("#get(instRef, instKeyArgs, typeBase)", function() {

      // see also tests with a shared context instance, above

      it("should resolve the special reference {$instance: {id: instanceId}}", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          return Context.createAsync().then(function(context) {

            var container = context.instances;

            var instance = {};

            spyOn(container, "getById").and.callFake(function() {
              return instance;
            });

            var result = container.get({$instance: {id: "myFoo"}});

            expect(container.getById.calls.count()).toBe(1);
            expect(container.getById).toHaveBeenCalledWith("myFoo");

            expect(result).toEqual(instance);
          });
        });
      });

      it("should resolve the special reference {$instance: {type: 'baseType'}}", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          return Context.createAsync().then(function(context) {

            var container = context.instances;

            var instance = {};

            spyOn(container, "getByType").and.callFake(function() {
              return instance;
            });

            var result = container.get({$instance: {type: "Foo"}});

            expect(container.getByType.calls.count()).toBe(1);
            expect(container.getByType).toHaveBeenCalledWith("Foo", {type: "Foo"});

            expect(result).toEqual(instance);
          });
        });
      });

      it("should resolve the special reference {$instance: {}} and use typeBase as a default type", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          var container;
          var instance = {};

          return Context.createAsync()
              .then(function(context) {

                container = context.instances;

                spyOn(container, "getByType").and.returnValue(instance);

                var result = container.get({$instance: {foo: 1}}, null, context.get("simple").type);

                expect(container.getByType.calls.count()).toBe(1);
                expect(container.getByType).toHaveBeenCalledWith("pentaho/type/simple", {foo: 1});

                expect(result).toEqual(instance);
              });
        });
      });

      it("should reject when given the special reference {$instance: {}} and an anonymous typeBase", function() {

        return require.using(["pentaho/type/Context", "tests/pentaho/util/errorMatch"], function(Context, errorMatch) {

          return Context.createAsync().then(function(context) {

            var container = context.instances;

            var MyComplex = context.get("complex").extend();

            return expect(function() {

              container.get({$instance: {}}, null, MyComplex.type);

            }).toThrow(errorMatch.operInvalid());
          });
        });
      });

      it("should reject when given the special reference {$instance: {}} and no typeBase", function() {

        return require.using(["pentaho/type/Context", "tests/pentaho/util/errorMatch"], function(Context, errorMatch) {

          return Context.createAsync().then(function(context) {

            var container = context.instances;

            expect(function() {

              container.get({$instance: {}});

            }).toThrow(errorMatch.operInvalid());
          });
        });
      });

      it("should resolve the special reference {$instance: {type: ['baseTypeId']}}", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          return Context.createAsync()
              .then(function(context) {

                var container = context.instances;

                var PenObject = context.get("object");
                var instances = [
                  new PenObject({v: {}}),
                  new PenObject({v: {}})
                ];

                spyOn(container, "getAllByType").and.callFake(function() {
                  return instances;
                });

                var result = container.get({$instance: {type: ["object"]}});

                expect(container.getAllByType.calls.count()).toBe(1);
                expect(container.getAllByType).toHaveBeenCalledWith("object", {type: ["object"]});

                var List = container.context.get("list");

                expect(result).toEqual(jasmine.any(List));
                expect(result.$type.isSubtypeOf(List.type)).toBe(true);
                expect(result.$type.elementType).toBe(PenObject.type);

                expect(result.at(0)).toBe(instances[0]);
                expect(result.at(1)).toBe(instances[1]);
                expect(result.count).toBe(instances.length);
              });
        });
      });

      it("should resolve the special reference {$instance: {type: [elemBaseType]}}", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          return Context.createAsync()
              .then(function(context) {

                var container = context.instances;

                var PenObject = context.get("object");

                var instances = [
                  new PenObject({v: {}}),
                  new PenObject({v: {}})
                ];

                spyOn(container, "getAllByType").and.callFake(function() {
                  return instances;
                });

                var result = container.get({$instance: {type: [PenObject.type]}});

                expect(container.getAllByType.calls.count()).toBe(1);
                expect(container.getAllByType).toHaveBeenCalledWith("pentaho/type/object", {type: [PenObject.type]});

                var List = container.context.get("list");

                expect(result).toEqual(jasmine.any(List));
                expect(result.$type.isSubtypeOf(List.type)).toBe(true);
                expect(result.$type.elementType).toBe(PenObject.type);

                expect(result.at(0)).toBe(instances[0]);
                expect(result.at(1)).toBe(instances[1]);
                expect(result.count).toBe(instances.length);
              });
        });
      });

      it("should resolve the special reference {$instance: {type: listBaseTypeOfNamedElemType}}", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          return Context.createAsync()
              .then(function(context) {

                var container = context.instances;

                var PenObject = context.get("object");
                var instances = [
                  new PenObject({v: {}}),
                  new PenObject({v: {}})
                ];

                var ListType = context.get([PenObject]);

                spyOn(container, "getAllByType").and.callFake(function() {
                  return instances;
                });

                var result = container.get({$instance: {type: ListType.type}});

                expect(container.getAllByType.calls.count()).toBe(1);
                expect(container.getAllByType).toHaveBeenCalledWith("pentaho/type/object", {type: ListType.type});

                expect(result).toEqual(jasmine.any(ListType));

                expect(result.at(0)).toBe(instances[0]);
                expect(result.at(1)).toBe(instances[1]);
                expect(result.count).toBe(instances.length);
              });
        });
      });

      it("should throw when given the special reference " +
          "{$instance: {type: listBaseTypeOfAnonymousElemType}}", function() {

        return require.using(["pentaho/type/Context", "tests/pentaho/util/errorMatch"], function(Context, errorMatch) {

          return Context.createAsync()
              .then(function(context) {

                var container = context.instances;

                var MyComplex = context.get("complex").extend();

                var ListType = context.get([MyComplex]);

                expect(function() {
                  container.get({$instance: {type: ListType.type}});
                }).toThrow(errorMatch.operInvalid());
              });
        });
      });
    });

    describe("#getAsync(instRef, instKeyArgs, typeBase)", function() {

      // see also tests with a shared context instance, above

      it("should be able to create a type-annotated value of an inline list complex type", function() {

        function configAmd(localRequire) {

          localRequire.define("test/foo/a", function() {
            return ["pentaho/type/complex", function(Complex) {

              return Complex.extend({
                $type: {
                  id: "test/foo/a",
                  props: {
                    a: {valueType: "string"}
                  }
                }
              });
            }];
          });

          localRequire.define("test/foo/b", function() {
            return ["pentaho/type/complex", function(Complex) {

              return Complex.extend({
                $type: {
                  id: "test/foo/b",
                  props: {
                    b: {valueType: "string"}
                  }
                }
              });
            }];
          });

          localRequire.define("test/foo/c", function() {
            return ["test/foo/b", function(TestFooB) {

              return TestFooB.extend({
                $type: {
                  id: "test/foo/c",
                  props: {
                    c: {valueType: "string"}
                  }
                }
              });
            }];
          });
        }

        return require.using(["pentaho/type/Context"], configAmd, function(Context) {

          return Context.createAsync().then(function(context) {

            var Instance = context.get("instance");

            var instSpec = {
              _: [
                {
                  props: [
                    {name: "x", valueType: "test/foo/a"},
                    {name: "y", valueType: "test/foo/b"}
                  ]
                }
              ],
              d: [
                {x: {a: "1"}, y: {b: "2"}},
                {x: {a: "2"}, y: {_: "test/foo/c", b: "3"}}
              ]
            };

            return context.instances.getAsync(instSpec).then(function(value) {

              expect(value instanceof context.get("list")).toBe(true);
              expect(value.count).toBe(2);
            });
          });
        });
      });

      it("should resolve the special reference {$instance: {id: instanceId}}", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          return Context.createAsync().then(function(context) {

            var container = context.instances;

            var instance = {};

            spyOn(container, "getByIdAsync").and.callFake(function() {
              return Promise.resolve(instance);
            });

            return container.getAsync({$instance: {id: "myFoo"}}).then(function(result) {

              expect(container.getByIdAsync.calls.count()).toBe(1);
              expect(container.getByIdAsync).toHaveBeenCalledWith("myFoo");

              expect(result).toEqual(instance);
            });
          });
        });
      });

      it("should resolve the special reference {$instance: {type: 'baseType'}}", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          return Context.createAsync().then(function(context) {

            var container = context.instances;

            var instance = {};

            spyOn(container, "getByTypeAsync").and.callFake(function() {
              return Promise.resolve(instance);
            });

            return container.getAsync({$instance: {type: "Foo"}}).then(function(result) {

              expect(container.getByTypeAsync.calls.count()).toBe(1);
              expect(container.getByTypeAsync).toHaveBeenCalledWith("Foo", {type: "Foo"});

              expect(result).toEqual(instance);
            });
          });
        });
      });

      it("should resolve the special reference {$instance: {}} and use typeBase as a default type", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          var container;
          var instance = {};

          return Context.createAsync()
              .then(function(context) {

                container = context.instances;

                spyOn(container, "getByTypeAsync").and.returnValue(Promise.resolve(instance));

                return container.getAsync({$instance: {foo: 1}}, null, context.get("simple").type);
              })
              .then(function(result) {
                expect(container.getByTypeAsync.calls.count()).toBe(1);
                expect(container.getByTypeAsync).toHaveBeenCalledWith("pentaho/type/simple", {foo: 1});

                expect(result).toEqual(instance);
              });
        });
      });

      it("should reject when given the special reference {$instance: {}} and an anonymous typeBase", function() {

        return require.using(["pentaho/type/Context", "tests/pentaho/util/errorMatch"], function(Context, errorMatch) {

          return Context.createAsync().then(function(context) {

            var container = context.instances;

            var MyComplex = context.get("complex").extend();

            return expectToRejectWith(function() {

              return container.getAsync({$instance: {}}, null, MyComplex.type);
            }, errorMatch.operInvalid());
          });
        });
      });

      it("should reject when given the special reference {$instance: {}} and no typeBase", function() {

        return require.using(["pentaho/type/Context", "tests/pentaho/util/errorMatch"], function(Context, errorMatch) {

          return Context.createAsync().then(function(context) {

            var container = context.instances;

            return expectToRejectWith(function() {

              return container.getAsync({$instance: {}});
            }, errorMatch.operInvalid());
          });
        });
      });

      it("should resolve the special reference {$instance: {type: ['baseTypeId']}}", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          var instances;
          var container;

          return Context.createAsync()
              .then(function(context) {

                container = context.instances;

                var PenObject = context.get("object");
                instances = [
                  new PenObject({v: {}}),
                  new PenObject({v: {}})
                ];

                spyOn(container, "getAllByTypeAsync").and.callFake(function() {
                  return Promise.resolve(instances);
                });

                return container.getAsync({$instance: {type: ["object"]}});
              })
              .then(function(result) {

                expect(container.getAllByTypeAsync.calls.count()).toBe(1);
                expect(container.getAllByTypeAsync).toHaveBeenCalledWith("object", {type: ["object"]});

                var List = container.context.get("list");
                var PenObject = container.context.get("object");

                expect(result).toEqual(jasmine.any(List));
                expect(result.$type.isSubtypeOf(List.type)).toBe(true);
                expect(result.$type.elementType).toBe(PenObject.type);

                expect(result.at(0)).toBe(instances[0]);
                expect(result.at(1)).toBe(instances[1]);
                expect(result.count).toBe(instances.length);
              });
        });
      });

      it("should resolve the special reference {$instance: {type: [elemBaseType]}}", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          var instances;
          var container;
          var PenObject;

          return Context.createAsync()
              .then(function(context) {

                container = context.instances;

                PenObject = context.get("object");

                instances = [
                  new PenObject({v: {}}),
                  new PenObject({v: {}})
                ];

                spyOn(container, "getAllByTypeAsync").and.callFake(function() {
                  return Promise.resolve(instances);
                });

                return container.getAsync({$instance: {type: [PenObject.type]}});
              })
              .then(function(result) {

                expect(container.getAllByTypeAsync.calls.count()).toBe(1);
                expect(container.getAllByTypeAsync)
                    .toHaveBeenCalledWith("pentaho/type/object", {type: [PenObject.type]});

                var List = container.context.get("list");

                expect(result).toEqual(jasmine.any(List));
                expect(result.$type.isSubtypeOf(List.type)).toBe(true);
                expect(result.$type.elementType).toBe(PenObject.type);

                expect(result.at(0)).toBe(instances[0]);
                expect(result.at(1)).toBe(instances[1]);
                expect(result.count).toBe(instances.length);
              });
        });
      });

      it("should resolve the special reference {$instance: {type: listBaseTypeOfNamedElemType}}", function() {

        return require.using(["pentaho/type/Context"], function(Context) {

          var instances;
          var container;
          var PenObject;
          var ListType;

          return Context.createAsync()
              .then(function(context) {

                container = context.instances;

                PenObject = context.get("object");
                instances = [
                  new PenObject({v: {}}),
                  new PenObject({v: {}})
                ];

                ListType = context.get([PenObject]);

                spyOn(container, "getAllByTypeAsync").and.callFake(function() {
                  return Promise.resolve(instances);
                });

                return container.getAsync({$instance: {type: ListType.type}});
              })
              .then(function(result) {

                expect(container.getAllByTypeAsync.calls.count()).toBe(1);
                expect(container.getAllByTypeAsync).toHaveBeenCalledWith("pentaho/type/object", {type: ListType.type});

                expect(result).toEqual(jasmine.any(ListType));

                expect(result.at(0)).toBe(instances[0]);
                expect(result.at(1)).toBe(instances[1]);
                expect(result.count).toBe(instances.length);
              });
        });
      });

      it("should reject the special reference {$instance: {type: listBaseTypeOfAnonymousElemType}}", function() {

        return require.using(["pentaho/type/Context", "tests/pentaho/util/errorMatch"], function(Context, errorMatch) {

          return Context.createAsync()
              .then(function(context) {

                var container = context.instances;

                var MyComplex = context.get("complex").extend();

                var ListType = context.get([MyComplex]);

                return expectToRejectWith(function() {
                  return container.getAsync({$instance: {type: ListType.type}});
                }, errorMatch.operInvalid());
              });
        });
      });
    });
  });
});
