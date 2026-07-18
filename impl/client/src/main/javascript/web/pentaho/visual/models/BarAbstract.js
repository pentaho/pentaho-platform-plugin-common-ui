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
  "./CategoricalContinuousAbstract",
  "./mixins/MultiCharted",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, MultiChartedModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [MultiChartedModel],
      isAbstract: true,
      props: [
        {
          name: "rows", // VISUAL_ROLE
          modes: [
            {dataType: "list"}
          ]
        }
      ]
    }
  })
  .localize({$type: bundle.structured.BarAbstract})
  .configure();
});
