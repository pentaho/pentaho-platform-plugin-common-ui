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
  "./Transaction",
  "../../lang/Base",
  "../../util/object",
  "../../util/error",
  "../../util/logger"
], function(Transaction, Base, O, error, logger) {

  "use strict";

  return Base.extend(/** @lends pentaho.type.changes.AbstractTransactionScope# */{

    /**
     * @alias AbstractTransactionScope
     * @memberOf pentaho.type.changes
     * @class
     *
     * @classDesc The `AbstractTransactionScope` class is the abstract base class
     * of classes that control the
     * [ambient/current transaction]{@link pentaho.type.Context#transaction}.
     *
     * @constructor
     * @description Creates a `CommittedScope`.
     *
     * @param {!pentaho.type.Context} context The associated context.
     * @param {pentaho.type.changes.Transaction} [transaction] The associated transaction.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the specified transaction is resolved.
     *
     * @throws {pentaho.type.changes.TransactionRejectedError} When this is the root scope of the specified transaction
     * and the transaction is automatically rejected due to a concurrency error.
     */
    constructor: function(context, transaction) {
      if(!context) throw error.argRequired("context");

      /**
       * Gets the associated context.
       *
       * @name context
       * @memberOf pentaho.type.changes.AbstractTransactionScope#
       * @type {!pentaho.type.Context}
       * @readOnly
       */
      O.setConst(this, "context", context);

      /**
       * Gets the associated transaction, if any, or `null`.
       *
       * @name transaction
       * @memberOf pentaho.type.changes.AbstractTransactionScope#
       * @type {pentaho.type.changes.Transaction}
       * @readOnly
       */
      O.setConst(this, "transaction", transaction || null);

      /**
       * Indicates if this scope is the ambient transaction's root/outermost scope.
       *
       * @name isRoot
       * @memberOf pentaho.type.changes.TransactionScope#
       * @type {boolean}
       * @readOnly
       */
      O.setConst(this, "isRoot", (!!transaction && !transaction._scopeCount));

      /**
       * Indicates if the scope has not been exited from.
       *
       * @type {boolean}
       * @default false
       * @private
       */
      this._isInside = true;

      // Entering. May throw if already resolved or concurrency error.
      if(transaction) transaction._scopeEnter();
      context._scopeEnter(this);
    },

    /**
     * Throws an error if the scope has been exited from or is not the current scope.
     *
     * @throws {pentaho.lang.OperationInvalidError} When the scope has been exited from or
     * it is not the current scope of its context.
     *
     * @protected
     */
    _assertInsideAndCurrent: function() {
      if(!this._isInside) throw this._getErrorNotInside();
      if(!this.isCurrent) throw this._getErrorNotCurrent();
    },

    /**
     * Creates an error saying the scope has already been exited from.
     *
     * @return {pentaho.lang.OperationInvalidError} The new error.
     *
     * @private
     */
    _getErrorNotInside: function() {
      return error.operInvalid("Scope has been exited from.");
    },

    /**
     * Gets an error saying the scope is not the current scope of its context.
     *
     * @return {pentaho.lang.OperationInvalidError} The new error.
     *
     * @private
     */
    _getErrorNotCurrent: function() {
      return error.operInvalid("Scope is not the current scope of its context.");
    },

    /**
     * Gets a value that indicates if this scope has not been exited from.
     *
     * @type {boolean}
     * @readOnly
     */
    get isInside() {
      return this._isInside;
    },

    /**
     * Gets a value that indicates if this scope is the current scope of its context.
     *
     * A context's current scope is its innermost scope.
     *
     * @type {boolean}
     * @readOnly
     */
    get isCurrent() {
      return this._isInside && (this === this.context._scopeCurrent);
    },

    /**
     * Calls a given function within the scope and safely exits from the scope.
     *
     * @param {function(pentaho.type.changes.TransactionScope) : any} fun - The function to call within the scope.
     * The function is called with the `this` context specified in argument `ctx`.
     * The return value of `fun` is returned back from this method.
     *
     * @param {Object} [ctx] - The `this` context in which to call `fun`.
     * When unspecified, the function will have a `null` this.
     *
     * @return {any} The value returned by `fun`.
     *
     * @throws {Error} Any error thrown from within`fun`.
     */
    using: function(fun, ctx) {
      try {
        return fun.call(ctx, this);
      } finally {
        this.exit();
      }
    },

    /**
     * Exits the scope.
     *
     * After this operation, the scope cannot be operated on anymore.
     * However,
     * properties like
     * [context]{@link pentaho.type.changes.AbstractTransactionScope#context} and
     * [transaction]{@link pentaho.type.changes.AbstractTransactionScope#transaction}
     * remain available for reading.
     *
     * If this method is called and the the scope has already been exited from, or
     * is not the current scope, a warning is logged,
     * unless `keyArgs.sloppy` is `true`.
     *
     * @param {Object} [keyArgs] The keyword arguments.
     * @param {boolean} [keyArgs.sloppy] Indicates that no warning should be logged
     * if this method is called when the scope has already been exited from or is not the current scope.
     *
     * @return {!pentaho.type.changes.AbstractTransactionScope} This scope.
     */
    exit: function(keyArgs) {

      if(!O.getOwn(keyArgs, "sloppy", false)) {
        var error = !this._isInside ? this._getErrorNotInside()  :
                    !this.isCurrent ? this._getErrorNotCurrent() : null;

        if(error) logger.warn(error.message);
      }

      if(this._isInside) this._exit();

      return this;
    },

    /**
     * Exits the scope locally and notifies its transaction and context.
     *
     * @private
     */
    _exit: function() {

      this._exitLocal();

      if(this.transaction) this.transaction._scopeExit();

      this.context._scopeExit();
    },

    /**
     * Exits the scope locally.
     *
     * @private
     */
    _exitLocal: function() {
      this._isInside = false;
    },

    /**
     * Exits the scope, without any warnings in case it is not inside or is not the current scope.
     *
     * This method is equivalent to calling [exit]{@link pentaho.type.changes.AbstractTransactionScope#exit}
     * with `keyArgs.sloppy` with value `true`.
     */
    dispose: function() {
      this.exit({sloppy: true});
    }
  });
});
