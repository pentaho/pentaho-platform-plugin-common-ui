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

  /*global describe:false, it:false, expect:false, beforeEach:false, Date:false */

  describe("instance serialization -", function() {
    var context = new Context();

    describe("pentaho/type/simple -", function() {

      // Using pentaho/type/boolean because pentaho/type/simple is abstract
      var PentahoBoolean = context.get("pentaho/type/boolean");
      var originalSpec = {v: false, f: "I'm a simple value"};

      describe("values", function() {

        describe("value with formatted info", function() {
          var value;

          beforeEach(function() {
            value = new PentahoBoolean(originalSpec);
          });

          describe("default", function() {
            it("should return primitive value, formatted value, and inline type", function() {
              var spec = value.toSpec();

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBe(originalSpec.f);
              expect(spec._).toBeDefined();
              expect(spec._).toBe(PentahoBoolean.type.toSpec().id);
            });
          });

          describe("omitFormatted: true and omitRootType: false", function() {
            it("should return primitive value and inline type ", function() {
              var spec = value.toSpec({omitFormatted: true});

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBeUndefined();
              expect(spec._).toBeDefined();
              expect(spec._).toBe(PentahoBoolean.type.toSpec().id);
            });
          });

          describe("omitFormatted: true and omitRootType: true", function() {
            it("should return primitive value, undefined formatted value, and undefined inline type", function() {
              var spec = value.toSpec({omitFormatted: true, omitRootType: true});

              expect(spec).toBe(originalSpec.v);
              expect(spec.f).toBeUndefined();
              expect(spec._).toBeUndefined();
            });
          });

          describe("omitFormatted: false and omitRootType: true", function() {
            it("should return primitive value, formatted value, and undefined inline type", function() {
              var spec = value.toSpec({omitRootType: true});

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBe(originalSpec.f);
              expect(spec._).toBeUndefined();
            });
          });
        });

        describe("value without formatted info", function() {
          var value;

          beforeEach(function() {
            value = new PentahoBoolean(originalSpec.v);
          });

          describe("default", function() {
            it("should return primitive value, null formatted value, and inline type", function() {
              var spec = value.toSpec();

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBeUndefined();
              expect(spec._).toBeDefined();
              expect(spec._).toBe(PentahoBoolean.type.toSpec().id);
            });
          });

          describe("omitFormatted: true and omitRootType: false", function() {
            it("should return primitive value and undefined formatted value", function() {
              var spec = value.toSpec({omitFormatted: true});

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBeUndefined();
              expect(spec._).toBeDefined();
              expect(spec._).toBe(PentahoBoolean.type.toSpec().id);
            });
          });

          describe("omitFormatted: true and omitRootType: true", function() {
            it("should return primitive value, undefined formatted value, and undefined inline type", function() {
              var spec = value.toSpec({omitFormatted: true, omitRootType: true});

              expect(spec).toBe(originalSpec.v);
              expect(spec.f).toBeUndefined();
              expect(spec._).toBeUndefined();
            });
          });

          describe("omitFormatted: false and omitRootType: true", function() {
            it("should return primitive value", function() {
              var spec = value.toSpec({omitRootType: true});

              expect(spec).toBe(originalSpec.v);
            });
          });
        });
      });
    }); // pentaho.type.Simple

    var simplerTypes = [
      {name: "boolean", value: true},
      {name: "number", value: 10},
      {name: "string", value: "hello"},
      {name: "object", value: {foo: "bar"}},
      {name: "function", value: function() {}}
    ];

    simplerTypes.forEach(function(simple) {
      describe("pentaho/type/" + simple.name + " -", function() {
        var SimpleClass = context.get("pentaho/type/" + simple.name);

        var value;
        beforeEach(function() {
          value = new SimpleClass(simple);
        });

        describe("values", function() {
          describe("primitive format (omitFormatted: true)", function() {
            it("should return the primitive value", function() {
              var spec = value.toSpec({omitFormatted: true, omitRootType: true});

              expect(typeof spec).toBe(simple.name);
              expect(spec).toBe(simple.value);
            });
          });

          describe("object format (omitFormatted: false)", function() {
            it("spec.v should contain the primitive value", function() {
              var spec = value.toSpec({omitFormatted: true});

              expect(typeof spec).toBe("object");
              expect(spec.v).toBeDefined();
              expect(typeof spec.v).toBe(simple.name);
              expect(spec.v).toBe(simple.value);
              expect(spec._).toBeDefined();
              expect(spec._).toBe(SimpleClass.type.toSpec().id);
            });
          });
        });

        describe("inline type spec", function() {
          it("should inline pentaho/type/" + simple.name + " type spec", function() {
            var spec = value.toSpec({omitRootType: true});

            expect(typeof spec).toBe(simple.name);
            expect(spec).toBe(simple.value);
            expect(spec._).toBeUndefined();
            expect(spec.f).toBeUndefined();
          });
        });

        describe("inline type spec", function() {
          it("should inline pentaho/type/" + simple.name + " type spec", function() {
            var spec = value.toSpec();

            expect(typeof spec).toBe("object");
            expect(spec._).toBeDefined();
            expect(spec._).toBe(SimpleClass.type.toSpec().id);
            expect(spec.f).toBeUndefined();
          });
        });
      });
    });

    describe("pentaho/type/date -", function() {
      var SimpleClass = context.get("pentaho/type/date");

      var originalValue = new Date();

      var value;
      beforeEach(function() {
        value = new SimpleClass(originalValue);
      });

      describe("values", function() {
        describe("omitFormatted: false", function() {
          it("should return the primitive value, null formatted value, and the inline type", function() {
            var spec = value.toSpec();

            expect(typeof spec).toBe("object");
            expect(spec.v).toBeDefined();
            expect(spec.v instanceof Date).toBe(true);
            expect(spec.v).toBe(originalValue);
            expect(spec._).toBeDefined();
            expect(spec._).toBe(SimpleClass.type.toSpec().id);
            expect(spec.f).toBeUndefined();
          });
        });

        describe("omitFormatted: true", function() {
          it("should return the primitive value and the inline type", function() {
            var spec = value.toSpec({omitFormatted: true});

            expect(spec.v instanceof Date).toBe(true);
            expect(spec.v).toBe(originalValue);
            expect(spec._).toBeDefined();
            expect(spec._).toBe(SimpleClass.type.toSpec().id);
          });
        });
      });

      describe("inline type spec", function() {
        it("should return the primitive value", function() {
          var spec = value.toSpec({omitRootType: true});

          expect(spec instanceof Date).toBe(true);
          expect(spec._).toBeUndefined();
          expect(spec.f).toBeUndefined();
          expect(spec.v).toBeUndefined();
        });
      });

      describe("inline type spec", function() {
        it("should return the primitive value", function() {
          var spec = value.toSpec({omitFormatted: true, omitRootType: true});

          expect(spec instanceof Date).toBe(true);
          expect(spec._).toBeUndefined();
          expect(spec.f).toBeUndefined();
          expect(spec.v).toBeUndefined();
        });
      });
    }); // pentaho.type.Date
  });
});
