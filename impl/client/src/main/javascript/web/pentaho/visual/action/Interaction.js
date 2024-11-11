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
   * [isDirty]{@link pentaho.visual.Model#isDirty}.
   *
   * @description Creates an interaction instance given its specification.
   * @param {pentaho.visual.action.spec.IInteraction} [spec] An interaction specification.
   * @constructor
   */

  return ActionBase.extend(module.id);
});
