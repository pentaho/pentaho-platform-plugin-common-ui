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
  "pentaho/type/Date",
  "tests/pentaho/util/errorMatch"
], function(PentahoDate, errorMatch) {

  "use strict";

  describe("pentaho.type.Date -", function() {

    describe("new Date()", function() {

      it("should be a function", function() {
        expect(typeof PentahoDate).toBe("function");
      });

      it("should return an object", function() {
        expect(typeof new PentahoDate(new Date())).toBe("object");
      });

      it("should accept a javascript Date()", function() {
        var today =  new Date();
        expect(new PentahoDate(today).value).toBe(today);
      });

      it("should accept an ISO string", function() {
        var testDate = new Date("1960-01-25");
        expect(new PentahoDate(testDate.toISOString()).value.toString()).toBe(testDate.toString());
      });

      it("should not accept nothing", function() {
        expect(function() {
          var foo = new PentahoDate();
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept null", function() {
        expect(function() {
          var foo = new PentahoDate(null);
        }).toThrow(errorMatch.argRequired("value"));
      });

      it("should not accept undefined", function() {
        expect(function() {
          var foo = new PentahoDate(undefined);
        }).toThrow(errorMatch.argRequired("value"));
      });
    });

    describe("#toJSON()", function() {

      it("should return the date's ISO string", function() {
        var testDate = new Date("1960-01-25");
        var date = new PentahoDate(testDate);
        expect(date.toJSON()).toBe(date.value.toISOString());
      });
    });

    describe("#$key()", function() {

      it("should return the date's ISO string", function() {
        var testDate = new Date("1960-01-25");
        var date = new PentahoDate(testDate);
        expect(date.$key).toBe(date.value.toISOString());
      });
    });

    describe(".Type", function() {

      describe("#isContinuous", function() {
        it("should have `isContinuous` equal to `true`", function() {
          expect(PentahoDate.type.isContinuous).toBe(true);
        });
      });
    });
  });
});
