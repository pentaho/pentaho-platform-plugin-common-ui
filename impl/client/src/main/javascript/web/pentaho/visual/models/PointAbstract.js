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
  "./CategoricalContinuousAbstract",
  "./types/LabelsOption",
  "./mixins/MultiCharted",
  "./mixins/Interpolated",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, LabelsOption, MultiChartedModel, InterpolatedModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,
      mixins: [MultiChartedModel, InterpolatedModel],
      props: [
        {
          name: "measures", // VISUAL_ROLE
          fields: {isRequired: true},
          ordinal: 7
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
  .localize({$type: bundle.structured.PointAbstract})
  .configure();
});
