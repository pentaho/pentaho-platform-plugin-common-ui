/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

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
