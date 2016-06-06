/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../../lang/UserError",
  "../../util/object"
], function(UserError, O) {

  "use strict";

  /**
   * @classDesc The `TransactionRejectedError` class wraps the reason used to reject a
   * [transaction]{@link pentaho.type.changes.Transaction} and is thrown
   * whenever a transaction is rejected through a transaction scope's
   * [reject]{@link pentaho.type.changes.TransactionScope#reject} method or
   * the commit fails, through a transaction scope's
   * [accept]{@link pentaho.type.changes.TransactionScope#accept} method.
   *
   * @name TransactionRejectedError
   * @memberOf pentaho.type.changes
   * @class
   * @extends pentaho.lang.UserError
   *
   * @description Creates a transaction rejected error object given the rejection reason.
   * @constructor
   * @param {Error} reason The error message.
   */

  return UserError.extend("pentaho.type.changes.TransactionRejectedError",
  /** @lends pentaho.type.changes.TransactionRejectedError# */{

    constructor: function(reason) {

      this.base("Transaction was rejected");

      /**
       * Gets the reason why the transaction was rejected.
       *
       * @type {!Error}
       * @readOnly
       */
      O.setConst(this, "reason", reason);
    },

    /**
     * The name of the type of error.
     *
     * @type {string}
     * @readonly
     * @default "TransactionRejectedError"
     */
    get name() {
      return "TransactionRejectedError";
    }
  });
});
