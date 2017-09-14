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
  "pentaho/type/ValidationError",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Context, ValidationError, bundle) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  describe("pentaho.type.Value -", function() {

    var context;
    var Value;
    var PentahoNumber;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Value = context.get("pentaho/type/value");
            PentahoNumber = context.get("pentaho/type/number")
          })
          .then(done, done.fail);
    });

    describe("#validate()", function() {
      it("should return null", function() {
        var va = new Value();
        expect(va.validate()).toBe(null);
      });

      it("should be overridable using {$type: {instance: {}}", function() {
        var Derived = Value.extend({
          $type: {
            instance: {
              validate: function() {
                return [new ValidationError("Foo")];
              }
            }
          }
        });

        var d = new Derived();
        expect(d.validate()[0].message).toBe("Foo");
      });
    }); // #validate

    describe("#$isValid -", function() {
      it("should call #validate()", function() {
        var va = new Value();
        spyOn(va, "validate").and.returnValue(null);
        var isValid = va.$isValid;
        expect(va.validate).toHaveBeenCalled();
      });

      it("should return `false` if #validate() returns a truthy value", function() {
        var va = new Value();
        spyOn(va, "validate").and.returnValue([new ValidationError()]);
        expect(va.$isValid).toBe(false);
      });

      it("should return `true` if #validate() returns a nully value", function() {
        var va = new Value();
        spyOn(va, "validate").and.returnValue(null);
        expect(va.$isValid).toBe(true);
      });
    });// end #$isValid

    describe("#assertValid() -", function() {
      it("should not throw an error if the value is valid", function() {
        var va = new Value();
        spyOn(va, "validate").and.returnValue(null);

        expect(function() {
          va.assertValid();
        }).not.toThrow();
      });

      it("should throw an error if the value is not valid", function() {
        var va = new Value();
        spyOn(va, "validate").and.returnValue([new ValidationError()]);

        expect(function() {
          va.assertValid();
        }).toThrow();
      });

      it("should throw the first error if the value is not valid", function() {
        var va = new Value();
        var e1 = new ValidationError();
        var e2 = new ValidationError();
        spyOn(va, "validate").and.returnValue([e1, e2]);

        expect(function() {
          va.assertValid();
        }).toThrow(e1);
      });
    });// end #assertValid()
  });

  describe("pentaho.type.Value.Type -", function() {

    var context;
    var Value;
    var PentahoNumber;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Value = context.get("pentaho/type/value");
            PentahoNumber = context.get("pentaho/type/number")
          })
          .then(done, done.fail);
    });

    describe("#isValid(value) -", function() {
      it("should call .validate(.)", function() {
        var va = new Value();
        spyOn(Value.type, "validate").and.returnValue(null);
        Value.type.isValid(va);
        expect(Value.type.validate).toHaveBeenCalled();
      });

      it("should return `false` if .validate(.) returns a truthy value", function() {
        var va = new Value();
        spyOn(Value.type, "validate").and.returnValue([new ValidationError()]);
        expect(Value.type.isValid(va)).toBe(false);
      });

      it("should return `true` if .validate(.) returns a nully value", function() {
        var va = new Value();
        spyOn(Value.type, "validate").and.returnValue(null);
        expect(Value.type.isValid(va)).toBe(true);
      });
    });// end #isValid(value)

    describe("#validate(value) -", function() {
      it("should return an error when given a nully value", function() {
        function expectIt(value) {
          var errors = Value.type.validate(value);
          expect(Array.isArray(errors)).toBe(true);
          expect(errors.length).toBe(1);
          expect(errors[0].message).toBe(bundle.structured.errors.value.cannotBeNull);
        }

        expectIt(null);
        expectIt(undefined);
      });

      it("should return `null` when given a valid `Value`", function() {
        expect(Value.type.validate(new Value())).toBe(null);
      });

      it("should return an error array when given a value not an instance " +
         "of the type and not call the _validate method", function() {
        var value = new Value();

        var errors = PentahoNumber.type.validate(value);
        spyOn(PentahoNumber.type, "_validate").and.callThrough();
        spyOn(Value.type, "_validate").and.callThrough();

        expect(PentahoNumber.type._validate).not.toHaveBeenCalled();
        expect(Value.type._validate).not.toHaveBeenCalled();

        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBe(1);
        expect(errors[0] instanceof ValidationError).toBe(true);
        expect(errors[0].message)
          .toBe(bundle.format(bundle.structured.errors.value.notOfType, [PentahoNumber.type.label]));
      });

      it("should call the _validate method with the value when it is an instance of the type", function() {

        spyOn(Value.type, "_validate").and.callThrough();

        var value = new Value();
        Value.type.validate(value);
        expect(Value.type._validate.calls.count()).toBe(1);
        expect(Value.type._validate).toHaveBeenCalledWith(value);
      });

      it("should return an error array returned by the _validate method", function() {
        var value = new Value();
        var errors = [new ValidationError()];
        spyOn(Value.type, "_validate").and.returnValue(errors);
        var result = Value.type.validate(value);
        expect(result).toBe(errors);
      });
    });// end #validate(value)
  }); // pentaho.type.Value.Type
});
