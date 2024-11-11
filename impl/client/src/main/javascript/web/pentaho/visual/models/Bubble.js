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
  "./MetricPointAbstract",
  "./mixins/ScaleSizeContinuous",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, ScaleSizeContinuousModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [ScaleSizeContinuousModel],

      v2Id: "ccc_scatter",

      props: [
        {
          name: "size", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "number"}
          ],
          ordinal: 7
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Bubble})
  .configure();
});
