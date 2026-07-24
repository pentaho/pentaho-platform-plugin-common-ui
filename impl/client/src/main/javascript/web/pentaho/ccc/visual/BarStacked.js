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
  "pentaho/module!_",
  "./BarAbstract"
], function(module, BaseView) {

  "use strict";

  // "pentaho/visual/models/BarStacked"

  return BaseView.extend(module.id, {
    _options: {
      stacked: true
    }
  })
  .implement(module.config);
});
