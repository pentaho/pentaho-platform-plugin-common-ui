/*!
 * Copyright 2019 Hitachi Vantara. All rights reserved.
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
  "./Base"
], function(module, ActionBase) {

  "use strict";

  /**
   * @name Interaction
   * @memberOf pentaho.visual.action
   * @class
   * @extends pentaho.visual.action.Base
   * @abstract
   *
   * @amd pentaho/visual/action/Interaction
   *
   * @classDesc The `visual.action.Interaction` class is the base class of the actions
   * which originate from the user directly interacting with the view.
   *
   * Interaction actions cannot be executed if the associated model is
   * [isDirty]{@link pentaho.visual.base.Model#isDirty}.
   *
   * @description Creates an interaction instance given its specification.
   * @param {pentaho.visual.action.spec.IInteraction} [spec] An interaction specification.
   * @constructor
   */

  return ActionBase.extend(module.id);
});
