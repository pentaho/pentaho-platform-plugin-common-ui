/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/


define([
  "pentaho/module!_",
  "./BarAbstract",
  "./types/LabelsOption",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, LabelsOption, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      v2Id: "ccc_horzbarstacked",
      category: "horzbarchart",

      props: [
        {
          name: "measures", // VISUAL_ROLE
          fields: {isRequired: true}
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "center", "insideEnd", "insideBase"],
          isRequired: true,
          defaultValue: "none"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.BarStackedHorizontal})
  .configure();
});
