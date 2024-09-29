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
  "./Simple",
  "pentaho/i18n!types"
], function(module, Simple, bundle) {

  "use strict";

  /**
   * @name pentaho.type.Number
   * @class
   * @extends pentaho.type.Simple
   * @amd pentaho/type/Number
   *
   * @classDesc The class of number values.
   *
   * @description Creates a number instance.
   */
  return Simple.extend(/** @lends pentaho.type.Number# */{
    /**
     * Gets the underlying number primitive of the value.
     * @name pentaho.type.Number#value
     * @type number
     * @readonly
     */

    $type: /** @lends pentaho.type.NumberType# */{
      id: module.id,
      cast: __toNumber,

      /**
       * Gets a value that indicates if this is a continuous type.
       *
       * The {@link pentaho.type.Number} type is continuous.
       *
       * @type {boolean}
       * @readOnly
       * @override
       */
      get isContinuous() {
        return true;
      }
    }
  })
  .localize({$type: bundle.structured.Number})
  .configure();

  function __toNumber(v) {
    v = +v;
    return isNaN(v) ? null : v;
  }
});
