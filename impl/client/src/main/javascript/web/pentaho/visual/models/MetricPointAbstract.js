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
  "./CartesianAbstract",
  "./types/LabelsOption",
  "./mixins/ScaleColorContinuous",
  "./mixins/ScaleColorDiscrete",
  "./mixins/MultiCharted",
  "./mixins/Trended",
  "../KeyTypes",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, LabelsOption, ScaleColorContinuousModel, ScaleColorDiscreteModel,
            MultiChartedModel, TrendedModel, KeyTypes, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,

      visualKeyType: KeyTypes.dataOrdinal,

      // TODO: scaleColor... should only be applicable when color is continuous
      mixins: [TrendedModel, ScaleColorDiscreteModel, ScaleColorContinuousModel, MultiChartedModel],

      category: "scatter",

      props: [
        {
          name: "rows", // VISUAL_ROLE
          modes: [
            {dataType: "list"}
          ]
        },
        {
          name: "x", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "number"},
            {dataType: "date"}
          ],
          fields: {isRequired: true},
          ordinal: 1
        },
        {
          name: "y", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "number"},
            {dataType: "date"}
          ],
          fields: {isRequired: true},
          ordinal: 2
        },
        {
          // Modal visual role
          name: "color", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "number"},
            {dataType: "list"} // Catch-all.
          ],
          ordinal: 6
        },
        {
          name: "multi", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "list"}
          ],
          ordinal: 10
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "center", "left", "right", "top", "bottom"],
          isRequired: true,
          defaultValue: "none"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.MetricPointAbstract})
  .configure();
});
