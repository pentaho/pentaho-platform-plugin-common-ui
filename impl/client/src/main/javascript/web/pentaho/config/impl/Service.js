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
  "../service"
], function(globalConfigService) {

  "use strict";

  // Re-export `pentaho._core.config.Service`, already **core-bound**, as `pentaho.config.impl.Service`.
  return globalConfigService.constructor;
});
