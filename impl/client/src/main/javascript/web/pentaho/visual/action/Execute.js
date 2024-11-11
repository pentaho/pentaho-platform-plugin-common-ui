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
  "pentaho/module!_",
  "./Interaction",
  "./mixins/Data",
  "./mixins/Positioned"
], function(module, Interaction, DataActionMixin, PositionedActionMixin) {

  "use strict";

  /**
   * @name Execute
   * @memberOf pentaho.visual.action
   * @class
   * @extends pentaho.visual.action.Base
   * @extends pentaho.visual.action.mixins.Data
   * @extends pentaho.visual.action.mixins.Positioned
   *
   * @amd pentaho/visual/action/Execute
   *
   * @classDesc The `Execute` action is a synchronous, data and positioned action that
   * is performed when the user interacts with a visual element,
   * typically by double clicking it.
   *
   * @example
   *
   * define(["pentaho/visual/action/Execute"], function(ExecuteAction) {
   *
   *   // ...
   *
   *   // Listen to the execute event
   *   model.on(ExecuteAction.id, {
   *
   *     do: function(action) {
   *
   *       var dataFilter = action.dataFilter;
   *
   *       alert("Executed on rows where " + (dataFilter && dataFilter.$contentKey));
   *
   *       // Mark action as done.
   *       action.done();
   *     }
   *   });
   *
   *   // ...
   *
   *   // Act "execute" on data rows that have "country" = "us".
   *
   *   model.act(new ExecuteAction({
   *     dataFilter: {
   *       _: "=",
   *       p: "country",
   *       v: "us"
   *     }
   *   });
   * });
   *
   * @description Creates an _execute_ action given its specification.
   * @param {pentaho.visual.action.spec.IExecute} [spec] An _execute_ action specification.
   * @constructor
   *
   * @see pentaho.visual.action.spec.IExecute
   */
  return Interaction.extend(module.id, /** @lends pentaho.visual.action.Execute# */{

  }, /** @lends pentaho.visual.action.Execute */{
    /** @inheritDoc */
    get id() {
      return module.id;
    }
  })
  .mix(DataActionMixin)
  .mix(PositionedActionMixin);
});
