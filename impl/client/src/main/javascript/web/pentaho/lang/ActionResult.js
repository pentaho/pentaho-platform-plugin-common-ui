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
   * When successful, an _action_ can return a value that represents its final state or `undefined`.
   * For example, if you do a Google search using an
   * {@link pentaho.visual.base.model#executeAction|executeAction},
   * there is no value to be returned.
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
     * @param {!string|Error|pentaho.lang.UserError} error - The error that contains the reason why
     * the _action_ was rejected.
     */
    constructor: function(value, error) {
      if(error) {
        if(typeof error === "string") {
          error = new UserError(error);
        } else if(!(error instanceof Error)) {
          throw utilError.argInvalidType("error", ["string", "Error"], typeof error);
        }
        this.__value = undefined;
        this.__error = error;
      } else {
        this.__value = value;
        this.__error = null;
      }
    },

    /**
     * Gets the value of the `ActionResult`.
     *
     * @type {?object}
     * @readonly
     */
    get value() {
      return this.__value;
    },

    /**
     * Gets the error of the `ActionResult`.
     *
     * @type {?Error|pentaho.lang.UserError}
     * @readonly
     */
    get error() {
      return this.__error;
    },

    /**
     * Gets a value indicating if the `ActionResult` represents an _action_ that has been canceled.
     *
     * @type {!boolean}
     * @readonly
     */
    get isCanceled() {
      var error = this.__error;
      return error != null && error instanceof UserError;
    },

    /**
     * Gets a value indicating if the `ActionResult` represents an _action_ that has failed.
     *
     * @type {!boolean}
     * @readonly
     */
    get isFailed() {
      var error = this.__error;
      return error != null && !(error instanceof UserError);
    },

    /**
     * Gets a value indicating if the `ActionResult` represents a successful _action_.
     *
     * @type {!boolean}
     * @readonly
     */
    get isFulfilled() {
      return !this.__error;
    },

    /**
     * Gets a value indicating if the `ActionResult` represents an _action_ that failed or that was canceled.
     *
     * @type {!boolean}
     * @readonly
     */
    get isRejected() {
      return !!this.__error;
    }
  }, /** @lends pentaho.lang.ActionResult */{

    /**
     * Creates an action result that represents a successful action.
     *
     * @param {Object} [value] - The value of the successful action.
     * @return {!pentaho.lang.ActionResult} A new  action result.
     */
    fulfill: function(value) {
      return new ActionResult(value);
    },

    /**
     * Creates an action result that represents an unsuccessful action.
     *
     * @param {string|Error|pentaho.lang.UserError} [error] - The error that contains the reason why
     * the action was rejected.
     * @return {!pentaho.lang.ActionResult} A new action result.
     */
    reject: function(error) {
      return new ActionResult(undefined, error || new Error("failed"));
    }
  });

  return ActionResult;
});
