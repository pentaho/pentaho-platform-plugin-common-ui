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
  "./mixins/Trended",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, LabelsOption, TrendedModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [TrendedModel],

      v2Id: "ccc_bar",
      category: "barchart",

      props: [
        {
          name: "measures", // VISUAL_ROLE
          fields: {isRequired: true},
          ordinal: 7
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
  .localize({$type: bundle.structured.Bar})
  .configure();
});
