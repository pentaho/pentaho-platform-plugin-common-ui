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
