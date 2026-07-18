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
  "./Pie"
], function(module, BaseView) {

  "use strict";

  return BaseView.extend(module.id, {
    _configureOptions: function () {
      this.base();

      var options = this.options;
      var model = this.model;
      options.explodedSliceRadius = model.explodedSliceRadius + "%";
      options.slice_innerRadiusEx = model.sliceInnerRadius + "%";
    }
  })
  .implement(module.config);
});
