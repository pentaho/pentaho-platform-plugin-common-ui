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
   * @name ActionResult
   * @class
   * @memberOf pentaho.lang
   * @extends pentaho.lang.Base
   */
  var ActionResult = Base.extend("pentaho.lang.ActionResult", /** @lends pentaho.lang.ActionResult# */{
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

    get value() {
      return this._value;
    },

    get error() {
      return this._error;
    },

    get isCanceled() {
      var error = this._error;
      return error != null && error instanceof UserError;
    },

    get isFailed() {
      var error = this._error;
      return error != null && !(error instanceof UserError);
    },

    //TODO: getters for isFulfilled and isRejected
    get isFulfilled(){
      return !this._error;
    },

    get isRejected(){
      return !!this._error;
    }
  }, {
    fulfill: function(value) {
      return new ActionResult(value);
    },
    reject: function(error) {
      return new ActionResult(null, error || new Error("failed"));
    }
  });

  return ActionResult;
});
