/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
    "./InteractionExecution",
    "./ModelChangedError"
], function(module, InteractionExecution, ModelChangedError) {

    /**
     * @name MessageExecution
     * @memberOf pentaho.visual.action
     * @class
     * @extends pentaho.action.impl.Target.ActionExecution
     *
     * @classDesc The execution class for an
     * [Update]{@link pentaho.visual.action.Update} action in a
     * [Model]{@link pentaho.visual.Model}.
     *
     * Use the [assertModelUnchanged]{@link pentaho.visual.action.MessageExecution#assertModelUnchanged} method
     * during the update `do` phase to throw an error
     * in case the target model has changed since this update execution has started.
     *
     * @description Creates an update action execution instance for a given update action and model.
     *
     * @constructor
     * @param {pentaho.visual.action.Update} action - The update action.
     * @param {pentaho.visual.Model} view - The target model.
     */
    var MessageExecution =
        InteractionExecution.extend(module.id, /** @lends pentaho.visual.action.MessageExecution# */{

            /**
             * Reject when the target model has changed since this update execution has started.
             *
             * @throws {pentaho.visual.action.ModelChangedError} When the model has changed since this update execution
             * has started.
             */
            _onPhaseInit: function() {
                if(this.target.isDirtyNew) {
                    this.reject(new ModelChangedError());
                    throw new ModelChangedError();
                }
            },

            _validate: function() {
                var errors;
                if(this.target.isDirtyNew) {
                    errors = [new ModelChangedError()];
                }
                return errors;
            }
        });

    return MessageExecution;
});
