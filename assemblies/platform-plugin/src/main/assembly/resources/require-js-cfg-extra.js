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

// Use the server platform i18n service.
(function() {
  var packageDefs = requireCfg.packages;
  var count = packageDefs.length;
  for(var i = 0; i < count; i++) {
    if(packageDefs[i].name === "pentaho/i18n") {
      packageDefs[i].main = "serverService";
      break;
    }
  }
})();

