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
  "../types/TrendType",
  "../types/LineWidth",
  "pentaho/i18n!../i18n/model"
], function(module, BaseModel, TrendType, LineWidth, bundle) {

  "use strict";

  // Used by: Line, Bar, Scatter

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,
      props: [
        {
          name: "trendType",
          valueType: TrendType,
          isRequired: true,
          defaultValue: "none"
        },
        {
          name: "trendName",
          valueType: "string",
          isApplicable: __isApplicableTrend
        },
        {
          name: "trendLineWidth",
          valueType: LineWidth,
          isApplicable: __isApplicableTrend,
          isRequired: true,
          defaultValue: 1
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Trended})
  .configure();

  function __isApplicableTrend() {
    /* jshint validthis:true */
    return this.trendType !== "none";
  }
});
