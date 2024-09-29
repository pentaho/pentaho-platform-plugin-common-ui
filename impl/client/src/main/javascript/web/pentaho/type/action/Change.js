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
  "pentaho/action/Base"
], function(module, ActionBase) {

  "use strict";

  /**
   * @name Change
   * @memberOf pentaho.type.action
   * @class
   * @extends pentaho.action.Base
   * @amd pentaho/type/action/Change
   * @abstract
   *
   * @classDesc The `Change` class is the abstract base class of classes that
   * describe changes in [structured value instances]{@link pentaho.type.mixins.Container}.
   *
   * @description Creates a `Change` instance.
   */
  return ActionBase.extend(module.id, /** @lends pentaho.type.action.Change# */{

    /** @inheritDoc */
    get eventName() {
      return "change";
    }

    /**
     * Gets the type of change.
     *
     * Contrast this with {@link pentaho.action.Base.id}, which globally identifies actions.
     *
     * @name type
     * @memberOf pentaho.type.action.Change#
     * @type {string}
     * @readonly
     *
     * @abstract
     */

    /**
     * Gets the transaction version of this change.
     *
     * @name transactionVersion
     * @memberOf pentaho.type.action.Change#
     * @type {number}
     * @readOnly
     * @abstract
     */

    /**
     * Applies any local primitive changes.
     *
     * @name _apply
     * @memberOf pentaho.type.action.Change#
     * @method
     * @param {pentaho.type.mixins.Container} target - The container to which changes are applied.
     * @abstract
     * @protected
     */
  });
});

