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
  "pentaho/lang/Base"
], function(module, Base) {

  return Base.extend(module.id, /** @lends pentaho.visual.scene.impl.Variable# */{

    /**
     * @alias Variable
     * @memberOf  pentaho.visual.scene.impl
     * @classDesc The `impl.Variable` class is a basic implementation of the `IVariable` interface.
     * @class
     * @implements {pentaho.visual.scene.IVariable}
     * @private
     *
     * @description Creates a variable instance having a given value and formatted value.
     * @constructor
     * @param {*} value - The value of the variable.
     * @param {?string} [formatted] - The formatted value of the variable.
     */
    constructor: function(value, formatted) {
      this.value = value;
      this.formatted = formatted !== undefined ? formatted : null;
    },

    valueOf: function() {
      return this.value;
    },

    toString: function() {
      return this.formatted;
    }
  });
});
