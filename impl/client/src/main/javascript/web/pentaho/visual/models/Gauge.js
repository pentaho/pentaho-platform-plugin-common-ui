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
  "./Abstract",
  "./mixins/ScaleColorDiscrete",
  "./mixins/ScaleColorContinuous",
  "pentaho/i18n!./i18n/model"
], function (module, BaseModel, ScaleColorDiscreteModel, ScaleColorContinuousModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [ScaleColorDiscreteModel, ScaleColorContinuousModel],
      category: "misc2",

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
        {
          name: "labelsOption",
          isApplicable: false
        },
        // End VISUAL_ROLE
        {
          name: "useMeasureColors",
          valueType: "boolean",
          isRequired: true,
          defaultValue: false
        },
        {
          name: "paletteQuantitative",
          isApplicable: __useMeasureColors
        },
        {
          name: "pattern",
          isApplicable: __useMeasureColors,
          domain: ["3_color", "5_color"],
          defaultValue: "3_color"
        },
        {
          name: "colorSet",
          isApplicable: __useMeasureColors
        },
        {
          name: "reverseColors",
          isApplicable: __useMeasureColors
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Gauge})
  .configure();

  function __useMeasureColors() {
    return this.useMeasureColors;
  }
});
