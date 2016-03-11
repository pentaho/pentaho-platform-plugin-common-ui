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
  "./UserError"
], function(Base, UserError) {
  "use strict";

  return Base.extend("pentaho.lang.ActionResult", /** @lends pentaho.lang.ActionResult# */{
    constructor: function(value, error) {
      this._value = value;
      this._error = error;
    },

    _value: null,
    get value() {
      return this._value;
    },

    _error: null,
    get error() {
      return this._error;
    },

    isCanceled: function() {
      var error = this._error;
      return error != null && error instanceof UserError;
    },

    isFailed: function() {
      var error = this._error;
      return error != null && !(error instanceof UserError);
    }
  });
});