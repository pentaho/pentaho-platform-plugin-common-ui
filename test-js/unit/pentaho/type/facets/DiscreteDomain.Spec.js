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
  "pentaho/type/facets/DiscreteDomain",
  "pentaho/type/Context",
  "tests/pentaho/util/errorMatch"
], function(DiscreteDomainRefinementFacet, Context, errorMatch) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      List = context.get("pentaho/type/list"),
      PentahoNumber = context.get("pentaho/type/number");

  describe("pentaho.type.DiscreteDomainRefinementFacet -", function() {
    it("should be a function", function() {
      expect(typeof DiscreteDomainRefinementFacet).toBe("function");
    });

    describe("#domain -", function() {
      describe("when refinement is the discrete domain root", function() {
        it("should have a default null domain", function() {
          var DomainNumber = PentahoNumber.refine({type: {
            facets: DiscreteDomainRefinementFacet
          }});

          expect(DomainNumber.type.domain).toBe(null);
        });

        it("should respect a specified root/base domain", function() {
          var DomainNumber = PentahoNumber.refine({type: {
            facets: DiscreteDomainRefinementFacet,
            domain: [1, 2, 3]
          }});

          var domain = DomainNumber.type.domain;
          expect(domain instanceof List).toBe(true);
          expect(domain.count).toBe(3);

          expect(domain.at(0) instanceof PentahoNumber).toBe(true);
          expect(domain.at(1) instanceof PentahoNumber).toBe(true);
          expect(domain.at(2) instanceof PentahoNumber).toBe(true);

          expect(domain.at(0).value).toBe(1);
          expect(domain.at(1).value).toBe(2);
          expect(domain.at(2).value).toBe(3);
        });
      });

      describe("when refinement is not the discrete domain root", function() {

        describe("when no local domain yet and base domain is null", function() {

          var RootRefinement = PentahoNumber.refine({type: {
            facets: DiscreteDomainRefinementFacet
          }});

          it("should return null", function() {
            var SubRefinement = RootRefinement.extend();

            expect(SubRefinement.type.domain).toBe(null);
          });

          it("should respect any set domain", function() {
            var DomainNumber2 = RootRefinement.extend({type: {
              domain: [1, 2]
            }});

            var domain = DomainNumber2.type.domain;
            expect(domain instanceof List).toBe(true);
            expect(domain.count).toBe(2);
            expect(domain.at(0).value).toBe(1);
            expect(domain.at(1).value).toBe(2);
          });
        });

        describe("when no local domain yet and base domain is not null", function() {
          it("should return cloned base domain elements when read", function() {
            var DomainNumber = PentahoNumber.refine({type: {
              facets: DiscreteDomainRefinementFacet,
              domain: [1, 2, 3]
            }});

            var DomainNumber2 = DomainNumber.extend();

            var baseDomain = DomainNumber.type.domain;
            var subDomain  = DomainNumber2.type.domain;

            expect(subDomain).not.toBe(baseDomain);
            var count = baseDomain.count;
            expect(subDomain.count).toBe(count);

            var i = -1;
            while(++i < count) {
              var baseElem = baseDomain.at(i);
              var subElem = subDomain.at(i);

              expect(subElem).not.toBe(baseElem);
              expect(subElem.equals(baseElem)).toBe(true);
            }
          });

          it("should throw if set to a value that is not an Array, List or Object", function() {
            var DomainNumber = PentahoNumber.refine({type: {
              facets: DiscreteDomainRefinementFacet,
              domain: [1, 2, 3]
            }});

            expect(function() {
              DomainNumber.extend({type: {
                domain: "foo"
              }});
            }).toThrow(errorMatch.argInvalidType("domain", ["Array", "pentaho.type.List", "Object"], "string"));
          });

          it("should throw if set to values which are not in the base domain", function() {
            var DomainNumber = PentahoNumber.refine({type: {
              facets: DiscreteDomainRefinementFacet,
              domain: [1, 2, 3]
            }});

            expect(function() {
              DomainNumber.extend({type: {
                domain: [1, 4]
              }});
            }).toThrow(errorMatch.argInvalid("domain"));
          });

          it("should respect a specified domain that is a subset of the base domain", function() {
            var DomainNumber = PentahoNumber.refine({type: {
              facets: DiscreteDomainRefinementFacet,
              domain: [1, 2, 3]
            }});

            var DomainNumber2 = DomainNumber.extend({type: {
              domain: [1, 2]
            }});

            var domain = DomainNumber2.type.domain;
            expect(domain instanceof List).toBe(true);
            expect(domain.count).toBe(2);

            expect(domain.at(0).value).toBe(1);
            expect(domain.at(1).value).toBe(2);
          });

          it("should inherit the base domain and configure it when given a plain object", function() {

            var DomainNumber = PentahoNumber.refine({type: {
              facets: DiscreteDomainRefinementFacet,
              domain: [1, 2, 3]
            }});

            var SubDomainNumber = DomainNumber.extend();

            SubDomainNumber.implement({type: {
              domain: {"1": {f: "One"}}
            }});

            expect(SubDomainNumber.type.domain.count).toBe(3);
            expect(SubDomainNumber.type.domain.at(0).toString()).toBe("One");
            expect(SubDomainNumber.type.domain.at(1).toString()).toBe("2");
          });

          it("should allow specifying an element instance of the base domain, and not clone it", function() {
            var DomainNumber = PentahoNumber.refine({type: {
              facets: DiscreteDomainRefinementFacet,
              domain: [1, 2, 3]
            }});
            var number2 = DomainNumber.type.domain.at(1);
            var DomainNumber2 = DomainNumber.extend({type: {
              domain: [number2]
            }});
            var domain2 = DomainNumber2.type.domain;

            expect(domain2 instanceof List).toBe(true);
            expect(domain2.count).toBe(1);

            expect(domain2.at(0)).toBe(number2);
          });
        });

        describe("when there is a local domain", function() {
          describe("when given a plain object", function() {
            it("should configure the existing keys", function() {
              var DomainNumber = PentahoNumber.refine({type: {
                facets: DiscreteDomainRefinementFacet,
                domain: [1, 2, 3]
              }});

              DomainNumber.implement({type: {
                domain: {"1": {f: "One"}}
              }});

              expect(DomainNumber.type.domain.count).toBe(3);
              expect(DomainNumber.type.domain.at(0).toString()).toBe("One");
              expect(DomainNumber.type.domain.at(1).toString()).toBe("2");
            });

            it("should throw when a key does not exist", function() {

              var DomainNumber = PentahoNumber.refine({type: {
                facets: DiscreteDomainRefinementFacet,
                domain: [1, 2, 3]
              }});

              expect(function() {
                DomainNumber.implement({type: {
                  domain: {"4": {f: "Four"}}
                }});
              }).toThrow(errorMatch.argInvalid("domain"));
            });
          });

          describe("when given an array or list", function() {

            it("should configure existing elements", function() {
              var DomainNumber = PentahoNumber.refine({type: {
                facets: DiscreteDomainRefinementFacet,
                domain: [1, 2, 3]
              }});

              DomainNumber.implement({type: {
                domain: [{v: 1, f: "One"}, 2, 3]
              }});

              expect(DomainNumber.type.domain.count).toBe(3);
              expect(DomainNumber.type.domain.at(0).toString()).toBe("One");
            });

            it("should accept be given a base element, and not clone it", function() {
              var DomainNumber = PentahoNumber.refine({type: {
                facets: DiscreteDomainRefinementFacet,
                domain: [1, 2, 3]
              }});
              var number2 = DomainNumber.type.domain.at(1);

              DomainNumber.implement({type: {
                domain: [1, number2, 3]
              }});

              expect(DomainNumber.type.domain.count).toBe(3);
              expect(DomainNumber.type.domain.at(1)).toBe(number2);
            });

            it("should remove unspecified elements", function() {
              var DomainNumber = PentahoNumber.refine({type: {
                facets: DiscreteDomainRefinementFacet,
                domain: [1, 2, 3]
              }});

              DomainNumber.implement({type: {
                domain: [2]
              }});

              expect(DomainNumber.type.domain.count).toBe(1);
              expect(DomainNumber.type.domain.at(0).value).toBe(2);
            });

            it("should throw if given an undefined element", function() {
              var DomainNumber = PentahoNumber.refine({type: {
                facets: DiscreteDomainRefinementFacet,
                domain: [1, 2, 3]
              }});

              expect(function() {
                DomainNumber.implement({type: {
                  domain: [1, 2, 3, 4]
                }});
              }).toThrow(errorMatch.argInvalid("domain"));
            });
          });
        });
      });

      it("should set the root domain to null when set to nully", function() {

        function expectIt(newDomain) {
          var DomainNumber = PentahoNumber.refine({type: {
            facets: DiscreteDomainRefinementFacet,
            domain: [1, 2, 3]
          }});

          var domain = DomainNumber.type.domain;
          expect(domain instanceof List).toBe(true);
          expect(domain.count).toBe(3);

          DomainNumber.type.domain = newDomain;

          expect(DomainNumber.type.domain).toBe(null);
        }

        expectIt(null);
        expectIt(undefined);
      });

      it("should inherit the base domain when later set to nully", function() {

        function expectIt(newDomain) {
          var DomainNumber = PentahoNumber.refine({type: {
            facets: DiscreteDomainRefinementFacet,
            domain: [1, 2, 3]
          }});

          var DomainNumber2 = DomainNumber.extend({type: {
            domain: [1, 2]
          }});

          var domain = DomainNumber2.type.domain;
          expect(domain instanceof List).toBe(true);
          expect(domain.count).toBe(2);

          DomainNumber2.type.domain = newDomain;

          domain = DomainNumber2.type.domain;
          expect(domain instanceof List).toBe(true);
          expect(domain.count).toBe(3);
        }

        expectIt(null);
        expectIt(undefined);
      });
    }); // #domain

    describe(".validate(value)", function() {
      it("should be defined", function() {
        expect(typeof DiscreteDomainRefinementFacet.validate).toBe("function");
      });

      it("should return null on a value that is equal to one of the domain values", function() {
        var DomainNumber = PentahoNumber.refine({type: {
          facets: DiscreteDomainRefinementFacet,
          domain: [1, 2, 3]
        }});

        var v = new PentahoNumber(1);

        expect(DiscreteDomainRefinementFacet.validate.call(DomainNumber.type, v)).toBe(null);
      });

      it("should return an Error on a value that is not equal to one of the domain values", function() {
        var DomainNumber = PentahoNumber.refine({type: {
          facets: DiscreteDomainRefinementFacet,
          domain: [1, 2, 3]
        }});

        var v = new PentahoNumber(4);

        expect(DiscreteDomainRefinementFacet.validate.call(DomainNumber.type, v) instanceof Error).toBe(true);
      });
    });
  });
});
