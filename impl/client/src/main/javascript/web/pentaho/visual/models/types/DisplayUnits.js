/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
  .configure({$type: module.config});
});
