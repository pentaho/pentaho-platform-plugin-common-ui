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
  "pentaho/type/Context"
], function(Context) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, Date:false */

  describe("instance serialization -", function() {
    var context = new Context();

    describe("pentaho/type/complex -", function() {
      var Complex = context.get("pentaho/type/complex");

      var TestLevel1 = Complex.extend("TestLevel1", {
        meta: {
          label: "TestLevel1",
          props: [
            "type"
          ]
        }
      });

      var TestLevel2 = TestLevel1.extend("TestLevel2", {
        meta: {
          label: "TestLevel2",
          props: [
            "name"
          ]
        }
      });

      var Derived = Complex.extend({
        meta: {
          label: "Derived",
          props: [
            {name: "quantity", type: "number"},
            "type",
            {name: "noFormat", type: "number"},
            {name: "anything", type: TestLevel1},
            {
              name: "sub",
              type: {
                props: [
                  {name: "truth", type: "boolean"},
                  {name: "when", type: "date"}
                ]
              }
            }
          ]
        }
      });

      var originalSpec = {
        quantity: {v: 20, f: "I'm a simple 20"},
        type: {v: "bar", f: "I'm a bar"},
        noFormat: 50,
        anything: new TestLevel2({"name": "concrete", "type": "Level2"}),
        sub: {
          truth: {v: true, f: "I'm a nested true"},
          when: new Date()
        },
        // TODO: Does this make sense?
        other: {
          _: {
            props: ["name", {name: "price", type: "number"}]
          },
          name: "John",
          price: 100
        }
      };

      var value;

      beforeEach(function() {
        value = new Derived(originalSpec);
        console.log(value);
      });

      describe("values", function() {
        describe("default", function() {
          it("should return primitive value and formatted value when formatted", function() {
            var spec = value.toSpec();

            expect(spec.quantity.v).toBe(originalSpec.quantity.v);
            expect(spec.quantity.f).toBe(originalSpec.quantity.f);

            expect(spec.sub.truth.v).toBe(originalSpec.sub.truth.v);
            expect(spec.sub.truth.f).toBe(originalSpec.sub.truth.f);
          });

          it("should return primitive value when not formatted", function() {
            var spec = value.toSpec();

            expect(spec.noFormat).toBe(originalSpec.noFormat);

            expect(spec.sub.when).toBe(originalSpec.sub.when);
          });
        });

        describe("default but inlineTypeSpec: true", function() {
          it("should return primitive value and undefined formatted value when not formatted", function() {
            var spec = value.toSpec({inlineTypeSpec: true});

            expect(spec.noFormat.v).toBe(originalSpec.noFormat);
            expect(spec.noFormat.f).toBeUndefined();
          });

          it("should propagate and return primitive value and undefined formatted value when not formatted", function() {
            var spec = value.toSpec({inlineTypeSpec: true});

            expect(spec.sub.when.v).toBe(originalSpec.sub.when);
            expect(spec.sub.when.f).toBeUndefined();
          });
        });

        describe("returnFormattedValues: true", function() {
          it("should return primitive value and formatted value when formatted", function() {
            var spec = value.toSpec({returnFormattedValues: true});

            expect(spec.quantity.v).toBe(originalSpec.quantity.v);
            expect(spec.quantity.f).toBe(originalSpec.quantity.f);
          });

          it("should propagate and return primitive value and formatted value when formatted", function() {
            var spec = value.toSpec({returnFormattedValues: true});

            expect(spec.sub.truth.v).toBe(originalSpec.sub.truth.v);
            expect(spec.sub.truth.f).toBe(originalSpec.sub.truth.f);
          });

          it("should return primitive value and null formatted value when not formatted", function() {
            var spec = value.toSpec();

            expect(spec.noFormat.v).toBe(originalSpec.noFormat);
            expect(spec.noFormat.f).toBeNull();
          });

          it("should propagate and return primitive value and null formatted value when not formatted", function() {
            var spec = value.toSpec();

            expect(spec.sub.when.v).toBe(originalSpec.sub.when);
            expect(spec.sub.when.f).toBeNull();
          });
        });

        describe("returnFormattedValues: false", function() {
          it("should return primitive value even when formatted", function() {
            var spec = value.toSpec({returnFormattedValues: true});

            expect(spec.quantity).toBe(originalSpec.quantity.v);
          });

          it("should propagate and return primitive value even when formatted", function() {
            var spec = value.toSpec({returnFormattedValues: true});

            expect(spec.sub.truth).toBe(originalSpec.sub.truth.v);
          });

          it("should return primitive value when not formatted", function() {
            var spec = value.toSpec();

            expect(spec.noFormat).toBe(originalSpec.noFormat);
          });

          it("should propagate and return primitive value when not formatted", function() {
            var spec = value.toSpec();

            expect(spec.sub.when).toBe(originalSpec.sub.when);
          });
        });

        describe("returnFormattedValues: false but inlineTypeSpec: true", function() {
          it("should return primitive value and undefined formatted value even when formatted", function() {
            var spec = value.toSpec({returnFormattedValues: true});

            expect(spec.quantity.v).toBe(originalSpec.quantity.v);
            expect(spec.quantity.f).toBeUndefined();
          });

          it("should propagate and return primitive value and undefined formatted value even when formatted", function() {
            var spec = value.toSpec({returnFormattedValues: true});

            expect(spec.sub.truth.v).toBe(originalSpec.sub.truth.v);
            expect(spec.sub.truth.f).toBeUndefined();
          });

          it("should return primitive value and undefined formatted value when not formatted", function() {
            var spec = value.toSpec();

            expect(spec.noFormat.v).toBe(originalSpec.noFormat);
            expect(spec.noFormat.f).toBeUndefined();
          });

          it("should propagate and return primitive value and undefined formatted value when not formatted", function() {
            var spec = value.toSpec();

            expect(spec.sub.when.v).toBe(originalSpec.sub.when);
            expect(spec.sub.when.f).toBeUndefined();
          });
        });
      });

      describe("with inline type specs", function() {
        describe("default (inlineTypeSpec: false)", function() {
          // TODO: What is an anonymous type?
          it("should inline type spec if anonymous type", function() {
            var spec = value.toSpec();

            expect(spec._).toBeDefined();
            // TODO: What to compare?
          });

          it("should inline type spec if different than property type", function() {
            var spec = value.toSpec();

            expect(spec.anything._).toBeDefined();
            // TODO: What to compare?
            expect(spec.anything._).toBe(TestLevel2.meta);
          });

          it("should not inline type spec every other case", function() {
            var spec = value.toSpec();

            expect(spec._).toBeUndefined();
          });
        });

        describe("inlineTypeSpec: true", function() {
          it("should inline type spec", function() {
            var spec = value.toSpec({inlineTypeSpec: true});

            expect(spec._).toBeDefined();
            // TODO: What to compare?
            expect(spec._).toBe(Derived.meta);
          });

          it("should propagate and inline type spec", function() {
            var spec = value.toSpec({inlineTypeSpec: true});

            expect(spec.sub._).toBeDefined();
            // TODO: What to compare?
            expect(spec.sub._.id).toBe(Complex.meta.id);
          });
        });
      });

      describe("in array form", function() {
        describe("default (arrayFormat: false)", function() {
          // TODO: Anything to test?
        });

        describe("arrayFormat: true", function() {
          // TODO: Where is this possible? Only with lists?
        });
      });
    }); // pentaho.type.Complex
  });
});
