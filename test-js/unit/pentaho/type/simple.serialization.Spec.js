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
  "pentaho/type/SpecificationScope"
], function(Context, SpecificationScope) {
  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, Date:false */

  var context = new Context();

  describe("pentaho.type.Simple", function() {

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
          it("should return primitive value and formatted value", function() {
            var spec = value.toSpec();

            expect(spec.v).toBe(originalSpec.v);
            expect(spec.f).toBe(originalSpec.f);
            expect(spec._).toBeUndefined();
          });
        });

        describe("omitFormatted: true and includeType: true", function() {
          it("should return primitive value and inline type ", function() {
            var spec = value.toSpec({omitFormatted: true, includeType: true});

            expect(spec.v).toBe(originalSpec.v);
            expect(spec.f).toBeUndefined();
            expect(spec._).toEqual(PentahoBoolean.type.toRefInContext());
          });
        });

        describe("omitFormatted: true and includeType: false", function() {
          it("should return primitive value, undefined formatted value, and undefined inline type", function() {
            var spec = value.toSpec({omitFormatted: true, includeType: false});

            expect(spec).toBe(originalSpec.v);
            expect(spec.f).toBeUndefined();
            expect(spec._).toBeUndefined();
          });
        });

        describe("omitFormatted: false and includeType: false", function() {
          it("should return primitive value, formatted value, and undefined inline type", function() {
            var spec = value.toSpec({includeType: false});

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
          it("should return primitive value", function() {
            var spec = value.toSpec();

            expect(spec).toBe(originalSpec.v);
          });
        });

        describe("omitFormatted: true and includeType: true", function() {
          it("should return primitive value and undefined formatted value", function() {
            var spec = value.toSpec({omitFormatted: true, includeType: true});

            expect(spec.v).toBe(originalSpec.v);
            expect(spec.f).toBeUndefined();
            expect(spec._).toEqual(PentahoBoolean.type.toRefInContext());
          });
        });

        describe("omitFormatted: true and includeType: false", function() {
          it("should return primitive value, undefined formatted value, and undefined inline type", function() {
            var spec = value.toSpec({omitFormatted: true, includeType: false});

            expect(spec).toBe(originalSpec.v);
            expect(spec.f).toBeUndefined();
            expect(spec._).toBeUndefined();
          });
        });

        describe("omitFormatted: false and includeType: false", function() {
          it("should return primitive value", function() {
            var spec = value.toSpec({includeType: false});

            expect(spec).toBe(originalSpec.v);
          });
        });
      });
    });

    describe("#toSpecInContext(keyArgs)", function() {
      // coverage
      it("should allow not specifying keyArgs", function() {
        var scope = new SpecificationScope();

        var value = new PentahoBoolean(true);

        value.toSpecInContext();

        scope.dispose();
      });

      it("should call _toJSONValue when keyArgs.isJson: true", function() {
        var scope = new SpecificationScope();

        var value = new PentahoBoolean(true);

        spyOn(value, "_toJSONValue").and.callThrough();

        value.toSpecInContext({isJson: true});

        scope.dispose();

        expect(value._toJSONValue).toHaveBeenCalled();
      });

      it("should not call _toJSONValue when keyArgs.isJson: false", function() {
        var scope = new SpecificationScope();

        var value = new PentahoBoolean(true);

        spyOn(value, "_toJSONValue");

        value.toSpecInContext({isJson: false});

        scope.dispose();

        expect(value._toJSONValue).not.toHaveBeenCalled();
      });

      it("should return cell format when _toJSONValue returns a plain object and keyArgs.isJson: true", function() {
        var scope = new SpecificationScope();

        var value = new PentahoBoolean(true);
        var valueResult = {};

        spyOn(value, "_toJSONValue").and.returnValue(valueResult);

        var cellResult = value.toSpecInContext({isJson: true});

        scope.dispose();

        expect(cellResult instanceof Object).toBe(true);
        expect(cellResult.v).toBe(valueResult);
      });
    });

    describe("#_toJSONValue", function() {
      it("should return the value property", function() {
        var scope = new SpecificationScope();

        var value = new PentahoBoolean(true);

        expect(value._toJSONValue()).toBe(true);

        scope.dispose();

        // ---

        scope = new SpecificationScope();

        value = new PentahoBoolean(false);

        expect(value._toJSONValue()).toBe(false);

        scope.dispose();
      });
    });
  }); // pentaho.type.Simple

  var simplerTypes = [
    {name: "boolean",  value: true},
    {name: "number",   value: 10},
    {name: "string",   value: "hello"},
    {name: "object",   value: {foo: "bar"}},
    {name: "function", value: function() {}},
    {name: "date",     value: new Date()}
  ];

  simplerTypes.forEach(function(simpleSpec) {
    describe("pentaho.type." + simpleSpec.name, function() {
      var SimpleClass = context.get("pentaho/type/" + simpleSpec.name);

      var value;
      beforeEach(function() {
        value = new SimpleClass(simpleSpec);
      });

      describe("values", function() {
        describe("primitive format (omitFormatted: true)", function() {
          it("should return the primitive value when it is not a plain object or wrap it otherwise", function() {
            var spec = value.toSpec({omitFormatted: true, includeType: false});
            if(simpleSpec.value instanceof Object && simpleSpec.value.constructor === Object) {
              expect(spec.v).toBe(simpleSpec.value);
            } else {
              expect(spec).toBe(simpleSpec.value);
            }
          });
        });

        describe("object format (omitFormatted: false)", function() {
          it("spec.v should contain the primitive value", function() {
            var spec = value.toSpec({omitFormatted: true, includeType: true});

            expect(typeof spec).toBe("object");
            expect(spec.v).toBe(simpleSpec.value);
            expect(spec._).toEqual(SimpleClass.type.toRefInContext());
          });
        });
      });

      describe("inline type spec includeType: false", function() {
        it("should not inline type spec when primitive value is not an object, and should wrap otherwise", function() {
          var spec = value.toSpec({includeType: false});

          if(simpleSpec.value instanceof Object && simpleSpec.value.constructor === Object) {
            expect(spec.v).toBe(simpleSpec.value);
          } else {
            expect(spec).toBe(simpleSpec.value);
          }
        });
      });

      describe("inline type spec includeType: true", function() {
        it("should inline pentaho/type/" + simpleSpec.name + " type spec", function() {
          var spec = value.toSpec({includeType: true});

          expect(typeof spec).toBe("object");
          expect(spec._).toEqual(SimpleClass.type.toRefInContext());
          expect(spec.f).toBeUndefined();
        });
      });
    });
  });
});
