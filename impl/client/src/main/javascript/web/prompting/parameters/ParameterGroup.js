/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/



/**
 * The Parameter Group Class
 *
 * @name ParameterGroup
 * @class
 * @property {string} name The name of the group
 * @property {string} label The label of the group
 * @property {Array|Parameter} parameters The array of parameters within this group
 */
define([], function(){
  return function(){
    return {
      name: undefined,
      label: undefined,
      parameters: []
    };
  }
});
