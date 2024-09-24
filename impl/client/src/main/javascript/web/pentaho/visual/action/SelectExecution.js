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
  "./InteractionExecution"
], function(module, InteractionExecution) {

  /**
   * @name SelectExecution
   * @memberOf pentaho.visual.action
   * @class
   * @extends pentaho.visual.action.InteractionExecution
   * @private
   *
   * @classDesc The execution class for a
   * [Select]{@link pentaho.visual.action.Select} action in a
   * [Model]{@link pentaho.visual.Model}.
   *
   * @description Creates a select action execution instance for a given select action and model.
   *
   * @constructor
   * @param {pentaho.visual.action.Select} action - The select action.
   * @param {pentaho.visual.Model} view - The target model.
   */
  var SelectExecution = InteractionExecution.extend(module.id, /** @lends pentaho.visual.action.SelectExecution# */{
    /**
     * Applies the associated action's
     * [selectionMode]{@link pentaho.visual.action.Select#selectionMode}
     * function to the associated model's
     * [selectionFilter]{@link pentaho.visual.Model#selectionFilter} and
     * the action's [dataFilter]{@link pentaho.visual.action.Select#dataFilter}.
     *
     * The resulting data filter is set as the model's new `selectionFilter`.
     *
     * @return {?Promise} - The value `null`.
     * @protected
     * @override
     */
    _doDefault: function() {

      var model = this.target;

      var selectionFilter = this.action.selectionMode.call(model, model.selectionFilter, this.action.dataFilter);

      // NOTE: see related comment on AbstractModel#selectionFilter.
      model.selectionFilter = selectionFilter && selectionFilter.toDnf();

      return null;
    }
  });

  return SelectExecution;
});
