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
  "./PointAbstract",
  "./types/Shape",
  "./types/LineWidth",
  "./mixins/Trended",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, Shape, LineWidth, TrendedModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      category: "linechart",
      mixins: [TrendedModel],
      isAbstract: true,

      props: [
        {
          name: "lineWidth",
          valueType: LineWidth,
          isRequired: true,
          defaultValue: 1
        },
        {
          name: "shape",
          valueType: Shape,
          isRequired: true,
          defaultValue: "circle"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.LineAbstract})
  .configure();
});
