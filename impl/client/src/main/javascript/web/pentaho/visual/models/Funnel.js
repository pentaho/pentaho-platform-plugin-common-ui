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
  "./types/SliceOrder",
  "./types/LabelsOption"
], function(module, bundle, BaseModel, ScaleColorDiscreteModel, SliceOrder, LabelsOption) {
  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [ScaleColorDiscreteModel],
      category: "funnelchart",

      props: [
        // VISUAL_ROLE
        {
          name: "rows",
          modes: {dataType: "list"},
          fields: {isRequired: true}
        },
        {
          name: "measures",
          base: "pentaho/visual/role/Property",
          modes: {dataType: "number"},
          fields: {isRequired: true},
          ordinal: 7
        },
        // End VISUAL_ROLE

        // Reusing the already existing ordering
        {
          name: "order",
          valueType: SliceOrder,
          domain: ["bySizeDescending", "bySizeAscending"],
          isRequired: true,
          defaultValue: "bySizeDescending"
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["inside", "insideRight", "insideLeft", "left", "right",
            "topLeft", "bottomLeft", "topRight", "bottomRight"],
          isRequired: true,
          defaultValue: "inside"

        }
      ]
    }
  })
  .localize({$type: bundle.structured.Funnel})
  .configure();
});
