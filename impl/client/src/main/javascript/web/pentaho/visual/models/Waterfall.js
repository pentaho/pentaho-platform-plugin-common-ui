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
  "./BarAbstract",
  "./types/LabelsOption",
  "./types/WaterDirection",
  "pentaho/i18n!./i18n/model"
], function (module, BaseModel, LabelsOption, WaterDirection, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,

      category: "waterfallchart",

      props: [
        {
          name: "measures", // VISUAL_ROLE
          fields: { isRequired: true }
        },
        {
          name: "waterDirection",
          valueType: WaterDirection,
          isRequired: false,
          defaultValue: "up"
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "center", "insideEnd", "insideBase", "outsideEnd"],
          isRequired: true,
          defaultValue: "none"
        }
      ]
    }
  })
  .localize({ $type: bundle.structured.Waterfall })
  .configure();
});
