/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/Value",
  "pentaho/type/Complex",
  "pentaho/type/Number",
  "pentaho/type/Property",
  "pentaho/type/List",
  "pentaho/type/action/Transaction",
  "pentaho/type/PropertyTypeCollection",
  "pentaho/type/action/ComplexChangeset",
  "tests/pentaho/util/errorMatch",
  "tests/pentaho/type/sloppyModeUtil"
], function(Value, Complex, PentahoNumber, Property, List,
            Transaction, PropertyTypeCollection, ComplexChangeset, errorMatch, sloppyModeUtil) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  /* eslint-disable max-nested-callbacks, no-unused-vars */

  describe("pentaho.type.Complex", function() {

    var ComplexWithStringProp;
    var ComplexWithReadOnlyStringProp;
    var ComplexWithNumberProp;
    var ComplexWithStringListProp;
    var ComplexWithReadOnlyStringListProp;
    var ComplexWithStringAndObjectProps;
    var CustomComplex;
    var ComplexWithCustomComplexProp;
    var ComplexWithCustomComplexListProp;

    beforeAll(function() {

      ComplexWithStringProp = Complex.extend({
        $type: {props: [{name: "x", valueType: "string"}]}
      });

      ComplexWithReadOnlyStringProp = Complex.extend({
        $type: {
          props: [
            {name: "x", valueType: "string", isReadOnly: true}
          ]
        }
      });

      ComplexWithNumberProp = Complex.extend({
        $type: {
          props: [
            {name: "x", valueType: "number", defaultValue: 1}
          ]
        }
      });

      ComplexWithStringListProp = Complex.extend({
        $type: {
          props: [
            {name: "xs", valueType: ["string"]}
          ]
        }
      });

      ComplexWithReadOnlyStringListProp = Complex.extend({
        $type: {
          props: [
            {name: "xs", valueType: ["string"], isReadOnly: true}
          ]
        }
      });

      ComplexWithStringAndObjectProps = Complex.extend({
        $type: {
          props: [
            {name: "x", valueType: "string"},
            {name: "z", valueType: "object"}
          ]
        }
      });

      CustomComplex = Complex.extend();

      ComplexWithCustomComplexProp = Complex.extend({
        $type: {
          props: [
            {name: "x", valueType: CustomComplex}
          ]
        }
      });

      ComplexWithCustomComplexListProp = Complex.extend({
        $type: {
          props: [
            {name: "xs", valueType: [CustomComplex]}
          ]
        }
      });
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
    }); // end anatomy

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

          var derived = new ComplexWithStringProp({x: "1"});

          var value = derived.get("x");

          expect(value instanceof Value).toBe(true);
          expect(value.value).toBe("1");
        });

        it("should return the value of an existing property given its type object", function() {

          var derived = new ComplexWithStringProp({x: "1"});

          var pType = ComplexWithStringProp.type.get("x");
          expect(pType instanceof Property.Type).toBe(true);

          var value = derived.get(pType);

          expect(value instanceof Value).toBe(true);
          expect(value.value).toBe("1");
        });

        it("should return the `List` value of an existing list property", function() {

          var derived = new ComplexWithStringListProp();

          var values = derived.get("xs");

          expect(values instanceof List).toBe(true);
          expect(values.count).toBe(0);
        });

        it("should return the same `List` of an existing list property every time", function() {

          var derived = new ComplexWithStringListProp({xs: ["1"]});

          expect(derived.get("xs")).toBe(derived.get("xs"));
        });

        describe("when name is not specified", function() {

          beforeEach(function() {
            derived2 = new ComplexWithStringProp();
          });

          var strictError = errorMatch.argRequired("name");

          sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [null], strictError);
          sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [undefined], strictError);
        });

        describe("when given the name of an undefined property", function() {

          beforeEach(function() {
            derived2 = new ComplexWithStringProp();
          });

          var sloppyResult;// = undefined;
          var strictError  = errorMatch.argInvalid("name");

          sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, ["y"], sloppyResult, strictError);
        });
      }); // end get

      describe("#getv(name[, sloppy])", function() {

        it("should call `get` with the given arguments", function() {

          function expectIt(args, argsExpected) {

            var derived = new ComplexWithStringAndObjectProps({x: "1"});

            spyOn(derived, "get");

            derived.getv.apply(derived, args);

            expect(derived.get.calls.argsFor(0)).toEqual(argsExpected);
          }

          expectIt(["x"], ["x", undefined]);
          expectIt(["x", true], ["x", true]);
        });

        it("should return the result of `get`, if it is nully", function() {

          var derived = new ComplexWithStringAndObjectProps();

          function expectIt(args, resultExpected) {
            expect(derived.getv.apply(derived, args)).toBe(resultExpected);
          }

          expectIt(["x", false], null);
          expectIt(["x", false], null);
          expectIt(["y", true], undefined);
        });

        it("should return the value of the result of `get`, if it is not nully", function() {
          var v = {};
          var derived = new ComplexWithStringAndObjectProps({z: {v: v}});

          expect(derived.getv("z", 0, false)).toBe(v);
        });
      }); // end getv

      describe("#getf(name[, sloppy])", function() {

        it("should call `get` with the given arguments", function() {

          function expectIt(args, argsExpected) {

            var derived = new ComplexWithStringAndObjectProps({x: "1"});

            spyOn(derived, "get");

            derived.getf.apply(derived, args);

            expect(derived.get.calls.argsFor(0)).toEqual(argsExpected);
          }

          expectIt(["x"], ["x", undefined]);
          expectIt(["x", true], ["x", true]);
        });

        it("should return '' if the result of `get` is nully", function() {
          var derived = new ComplexWithStringAndObjectProps();

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
          var derived = new ComplexWithStringAndObjectProps({z: {v: v, f: f}});

          expect(derived.getf("z", false)).toBe(f);
        });
      }); // end getf

      describe("#set(name, valueSpec)", function() {

        it("should throw when given the name of an undefined property", function() {

          var value = new ComplexWithStringProp();

          expect(function() {
            value.set("y", "1");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        describe("element property", function() {

          it("should set the value of an existing property", function() {

            var value = new ComplexWithStringProp();

            value.set("x", "1");

            var propValue = value.get("x");
            expect(propValue.value).toBe("1");
          });

          it("should set the state of a defaulted element property to 'specified', " +
              "when set to the same value", function() {

            var value = new ComplexWithNumberProp();

            expect(value.isDefaultedOf("x")).toBe(true);

            value.set("x", 1);

            expect(value.isDefaultedOf("x")).toBe(false);
          });

          it("should set the state of a defaulted element property to 'specified', " +
              "when set to a different value", function() {

            var value = new ComplexWithNumberProp();

            expect(value.isDefaultedOf("x")).toBe(true);

            value.set("x", 2);

            expect(value.isDefaultedOf("x")).toBe(false);
          });

          it("should set the state of a specified element property to 'defaulted', when set to null", function() {

            var value = new ComplexWithNumberProp({x: 1});

            expect(value.isDefaultedOf("x")).toBe(false);

            value.set("x", null);

            expect(value.isDefaultedOf("x")).toBe(true);
          });

          it("should set the state of a defaulted complex property to 'specified', " +
              "when a nested change occurs", function() {

            var Derived = Complex.extend({
              $type: {
                props: [
                  {
                    name: "y",
                    valueType: ComplexWithNumberProp,
                    defaultValue: function() { return {}; }
                  }
                ]
              }
            });

            var derived = new Derived();

            expect(derived.isDefaultedOf("y")).toBe(true);

            derived.y.set("x", 2);

            expect(derived.isDefaultedOf("y")).toBe(false);
          });

          it("should throw a TypeError if the property is read-only and a change would occur", function() {

            var value = new ComplexWithReadOnlyStringProp({x: "2"});

            expect(function() {
              value.set("x", "1");
            }).toThrowError(TypeError);

            expect(value.x).toBe("2");
          });

          it("should not throw a TypeError if the property is read-only and a change would not occur", function() {

            var value = new ComplexWithReadOnlyStringProp({x: "2"});

            value.set("x", "2");

            expect(value.x).toBe("2");
          });

          it("should keep the current value of a property if the new value is equals", function() {

            var value = new ComplexWithStringProp({x: "1"});

            var beforePropValue = value.get("x");

            value.set("x", "1");

            var afterPropValue = value.get("x");

            expect(beforePropValue).toBe(afterPropValue);
          });

          it("should replace the current value of property if the new value is not equals", function() {

            var value = new ComplexWithStringProp({x: "1"});

            var beforePropValue = value.get("x");

            value.set("x", "2");

            var afterPropValue = value.get("x");

            expect(beforePropValue).not.toBe(afterPropValue);
          });
        });

        describe("list property", function() {

          it("should set the state of a defaulted list property to 'specified', " +
             "when a nested change occurs", function() {

            var MyValue = Complex.extend({
              $type: {props: [{name: "y", valueType: "number", defaultValue: 1}]}
            });

            var Derived = Complex.extend({
              $type: {props: [{name: "x", valueType: [MyValue], defaultValue: function() {
                return [new MyValue()];
              }}]}
            });

            var derived = new Derived();

            expect(derived.isDefaultedOf("x")).toBe(true);

            derived.x.at(0).set("y", 2);

            expect(derived.isDefaultedOf("x")).toBe(false);
          });

          it("should set the state of a defaulted list property to 'specified', " +
             "when a new element is added", function() {

            var MyValue = Complex.extend({
              $type: {props: [{name: "y", valueType: "number", defaultValue: 1}]}
            });

            var Derived = Complex.extend({
              $type: {props: [{name: "x", valueType: [MyValue]}]}
            });

            var derived = new Derived();

            expect(derived.isDefaultedOf("x")).toBe(true);

            derived.x.add(new MyValue());

            expect(derived.isDefaultedOf("x")).toBe(false);
          });

          it("should clear a list property if the new value is null", function() {

            var value = new ComplexWithStringListProp({xs: ["1", "2"]});

            var list = value.get("xs");
            expect(list.count).toBe(2);

            value.set("xs", null);

            expect(list.count).toBe(0);
            expect(value.get("xs")).toBe(list);
          });

          it("should set the value of a list property when given an array of specs", function() {

            var value = new ComplexWithStringListProp();

            value.set("xs", ["1", "2"]);

            var list = value.get("xs");
            expect(list.count).toBe(2);
          });

          it("should set the value of a list property when given a spec with a d array property", function() {

            var value = new ComplexWithStringListProp();

            value.set("xs", {d: ["1", "2"]});

            var list = value.get("xs");
            expect(list.count).toBe(2);
          });

          it("should clear the list property when given a spec with a null d property", function() {

            var value = new ComplexWithStringListProp({xs: ["1", "2"]});

            value.set("xs", {d: null});

            var list = value.get("xs");
            expect(list.count).toBe(0);
          });

          it("should set the value of a list property when given another List", function() {

            var value = new ComplexWithStringListProp();

            var list = value.get("xs");

            var list2 = list.$type.create(["3", "4"]);

            value.set("xs", list2);

            expect(value.get("xs")).toBe(list);
            expect(list.count).toBe(2);
            expect(list.at(0).value).toBe("3");
            expect(list.at(1).value).toBe("4");
          });

          it("should throw when given another type of spec", function() {

            var value = new ComplexWithStringListProp();

            expect(function() {
              value.set("xs", 2);
            }).toThrow(errorMatch.argInvalidType("instSpec", ["Array", "Object", "pentaho.type.List"], "number"));
          });
        });

        describe("events -", function() {
          var listeners;
          var complex;
          var THREE = 3;
          var Derived;

          beforeAll(function() {

            Derived = Complex.extend({
              $type: {
                props: [
                  {name: "x", valueType: "number"},
                  {name: "y", valueType: ["number"]}
                ]
              }
            });
          });

          beforeEach(function() {

            listeners = jasmine.createSpyObj("listeners", [
              "init",
              "will",
              "finally"
            ]);

            listeners.init.and.callFake(function(event) {
              if(event.target.x === THREE) event.reject();
            });

            complex = new Derived({x: 0});
          });

          describe("Without listeners -", function() {

            it("should not call _emitSafe or _emitGeneric.", function() {

              spyOn(complex, "_emitSafe");
              spyOn(complex, "_emitGeneric");

              complex.set("x", 1);

              expect(complex._emitSafe).not.toHaveBeenCalled();
              expect(complex._emitGeneric).not.toHaveBeenCalled();
            });
          }); // end without listeners

          describe("With listeners -", function() {

            beforeEach(function() {
              complex.on("change", listeners);
            });

            it("should call the `change:init` listener", function() {
              complex.x = 1;
              expect(listeners.init).toHaveBeenCalled();
            });

            it("should call the `change:finally` listener when successful", function() {
              complex.x = 1;
              expect(listeners.finally).toHaveBeenCalled();
              expect(complex.x).toBe(1);
            });

            it("should call the `change:finally` listener when unsuccessful", function() {
              expect(function() {
                complex.x = THREE;
              }).toThrow();

              expect(listeners.finally).toHaveBeenCalled();
              expect(complex.x).toBe(0);
            });

            // Coverage.
            it("should support having no `change:finally` listener when unsuccessful", function() {

              complex.off("change");
              complex.on("change", {init: listeners.init});

              expect(function() {
                complex.x = THREE;
              }).toThrow();

              expect(complex.x).toBe(0);
            });

            it("should allow changing an element property value, directly on the complex, " +
               "from within the `change:init` event", function() {

              listeners.init.and.callFake(function(event) {
                expect(function() {
                  event.target.x = 2;
                }).not.toThrow(); // Listeners errors are swallowed.
              });

              complex.x = 1;

              expect(listeners.init).toHaveBeenCalled();

              expect(complex.x).toBe(2);
            });

            it("should initiate a new transaction when setting from a successfull `change:finally` event", function() {
              var entryCount = 0;

              listeners.finally.and.callFake(function(event) {
                entryCount++;

                if(entryCount === 1) {
                  // Starts a nested change.
                  event.target.x = 2;
                }
              });

              complex.x = 1;

              expect(complex.x).toBe(2);

              expect(entryCount).toBe(2);
            });

            it("should initiate a new transaction when setting from a rejected `change:finally` event", function() {

              var entryCount = 0;

              listeners.finally.and.callFake(function(event) {
                entryCount++;

                if(entryCount === 1) {
                  // Starts a nested change.
                  event.target.x = 2;
                }
              });

              // First set gets rejected, but the second doesn't.
              expect(function() {
                complex.x = THREE;
              }).toThrow();

              expect(complex.x).toBe(2);
            });

            it("should emit the `change:init` and `change:will` event when setting a list property " +
              "to a different value", function() {

              complex.set("y", [1, 2]);

              expect(listeners.init).toHaveBeenCalled();
              expect(listeners.will).toHaveBeenCalled();

              expect(complex.y.at(0).value).toBe(1);
              expect(complex.y.at(1).value).toBe(2);
            });

            it("should allow changing directly the list value from within the `change:init` event", function() {

              listeners.init.and.callFake(function(event) {
                expect(function() {
                  event.target.y.add(2);
                }).not.toThrow(); // Listeners errors are swallowed.
              });

              complex.y = [1];

              expect(listeners.init).toHaveBeenCalled();

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
            derived = new ComplexWithStringProp();
          });

          sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, ["y"], sloppyResult, strictError);
        });

        describe("when `name` is that of an element property", function() {

          describe("when the property value is null", function() {

            var result = 0;

            beforeEach(function() {
              derived = new ComplexWithStringProp();
            });

            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x"], result);
          });

          describe("when the property value is not null", function() {

            var result = 1;

            beforeEach(function() {
              derived = new ComplexWithStringProp([1]);
            });

            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["x"], result);
          });
        });

        describe("when `name` is that of a list property", function() {

          describe("test 1", function() {
            beforeEach(function() {
              derived = new ComplexWithStringListProp([[1]]);
            });

            var result = 1;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["xs"], result);
          });

          describe("test 2", function() {
            beforeEach(function() {
              derived = new ComplexWithStringListProp([[1, 2]]);
            });

            var result = 2;
            sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, ["xs"], result);
          });
        });
      }); // end countOf
    });

    describe("Property Attributes", function() {

      describe("#isReadOnly", function() {

        it("should make the list of a read-only list property, read-only", function() {

          var derived = new ComplexWithReadOnlyStringListProp();

          expect(derived.xs.$isReadOnly).toBe(true);
        });

        it("should make the list of a writable list property, writable", function() {

          var derived = new ComplexWithStringListProp();

          expect(derived.xs.$isReadOnly).toBe(false);
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
          var derived = new ComplexWithStringProp();

          expect(function() {
            derived.isApplicableOf("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
           "even if of same name as an existing one", function() {

          var Other = Complex.extend({
            $type: {
              props: [
                {name: "x"}
              ]
            }
          });

          var derived = new ComplexWithStringProp();

          expect(function() {
            derived.isApplicableOf(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      });

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

          var derived = new ComplexWithStringProp();

          expect(function() {
            derived.isEnabledOf("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
           "even if of same name as an existing one", function() {

          var Other = Complex.extend({$type: {props: [{name: "x"}]}});

          var derived = new ComplexWithStringProp();

          expect(function() {
            derived.isEnabledOf(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      });

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

          var derived = new ComplexWithStringProp();

          expect(function() {
            derived.isRequiredOf("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
           "even if of same name as an existing one", function() {

          var Other = Complex.extend({$type: {props: [{name: "x"}]}});

          var derived = new ComplexWithStringProp();

          expect(function() {
            derived.isRequiredOf(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      });

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

          var derived = new ComplexWithStringProp();

          expect(function() {
            derived.countRangeOf("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when the given property type object is not owned by the complex, " +
           "even if of an existing name", function() {

          var Other = Complex.extend({$type: {props: [{name: "x"}]}});

          var derived = new ComplexWithStringProp();

          expect(function() {
            derived.countRangeOf(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      });

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

          var derived = new ComplexWithStringProp();

          expect(function() {
            derived.domainOf("y");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should throw when given a property type object not owned by the complex, " +
            "even if of same name as an existing one", function() {

          var Other = Complex.extend({$type: {props: [{name: "x"}]}});

          var derived = new ComplexWithStringProp();

          expect(function() {
            derived.domainOf(Other.type.get("x"));
          }).toThrow(errorMatch.argInvalid("name"));
        });
      });

      describe("#isDefaultedOf(name)", function() {

        var Derived;

        beforeAll(function() {
          Derived = Complex.extend({
            $type: {
              props: [
                {name: "x", valueType: "string"},
                {name: "y", valueType: ["string"]}
              ]
            }
          });
        });

        describe("element valueType property", function() {

          it("should be true when a value has not been specified", function() {

            var derived = new Derived();

            expect(derived.isDefaultedOf("x")).toBe(true);
          });

          it("should be false when a value has been specified", function() {

            var derived = new Derived({"x": "a"});

            expect(derived.isDefaultedOf("x")).toBe(false);
          });

          it("should be true after being set", function() {

            var derived = new Derived();

            derived.x = "a";

            expect(derived.isDefaultedOf("x")).toBe(false);
          });

          it("should be true after being set, within a transaction", function() {

            var derived = new Derived();

            var txnScope = Transaction.enter();
            try {
              derived.x = "a";

              expect(derived.isDefaultedOf("x")).toBe(false);
            } finally {
              txnScope.dispose();
            }
          });
        });

        describe("list valueType property", function() {

          it("should be true when a value has not been specified", function() {

            var derived = new Derived();

            expect(derived.isDefaultedOf("y")).toBe(true);
          });

          it("should be false when a value has been specified", function() {

            var derived = new Derived({"y": ["a"]});

            expect(derived.isDefaultedOf("y")).toBe(false);
          });

          it("should be true after being set", function() {

            var derived = new Derived();

            derived.y = ["a"];

            expect(derived.isDefaultedOf("y")).toBe(false);
          });

          it("should be true after being set, within a transaction", function() {

            var derived = new Derived();

            var txnScope = Transaction.enter();
            try {
              derived.y = ["a"];

              expect(derived.isDefaultedOf("y")).toBe(false);
            } finally {
              txnScope.dispose();
            }
          });
        });
      });
    });

    describe("#clone", function() {

      it("should return a distinct object", function() {

        var a = new CustomComplex();
        var b = a.clone();
        expect(a instanceof Object).toBe(true);
        expect(a).not.toBe(b);
      });

      it("should return an object with a different uid", function() {

        var a = new CustomComplex();
        var b = a.clone();
        expect(a.$uid).not.toBe(b.$uid);
      });

      it("should create an object of the same complex type", function() {

        var a = new CustomComplex();
        var b = a.clone();
        expect(a.constructor).toBe(b.constructor);
      });

      it("should create an object having the same element value instances", function() {

        var MyComplex2 = Complex.extend({
          $type: {
            props: ["a", "b", {name: "c", valueType: CustomComplex}]
          }
        });

        var a = new MyComplex2([1, 2, {}]);
        var b = a.clone();
        expect(a.get("a")).toBe(b.get("a"));
        expect(a.get("b")).toBe(b.get("b"));
        expect(a.get("c")).toBe(b.get("c"));
      });

      it("should create an object having distinct list value instances but the same list elements", function() {

        var a = new ComplexWithCustomComplexListProp([[{}, {}, {}]]);
        var b = a.clone();
        var aList = a.get("xs");
        var bList = b.get("xs");
        expect(aList).not.toBe(bList);
        expect(aList.count).toBe(bList.count);
        expect(aList.at(0)).toBe(bList.at(0));
        expect(aList.at(1)).toBe(bList.at(1));
        expect(aList.at(2)).toBe(bList.at(2));
      });
    });

    // region configuration
    describe("#_configure(config)", function() {

      describe("when config is a Value", function() {

        it("should only configure common properties", function() {

          var Derived2 = ComplexWithStringProp.extend({$type: {props: ["b", "c"]}});
          var Derived3 = ComplexWithStringProp.extend({$type: {props: ["b", "c"]}});

          var derived2 = new Derived2({x: "a1", b: "b1", c: "c1"});
          var derived3 = new Derived3({x: "a2", b: "b2", c: "c2"});

          spyOn(derived2, "_configureProperty");

          derived2.configure(derived3);

          expect(derived2._configureProperty).toHaveBeenCalledTimes(1);
          expect(derived2._configureProperty).toHaveBeenCalledWith(Derived2.type.get("x"), derived3.get("x"));
        });

        it("should accept non-complex value types", function() {

          var value = new ComplexWithStringProp({x: "a1"});
          var other = new PentahoNumber(1);

          spyOn(value, "_configureProperty");

          value.configure(other);

          expect(value._configureProperty).not.toHaveBeenCalled();
        });
      });

      describe("when config is a specification (not a Value)", function() {

        it("should normalize the configuration and use that instead", function() {

          var value = new ComplexWithStringProp();
          var config = 1;
          var normalizedConfig = {x: "a1"};

          spyOn(ComplexWithStringProp.type, "_normalizeInstanceSpec").and.returnValue(normalizedConfig);
          spyOn(value, "_configureProperty");

          value.configure(config);

          expect(ComplexWithStringProp.type._normalizeInstanceSpec).toHaveBeenCalledWith(config);

          expect(value._configureProperty)
            .toHaveBeenCalledWith(ComplexWithStringProp.type.get("x"), normalizedConfig.x);
        });

        it("should ignore non-own keys of config", function() {

          var value = new ComplexWithStringProp();
          var config = Object.create({x: "a1"});

          spyOn(value, "_configureProperty");

          value.configure(config);

          expect(value._configureProperty).not.toHaveBeenCalled();
        });

        it("should ignore a key named '_'", function() {

          var value = new ComplexWithStringProp();
          var config = {_: "foo"};

          spyOn(value, "_configureProperty");

          value.configure(config);

          expect(value._configureProperty).not.toHaveBeenCalled();
        });

        it("should ignore keys whose config value is undefined", function() {

          var value = new ComplexWithStringProp();
          var config = {x: undefined};

          spyOn(value, "_configureProperty");

          value.configure(config);

          expect(value._configureProperty).not.toHaveBeenCalled();
        });

        it("should ignore and log keys which are not defined in value type", function() {

          var value = new ComplexWithStringProp();
          var config = {b: "b1"};

          spyOn(value, "_configureProperty");

          value.configure(config);

          expect(value._configureProperty).not.toHaveBeenCalled();

          // TODO: Log.
        });

        it("should call _configureProperty for a property whose config key is the property nameAlias", function() {

          var Derived = Complex.extend({$type: {props: [{name: "foo", nameAlias: "f"}]}});

          var value = new Derived();
          var config = {f: "1"};

          spyOn(value, "_configureProperty");

          value.configure(config);

          expect(value._configureProperty).toHaveBeenCalledTimes(1);
          expect(value._configureProperty).toHaveBeenCalledWith(Derived.type.get("foo"), config.f);
        });

        it("should ignore the key corresponding to a property's nameAlias " +
          "when there is one corresponding to name", function() {

          var Derived = Complex.extend({$type: {props: [{name: "foo", nameAlias: "f"}]}});

          var value = new Derived();
          var config = {f: "1", foo: "2"};

          spyOn(value, "_configureProperty");

          value.configure(config);

          expect(value._configureProperty).toHaveBeenCalledTimes(1);
          expect(value._configureProperty).toHaveBeenCalledWith(Derived.type.get("foo"), config.foo);
        });

        it("should call _configureProperty for each existing, defined-valued key of config", function() {

          var Derived = Complex.extend({$type: {props: ["a", "b"]}});

          var value = new Derived();
          var config = {a: "a1", b: "b1"};

          spyOn(value, "_configureProperty");

          value.configure(config);

          expect(value._configureProperty).toHaveBeenCalledTimes(2);
          expect(value._configureProperty).toHaveBeenCalledWith(Derived.type.get("a"), config.a);
          expect(value._configureProperty).toHaveBeenCalledWith(Derived.type.get("b"), config.b);
        });
      });
    });

    describe("#_configureProperty(propType, config)", function() {

      describe("when config is the ambient value", function() {

        describe("property is list", function() {

          it("should do nothing", function() {

            var value = new ComplexWithStringListProp();

            var propType = value.$type.get("xs");
            var propValue = value.xs;

            spyOn(propValue, "_configure");

            value._configureProperty(propType, propValue);

            expect(propValue._configure).not.toHaveBeenCalled();
          });
        });

        describe("property is element", function() {

          it("should do nothing", function() {

            var value = new ComplexWithStringProp({x: "a1"});

            var propType = value.$type.get("x");
            var propValue = value.get("x");

            spyOn(ComplexChangeset, "__setElement");
            spyOn(propValue, "_configureOrCreate");

            value._configureProperty(propType, propValue);

            expect(ComplexChangeset.__setElement).not.toHaveBeenCalled();
            expect(propValue._configureOrCreate).not.toHaveBeenCalled();
          });
        });
      });

      describe("when config is distinct from the ambient value", function() {

        describe("property is list", function() {

          describe("config is null", function() {

            describe("property is read-only", function() {

              it("should throw if list contains elements", function() {

                var value = new ComplexWithReadOnlyStringListProp({xs: ["a", "b"]});

                var propType = value.$type.get("xs");
                var propValue = value.xs;
                var propConfig = null;

                expect(propValue.count).toBe(2);

                expect(function() {
                  value._configureProperty(propType, propConfig);
                }).toThrowError(TypeError);
              });

              it("should throw if list does not contains elements", function() {

                var value = new ComplexWithReadOnlyStringListProp();

                var propType = value.$type.get("xs");
                var propValue = value.xs;
                var propConfig = null;

                expect(propValue.count).toBe(0);

                value._configureProperty(propType, propConfig);
              });
            });

            describe("property is not read-only", function() {

              it("should clear the elements of the list", function() {

                var value = new ComplexWithStringListProp({xs: ["a", "b"]});

                var propType = value.$type.get("xs");
                var propValue = value.xs;
                var propConfig = null;

                expect(propValue.count).toBe(2);

                value._configureProperty(propType, propConfig);

                expect(propValue.count).toBe(0);
              });
            });
          });

          describe("config is not null", function() {

            it("should call ambient value _configure", function() {

              var value = new ComplexWithStringListProp({xs: ["a1", "a2"]});

              var propType = value.$type.get("xs");
              var propValue = value.xs;
              var propConfig = [];

              spyOn(propValue, "_configure");

              value._configureProperty(propType, propConfig);

              expect(propValue._configure).toHaveBeenCalledTimes(1);
              expect(propValue._configure).toHaveBeenCalledWith(propConfig);
            });
          });
        });

        describe("property is element", function() {

          describe("ambient value is null", function() {

            describe("property is read-only", function() {

              it("should throw", function() {

                var value = new ComplexWithReadOnlyStringProp();

                var propType = value.$type.get("x");
                var propValue = value.x;
                var propConfig = "a2";

                expect(propValue).toBe(null);

                expect(function() {
                  value._configureProperty(propType, propConfig);
                }).toThrowError(TypeError);
              });
            });

            describe("property is not read-only", function() {

              it("should replace with the config value", function() {

                var value = new ComplexWithStringProp();

                var propType = value.$type.get("x");
                var propValue = value.get("x");
                var propConfig = "a2";

                expect(propValue).toBe(null);

                spyOn(ComplexChangeset, "__setElement");

                value._configureProperty(propType, propConfig);

                expect(ComplexChangeset.__setElement).toHaveBeenCalledTimes(1);
                expect(ComplexChangeset.__setElement).toHaveBeenCalledWith(value, propType, propConfig);
              });
            });
          });

          describe("config value is null", function() {

            describe("property is read-only", function() {

              it("should throw", function() {

                var value = new ComplexWithReadOnlyStringProp({x: "a1"});

                var propType = value.$type.get("x");
                var propValue = value.x;
                var propConfig = null;

                expect(propValue).not.toBe(null);

                expect(function() {
                  value._configureProperty(propType, propConfig);
                }).toThrowError(TypeError);
              });
            });

            describe("property is not read-only", function() {

              it("should replace with the config value", function() {

                var value = new ComplexWithStringProp({x: "a1"});

                var propType = value.$type.get("x");
                var propValue = value.get("x");
                var propConfig = null;

                expect(propValue).not.toBe(null);

                spyOn(ComplexChangeset, "__setElement");

                value._configureProperty(propType, propConfig);

                expect(ComplexChangeset.__setElement).toHaveBeenCalledTimes(1);
                expect(ComplexChangeset.__setElement).toHaveBeenCalledWith(value, propType, propConfig);
              });
            });
          });

          describe("ambient and config values are not null", function() {

            it("should call the ambient value's _configureOrCreate", function() {

              var value = new ComplexWithStringProp({x: "a1"});

              var propType = value.$type.get("x");
              var propValue = value.get("x");
              var propConfig = "a2";

              spyOn(ComplexChangeset, "__setElement");
              spyOn(propValue, "_configureOrCreate").and.returnValue(propValue);

              value._configureProperty(propType, propConfig);

              expect(propValue._configureOrCreate).toHaveBeenCalledTimes(1);
              expect(propValue._configureOrCreate).toHaveBeenCalledWith(propConfig);
            });

            it("should not replace if _configureOrCreate returns the ambient value", function() {

              var value = new ComplexWithStringProp({x: "a1"});

              var propType = value.$type.get("x");
              var propValue = value.get("x");
              var propConfig = "a2";

              spyOn(ComplexChangeset, "__setElement");
              spyOn(propValue, "_configureOrCreate").and.returnValue(propValue);

              value._configureProperty(propType, propConfig);

              expect(ComplexChangeset.__setElement).not.toHaveBeenCalled();
            });

            describe("property is read-only", function() {

              it("should throw if _configureOrCreate returns a distinct value", function() {

                var value = new ComplexWithReadOnlyStringProp({x: "a1"});

                var propType = value.$type.get("x");
                var propValue = value.get("x");
                var propConfig = "a2";
                var propConfigOrCreate = "a3";

                spyOn(propValue, "_configureOrCreate").and.returnValue(propConfigOrCreate);

                expect(function() {
                  value._configureProperty(propType, propConfig);
                }).toThrowError(TypeError);
              });
            });

            describe("property is not read-only", function() {

              it("should replace if _configureOrCreate returns a distinct value", function() {

                var value = new ComplexWithStringProp({x: "a1"});

                var propType = value.$type.get("x");
                var propValue = value.get("x");
                var propConfig = "a2";
                var propConfigOrCreate = "a3";

                spyOn(ComplexChangeset, "__setElement");
                spyOn(propValue, "_configureOrCreate").and.returnValue(propConfigOrCreate);

                value._configureProperty(propType, propConfig);

                expect(ComplexChangeset.__setElement)
                  .toHaveBeenCalledTimes(1);

                var forceReplace = true;
                expect(ComplexChangeset.__setElement)
                  .toHaveBeenCalledWith(value, propType, propConfigOrCreate, forceReplace);
              });
            });
          });
        });
      });
    });
    // endregion

    describe("#__addReference(container, propType)", function() {

      it("should be called when a complex container is set to this value", function() {

        spyOn(CustomComplex.prototype, "__addReference");

        var value = new CustomComplex();
        var container = new ComplexWithCustomComplexProp({x: value});

        expect(value.__addReference).toHaveBeenCalled();
      });

      it("should be called with the complex container and its property type", function() {

        spyOn(CustomComplex.prototype, "__addReference");

        var value = new CustomComplex();
        var container = new ComplexWithCustomComplexProp({x: value});

        expect(value.__addReference).toHaveBeenCalledWith(container, ComplexWithCustomComplexProp.type.get("x"));
      });

      it("should be called when added to a list container", function() {

        spyOn(CustomComplex.prototype, "__addReference");

        var value = new CustomComplex();
        var container = new ComplexWithCustomComplexListProp({xs: [value]});

        expect(value.__addReference).toHaveBeenCalledWith(container.xs);
      });
    });
  }); // end pentaho.type.Complex
});
