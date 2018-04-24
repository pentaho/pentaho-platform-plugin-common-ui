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
  "pentaho/type/Value",
  "pentaho/type/Number",
  "pentaho/type/ValidationError"
], function(Value, PentahoNumber, ValidationError) {

  "use strict";

  describe("pentaho.type.Value", function() {

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
    });

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
    });
  });
});
