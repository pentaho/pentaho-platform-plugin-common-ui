/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "module",
  "./metricPointAbstract",
  "pentaho/i18n!./i18n/model",
  "./mixins/scaleSizeContinuous"
], function(module, baseModelFactory, bundle, scaleSizeContinuousFactory) {

  "use strict";

  return function(context) {

    var BaseModel = context.get(baseModelFactory);

    return BaseModel.extend({
      $type: {
        id: module.id,
        mixins: [scaleSizeContinuousFactory],

        v2Id: "ccc_scatter",
        defaultView: "pentaho/ccc/visual/bubble",

        props: [
          {
            name: "size", // VISUAL_ROLE
            base: "pentaho/visual/role/property",
            levels: ["quantitative"],
            dataType: "number",
            attributes: {countMax: 1},
            ordinal: 7
          }
        ]
      }
    })
    .implement({$type: bundle.structured.bubble});
  };
});
