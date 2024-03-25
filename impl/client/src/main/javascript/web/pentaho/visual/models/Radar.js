/*!
 * Copyright 2024 Hitachi Vantara. All rights reserved.
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
  "pentaho/i18n!./i18n/model",
  "./Abstract",
  "./mixins/ScaleColorDiscrete",
  "./types/LabelsOption",
  "./types/LineWidth",
  "./types/RadarShape",
  "./types/Shape"
], function(module, bundle, BaseModel, ScaleColorDiscreteModel, LabelsOption, LineWidth, RadarShape, Shape) {
  
  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [ScaleColorDiscreteModel],
      category: "circular",

      props: [
        {
          name: "category",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "list"}]
        },
        {
          name: "rows",
          modes: [{dataType: "list"}]
        },
        {
          name: "measures",
          base: "pentaho/visual/role/Property",
          modes: {dataType: ["number"]},
          fields: {isRequired: true},
          ordinal: 7
        },
        {
          name: "showAxisTickLabel",
          valueType: "boolean",
          defaultValue: true
        },
        {
          name: "showArea",
          valueType: "boolean",
          defaultValue: false
        },
        {
          name: "lineWidth",
          valueType: LineWidth,
          isRequired: true,
          defaultValue: 1
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "top", "bottom", "right", "left"],
          isRequired: true,
          defaultValue: "bottom"
        },
        {
          name: "radarShape",
          valueType: RadarShape,
          isRequired: true,
          defaultValue: "polygon"
        },
        {
          name: "shape",
          valueType: Shape,
          domain: ["none", "circle", "diamond", "triangle"],
          defaultValue: "circle"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Radar})
  .configure();
});
