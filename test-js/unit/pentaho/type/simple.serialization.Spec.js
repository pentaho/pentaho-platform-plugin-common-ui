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

      describe("values", function() {
        var originalSpec = {v: false, f: "I'm a simple value"};

        describe("value with formatted info", function() {
          var value;

          beforeEach(function() {
            value = new PentahoBoolean(originalSpec);
          });

          describe("default", function() {
            it("should return primitive value and formatted value", function() {
              var spec = value.toSpec();

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBe(originalSpec.f);
            });
          });

          describe("returnFormattedValues: true", function() {
            it("should return primitive value and formatted value", function() {
              var spec = value.toSpec({returnFormattedValues: true});

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBe(originalSpec.f);
            });
          });

          describe("returnFormattedValues: false", function() {
            it("should return primitive value", function() {
              var spec = value.toSpec({returnFormattedValues: false});

              expect(spec).toBe(originalSpec.v);
            });
          });

          describe("returnFormattedValues: false but inlineTypeSpec: true", function() {
            it("should return primitive value and undefined formatted value", function() {
              var spec = value.toSpec({returnFormattedValues: false, inlineTypeSpec: true});

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBeUndefined();
            });
          });
        });

        describe("value without formatted info", function() {
          var value;

          beforeEach(function() {
            value = new PentahoBoolean(originalSpec.v);
          });

          describe("default", function() {
            it("should return primitive value", function() {
              var spec = value.toSpec({returnFormattedValues: "auto"});

              expect(spec).toBe(originalSpec.v);
            });
          });

          describe("default but inlineTypeSpec: true", function() {
            it("should return primitive value and undefined formatted value", function() {
              var spec = value.toSpec({inlineTypeSpec: true});

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBeUndefined();
            });
          });

          describe("returnFormattedValues: true", function() {
            it("should return primitive value and null formatted value", function() {
              var spec = value.toSpec({returnFormattedValues: true});

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBeDefined();
              expect(spec.f).toBeNull();
            });
          });

          describe("returnFormattedValues: false", function() {
            it("should return primitive value", function() {
              var spec = value.toSpec({returnFormattedValues: false});

              expect(spec).toBe(originalSpec.v);
            });
          });

          describe("returnFormattedValues: false but inlineTypeSpec: true", function() {
            it("should return primitive value and undefined formatted value", function() {
              var spec = value.toSpec({returnFormattedValues: false, inlineTypeSpec: true});

              expect(spec.v).toBe(originalSpec.v);
              expect(spec.f).toBeUndefined();
            });
          });
        });
      });

      describe("inline type spec", function() {
        var value;
        beforeEach(function() {
          value = new PentahoBoolean(originalSpec.v);
        });

        describe("default", function() {
          it("should not inline type spec", function() {
            var spec = value.toSpec({inlineTypeSpec: false});

            expect(spec._).toBeUndefined();
          });
        });

        describe("inlineTypeSpec: false", function() {
          it("should not inline type spec", function() {
            var spec = value.toSpec({inlineTypeSpec: false});

            expect(spec._).toBeUndefined();
          });
        });

        describe("inlineTypeSpec: true", function() {
          it("should inline type spec", function() {
            var spec = value.toSpec({inlineTypeSpec: true});

            // forces {v: ...} format
            //  when returning an inline type spec
            expect(typeof spec).toBe("object");

            expect(spec._).toBeDefined();
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
          value = new SimpleClass(simple.value);
        });

        describe("values", function() {
          describe("primitive format (returnFormattedValues: false)", function() {
            it("should return the primitive value", function() {
              var spec = value.toSpec({returnFormattedValues: false});

              expect(typeof spec.v).toBe(simple.name);
              expect(spec).toBe(simple.value);
            });
          });

          describe("object format (returnFormattedValues: true)", function() {
            it("spec.v should contain the primitive value", function() {
              var spec = value.toSpec({returnFormattedValues: true});

              expect(typeof spec).toBe("object");
              expect(spec.v).toBeDefined();

              expect(typeof spec.v).toBe(simple.name);
              expect(spec.v).toBe(simple.value);
            });
          });
        });

        describe("inline type spec", function() {
          it("should inline pentaho/type/" + simple.name + " type spec", function() {
            var spec = value.toSpec({inlineTypeSpec: true});

            expect(typeof spec).toBe("object");
            expect(spec._).toBeDefined();
            expect(spec._).toBe(SimpleClass.meta.id);
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
        describe("returnFormattedValues: true", function() {
          it("spec.v should contain the primitive value", function() {
            var spec = value.toSpec({returnFormattedValues: true});

            expect(typeof spec).toBe("object");
            expect(spec.v).toBeDefined();

            expect(spec.v instanceof Date).toBe(true);
            expect(spec.v).toBe(originalValue);
          });
        });

        describe("returnFormattedValues: false", function() {
          it("should return the primitive value", function() {
            var spec = value.toSpec({returnFormattedValues: false});

            expect(spec instanceof Date).toBe(true);
            expect(spec).toBe(originalValue);
          });
        });
      });

      describe("inline type spec", function() {
        it("should inline type spec", function() {
          var spec = value.toSpec({inlineTypeSpec: true});

          expect(typeof spec).toBe("object");
          expect(spec._).toBeDefined();
          expect(spec._).toBe(SimpleClass.meta.id);
        });
      });
    }); // pentaho.type.Date
  });
});
