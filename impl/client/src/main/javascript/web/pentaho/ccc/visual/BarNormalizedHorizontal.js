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
  "./BarNormalizedAbstract"
], function(module, BaseView) {

  "use strict";

  // "pentaho/visual/models/BarNormalizedHorizontal"

  return BaseView.extend(module.id, {
    _options: {
      orientation: "horizontal"
    }
  })
  .implement(module.config);
});
