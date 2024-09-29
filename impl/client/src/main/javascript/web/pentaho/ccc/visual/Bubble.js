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
  "./MetricPointAbstract"
], function(module, BaseView) {

  "use strict";

  // "pentaho/visual/models/Bubble"

  return BaseView.extend(module.id, {
    _options: {
      sizeAxisUseAbs: false
    },

    /* Override Default map */
    _roleToCccRole: {
      "multi": "multiChart",
      "rows": "category",
      "x": "x",
      "y": "y",
      "size": "size",
      "color": "color"
    },

    _configureOptions: function() {

      this.base();

      /* jshint laxbreak:true*/
      // ~ DOT SIZE
      this.options.axisOffset = this.model.size.hasFields
        ? (1.1 * this.options.sizeAxisRatio / 2) // Axis offset like legacy analyzer
        : 0;
    }
  })
  .implement(module.config);
});
