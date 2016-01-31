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
  "pentaho/util/error",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Context, error, bundle) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  var context = new Context(),
      Value = context.get("pentaho/type/value"),
      PentahoNumber = context.get("pentaho/type/number");

  describe("pentaho.type.Value -", function() {
    describe("#isValid -", function() {
      it("should call #validate()", function() {
        var va = new Value();
        spyOn(va, "validate").and.returnValue(null);
        va.isValid;
        expect(va.validate).toHaveBeenCalled();
      });

      it("should return `false` if #validate() returns a truthy value", function() {
        var va = new Value();
        spyOn(va, "validate").and.returnValue([new Error()]);
        expect(va.isValid).toBe(false);
      });

      it("should return `true` if #validate() returns a nully value", function() {
        var va = new Value();
        spyOn(va, "validate").and.returnValue(null);
        expect(va.isValid).toBe(true);
      });
    });// end #isValid
  });

  describe("pentaho.type.Value.Meta -", function() {

    describe("#isValid(value) -", function() {
      it("should call .validate(.)", function() {
        var va = new Value();
        spyOn(Value.meta, "validate").and.returnValue(null);
        Value.meta.isValid(va);
        expect(Value.meta.validate).toHaveBeenCalled();
      });

      it("should return `false` if .validate(.) returns a truthy value", function() {
        var va = new Value();
        spyOn(Value.meta, "validate").and.returnValue([new Error()]);
        expect(Value.meta.isValid(va)).toBe(false);
      });

      it("should return `true` if .validate() returns a nully value", function() {
        var va = new Value();
        spyOn(Value.meta, "validate").and.returnValue(null);
        expect(Value.meta.isValid(va)).toBe(true);
      });
    });// end #isValid(value)

    describe("#validate(value) -", function() {
      it("should return an error when given a nully value", function() {
        function expectIt(value) {
          var errors = Value.meta.validate(value);
          expect(Array.isArray(errors)).toBe(true);
          expect(errors.length).toBe(1);
          expect(errors[0].message).toBe(bundle.structured.errors.value.cannotBeNull);
        }

        expectIt(null);
        expectIt(undefined);
      });

      it("should return `null` when given a valid `Value`", function() {
        expect(Value.meta.validate(new Value())).toBe(null);
      });

      it("should return an error array when given a value not an instance " +
         "of the type and not call the validateInstance method", function() {
        var value = new Value();

        var errors = PentahoNumber.meta.validate(value);
        spyOn(PentahoNumber.meta, "validateInstance").and.callThrough();
        spyOn(Value.meta, "validateInstance").and.callThrough();

        expect(PentahoNumber.meta.validateInstance).not.toHaveBeenCalled();
        expect(Value.meta.validateInstance).not.toHaveBeenCalled();

        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBe(1);
        expect(errors[0] instanceof Error).toBe(true);
        expect(errors[0].message)
          .toBe(bundle.format(bundle.structured.errors.value.notOfType, [PentahoNumber.meta.label]));
      });

      it("should call the validateInstance method with the value when it is an instance of the exact same type", function() {
        spyOn(Value.meta, "validateInstance").and.callThrough();

        var value = new Value();
        Value.meta.validate(value);
        expect(Value.meta.validateInstance.calls.count()).toBe(1);
        expect(Value.meta.validateInstance).toHaveBeenCalledWith(value);
      });

      it("should call the value type's _validate method with the value when it is an instance of the type", function() {
        var value = new PentahoNumber(1);

        spyOn(Value.meta, "validateInstance").and.callThrough();
        spyOn(value, "validate").and.callThrough();
        spyOn(PentahoNumber.meta, "_validate").and.callThrough();

        Value.meta.validate(value);

        expect(Value.meta.validateInstance).toHaveBeenCalledWith(value);
        expect(value.validate).toHaveBeenCalled();
        expect(PentahoNumber.meta._validate).toHaveBeenCalledWith(value);
      });

      it("should convert an error returned by the _validate method to an array of errors", function() {
        var value = new Value();
        var error = new Error();
        spyOn(Value.meta, "_validate").and.returnValue(error);
        var errors = Value.meta.validate(value);
        expect(errors).toEqual([error]);
      });

      it("should return an error array returned by the validate method", function() {
        var value = new Value();
        var errors = [new Error()];
        spyOn(Value.meta, "validateInstance").and.returnValue(errors);
        var result = Value.meta.validate(value);
        expect(result).toBe(errors);
      });
    });// end #validate(value)
  }); // pentaho.type.Value.Meta
});
