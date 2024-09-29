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
   * @name pentaho.type.Boolean
   * @class
   * @extends pentaho.type.Simple
   * @amd pentaho/type/Boolean
   *
   * @classDesc The class of boolean values.
   *
   * @description Creates a boolean instance.
   */

  return Simple.extend(/** @lends pentaho.type.Boolean# */{
    /**
     * Gets the underlying boolean primitive value of the value.
     * @name pentaho.type.Boolean#value
     * @type boolean
     * @readonly
     */

    $type: /** @lends pentaho.type.BooleanType# */{
      id: module.id,
      cast: Boolean
    }
  })
  .localize({$type: bundle.structured.Boolean})
  .configure();
});
