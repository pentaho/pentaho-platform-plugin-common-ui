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
  "pentaho/util/object",
  "pentaho/util/fun",
  "pentaho/util/logger",
  "pentaho/i18n!types"
], function(module, Simple, O, F, logger, bundle) {

  "use strict";

  var __NATIVE_CODE = "[native code]";

  var __simpleObjectNextUid = 1;
  var __OID_PROP = "__pentaho_type_ouid_" + Math.random().toString(32) + "__";
  var __DEF_OID_PROP = {
    value: "",
    configurable: true,
    writable:     true,
    enumerable:   false
  };

  /**
   * @name pentaho.type.Function
   * @class
   * @extends pentaho.type.Simple
   * @amd pentaho/type/Function
   *
   * @classDesc The class that represents primitive, JavaScript {@link function} values.
   *
   * @description Creates a function instance.
   * @constructor
   * @param {pentaho.type.spec.IFunction|function|string} [spec] A function specification.
   */
  return Simple.extend(/** @lends pentaho.type.Function# */{
    /**
     * Gets the underlying function value of the value.
     * @name pentaho.type.Function#value
     * @type function
     * @readonly
     */

    constructor: function(spec) {

      this.base(spec);

      // Reuse an existing UID mark, so that two Simple instances with the same underlying primitive value
      // are considered #equal.
      var uid = O.getOwn(this.value, __OID_PROP);
      if(uid == null) {
        // Mark value with a non-enumerable property.
        // Note that non-enumerable properties are not included by JSON.stringify.
        __DEF_OID_PROP.value = uid = String(__simpleObjectNextUid++);
        Object.defineProperty(this.value, __OID_PROP, __DEF_OID_PROP);
      }

      this.__uid = uid;
    },

    /**
     * Gets the unique key of the native function.
     *
     * The key of a value identifies it among its _peers_.
     *
     * @type {string}
     * @readonly
     */
    get $key() {
      return this.__uid;
    },

    // region serialization
    /** @inheritDoc */
    _toJSONValue: function(keyArgs) {
      var code = String(this.value);
      if(code.indexOf(__NATIVE_CODE) > 0) {
        logger.warn(bundle.structured.errors.json.cannotSerializeNativeFunction);

        // Indicate serialization failure.
        code = null;
      }

      return code;
    },
    // endregion

    $type: /** @lends pentaho.type.FunctionType# */{
      id: module.id,
      cast: F.as
    }
  })
  .localize({$type: bundle.structured.Function})
  .configure();
});
