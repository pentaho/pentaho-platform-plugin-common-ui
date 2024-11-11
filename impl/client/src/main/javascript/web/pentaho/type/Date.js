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
  "pentaho/util/date",
  "pentaho/i18n!types"
], function(module, Simple, dateUtil, bundle) {

  "use strict";

  /**
   * @name pentaho.type.Date
   * @class
   * @extends pentaho.type.Simple
   * @amd pentaho/type/Date
   *
   * @classDesc The class of date values.
   *
   * @description Creates a date instance.
   * @constructor
   * @param {pentaho.type.spec.IDate|Date|string} [spec] A date specification.
   */
  return Simple.extend(/** @lends pentaho.type.Date# */{
    /**
     * Gets the underlying `Date` object of the date value.
     * @name pentaho.type.Date#value
     * @type {Date}
     * @readonly
     */

    /** @inheritDoc */
    get $key() {
      // Make sure to include milliseconds!
      return this.value.toISOString();
    },

    // region serialization
    /** @inheritDoc */
    _toJSONValue: function(keyArgs) {
      // A string in a format based upon a simplification of the ISO-8601 Extended Format,
      // as defined by [ECMA-262]{@link http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15}.
      return this.value.toJSON();
    },
    // endregion

    $type: /** @lends pentaho.type.DateType# */{
      id: module.id,

      cast: function(v) {
        return dateUtil.parseDateEcma262v7(v);
      },

      /**
       * Gets a value that indicates if this is a continuous type.
       *
       * The {@link pentaho.type.Date} type is continuous.
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
  .localize({$type: bundle.structured.Date})
  .configure();
});
