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
  "pentaho/type/action/TransactionRejectedError"
], function(TransactionRejectedError) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, jasmine:false */

  describe("pentaho.type.action.TransactionRejectedError", function() {

    describe("new(reason)", function() {
      it("should be defined", function () {
        expect(typeof TransactionRejectedError).toBeDefined();
      });

      it("should have #name='TransactionRejectedError'", function () {
        expect(TransactionRejectedError.prototype.name).toBe("TransactionRejectedError");
      });

      it("should have the given reason as #reason", function() {
        var reason = new Error();
        var error = new TransactionRejectedError(reason);

        expect(error.reason).toBe(reason);
      });
    });
  });
});
