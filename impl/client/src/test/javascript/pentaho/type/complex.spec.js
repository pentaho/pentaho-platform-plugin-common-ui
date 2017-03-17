/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/PropertyTypeCollection",
  "tests/pentaho/util/errorMatch",
  "tests/pentaho/type/sloppyModeUtil"
], function(Context, PropertyTypeCollection, errorMatch, sloppyModeUtil) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  var context = new Context();
  var Value = context.get("value");
  var Complex = context.get("complex");
  var Property = context.get("property");
  var PentahoString = context.get("string");
  var List = context.get("list");

  describe("pentaho.type.Complex", function() {

    describe("anatomy", function() {
      it("is a function", function() {
        expect(typeof Complex).toBe("function");
      });

      it("is a sub-class of Value", function() {
        expect(Complex).not.toBe(Value);
        expect(Complex.prototype instanceof Value).toBe(true);
      });

      it(".Type is a function", function() {
        expect(typeof Complex.Type).toBe("function");
      });

      it(".Type is a sub-class of Value.Type", function() {
        expect(Complex.Type).not.toBe(Value.Type);
        expect(Complex.Type.prototype instanceof Value.Type).toBe(true);
      });

      it(".Type has different 'info' attributes from those of Value.Type", function() {
        expect(Complex.type.label).not.toBe(Value.type.label);

        expect(Complex.type.description).not.toBe(Value.type.description);
      });
    }); // anatomy

    describe(".extend(...)", function() {
      it("should return a function", function() {
        var Derived = Complex.extend();

        expect(typeof Derived).toBe("function");
      });

      it("should return a sub-class of Complex", function() {
        var Derived = Complex.extend();

        expect(Derived).not.toBe(Value);
        expect(Derived).not.toBe(Complex);
        expect(Derived.prototype instanceof Complex).toBe(true);
      });
    }); // .extend({...})

    describe("new Complex()", function() {
      it("should be possible to create an instance with no arguments", function() {
        var foo = new Complex();
      });

      it("should be possible to create an instance with empty arguments", function() {
        var foo = new Complex({});
      });

      it("should have type.count = 0", function() {
        var complex = new Complex({});
        expect(complex.type.count).toBe(0);
      });
    });

    describe("new DerivedComplex()", function() {
      var Derived;

      beforeEach(function() {
        Derived = Complex.extend({
          type: {
            label: "Derived",
            props: [
              "x",
              "y",
              {name: "z", type: ["string"]}
            ]
          }
        });
      });

      describe("when given empty arguments", function() {
        it("should not throw", function() {
          var foo = new Derived();
        });

        it("should have every property with its default value", function() {
          var derived = new Derived();

          expect(derived.get("x")).toBe(null);
          expect(derived.get("y")).toBe(null);
          expect(derived.get("z").toArray()).toEqual([]);
        });
      });

      describe("when given a spec", function() {
        it("should respect values specified in an object", function() {
          var derived = new Derived({x: "1", y: "2", z: ["0"]});

          expect(derived.get("x").value).toBe("1");
          expect(derived.get("y").value).toBe("2");
          expect(derived.get("z").count).toBe(1);
          expect(derived.get("z").at(0).value).toBe("0");
        });

        it("should respect values specified in an array", function() {
          var derived = new Derived(["1", "2", ["0"]]);

          expect(derived.get("x").value).toBe("1");
          expect(derived.get("y").value).toBe("2");
          expect(derived.get("z").count).toBe(1);
          expect(derived.get("z").at(0).value).toBe("0");
        });

        it("should cast the specified values", function() {
          var derived = new Derived([0, 1, [2]]);

          expect(derived.get("x").value).toBe("0");
          expect(derived.get("y").value).toBe("1");
          expect(derived.get("z").count).toBe(1);
          expect(derived.get("z").at(0).value).toBe("2");
        });

        it("should respect values specified in v/f syntax", function() {
          var derived = new Derived({
            x: {v: 1, f: "1.0 EUR"},
            y: {v: 2, f: "2.0 USD"},
            z: [{v: 0, f: "0.0 POUNDS"}]
          });

          expect(derived.get("x").value).toBe("1");
          expect(derived.get("y").value).toBe("2");
          expect(derived.get("z").count).toBe(1);
          expect(derived.get("z").at(0).value).toBe("0");

          expect(derived.get("x").formatted).toBe("1.0 EUR");
          expect(derived.get("y").formatted).toBe("2.0 USD");
          expect(derived.get("z").at(0).formatted).toBe("0.0 POUNDS");
        });
      });
    });

    describe("#$uid", function() {
      it("should return a string value", function() {
        var uid = new Complex().$uid;
        expect(typeof uid).toBe("string");
      });

      it("should have a distinct value for every instance", function() {
        var uid1 = new Complex().$uid,
          uid2 = new Complex().$uid,
          uid3 = new Complex().$uid;
        expect(uid1).not.toBe(uid2);
        expect(uid2).not.toBe(uid3);
        expect(uid3).not.toBe(uid1);
      });
    });

    describe("#key", function() {
      it("should return the value of #uid", function() {
        var value = new Complex();
        expect(value.$uid).toBe(value.key);
      });
    });

    describe("Property As Raw", function() {

      describe("#get(name[, sloppy])", function() {
        it("should return the `Value` of an existing singular property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: "string"}]}
          });

          var derived = new Derived({x: "1"});

          var value = derived.get("x");

          expect(value instanceof Value).toBe(true);
          expect(value.value).toBe("1");
        });

        it("should return the value of an existing property given its type object", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: "string"}]}
          });

          var derived = new Derived({x: "1"});

          var pType = Derived.type.get("x");
          expect(pType instanceof Property.Type).toBe(true);

          var value = derived.get(pType);

          expect(value instanceof Value).toBe(true);
          expect(value.value).toBe("1");
        });

        it("should return the `List` value of an existing list property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: ["string"]}]}
          });

          var derived = new Derived();

          var values = derived.get("x");

          expect(values instanceof List).toBe(true);
          expect(values.count).toBe(0);
        });

        it("should return the same `List` of an existing list property every time", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: ["string"]}]}
          });

          var derived = new Derived({x: ["1"]});

          expect(derived.get("x")).toBe(derived.get("x"));
        });

        describe("when name is not specified", function() {
          var Derived = Complex.extend();
          var derived = new Derived();

          var getter = function(args) {
            return derived.get.apply(derived, args);
          };

          var strictError = errorMatch.argRequired("name");

          sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [null], strictError);
          sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [undefined], strictError);
        });

        describe("when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          var getter = function(args) {
            return derived.get.apply(derived, args);
          };

          var sloppyResult;// = undefined;
          var strictError  = errorMatch.argInvalid("name");

          sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, ["y"], sloppyResult, strictError);
        });
      }); // end get

      describe("#getv(name[, sloppy])", function() {

        var Derived = Complex.extend({
          type: {props: [
            {name: "x", type: "string"},
            {name: "z", type: "object"}
          ]}
        });

        it("should call `get` with the given arguments", function() {

          function expectIt(args, argsExpected) {
            var derived = new Derived({x: "1"});

            spyOn(derived, "get");

            derived.getv.apply(derived, args);

            expect(derived.get.calls.argsFor(0)).toEqual(argsExpected);
          }

          expectIt(["x"], ["x", undefined]);
          expectIt(["x", true], ["x", true]);
        });

        it("should return the result of `get`, if it is nully", function() {
          var derived = new Derived();

          function expectIt(args, resultExpected) {
            expect(derived.getv.apply(derived, args)).toBe(resultExpected);
          }

          expectIt(["x", false], null);
          expectIt(["x", false], null);
          expectIt(["y", true], undefined);
        });

        it("should return the value of the result of `get`, if it is not nully", function() {
          var v = {};
          var derived = new Derived({z: {v: v}});

          expect(derived.getv("z", 0, false)).toBe(v);
        });
      }); // end atv

      describe("#getf(name[, sloppy])", function() {

        var Derived = Complex.extend({type: {
          props: [
            {name: "x", type: "string"},
            {name: "z", type: "object"}
          ]
        }});

        it("should call `get` with the given arguments", function() {

          function expectIt(args, argsExpected) {
            var derived = new Derived({x: "1"});

            spyOn(derived, "get");

            derived.getf.apply(derived, args);

            expect(derived.get.calls.argsFor(0)).toEqual(argsExpected);
          }

          expectIt(["x"], ["x", undefined]);
          expectIt(["x", true], ["x", true]);
        });

        it("should return '' if the result of `get` is nully", function() {
          var derived = new Derived();

          function expectIt(args, resultExpected) {
            expect(derived.getf.apply(derived, args)).toBe(resultExpected);
          }

          expectIt(["x", false], "");
          expectIt(["x", false], "");
          expectIt(["y",  true], "");
        });

        it("should return the toString() of the result of `get`, if it is not nully", function() {
          var v = {};
          var f = "foo";
          var derived = new Derived({z: {v: v, f: f}});

          expect(derived.getf("z", false)).toBe(f);
        });
      }); // end atf

      describe("#set(name, valueSpec)", function() {
        it("should set the value of an existing property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: "string"}]}
          });

          var derived = new Derived();

          derived.set("x", "1");

          var value = derived.get("x");
          expect(value.value).toBe("1");
        });

        it("should set the value of an existing list property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: ["string"]}]}
          });

          var derived = new Derived();

          derived.set("x", ["1", "2"]);

          var value = derived.get("x");
          expect(value instanceof List).toBe(true);
          expect(value.count).toBe(2);
        });

        it("should keep the value of property if the new is equals", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: "string"}]}
          });

          var derived = new Derived({"x": "1"});

          var beforeValue = derived.get("x");

          derived.set("x", "1");

          var afterValue = derived.get("x");

          expect(beforeValue).toBe(afterValue);
        });

        it("should replace the value of property if the new is different", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: "string"}]}
          });

          var derived = new Derived({"x": "1"});

          var beforeValue = derived.get("x");

          derived.set("x", "2");

          var afterValue = derived.get("x");

          expect(beforeValue).not.toBe(afterValue);
        });

        it("should throw when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.set("y", "1");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        describe("events -", function() {
          var listeners, complex;
          var THREE = 3,
              Derived = Complex.extend({
                type: {props: [
                  {name: "x", type: "number"},
                  {name: "y", type: ["number"]}
                ]}
              });

          beforeEach(function() {
            listeners = jasmine.createSpyObj("listeners", [
              "will", "did", "rejected"
            ]);

            listeners.will.and.callFake(function(event) {
              if(event.source.x === THREE) event.cancel();
            });

            complex = new Derived({x: 0});
          });


          describe("Without listeners -", function() {
            it("should not call _emitSafe.", function() {
              spyOn(complex, "_emitSafe");

              complex.set("x", 1);
              expect(complex._emitSafe).not.toHaveBeenCalled();
            });
          }); //end without listeners

          describe("With listeners -", function() {
            beforeEach(function() {
              complex.on("will:change",     listeners.will);
              complex.on("rejected:change", listeners.rejected);
              complex.on("did:change",      listeners.did);
            });

            it("should call the will change listener", function() {
              complex.x = 1;
              expect(listeners.will).toHaveBeenCalled();
            });

            it("should call the did change listener when successful", function() {
              complex.x = 1;
              expect(listeners.did).toHaveBeenCalled();
              expect(listeners.rejected).not.toHaveBeenCalled();
              expect(complex.x).toBe(1);
            });

            it("should call the rejected change listener when unsuccessful", function() {
              expect(function() {
                complex.x = THREE;
              }).toThrow();

              expect(listeners.did).not.toHaveBeenCalled();
              expect(listeners.rejected).toHaveBeenCalled();
              expect(complex.x).toBe(0);
            });

            // coverage
            it("should support having no rejected change listener when unsuccessful", function() {
              complex.off("rejected:change", listeners.rejected);

              expect(function() {
                complex.x = THREE;
              }).toThrow();

              expect(listeners.did).not.toHaveBeenCalled();
              expect(listeners.rejected).not.toHaveBeenCalled();
              expect(complex.x).toBe(0);
            });

            it("should allow changing an element property value, directly on the complex, " +
               "from within the `will:change` event", function() {

              listeners.will.and.callFake(function(event) {
                expect(function() {
                  event.source.x = 2;
                }).not.toThrow(); // listeners errors are swallowed
              });

              complex.x = 1;

              expect(listeners.will).toHaveBeenCalled();

              expect(complex.x).toBe(2);
            });

            it("should initiate a new, nested transaction when setting from a `did:change` event", function() {
              var entryCount = 0;

              listeners.did.and.callFake(function(event) {
                entryCount++;

                if(entryCount === 1) {
                  // Starts a nested change.
                  event.source.x = 2;
                }
              });

              complex.x = 1;

              expect(complex.x).toBe(2);

              expect(entryCount).toBe(2);
            });

            it("should initiate a new, nested transaction when setting from a `rejected:change` event", function() {
              var entryCount = 0;

              listeners.rejected.and.callFake(function(event) {
                entryCount++;
                if(entryCount === 1) {
                  // Starts a nested change.
                  event.source.x = 2;
                }
              });

              // First set gets rejected, but the second doesn't.
              expect(function() {
                complex.x = THREE;
              }).toThrow();

              expect(complex.x).toBe(2);
            });

            it("should emit the `will:change` event when setting a list property to a different value", function() {

              complex.set("y", [1, 2]);

              expect(listeners.will).toHaveBeenCalled();

              expect(complex.atv("y", 0)).toBe(1);
              expect(complex.atv("y", 1)).toBe(2);
            });

            it("should allow changing directly the list value from within the `will:change` event", function() {

              listeners.will.and.callFake(function(event) {
                expect(function() {
                  event.source.y.add(2);
                }).not.toThrow(); // listeners errors are swallowed
              });

              complex.y = [1];

              expect(listeners.will).toHaveBeenCalled();

              expect(complex.y.at(0).value).toBe(1);
              expect(complex.y.at(1).value).toBe(2);
            });
          }); // end with listeners
        });
      }); // end set

      describe("#path(steps[, sloppy])", function() {

        function buildGetter(derived) {
          return function(args) {
            return derived.path.apply(derived, args);
          };
        }

        describe("when given an empty steps array", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: "string"}]}
          });
          var derived = new Derived({x: "1"});
          var getter  = buildGetter(derived);

          var result  = derived;
          sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, [[]], result);
        });

        describe("when all the steps are _defined_ along the way", function() {

          describe("when given a property name", function() {
            var Derived = Complex.extend({
              type: {props: [{name: "x", type: "string"}]}
            });
            var simple  = new PentahoString(1);
            var derived = new Derived({x: simple});
            var getter  = buildGetter(derived);

            var result  = simple;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, [["x"]], result);
          });

          describe("when given a property name and an index", function() {
            var Derived = Complex.extend({
              type: {props: [{name: "x", type: ["string"]}]}
            });
            var simple1 = new PentahoString(1);
            var simple2 = new PentahoString(2);
            var derived = new Derived({x: [simple1, simple2]});
            var getter  = buildGetter(derived);

            var result  = simple1;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, [["x", 0]], result);

            result  = simple2;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, [["x", 1]], result);
          });

          describe("when given a property name and a list element key", function() {
            var Derived = Complex.extend({
              type: {props: [{name: "x", type: ["string"]}]}
            });
            var simple1 = new PentahoString(1);
            var simple2 = new PentahoString(2);
            var derived = new Derived({x: [simple1, simple2]});
            var getter  = buildGetter(derived);

            var result  = simple1;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, [["x", "1"]], result);

            result  = simple2;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, [["x", "2"]], result);
          });

          describe("when given a path having multiple steps", function() {
            var Derived = Complex.extend({
              type: {
                props: [
                  {
                    name: "x", type: [
                    {
                      props: [
                        {name: "y", type: ["string"]}
                      ]
                    }
                  ]
                  }
                ]
              }
            });
            var simple1 = new PentahoString(1);
            var simple2 = new PentahoString(2);
            var derived = new Derived({x: [{y: [simple1, simple2]}]});
            var getter  = buildGetter(derived);
            var result  = simple2;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, [["x", 0, "y", 1]], result);
          });
        });

        describe("when some steps are _undefined_ along the way", function() {
          describe("when a property has a null value", function() {
            var Derived = Complex.extend({
              type: {
                props: [
                  {
                    name: "x",
                    type: {
                      props: [
                        {name: "y", type: ["number"]}
                      ]
                    }
                  }
                ]
              }
            });
            var derived = new Derived({x: null});
            var getter  = buildGetter(derived);
            var result  = null;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, [["x", "y", 1]], result);
          });

          describe("when an index is out of range", function() {
            var Derived = Complex.extend({
              type: {
                props: [
                  {
                    name: "x",
                    type: {
                      props: [
                        {name: "y", type: ["number"]}
                      ]
                    }
                  }
                ]
              }
            });
            var derived = new Derived({x: {y: [1]}});
            var getter  = buildGetter(derived);
            var result  = null;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, [["x", "y", 1]], result);
          });

          describe("when a property is undefined", function() {
            var Derived = Complex.extend({
              type: {
                props: [
                  {
                    name: "x",
                    type: {
                      props: [
                        {name: "y", type: ["number"]}
                      ]
                    }
                  }
                ]
              }
            });

            var derived = new Derived({x: {y: [1]}});
            var getter  = buildGetter(derived);
            var sloppyResult;// = undefined;
            var strictError = errorMatch.argInvalid("name");
            sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, [["x", "z", 1]], sloppyResult, strictError);
          });
        });
      });

      describe("#path(step1, step2, ...)", function() {
        it("should call `_path` with ([step1, step2, ...], false)", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: "string"}]}
          });

          function expectIt(args) {
            var derived = new Derived({x: "1"});

            spyOn(derived, "_path");

            derived.path.apply(derived, args);

            var realArgs = derived._path.calls.argsFor(0);
            expect(realArgs.length).toBe(2);
            expect(Array.prototype.slice.call(realArgs[0])).toEqual(args);
            expect(realArgs[1]).toBe(false);
          }

          expectIt(["x"]);
          expectIt(["x", "1"]);
          expectIt(["1"]);
          expectIt([1]);
          expectIt([]);
        });
      }); // end path
    });

    describe("Property As List", function() {

      describe("#at(name, index[, sloppy])", function() {

        describe("when `name` is not that of a defined property", function() {
          var Derived = Complex.extend();
          var derived = new Derived();

          var getter = function(args) {
            return derived.at.apply(derived, args);
          };

          var sloppyResult;// = undefined;
          var strictError = errorMatch.argInvalid("name");
          sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, ["y", 0], sloppyResult, strictError);
        });

        describe("when `name` is that of an element property", function() {

          describe("when index is 0 and the property value is non-null", function() {
            var Derived = Complex.extend({
              type: {props: [{name: "x", type: "string"}]}
            });

            var derived = new Derived({x: "1"});

            var getter = function(args) {
              return derived.at.apply(derived, args);
            };

            var elem = derived.get("x");
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x", 0], elem);
          });

          describe("when index is <> 0 and the property value is non-null", function() {
            var Derived = Complex.extend({
              type: {props: [{name: "x", type: "string"}]}
            });

            var derived = new Derived({x: "1"});

            var getter = function(args) {
              return derived.at.apply(derived, args);
            };

            var result = null;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x", -1], result);
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x", +1], result);
          });

          describe("when the property value is null, for any non-null index", function() {
            var Derived = Complex.extend({
              type: {props: [{name: "x", type: "string"}]}
            });

            var derived = new Derived();

            var getter = function(args) {
              return derived.at.apply(derived, args);
            };

            var result = null;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x", -1], result);
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x",  0], result);
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x", +1], result);
          });

          describe("when index is nully", function() {
            var Derived = Complex.extend({
              type: {props: [{name: "x", type: "string"}]}
            });

            var derived = new Derived();

            var getter = function(args) {
              return derived.at.apply(derived, args);
            };

            var strictError = errorMatch.argRequired("index");
            sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, ["x", null], strictError);
            sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, ["x", undefined], strictError);
          });
        });

        describe("when `name` is that of a list property", function() {
          describe("when index exists", function() {
            var Derived = Complex.extend({
              type: {props: [{name: "x", type: ["string"]}]}
            });

            var derived = new Derived({"x": ["1", "2"]});

            var getter = function(args) {
              return derived.at.apply(derived, args);
            };

            var list = derived.get("x");
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x", 0], list.at(0));
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x", 1], list.at(1));
          });

          describe("when index is out of range", function() {
            var Derived = Complex.extend({
              type: {props: [{name: "x", type: ["string"]}]}
            });

            var derived = new Derived({"x": ["1", "2"]});

            var getter = function(args) {
              return derived.at.apply(derived, args);
            };

            var result = null;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x", -1], result);
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x", +2], result);
          });
        });
      }); // end at

      describe("#atv(name, index[, sloppy])", function() {

        var Derived = Complex.extend({
          type: {props: [
            {name: "x", type: "string"},
            {name: "z", type: "object"}
          ]}
        });

        it("should call `at` with the given arguments", function() {

          function expectIt(args, argsExpected) {
            var derived = new Derived({x: "1"});

            spyOn(derived, "at");

            derived.atv.apply(derived, args);

            expect(derived.at.calls.argsFor(0)).toEqual(argsExpected);
          }

          expectIt(["x", 0], ["x", 0, undefined]);
          expectIt(["x", 0, true], ["x", 0, true]);
        });

        it("should return the result of `at`, if it is nully", function() {
          var derived = new Derived();

          function expectIt(args, resultExpected) {
            expect(derived.atv.apply(derived, args)).toBe(resultExpected);
          }

          expectIt(["x", 0, false], null);
          expectIt(["x", 1, false], null);
          expectIt(["y", 0,  true], undefined);
        });

        it("should return the value of the result of `at`, if it is not nully", function() {
          var v = {};
          var derived = new Derived({z: {v: v}});

          expect(derived.atv("z", 0, false)).toBe(v);
        });
      }); // end atv

      describe("#atf(name, index[, sloppy])", function() {

        var Derived = Complex.extend({type: {
          props: [
            {name: "x", type: "string"},
            {name: "z", type: "object"}
          ]
        }});

        it("should call `at` with the given arguments", function() {

          function expectIt(args, argsExpected) {
            var derived = new Derived({x: "1"});

            spyOn(derived, "at");

            derived.atf.apply(derived, args);

            expect(derived.at.calls.argsFor(0)).toEqual(argsExpected);
          }

          expectIt(["x", 0], ["x", 0, undefined]);
          expectIt(["x", 0, true], ["x", 0, true]);
        });

        it("should return '' if the result of `at` is nully", function() {
          var derived = new Derived();

          function expectIt(args, resultExpected) {
            expect(derived.atf.apply(derived, args)).toBe(resultExpected);
          }

          expectIt(["x", 0, false], "");
          expectIt(["x", 1, false], "");
          expectIt(["y", 0,  true], "");
        });

        it("should return the toString() of the result of `at`, if it is not nully", function() {
          var v = {};
          var f = "foo";
          var derived = new Derived({z: {v: v, f: f}});

          expect(derived.atf("z", 0, false)).toBe(f);
        });
      }); // end atf

      describe("#count(name[, sloppy])", function() {

        function buildGetter(derived) {
          return function(args) {
            return derived.count.apply(derived, args);
          };
        }

        describe("when `name` is not that of a defined property", function() {
          var Derived = Complex.extend();
          var derived = new Derived();
          var getter = buildGetter(derived);

          var sloppyResult = 0;
          var strictError  = errorMatch.argInvalid("name");
          sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, ["y"], sloppyResult, strictError);
        });

        describe("when `name` is that of an element property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          describe("when the property value is null", function() {
            var derived = new Derived();
            var getter = buildGetter(derived);

            var result = 0;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x"], result);
          });

          describe("when the property value is not null", function() {
            var derived = new Derived([1]);
            var getter = buildGetter(derived);

            var result = 1;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x"], result);
          });
        });

        describe("when `name` is that of a list property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", type: ["string"]}]}
          });

          var result, derived, getter;

          // ---
          derived = new Derived([[1]]);
          getter = buildGetter(derived);

          result = 1;
          sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x"], result);

          // ---
          derived = new Derived([[1, 2]]);
          getter = buildGetter(derived);

          result = 2;
          sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x"], result);
        });
      }); // end count
    });

    describe("Property As Element", function() {

      describe("#first(name[, sloppy])", function() {
        var Derived = Complex.extend({type: {
          props: [
            {name: "x", type: "string"},
            {name: "z", type: "string"}
          ]
        }});

        it("should call `at` with (name, 0, sloppy)", function() {

          function expectIt(args, argsExpected) {
            var derived = new Derived({x: "1"});

            spyOn(derived, "at");

            derived.first.apply(derived, args);

            expect(derived.at.calls.argsFor(0)).toEqual(argsExpected);
          }

          expectIt(["x"], ["x", 0, undefined]);
          expectIt(["x", true], ["x", 0, true]);
          expectIt(["x", false], ["x", 0, false]);
        });

        it("should return the value returned by at", function() {
          var derived = new Derived({x: "1"});

          expect(derived.first("x").value).toBe("1");
          expect(derived.first("y", true)).toBe(undefined);
          expect(derived.first("z")).toBe(null);
        });
      }); // end first

      describe("#firstv(name[, sloppy])", function() {
        var Derived = Complex.extend({type: {
          props: [
            {name: "x", type: "string"},
            {name: "z", type: "object"}
          ]
        }});

        it("should call `atv` with (name, 0, sloppy)", function() {

          function expectIt(args, argsExpected) {
            var derived = new Derived({x: "1"});

            spyOn(derived, "atv");

            derived.firstv.apply(derived, args);

            expect(derived.atv.calls.argsFor(0)).toEqual(argsExpected);
          }

          expectIt(["x"], ["x", 0, undefined]);
          expectIt(["x", true], ["x", 0, true]);
          expectIt(["x", false], ["x", 0, false]);
        });

        it("should return the value returned by atv", function() {
          var v = {};
          var derived = new Derived({x: "1", z: {v: v}});

          expect(derived.firstv("x")).toBe("1");
          expect(derived.firstv("y", true)).toBe(undefined);
          expect(derived.firstv("z")).toBe(v);

          derived = new Derived();
          expect(derived.firstv("x")).toBe(null);
        });
      }); // end firstv

      describe("#firstf(name[, sloppy])", function() {
        var Derived = Complex.extend({type: {
          props: [
            {name: "x", type: "string"},
            {name: "z", type: "object"}
          ]
        }});

        it("should call `atf` with (name, 0, sloppy)", function() {

          function expectIt(args, argsExpected) {
            var derived = new Derived({x: "1"});

            spyOn(derived, "atf");

            derived.firstf.apply(derived, args);

            expect(derived.atf.calls.argsFor(0)).toEqual(argsExpected);
          }

          expectIt(["x"], ["x", 0, undefined]);
          expectIt(["x", true], ["x", 0, true]);
          expectIt(["x", false], ["x", 0, false]);
        });

        it("should return the value returned by atf", function() {
          var v = {};
          var f = "foo";
          var derived = new Derived({x: "1", z: {v: v, f: f}});

          expect(derived.firstf("x")).toBe("1");
          expect(derived.firstf("y", true)).toBe("");
          expect(derived.firstf("z")).toBe(f);

          derived = new Derived();
          expect(derived.firstf("x")).toBe("");
        });
      }); // end firstf
    });

    describe("Property Attributes", function() {

      describe("#isApplicable(name)", function() {
        it("should return the evaluated static value of an existing property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", isApplicable: false}]}
          });

          var derived = new Derived();

          expect(derived.isApplicable("x")).toBe(false);
        });

        it("should return the evaluated dynamic value of an existing property", function() {
          var Derived = Complex.extend({
            type: {
              props: [{
                name: "x", isApplicable: function() {
                  return this.foo;
                }
              }]
            }
          });

          var derived = new Derived();

          derived.foo = true;

          expect(derived.isApplicable("x")).toBe(true);

          derived.foo = false;

          expect(derived.isApplicable("x")).toBe(false);
        });

        it("should throw when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isApplicable("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
           "even if of same name as an existing one", function() {
          var Other = Complex.extend({type: {props: [{name: "x"}]}});

          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isApplicable(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      }); // end applicable

      describe("#isEnabled(name)", function() {
        it("should return the evaluated static value of an existing property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", isEnabled: true}]}
          });

          var derived = new Derived();

          expect(derived.isEnabled("x")).toBe(true);
        });

        it("should return the evaluated dynamic value of an existing property", function() {
          var Derived = Complex.extend({
            type: {
              props: [{
                name: "x", isEnabled: function() {
                  return this.foo;
                }
              }]
            }
          });

          var derived = new Derived();

          derived.foo = false;

          expect(derived.isEnabled("x")).toBe(false);

          derived.foo = true;

          expect(derived.isEnabled("x")).toBe(true);
        });

        it("should throw when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isEnabled("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
           "even if of same name as an existing one", function() {
          var Other = Complex.extend({type: {props: [{name: "x"}]}});

          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isEnabled(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      }); // end isEnabled

      describe("#isRequired(name)", function() {
        it("should return the evaluated static value of an existing property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", isRequired: true}]}
          });

          var derived = new Derived();

          expect(derived.isRequired("x")).toBe(true);
        });

        it("should return the evaluated dynamic value of an existing property", function() {
          var Derived = Complex.extend({
            type: {
              props: [{
                name: "x", isRequired: function() {
                  return this.foo;
                }
              }]
            }
          });

          var derived = new Derived();

          derived.foo = true;

          expect(derived.isRequired("x")).toBe(true);

          derived.foo = false;

          expect(derived.isRequired("x")).toBe(false);
        });

        it("should throw when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isRequired("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
           "even if of same name as an existing one", function() {
          var Other = Complex.extend({type: {props: [{name: "x"}]}});

          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isRequired(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      }); // end required

      describe("#countRange(name)", function() {
        it("should return the evaluated static value of an existing property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x", countMin: 1, countMax: 1}]}
          });

          var derived = new Derived();

          var range = derived.countRange("x");
          expect(range.min).toBe(1);
          expect(range.max).toBe(1);
        });

        it("should return the evaluated dynamic value of an existing property", function() {
          var Derived = Complex.extend({
            type: {
              props: [{
                name: "x", countMin: function() {
                  return this.fooMin;
                }
              }]
            }
          });

          var derived = new Derived();

          derived.fooMin = 0;

          expect(derived.countRange("x").min).toBe(0);

          derived.fooMin = 1;

          expect(derived.countRange("x").min).toBe(1);
        });

        it("should throw when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.countRange("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when the given property type object is not owned by the complex, " +
           "even if of an existing name", function() {
          var Other = Complex.extend({type: {props: [{name: "x"}]}});

          var Derived = Complex.extend({
            type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.countRange(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      }); // end countRange
    });

    describe("#clone", function() {

      it("should return a distinct object", function() {
        var MyComplex = Complex.extend();
        var a = new MyComplex();
        var b = a.clone();
        expect(a instanceof Object).toBe(true);
        expect(a).not.toBe(b);
      });

      it("should return an object with a different uid", function() {
        var MyComplex = Complex.extend();
        var a = new MyComplex();
        var b = a.clone();
        expect(a.$uid).not.toBe(b.$uid);
      });

      it("should create an object of the same complex type", function() {
        var MyComplex = Complex.extend();
        var a = new MyComplex();
        var b = a.clone();
        expect(a.constructor).toBe(b.constructor);
      });

      it("should create an object having the same element value instances", function() {
        var MyComplex1 = Complex.extend();
        var MyComplex2 = Complex.extend({
          type: {
            props: ["a", "b", {name: "c", type: MyComplex1}]
          }
        });

        var a = new MyComplex2([1, 2, {}]);
        var b = a.clone();
        expect(a.get("a")).toBe(b.get("a"));
        expect(a.get("b")).toBe(b.get("b"));
        expect(a.get("c")).toBe(b.get("c"));
      });

      it("should create an object having distinct list value instances but the same list elements", function() {
        var MyComplex1 = Complex.extend();
        var MyComplex2 = Complex.extend({
          type: {
            props: [
              {name: "a", type: [MyComplex1]}
            ]
          }
        });

        var a = new MyComplex2([[{}, {}, {}]]);
        var b = a.clone();
        var aList = a.get("a");
        var bList = b.get("a");
        expect(aList).not.toBe(bList);
        expect(aList.count).toBe(bList.count);
        expect(aList.at(0)).toBe(bList.at(0));
        expect(aList.at(1)).toBe(bList.at(1));
        expect(aList.at(2)).toBe(bList.at(2));
      });

    });

    describe("#_configure(config)", function() {

      describe("when config is a complex that is not a subtype of it", function() {
        it("should do nothing, even if properties has the same names and types", function() {
          var Derived1 = Complex.extend({type: {props: ["a", "b"]}});
          var Derived2 = Complex.extend({type: {props: ["a", "b"]}});

          var derived1 = new Derived1({a: "a1", b: "b1"});
          var derived2 = new Derived2({a: "a2", b: "b2"});

          expect(derived1.a).toBe("a1");
          expect(derived1.b).toBe("b1");

          derived1.configure(derived2);

          expect(derived1.a).toBe("a1");
          expect(derived1.b).toBe("b1");
        });
      });

      describe("when config is a complex from a subtype of it", function() {

        it("should copy all base properties", function() {
          var Derived1 = Complex.extend({type: {props: ["a", "b"]}});
          var Derived2 = Derived1.extend();

          var derived1 = new Derived1({a: "a1", b: "b1"});
          var derived2 = new Derived2({a: "a2", b: "b2"});

          expect(derived1.a).toBe("a1");
          expect(derived1.b).toBe("b1");

          derived1.configure(derived2);

          expect(derived1.a).toBe("a2");
          expect(derived1.b).toBe("b2");
        });

        it("should copy all base properties even when overridden", function() {
          var Derived1 = Complex.extend({type: {props: ["a"]}});
          var Derived2 = Derived1.extend({type: {props: [
            {name: "a", label: "A2"}
          ]}});

          var derived1 = new Derived1({a: "a1"});
          var derived2 = new Derived2({a: "a2"});

          expect(derived1.a).toBe("a1");

          derived1.configure(derived2);

          expect(derived1.a).toBe("a2");
        });

        it("should copy ignore properties of the subtype", function() {
          var Derived1 = Complex.extend({type: {props: ["a"]}});
          var Derived2 = Derived1.extend({type: {props: ["c"]}});

          var derived1 = new Derived1({a: "a1"});
          var derived2 = new Derived2({a: "a2", c: "c2"});

          expect(derived1.a).toBe("a1");

          derived1.configure(derived2);

          expect(derived1.a).toBe("a2");
        });

        it("should copy when target property is null and config is not", function() {
          var Derived1 = Complex.extend({type: {props: ["a"]}});
          var Derived2 = Derived1.extend();

          var derived1 = new Derived1();
          var derived2 = new Derived2({a: "a2"});

          expect(derived1.a).toBe(null);

          derived1.configure(derived2);

          expect(derived1.a).toBe("a2");
        });

        it("should copy when config property is null and target is not", function() {
          var Derived1 = Complex.extend({type: {props: ["a"]}});
          var Derived2 = Derived1.extend();

          var derived1 = new Derived1({a: "a1"});
          var derived2 = new Derived2({a: null});

          expect(derived1.a).toBe("a1");

          derived1.configure(derived2);

          expect(derived1.a).toBe(null);
        });
      });

      describe("when config is a not a complex", function() {

        it("should copy all own properties", function() {
          var Derived1 = Complex.extend({type: {props: ["a", "b"]}});

          var derived1 = new Derived1({a: "a1", b: "b1"});
          var derived2 = {a: "a2", b: "b2"};

          expect(derived1.a).toBe("a1");
          expect(derived1.b).toBe("b1");

          derived1.configure(derived2);

          expect(derived1.a).toBe("a2");
          expect(derived1.b).toBe("b2");
        });

        it("should ignore non-own properties", function() {
          var Derived1 = Complex.extend({type: {props: ["a", "b"]}});

          var derived1 = new Derived1({a: "a1", b: "b1"});
          var derived2 = Object.create({a: "a3"});
          derived2.b = "b2";

          expect(derived1.a).toBe("a1");
          expect(derived1.b).toBe("b1");

          derived1.configure(derived2);

          expect(derived1.a).toBe("a1");
          expect(derived1.b).toBe("b2");
        });

        it("should throw on an undefined property (non-sloppy)", function() {
          var Derived1 = Complex.extend({type: {props: ["a", "b"]}});

          var derived1 = new Derived1({a: "a1", b: "b1"});
          var derived2 = {c: "c2"};

          expect(function() {
            derived1.configure(derived2);
          }).toThrow(errorMatch.argInvalid("name"));
        });
      });
    });

    describe("#_addReference(container, propType)", function() {

      it("should be called when a complex container is set to this value", function() {
        var Derived = Complex.extend();
        var Container = Complex.extend({type: {props: [{name: "a", type: Derived}]}});

        spyOn(Derived.prototype, "_addReference");

        var value = new Derived();
        var container = new Container({a: value});

        expect(value._addReference).toHaveBeenCalled();
      });

      it("should be called with the complex container and its property type", function() {
        var Derived = Complex.extend();
        var Container = Complex.extend({type: {props: [{name: "a", type: Derived}]}});

        spyOn(Derived.prototype, "_addReference");

        var value = new Derived();
        var container = new Container({a: value});

        expect(value._addReference).toHaveBeenCalledWith(container, Container.type.get("a"));
      });

      // TODO: if an when lists are created without a changeset/txn, uncomment this.
      /*
      it("should be called when added to a list container", function() {
        var Derived = Complex.extend();
        var Container = Complex.extend({type: {props: [{name: "as", type: [Derived]}]}});

        var value = new Derived();
        var container = new Container({as: [value]});

        spyOn(Derived.prototype, "_addReference");

        expect(value._addReference).toHaveBeenCalledWith(container.as, null);
      });
      */
    });
  }); // pentaho.type.Complex
});
