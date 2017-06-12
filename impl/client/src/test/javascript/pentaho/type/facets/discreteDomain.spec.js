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
  "pentaho/type/SpecificationScope",
  "tests/pentaho/util/errorMatch"
], function(Context, SpecificationScope, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context();
  var List = context.get("pentaho/type/list");
  var PentahoNumber = context.get("pentaho/type/number");
  var DiscreteDomain = context.get("pentaho/type/facets/discreteDomain");

  describe("pentaho.type.facets.DiscreteDomain", function() {

    it("should be a function", function() {
      expect(typeof DiscreteDomain).toBe("function");
    });

    describe("#domain -", function() {

      describe("when type is the discrete domain mixin root", function() {

        it("should have a default null domain", function() {

          var DomainNumber = PentahoNumber.refine({
            type: {
              mixins: [DiscreteDomain]
            }
          });

          expect(DomainNumber.type.domain).toBe(null);
        });

        it("should respect a specified root/base domain", function() {

          var DomainNumber = PentahoNumber.refine({
            type: {
              mixins: [DiscreteDomain],
              domain: [1, 2, 3]
            }
          });

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

        it("should ignore when set to nully", function() {

          function expectIt(newDomain) {
            var DomainNumber = PentahoNumber.refine({
              type: {
                mixins: DiscreteDomain,
                domain: [1, 2, 3]
              }
            });

            var domain = DomainNumber.type.domain;
            expect(domain instanceof List).toBe(true);
            expect(domain.count).toBe(3);

            DomainNumber.type.domain = newDomain;

            expect(DomainNumber.type.domain).toBe(domain);
            expect(domain.count).toBe(3);
          }

          expectIt(null);
          expectIt(undefined);
        });
      });

      describe("when type is not the discrete domain mixin root", function() {

        describe("when no local domain yet and base domain is null", function() {

          var RootRefinement = PentahoNumber.refine({
            type: {
              mixins: DiscreteDomain
            }
          });

          it("should return null", function() {

            var SubRefinement = RootRefinement.extend();

            expect(SubRefinement.type.domain).toBe(null);
          });

          it("should respect any set domain", function() {

            var DomainNumber2 = RootRefinement.extend({
              type: {
                domain: [1, 2]
              }
            });

            var domain = DomainNumber2.type.domain;
            expect(domain instanceof List).toBe(true);
            expect(domain.count).toBe(2);
            expect(domain.at(0).value).toBe(1);
            expect(domain.at(1).value).toBe(2);
          });
        });

        describe("when no local domain yet and base domain is not null", function() {

          it("should return the same domain elements when read", function() {

            var DomainNumber = PentahoNumber.refine({
              type: {
                mixins: DiscreteDomain,
                domain: [1, 2, 3]
              }
            });

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

              expect(subElem).toBe(baseElem);
            }
          });

          it("should throw if set to a value that is not an Array, List or Object", function() {
            var DomainNumber = PentahoNumber.refine({
              type: {
                mixins: DiscreteDomain,
                domain: [1, 2, 3]
              }
            });

            expect(function() {
              DomainNumber.extend({
                type: {
                  domain: "foo"
                }
              });
            }).toThrow(errorMatch.argInvalidType("domain", ["Array", "pentaho.type.List", "Object"], "string"));
          });

          it("should throw if set to values which are not in the base domain", function() {
            var DomainNumber = PentahoNumber.refine({
              type: {
                mixins: DiscreteDomain,
                domain: [1, 2, 3]
              }
            });

            expect(function() {
              DomainNumber.extend({
                type: {
                  domain: [1, 4]
                }
              });
            }).toThrow(errorMatch.operInvalid());
          });

          it("should respect a specified domain that is a subset of the base domain", function() {
            var DomainNumber = PentahoNumber.refine({
              type: {
                mixins: DiscreteDomain,
                domain: [1, 2, 3]
              }
            });

            var DomainNumber2 = DomainNumber.extend({
              type: {
                domain: [1, 2]
              }
            });

            var domain = DomainNumber.type.domain;
            var domain2 = DomainNumber2.type.domain;
            expect(domain2 instanceof List).toBe(true);
            expect(domain2.count).toBe(2);

            expect(domain2.at(0)).toBe(domain.at(0));
            expect(domain2.at(1)).toBe(domain.at(1));
          });

          it("should inherit the base domain and configure it when given a plain object", function() {

            var DomainNumber = PentahoNumber.refine({
              type: {
                mixins: DiscreteDomain,
                domain: [1, 2, 3]
              }
            });

            var SubDomainNumber = DomainNumber.extend();

            SubDomainNumber.implement({
              type: {
                domain: {"1": {f: "One"}}
              }
            });

            expect(SubDomainNumber.type.domain.count).toBe(3);
            expect(SubDomainNumber.type.domain.at(0).toString()).toBe("One");
            expect(SubDomainNumber.type.domain.at(1).toString()).toBe("2");
          });

          it("should inherit the base domain and respect the formatted value when undefined, locally", function() {

            var DomainNumber = PentahoNumber.refine({
              type: {
                mixins: DiscreteDomain,
                domain: [{v: 1, f: "One Base"}, 2, 3]
              }
            });

            var SubDomainNumber = DomainNumber.extend();

            SubDomainNumber.implement({
              type: {
                domain: [1, 2, 3]
              }
            });

            var domain = DomainNumber.type.domain;
            var domain2 = SubDomainNumber.type.domain;

            expect(domain2.count).toBe(3);

            expect(domain2.at(0)).toBe(domain.at(0));
            expect(domain2.at(0).toString()).toBe("One Base");
          });

          it("should inherit the base domain and override the formatted value when not undefined, locally", function() {

            var DomainNumber = PentahoNumber.refine({
              type: {
                mixins: DiscreteDomain,
                domain: [{v: 1, f: "One Base"}, 2, 3]
              }
            });

            var SubDomainNumber = DomainNumber.extend();

            SubDomainNumber.implement({
              type: {
                domain: [{v: 1, f: "One Local"}, 2, 3]
              }
            });

            expect(SubDomainNumber.type.domain.count).toBe(3);
            expect(SubDomainNumber.type.domain.at(0).toString()).toBe("One Local");
          });

          it("should allow specifying an element instance of the base domain, and not clone it", function() {
            var DomainNumber = PentahoNumber.refine({
              type: {
                mixins: DiscreteDomain,
                domain: [1, 2, 3]
              }
            });

            var number2 = DomainNumber.type.domain.at(1);

            var DomainNumber2 = DomainNumber.extend({
              type: {
                domain: [number2]
              }
            });

            var domain2 = DomainNumber2.type.domain;

            expect(domain2 instanceof List).toBe(true);
            expect(domain2.count).toBe(1);

            expect(domain2.at(0)).toBe(number2);
          });
        });

        describe("when there is a local domain", function() {

          describe("when given a plain object", function() {

            it("should configure the existing keys", function() {
              var DomainNumber = PentahoNumber.refine({
                type: {
                  mixins: DiscreteDomain,
                  domain: [1, 2, 3]
                }
              });

              DomainNumber.implement({
                type: {
                  domain: {"1": {f: "One"}}
                }
              });

              expect(DomainNumber.type.domain.count).toBe(3);
              expect(DomainNumber.type.domain.at(0).toString()).toBe("One");
              expect(DomainNumber.type.domain.at(1).toString()).toBe("2");
            });

            it("should throw when a key does not exist", function() {

              var DomainNumber = PentahoNumber.refine({
                type: {
                  mixins: DiscreteDomain,
                  domain: [1, 2, 3]
                }
              });

              expect(function() {
                DomainNumber.implement({
                  type: {
                    domain: {"4": {f: "Four"}}
                  }
                });
              }).toThrow(errorMatch.argInvalid("domain"));
            });
          });

          describe("when given an array or list", function() {

            it("should configure existing elements", function() {

              var DomainNumber = PentahoNumber.refine({
                type: {
                  mixins: DiscreteDomain,
                  domain: [1, 2, 3]
                }
              });

              DomainNumber.implement({
                type: {
                  domain: [{v: 1, f: "One"}, 2, 3]
                }
              });

              expect(DomainNumber.type.domain.count).toBe(3);
              expect(DomainNumber.type.domain.at(0).toString()).toBe("One");
            });

            it("should accept a given base element, and not clone it", function() {

              var DomainNumber = PentahoNumber.refine({
                type: {
                  mixins: DiscreteDomain,
                  domain: [1, 2, 3]
                }
              });

              var number2 = DomainNumber.type.domain.at(1);

              DomainNumber.implement({
                type: {
                  domain: [1, number2, 3]
                }
              });

              expect(DomainNumber.type.domain.count).toBe(3);
              expect(DomainNumber.type.domain.at(1)).toBe(number2);
            });

            it("should remove unspecified elements", function() {

              var DomainNumber = PentahoNumber.refine({
                type: {
                  mixins: DiscreteDomain,
                  domain: [1, 2, 3]
                }
              });

              DomainNumber.implement({
                type: {
                  domain: [2]
                }
              });

              expect(DomainNumber.type.domain.count).toBe(1);
              expect(DomainNumber.type.domain.at(0).value).toBe(2);
            });

            it("should throw if given an element not in the initial domain", function() {
              var DomainNumber = PentahoNumber.refine({
                type: {
                  mixins: DiscreteDomain,
                  domain: [1, 2, 3]
                }
              });

              expect(function() {
                DomainNumber.implement({
                  type: {
                    domain: [1, 2, 3, 4]
                  }
                });
              }).toThrow(errorMatch.operInvalid());
            });
          });
        });
      });
    }); // #domain

    describe(".validate(value)", function() {

      it("should return null on a value that is equal to one of the domain values", function() {

        var DomainNumber = PentahoNumber.refine({
          type: {
            mixins: DiscreteDomain,
            domain: [1, 2, 3]
          }
        });

        var v = new PentahoNumber(1);

        expect(DomainNumber.type.validate(v)).toBe(null);
      });

      it("should return an Error on a value that is not equal to one of the domain values", function() {

        var DomainNumber = PentahoNumber.refine({
          type: {
            mixins: DiscreteDomain,
            domain: [1, 2, 3]
          }
        });

        var v = new PentahoNumber(4);

        var errors = DomainNumber.type.validate(v);
        expect(errors.length).toBe(1);
        expect(errors[0] instanceof Error).toBe(true);
      });
    });

    describe(".Type#fillSpecInContext(spec, keyArgs)", function() {

      it("should serialize a local domain using array form", function() {

        var DomainNumber = PentahoNumber.refine({
          type: {
            mixins: DiscreteDomain,
            domain: [1, 2, 3]
          }
        });

        var scope = new SpecificationScope();
        var spec = {};
        var result = DomainNumber.type._fillSpecInContext(spec, {});

        scope.dispose();

        expect(result).toBe(true);
        expect(spec.domain).toEqual([1, 2, 3]);
      });

      it("should serialize an inherited and locally changed domain", function() {

        var DomainNumber = PentahoNumber.refine({
          type: {
            mixins: DiscreteDomain,
            domain: [1, 2, 3]
          }
        });

        var DomainNumber2 = DomainNumber.extend({
          type: {
            domain: [1, 2]
          }
        });

        var scope = new SpecificationScope();
        var spec = {};
        var result = DomainNumber2.type._fillSpecInContext(spec, {});

        scope.dispose();

        expect(result).toBe(true);
        expect(spec.domain).toEqual([1, 2]);
      });

      it("should not serialize an undefined domain", function() {

        var DomainNumber = PentahoNumber.refine({
          type: {
            mixins: DiscreteDomain
          }
        });

        var scope = new SpecificationScope();
        var spec = {};
        var result = DomainNumber.type._fillSpecInContext(spec, {});

        scope.dispose();

        // result is true cause mixins is serialized anyway...
        expect("domain" in spec).toBe(false);
      });

      it("should not serialize an undefiend domain when not the mixin root", function() {

        var DomainNumber = PentahoNumber.refine({
          type: {
            mixins: DiscreteDomain
          }
        });

        var DomainNumber2 = DomainNumber.extend();

        var scope = new SpecificationScope();
        var spec = {};
        var result = DomainNumber2.type._fillSpecInContext(spec, {});

        scope.dispose();

        expect(result).toBe(false);
        expect("domain" in spec).toBe(false);
      });
    });
  });
});
