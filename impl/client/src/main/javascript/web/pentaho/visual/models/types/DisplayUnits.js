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
  "pentaho/type/String",
  "pentaho/type/mixins/Enum",
  "pentaho/i18n!../i18n/model"
], function(module, PentahoString, EnumMixin, bundle) {

  "use strict";

  return PentahoString.extend({
    $type: {
      id: module.id,
      mixins: [EnumMixin],
      domain: ["units_0", "units_2", "units_3", "units_4", "units_5", "units_6"],

      scaleFactorOf: function(displayUnits) {
        if(displayUnits) {
          var match = displayUnits.match(/^UNITS_(\d+)$/i);
          if(match) {
            // units_0 -> 1
            // units_1 -> 100
            // units_2 -> 1000
            // ...
            var exponent = +match[1]; // >= 0  // + <=> Number( . )  conversion
            if(exponent > 0) return Math.pow(10, exponent); // >= 100
          }
        }

        return 1;
      }
    }
  })
  .localize({$type: bundle.structured.DisplayUnits})
  .configure();
});
