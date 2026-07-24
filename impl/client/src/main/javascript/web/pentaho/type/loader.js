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


define([
  "./_baseLoader",

  // Pre-load standard types.
  "./standard"
], function(baseLoader) {

  "use strict";

  /**
   * The global _Type API_ loader instance.
   *
   * Loading this module also pre-loads all standard _Type API_ types.
   *
   * @name loader
   * @type {pentaho.type.ILoader}
   * @memberOf pentaho.type
   */

  return baseLoader;
});
