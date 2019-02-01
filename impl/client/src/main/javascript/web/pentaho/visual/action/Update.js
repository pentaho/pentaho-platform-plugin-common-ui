/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "./Base",
  "pentaho/util/object"
], function(module, BaseAction, O) {

  "use strict";

  /**
   * @name Update
   * @memberOf pentaho.visual.action
   * @class
   * @extends pentaho.visual.action.Base
   *
   * @amd pentaho/visual/action/Update
   *
   * @classDesc The `visual.action.Update` class is the class of actions which
   * represent a [View]{@link pentaho.visual.base.View} being updated.
   *
   * The update action is [asynchronous]{@link pentaho.action.Base.isSync}.
   *
   * @description Creates an update action instance given its specification.
   * @param {pentaho.visual.action.spec.IUpdate} [spec] An update action specification.
   * @constructor
   */
  return BaseAction.extend(module.id, {

    constructor: function(spec) {
      /**
       * Gets the complex changeset describing the model changes since the last update execution, if any.
       *
       * When `null`, it indicates that _everything might have changed_.
       *
       * @name changeset
       * @memberOf pentaho.visual.action.Update#
       * @type {?pentaho.type.action.ComplexChangeset}
       */
      O.setConst(this, "changeset", (spec && spec.changeset) || null);
    },

    // region serialization
    /** @inheritDoc */
    _fillSpec: function(spec) {

      this.base(spec);

      if(this.changeset) {
        spec.changeset = this.changeset;
      }
    }
    // endregion
  }, /** @lends pentaho.visual.action.Update */{
    /** @inheritDoc */
    get id() {
      return module.id;
    },

    /** @inheritDoc */
    get isSync() {
      return false;
    }
  });
});
