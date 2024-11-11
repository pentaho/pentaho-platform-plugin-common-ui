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
  "pentaho/type/String",
  "pentaho/type/mixins/Enum",
  "pentaho/i18n!../i18n/model"
], function(module, PentahoString, EnumMixin, bundle) {

  "use strict";

  return PentahoString.extend({
    $type: {
      id: module.id,
      mixins: [EnumMixin],
      domain: [
        "none", "center",                 // all (HeatGrid, Sunburst)
        "insideEnd", "insideBase",        // StackedBar, NormalizedBar (vertical and horizontal)
        "outsideEnd",                     // Bar, HorizontalBar, BarLine
        "left", "right", "top", "bottom", // Line, MetricDot, StackedArea
        "outside", "inside",               // Pie
        "insideRight", "insideLeft", "topLeft", "bottomLeft", "topRight", "bottomRight" //Funnel

      ]
    }
  })
  .localize({$type: bundle.structured.LabelsOption})
  .configure();
});
