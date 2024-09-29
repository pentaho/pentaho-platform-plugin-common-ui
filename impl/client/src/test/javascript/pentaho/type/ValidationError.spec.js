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
  "pentaho/type/ValidationError"
], function(ValidationError) {

  "use strict";

  describe("pentaho.lang.ValidationError", function() {
    it("should be defined", function() {
      expect(typeof ValidationError).toBeDefined();
    });

    var error;

    beforeEach(function() {
      error = new ValidationError();
    });

    it("name property should be \"ValidationError\"", function() {
      expect(error.name).toBe("ValidationError");
    });

    it("name property should be read-only", function() {
      expect(function() {
        error.name = "New Name";
      }).toThrowError(TypeError);
    });
  });
});
