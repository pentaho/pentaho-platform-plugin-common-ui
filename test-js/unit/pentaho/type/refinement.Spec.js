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
  "pentaho/type/Instance",
  "pentaho/type/facets/Refinement",
  "tests/pentaho/util/errorMatch"
], function(Context, Instance, RefinementFacet, errorMatch) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      Simple  = context.get("pentaho/type/simple"),
      List    = context.get("pentaho/type/list"),
      Complex = context.get("pentaho/type/complex"),
      PentahoNumber = context.get("pentaho/type/number"),
      Refinement = context.get("pentaho/type/refinement");

  describe("pentaho.type.Refinement -", function() {

    it("should be a function", function() {
      expect(typeof Refinement).toBe("function");
    });

    it("should inherit from Instance", function() {
      expect(Refinement.prototype instanceof Instance).toBe(true);
    });

    describe(".extend(...) -", function() {

      var Facet = RefinementFacet.extend(null, {id: "my/foo"});

      var MySimple = Simple.extend();

      it("should throw if it is a root refinement type and not given an `of`", function() {
        expect(function() {
          Refinement.extend({type: {facets: [Facet]}});
        }).toThrow(errorMatch.argRequired("of"));
      });

      it("should throw if it is a root refinement type and the given `of` is from a different context", function() {
        var context2 = new Context();
        var MySimple2 = context2.get("pentaho/type/simple").extend();
        expect(function() {
          Refinement.extend({
            type: {
              of: MySimple2.type,
              facets: [Facet]
            }
          });
        }).toThrow(errorMatch.argInvalid("typeRef"));
      });

      it("should throw if given an `of` which is not a representation type", function() {
        expect(function() {
          Refinement.extend({
            type: {
              of:     context.get("pentaho/type/value").extend().type,
              facets: [Facet]
            }
          });
        }).toThrow(errorMatch.argInvalidType("of", ["pentaho/type/element", "pentaho/type/list"]));
      });

      it("should not throw if given an `of` which is a representation type", function() {
        Refinement.extend({
          type: {
            of: context.get("pentaho/type/element").type,
            facets: [Facet]
          }
        });

        Refinement.extend({
          type: {
            of: context.get("pentaho/type/list").type,
            facets: [Facet]
          }
        });

        Refinement.extend({
          type: {
            of: context.get("pentaho/type/element").extend().type,
            facets: [Facet]
          }
        });

        Refinement.extend({
          type: {
            of: context.get("pentaho/type/list").extend().type,
            facets: [Facet]
          }
        });
      });

      it("should throw if given an instance constructor", function() {
        expect(function() {
          Refinement.extend({
            constructor: function() {},
            type: {
              of: MySimple.type,
              facets: [Facet]
            }
          });
        }).toThrow(errorMatch.operInvalid());
      });

      it("should throw if given any instance attribute", function() {
        expect(function() {
          Refinement.extend({
            foo: "bar",
            type: {
              of: MySimple.type,
              facets: [Facet]
            }
          });
        }).toThrow(errorMatch.operInvalid());
      });

      it("should throw if given a type embedded instance spec", function() {
        expect(function() {
          Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet],
              instance: {}
            }
          });
        }).toThrow(errorMatch.operInvalid());
      });

      it("should allow to further extend a refinement type", function() {
        var R1 = Refinement.extend({
          type: {
            of: MySimple.type,
            facets: [Facet]
          }
        });

        var R2 = R1.extend();

        expect(R2.prototype instanceof R1).toBe(true);
      });

      it("should create a refinement type constructor that when invoked returns a direct instance of " +
         "the representation type", function() {
        var MyRefinement = Refinement.extend({
          type: {
            of: MySimple.type,
            facets: [Facet]
          }
        });

        var instance = new MyRefinement(123);
        expect(instance instanceof MyRefinement).toBe(false);

        expect(instance instanceof MySimple).toBe(true);
        expect(instance.constructor).toBe(MySimple);
      });
    });

    describe(".Type -", function() {

      var Facet1 = RefinementFacet.extend(null, {id: "my/foo"}),
          Facet2 = RefinementFacet.extend(null, {id: "my/bar"}),
          Facet  = Facet1;

      var MySimple = Simple.extend();

      describe("#isSubtypeOf(superType)", function() {
        var MyRefinement = Refinement.extend({
          type: {of: MySimple.type}
        });

        it("should return false when superType is nully", function() {
          expect(MyRefinement.type.isSubtypeOf(null)).toBe(false);
        });

        it("should return true when superType is itself", function() {
          expect(MyRefinement.type.isSubtypeOf(MyRefinement.type)).toBe(true);
        });

        it("should return true when this was extended from superType", function() {
          var SubMyRefinement = MyRefinement.extend();
          expect(SubMyRefinement.type.isSubtypeOf(MyRefinement.type)).toBe(true);
        });

        it("should return false when this was not extended from superType", function() {
          var SubMyRefinement1 = MyRefinement.extend();
          var SubMyRefinement2 = Instance.extend();
          expect(SubMyRefinement1.type.isSubtypeOf(SubMyRefinement2.type)).toBe(false);
        });

        it("should return true when this.of is superType", function() {
          expect(MyRefinement.type.isSubtypeOf(MySimple.type)).toBe(true);
        });

        it("should return true when this.of was extended from superType", function() {
          expect(MyRefinement.type.isSubtypeOf(Simple.type)).toBe(true);
        });
      });

      describe("#of -", function() {
        it("should create a refinement type with the specified `of` type", function() {
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet]
            }
          });

          expect(MyRefinement.type.of).toBe(MySimple.type);
        });

        it("should allow to further extend a refinement type and preserve the `of`", function() {
          var R1 = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet]
            }
          });

          expect(R1.type.of).toBe(MySimple.type);

          var R2 = R1.extend();

          expect(R1.type.of).toBe(MySimple.type);
          expect(R2.type.of).toBe(MySimple.type);
        });

        it("should throw if attempting to change `of`", function() {
          var R1 = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet]
            }
          });

          var MySimple2 = Simple.extend();

          expect(function() {
            R1.type.of = MySimple2.type;
          }).toThrowError(TypeError);
        });
      });

      describe("#facets -", function() {
        it("should not throw if not given any refinement facets", function() {
          Refinement.extend({
            type: {
              of: MySimple.type
            }
          });
        });

        it("should throw if given facets which are not RefinementFacet.s", function() {
          function expectIt(facets) {
            expect(function() {
              Refinement.extend({
                type: {
                  of: MySimple.type,
                  facets: facets
                }
              });
            }).toThrow(errorMatch.argInvalidType("facets", "pentaho/type/facets/Refinement"));
          }

          expectIt([{}]); // Not a function
          expectIt([Instance]); // Not a subclass of RefinementFacet
          expectIt([null]);
        });

        it("should create a refinement type if given refinement facets and `of`", function() {
          Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet]
            }
          });
        });

        it("should create a refinement type with the specified refinement facets", function() {
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet1, Facet2]
            }
          });

          var facets = MyRefinement.type.facets;
          expect(Array.isArray(facets)).toBe(true);
          expect(facets.length).toBe(2);
          expect(facets[0]).toBe(Facet1);
          expect(facets[1]).toBe(Facet2);
        });

        it("should allow specifying a refinement facet class, not in an array", function() {
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: Facet
            }
          });

          var facets = MyRefinement.type.facets;
          expect(Array.isArray(facets)).toBe(true);
          expect(facets.length).toBe(1);
          expect(facets[0]).toBe(Facet);
        });

        it("should filter out specified duplicate refinement facet classes", function() {
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet, Facet]
            }
          });

          var facets = MyRefinement.type.facets;
          expect(Array.isArray(facets)).toBe(true);
          expect(facets.length).toBe(1);
          expect(facets[0]).toBe(Facet);
        });

        it("should allow _adding_ refinement facet classes when there are already local facets", function() {
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet1]
            }
          });

          MyRefinement.type.facets = Facet2;

          var facets = MyRefinement.type.facets;
          expect(facets.length).toBe(2);
          expect(facets[0]).toBe(Facet1);
          expect(facets[1]).toBe(Facet2);
        });

        it("should create a refinement type with the specified Refinement facet classes' prototypes mixed in",
        function() {
          var Facet1 = RefinementFacet.extend({
            attribute1: {}
          }, {
            id: "my/foo"
          });

          var Facet2 = RefinementFacet.extend({
            attribute2: {}
          }, {
            id: "my/bar"
          });

          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet1, Facet2]
            }
          });

          expect(MyRefinement.type.attribute1).toBe(Facet1.prototype.attribute1);
          expect(MyRefinement.type.attribute2).toBe(Facet2.prototype.attribute2);
        });

        it("should not mixin the Refinement classes' static interface", function() {
          var Facet = RefinementFacet.extend({}, {
            id: "my/foo",
            attribute1: {},
            attribute2: function() {}
          });

          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet]
            }
          });

          expect(MyRefinement.type.attribute1).toBe(undefined);
          expect(MyRefinement.type.attribute2).toBe(undefined);

          // Type
          expect(MyRefinement.type.constructor.attribute1).toBe(undefined);
          expect(MyRefinement.type.constructor.attribute2).toBe(undefined);
        });

        it("should be able to use the Refinement Facet's members directly in the _refines_ spec", function() {

          var Facet1 = RefinementFacet.extend({
            set attribute1(v) {
              this._attribute1 = v;
            }
          }, {
            id: "my/foo"
          });

          var Facet2 = RefinementFacet.extend({
            set attribute2(v) {
              this._attribute2 = v;
            }
          }, {
            id: "my/bar"
          });

          var v1 = {}, v2 = {};

          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet1, Facet2],
              attribute1: v1,
              attribute2: v2
            }
          });

          expect(MyRefinement.type._attribute1).toBe(v1);
          expect(MyRefinement.type._attribute2).toBe(v2);
        });

        it("should inherit base facets array when unspecified locally", function() {
          var R1 = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet1, Facet2]
            }
          });

          var R2 = R1.extend();

          expect(R2.type.facets).toBe(R2.type.facets);
        });

        it("should create a new array with all base facets array when specified locally", function() {
          var Facet3 = RefinementFacet.extend(null, {id: "my/dud"});

          var R1 = Refinement.extend({
            type: {
              of: MySimple.type,
              facets: [Facet1, Facet2]
            }
          });

          var R2 = R1.extend({
            type: {
              facets: [Facet1, Facet3]
            }
          });

          var facets2 = R2.type.facets;
          expect(facets2).not.toBe(R1.type.facets);
          expect(R1.type.facets.length).toBe(2);
          expect(facets2.length).toBe(3);
          expect(facets2[0]).toBe(Facet1);
          expect(facets2[1]).toBe(Facet2);
          expect(facets2[2]).toBe(Facet3);
        });

        it("should support resolving standard facets", function() {
          var MyRefinement = Refinement.extend({
            type: {
              of:     MySimple.type,
              facets: ["DiscreteDomain"]
            }
          });

          expect(MyRefinement.type.facets.length).toBe(1);
          expect(MyRefinement.type.facets[0].prototype instanceof RefinementFacet).toBe(true);
        });

        it("should support resolving absolute facet modules", function() {
          var MyRefinement = Refinement.extend({
            type: {
              of:     MySimple.type,
              facets: ["pentaho/type/facets/DiscreteDomain"]
            }
          });

          expect(MyRefinement.type.facets.length).toBe(1);
          expect(MyRefinement.type.facets[0].prototype instanceof RefinementFacet).toBe(true);
        });
      });

      describe("#context -", function() {
        it("should be that of the representation type", function() {
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.context).toBe(MySimple.type.context);
        });
      });

      describe("#isAbstract -", function() {
        it("should have the value of the representation type", function() {
          function expectIt(value) {
            var MySimple = Simple.extend({type: {isAbstract: value}});
            var MyRefinement = Refinement.extend({
              type: {
                of: MySimple.type
              }
            });

            expect(MyRefinement.type.isAbstract).toBe(value);
          }

          expectIt(true);
          expectIt(false);
        });

        it("should not throw if set to the same value", function() {
          function expectIt(value) {
            var MySimple = Simple.extend({type: {isAbstract: value}});
            var MyRefinement = Refinement.extend({
              type: {
                of: MySimple.type
              }
            });

            MyRefinement.type.isAbstract = value;
          }

          expectIt(true);
          expectIt(false);
        });

        it("should throw if set to a different value", function() {
          function expectIt(value) {
            var MySimple = Simple.extend({type: {isAbstract: value}});
            var MyRefinement = Refinement.extend({
              type: {
                of: MySimple.type
              }
            });

            expect(function() {
              MyRefinement.type.isAbstract = !value;
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
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.isList).toBe(false);
        });

        it("should be true when the representation type is a list type", function() {
          var MyList = List.extend();
          var MyRefinement = Refinement.extend({
            type: {
              of: MyList.type
            }
          });

          expect(MyRefinement.type.isList).toBe(true);
        });
      });

      describe("#isRefinement -", function() {
        it("should return the value `true`", function() {
          expect(Refinement.type.isRefinement).toBe(true);
        });
      });

      describe("#label -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({type: {label: "FOO"}});
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.label).toBe(MySimple.type.label);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({type: {label: "FOO"}});
          var MyRefinement = Refinement.extend({
            type: {
              label: "BAR",
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.label).toBe("BAR");
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({type: {label: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              label: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend();

          expect(R2.type.label).toBe("BAR");
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({type: {label: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              label: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {label: "DUDU"}});

          expect(R2.type.label).toBe("DUDU");
        });

        it("should fallback to the base value when set to a nully or empty string value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({type: {label: "FOO"}});
            var R1 = Refinement.extend({
              type: {
                label: "BAR",
                of: MySimple.type
              }
            });
            var R2 = R1.extend({type: {label: "DUDU"}});

            expect(R2.type.label).toBe("DUDU");

            R2.type.label = newLabel;

            expect(R2.type.label).toBe("BAR");
          }

          expectIt(null);
          expectIt(undefined);
          expectIt("");
        });

        it("should fallback to the value of the representation type when set to a nully or empty string value",
        function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({type: {label: "FOO"}});
            var R1 = Refinement.extend({
              type: {
                label: "BAR",
                of: MySimple.type
              }
            });

            expect(R1.type.label).toBe("BAR");

            R1.type.label = newLabel;

            expect(R1.type.label).toBe("FOO");
          }

          expectIt(null);
          expectIt(undefined);
          expectIt("");
        });

        it("should not delete the root value", function() {
          Refinement.type.label = undefined;
          expect(Refinement.type.hasOwnProperty("_label"));
        });
      }); // end #label

      describe("#description -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({type: {description: "FOO"}});
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.description).toBe(MySimple.type.description);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({type: {description: "FOO"}});
          var MyRefinement = Refinement.extend({
            type: {
              description: "BAR",
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.description).toBe("BAR");
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({type: {description: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              description: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend();

          expect(R2.type.description).toBe("BAR");
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({type: {description: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              description: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {description: "DUDU"}});

          expect(R2.type.description).toBe("DUDU");
        });

        it("should fallback to the base value when set to undefined", function() {

          var MySimple = Simple.extend({type: {description: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              description: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {description: "DUDU"}});

          expect(R2.type.description).toBe("DUDU");

          R2.type.description = undefined;

          expect(R2.type.description).toBe("BAR");
        });

        it("should respect a null or empty string locally specified value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({type: {description: "FOO"}});
            var R1 = Refinement.extend({
              type: {
                description: "BAR",
                of: MySimple.type
              }
            });
            var R2 = R1.extend({type: {description: "DUDU"}});

            expect(R2.type.description).toBe("DUDU");

            R2.type.description = newLabel;

            expect(R2.type.description).toBe(null);
          }

          expectIt(null);
          expectIt("");
        });

        it("should fallback to the value of the representation type when set to undefined", function() {
          var MySimple = Simple.extend({type: {description: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              description: "BAR",
              of: MySimple.type
            }
          });

          expect(R1.type.description).toBe("BAR");

          R1.type.description = undefined;

          expect(R1.type.description).toBe("FOO");
        });

        it("should not delete the root value", function() {
          Refinement.type.description = undefined;
          expect(Refinement.type.hasOwnProperty("_description"));
        });
      }); // end #description

      describe("#category -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({type: {category: "FOO"}});
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.category).toBe(MySimple.type.category);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({type: {category: "FOO"}});
          var MyRefinement = Refinement.extend({
            type: {
              category: "BAR",
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.category).toBe("BAR");
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({type: {category: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              category: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend();

          expect(R2.type.category).toBe("BAR");
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({type: {category: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              category: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {category: "DUDU"}});

          expect(R2.type.category).toBe("DUDU");
        });

        it("should fallback to the base value when set to undefined", function() {

          var MySimple = Simple.extend({type: {category: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              category: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {category: "DUDU"}});

          expect(R2.type.category).toBe("DUDU");

          R2.type.category = undefined;

          expect(R2.type.category).toBe("BAR");
        });

        it("should respect a null or empty string locally specified value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({type: {category: "FOO"}});
            var R1 = Refinement.extend({
              type: {
                category: "BAR",
                of: MySimple.type
              }
            });
            var R2 = R1.extend({type: {category: "DUDU"}});

            expect(R2.type.category).toBe("DUDU");

            R2.type.category = newLabel;

            expect(R2.type.category).toBe(null);
          }

          expectIt(null);
          expectIt("");
        });

        it("should fallback to the value of the representation type when set to undefined", function() {
          var MySimple = Simple.extend({type: {category: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              category: "BAR",
              of: MySimple.type
            }
          });

          expect(R1.type.category).toBe("BAR");

          R1.type.category = undefined;

          expect(R1.type.category).toBe("FOO");
        });

        it("should not delete the root value", function() {
          Refinement.type.category = undefined;
          expect(Refinement.type.hasOwnProperty("_category"));
        });
      }); // end #category

      describe("#helpUrl -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({type: {helpUrl: "FOO"}});
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.helpUrl).toBe(MySimple.type.helpUrl);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({type: {helpUrl: "FOO"}});
          var MyRefinement = Refinement.extend({
            type: {
              helpUrl: "BAR",
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.helpUrl).toBe("BAR");
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({type: {helpUrl: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              helpUrl: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend();

          expect(R2.type.helpUrl).toBe("BAR");
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({type: {helpUrl: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              helpUrl: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {helpUrl: "DUDU"}});

          expect(R2.type.helpUrl).toBe("DUDU");
        });

        it("should fallback to the base value when set to undefined", function() {

          var MySimple = Simple.extend({type: {helpUrl: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              helpUrl: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {helpUrl: "DUDU"}});

          expect(R2.type.helpUrl).toBe("DUDU");

          R2.type.helpUrl = undefined;

          expect(R2.type.helpUrl).toBe("BAR");
        });

        it("should respect a null or empty string locally specified value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({type: {helpUrl: "FOO"}});
            var R1 = Refinement.extend({
              type: {
                helpUrl: "BAR",
                of: MySimple.type
              }
            });
            var R2 = R1.extend({type: {helpUrl: "DUDU"}});

            expect(R2.type.helpUrl).toBe("DUDU");

            R2.type.helpUrl = newLabel;

            expect(R2.type.helpUrl).toBe(null);
          }

          expectIt(null);
          expectIt("");
        });

        it("should fallback to the value of the representation type when set to undefined", function() {
          var MySimple = Simple.extend({type: {helpUrl: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              helpUrl: "BAR",
              of: MySimple.type
            }
          });

          expect(R1.type.helpUrl).toBe("BAR");

          R1.type.helpUrl = undefined;

          expect(R1.type.helpUrl).toBe("FOO");
        });

        it("should not delete the root value", function() {
          Refinement.type.helpUrl = undefined;
          expect(Refinement.type.hasOwnProperty("_helpUrl"));
        });
      }); // end #helpUrl

      describe("#isBrowsable -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({type: {isBrowsable: false}});
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.isBrowsable).toBe(MySimple.type.isBrowsable);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({type: {isBrowsable: false}});
          var MyRefinement = Refinement.extend({
            type: {
              isBrowsable: true,
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.isBrowsable).toBe(true);
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({type: {isBrowsable: false}});
          var R1 = Refinement.extend({
            type: {
              isBrowsable: true,
              of: MySimple.type
            }
          });
          var R2 = R1.extend();

          expect(R2.type.isBrowsable).toBe(true);
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({type: {isBrowsable: true}});
          var R1 = Refinement.extend({
            type: {
              isBrowsable: true,
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {isBrowsable: false}});

          expect(R2.type.isBrowsable).toBe(false);
        });

        it("should fallback to the base value when set to nully", function() {
          function expectIt(newValue) {
            var MySimple = Simple.extend({type: {isBrowsable: true}});
            var R1 = Refinement.extend({
              type: {
                isBrowsable: true,
                of: MySimple.type
              }
            });
            var R2 = R1.extend({type: {isBrowsable: false}});

            expect(R2.type.isBrowsable).toBe(false);

            R2.type.isBrowsable = newValue;

            expect(R2.type.isBrowsable).toBe(true);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should fallback to the value of the representation type when set to nully", function() {
          function expectIt(newValue) {
            var MySimple = Simple.extend({type: {isBrowsable: false}});
            var R1 = Refinement.extend({
              type: {
                isBrowsable: true,
                of: MySimple.type
              }
            });

            expect(R1.type.isBrowsable).toBe(true);

            R1.type.isBrowsable = newValue;

            expect(R1.type.isBrowsable).toBe(false);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should not delete the root value", function() {
          Refinement.type.isBrowsable = undefined;
          expect(Refinement.type.hasOwnProperty("_isBrowsable"));
        });
      }); // end #isBrowsable

      describe("#isAdvanced -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({type: {isAdvanced: true}});
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.isAdvanced).toBe(MySimple.type.isAdvanced);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({type: {isAdvanced: true}});
          var MyRefinement = Refinement.extend({
            type: {
              isAdvanced: false,
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.isAdvanced).toBe(false);
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({type: {isAdvanced: true}});
          var R1 = Refinement.extend({
            type: {
              isAdvanced: false,
              of: MySimple.type
            }
          });
          var R2 = R1.extend();

          expect(R2.type.isAdvanced).toBe(false);
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({type: {isAdvanced: false}});
          var R1 = Refinement.extend({
            type: {
              isAdvanced: false,
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {isAdvanced: true}});

          expect(R2.type.isAdvanced).toBe(true);
        });

        it("should fallback to the base value when set to nully", function() {

          function expectIt(newValue) {
            var MySimple = Simple.extend({type: {isAdvanced: false}});
            var R1 = Refinement.extend({
              type: {
                isAdvanced: false,
                of: MySimple.type
              }
            });
            var R2 = R1.extend({type: {isAdvanced: true}});

            expect(R2.type.isAdvanced).toBe(true);

            R2.type.isAdvanced = newValue;

            expect(R2.type.isAdvanced).toBe(false);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should fallback to the value of the representation type when set to nully", function() {
          function expectIt(newValue) {
            var MySimple = Simple.extend({type: {isAdvanced: true}});
            var R1 = Refinement.extend({
              type: {
                isAdvanced: false,
                of: MySimple.type
              }
            });

            expect(R1.type.isAdvanced).toBe(false);

            R1.type.isAdvanced = newValue;

            expect(R1.type.isAdvanced).toBe(true);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should not delete the root value", function() {
          Refinement.type.isAdvanced = undefined;
          expect(Refinement.type.hasOwnProperty("_isAdvanced"));
        });
      }); // end #isAdvanced

      describe("#ordinal -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({type: {ordinal: 1}});
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.ordinal).toBe(MySimple.type.ordinal);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({type: {ordinal: 1}});
          var MyRefinement = Refinement.extend({
            type: {
              ordinal: 2,
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.ordinal).toBe(2);
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({type: {ordinal: 1}});
          var R1 = Refinement.extend({
            type: {
              ordinal: 2,
              of: MySimple.type
            }
          });
          var R2 = R1.extend();

          expect(R2.type.ordinal).toBe(2);
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({type: {ordinal: 1}});
          var R1 = Refinement.extend({
            type: {
              ordinal: 2,
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {ordinal: 3}});

          expect(R2.type.ordinal).toBe(3);
        });

        it("should fallback to the base value when set to nully", function() {

          function expectIt(newValue) {
            var MySimple = Simple.extend({type: {ordinal: 1}});
            var R1 = Refinement.extend({
              type: {
                ordinal: 2,
                of: MySimple.type
              }
            });
            var R2 = R1.extend({type: {ordinal: 3}});

            expect(R2.type.ordinal).toBe(3);

            R2.type.ordinal = newValue;

            expect(R2.type.ordinal).toBe(2);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should fallback to the value of the representation type when set to nully", function() {
          function expectIt(newValue) {
            var MySimple = Simple.extend({type: {ordinal: 1}});
            var R1 = Refinement.extend({
              type: {
                ordinal: 2,
                of: MySimple.type
              }
            });

            expect(R1.type.ordinal).toBe(2);

            R1.type.ordinal = newValue;

            expect(R1.type.ordinal).toBe(1);
          }

          expectIt(undefined);
          expectIt(null);
        });

        it("should not delete the root value", function() {
          Refinement.type.ordinal = undefined;
          expect(Refinement.type.hasOwnProperty("_ordinal"));
        });
      }); // end #ordinal

      describe("#view -", function() {
        it("should default to the value of the representation type", function() {
          var MySimple = Simple.extend({type: {view: "FOO"}});
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.view).toBe(MySimple.type.view);
        });

        it("should respect a specified value", function() {
          var MySimple = Simple.extend({type: {view: "FOO"}});
          var MyRefinement = Refinement.extend({
            type: {
              view: "BAR",
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.view).toBe("BAR");
        });

        it("should inherit the value of the base refinement", function() {
          var MySimple = Simple.extend({type: {view: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              view: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend();

          expect(R2.type.view).toBe("BAR");
        });

        it("should respect a specified value when it also has a base refinement", function() {
          var MySimple = Simple.extend({type: {view: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              view: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {view: "DUDU"}});

          expect(R2.type.view).toBe("DUDU");
        });

        it("should fallback to the base value when set to undefined", function() {

          var MySimple = Simple.extend({type: {view: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              view: "BAR",
              of: MySimple.type
            }
          });
          var R2 = R1.extend({type: {view: "DUDU"}});

          expect(R2.type.view).toBe("DUDU");

          R2.type.view = undefined;

          expect(R2.type.view).toBe("BAR");
        });

        it("should respect the specified null or empty string value", function() {
          function expectIt(newLabel) {
            var MySimple = Simple.extend({type: {view: "FOO"}});
            var R1 = Refinement.extend({
              type: {
                view: "BAR",
                of: MySimple.type
              }
            });
            var R2 = R1.extend({type: {view: "DUDU"}});

            expect(R2.type.view).toBe("DUDU");

            R2.type.view = newLabel;

            expect(R2.type.view).toBe(null);
          }

          expectIt(null);
          expectIt("");
        });

        it("should fallback to the value of the representation type when set to undefined", function() {

          var MySimple = Simple.extend({type: {view: "FOO"}});
          var R1 = Refinement.extend({
            type: {
              view: "BAR",
              of: MySimple.type
            }
          });

          expect(R1.type.view).toBe("BAR");

          R1.type.view = undefined;

          expect(R1.type.view).toBe("FOO");
        });

        it("should not delete the root value", function() {
          Refinement.type.view = undefined;
          expect(Refinement.type.hasOwnProperty("_view"));
        });
      }); // end #view

      describe("#is(.) -", function() {
        it("should return true for an instance of the representation type", function() {
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          expect(MyRefinement.type.is(new MySimple(123))).toBe(true);
          expect(MyRefinement.type.is({})).toBe(false);
        });
      });

      describe("#create(.) -", function() {
        it("should return instances of the representation type", function() {
          var MyRefinement = Refinement.extend({
            type: {
              of: MySimple.type
            }
          });

          var converted = MyRefinement.type.create(123);
          expect(converted.constructor).toBe(MySimple);
        });
      });
    });

    describe("property usage -", function() {
      var PositiveRefinement = RefinementFacet.extend({}, {
          id: "my/foo",
          validate: function(value) {
            return value.value > 0;
          }
        });

      var PositiveNumber = PentahoNumber.refine({type: {
          facets: PositiveRefinement
        }});

      it("should allow defining a property of a refinement type", function() {
        Complex.extend({
          type: {
            props: [
              {name: "likes", type: PositiveNumber}
            ]
          }
        });
      });

      it("should allow overriding a property with a refinement of the base type", function() {
        var MyComplex = Complex.extend({
          type: {
            props: [
              {name: "likes", type: PentahoNumber}
            ]
          }
        });

        MyComplex.extend({
          type: {
            props: [
              {name: "likes", type: PositiveNumber}
            ]
          }
        });
      });

      it("should throw when overriding a property with a refinement of a type other than the base type", function() {
        var MyComplex = Complex.extend({
          type: {
            props: [
              {name: "likes", type: Complex}
            ]
          }
        });

        expect(function() {
          MyComplex.extend({
            type: {
              props: [
                {name: "likes", type: PositiveNumber}
              ]
            }
          });
        }).toThrow(errorMatch.argInvalid("type"));
      });

      it("should allow specifying the value of a property of a refinement type given the primitive value", function() {
        var Derived = Complex.extend({
          type: {
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
          type: {
            props: [
              {name: "likes", type: PositiveNumber}
            ]
          }
        });

        var d = new Derived({likes: 1});

        expect(d.get("likes") instanceof PentahoNumber).toBe(true);
        expect(d.get("likes").constructor).toBe(PentahoNumber);
      });

      it("should accept being set to a value of the representation type", function() {
        var Derived = Complex.extend({
          type: {
            props: [
              {name: "likes", type: PositiveNumber}
            ]
          }
        });

        var d = new Derived();
        var v = new PentahoNumber(1);
        d.set("likes", v);
        expect(d.get("likes").value).toBe(1);
      });
    });

    describe("list usage -", function() {
      var PositiveRefinement = RefinementFacet.extend({}, {
        id: "my/foo",
        validate: function(value) {
          return value.value > 0;
        }
      });

      var PositiveNumber = PentahoNumber.refine({type: {
        facets: PositiveRefinement
      }});

      it("should allow defining a list of a refinement type", function() {
        List.extend({type: {of: PositiveNumber}});
      });

      it("should allow extending a list to a refinement of the base type", function() {
        var NumberList = List.extend({type: {of: PentahoNumber}});

        NumberList.extend({type: {of: PositiveNumber}});
      });

      it("should throw when extending a list to a refinement of a type not a subtype of the base type", function() {
        var ComplexList = List.extend({type: {of: Complex}});

        expect(function() {
          ComplexList.extend({type: {of: PositiveNumber}});
        }).toThrow(errorMatch.argInvalid("of"));
      });

      it("should allow specifying an element of a refinement type given the primitive value", function() {
        var PositiveNumberList = List.extend({type: {of: PositiveNumber}});

        var list = new PositiveNumberList([1]);

        expect(list.at(0).value).toBe(1);
      });

      it("should get a value whose class is that of the representation type", function() {
        var PositiveNumberList = List.extend({type: {of: PositiveNumber}});

        var list = new PositiveNumberList([1]);

        expect(list.at(0) instanceof PentahoNumber).toBe(true);
        expect(list.at(0).constructor).toBe(PentahoNumber);
      });

      it("should accept being set to a value of the representation type", function() {
        var PositiveNumberList = List.extend({type: {of: PositiveNumber}});

        var list = new PositiveNumberList();

        var v = new PentahoNumber(1);

        list.add(1);
        expect(list.at(0).value).toBe(1);
      });
    });
  });
});
