/*!
 * Copyright 2018 - 2019 Hitachi Vantara. All rights reserved.
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
  "pentaho/lang/UserError"
], function(module, UserError) {

  /**
   * @classDesc The `ModelChangedError` class is a user error that signals the
   * inability of a view to proceed an operation due to the associated model having changed in between.
   *
   * An instance of this error may be thrown from an [Update:{do}]{@link pentaho.visual.action.Update} listener,
   * to signal that a new update execution should be performed with the same changes.
   *
   * Additionally, this error can be used by a [Select]{@link pentaho.visual.action.Select} or
   * [Execute]{@link pentaho.visual.action.Execute} action execution to indicate that the action
   * cannot be performed when the model has changed since the last update execution.
   *
   * @name ModelChangedError
   * @memberOf pentaho.visual.action
   * @class
   * @extends pentaho.lang.UserError
   *
   * @description Creates a model changed error object.
   * @constructor
   */

  return UserError.extend(module.id, {
    constructor: function() {
      this.base("Model changed.");
    },

    /**
     * Gets the name of the error.
     *
     * The name of this error is the value of
     * [WellKnownErrorNames.modelChanged]{@link pentaho.visual.action.WellKnownErrorNames.modelChanged}.
     *
     * @type {string}
     * @readonly
     * @default "model-changed"
     * @override
     */
    get name() {
      return "model-changed";
    }
  });
});
