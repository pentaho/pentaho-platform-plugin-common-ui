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
  "pentaho/lang/UserError"
], function(module, UserError) {

  "use strict";

  /**
   * @classDesc The base class of errors associated with [values]{@link pentaho.type.Value} validation.
   *
   * @name ValidationError
   * @memberOf pentaho.type
   * @class
   * @extends pentaho.lang.UserError
   * @see pentaho.type.Value#validate
   *
   * @description Creates a validation error object.
   * @constructor
   * @param {string} message - The error message.
   */

  return UserError.extend(module.id, /** @lends pentaho.type.ValidationError# */{
    /**
     * The name of the type of error.
     *
     * @type {string}
     * @readonly
     * @default "ValidationError"
     */
    get name() {
      return "ValidationError";
    }
  });
});
