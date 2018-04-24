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
  "pentaho/type/Complex",
  "pentaho/type/Number",
  "pentaho/type/String",
  "pentaho/type/mixins/DiscreteDomain",
  "pentaho/type/Property",
  "pentaho/type/ValidationError",
  "pentaho/type/SpecificationScope",
  "tests/pentaho/util/errorMatch"
], function(Complex, PentahoNumber, PentahoString, DiscreteDomain, Property,
            ValidationError, SpecificationScope, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.mixins.DiscreteDomain", function() {

    it("should be a function", function() {
      expect(typeof DiscreteDomain).toBe("function");
    });

    it("should be applied to Property", function() {
      expect(Property.type.mixins).toContain(DiscreteDomain.type);
    });

    describe(".Type", function() {

      describe("#domain", function() {

        it("should not allow changing the Property.type attribute value", function() {
          var propType = Property.type;
          propType.domain = [1, 2, 3];
          expect(propType.domain).toBe(null);
        });

        describe("on a root property", function() {

          it("should default to an unset local value", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number"}]
              }
            });

            var propA = ComplexA.type.get("propA");

            expect(propA.domain).toBe(undefined);
          });

          it("should throw when set and property already has descendant properties", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number"}]
              }
            });

            ComplexA.extend({
              $type: {
                props: [{name: "propA"}]
              }
            });

            var propA = ComplexA.type.get("propA");

            expect(function() {
              propA.domain = [1, 2, 3];
            }).toThrow(errorMatch.operInvalid());
          });

          it("should respect a static value", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: [1, 2, 3]}]
              }
            });

            var propA = ComplexA.type.get("propA");

            var domain = propA.domain;

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(3);
            expect(domain[0].value).toBe(1);
            expect(domain[1].value).toBe(2);
            expect(domain[2].value).toBe(3);
          });

          it("should ignore setting to null or undefined", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: [1, 2, 3]}]
              }
            });

            var propA = ComplexA.type.get("propA");

            expect(Array.isArray(propA.domain)).toBe(true);

            propA.domain = undefined;

            expect(Array.isArray(propA.domain)).toBe(true);

            propA.domain = null;

            expect(Array.isArray(propA.domain)).toBe(true);
          });

          it("should cast non-function spec values to the property's valueType elementType", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: [1, 2, 3]}]
              }
            });

            var propA = ComplexA.type.get("propA");

            expect(PentahoNumber.type.is(propA.domain[0])).toBe(true);
          });

          it("should cast non-function spec values to the property's valueType elementType when a list", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: ["number"], domain: [1, 2, 3]}]
              }
            });

            var propA = ComplexA.type.get("propA");

            expect(PentahoNumber.type.is(propA.domain[0])).toBe(true);
          });

          it("should respect a function spec value", function() {

            var f = function() {};

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: f}]
              }
            });

            var propA = ComplexA.type.get("propA");

            expect(propA.domain).toBe(f);
          });

          it("should evaluate a function spec value and cast its result", function() {

            var f = jasmine.createSpy().and.callFake(function() { return [1, 2, 3]; });

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: f}]
              }
            });

            var propA = ComplexA.type.get("propA");
            var owner = new ComplexA();
            var domain = propA.domainOn(owner);

            expect(f.calls.count()).toBe(1);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(3);
            expect(PentahoNumber.type.is(domain[0])).toBe(true);
            expect(domain[0].value).toBe(1);
            expect(domain[1].value).toBe(2);
            expect(domain[2].value).toBe(3);
          });

          it("should evaluate a function spec value in the context of the owner value", function() {

            var f = jasmine.createSpy();

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: f}]
              }
            });

            var propA = ComplexA.type.get("propA");
            var owner = new ComplexA();

            propA.domainOn(owner);

            expect(f.calls.count()).toBe(1);
            expect(f.calls.first().object).toBe(owner);
          });

          it("should evaluate a function spec value with the property type as argument", function() {

            var f = jasmine.createSpy();

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: f}]
              }
            });

            var propA = ComplexA.type.get("propA");
            var owner = new ComplexA();

            propA.domainOn(owner);

            expect(f.calls.count()).toBe(1);
            expect(f.calls.first().args.length).toBe(1);
            expect(f.calls.first().args[0]).toBe(propA);
          });

          it("should default to the domain of the value type when it is an enum type", function() {

            var MyString = PentahoString.extend({
              $type: {
                mixins: ["enum"],
                domain: ["a", "b", "c"]
              }
            });

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: MyString}]
              }
            });

            var propA = ComplexA.type.get("propA");
            var owner = new ComplexA();

            var domain = propA.domainOn(owner);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(3);
            expect(domain[0].value).toBe("a");
            expect(domain[1].value).toBe("b");
            expect(domain[2].value).toBe("c");
          });

          it("should intersect with the domain of the value type when it is an enum type", function() {

            var MyString = PentahoString.extend({
              $type: {
                mixins: ["enum"],
                domain: ["a", "b", "c"]
              }
            });

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: MyString, domain: ["b", "c"]}]
              }
            });

            var propA = ComplexA.type.get("propA");
            var owner = new ComplexA();

            var domain = propA.domainOn(owner);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(2);
            expect(domain[0].value).toBe("b");
            expect(domain[1].value).toBe("c");
          });

          it("should use the order in the domain attribute even when the value type is an enum type", function() {

            var MyString = PentahoString.extend({
              $type: {
                mixins: ["enum"],
                domain: ["a", "b", "c"]
              }
            });

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: MyString, domain: ["c", "b"]}]
              }
            });

            var propA = ComplexA.type.get("propA");
            var owner = new ComplexA();

            var domain = propA.domainOn(owner);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(2);
            expect(domain[0].value).toBe("c");
            expect(domain[1].value).toBe("b");
          });

          it("should use the formatted value of the domain attribute even when the value type " +
              "is an enum type", function() {

            var MyString = PentahoString.extend({
              $type: {
                mixins: ["enum"],
                domain: [{v: "a", f: "AA"}]
              }
            });

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: MyString, domain: [{v: "a", f: "AAA"}]}]
              }
            });

            var propA = ComplexA.type.get("propA");
            var owner = new ComplexA();

            var domain = propA.domainOn(owner);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(1);
            expect(domain[0].value).toBe("a");
            expect(domain[0].formatted).toBe("AAA");
          });

          it("should use the formatted value of the enum when the domain attribute has no formatted value", function() {

            var MyString = PentahoString.extend({
              $type: {
                mixins: ["enum"],
                domain: [{v: "a", f: "AA"}]
              }
            });

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: MyString, domain: ["a"]}]
              }
            });

            var propA = ComplexA.type.get("propA");
            var owner = new ComplexA();

            var domain = propA.domainOn(owner);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(1);
            expect(domain[0].value).toBe("a");
            expect(domain[0].formatted).toBe("AA");
          });
        });

        describe("on an overridden property", function() {

          it("should evaluate to the domain of the base property when unspecified", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: [1, 2, 3]}]
              }
            });

            var ComplexB = ComplexA.extend({
              $type: {
                props: [{name: "propA"}]
              }
            });

            var propAofB = ComplexB.type.get("propA");
            var owner = new ComplexB();

            var domain = propAofB.domainOn(owner);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(3);
            expect(domain[0].value).toBe(1);
            expect(domain[1].value).toBe(2);
            expect(domain[2].value).toBe(3);
          });

          it("should evaluate to the intersection of the local and base domain", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: [1, 2, 3]}]
              }
            });

            var ComplexB = ComplexA.extend({
              $type: {
                props: [{name: "propA", domain: [1, 3]}]
              }
            });

            var propAofB = ComplexB.type.get("propA");
            var owner = new ComplexB();

            var domain = propAofB.domainOn(owner);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(2);
            expect(domain[0].value).toBe(1);
            expect(domain[1].value).toBe(3);
          });

          it("should use the order of the local domain", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: [1, 2, 3]}]
              }
            });

            var ComplexB = ComplexA.extend({
              $type: {
                props: [{name: "propA", domain: [3, 2, 1]}]
              }
            });

            var propAofB = ComplexB.type.get("propA");
            var owner = new ComplexB();

            var domain = propAofB.domainOn(owner);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(3);
            expect(domain[0].value).toBe(3);
            expect(domain[1].value).toBe(2);
            expect(domain[2].value).toBe(1);
          });

          it("should use the local formatted value, if there is one", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: [{v: 1, f: "One"}]}]
              }
            });

            var ComplexB = ComplexA.extend({
              $type: {
                props: [{name: "propA", domain: [{v: 1, f: "Uno"}]}]
              }
            });

            var propAofB = ComplexB.type.get("propA");
            var owner = new ComplexB();

            var domain = propAofB.domainOn(owner);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(1);
            expect(domain[0].value).toBe(1);
            expect(domain[0].formatted).toBe("Uno");
          });

          it("should use the base formatted value, when there isn't one locally", function() {

            var ComplexA = Complex.extend({
              $type: {
                props: [{name: "propA", valueType: "number", domain: [{v: 1, f: "One"}]}]
              }
            });

            var ComplexB = ComplexA.extend({
              $type: {
                props: [{name: "propA", domain: [{v: 1}]}]
              }
            });

            var propAofB = ComplexB.type.get("propA");
            var owner = new ComplexB();

            var domain = propAofB.domainOn(owner);

            expect(Array.isArray(domain)).toBe(true);
            expect(domain.length).toBe(1);
            expect(domain[0].value).toBe(1);
            expect(domain[0].formatted).toBe("One");
          });
        });
      });

      // validation
      describe("_collectElementValidators", function() {

        it("should validate that a singular property has as value one of the domain values", function() {

          var ComplexA = Complex.extend({
            $type: {
              props: [{name: "propA", valueType: "number", domain: [1, 2, 3]}]
            }
          });

          var propA = ComplexA.type.get("propA");

          var owner = new ComplexA({propA: 1});

          var errors = propA.validateOn(owner);

          expect(errors).toBe(null);
        });

        it("should validate that a plural property does contains only domain values", function() {

          var ComplexA = Complex.extend({
            $type: {
              props: [{name: "propA", valueType: ["number"], domain: [1, 2, 3]}]
            }
          });

          var propA = ComplexA.type.get("propA");

          var owner = new ComplexA({propA: [3, 2, 1]});

          var errors = propA.validateOn(owner);

          expect(errors).toBe(null);
        });

        it("should validate that a singular property does not have as value one of the domain values", function() {

          var ComplexA = Complex.extend({
            $type: {
              props: [{name: "propA", valueType: "number", domain: [1, 2, 3]}]
            }
          });

          var propA = ComplexA.type.get("propA");

          var owner = new ComplexA({propA: 4});

          var errors = propA.validateOn(owner);

          expect(Array.isArray(errors)).toBe(true);
          expect(errors.length).toBe(1);
          expect(errors[0] instanceof ValidationError).toBe(true);
        });

        it("should validate that a plural property does not contain one of the domain values", function() {

          var ComplexA = Complex.extend({
            $type: {
              props: [{name: "propA", valueType: ["number"], domain: [1, 2, 3]}]
            }
          });

          var propA = ComplexA.type.get("propA");

          var owner = new ComplexA({propA: [4, 2, 5]});

          var errors = propA.validateOn(owner);

          expect(Array.isArray(errors)).toBe(true);
          expect(errors.length).toBe(2);
          expect(errors[0] instanceof ValidationError).toBe(true);
          expect(errors[1] instanceof ValidationError).toBe(true);
        });
      });

      // serialization
      describe("toSpec", function() {

        it("should serialize a local domain attribute", function() {

          var scope = new SpecificationScope();

          var ComplexA = Complex.extend({
            $type: {
              props: [{name: "propA", valueType: "number", domain: [1, 2, 3]}]
            }
          });

          var propA = ComplexA.type.get("propA");

          var spec = propA.toSpecInContext();

          scope.dispose();

          expect(spec instanceof Object).toBe(true);
          expect(Array.isArray(spec.domain)).toBe(true);
          expect(spec.domain.length).toBe(3);
          expect(spec.domain[0]).toBe(1);
          expect(spec.domain[1]).toBe(2);
          expect(spec.domain[2]).toBe(3);
        });

        it("should not serialize an inherited domain attribute", function() {

          var scope = new SpecificationScope();

          var ComplexA = Complex.extend({
            $type: {
              props: [{name: "propA", valueType: "number", domain: [1, 2, 3]}]
            }
          });

          var ComplexB = ComplexA.extend({
            $type: {
              props: [{name: "propA"}]
            }
          });

          var propAofB = ComplexB.type.get("propA");

          var spec = propAofB.toSpecInContext();

          scope.dispose();

          expect(spec instanceof Object).toBe(true);
          expect("domain" in spec).toBe(false);
        });
      });
    });
  });
});
