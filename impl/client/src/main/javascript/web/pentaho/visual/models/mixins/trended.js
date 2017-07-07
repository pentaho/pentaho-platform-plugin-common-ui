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
  "../types/trendType",
  "../types/lineWidth",
  "pentaho/i18n!../i18n/model"
], function(module, modelFactory, trendTypeFactory, lineWidthFactory, bundle) {

  "use strict";

  // Used by: Line, Bar, Scatter

  return function(context) {

    var BaseModel = context.get(modelFactory);

    return BaseModel.extend({
      type: {
        id: module.id,
        isAbstract: true,
        props: [
          {
            name: "trendType",
            valueType: trendTypeFactory,
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
            valueType: lineWidthFactory,
            isApplicable: __isApplicableTrend,
            isRequired: true,
            defaultValue: 1
          }
        ]
      }
    })
    .implement({type: bundle.structured.trend});
  };

  function __isApplicableTrend() {
    /* jshint validthis:true */
    return this.trendType !== "none";
  }
});
