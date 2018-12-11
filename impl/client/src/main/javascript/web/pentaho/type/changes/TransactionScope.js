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
  "module",
  "./AbstractTransactionScope"
], function(module, AbstractTransactionScope) {

  "use strict";

  return AbstractTransactionScope.extend(module.id, /** @lends pentaho.type.changes.TransactionScope# */{

    /**
     * @name TransactionScope
     * @memberOf pentaho.type.changes
     * @class
     * @extends pentaho.type.changes.AbstractTransactionScope
     *
     * @friend pentaho.type.changes.Transaction
     *
     * @classDesc The `TransactionScope` class manages a [transaction]{@link pentaho.type.changes.Transaction}.
     *
     * @constructor
     * @description Creates a `TransactionScope`.
     *
     * @param {pentaho.type.changes.Transaction} transaction - The associated transaction.
     */

    /**
     * Gets a value that indicates if this scope can commit the ambient transaction.
     *
     * A scope can commit its transaction if:
     * 1. it is the root and current scope
     * 2. the transaction is in the proposed state.
     *
     * @type {boolean}
     * @readOnly
     */
    get canCommit() {
      return this.isRoot && this.isCurrent && this.transaction.isProposed;
    },

    /**
     * Previews the result of committing the transaction by performing its _will_ phase.
     *
     * Call this method to determine if an operation would be valid when there's
     * no _a priori_ intention of committing it, in case it is valid.
     * If the previewing returns a fulfilled result, the transaction can still be committed later, if desired.
     *
     * In any case,
     * no more changes can be performed in this transaction,
     * after `acceptWill` has been called;
     * the transaction becomes [read-only]{@link pentaho.type.changes.Transaction#isReadOnly}.
     *
     * @return {pentaho.lang.ActionResult} The commit result, if the transaction was committed; `null`, otherwise.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction scope has already been exited from.
     * @throws {pentaho.lang.OperationInvalidError} When the transaction scope is not the current scope.
     * Can only accept the current scope of the transaction.
     */
    acceptWill: function() {
      this._assertInsideAndCurrent();

      return this.transaction.__commitWill();
    },

    /**
     * Accepts the scope.
     *
     * When the scope can commit its transaction,
     * as determined by [canCommit]{@link pentaho.type.changes.TransactionScope#canCommit},
     * accepting the scope attempts to commit its transaction and exits from the scope.
     * If committing the transaction fails, the rejection error is thrown.
     *
     * Otherwise, if the scope cannot commit its transaction, accepting the scope simply exits from it.
     *
     * @return {pentaho.type.changes.AbstractTransactionScope} This scope.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the transaction scope has already been exited.
     * @throws {pentaho.lang.OperationInvalidError} When the transaction scope is not the current scope.
     * @throws {Error} When attempting to commit the transaction fails.
     */
    accept: function() {
      this._assertInsideAndCurrent();

      if(this.canCommit)
        this.transaction.__commit();
      else
        this.exit();

      return this;
    },

    /**
     * Rejects the associated transaction, exits the scope and
     * throws an error containing the provided rejected reason.
     *
     * @param {string|Error|pentaho.lang.UserError} [reason="canceled"] The reason for rejecting the transaction.
     *
     * @throws {pentaho.lang.OperationInvalidError} When not `sloppy` and the transaction scope has
     * already been exited from.
     * @throws {pentaho.lang.OperationInvalidError} When not `sloppy` and the transaction scope is
     * not the current scope.
     * @throws {Error} The rejection error.
     */
    reject: function(reason) {
      this._assertInsideAndCurrent();

      this.transaction.__reject(reason);
    },

    /**
     * Calls a given function within the scope and
     * safely rejects the scope in the case where an error occurs
     * and exits the scope otherwise.
     *
     * If the transaction has been rejected somehow, its rejection error is thrown back to the caller.
     *
     * In any case, the scope will have been exited from when this method returns.
     *
     * @param {function(pentaho.type.changes.TransactionScope) : any} fun - The function to call within the scope.
     * The function is called with the `this` context specified in argument `ctx`.
     * The return value of `fun` is returned back from this method.
     *
     * @param {?object} [ctx] The `this` context in which to call `fun`.
     * When unspecified, the function will have a `null` this.
     *
     * @return {*} The value returned by `fun`.
     *
     * @throws {Error} When the transaction is rejected, the rejection error.
     */
    using: function(fun, ctx) {
      var result;
      try {
        result = fun.call(ctx, this);
      } catch(ex) {

        if(this.isCurrent)
          // throws ex
          this.reject(ex);
        else
          throw ex;

      } finally {
        this.dispose();
      }

      // Make sure a rejection results in a throw to the caller,
      // even if `fun` swallowed the initial throw.
      var ar = this.transaction.result;
      if(ar && ar.error)
        throw ar.error;

      return result;
    }
  });
});
