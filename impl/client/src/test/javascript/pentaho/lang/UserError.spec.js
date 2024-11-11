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
  "pentaho/lang/UserError"
], function(UserError) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.lang.UserError -", function() {
    it("should be defined.", function() {
      expect(typeof UserError).toBeDefined();
    });

    var error;

    beforeEach(function() {
      error = new UserError();
    });

    it("name property should be \"UserError\"", function() {
      expect(error.name).toBe("UserError");
    });

    it("name property should be read-only", function() {
      expect(function() {
        error.name = "New Name";
      }).toThrowError(TypeError);
    });

  }); // #pentaho.lang.UserError
});
