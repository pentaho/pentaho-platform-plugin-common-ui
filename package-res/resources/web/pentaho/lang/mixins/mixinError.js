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
  "pentaho/util/error"
], function(utilError) {
  "use strict";

  /**
   * @name mixinDataFilter
   * @memberOf pentaho.lang.mixins.mixinDataFilter
   * @mixin
   */
  return  /** @lends pentaho.lang.mixins.mixinError# */{

    /**
     * Initializes the mixin.
     *
     * @param {!Error|pentaho.lang.UserError} error - The error of a rejected {@link pentaho.lang.ActionResult|ActionResult}.
     * @protected
     */
    _initError: function(error) {
      if(!error) throw utilError.argRequired("error");
      this._error = error;
    },

    /**
     * Gets the error that caused the {@link pentaho.lang.ActionResult|ActionResult} to be rejected.
     *
     * @type !Error|pentaho.lang.UserError
     * @readonly
     */
    get error() {
      return this._error;
    }
  };
});
