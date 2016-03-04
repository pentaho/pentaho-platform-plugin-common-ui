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
  "pentaho/type/Item",
  "pentaho/type/facets/Refinement",
  "tests/pentaho/util/errorMatch"
], function(Context, Item, RefinementFacet, errorMatch) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Simple  = context.get("pentaho/type/simple"),
      List    = context.get("pentaho/type/list"),
      Complex = context.get("pentaho/type/complex"),
      Number  = context.get("pentaho/type/number"),
      Refinement = context.get("pentaho/type/refinement");

  describe("pentaho.type.Refinement -", function() {

    it("should be a function", function() {
      expect(typeof Refinement).toBe("function");
    });

    it("should inherit from Item", function() {
      expect(Refinement.prototype instanceof Item).toBe(true);
    });

    describe(".extend(...) -", function() {

      var Facet = RefinementFacet.extend();

      var MySimple = Simple.extend();

      it("should throw if it is a root refinement type and not given an `of`", function() {
        expect(function() {
          Refinement.extend({meta: {facets: [Facet]}});
        }).toThrow(errorMatch.argRequired("of"));
      });

      it("should throw if it is a root refinement type and the given `of` is from a different context", function() {
        var context2 = new Context();
        var MySimple2 = context2.get("pentaho/type/simple").extend();
        expect(function() {
          Refinement.extend({
            meta: {
              of: MySimple2.meta,
              facets: [Facet]
            }
          });
        }).toThrow(errorMatch.argInvalid("typeRef"));
      });

      it("should throw if given an `of` which is not a representation type", function() {
        expect(function() {
          Refinement.extend({
            meta: {
              of:     context.get("pentaho/type/value").extend().meta,
              facets: [Facet]
            }
          });
        }).toThrow(errorMatch.argInvalidType("of", ["pentaho/type/element", "pentaho/type/list"]));
      });

      it("should not throw if given an `of` which is a representation type", function() {
        Refinement.extend({
          meta: {
            of: context.get("pentaho/type/element").meta,
            facets: [Facet]
          }
        });

        Refinement.extend({
          meta: {
            of: context.get("pentaho/type/list").meta,
            facets: [Facet]
          }
        });

        Refinement.extend({
          meta: {
            of: context.get("pentaho/type/element").extend().meta,
            facets: [Facet]
          }
        });

        Refinement.extend({
          meta: {
            of: context.get("pentaho/type/list").extend().meta,
            facets: [Facet]
          }
        });
      });

      it("should throw if given a mesa constructor", function() {
        expect(function() {
          Refinement.extend({
            constructor: function() {},
            meta: {
              of: MySimple.meta,
              facets: [Facet]
            }
          });
        }).toThrow(errorMatch.operInvalid());
      });

      it("should throw if given any instance attribute", function() {
        expect(function() {
          Refinement.extend({
            foo: "bar",
            meta: {
              of: MySimple.meta,
              facets: [Facet]
            }
          });
        }).toThrow(errorMatch.operInvalid());
      });

      it("should allow to further extend a refinement type", function() {
        var R1 = Refinement.extend({
          meta: {
            of: MySimple.meta,
            facets: [Facet]
          }
        });

        var R2 = R1.extend();

        expect(R2.prototype instanceof R1).toBe(true);
      });

      it("should create a refinement type constructor that when invoked returns a direct instance of the representation type", function() {
        var MyRefinement = Refinement.extend({
          meta: {
            of: MySimple.meta,
            facets: [Facet]
          }
        });

        var instance = new MyRefinement(123);
        expect(instance instanceof MyRefinement).toBe(false);

        expect(instance instanceof MySimple).toBe(true);
        expect(instance.constructor).toBe(MySimple);
      });
    });

    describe(".Meta -", function() {

      var Facet1 = RefinementFacet.extend(),
          Facet2 = RefinementFacet.extend(),
          Facet  = Facet1;

      var MySimple = Simple.extend();

      describe("#isSubtypeOf(superType)", function() {
        var MyRefinement = Refinement.extend({
          meta: {of: MySimple.meta}
        });

        it("should return false when superType is nully", function() {
          expect(MyRefinement.meta.isSubtypeOf(null)).toBe(false);
        });

        it("should return true when superType is itself", function() {
          expect(MyRefinement.meta.isSubtypeOf(MyRefinement.meta)).toBe(true);
        });

        it("should return true when this was extended from superType", function() {
          var SubMyRefinement = MyRefinement.extend();
          expect(SubMyRefinement.meta.isSubtypeOf(MyRefinement.meta)).toBe(true);
        });

        it("should return false when this was not extended from superType", function() {
          var SubMyRefinement1 = MyRefinement.extend();
          var SubMyRefinement2 = Item.extend();
          expect(SubMyRefinement1.meta.isSubtypeOf(SubMyRefinement2.meta)).toBe(false);
        });

        it("should return true when this.of is superType", function() {
          expect(MyRefinement.meta.isSubtypeOf(MySimple.meta)).toBe(true);
        });

        it("should return true when this.of was extended from superType", function() {
          expect(MyRefinement.meta.isSubtypeOf(Simple.meta)).toBe(true);
        });
      });

      describe("#of -", function() {
        it("should create a refinement type with the specified `of` type", function() {
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet]
            }
          });

          expect(MyRefinement.meta.of).toBe(MySimple.meta);
        });

        it("should allow to further extend a refinement type and preserve the `of`", function() {
          var R1 = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet]
            }
          });

          expect(R1.meta.of).toBe(MySimple.meta);

          var R2 = R1.extend();

          expect(R1.meta.of).toBe(MySimple.meta);
          expect(R2.meta.of).toBe(MySimple.meta);
        });

        it("should throw if attempting to change `of`", function() {
          var R1 = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet]
            }
          });

          var MySimple2 = Simple.extend();

          expect(function() {
            R1.meta.of = MySimple2.meta;
          }).toThrowError(TypeError);
        });
      });

      describe("#facets -", function() {
        it("should not throw if not given any refinement facets", function() {
          Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });
        });

        it("should throw if given facets which are not RefinementFacet.s", function() {
          function expectIt(facets) {
            expect(function() {
              Refinement.extend({
                meta: {
                  of: MySimple.meta,
                  facets: facets
                }
              });
            }).toThrow(errorMatch.argInvalidType("facets", "pentaho/type/facets/Refinement"));
          }

          expectIt([{}]); // Not a function
          expectIt([Item]); // Not a subclass of RefinementFacet
          expectIt([null]);
        });

        it("should create a refinement type if given refinement facets and `of`", function() {
          Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet]
            }
          });
        });

        it("should create a refinement type with the specified refinement facets", function() {
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet1, Facet2]
            }
          });

          var facets = MyRefinement.meta.facets;
          expect(Array.isArray(facets)).toBe(true);
          expect(facets.length).toBe(2);
          expect(facets[0]).toBe(Facet1);
          expect(facets[1]).toBe(Facet2);
        });

        it("should allow specifying a refinement facet class, not in an array", function() {
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: Facet
            }
          });

          var facets = MyRefinement.meta.facets;
          expect(Array.isArray(facets)).toBe(true);
          expect(facets.length).toBe(1);
          expect(facets[0]).toBe(Facet);
        });

        it("should filter out specified duplicate refinement facet classes", function() {
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet, Facet]
            }
          });

          var facets = MyRefinement.meta.facets;
          expect(Array.isArray(facets)).toBe(true);
          expect(facets.length).toBe(1);
          expect(facets[0]).toBe(Facet);
        });

        it("should allow _adding_ refinement facet classes when there are already local facets", function() {
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet1]
            }
          });

          MyRefinement.meta.facets = Facet2;

          var facets = MyRefinement.meta.facets;
          expect(facets.length).toBe(2);
          expect(facets[0]).toBe(Facet1);
          expect(facets[1]).toBe(Facet2);
        });

        it("should create a refinement type with the specified Refinement facet classes' prototypes mixed in", function() {
          var Facet1 = RefinementFacet.extend({
            attribute1: {}
          });

          var Facet2 = RefinementFacet.extend({
            attribute2: {}
          });

          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet1, Facet2]
            }
          });

          expect(MyRefinement.meta.attribute1).toBe(Facet1.prototype.attribute1);
          expect(MyRefinement.meta.attribute2).toBe(Facet2.prototype.attribute2);
        });

        it("should not mixin the Refinement classes' static interface", function() {
          var Facet = RefinementFacet.extend({}, {
            attribute1: {},
            attribute2: function() {}
          });

          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet]
            }
          });

          expect(MyRefinement.meta.attribute1).toBe(undefined);
          expect(MyRefinement.meta.attribute2).toBe(undefined);

          // Meta
          expect(MyRefinement.meta.constructor.attribute1).toBe(undefined);
          expect(MyRefinement.meta.constructor.attribute2).toBe(undefined);
        });

        it("should be able to use the Refinement Facet's members directly in the _refines_ spec", function() {

          var Facet1 = RefinementFacet.extend({
            set attribute1(v) {
              this._attribute1 = v;
            }
          });

          var Facet2 = RefinementFacet.extend({
            set attribute2(v) {
              this._attribute2 = v;
            }
          });

          var v1 = {}, v2 = {};

          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet1, Facet2],
              attribute1: v1,
              attribute2: v2
            }
          });

          expect(MyRefinement.meta._attribute1).toBe(v1);
          expect(MyRefinement.meta._attribute2).toBe(v2);
        });

        it("should inherit base facets array when unspecified locally", function() {
          var R1 = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet1, Facet2]
            }
          });

          var R2 = R1.extend();

          expect(R2.meta.facets).toBe(R2.meta.facets);
        });

        it("should create a new array with all base facets array when specified locally", function() {
          var Facet3 = RefinementFacet.extend();

          var R1 = Refinement.extend({
            meta: {
              of: MySimple.meta,
              facets: [Facet1, Facet2]
            }
          });

          var R2 = R1.extend({
            meta: {
              facets: [Facet1, Facet3]
            }
          });

          var facets2 = R2.meta.facets;
          expect(facets2).not.toBe(R1.meta.facets);
          expect(R1.meta.facets.length).toBe(2);
          expect(facets2.length).toBe(3);
          expect(facets2[0]).toBe(Facet1);
          expect(facets2[1]).toBe(Facet2);
          expect(facets2[2]).toBe(Facet3);
        });

        it("should support resolving standard facets", function() {
          var MyRefinement = Refinement.extend({
            meta: {
              of:     MySimple.meta,
              facets: ["DiscreteDomain"]
            }
          });

          expect(MyRefinement.meta.facets.length).toBe(1);
          expect(MyRefinement.meta.facets[0].prototype instanceof RefinementFacet).toBe(true);
        });

        it("should support resolving absolute facet modules", function() {
          var MyRefinement = Refinement.extend({
            meta: {
              of:     MySimple.meta,
              facets: ["pentaho/type/facets/DiscreteDomain"]
            }
          });

          expect(MyRefinement.meta.facets.length).toBe(1);
          expect(MyRefinement.meta.facets[0].prototype instanceof RefinementFacet).toBe(true);
        });
      });

      describe("#context -", function() {
        it("should be that of the representation type", function() {
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.context).toBe(MySimple.meta.context);
        });
      });

      describe("#isAbstract -", function() {
        it("should have the value of the representation type", function() {
          function expectIt(value) {
            var MySimple = Simple.extend({meta: {isAbstract: value}});
            var MyRefinement = Refinement.extend({
              meta: {
                of: MySimple.meta
              }
            });

            expect(MyRefinement.meta.isAbstract).toBe(value);
          }

          expectIt(true);
          expectIt(false);
        });

        it("should not throw if set to the same value", function() {
          function expectIt(value) {
            var MySimple = Simple.extend({meta: {isAbstract: value}});
            var MyRefinement = Refinement.extend({
              meta: {
                of: MySimple.meta
              }
            });

            MyRefinement.meta.isAbstract = value;
          }

          expectIt(true);
          expectIt(false);
        });

        it("should throw if set to a different value", function() {
          function expectIt(value) {
            var MySimple = Simple.extend({meta: {isAbstract: value}});
            var MyRefinement = Refinement.extend({
              meta: {
                of: MySimple.meta
              }
            });

            expect(function() {
              MyRefinement.meta.isAbstract = !value;
            }).toThrow(errorMatch.operInvalid());
          }

          expectIt(true);
          expectIt(false);
        });
      });

      describe("#isList -", function() {
        it("should be false when the representation type is an element type", function() {
          var MySimple = Simple.extend();
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.isList).toBe(false);
        });

        it("should be true when the representation type is a list type", function() {
          var MyList = List.extend();
          var MyRefinement = Refinement.extend({
            meta: {
              of: MyList.meta
            }
          });

          expect(MyRefinement.meta.isList).toBe(true);
        });
      });

      describe("#isRefinement -", function() {
        it("should return the value `true`", function() {
          expect(Refinement.meta.isRefinement).toBe(true);
        });
      });

      describe("#label -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({meta: {label: "FOO"}});
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.label).toBe(MySimple.meta.label);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({meta: {label: "FOO"}});
          var MyRefinement = Refinement.extend({
            meta: {
              label: "BAR",
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.label).toBe("BAR");
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({meta: {label: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              label: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend();

          expect(R2.meta.label).toBe("BAR");
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({meta: {label: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              label: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {label: "DUDU"}});

          expect(R2.meta.label).toBe("DUDU");
        });

        it("should fallback to the base value when set to a nully or empty string value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({meta: {label: "FOO"}});
            var R1 = Refinement.extend({
              meta: {
                label: "BAR",
                of: MySimple.meta
              }
            });
            var R2 = R1.extend({meta: {label: "DUDU"}});

            expect(R2.meta.label).toBe("DUDU");

            R2.meta.label = newLabel;

            expect(R2.meta.label).toBe("BAR");
          }

          expectIt(null);
          expectIt(undefined);
          expectIt("");
        });

        it("should fallback to the value of the representation type when set to a nully or empty string value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({meta: {label: "FOO"}});
            var R1 = Refinement.extend({
              meta: {
                label: "BAR",
                of: MySimple.meta
              }
            });

            expect(R1.meta.label).toBe("BAR");

            R1.meta.label = newLabel;

            expect(R1.meta.label).toBe("FOO");
          }

          expectIt(null);
          expectIt(undefined);
          expectIt("");
        });

        it("should not delete the root value", function() {
          Refinement.meta.label = undefined;
          expect(Refinement.meta.hasOwnProperty("_label"));
        });
      }); // end #label

      describe("#description -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({meta: {description: "FOO"}});
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.description).toBe(MySimple.meta.description);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({meta: {description: "FOO"}});
          var MyRefinement = Refinement.extend({
            meta: {
              description: "BAR",
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.description).toBe("BAR");
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({meta: {description: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              description: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend();

          expect(R2.meta.description).toBe("BAR");
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({meta: {description: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              description: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {description: "DUDU"}});

          expect(R2.meta.description).toBe("DUDU");
        });

        it("should fallback to the base value when set to undefined", function() {

          var MySimple = Simple.extend({meta: {description: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              description: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {description: "DUDU"}});

          expect(R2.meta.description).toBe("DUDU");

          R2.meta.description = undefined;

          expect(R2.meta.description).toBe("BAR");
        });

        it("should respect a null or empty string locally specified value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({meta: {description: "FOO"}});
            var R1 = Refinement.extend({
              meta: {
                description: "BAR",
                of: MySimple.meta
              }
            });
            var R2 = R1.extend({meta: {description: "DUDU"}});

            expect(R2.meta.description).toBe("DUDU");

            R2.meta.description = newLabel;

            expect(R2.meta.description).toBe(null);
          }

          expectIt(null);
          expectIt("");
        });

        it("should fallback to the value of the representation type when set to undefined", function() {
          var MySimple = Simple.extend({meta: {description: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              description: "BAR",
              of: MySimple.meta
            }
          });

          expect(R1.meta.description).toBe("BAR");

          R1.meta.description = undefined;

          expect(R1.meta.description).toBe("FOO");
        });

        it("should not delete the root value", function() {
          Refinement.meta.description = undefined;
          expect(Refinement.meta.hasOwnProperty("_description"));
        });
      }); // end #description

      describe("#category -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({meta: {category: "FOO"}});
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.category).toBe(MySimple.meta.category);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({meta: {category: "FOO"}});
          var MyRefinement = Refinement.extend({
            meta: {
              category: "BAR",
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.category).toBe("BAR");
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({meta: {category: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              category: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend();

          expect(R2.meta.category).toBe("BAR");
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({meta: {category: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              category: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {category: "DUDU"}});

          expect(R2.meta.category).toBe("DUDU");
        });

        it("should fallback to the base value when set to undefined", function() {

          var MySimple = Simple.extend({meta: {category: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              category: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {category: "DUDU"}});

          expect(R2.meta.category).toBe("DUDU");

          R2.meta.category = undefined;

          expect(R2.meta.category).toBe("BAR");
        });

        it("should respect a null or empty string locally specified value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({meta: {category: "FOO"}});
            var R1 = Refinement.extend({
              meta: {
                category: "BAR",
                of: MySimple.meta
              }
            });
            var R2 = R1.extend({meta: {category: "DUDU"}});

            expect(R2.meta.category).toBe("DUDU");

            R2.meta.category = newLabel;

            expect(R2.meta.category).toBe(null);
          }

          expectIt(null);
          expectIt("");
        });

        it("should fallback to the value of the representation type when set to undefined", function() {
          var MySimple = Simple.extend({meta: {category: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              category: "BAR",
              of: MySimple.meta
            }
          });

          expect(R1.meta.category).toBe("BAR");

          R1.meta.category = undefined;

          expect(R1.meta.category).toBe("FOO");
        });

        it("should not delete the root value", function() {
          Refinement.meta.category = undefined;
          expect(Refinement.meta.hasOwnProperty("_category"));
        });
      }); // end #category

      describe("#helpUrl -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({meta: {helpUrl: "FOO"}});
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.helpUrl).toBe(MySimple.meta.helpUrl);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({meta: {helpUrl: "FOO"}});
          var MyRefinement = Refinement.extend({
            meta: {
              helpUrl: "BAR",
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.helpUrl).toBe("BAR");
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({meta: {helpUrl: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              helpUrl: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend();

          expect(R2.meta.helpUrl).toBe("BAR");
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({meta: {helpUrl: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              helpUrl: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {helpUrl: "DUDU"}});

          expect(R2.meta.helpUrl).toBe("DUDU");
        });

        it("should fallback to the base value when set to undefined", function() {

          var MySimple = Simple.extend({meta: {helpUrl: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              helpUrl: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {helpUrl: "DUDU"}});

          expect(R2.meta.helpUrl).toBe("DUDU");

          R2.meta.helpUrl = undefined;

          expect(R2.meta.helpUrl).toBe("BAR");
        });

        it("should respect a null or empty string locally specified value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({meta: {helpUrl: "FOO"}});
            var R1 = Refinement.extend({
              meta: {
                helpUrl: "BAR",
                of: MySimple.meta
              }
            });
            var R2 = R1.extend({meta: {helpUrl: "DUDU"}});

            expect(R2.meta.helpUrl).toBe("DUDU");

            R2.meta.helpUrl = newLabel;

            expect(R2.meta.helpUrl).toBe(null);
          }

          expectIt(null);
          expectIt("");
        });

        it("should fallback to the value of the representation type when set to undefined", function() {
          var MySimple = Simple.extend({meta: {helpUrl: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              helpUrl: "BAR",
              of: MySimple.meta
            }
          });

          expect(R1.meta.helpUrl).toBe("BAR");

          R1.meta.helpUrl = undefined;

          expect(R1.meta.helpUrl).toBe("FOO");
        });

        it("should not delete the root value", function() {
          Refinement.meta.helpUrl = undefined;
          expect(Refinement.meta.hasOwnProperty("_helpUrl"));
        });
      }); // end #helpUrl

      describe("#isBrowsable -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({meta: {isBrowsable: false}});
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.isBrowsable).toBe(MySimple.meta.isBrowsable);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({meta: {isBrowsable: false}});
          var MyRefinement = Refinement.extend({
            meta: {
              isBrowsable: true,
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.isBrowsable).toBe(true);
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({meta: {isBrowsable: false}});
          var R1 = Refinement.extend({
            meta: {
              isBrowsable: true,
              of: MySimple.meta
            }
          });
          var R2 = R1.extend();

          expect(R2.meta.isBrowsable).toBe(true);
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({meta: {isBrowsable: true}});
          var R1 = Refinement.extend({
            meta: {
              isBrowsable: true,
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {isBrowsable: false}});

          expect(R2.meta.isBrowsable).toBe(false);
        });

        it("should fallback to the base value when set to nully", function() {
          function expectIt(newValue) {
            var MySimple = Simple.extend({meta: {isBrowsable: true}});
            var R1 = Refinement.extend({
              meta: {
                isBrowsable: true,
                of: MySimple.meta
              }
            });
            var R2 = R1.extend({meta: {isBrowsable: false}});

            expect(R2.meta.isBrowsable).toBe(false);

            R2.meta.isBrowsable = newValue;

            expect(R2.meta.isBrowsable).toBe(true);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should fallback to the value of the representation type when set to nully", function() {
          function expectIt(newValue) {
            var MySimple = Simple.extend({meta: {isBrowsable: false}});
            var R1 = Refinement.extend({
              meta: {
                isBrowsable: true,
                of: MySimple.meta
              }
            });

            expect(R1.meta.isBrowsable).toBe(true);

            R1.meta.isBrowsable = newValue;

            expect(R1.meta.isBrowsable).toBe(false);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should not delete the root value", function() {
          Refinement.meta.isBrowsable = undefined;
          expect(Refinement.meta.hasOwnProperty("_isBrowsable"));
        });
      }); // end #isBrowsable

      describe("#advanced -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({meta: {advanced: true}});
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.advanced).toBe(MySimple.meta.advanced);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({meta: {advanced: true}});
          var MyRefinement = Refinement.extend({
            meta: {
              advanced: false,
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.advanced).toBe(false);
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({meta: {advanced: true}});
          var R1 = Refinement.extend({
            meta: {
              advanced: false,
              of: MySimple.meta
            }
          });
          var R2 = R1.extend();

          expect(R2.meta.advanced).toBe(false);
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({meta: {advanced: false}});
          var R1 = Refinement.extend({
            meta: {
              advanced: false,
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {advanced: true}});

          expect(R2.meta.advanced).toBe(true);
        });

        it("should fallback to the base value when set to nully", function() {

          function expectIt(newValue) {
            var MySimple = Simple.extend({meta: {advanced: false}});
            var R1 = Refinement.extend({
              meta: {
                advanced: false,
                of: MySimple.meta
              }
            });
            var R2 = R1.extend({meta: {advanced: true}});

            expect(R2.meta.advanced).toBe(true);

            R2.meta.advanced = newValue;

            expect(R2.meta.advanced).toBe(false);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should fallback to the value of the representation type when set to nully", function() {
          function expectIt(newValue) {
            var MySimple = Simple.extend({meta: {advanced: true}});
            var R1 = Refinement.extend({
              meta: {
                advanced: false,
                of: MySimple.meta
              }
            });

            expect(R1.meta.advanced).toBe(false);

            R1.meta.advanced = newValue;

            expect(R1.meta.advanced).toBe(true);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should not delete the root value", function() {
          Refinement.meta.advanced = undefined;
          expect(Refinement.meta.hasOwnProperty("_advanced"));
        });
      }); // end #advanced

      describe("#ordinal -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({meta: {ordinal: 1}});
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.ordinal).toBe(MySimple.meta.ordinal);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({meta: {ordinal: 1}});
          var MyRefinement = Refinement.extend({
            meta: {
              ordinal: 2,
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.ordinal).toBe(2);
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({meta: {ordinal: 1}});
          var R1 = Refinement.extend({
            meta: {
              ordinal: 2,
              of: MySimple.meta
            }
          });
          var R2 = R1.extend();

          expect(R2.meta.ordinal).toBe(2);
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({meta: {ordinal: 1}});
          var R1 = Refinement.extend({
            meta: {
              ordinal: 2,
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {ordinal: 3}});

          expect(R2.meta.ordinal).toBe(3);
        });

        it("should fallback to the base value when set to nully", function() {

          function expectIt(newValue) {
            var MySimple = Simple.extend({meta: {ordinal: 1}});
            var R1 = Refinement.extend({
              meta: {
                ordinal: 2,
                of: MySimple.meta
              }
            });
            var R2 = R1.extend({meta: {ordinal: 3}});

            expect(R2.meta.ordinal).toBe(3);

            R2.meta.ordinal = newValue;

            expect(R2.meta.ordinal).toBe(2);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should fallback to the value of the representation type when set to nully", function() {
          function expectIt(newValue) {
            var MySimple = Simple.extend({meta: {ordinal: 1}});
            var R1 = Refinement.extend({
              meta: {
                ordinal: 2,
                of: MySimple.meta
              }
            });

            expect(R1.meta.ordinal).toBe(2);

            R1.meta.ordinal = newValue;

            expect(R1.meta.ordinal).toBe(1);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should not delete the root value", function() {
          Refinement.meta.ordinal = undefined;
          expect(Refinement.meta.hasOwnProperty("_ordinal"));
        });
      }); // end #ordinal

      describe("#view -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({meta: {view: "FOO"}});
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.view).toBe(MySimple.meta.view);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({meta: {view: "FOO"}});
          var MyRefinement = Refinement.extend({
            meta: {
              view: "BAR",
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.view).toBe("BAR");
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({meta: {view: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              view: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend();

          expect(R2.meta.view).toBe("BAR");
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({meta: {view: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              view: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {view: "DUDU"}});

          expect(R2.meta.view).toBe("DUDU");
        });

        it("should fallback to the base value when set to undefined", function() {

          var MySimple = Simple.extend({meta: {view: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              view: "BAR",
              of: MySimple.meta
            }
          });
          var R2 = R1.extend({meta: {view: "DUDU"}});

          expect(R2.meta.view).toBe("DUDU");

          R2.meta.view = undefined;

          expect(R2.meta.view).toBe("BAR");
        });

        it("should respect the specified null or empty string value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({meta: {view: "FOO"}});
            var R1 = Refinement.extend({
              meta: {
                view: "BAR",
                of: MySimple.meta
              }
            });
            var R2 = R1.extend({meta: {view: "DUDU"}});

            expect(R2.meta.view).toBe("DUDU");

            R2.meta.view = newLabel;

            expect(R2.meta.view).toBe(null);
          }

          expectIt(null);
          expectIt("");
        });

        it("should fallback to the value of the representation type when set to undefined", function() {

          var MySimple = Simple.extend({meta: {view: "FOO"}});
          var R1 = Refinement.extend({
            meta: {
              view: "BAR",
              of: MySimple.meta
            }
          });

          expect(R1.meta.view).toBe("BAR");

          R1.meta.view = undefined;

          expect(R1.meta.view).toBe("FOO");
        });

        it("should not delete the root value", function() {
          Refinement.meta.view = undefined;
          expect(Refinement.meta.hasOwnProperty("_view"));
        });
      }); // end #view

      describe("#is(.) -", function() {
        it("should return true for an instance of the representation type", function() {
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          expect(MyRefinement.meta.is(new MySimple(123))).toBe(true);
          expect(MyRefinement.meta.is({})).toBe(false);
        });
      });

      describe("#create(.) -", function() {
        it("should return instances of the representation type", function() {
          var MyRefinement = Refinement.extend({
            meta: {
              of: MySimple.meta
            }
          });

          var converted = MyRefinement.meta.create(123);
          expect(converted.constructor).toBe(MySimple);
        });
      });
    });

    describe("property usage -", function() {
      var PositiveRefinement = RefinementFacet.extend({}, {
          validate: function(value) {
            return value.value > 0;
          }
        });

      var PositiveNumber = Number.refine({meta: {
          facets: PositiveRefinement
        }});

      it("should allow defining a property of a refinement type", function() {
        Complex.extend({
          meta: {
            props: [
              {name: "likes", type: PositiveNumber}
            ]
          }
        });
      });

      it("should allow overriding a property with a refinement of the base type", function() {
        var MyComplex = Complex.extend({
          meta: {
            props: [
              {name: "likes", type: Number}
            ]
          }
        });

        MyComplex.extend({
          meta: {
            props: [
              {name: "likes", type: PositiveNumber}
            ]
          }
        });
      });

      it("should throw when overriding a property with a refinement of a type other than the base type", function() {
        var MyComplex = Complex.extend({
          meta: {
            props: [
              {name: "likes", type: Complex}
            ]
          }
        });

        expect(function() {
          MyComplex.extend({
            meta: {
              props: [
                {name: "likes", type: PositiveNumber}
              ]
            }
          });
        }).toThrow(errorMatch.argInvalid("type"));
      });

      it("should allow specifying the value of a property of a refinement type given the primitive value", function() {
        var Derived = Complex.extend({
          meta: {
            props: [
              {name: "likes", type: PositiveNumber}
            ]
          }
        });

        var d = new Derived({likes: 1});

        expect(d.get("likes").value).toBe(1);
      });

      it("should get a value whose class is that of the representation type", function() {
        var Derived = Complex.extend({
          meta: {
            props: [
              {name: "likes", type: PositiveNumber}
            ]
          }
        });

        var d = new Derived({likes: 1});

        expect(d.get("likes") instanceof Number).toBe(true);
        expect(d.get("likes").constructor).toBe(Number);
      });

      it("should accept being set to a value of the representation type", function() {
        var Derived = Complex.extend({
          meta: {
            props: [
              {name: "likes", type: PositiveNumber}
            ]
          }
        });

        var d = new Derived();
        var v = new Number(1);
        d.set("likes", v);
        expect(d.get("likes").value).toBe(1);
      });
    });

    describe("list usage -", function() {
      var PositiveRefinement = RefinementFacet.extend({}, {
        validate: function(value) {
          return value.value > 0;
        }
      });

      var PositiveNumber = Number.refine({meta: {
        facets: PositiveRefinement
      }});

      it("should allow defining a list of a refinement type", function() {
        List.extend({meta: {of: PositiveNumber}});
      });

      it("should allow extending a list to a refinement of the base type", function() {
        var NumberList = List.extend({meta: {of: Number}});

        NumberList.extend({meta: {of: PositiveNumber}});
      });

      it("should throw when extending a list to a refinement of a type not a subtype of the base type", function() {
        var ComplexList = List.extend({meta: {of: Complex}});

        expect(function() {
          ComplexList.extend({meta: {of: PositiveNumber}});
        }).toThrow(errorMatch.argInvalid("of"));
      });

      it("should allow specifying an element of a refinement type given the primitive value", function() {
        var PositiveNumberList = List.extend({meta: {of: PositiveNumber}});

        var list = new PositiveNumberList([1]);

        expect(list.at(0).value).toBe(1);
      });

      it("should get a value whose class is that of the representation type", function() {
        var PositiveNumberList = List.extend({meta: {of: PositiveNumber}});

        var list = new PositiveNumberList([1]);

        expect(list.at(0) instanceof Number).toBe(true);
        expect(list.at(0).constructor).toBe(Number);
      });

      it("should accept being set to a value of the representation type", function() {
        var PositiveNumberList = List.extend({meta: {of: PositiveNumber}});

        var list = new PositiveNumberList();

        var v = new Number(1);

        list.add(1);
        expect(list.at(0).value).toBe(1);
      });
    });
  });
});
