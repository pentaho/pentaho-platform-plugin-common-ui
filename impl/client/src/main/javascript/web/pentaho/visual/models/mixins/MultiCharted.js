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
  "../../Model",
  "../types/MaxChartsPerRow",
  "../types/MultiChartRangeScope",
  "../types/MultiChartOverflow",
  "../types/MultiChartMax",
  "pentaho/i18n!../i18n/model"
], function(module, BaseModel, MaxChartsPerRow, MultiChartRangeScope, MultiChartOverflow, MultiChartMax, bundle) {

  "use strict";

  // TODO: should only apply when multi has a value, but Pie does multi through
  // other gembar combination other than "multi".

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,
      props: [
        {
          name: "maxChartsPerRow",
          valueType:  MaxChartsPerRow,
          isRequired: true,
          defaultValue: 3
        },
        {
          name: "multiChartMax",
          valueType:  MultiChartMax,
          isRequired: true,
          defaultValue: 50
        },
        {
          name: "multiChartRangeScope",
          valueType: MultiChartRangeScope,
          isRequired: true,
          defaultValue: "global"
        },
        {
          name: "multiChartOverflow",
          valueType: MultiChartOverflow,
          isRequired: true,
          defaultValue: "grow"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.MultiCharted})
  .configure();
});
