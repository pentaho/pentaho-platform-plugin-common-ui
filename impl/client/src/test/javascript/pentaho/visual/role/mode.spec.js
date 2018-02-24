/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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

  /* globals jasmine, console, expect, it, describe, beforeEach, beforeAll */

  describe("pentaho.visual.role.Mode", function() {

    var context;
    var Mode;

    var stringType;
    var numberType;
    var booleanType;
    var dateType;
    var objectType;
    var listType;
    var elementType;

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(_context) {
            context = _context;

            stringType = context.get("string").type;
            numberType = context.get("number").type;
            booleanType = context.get("boolean").type;
            dateType = context.get("date").type;
            objectType = context.get("object").type;
            elementType = context.get("element").type;
            listType = context.get("list").type;

            return context.getAsync("pentaho/visual/role/mode");
          })
          .then(function(_Mode) {
            Mode = _Mode;
          })
          .then(done, done.fail);

    });

    describe("new (spec)", function() {

      it("should be possible to create a Mode instance", function() {
        var mode = new Mode();
        expect(mode instanceof Mode).toBe(true);
      });

      describe("spec.dataType", function() {

        it("should have a default of Instance", function() {
          var mode = new Mode();
          expect(mode.dataType != null).toBe(true);
          expect(mode.dataType.id).toBe("pentaho/type/instance");
        });

        it("should respect and resolve a specified string value", function() {
          var mode = new Mode({dataType: "string"});
          expect(mode.dataType).toBe(stringType);
        });

        it("should respect and resolve a specified instance constructor value", function() {
          var mode = new Mode({dataType: context.get("string")});
          expect(mode.dataType).toBe(stringType);
        });

        it("should respect a specified type object", function() {
          var mode = new Mode({dataType: stringType});
          expect(mode.dataType).toBe(stringType);
        });
      });

      describe("spec.isContinuous", function() {

        it("should have a default of false for the default dataType", function() {
          var mode = new Mode();
          expect(mode.isContinuous).toBe(false);
        });

        it("should have a default of true for the number dataType", function() {
          var mode = new Mode({dataType: numberType});
          expect(mode.isContinuous).toBe(true);
        });

        it("should have a default of true for the date dataType", function() {
          var mode = new Mode({dataType: dateType});
          expect(mode.isContinuous).toBe(true);
        });

        it("should have a default of false for the string dataType", function() {
          var mode = new Mode({dataType: stringType});
          expect(mode.isContinuous).toBe(false);
        });

        // specifically allows continuous for a datatype that cannot be continuous
        // because it is assumed that a later conversion can be made within the viz implementation.
        it("should respect a specified value of true for the string dataType", function() {
          var mode = new Mode({dataType: stringType, isContinuous: true});
          expect(mode.isContinuous).toBe(true);
        });

        it("should respect a specified value of false for the number dataType", function() {
          var mode = new Mode({dataType: numberType, isContinuous: false});
          expect(mode.isContinuous).toBe(false);
        });
      });
    });

    describe("#$key", function() {

      it("should have a different key if same dataType and different isContinuous", function() {
        var modeA = new Mode({dataType: numberType, isContinuous: false});
        var modeB = new Mode({dataType: numberType, isContinuous: true});
        expect(modeA.$key).not.toBe(modeB.$key);
      });

      it("should have a different key if different dataType and same isContinuous", function() {
        var modeA = new Mode({dataType: stringType, isContinuous: false});
        var modeB = new Mode({dataType: numberType, isContinuous: false});
        expect(modeA.$key).not.toBe(modeB.$key);
      });

      it("should have a different key if different dataType and different isContinuous", function() {
        var modeA = new Mode({dataType: stringType, isContinuous: false});
        var modeB = new Mode({dataType: numberType, isContinuous: true});
        expect(modeA.$key).not.toBe(modeB.$key);
      });

      it("should have the same key if same dataType and same isContinuous", function() {
        var modeA = new Mode({dataType: numberType, isContinuous: false});
        var modeB = new Mode({dataType: numberType, isContinuous: false});
        expect(modeA.$key).toBe(modeB.$key);
      });
    });

    describe("#canApplyToFieldTypes(fieldTypes)", function() {

      describe("when dataType: instance", function() {

        var mode;

        beforeAll(function() {
          mode = new Mode({dataType: "instance"});
        });

        it("should return true when given [number]", function() {
          expect(mode.canApplyToFieldTypes([numberType])).toBe(true);
        });

        it("should return true when given [boolean]", function() {
          expect(mode.canApplyToFieldTypes([booleanType])).toBe(true);
        });

        it("should return true when given [string]", function() {
          expect(mode.canApplyToFieldTypes([stringType])).toBe(true);
        });

        it("should return true when given [date]", function() {
          expect(mode.canApplyToFieldTypes([dateType])).toBe(true);
        });

        it("should return true when given [string, string]", function() {
          expect(mode.canApplyToFieldTypes([stringType, stringType])).toBe(true);
        });

        it("should return true when given [string, number]", function() {
          expect(mode.canApplyToFieldTypes([stringType, numberType])).toBe(true);
        });
      });

      describe("when dataType: element", function() {

        var mode;

        beforeAll(function() {
          mode = new Mode({dataType: elementType});
        });

        it("should return true when given [number]", function() {
          expect(mode.canApplyToFieldTypes([numberType])).toBe(true);
        });

        it("should return true when given [boolean]", function() {
          expect(mode.canApplyToFieldTypes([booleanType])).toBe(true);
        });

        it("should return true when given [string]", function() {
          expect(mode.canApplyToFieldTypes([stringType])).toBe(true);
        });

        it("should return true when given [date]", function() {
          expect(mode.canApplyToFieldTypes([dateType])).toBe(true);
        });

        it("should return false when given [string, string]", function() {
          expect(mode.canApplyToFieldTypes([stringType, stringType])).toBe(false);
        });

        it("should return false when given [string, number]", function() {
          expect(mode.canApplyToFieldTypes([stringType, numberType])).toBe(false);
        });
      });

      describe("when dataType: elementSubType", function() {

        it("should return true when dataType is number and isContinuous is false and given [number]", function() {
          var mode = new Mode({dataType: numberType, isContinuous: false});
          expect(mode.canApplyToFieldTypes([numberType])).toBe(true);
        });

        it("should return true when dataType is boolean and isContinuous is true and given [boolean]", function() {
          var mode = new Mode({dataType: booleanType, isContinuous: false});
          expect(mode.canApplyToFieldTypes([booleanType])).toBe(true);
        });

        it("should return true when dataType is string and given [string]", function() {
          var mode = new Mode({dataType: stringType});
          expect(mode.canApplyToFieldTypes([stringType])).toBe(true);
        });

        it("should return true when dataType is date and given [date]", function() {
          var mode = new Mode({dataType: dateType});
          expect(mode.canApplyToFieldTypes([dateType])).toBe(true);
        });

        it("should return true when dataType is element and given [string]", function() {
          var mode = new Mode({dataType: elementType});
          expect(mode.canApplyToFieldTypes([stringType])).toBe(true);
        });

        it("should return false when dataType is string and given [date]", function() {
          var mode = new Mode({dataType: stringType});
          expect(mode.canApplyToFieldTypes([dateType])).toBe(false);
        });

        it("should return false when dataType is string and given [string, string]", function() {
          var mode = new Mode({dataType: stringType});
          expect(mode.canApplyToFieldTypes([stringType, stringType])).toBe(false);
        });

        it("should return false when dataType is string and given [string, number]", function() {
          var mode = new Mode({dataType: stringType});
          expect(mode.canApplyToFieldTypes([stringType, numberType])).toBe(false);
        });
      });

      describe("when dataType is list", function() {
        var mode;

        beforeAll(function() {
          mode = new Mode({dataType: listType});
        });

        it("should return true when given []", function() {
          expect(mode.canApplyToFieldTypes([])).toBe(true);
        });

        it("should return true when given [number]", function() {
          expect(mode.canApplyToFieldTypes([numberType])).toBe(true);
        });

        it("should return true when given [string]", function() {
          expect(mode.canApplyToFieldTypes([stringType])).toBe(true);
        });

        it("should return true when given [date]", function() {
          expect(mode.canApplyToFieldTypes([dateType])).toBe(true);
        });

        it("should return true when given [string, number]", function() {
          expect(mode.canApplyToFieldTypes([stringType, numberType])).toBe(true);
        });

        it("should return true when given [string, string]", function() {
          expect(mode.canApplyToFieldTypes([stringType, numberType])).toBe(true);
        });
      });

      describe("when dataType is [number]", function() {
        var mode;

        beforeAll(function() {
          mode = new Mode({dataType: [numberType]});
        });

        it("should return true when given []", function() {
          expect(mode.canApplyToFieldTypes([])).toBe(true);
        });

        it("should return true when given [number]", function() {
          expect(mode.canApplyToFieldTypes([numberType])).toBe(true);
        });

        it("should return false when given [string]", function() {
          expect(mode.canApplyToFieldTypes([stringType])).toBe(false);
        });

        it("should return false when given [date]", function() {
          expect(mode.canApplyToFieldTypes([dateType])).toBe(false);
        });

        it("should return true when given [number, number]", function() {
          expect(mode.canApplyToFieldTypes([numberType, numberType])).toBe(true);
        });

        it("should return false when given [string, number]", function() {
          expect(mode.canApplyToFieldTypes([stringType, numberType])).toBe(false);
        });
      });

      describe("when dataType is [string]", function() {
        var mode;

        beforeAll(function() {
          mode = new Mode({dataType: [stringType]});
        });

        it("should return true when given []", function() {
          expect(mode.canApplyToFieldTypes([])).toBe(true);
        });

        it("should return false when given [number]", function() {
          expect(mode.canApplyToFieldTypes([numberType])).toBe(false);
        });

        it("should return true when given [string]", function() {
          expect(mode.canApplyToFieldTypes([stringType])).toBe(true);
        });

        it("should return false when given [date]", function() {
          expect(mode.canApplyToFieldTypes([dateType])).toBe(false);
        });

        it("should return false when given [string, number]", function() {
          expect(mode.canApplyToFieldTypes([stringType, numberType])).toBe(false);
        });

        it("should return false when given [number, number]", function() {
          expect(mode.canApplyToFieldTypes([numberType, numberType])).toBe(false);
        });

        it("should return true when given [string, string]", function() {
          expect(mode.canApplyToFieldTypes([stringType, stringType])).toBe(true);
        });
      });
    });
  });
});
