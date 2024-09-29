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
  "./types/DisplayUnits",
  "./types/LabelsOption",
  "./types/SliceOrder",
  "./mixins/MultiCharted",
  "./mixins/ScaleColorDiscrete",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, DisplayUnits, LabelsOption, SliceOrder, MultiChartedModel, ScaleColorDiscreteModel,
            bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [MultiChartedModel, ScaleColorDiscreteModel],
      v2Id: "ccc_sunburst",
      category: "treemapchart",

      props: [
        {
          name: "rows", // VISUAL_ROLE
          modes: [
            {dataType: "list"}
          ],
          fields: {isRequired: true}
        },
        {
          name: "size", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "number"}
          ],
          ordinal: 7
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
          name: "displayUnits",
          valueType: DisplayUnits,
          isRequired: true,
          defaultValue: "units_0"
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "center"],
          isApplicable: __hasFieldsSize,
          isRequired: true,
          defaultValue: "none"
        },
        {
          name: "emptySlicesHidden",
          valueType: "boolean",
          isRequired: true,
          defaultValue: true
        },
        {
          name: "sliceOrder",
          valueType: SliceOrder,
          isApplicable: __hasFieldsSize,
          isRequired: true,
          defaultValue: "bySizeDescending"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Sunburst})
  .configure();

  function __hasFieldsSize() {
    return this.size.hasFields;
  }
});
