/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/debug/Levels"
], function(DebugLevels) {

  "use strict";

  /* globals describe, it, expect, beforeEach */

  /* eslint max-nested-callbacks: 0 */

  var standardLevelNames = ["none", "error", "exception", "warn", "info", "debug", "log", "trace", "all"];

  describe("pentaho.debug.Levels", function() {

    it("should be an object", function() {
      expect(DebugLevels instanceof Object).toBe(true);
    });

    it("should contain own properties for the standard debugging levels with number values", function() {

      standardLevelNames.forEach(function(levelName) {

        expect(DebugLevels.hasOwnProperty(levelName)).toBe(true);
        expect(typeof DebugLevels[levelName]).toBe("number");
      });
    });

    it("should contain no other own properties", function() {

      expect(Object.keys(DebugLevels).length).toBe(standardLevelNames.length);
    });

    describe("parse(level[, defaultLevel])", function() {

      it("should be defined", function() {

        expect(typeof DebugLevels.parse).toBe("function");
      });

      it("should not be an own property", function() {

        expect(DebugLevels.hasOwnProperty("parse")).toBe(false);
      });

      it("should have a default defaultLevel of debug", function() {

        expect(DebugLevels.parse()).toBe(DebugLevels.debug);
      });

      // ---

      it("should return 'debug' when given a null level and defaultValue is not specified", function() {

        expect(DebugLevels.parse(null)).toBe(DebugLevels.debug);
      });

      it("should return 'debug' when given an undefined level and defaultValue is not specified", function() {

        expect(DebugLevels.parse(undefined)).toBe(DebugLevels.debug);
      });

      it("should return 'debug' when given an empty string and defaultValue is not specified", function() {

        expect(DebugLevels.parse("")).toBe(DebugLevels.debug);
      });

      it("should return 'debug' when given an undefined level name and defaultValue is not specified", function() {

        expect(DebugLevels.parse("foo")).toBe(DebugLevels.debug);
      });

      // ---

      it("should return defaultValue when given a null level", function() {

        expect(DebugLevels.parse(null, DebugLevels.warn)).toBe(DebugLevels.warn);
      });

      it("should return defaultValue when given an `undefined` level value", function() {

        expect(DebugLevels.parse(undefined, DebugLevels.warn)).toBe(DebugLevels.warn);
      });

      it("should return defaultValue when given an empty string", function() {

        expect(DebugLevels.parse("", DebugLevels.warn)).toBe(DebugLevels.warn);
      });

      it("should return defaultValue when given an undefined level name", function() {

        expect(DebugLevels.parse("foo", DebugLevels.warn)).toBe(DebugLevels.warn);
      });

      // ---

      it("should return the corresponding enum value when given a defined level name string", function() {

        standardLevelNames.forEach(function(levelName) {

          expect(DebugLevels.parse(levelName)).toBe(DebugLevels[levelName]);
        });
      });

      it("should return the corresponding enum value when given a defined level name string " +
         "and defaultValue is specified", function() {

        standardLevelNames.forEach(function(levelName) {

          expect(DebugLevels.parse(levelName, -1)).toBe(DebugLevels[levelName]);
        });
      });

      it("should return the corresponding enum value when given a defined level name string, " +
         "in any letter case", function() {

        standardLevelNames.forEach(function(levelName) {

          expect(DebugLevels.parse(levelName.toUpperCase())).toBe(DebugLevels[levelName]);
        });
      });

      it("should return the enum value when given a defined level enum value", function() {

        standardLevelNames.forEach(function(levelName) {

          expect(DebugLevels.parse(DebugLevels[levelName])).toBe(DebugLevels[levelName]);
        });
      });

      it("should return a number when given a number", function() {

        expect(DebugLevels.parse(100)).toBe(100);
      });

      it("should return a number when given its string representation", function() {

        expect(DebugLevels.parse("100")).toBe(100);
      });

      it("should return a rounded-down number when given a decimal number", function() {

        expect(DebugLevels.parse(100.23)).toBe(100);
      });
    });
  });
});
