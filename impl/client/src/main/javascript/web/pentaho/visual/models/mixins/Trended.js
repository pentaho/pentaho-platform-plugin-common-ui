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
  .configure({$type: module.config});

  function __isApplicableTrend() {
    /* jshint validthis:true */
    return this.trendType !== "none";
  }
});
