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