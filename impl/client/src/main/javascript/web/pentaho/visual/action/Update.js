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
  "./Base",
  "pentaho/util/object"
], function(module, BaseAction, O) {

  "use strict";

  /**
   * @name Update
   * @memberOf pentaho.visual.action
   * @class
   * @extends pentaho.visual.action.Base
   *
   * @amd pentaho/visual/action/Update
   *
   * @classDesc The `visual.action.Update` class is the class of actions which
   * represent an [IView]{@link pentaho.visual.IView} being updated.
   *
   * The update action is [asynchronous]{@link pentaho.action.Base.isSync}.
   *
   * @description Creates an update action instance given its specification.
   * @param {pentaho.visual.action.spec.IUpdate} [spec] An update action specification.
   * @constructor
   */
  return BaseAction.extend(module.id, {

    constructor: function(spec) {
      /**
       * Gets the complex changeset describing the model changes since the last update execution, if any.
       *
       * When `null`, it indicates that _everything might have changed_.
       *
       * @name changeset
       * @memberOf pentaho.visual.action.Update#
       * @type {?pentaho.type.action.ComplexChangeset}
       */
      O.setConst(this, "changeset", (spec && spec.changeset) || null);
    },

    // region serialization
    /** @inheritDoc */
    _fillSpec: function(spec) {

      this.base(spec);

      if(this.changeset) {
        spec.changeset = this.changeset;
      }
    }
    // endregion
  }, /** @lends pentaho.visual.action.Update */{
    /** @inheritDoc */
    get id() {
      return module.id;
    },

    /** @inheritDoc */
    get isSync() {
      return false;
    }
  });
});
