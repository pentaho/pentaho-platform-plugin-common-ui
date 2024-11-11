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
  "./mixins/MultiCharted",
  "./mixins/ScaleColorDiscrete",
  "./types/TreemapLayoutMode",
  "./types/LabelsOption"
], function (module, bundle, BaseModel, MultiChartedModel, ScaleColorDiscreteModel, TreemapLayoutMode, LabelsOption) {
  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [MultiChartedModel, ScaleColorDiscreteModel],

      category: "misc2",

      // Properties
      props: [
        // Visual role properties
        {
          name: "rows",
          modes: [{dataType: "list"}],
          fields: {isRequired: true}
        },
        {
          name: "size",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          ordinal: 7
        },
        {
          name: "multi",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "list"}],
          ordinal: 10
        },
        //End Visual Roles
        {
          name: "treemapLayoutMode",
          valueType: TreemapLayoutMode,
          isRequired: true,
          defaultValue: "squarify"
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "center"],
          isApplicable: __hasFieldsSize,
          isRequired: true,
          defaultValue: "none"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Treemap})
  .configure();

  function __hasFieldsSize() {
    return this.size.hasFields;
  }
});
