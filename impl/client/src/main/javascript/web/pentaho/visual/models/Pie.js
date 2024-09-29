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
  "./types/LabelsOption",
  "./mixins/MultiCharted",
  "./mixins/ScaleColorDiscrete",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, LabelsOption, MultiChartedModel, ScaleColorDiscreteModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [MultiChartedModel, ScaleColorDiscreteModel],

      v2Id: "ccc_pie",
      category: "piechart",

      props: [
        {
          name: "rows", // VISUAL_ROLE
          modes: [
            {dataType: "list"}
          ]
        },
        {
          name: "columns", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "list"}
          ],
          ordinal: 6
        },
        {
          name: "measures", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: ["number"]}
          ],
          fields: {isRequired: true},
          ordinal: 7
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "outside", "inside"],
          isRequired: true,
          defaultValue: "outside"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Pie})
  .configure();
});
