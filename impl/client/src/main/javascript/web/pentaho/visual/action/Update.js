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
  "./Base"
], function(module, BaseAction) {

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
   * The update action is [asynchronous]{@link pentaho.type.action.BaseType#isSync}.
   *
   * @description Creates an update action instance given its specification.
   * @param {pentaho.visual.action.spec.IBase} [spec] A base action specification.
   * @constructor
   */
  return BaseAction.extend(module.id, {
    get type() {
      return module.id;
    }
  }, {
    get isSync() {
      return false;
    }
  });
});
