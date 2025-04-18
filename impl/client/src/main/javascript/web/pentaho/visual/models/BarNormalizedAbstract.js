/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
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
      isAbstract: true,

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
  .localize({$type: bundle.structured.BarNormalizedAbstract})
  .configure();
});
