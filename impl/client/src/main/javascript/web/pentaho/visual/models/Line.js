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
  "./PointAbstract",
  "./types/Shape",
  "./types/LineWidth",
  "./mixins/Trended",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, Shape, LineWidth, TrendedModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [TrendedModel],

      v2Id: "ccc_line",
      category: "linechart",
      defaultView: "pentaho/ccc/visual/Line",
      props: [
        {
          name: "lineWidth",
          valueType: LineWidth,
          isRequired: true,
          defaultValue: 1
        },
        {
          name: "shape",
          valueType: Shape,
          isRequired: true,
          defaultValue: "circle"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Line})
  .configure({$type: module.config});
});
