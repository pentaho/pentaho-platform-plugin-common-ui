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

define(function() {

  "use strict";

  // This module contains code that needs to be accessible to both Transaction and AbstractTransactionScope.

  /**
   * The ambient/current transaction, if any, or `null`.
   *
   * @type {pentaho.type.action.Transaction}
   */
  var __txnCurrent = null;

  /**
   * The stack of transaction scopes.
   *
   * @type {Array.<pentaho.type.action.AbstractTransactionScope>}
   * @readOnly
   */
  var __txnScopes = [];

  return {
    /**
     * Gets the ambient transaction, if any, or `null`.
     *
     * @type {pentaho.type.action.Transaction}
     * @readOnly
     */
    get current() {
      return __txnCurrent;
    },

    get currentScope() {
      var scopes = __txnScopes;
      return scopes.length ? scopes[scopes.length - 1] : null;
    },

    exitCurrent: function() {
      // Local-exit all scopes of the exiting transaction.
      // Null scopes or scopes of other txns remain non-exited.
      var txnCurrent = __txnCurrent;

      __txnCurrent = null;

      // Initial scope must be a transaction scope.
      var scopes = __txnScopes;
      var i = scopes.length;
      while(i--) {
        var scope = scopes[i];
        if(scope.transaction === txnCurrent) {
          scopes.splice(i, 1);
          scope.__exitLocal();
          if(scope.isRoot)
            break;
        }
      }
    },

    /**
     * Called by a scope to make it become the new ambient scope.
     *
     * @param {pentaho.type.action.AbstractTransactionScope} scopeEnter - The new ambient scope.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.action.AbstractTransactionScope
     */
    enterScope: function(scopeEnter) {

      __txnScopes.push(scopeEnter);

      __setCurrent(scopeEnter.transaction);
    },

    /**
     * Called by a scope to stop being the current scope.
     *
     * @private
     * @internal
     *
     * @see pentaho.type.action.AbstractTransactionScope#exit
     */
    exitScope: function() {

      __txnScopes.pop();

      var scopeResume = this.currentScope;

      __setCurrent(scopeResume && scopeResume.transaction);
    }
  };

  /**
   * Sets the new ambient transaction.
   *
   * @param {pentaho.type.action.Transaction} txnNew - The new ambient transaction.
   *
   * @private
   * @internal
   */
  function __setCurrent(txnNew) {
    var txnExit = __txnCurrent;
    if(txnExit !== txnNew) {
      if(txnExit) txnExit.__exitingAmbient();
      __txnCurrent = txnNew;
      if(txnNew) txnNew.__enteringAmbient();
    }
  }
});
