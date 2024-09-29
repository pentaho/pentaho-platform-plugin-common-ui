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
  "./ModelChangedError",
  "pentaho/type/ValidationError"
], function(module, ActionTargetMixin, ModelChangedError, ValidationError) {

  /**
   * @name UpdateExecution
   * @memberOf pentaho.visual.action
   * @class
   * @extends pentaho.action.impl.Target.ActionExecution
   *
   * @classDesc The execution class for an
   * [Update]{@link pentaho.visual.action.Update} action in a
   * [Model]{@link pentaho.visual.Model}.
   *
   * Use the [assertModelUnchanged]{@link pentaho.visual.action.UpdateExecution#assertModelUnchanged} method
   * during the update `do` phase to throw an error
   * in case the target model has changed since this update execution has started.
   *
   * @description Creates an update action execution instance for a given update action and model.
   *
   * @constructor
   * @param {pentaho.visual.action.Update} action - The update action.
   * @param {pentaho.visual.Model} view - The target model.
   */
  var UpdateExecution =
  ActionTargetMixin.ActionExecution.extend(module.id, /** @lends pentaho.visual.action.UpdateExecution# */{

    /**
     * Throws an error when the target model has changed since this update execution has started.
     *
     * @throws {pentaho.visual.action.ModelChangedError} When the model has changed since this update execution
     * has started.
     */
    assertModelUnchanged: function() {
      if(this.target.isDirtyNew) {
        throw new ModelChangedError();
      }
    },

    /** @inheritDoc */
    _validate: function() {

      var errors = this.base();
      if(errors === null) {

        errors = this.target.validate();
        if(errors !== null) {
          errors = [new ValidationError("Model is invalid:\n - " + errors.join("\n - "))];
        }
      }

      return errors;
    }
  });

  return UpdateExecution;
});
