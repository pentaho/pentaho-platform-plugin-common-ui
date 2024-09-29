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
  "./PointAbstract",
  "./_trends"
], function(module, BaseView) {

  "use strict";

  // "pentaho/visual/models/LineAbstract"

  return BaseView.extend(module.id, {
    _cccClass: "LineChart",

    _supportsTrends: true,

    _configureOptions: function() {

      this.base();

      var options = this.options;

      var shape = this.model.shape;
      if(shape && shape === "none") {
        options.dotsVisible = false;
      } else {
        options.dotsVisible = true;
        options.dot_shape = shape;
      }
    }
  })
  .implement(module.config);
});
