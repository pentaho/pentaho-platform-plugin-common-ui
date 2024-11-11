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
  "pentaho/i18n!./i18n/model",
  "./Abstract",
  "./mixins/ScaleColorDiscrete",
  "./types/LabelsOption",
  "./types/LineWidth",
  "./types/RadarShape",
  "./types/Shape"
], function(module, bundle, BaseModel, ScaleColorDiscreteModel, LabelsOption, LineWidth, RadarShape, Shape) {
  
  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [ScaleColorDiscreteModel],
      category: "circular",

      props: [
        {
          name: "category",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "list"}]
        },
        {
          name: "rows",
          modes: [{dataType: "list"}]
        },
        {
          name: "measures",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: ["number"]}],
          fields: {isRequired: true},
          ordinal: 7
        },
        {
          name: "showAxisTickLabel",
          valueType: "boolean",
          defaultValue: true
        },
        {
          name: "showArea",
          valueType: "boolean",
          defaultValue: false
        },
        {
          name: "lineWidth",
          valueType: LineWidth,
          isRequired: true,
          defaultValue: 1
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "top", "bottom", "right", "left"],
          isRequired: true,
          defaultValue: "bottom"
        },
        {
          name: "radarShape",
          valueType: RadarShape,
          isRequired: true,
          defaultValue: "polygon"
        },
        {
          name: "shape",
          valueType: Shape,
          domain: ["none", "circle", "diamond", "triangle"],
          defaultValue: "circle"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Radar})
  .configure();
});
