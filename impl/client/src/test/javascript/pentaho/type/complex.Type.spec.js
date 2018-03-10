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
  "pentaho/type/Context",
  "pentaho/type/PropertyTypeCollection",
  "tests/pentaho/util/errorMatch",
  "tests/pentaho/type/sloppyModeUtil"
], function(Context, PropertyTypeCollection, errorMatch, sloppyModeUtil) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.type.Complex.Type", function() {

    var context;
    var Property;
    var PropertyType;
    var Value;
    var Complex;
    var PentahoString;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Property = context.get("property");
            PropertyType = Property.Type;
            Value = context.get("value");
            Complex = context.get("complex");
            PentahoString = context.get("string");
          })
          .then(done, done.fail);
    });

    describe("anatomy", function() {
      it("should be a function", function() {
        var Derived = Complex.extend();

        expect(typeof Derived.Type).toBe("function");
      });

      it("should be a sub-class of Complex", function() {
        var Derived = Complex.extend();

        expect(Derived.Type).not.toBe(Value.Type);
        expect(Derived.Type).not.toBe(Complex.Type);
        expect(Derived.type instanceof Complex.Type).toBe(true);
      });
    });

    describe(".extend(...)", function() {
      describe("props", function() {
        describe("when not specified or specified empty", function() {
          it("should have no properties", function() {
            var Derived = Complex.extend();

            expect(Derived.type.count).toBe(0);

            Derived = Complex.extend({
              $type: {
                props: []
              }
            });

            expect(Derived.type.count).toBe(0);
          });

          it("#each should never call the mapping function", function() {
            var Derived = Complex.extend({
              $type: {
                props: []
              }
            });

            var count = 0;
            Derived.type.each(function() {
              ++count;
            });

            expect(count).toBe(0);
          });

          it("should inherit the base class' properties", function() {
            var A = Complex.extend({
              $type: {
                props: ["fooBar", "guru"]
              }
            });

            var B = A.extend();

            expect(A.type.count).toBe(2);
            expect(B.type.count).toBe(2);

            expect(A.type.at(0)).toBe(B.type.at(0));
            expect(A.type.at(1)).toBe(B.type.at(1));
          });
        }); // When not specified or specified empty.

        describe("when specified with a single 'string' entry", function() {
          var Derived;

          beforeEach(function() {

            Derived = Complex.extend({
              $type: {
                props: ["fooBar"]
              }
            });
          });

          it("should result in a single property", function() {
            expect(Derived.type.count).toBe(1);
          });

          describe("the single property type", function() {
            var propType;

            beforeEach(function() {
              propType = Derived.type.at(0);
            });

            it("should have `label` derived by 'capitalization' of name", function() {
              expect(propType.label).toBe("Foo Bar");
            });

            it("should have `valueType` string", function() {
              expect(propType.valueType).toBe(PentahoString.type);
            });

            it("should have `declaringType` equal to containing ComplexType class", function() {
              expect(propType.declaringType).toBe(Derived.type);
            });

            it("should have `isList=false`", function() {
              expect(propType.isList).toBe(false);
            });

            it("should have `root` equal to itself", function() {
              expect(propType.root).toBe(propType);
            });

            it("should have `ancestor` equal to `null`", function() {
              expect(propType.ancestor).toBe(null);
            });
          });
        });

        describe("when specified with two entries", function() {

          var Derived;

          beforeEach(function() {
            Derived = Complex.extend({
              $type: {
                props: ["fooBar", "guru"]
              }
            });
          });

          it("should result in 2 properties", function() {
            expect(Derived.type.count).toBe(2);
            expect(Derived.type.at(0).name).toBe("fooBar");
            expect(Derived.type.at(1).name).toBe("guru");
          });

          it("#each should iterate through the 2 properties", function() {
            var count = 0;
            Derived.type.each(function() {
              ++count;
            });

            expect(count).toBe(2);
          });

          it("#each should allow to break out", function() {
            var count = 0;
            Derived.type.each(function() {
              ++count;
              return false;
            });

            expect(count).toBe(1);
          });
        });

        describe("when specified with with an entry that overrides a base type property", function() {

          var A;
          var B;

          beforeEach(function() {

            A = Complex.extend({
              $type: {
                label: "A",
                props: ["fooBar", "guru"]
              }
            });

            B = A.extend({
              $type: {
                label: "B",
                props: [{name: "guru", label: "HELLO"}]
              }
            });
          });

          it("should create a sub-property", function() {
            expect(A.type.count).toBe(2);
            expect(B.type.count).toBe(2);

            var baseProp = A.type.at(1);
            var subProp = B.type.at(1);

            expect(subProp).not.toBe(baseProp);

            expect(baseProp.name).toBe("guru");
            expect(baseProp.label).toBe("Guru");

            expect(subProp.name).toBe("guru");
            expect(subProp.label).toBe("HELLO");

            expect(subProp.ancestor).toBe(baseProp);
          });
        });

        describe("when specified with with an entry that is not a base type property", function() {

          var A;
          var B;

          beforeEach(function() {
            A = Complex.extend({
              $type: {
                label: "A",
                props: ["fooBar", "guru"]
              }
            });

            B = A.extend({
              $type: {
                label: "B",
                props: [{name: "guru", label: "HELLO"}, {name: "babah"}]
              }
            });
          });

          it("should append a new property", function() {
            expect(A.type.count).toBe(2);
            expect(B.type.count).toBe(3);

            expect(B.type.at(0).name).toBe("fooBar");
            expect(B.type.at(1).name).toBe("guru");
            expect(B.type.at(2).name).toBe("babah");
          });
        });

        describe("when specified with with a dictionary", function() {

          it("should define the defined properties", function() {
            var A = Complex.extend({
              $type: {
                label: "A",
                props: {"fooBar": {}, "guru": {}}
              }
            });

            expect(A.type.count).toBe(2);
            expect(A.type.at(0)).not.toBe(A.type.at(1));

            var iName0 = ["fooBar", "guru"].indexOf(A.type.at(0).name);
            var iName1 = ["fooBar", "guru"].indexOf(A.type.at(1).name);

            expect(iName0).not.toBe(-1);
            expect(iName1).not.toBe(-1);

            expect(iName0).not.toBe(iName1);
          });

          it("should ignore undefined properties", function() {
            var A = Complex.extend({
              $type: {
                label: "A",
                props: {"fooBar": {}, "guru": {}, "dada": null, "babah": undefined}
              }
            });

            expect(A.type.count).toBe(2);
            expect(A.type.get("fooBar", true) instanceof PropertyType).toBe(true);
            expect(A.type.get("guru", true) instanceof PropertyType).toBe(true);
            expect(A.type.get("dada", true)).toBe(null);
            expect(A.type.get("babah", true)).toBe(null);
          });

          it("should throw if a property specifies a name different from the key", function() {
            expect(function() {
              Complex.extend({
                $type: {
                  label: "A",
                  props: {"fooBar": {name: "babah"}}
                }
              });
            }).toThrow(errorMatch.argInvalid("config"));
          });
        });
      }); // props
    }); // .extend(...)

    describe(".implement(...)", function() {
      it("should be possible to configure existing properties with a dictionary", function() {
        var A = Complex.extend({
          $type: {
            label: "A",
            props: ["x", "y"]
          }
        });

        A.implement({
          $type: {
            props: {
              "x": {label: "labelX"},
              "y": {label: "labelY"}
            }
          }
        });

        expect(A.type.at(0).label).toBe("labelX");
        expect(A.type.at(1).label).toBe("labelY");
      });
    });

    describe("#isComplex", function() {
      it("should have value `true`", function() {
        expect(Complex.type.isComplex).toBe(true);
      });
    });

    describe("#isContainer", function() {
      it("should have value `true`", function() {
        expect(Complex.type.isContainer).toBe(true);
      });
    });

    describe("#has(name)", function() {

      var Derived;
      var DerivedB;

      beforeEach(function() {
        Derived = Complex.extend({$type: {
          props: ["foo", "bar"]
        }});

        DerivedB = Derived.extend({$type: {
          props: [{name: "bar", label: "HELLO"}]
        }});
      });

      it("should return false when given no arguments", function() {
        expect(Complex.type.has()).toBe(false);
        expect(Derived.type.has()).toBe(false);
      });

      it("should return true when given the name of a defined property", function() {
        expect(Derived.type.has("foo")).toBe(true);
      });

      it("should return false when given the name of an undefined property", function() {
        expect(Derived.type.has("foo2")).toBe(false);
      });

      it("should return true when given the type object of one of its properties", function() {
        var propType = Derived.type.at(0);
        expect(Derived.type.has(propType)).toBe(true);
      });

      it("should return false when given the type object of a property from a different complex type", function() {
        var OtherDerived = Complex.extend({
          $type: {
            props: ["fooBar"]
          }
        });

        var otherPropType = OtherDerived.type.at(0);

        expect(Derived.type.has(otherPropType)).toBe(false);
      });

      it("should return true for an inherited named property", function() {
        expect(DerivedB.type.has("foo")).toBe(true);
      });

      it("should return true for an overridden named property", function() {
        expect(DerivedB.type.has("bar")).toBe(true);
      });
    });

    describe("#at(index[, sloppy])", function() {

      var Derived;

      function getter(args) {
        return Complex.type.at.apply(Complex.type, args);
      }

      beforeEach(function() {
        Derived = Complex.extend({$type: {
          props: ["foo", "bar"]
        }});
      });

      describe("when index is nully", function() {

        var strictError = errorMatch.argRequired("index");

        sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [null], strictError);
        sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [undefined], strictError);
      });

      describe("when index is out of range", function() {

        var sloppyResult = null;
        var strictError = errorMatch.argRange("index");

        sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, [1], sloppyResult, strictError);
      });

      it("should return a property type object", function() {
        var propType = Derived.type.at(0);
        expect(propType instanceof PropertyType).toBe(true);
      });

      it("should return the property type object of the specified index", function() {
        var propType = Derived.type.at(0);
        expect(propType.name).toBe("foo");

        propType = Derived.type.at(1);
        expect(propType.name).toBe("bar");
      });
    });

    describe("#get(name[, sloppy])", function() {
      var Derived;

      function getter(args) {
        return Derived.type.get.apply(Derived.type, args);
      }

      beforeEach(function() {
        Derived = Complex.extend({$type: {
          props: ["foo", "bar"]
        }});
      });

      describe("when name is not specified or is nully", function() {

        var strictError = errorMatch.argRequired("name");

        it("should throw when name and sloppy are unspecified", function() {
          // not specified
          expect(function() {
            getter([]);
          }).toThrow(strictError);
        });

        sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [null], strictError);
        sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [undefined], strictError);
      });

      describe("when given the name of a defined property", function() {
        var getter2 = function() {
          return getter.apply(this, arguments).name;
        };

        sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter2, ["foo"], "foo");
        sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter2, ["bar"], "bar");
      });

      describe("when given the name of an undefined property", function() {
        var strictError = errorMatch.argInvalid("name");
        var sloppyResult = null;

        sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, ["gugu"], sloppyResult, strictError);
      });

      describe("when the derived type has no properties and given some property argument", function() {

        beforeEach(function() {
          Derived = Complex.extend();
        });

        var strictError = errorMatch.argInvalid("name");
        var sloppyResult = null;

        sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, ["gugu"], sloppyResult, strictError);
      });

      describe("when given a property type object that it contains", function() {

        it("should return it, when sloppy is unspecified or has any other value", function() {
          var propType = Derived.type.at(0);

          expect(Derived.type.get(propType)).toBe(propType);
          expect(Derived.type.get(propType, false)).toBe(propType);
          expect(Derived.type.get(propType, null)).toBe(propType);
          expect(Derived.type.get(propType, undefined)).toBe(propType);
          expect(Derived.type.get(propType, true)).toBe(propType);
        });
      });

      describe("when given a property type object from a different complex type", function() {

        var strictError = errorMatch.argInvalid("name");
        var sloppyResult = null;
        var OtherDerived;
        var otherPropType;
        var args;

        beforeEach(function() {
          OtherDerived = Complex.extend({
            $type: {
              props: ["fooBar"]
            }
          });
          otherPropType = OtherDerived.type.at(0);
          args = [otherPropType];
        });

        // sloppyModeUtils.itShouldBehaveStrictlyUnlessSloppyIsTrue

        it("should throw when sloppy is unspecified, false, null or undefined", function() {

          expect(function() { getter(args); }).toThrow(strictError);

          function expectIt(sloppy) {
            expect(function() { getter(args.concat(sloppy)); }).toThrow(strictError);
          }

          expectIt(false);
          expectIt(null);
          expectIt(undefined);
        });

        it("should return `" + sloppyResult + "` when sloppy is true", function() {
          var sloppy = true;
          expect(getter(args.concat(sloppy))).toBe(sloppyResult);
        });
      });
    });

    describe("#count", function() {
      it("should return the number of properties of a type with properties", function() {
        var Derived = Complex.extend({$type: {
          props: ["foo", "bar"]
        }});
        expect(Derived.type.count).toBe(2);
      });

      it("should return 0 for a a type with no properties", function() {
        var Derived = Complex.extend();
        expect(Derived.type.count).toBe(0);
      });
    });

    describe("#add", function() {
      it("should add new properties", function() {
        var Derived = Complex.extend({
          $type: {
            props: []
          }
        });

        expect(Derived.type.count).toBe(0);

        Derived.type.add("guru");

        expect(Derived.type.count).toBe(1);

        Derived.type.add(["fooBar", "barFoo"]);

        expect(Derived.type.count).toBe(3);
      });
    });

    describe("#each(f, x)", function() {

      it("should call f once for each property of the type", function() {

        var SampleType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"},
              {name: "b", valueType: "string"}
            ]
          }
        });

        var f = jasmine.createSpy();

        SampleType.type.each(f);

        expect(f.calls.argsFor(0)[0]).toBe(SampleType.type.get("a"));
        expect(f.calls.argsFor(1)[0]).toBe(SampleType.type.get("b"));
      });

      it("should call f once for each property of the type passing the index as second argument", function() {

        var SampleType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"},
              {name: "b", valueType: "string"}
            ]
          }
        });

        var f = jasmine.createSpy();

        SampleType.type.each(f);

        expect(f.calls.argsFor(0)[1]).toBe(0);
        expect(f.calls.argsFor(1)[1]).toBe(1);
      });

      it("should call f once for each property of the type passing this as the third argument", function() {

        var SampleType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"},
              {name: "b", valueType: "string"}
            ]
          }
        });

        var f = jasmine.createSpy();

        SampleType.type.each(f);

        expect(f.calls.argsFor(0)[2]).toBe(SampleType.type);
        expect(f.calls.argsFor(1)[2]).toBe(SampleType.type);
      });

      it("should call f on the given x", function() {

        var SampleType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"}
            ]
          }
        });

        var f = jasmine.createSpy();

        var x = {};
        SampleType.type.each(f, x);

        expect(f.calls.first().object).toBe(x);
      });

      it("should return this", function() {

        var SampleType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"}
            ]
          }
        });

        var f = jasmine.createSpy();

        var result = SampleType.type.each(f);

        expect(result).toBe(SampleType.type);
      });

      it("should stop iteration if f returns false", function() {

        var SampleType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"},
              {name: "b", valueType: "string"}
            ]
          }
        });

        var f = jasmine.createSpy().and.callFake(function() { return false; });

        SampleType.type.each(f);

        expect(f).toHaveBeenCalledTimes(1);
      });

      it("should call f for inherited properties", function() {

        var RootType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"},
              {name: "b", valueType: "string"}
            ]
          }
        });

        var SampleType = RootType.extend({
          $type: {
            props: [
              {name: "c", valueType: "string"},
              {name: "d", valueType: "string"}
            ]
          }
        });

        var f = jasmine.createSpy();

        SampleType.type.each(f);

        expect(f.calls.argsFor(0)[0]).toBe(SampleType.type.get("a"));
        expect(f.calls.argsFor(1)[0]).toBe(SampleType.type.get("b"));
        expect(f.calls.argsFor(2)[0]).toBe(SampleType.type.get("c"));
        expect(f.calls.argsFor(3)[0]).toBe(SampleType.type.get("d"));
      });
    });

    describe("#eachCommonWith(otherType, f, x)", function() {

      it("should call f once for each corresponding property of the common base type", function() {

        var BaseType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"},
              {name: "b", valueType: "string"}
            ]
          }
        });

        var SubTypeA = BaseType.extend();
        var SubTypeB = BaseType.extend();

        var f = jasmine.createSpy();

        SubTypeA.type.eachCommonWith(SubTypeB.type, f);

        expect(f.calls.argsFor(0)[0]).toBe(SubTypeA.type.get("a"));
        expect(f.calls.argsFor(1)[0]).toBe(SubTypeA.type.get("b"));
      });

      it("should call f once for each corresponding property of the common base type, " +
         "passing the index as second argument", function() {

        var BaseType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"},
              {name: "b", valueType: "string"}
            ]
          }
        });

        var SubTypeA = BaseType.extend();
        var SubTypeB = BaseType.extend();

        var f = jasmine.createSpy();

        SubTypeA.type.eachCommonWith(SubTypeB.type, f);

        expect(f.calls.argsFor(0)[1]).toBe(0);
        expect(f.calls.argsFor(1)[1]).toBe(1);
      });

      it("should call f once for each corresponding property of the common base type, " +
          "passing this as third argument", function() {

        var BaseType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"},
              {name: "b", valueType: "string"}
            ]
          }
        });

        var SubTypeA = BaseType.extend();
        var SubTypeB = BaseType.extend();

        var f = jasmine.createSpy();

        SubTypeA.type.eachCommonWith(SubTypeB.type, f);

        expect(f.calls.argsFor(0)[2]).toBe(SubTypeA.type);
        expect(f.calls.argsFor(1)[2]).toBe(SubTypeA.type);
      });

      it("should call f on the given x", function() {

        var BaseType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"}
            ]
          }
        });

        var SubTypeA = BaseType.extend();
        var SubTypeB = BaseType.extend();

        var f = jasmine.createSpy();

        var x = {};
        SubTypeA.type.eachCommonWith(SubTypeB.type, f, x);

        expect(f.calls.first().object).toBe(x);
      });

      it("should return this", function() {

        var BaseType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"}
            ]
          }
        });

        var SubTypeA = BaseType.extend();
        var SubTypeB = BaseType.extend();

        var f = jasmine.createSpy();

        var result = SubTypeA.type.eachCommonWith(SubTypeB.type, f);

        expect(result).toBe(SubTypeA.type);
      });

      it("should not call f for non-common properties of different names", function() {

        var BaseType = Complex.extend();

        var SubTypeA = BaseType.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"}
            ]
          }
        });

        var SubTypeB = BaseType.extend({
          $type: {
            props: [
              {name: "b", valueType: "string"}
            ]
          }
        });

        var f = jasmine.createSpy();

        SubTypeA.type.eachCommonWith(SubTypeB.type, f);

        expect(f).not.toHaveBeenCalled();
      });

      it("should stop iteration if f returns false", function() {

        var BaseType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"},
              {name: "b", valueType: "string"}
            ]
          }
        });

        var SubTypeA = BaseType.extend();
        var SubTypeB = BaseType.extend();

        var f = jasmine.createSpy().and.callFake(function() { return false; });

        SubTypeA.type.eachCommonWith(SubTypeB.type, f);

        expect(f).toHaveBeenCalledTimes(1);
      });

      it("should call f for inherited properties", function() {

        var RootType = Complex.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"},
              {name: "b", valueType: "string"}
            ]
          }
        });

        var BaseType = RootType.extend({
          $type: {
            props: [
              {name: "c", valueType: "string"},
              {name: "d", valueType: "string"}
            ]
          }
        });

        var SubTypeA = BaseType.extend();
        var SubTypeB = BaseType.extend();

        var f = jasmine.createSpy();

        SubTypeA.type.eachCommonWith(SubTypeB.type, f);

        expect(f.calls.argsFor(0)[0]).toBe(SubTypeA.type.get("a"));
        expect(f.calls.argsFor(1)[0]).toBe(SubTypeA.type.get("b"));
        expect(f.calls.argsFor(2)[0]).toBe(SubTypeA.type.get("c"));
        expect(f.calls.argsFor(3)[0]).toBe(SubTypeA.type.get("d"));
      });

      it("should not call f for non-common properties of same names", function() {

        var BaseType = Complex.extend();

        var SubTypeA = BaseType.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"}
            ]
          }
        });

        var SubTypeB = BaseType.extend({
          $type: {
            props: [
              {name: "a", valueType: "string"}
            ]
          }
        });

        var f = jasmine.createSpy();

        SubTypeA.type.eachCommonWith(SubTypeB.type, f);

        expect(f).not.toHaveBeenCalled();
      });
    });

    describe("#isEntity", function() {

      it("should default to `false`", function() {
        expect(Complex.type.isEntity).toBe(false);
      });

      it("should respect a specified value when the base value is false", function() {

        var Derived = Complex.extend({
          $type: {isEntity: true}
        });

        expect(Derived.type.isEntity).toBe(true);
      });

      it("should ignore a specified value when the base value is true", function() {

        var Derived = Complex.extend({
          $type: {isEntity: true}
        });

        var Derived2 = Derived.extend({
          $type: {isEntity: false}
        });

        expect(Derived2.type.isEntity).toBe(true);
      });

      it("should inherit the base value", function() {

        var Derived = Complex.extend({
          $type: {isEntity: true}
        });

        var Derived2 = Derived.extend();

        expect(Derived2.type.isEntity).toBe(true);
      });
    }); // end isEntity

  }); // end pentaho.type.Complex.Type
});
