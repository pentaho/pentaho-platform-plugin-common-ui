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
  "module",
  "pentaho/lang/UserError",
  "pentaho/util/object"
], function(module, UserError, O) {

  "use strict";

  /**
   * @classDesc The `TransactionRejectedError` class wraps the reason used to reject a
   * [transaction]{@link pentaho.type.action.Transaction} and is thrown
   * whenever a transaction is rejected through a transaction scope's
   * [reject]{@link pentaho.type.action.TransactionScope#reject} method or
   * the commit fails, through a transaction scope's
   * [accept]{@link pentaho.type.action.TransactionScope#accept} method.
   *
   * @name TransactionRejectedError
   * @memberOf pentaho.type.action
   * @class
   * @extends pentaho.lang.UserError
   *
   * @description Creates a transaction rejected error object given the rejection reason.
   * @constructor
   * @param {Error} reason - The error message.
   */

  return UserError.extend(module.id, /** @lends pentaho.type.action.TransactionRejectedError# */{

    constructor: function(reason) {

      this.base("Transaction was rejected");

      /**
       * Gets the reason why the transaction was rejected.
       *
       * @type {Error}
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
