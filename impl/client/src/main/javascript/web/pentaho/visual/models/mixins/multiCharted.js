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
  "pentaho/visual/base/model",
  "../types/maxChartsPerRow",
  "../types/multiChartRangeScope",
  "../types/multiChartOverflow",
  "pentaho/i18n!../i18n/model"
], function(module, modelFactory, maxChartsPerRowFactory, multiChartRangeScopeFactory,
            multiChartOverflowFactory, bundle) {

  "use strict";

  // TODO: should only apply when multi has a value, but Pie does multi through
  // other gembar combination other than "multi".

  return function(context) {

    var BaseModel = context.get(modelFactory);

    return BaseModel.extend({
      type: {
        id: module.id,
        isAbstract: true,
        props: [
          {
            name:  "maxChartsPerRow",
            valueType:  maxChartsPerRowFactory,
            isRequired: true,
            defaultValue: 3
          },
          {
            name: "multiChartRangeScope",
            valueType: multiChartRangeScopeFactory,
            isRequired: true,
            defaultValue: "global"
          },
          {
            name: "multiChartOverflow",
            valueType: multiChartOverflowFactory,
            isRequired: true,
            defaultValue: "grow"
          }
        ]
      }
    })
    .implement({type: bundle.structured.settingsMultiChart});
  };
});
