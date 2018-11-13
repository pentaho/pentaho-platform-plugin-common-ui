/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/lang/RuntimeError",
  "pentaho/util/arg"
], function(module, RuntimeError, arg) {

  /**
   * @classDesc The `ModelChangedError` class is a runtime error that signals the
   * inability of a view to proceed an update operation due to the associated model having changed.
   *
   * An instance of this error may be returned from one of the internal view update methods,
   * such as [_updateAll]{@link pentaho.visual.base.View#_updateAll} to control whether the update
   * operation should be retried.
   *
   * @name ModelChangedError
   * @memberOf pentaho.visual.base
   * @class
   * @extends pentaho.lang.RuntimeError
   *
   * @description Creates a state changed error object.
   * @constructor
   * @param {object} [keyArgs] The keyword arguments object.
   * @param {boolean} [keyArgs.wantUpdateRetry=false] Indicates if the current update operation should be retried.
   */

  return RuntimeError.extend(module.id, /** @lends pentaho.visual.base.ModelChangedError# */{

    constructor: function(keyArgs) {

      this.base("Model changed.");

      /**
       * Gets a value that indicates if the current update operation should be retried.
       * @type {boolean}
       * @readOnly
       */
      this.wantUpdateRetry = arg.optional(keyArgs, "wantUpdateRetry", false);
    }
  });
});
