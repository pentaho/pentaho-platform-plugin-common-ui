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
  "./pointAbstract",
  "pentaho/i18n!./i18n/model",
  "./types/shape",
  "./types/lineWidth",
  "./mixins/trended"
], function(module, baseModelFactory, bundle, shapeFactory, lineWidthFactory, trendedFactory) {

  "use strict";

  return function(context) {

    var BaseModel = context.get(baseModelFactory);

    return BaseModel.extend({
      type: {
        id: module.id,
        mixins: [trendedFactory],

        v2Id: "ccc_line",
        category: "linechart",
        defaultView: "pentaho/ccc/visual/line",
        props: [
          {
            name: "lineWidth",
            valueType: lineWidthFactory,
            isRequired: true,
            defaultValue: 1
          },
          {
            name: "shape",
            valueType: shapeFactory,
            isRequired: true,
            defaultValue: "circle"
          }
        ]
      }
    })
    .implement({type: bundle.structured.line});
  };
});
