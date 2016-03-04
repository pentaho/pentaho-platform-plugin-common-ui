/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../abstract/model",
  "pentaho/i18n!../abstract/i18n/model",
  "../abstract/types/displayUnits"
], function(abstractModelFactory, bundle, displayUnitsFactory) {

  "use strict";

  return function(context) {

    var Abstract = context.get(abstractModelFactory);

    return Abstract.extend({
      meta: {
        id: "pentaho/visual/ccc/cartesianAbstract",
        isAbstract: true,

        props: [
          // Primary axis
          {name: "autoRange", type: "boolean", value: true},
          {name: "valueAxisLowerLimit", type: "number"},
          {name: "valueAxisUpperLimit", type: "number"},
          {
            name: "displayUnits",
            type: displayUnitsFactory,
            isRequired: true,
            value: "units_0"
          },

          // Secondary axis
          {name: "autoRangeSecondary", type: "boolean", value: true},
          {name: "valueAxisLowerLimitSecondary", type: "number"},
          {name: "valueAxisUpperLimitSecondary", type: "number"},
          {
            name: "displayUnitsSecondary",
            type: displayUnitsFactory,
            isRequired: true,
            value: "units_0"
          }
        ]
      }
    })
    .implement({meta: bundle.structured["cartesianAbstract"]});
  };
});
