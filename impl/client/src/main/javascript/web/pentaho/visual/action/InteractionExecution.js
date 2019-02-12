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
  "pentaho/action/impl/Target",
  "./ModelChangedError"
], function(module, ActionTargetMixin, ModelChangedError) {

  /**
   * @name InteractionExecution
   * @memberOf pentaho.visual.action
   * @class
   * @extends pentaho.action.impl.Target.ActionExecution
   * @private
   *
   * @classDesc The execution class for actions which arise from interaction with the view.
   *
   * Interaction actions cannot be executed if the associated model is
   * [isDirty]{@link pentaho.visual.Model#isDirty}.
   *
   * @description Creates an action execution instance for a given visual action and model.
   *
   * @constructor
   * @param {pentaho.visual.action.Base} action - The visual action.
   * @param {pentaho.visual.Model} view - The target model.
   */
  var InteractionExecution =
  ActionTargetMixin.ActionExecution.extend(module.id, /** @lends pentaho.visual.action.InteractionExecution#*/{
    /**
     * Gets the target model.
     * @name target
     * @memberOf pentaho.visual.action.InteractionExecution#
     * @type {pentaho.visual.Model}
     * @readonly
     * @override
     */

    /**
     * Gets the visual action.
     * @name action
     * @memberOf pentaho.visual.action.InteractionExecution#
     * @type {pentaho.visual.action.Base}
     * @readonly
     * @override
     */

    /** @inheritDoc */
    _onPhaseInit: function() {
      if(this.target.isDirty) {
        this.reject(new ModelChangedError());
      } else {
        this.base();
      }
    },

    /** @inheritDoc */
    _validate: function() {

      var errors = this.base();
      if(errors === null) {

        if(this.target.isDirty) {
          errors = [new ModelChangedError()];
        }
      }

      return errors;
    }
  });

  return InteractionExecution;
});