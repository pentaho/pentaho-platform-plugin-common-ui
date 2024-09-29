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
  "pentaho/type/Number",
  "tests/pentaho/util/errorMatch"
], function(PentahoNumber, errorMatch) {

  "use strict";

  describe("pentaho.type.Number -", function() {

    describe("new Number()", function() {

      it("should return an object", function() {
        expect(typeof new PentahoNumber(1)).toBe("object");
      });

      it("should accept a number 1 and return the number 1", function() {
        expect(new PentahoNumber(1).value).toBe(1);
      });

      it("should accept a string '1' and return the number 1", function() {
        expect(new PentahoNumber("1").value).toBe(1);
      });

      it("should throw and not accept a 'non-numeric' argument", function() {
        expect(function() {
          var foo = new PentahoNumber("one");
        }).toThrow(errorMatch.argInvalid("value"));
      });

      it("should throw and not accept null", function() {
        expect(function() {
          var foo = new PentahoNumber(null);
        }).toThrow(errorMatch.argRequired("value"));
      });

    });

    describe(".Type", function() {

      describe("#isContinuous", function() {
        it("should have `isContinuous` equal to `true`", function() {
          expect(PentahoNumber.type.isContinuous).toBe(true);
        });
      });
    });
  });
});
