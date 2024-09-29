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
  "./Abstract",
  "./types/DisplayUnits",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, DisplayUnits, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,

      props: [
        // Primary axis
        {name: "autoRange", valueType: "boolean", defaultValue: true},
        {name: "valueAxisLowerLimit", valueType: "number"},
        {name: "valueAxisUpperLimit", valueType: "number"},
        {
          name: "displayUnits",
          valueType: DisplayUnits,
          isRequired: true,
          defaultValue: "units_0"
        },

        // Secondary axis
        {name: "autoRangeSecondary", valueType: "boolean", defaultValue: true},
        {name: "valueAxisLowerLimitSecondary", valueType: "number"},
        {name: "valueAxisUpperLimitSecondary", valueType: "number"},
        {
          name: "displayUnitsSecondary",
          valueType: DisplayUnits,
          isRequired: true,
          defaultValue: "units_0"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.CartesianAbstract})
  .configure();
});
