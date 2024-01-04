/*!
 * Copyright 2023 Hitachi Vantara. All rights reserved.
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
  "./types/SliceOrder",
  "./types/LabelsOption"
], function(module, bundle, BaseModel, ScaleColorDiscreteModel, SliceOrder, LabelsOption) {
  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [ScaleColorDiscreteModel],
      category: "funnelchart",

      props: [
        // VISUAL_ROLE
        {
          name: "rows",
          modes: {dataType: "list"},
          fields: {isRequired: true}
        },
        {
          name: "measures",
          base: "pentaho/visual/role/Property",
          modes: {dataType: "number"},
          fields: {isRequired: true},
          ordinal: 7
        },
        // End VISUAL_ROLE

        // Reusing the already existing ordering
        {
          name: "order",
          valueType: SliceOrder,
          domain: ["bySizeDescending", "bySizeAscending"],
          isRequired: true,
          defaultValue: "bySizeDescending"
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["inside", "insideRight", "insideLeft", "left", "right",
            "topLeft", "bottomLeft", "topRight", "bottomRight"],
          isRequired: true,
          defaultValue: "inside"

        }
      ]
    }
  })
  .localize({$type: bundle.structured.Funnel})
  .configure();
});
