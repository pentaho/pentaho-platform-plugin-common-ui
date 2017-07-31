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

  /* eslint max-nested-callbacks: 0 */

  describe("pentaho.type.Complex", function() {

    var context;
    var Value;
    var Complex;
    var Property;
    var List;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Value = context.get("value");
            Complex = context.get("complex");
            Property = context.get("property");
            List = context.get("list");
          })
          .then(done, done.fail);
    });

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
        expect(complex.$type.count).toBe(0);
      });
    });

    describe("new DerivedComplex()", function() {
      var Derived;

      beforeEach(function() {
        Derived = Complex.extend({
          $type: {
            label: "Derived",
            props: [
              "x",
              "y",
              {name: "z", valueType: ["string"]},
              {name: "w", valueType: "string", defaultValue: "foo"},
              {name: "q", valueType: "string", defaultValue: function() { return "bar"; }}
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
          expect(derived.get("w").value).toBe("foo");
          expect(derived.get("q").value).toBe("bar");
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

      describe("when setting a property to null", function() {

        it("should call the defaultValue factory function each time and use its result", function() {

          var f = jasmine.createSpy().and.returnValue("bar");
          Derived.type.add({
            name: "t",
            valueType: "string",
            defaultValue: f
          });

          var derived = new Derived();

          expect(f).toHaveBeenCalledTimes(1);
          expect(derived.t).toBe("bar");

          derived.t = null;

          expect(f).toHaveBeenCalledTimes(2);
          expect(derived.t).toBe("bar");

          derived.t = null;

          expect(f).toHaveBeenCalledTimes(3);
          expect(derived.t).toBe("bar");
        });
      });
    });

    describe("#$uid", function() {
      it("should return a string value", function() {
        var uid = new Complex().$uid;
        expect(typeof uid).toBe("string");
      });

      it("should have a distinct value for every instance", function() {
        var uid1 = new Complex().$uid;
        var uid2 = new Complex().$uid;
        var uid3 = new Complex().$uid;
        expect(uid1).not.toBe(uid2);
        expect(uid2).not.toBe(uid3);
        expect(uid3).not.toBe(uid1);
      });
    });

    describe("#$key", function() {

      it("should return the value of #$uid", function() {

        var value = new Complex();

        expect(value.$key).toBe(value.$uid);
      });
    });

    describe("Property As Raw", function() {

      describe("#get(name[, sloppy])", function() {

        var derived2;

        function getter(args) {
          return derived2.get.apply(derived2, args);
        }

        it("should return the `Value` of an existing singular property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", valueType: "string"}]}
          });

          var derived = new Derived({x: "1"});

          var value = derived.get("x");

          expect(value instanceof Value).toBe(true);
          expect(value.value).toBe("1");
        });

        it("should return the value of an existing property given its type object", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", valueType: "string"}]}
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
            $type: {props: [{name: "x", valueType: ["string"]}]}
          });

          var derived = new Derived();

          var values = derived.get("x");

          expect(values instanceof List).toBe(true);
          expect(values.count).toBe(0);
        });

        it("should return the same `List` of an existing list property every time", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", valueType: ["string"]}]}
          });

          var derived = new Derived({x: ["1"]});

          expect(derived.get("x")).toBe(derived.get("x"));
        });

        describe("when name is not specified", function() {

          beforeEach(function() {
            var Derived = Complex.extend();
            derived2 = new Derived();
          });

          var strictError = errorMatch.argRequired("name");

          sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [null], strictError);
          sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [undefined], strictError);
        });

        describe("when given the name of an undefined property", function() {

          beforeEach(function() {
            var Derived = Complex.extend({
              $type: {props: [{name: "x"}]}
            });
            derived2 = new Derived();
          });

          var sloppyResult;// = undefined;
          var strictError  = errorMatch.argInvalid("name");

          sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, ["y"], sloppyResult, strictError);
        });
      }); // end get

      describe("#getv(name[, sloppy])", function() {

        var Derived;

        beforeEach(function() {
          Derived = Complex.extend({
            $type: {props: [
              {name: "x", valueType: "string"},
              {name: "z", valueType: "object"}
            ]}
          });
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
      }); // end getv

      describe("#getf(name[, sloppy])", function() {

        var Derived;

        beforeEach(function() {
          Derived = Complex.extend({$type: {
            props: [
              {name: "x", valueType: "string"},
              {name: "z", valueType: "object"}
            ]
          }});
        });

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
          expectIt(["y", true], "");
        });

        it("should return the toString() of the result of `get`, if it is not nully", function() {
          var v = {};
          var f = "foo";
          var derived = new Derived({z: {v: v, f: f}});

          expect(derived.getf("z", false)).toBe(f);
        });
      }); // end getf

      describe("#set(name, valueSpec)", function() {
        it("should set the value of an existing property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", valueType: "string"}]}
          });

          var derived = new Derived();

          derived.set("x", "1");

          var value = derived.get("x");
          expect(value.value).toBe("1");
        });

        it("should throw a TypeError if the property is read-only", function() {

          var Derived = Complex.extend({
            $type: {props: [{name: "x", valueType: "string", isReadOnly: true, defaultValue: "2"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.set("x", "1");
          }).toThrowError(TypeError);

          expect(derived.x).toBe("2");
        });

        it("should set the value of an existing list property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", valueType: ["string"]}]}
          });

          var derived = new Derived();

          derived.set("x", ["1", "2"]);

          var value = derived.get("x");
          expect(value instanceof List).toBe(true);
          expect(value.count).toBe(2);
        });

        it("should keep the value of property if the new is equals", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", valueType: "string"}]}
          });

          var derived = new Derived({"x": "1"});

          var beforeValue = derived.get("x");

          derived.set("x", "1");

          var afterValue = derived.get("x");

          expect(beforeValue).toBe(afterValue);
        });

        it("should replace the value of property if the new is different", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", valueType: "string"}]}
          });

          var derived = new Derived({"x": "1"});

          var beforeValue = derived.get("x");

          derived.set("x", "2");

          var afterValue = derived.get("x");

          expect(beforeValue).not.toBe(afterValue);
        });

        it("should throw when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.set("y", "1");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        describe("events -", function() {
          var listeners;
          var complex;
          var THREE = 3;
          var Derived;

          beforeEach(function() {

            Derived = Complex.extend({
              $type: {props: [
                {name: "x", valueType: "number"},
                {name: "y", valueType: ["number"]}
              ]}
            });

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
          }); // end without listeners

          describe("With listeners -", function() {
            beforeEach(function() {
              complex.on("will:change", listeners.will);
              complex.on("rejected:change", listeners.rejected);
              complex.on("did:change", listeners.did);
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

              expect(complex.y.at(0).value).toBe(1);
              expect(complex.y.at(1).value).toBe(2);
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
    });

    describe("Property As List", function() {

      describe("#countOf(name[, sloppy])", function() {

        var derived;

        function getter(args) {
          return derived.countOf.apply(derived, args);
        }

        describe("when `name` is not that of a defined property", function() {

          var sloppyResult = 0;
          var strictError  = errorMatch.argInvalid("name");

          beforeEach(function() {
            var Derived = Complex.extend();
            derived = new Derived();
          });

          sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, ["y"], sloppyResult, strictError);
        });

        describe("when `name` is that of an element property", function() {
          var Derived;

          beforeEach(function() {
            Derived = Complex.extend({
              $type: {props: [{name: "x"}]}
            });
          });


          describe("when the property value is null", function() {

            var result = 0;

            beforeEach(function() {
              derived = new Derived();
            });

            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x"], result);
          });

          describe("when the property value is not null", function() {

            var result = 1;

            beforeEach(function() {
              derived = new Derived([1]);
            });

            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x"], result);
          });
        });

        describe("when `name` is that of a list property", function() {

          var Derived;

          beforeEach(function() {
            Derived = Complex.extend({
              $type: {props: [{name: "x", valueType: ["string"]}]}
            });
          });

          describe("test 1", function() {
            beforeEach(function() {
              derived = new Derived([[1]]);
            });

            var result = 1;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x"], result);
          });

          describe("test 2", function() {
            beforeEach(function() {
              derived = new Derived([[1, 2]]);
            });

            var result = 2;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x"], result);
          });
        });
      }); // end countOf
    });

    describe("Property Attributes", function() {

      describe("Property#isReadOnly", function() {

        it("should make the list of a read-only list property, read-only", function() {

          var Derived = Complex.extend({
            $type: {props: [{name: "x", valueType: ["string"], isReadOnly: true}]}
          });

          var derived = new Derived();

          expect(derived.x.$isReadOnly).toBe(true);
        });

        it("should make the list of a writable list property, writable", function() {

          var Derived = Complex.extend({
            $type: {props: [{name: "x", valueType: ["string"]}]}
          });

          var derived = new Derived();

          expect(derived.x.$isReadOnly).toBe(false);
        });
      });

      describe("#isApplicableOf(name)", function() {
        it("should return the evaluated static value of an existing property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", isApplicable: false}]}
          });

          var derived = new Derived();

          expect(derived.isApplicableOf("x")).toBe(false);
        });

        it("should return the evaluated dynamic value of an existing property", function() {
          var Derived = Complex.extend({
            $type: {
              props: [{
                name: "x", isApplicable: function() {
                  return this.foo;
                }
              }]
            }
          });

          var derived = new Derived();

          derived.foo = true;

          expect(derived.isApplicableOf("x")).toBe(true);

          derived.foo = false;

          expect(derived.isApplicableOf("x")).toBe(false);
        });

        it("should throw when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isApplicableOf("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
           "even if of same name as an existing one", function() {
          var Other = Complex.extend({$type: {props: [{name: "x"}]}});

          var Derived = Complex.extend({
            $type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isApplicableOf(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      }); // end isApplicableOf

      describe("#isEnabledOf(name)", function() {
        it("should return the evaluated static value of an existing property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", isEnabled: true}]}
          });

          var derived = new Derived();

          expect(derived.isEnabledOf("x")).toBe(true);
        });

        it("should return the evaluated dynamic value of an existing property", function() {
          var Derived = Complex.extend({
            $type: {
              props: [{
                name: "x", isEnabled: function() {
                  return this.foo;
                }
              }]
            }
          });

          var derived = new Derived();

          derived.foo = false;

          expect(derived.isEnabledOf("x")).toBe(false);

          derived.foo = true;

          expect(derived.isEnabledOf("x")).toBe(true);
        });

        it("should throw when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isEnabledOf("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
           "even if of same name as an existing one", function() {
          var Other = Complex.extend({$type: {props: [{name: "x"}]}});

          var Derived = Complex.extend({
            $type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isEnabledOf(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      }); // end isEnabledOf

      describe("#isRequiredOf(name)", function() {
        it("should return the evaluated static value of an existing property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", isRequired: true}]}
          });

          var derived = new Derived();

          expect(derived.isRequiredOf("x")).toBe(true);
        });

        it("should return the evaluated dynamic value of an existing property", function() {
          var Derived = Complex.extend({
            $type: {
              props: [{
                name: "x", isRequired: function() {
                  return this.foo;
                }
              }]
            }
          });

          var derived = new Derived();

          derived.foo = true;

          expect(derived.isRequiredOf("x")).toBe(true);

          derived.foo = false;

          expect(derived.isRequiredOf("x")).toBe(false);
        });

        it("should throw when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isRequiredOf("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
           "even if of same name as an existing one", function() {
          var Other = Complex.extend({$type: {props: [{name: "x"}]}});

          var Derived = Complex.extend({
            $type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.isRequiredOf(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      }); // end isRequiredOf

      describe("#countRangeOf(name)", function() {
        it("should return the evaluated static value of an existing property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x", countMin: 1, countMax: 1}]}
          });

          var derived = new Derived();

          var range = derived.countRangeOf("x");
          expect(range.min).toBe(1);
          expect(range.max).toBe(1);
        });

        it("should return the evaluated dynamic value of an existing property", function() {
          var Derived = Complex.extend({
            $type: {
              props: [{
                name: "x", countMin: function() {
                  return this.fooMin;
                }
              }]
            }
          });

          var derived = new Derived();

          derived.fooMin = 0;

          expect(derived.countRangeOf("x").min).toBe(0);

          derived.fooMin = 1;

          expect(derived.countRangeOf("x").min).toBe(1);
        });

        it("should throw when given the name of an undefined property", function() {
          var Derived = Complex.extend({
            $type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.countRangeOf("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when the given property type object is not owned by the complex, " +
           "even if of an existing name", function() {
          var Other = Complex.extend({$type: {props: [{name: "x"}]}});

          var Derived = Complex.extend({
            $type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.countRangeOf(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      }); // end countRangeOf

      describe("#domainOf(name)", function() {

        it("should return the evaluated value of an existing property", function() {

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "x", valueType: "string", domain: ["1", "2", "3"]}
              ]
            }
          });

          var derived = new Derived();

          var domain = derived.domainOf("x");
          expect(Array.isArray(domain)).toBe(true);
          expect(domain.length).toBe(3);
          expect(domain[0].value).toBe("1");
          expect(domain[1].value).toBe("2");
          expect(domain[2].value).toBe("3");
        });

        it("should throw when given the name of an undefined property", function() {

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "x", valueType: "string"}
              ]
            }
          });

          var derived = new Derived();

          expect(function() {
            derived.domainOf("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
            "even if of same name as an existing one", function() {

          var Other = Complex.extend({$type: {props: [{name: "x"}]}});

          var Derived = Complex.extend({
            $type: {props: [{name: "x"}]}
          });

          var derived = new Derived();

          expect(function() {
            derived.domainOf(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      }); // end domainOf

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
          $type: {
            props: ["a", "b", {name: "c", valueType: MyComplex1}]
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
          $type: {
            props: [
              {name: "a", valueType: [MyComplex1]}
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
          var Derived1 = Complex.extend({$type: {props: ["a", "b"]}});
          var Derived2 = Complex.extend({$type: {props: ["a", "b"]}});

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
          var Derived1 = Complex.extend({$type: {props: ["a", "b"]}});
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
          var Derived1 = Complex.extend({$type: {props: ["a"]}});
          var Derived2 = Derived1.extend({$type: {props: [
            {name: "a", label: "A2"}
          ]}});

          var derived1 = new Derived1({a: "a1"});
          var derived2 = new Derived2({a: "a2"});

          expect(derived1.a).toBe("a1");

          derived1.configure(derived2);

          expect(derived1.a).toBe("a2");
        });

        it("should copy ignore properties of the subtype", function() {
          var Derived1 = Complex.extend({$type: {props: ["a"]}});
          var Derived2 = Derived1.extend({$type: {props: ["c"]}});

          var derived1 = new Derived1({a: "a1"});
          var derived2 = new Derived2({a: "a2", c: "c2"});

          expect(derived1.a).toBe("a1");

          derived1.configure(derived2);

          expect(derived1.a).toBe("a2");
        });

        it("should copy when target property is null and config is not", function() {
          var Derived1 = Complex.extend({$type: {props: ["a"]}});
          var Derived2 = Derived1.extend();

          var derived1 = new Derived1();
          var derived2 = new Derived2({a: "a2"});

          expect(derived1.a).toBe(null);

          derived1.configure(derived2);

          expect(derived1.a).toBe("a2");
        });

        it("should copy when config property is null and target is not", function() {
          var Derived1 = Complex.extend({$type: {props: ["a"]}});
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
          var Derived1 = Complex.extend({$type: {props: ["a", "b"]}});

          var derived1 = new Derived1({a: "a1", b: "b1"});
          var derived2 = {a: "a2", b: "b2"};

          expect(derived1.a).toBe("a1");
          expect(derived1.b).toBe("b1");

          derived1.configure(derived2);

          expect(derived1.a).toBe("a2");
          expect(derived1.b).toBe("b2");
        });

        it("should ignore non-own properties", function() {
          var Derived1 = Complex.extend({$type: {props: ["a", "b"]}});

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
          var Derived1 = Complex.extend({$type: {props: ["a", "b"]}});

          var derived1 = new Derived1({a: "a1", b: "b1"});
          var derived2 = {c: "c2"};

          expect(function() {
            derived1.configure(derived2);
          }).toThrow(errorMatch.argInvalid("name"));
        });
      });
    });

    describe("#__addReference(container, propType)", function() {

      it("should be called when a complex container is set to this value", function() {
        var Derived = Complex.extend();
        var Container = Complex.extend({$type: {props: [{name: "a", valueType: Derived}]}});

        spyOn(Derived.prototype, "__addReference");

        var value = new Derived();
        var container = new Container({a: value});

        expect(value.__addReference).toHaveBeenCalled();
      });

      it("should be called with the complex container and its property type", function() {
        var Derived = Complex.extend();
        var Container = Complex.extend({$type: {props: [{name: "a", valueType: Derived}]}});

        spyOn(Derived.prototype, "__addReference");

        var value = new Derived();
        var container = new Container({a: value});

        expect(value.__addReference).toHaveBeenCalledWith(container, Container.type.get("a"));
      });

      it("should be called when added to a list container", function() {
        var Derived = Complex.extend();
        var Container = Complex.extend({$type: {props: [{name: "as", valueType: [Derived]}]}});

        spyOn(Derived.prototype, "__addReference");

        var value = new Derived();
        var container = new Container({as: [value]});

        expect(value.__addReference).toHaveBeenCalledWith(container.as);
      });
    });
  }); // pentaho.type.Complex
});
