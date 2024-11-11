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
   * @name pentaho.type.String
   * @class
   * @extends pentaho.type.Simple
   * @amd pentaho/type/String
   *
   * @classDesc The class of textual values.
   *
   * @description Creates a string instance.
   */
  return Simple.extend({
    /**
     * Gets the underlying string primitive value of the value.
     * @name pentaho.type.String#value
     * @type string
     * @readonly
     */

    $type: {
      id: module.id,
      cast: String
    }
  })
  .localize({$type: bundle.structured.String})
  .configure();
});
