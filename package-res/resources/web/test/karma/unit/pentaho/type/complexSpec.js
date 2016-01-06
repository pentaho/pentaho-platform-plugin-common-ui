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
  "pentaho/type/complex",
  "pentaho/type/value",
  "pentaho/type/string",
  "pentaho/type/_layer0/Property",
  "pentaho/type/_layer0/PropertyMetaCollection",
  "pentaho/util/error",
], function(Context, complexFactory, valueFactory, stringFactory, Property, PropertyMetaCollection, error) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      PropertyMeta = Property.Meta,
      Value   = context.get(valueFactory),
      Complex = context.get(complexFactory),
      String  = context.get(stringFactory);

  describe("pentaho/type/complex -", function() {
    describe("anatomy -", function() {
      it("is a function", function() {
        expect(typeof Complex).toBe("function");
      });

      it("is a sub-class of Value", function() {
        expect(Complex).not.toBe(Value);
        expect(Complex.prototype instanceof Value).toBe(true);
      });

      it(".Meta is a function", function() {
        expect(typeof Complex.Meta).toBe("function");
      });

      it(".Meta is a sub-class of Value.Meta", function() {
        expect(Complex.Meta).not.toBe(Value.Meta);
        expect(Complex.Meta.prototype instanceof Value.Meta).toBe(true);
      });

      it(".Meta has different 'info' attributes from those of Value.Meta", function() {
        expect(Complex.meta.label).not.toBe(Value.meta.label);

        expect(Complex.meta.description).not.toBe(Value.meta.description);
      });

      describe("the `props` property", function() {
        it("should be defined", function() {
           expect(Complex.meta.props).toBeTruthy();
        });

        it("should contain an instance of PropertyMetaCollection", function() {
           expect(Complex.meta.props instanceof PropertyMetaCollection).toBe(true);
        });

        it("should be an empty collection", function() {
           expect(Complex.meta.props.length).toBe(0);
        });
      });
    }); // anatomy

    describe(".extend({...}) - the returned value -", function() {
      it("should be a function", function() {
        var Derived = Complex.extend({
          meta: {
            label: "Derived"
          }
        });

        expect(typeof Derived).toBe("function");
      });

      it("should be a sub-class of Complex", function() {
        var Derived = Complex.extend({
          meta: {
            label: "Derived"
          }
        });

        expect(Derived).not.toBe(Value);
        expect(Derived).not.toBe(Complex);
        expect(Derived.prototype instanceof Complex).toBe(true);
      });

      it(".Meta should be a function", function() {
        var Derived = Complex.extend({
          meta: {
            label: "Derived"
          }
        });

        expect(typeof Derived.Meta).toBe("function");
      });

      it(".Meta should be a sub-class of Complex", function() {
        var Derived = Complex.extend({
          meta: {
            label: "Derived"
          }
        });

        expect(Derived.Meta).not.toBe(Value.Meta);
        expect(Derived.Meta).not.toBe(Complex.Meta);
        expect(Derived.meta instanceof Complex.Meta).toBe(true);
      });

      describe(".Meta#props -", function() {
        describe("when not specified or specified empty -", function() {
          it("should have a `props` collection", function() {
            var Derived = Complex.extend({
              meta: {
                name:  "derived",
                label: "Derived"
              }
            });

            expect(Derived.meta.props != null).toBe(true);
            expect(Derived.meta.props instanceof PropertyMetaCollection).toBe(true);

            Derived = Complex.extend({
              meta: {
                name:  "derived",
                label: "Derived",
                props: []
              }
            });

            expect(Derived.meta.props != null).toBe(true);
            expect(Derived.meta.props instanceof PropertyMetaCollection).toBe(true);
          });

          it("should have an empty props collection", function() {
            var Derived = Complex.extend({
              meta: {
                name:  "derived",
                label: "Derived"
              }
            });

            expect(Derived.meta.props.length).toBe(0);

            Derived = Complex.extend({
              meta: {
                name:  "derived",
                label: "Derived",
                props: []
              }
            });

            expect(Derived.meta.props.length).toBe(0);
          });

          it("should inherit the base class' properties", function() {
            var A = Complex.extend({
              meta: {
                label: "A",
                props: ["fooBar", "guru"]
              }
            });

            var B = A.extend({
              meta: {
                label: "B"
              }
            });

            expect(A.meta.props.length).toBe(2);
            expect(B.meta.props.length).toBe(2);

            expect(A.meta.props[0]).toBe(B.meta.props[0]);
            expect(A.meta.props[1]).toBe(B.meta.props[1]);
          });
        }); // when [#props is] not specified or specified empty

        // Tests PropertyMetaCollection

        describe("when specified non-empty -", function() {

          // string
          describe("with a single 'string' entry -", function() {
            var Derived = Complex.extend({
                  meta: {
                    name:  "derived",
                    label: "Derived",
                    props: ["fooBar"]
                  }
                });

            it("should result in a props collection with length 1", function() {
              expect(Derived.meta.props.length).toBe(1);
            });

            describe("the single property meta -", function() {
              var propMeta = Derived.meta.props[0];

              it("should be a property meta instance", function() {
                expect(propMeta instanceof PropertyMeta).toBe(true);
              });

              it("should have `name` equal to the specified string", function() {
                expect(propMeta.name).toBe("fooBar");
              });

              it("should have `label` derived by 'capitalization' of name", function() {
                expect(propMeta.label).toBe("Foo Bar");
              });

              it("should have `type` string", function() {
                expect(propMeta.type).toBe(String.meta);
              });

              it("should have `declaringType` equal to containing ComplexMeta class", function() {
                expect(propMeta.declaringType).toBe(Derived.meta);
              });

              it("should have `list=false`", function() {
                expect(propMeta.list).toBe(false);
              });

              it("should have `root` equal to itself", function() {
                expect(propMeta.root).toBe(propMeta);
              });

              it("should have `ancestor` equal to `null`", function() {
                expect(propMeta.ancestor).toBe(null);
              });
            });
          });

          describe("with two entries -", function() {
            var Derived = Complex.extend({
              meta: {
                label: "Derived",
                props: ["fooBar", "guru"]
              }
            });

            it("should result in a props collection with length 2", function() {
              expect(Derived.meta.props.length).toBe(2);
              expect(Derived.meta.props[0].name).toBe("fooBar");
              expect(Derived.meta.props[1].name).toBe("guru");
            });
          });

          describe("with an entry that overrides a base type property -", function() {
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
              expect(A.meta.props.length).toBe(2);
              expect(B.meta.props.length).toBe(2);

              var baseProp = A.meta.props[1];
              var subProp  = B.meta.props[1];

              expect(subProp).not.toBe(baseProp);

              expect(baseProp.name).toBe("guru");
              expect(baseProp.label).toBe("Guru");

              expect(subProp.name).toBe("guru");
              expect(subProp.label).toBe("HELLO");

              expect(subProp.ancestor).toBe(baseProp);
            });
          });

          describe("with an entry that is not a base type property -", function() {
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
              expect(A.meta.props.length).toBe(2);
              expect(B.meta.props.length).toBe(3);

              expect(B.meta.props[0].name).toBe("fooBar");
              expect(B.meta.props[1].name).toBe("guru");
              expect(B.meta.props[2].name).toBe("babah");
            });
          });

          describe("with a dictionary -", function() {
            it("should define the defined properties", function() {
              var A = Complex.extend({
                meta: {
                  label: "A",
                  props: {"fooBar": {}, "guru": {}}
                }
              });

              expect(A.meta.props.length).toBe(2);
              expect(A.meta.props[0]).not.toBe(A.meta.props[1]);

              var iName0 = ["fooBar", "guru"].indexOf(A.meta.props[0].name);
              var iName1 = ["fooBar", "guru"].indexOf(A.meta.props[1].name);

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

              expect(A.meta.props.length).toBe(2);
              expect(A.meta.props.get("fooBar") instanceof PropertyMeta).toBe(true);
              expect(A.meta.props.get("guru") instanceof PropertyMeta).toBe(true);
              expect(A.meta.props.get("dada")).toBe(null);
              expect(A.meta.props.get("babah")).toBe(null);
            });

            it("should throw if a property specifies a name different from the key", function() {
              expect(function() {
                Complex.extend({
                  meta: {
                    label: "A",
                    props: {"fooBar": {name: "babah"}}
                  }
                });
              }).toThrowError(error.argInvalid("config", "Property name does not match object key.").message);
            });
          });

          it("should be possible to configure existing properties using a dictionary and `Type.implement`", function() {
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

            expect(A.meta.props[0].label).toBe("labelX");
            expect(A.meta.props[1].label).toBe("labelY");
          });
        }); // when specified non-empty
      }); // #props

    }); // .extend({...})

    describe("new Complex() -", function() {
      it("should be possible to create an instance with no arguments", function() {
        new Complex();
      });
      it("should be possible to create an instance with empty arguments", function() {
        new Complex({});
      });
    });

    describe("new DerivedComplex() -", function() {
      var Derived;
      beforeEach(function() {
        Derived = Complex.extend({
          meta: {
            label: "Derived",
            props: [
              "x",
              "y",
              {name: "z", list: true}
            ]
          }
        });
      });

      describe("when given empty arguments -", function() {
        it("should not throw", function() {
          new Derived();
        });

        it("should have every property with its default value", function() {
          var derived = new Derived();

          expect(derived.x).toBe(null);
          expect(derived.y).toBe(null);
          expect(derived.z).toEqual([]);
        });

        it("should respect values specified in an object", function() {
          var derived = new Derived({x: "1", y: "2", z: ["0"]});

          expect(derived.x.value).toBe("1");
          expect(derived.y.value).toBe("2");
          expect(derived.z.length).toBe(1);
          expect(derived.z[0].value).toBe("0");
        });

        it("should respect values specified in an array", function() {
          var derived = new Derived(["1", "2", ["0"]]);

          expect(derived.x.value).toBe("1");
          expect(derived.y.value).toBe("2");
          expect(derived.z.length).toBe(1);
          expect(derived.z[0].value).toBe("0");
        });

        it("should cast the specified values", function() {
          var derived = new Derived([0, 1, [2]]);

          expect(derived.x.value).toBe("0");
          expect(derived.y.value).toBe("1");
          expect(derived.z.length).toBe(1);
          expect(derived.z[0].value).toBe("2");
        });

        it("should respect values specified in v/f syntax", function() {
          var derived = new Derived({
            x: {v: 1, f: "1.0 EUR"},
            y: {v: 2, f: "2.0 USD"},
            z: [{v: 0, f: "0.0 POUNDS"}]
          });

          expect(derived.x.value).toBe("1");
          expect(derived.y.value).toBe("2");
          expect(derived.z.length).toBe(1);
          expect(derived.z[0].value).toBe("0");

          expect(derived.x.formatted).toBe("1.0 EUR");
          expect(derived.y.formatted).toBe("2.0 USD");
          expect(derived.z[0].formatted).toBe("0.0 POUNDS");
        });
      });


    });
  }); // pentaho/type/complex
});