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
  "./Base",
  "./UserError",
  "../util/error"
], function(Base, UserError, utilError) {
  "use strict";

  /**
   * @classDesc An `ActionResult` represents the result from performing an _action_.
   * 
   * ### `ActionResult` Value
   * 
   * When successful, an _action_ can return a value that represents its final state or `undefined`. For example,
   * if you do a google search using an {@link pentaho.visual.base.model#executeAction|executeAction}, there is
   * no value to be returned.
   *
   * ### `ActionResult` Error
   *
   * When an _action_ is unsuccessful, it will return an error or a string with the reason why it was rejected.
   * This can happen when an event is canceled, or the core components of that _action_ were invalid.
   *
   * If unsuccessful, the value is always `undefined`.
   *
   * @name ActionResult
   * @memberOf pentaho.lang
   *
   * @amd pentaho/lang/ActionResult
   * @class
   * @extends pentaho.lang.Base
   * 
   * @see pentaho.visual.base.model#executeAction
   * @see pentaho.visual.base.model#selectAction
   */
  var ActionResult = Base.extend("pentaho.lang.ActionResult", /** @lends pentaho.lang.ActionResult# */{

    /**
     * Creates an `ActionResult` with a given value or error.
     *
     * @constructor
     *
     * @param {?object} value - The value of a successful _action_.
     * @param {!string|Error|pentaho.lang.UserError} error - The error that contains the reason why the _action_ was rejected.
     */
    constructor: function(value, error) {
      if(error) {
        if(typeof error === "string") {
          error = new UserError(error);
        } else if(!(error instanceof Error)) {
          throw utilError.argInvalidType("error", ["string", "Error"], typeof error);
        }
        this._value = undefined;
        this._error  = error;
      } else {
        this._value = value;
        this._error = null;
      }
    },

    /**
     * Gets the value of the `ActionResult`.
     *
     * @type {?object}
     * @readonly
     */
    get value() {
      return this._value;
    },

    /**
     * Gets the error of the `ActionResult`.
     *
     * @type {?Error|pentaho.lang.UserError}
     * @readonly
     */
    get error() {
      return this._error;
    },

    /**
     * Gets a value indicating if the `ActionResult` represents an _action_ that has been canceled.
     *
     * @type {!boolean}
     * @readonly
     */
    get isCanceled() {
      var error = this._error;
      return error != null && error instanceof UserError;
    },

    /**
     * Gets a value indicating if the `ActionResult` represents an _action_ that has failed.
     *
     * @type {!boolean}
     * @readonly
     */
    get isFailed() {
      var error = this._error;
      return error != null && !(error instanceof UserError);
    },

    /**
     * Gets a value indicating if the `ActionResult` represents a successful _action_.
     *
     * @type {!boolean}
     * @readonly
     */
    get isFulfilled() {
      return !this._error;
    },

    /**
     * Gets a value indicating if the `ActionResult` represents an _action_ that failed or that was canceled.
     *
     * @type {!boolean}
     * @readonly
     */
    get isRejected() {
      return !!this._error;
    }
  }, {

    /**
     * Creates an `ActionResult` representing a successful _action_.
     *
     * @static
     *
     * @param {?object} value - The value of a successful _action_.
     * @returns {ActionResult} An `ActionResult` representing a successful _action_.
     */
    fulfill: function(value) {
      return new ActionResult(value);
    },

    /**
     * Creates an `ActionResult` representing an unsuccessful _action_.
     *
     * @static
     *
     * @param {!string|Error|pentaho.lang.UserError} error - The error that contains the reason why the _action_ was rejected.
     * @returns {ActionResult} An `ActionResult` representing an unsuccessful _action_.
     */
    reject: function(error) {
      return new ActionResult(undefined, error || new Error("failed"));
    }
  });

  return ActionResult;
});
