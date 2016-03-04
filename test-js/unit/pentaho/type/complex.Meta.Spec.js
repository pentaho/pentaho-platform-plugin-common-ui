/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/Property",
  "pentaho/type/PropertyMetaCollection",
  "tests/pentaho/util/errorMatch",
  "./sloppyModeUtil"
], function(Context, Property, PropertyMetaCollection, errorMatch, sloppyModeUtil) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  var context = new Context();
  var PropertyMeta = Property.Meta;
  var Value = context.get("pentaho/type/value");
  var Complex = context.get("pentaho/type/complex");
  var String = context.get("pentaho/type/string");

  describe("pentaho.type.Complex.Meta", function() {

    describe("anatomy", function() {
      it("should be a function", function() {
        var Derived = Complex.extend();

        expect(typeof Derived.Meta).toBe("function");
      });

      it("should be a sub-class of Complex", function() {
        var Derived = Complex.extend();

        expect(Derived.Meta).not.toBe(Value.Meta);
        expect(Derived.Meta).not.toBe(Complex.Meta);
        expect(Derived.meta instanceof Complex.Meta).toBe(true);
      });
    });

    describe(".extend(...)", function() {
      describe("props", function() {
        describe("when not specified or specified empty", function() {
          it("should have no properties", function() {
            var Derived = Complex.extend();

            expect(Derived.meta.count).toBe(0);

            Derived = Complex.extend({
              meta: {
                props: []
              }
            });

            expect(Derived.meta.count).toBe(0);
          });

          it("#each should never call the mapping function", function() {
            var Derived = Complex.extend({
              meta: {
                props: []
              }
            });

            var count = 0;
            Derived.meta.each(function() {
              ++count;
            });

            expect(count).toBe(0);
          });

          it("should inherit the base class' properties", function() {
            var A = Complex.extend({
              meta: {
                props: ["fooBar", "guru"]
              }
            });

            var B = A.extend();

            expect(A.meta.count).toBe(2);
            expect(B.meta.count).toBe(2);

            expect(A.meta.at(0)).toBe(B.meta.at(0));
            expect(A.meta.at(1)).toBe(B.meta.at(1));
          });
        }); // when not specified or specified empty

        describe("when specified with a single 'string' entry", function() {
          var Derived = Complex.extend({
            meta: {
              props: ["fooBar"]
            }
          });

          it("should result in a single property", function() {
            expect(Derived.meta.count).toBe(1);
          });

          describe("the single property meta", function() {
            var propMeta = Derived.meta.at(0);

            it("should have `label` derived by 'capitalization' of name", function() {
              expect(propMeta.label).toBe("Foo Bar");
            });

            it("should have `type` string", function() {
              expect(propMeta.type).toBe(String.meta);
            });

            it("should have `declaringType` equal to containing ComplexMeta class", function() {
              expect(propMeta.declaringType).toBe(Derived.meta);
            });

            it("should have `isList=false`", function() {
              expect(propMeta.isList).toBe(false);
            });

            it("should have `root` equal to itself", function() {
              expect(propMeta.root).toBe(propMeta);
            });

            it("should have `ancestor` equal to `null`", function() {
              expect(propMeta.ancestor).toBe(null);
            });
          });
        });

        describe("when specified with two entries", function() {
          var Derived = Complex.extend({
            meta: {
              props: ["fooBar", "guru"]
            }
          });

          it("should result in 2 properties", function() {
            expect(Derived.meta.count).toBe(2);
            expect(Derived.meta.at(0).name).toBe("fooBar");
            expect(Derived.meta.at(1).name).toBe("guru");
          });

          it("#each should iterate through the 2 properties", function() {
            var count = 0;
            Derived.meta.each(function() {
              ++count;
            });

            expect(count).toBe(2);
          });

          it("#each should allow to break out", function() {
            var count = 0;
            Derived.meta.each(function() {
              ++count;
              return false;
            });

            expect(count).toBe(1);
          });
        });

        describe("when specified with with an entry that overrides a base type property", function() {
          var A = Complex.extend({
            meta: {
              label: "A",
              props: ["fooBar", "guru"]
            }
          });

          var B = A.extend({
            meta: {
              label: "B",
              props: [{name: "guru", label: "HELLO"}]
            }
          });

          it("should create a sub-property", function() {
            expect(A.meta.count).toBe(2);
            expect(B.meta.count).toBe(2);

            var baseProp = A.meta.at(1);
            var subProp = B.meta.at(1);

            expect(subProp).not.toBe(baseProp);

            expect(baseProp.name).toBe("guru");
            expect(baseProp.label).toBe("Guru");

            expect(subProp.name).toBe("guru");
            expect(subProp.label).toBe("HELLO");

            expect(subProp.ancestor).toBe(baseProp);
          });
        });

        describe("when specified with with an entry that is not a base type property", function() {
          var A = Complex.extend({
            meta: {
              label: "A",
              props: ["fooBar", "guru"]
            }
          });

          var B = A.extend({
            meta: {
              label: "B",
              props: [{name: "guru", label: "HELLO"}, {name: "babah"}]
            }
          });

          it("should append a new property", function() {
            expect(A.meta.count).toBe(2);
            expect(B.meta.count).toBe(3);

            expect(B.meta.at(0).name).toBe("fooBar");
            expect(B.meta.at(1).name).toBe("guru");
            expect(B.meta.at(2).name).toBe("babah");
          });
        });

        describe("when specified with with a dictionary", function() {
          it("should define the defined properties", function() {
            var A = Complex.extend({
              meta: {
                label: "A",
                props: {"fooBar": {}, "guru": {}}
              }
            });

            expect(A.meta.count).toBe(2);
            expect(A.meta.at(0)).not.toBe(A.meta.at(1));

            var iName0 = ["fooBar", "guru"].indexOf(A.meta.at(0).name);
            var iName1 = ["fooBar", "guru"].indexOf(A.meta.at(1).name);

            expect(iName0).not.toBe(-1);
            expect(iName1).not.toBe(-1);

            expect(iName0).not.toBe(iName1);
          });

          it("should ignore undefined properties", function() {
            var A = Complex.extend({
              meta: {
                label: "A",
                props: {"fooBar": {}, "guru": {}, "dada": null, "babah": undefined}
              }
            });

            expect(A.meta.count).toBe(2);
            expect(A.meta.get("fooBar", true) instanceof PropertyMeta).toBe(true);
            expect(A.meta.get("guru",   true) instanceof PropertyMeta).toBe(true);
            expect(A.meta.get("dada",   true)).toBe(null);
            expect(A.meta.get("babah",  true)).toBe(null);
          });

          it("should throw if a property specifies a name different from the key", function() {
            expect(function() {
              Complex.extend({
                meta: {
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
          meta: {
            label: "A",
            props: ["x", "y"]
          }
        });

        A.implement({
          meta: {
            props: {
              "x": {label: "labelX"},
              "y": {label: "labelY"}
            }
          }
        });

        expect(A.meta.at(0).label).toBe("labelX");
        expect(A.meta.at(1).label).toBe("labelY");
      });
    });

    describe("#has(name)", function() {
      var Derived = Complex.extend({meta: {
        props: ["foo", "bar"]
      }});

      var DerivedB = Derived.extend({meta: {
        props: [{name: "bar", label: "HELLO"}]
      }});

      it("should return false when given no arguments", function() {
        expect(Complex.meta.has()).toBe(false);
        expect(Derived.meta.has()).toBe(false);
      });

      it("should return true when given the name of a defined property", function() {
        expect(Derived.meta.has("foo")).toBe(true);
      });

      it("should return false when given the name of an undefined property", function() {
        expect(Derived.meta.has("foo2")).toBe(false);
      });

      it("should return true when given the metadata of one of its properties", function() {
        var propMeta = Derived.meta.at(0);
        expect(Derived.meta.has(propMeta)).toBe(true);
      });

      it("should return false when given the metadata of a property from a different complex type", function() {
        var OtherDerived = Complex.extend({
          meta: {
            props: ["fooBar"]
          }
        });

        var otherPropMeta = OtherDerived.meta.at(0);

        expect(Derived.meta.has(otherPropMeta)).toBe(false);
      });

      it("should return true for an inherited named property", function() {
        expect(DerivedB.meta.has("foo")).toBe(true);
      });

      it("should return true for an overridden named property", function() {
        expect(DerivedB.meta.has("bar")).toBe(true);
      });
    });

    describe("#at(index[, sloppy])", function() {

      var Derived = Complex.extend({meta: {
        props: ["foo", "bar"]
      }});

      describe("when index is nully", function() {

        function getter(args) {
          return Complex.meta.at.apply(Complex.meta, args);
        }

        var strictError = errorMatch.argRequired("index");

        sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [null], strictError);
        sloppyModeUtil.itShouldThrowWhateverTheSloppyValue(getter, [undefined], strictError);
      });

      describe("when index is out of range", function() {

        function getter(args) {
          return Complex.meta.at.apply(Complex.meta, args);
        }

        var sloppyResult = null;
        var strictError = errorMatch.argRange("index");

        sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, [1], sloppyResult, strictError);
      });

      it("should return a property metadata instance", function() {
        var propMeta = Derived.meta.at(0);
        expect(propMeta instanceof PropertyMeta).toBe(true);
      });

      it("should return the property metadata instance of the specified index", function() {
        var propMeta = Derived.meta.at(0);
        expect(propMeta.name).toBe("foo");

        propMeta = Derived.meta.at(1);
        expect(propMeta.name).toBe("bar");
      });
    });

    describe("#get(name[, sloppy])", function() {
      var Derived = Complex.extend({meta: {
        props: ["foo", "bar"]
      }});

      function getter(args) {
        return Derived.meta.get.apply(Derived.meta, args);
      }

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
        var Derived = Complex.extend();

        function getter(args) {
          return Derived.meta.get.apply(Derived.meta, args);
        }

        var strictError = errorMatch.argInvalid("name");
        var sloppyResult = null;

        sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, ["gugu"], sloppyResult, strictError);
      });

      describe("when given a property metadata that it contains", function() {
        var propMeta = Derived.meta.at(0);
        var result = propMeta;

        sloppyModeUtil.itShouldReturnValueWhateverTheSloppyValue(getter, [propMeta], result);
      });

      describe("when given a property metadata from a different complex type", function() {
        var OtherDerived = Complex.extend({
          meta: {
            props: ["fooBar"]
          }
        });

        var otherPropMeta = OtherDerived.meta.at(0);
        var strictError = errorMatch.argInvalid("name");
        var sloppyResult = null;

        sloppyModeUtil.itShouldBehaveStrictlyUnlessSloppyIsTrue(getter, [otherPropMeta], sloppyResult, strictError);
      });
    });

    describe("#count", function() {
      it("should return the number of properties of a type with properties", function() {
        var Derived = Complex.extend({meta: {
          props: ["foo", "bar"]
        }});
        expect(Derived.meta.count).toBe(2);
      });

      it("should return 0 for a a type with no properties", function() {
        var Derived = Complex.extend();
        expect(Derived.meta.count).toBe(0);
      });
    });

    describe("#add", function() {
      it("should add new properties", function() {
        var Derived = Complex.extend({
          meta: {
            props: []
          }
        });

        expect(Derived.meta.count).toBe(0);

        Derived.meta.add("guru");

        expect(Derived.meta.count).toBe(1);

        Derived.meta.add(["fooBar", "barFoo"]);

        expect(Derived.meta.count).toBe(3);
      });
    });
  }); // pentaho.type.Complex.Meta
});
