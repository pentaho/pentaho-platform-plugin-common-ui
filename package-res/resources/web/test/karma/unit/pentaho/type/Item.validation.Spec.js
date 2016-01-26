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
  "pentaho/type/Item",
  "pentaho/type/Context",
  "pentaho/util/error",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Item, Context, error, bundle) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  var context = new Context();
  var PentahoNumber = context.get("pentaho/type/number");

  describe("pentaho/type/Item - Validation -", function() {

    describe("this.validate()", function() {
      it("should return null", function() {
        var va = new Item();
        expect(va.validate()).toBe(null);
      });
    });// end #validate

    describe("this.isValid", function() {
      it("should call #validate()", function() {
        var va = new Item();
        spyOn(va, "validate").and.returnValue([]);
        va.isValid;
        expect(va.validate).toHaveBeenCalled();
      });

      it("should return `false` is #validate() returns a truthy value", function() {
        var va = new Item();
        spyOn(va, "validate").and.returnValue(["error"]);
        expect(va.isValid).toBe(false);
      });

      it("should return `true` is #validate() returns a nully value", function() {
        var va = new Item();
        spyOn(va, "validate").and.returnValue([]);
        expect(va.isValid).toBe(true);
      });
    });// end #validate

    describe("Item.validate(value)", function() {
      it("should return `null` when given a nully value", function() {
        expect(Item.meta.validate(null)).toBe(null);
        expect(Item.meta.validate(undefined)).toBe(null);
      });

      it("should return `null` when given a valid `Value`", function() {
        expect(Item.meta.validate(new Item())).toBe(null);
      });

      it("should return an error array when given a value not an instance " +
        "of the type and not call the type's validate method", function() {
        var value = new Item();
        spyOn(value, "validate");

        var errors = PentahoNumber.meta.validate(value);

        expect(value.validate).not.toHaveBeenCalled();
        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBe(1);
        expect(errors[0] instanceof Error).toBe(true);
        expect(errors[0].message)
          .toBe(bundle.format(bundle.structured.errors.value.notOfType, [PentahoNumber.meta.label]));
      });

      it("should call the value's validate method when it is an instance of the type", function() {
        var value = new Item();
        spyOn(value, "validate");
        Item.meta.validate(value);
        expect(value.validate.calls.count()).toBe(1);
      });

      it("should convert an error returned by the validate method to an array of errors", function() {
        var value = new Item();
        var error = new Error();
        spyOn(value, "validate").and.returnValue(error);
        var errors = Item.meta.validate(value);
        expect(errors).toEqual([error]);
      });

      it("should return an error array returned by the validate method", function() {
        var value = new Item();
        var errors = [new Error()];
        spyOn(value, "validate").and.returnValue(errors);

        expect(Item.meta.validate(value)).toBe(errors);
      });
    });// end #validate
  }); // pentaho/type/Item
});
