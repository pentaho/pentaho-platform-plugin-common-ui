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


/**
 * The Parameter Value Class
 *
 * @name ParameterValue
 * @class
 * @property {string} type The java type of the Parameter Value
 * @property {string} label The label of the Parameter Value
 * @property {boolean} selected True if the Parameter Value is selected, False otherwise
 * @property {?object} value The value of the Parameter Value
 */
define([], function () {
  return function () {
    return {
      type: undefined,
      label: undefined,
      selected: false,
      value: undefined
    };
  }
});
