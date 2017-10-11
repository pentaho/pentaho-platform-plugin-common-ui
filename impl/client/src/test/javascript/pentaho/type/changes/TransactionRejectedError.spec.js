/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/type/changes/TransactionRejectedError"
], function(TransactionRejectedError) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, jasmine:false */

  describe("pentaho.type.changes.TransactionRejectedError", function() {

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
