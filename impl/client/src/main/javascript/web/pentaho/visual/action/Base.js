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
  "pentaho/action/Generic"
], function(module, ActionBase) {

  "use strict";

  /**
   * @name Base
   * @memberOf pentaho.visual.action
   * @class
   * @extends pentaho.action.Base
   * @abstract
   *
   * @amd pentaho/visual/action/Base
   *
   * @classDesc The `visual.action.Base` class is the base class of the actions
   * defined by the Visualization API.
   *
   * @description Creates a base action instance given its specification.
   * @param {pentaho.visual.action.spec.IBase} [spec] A base action specification.
   * @constructor
   */

  return ActionBase.extend(module.id);
});
