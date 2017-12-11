/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/i18n!./i18n/model"
], function(bundle) {

  "use strict";

  return [
    "./cartesianAbstract",
    "./types/labelsOption",
    "./mixins/scaleColorContinuous",
    "./mixins/scaleColorDiscrete",
    "./mixins/multiCharted",
    "./mixins/trended",
    "pentaho/visual/role/level",
    function(BaseModel, LabelsOption, ScaleColorContinuousModel, ScaleColorDiscreteModel,
             MultiChartedModel, TrendedModel, MeasurementLevel) {

      return BaseModel.extend({
        $type: {
          isAbstract: true,
          // TODO: scaleColor... should only be applicable when color is continuous
          mixins: [TrendedModel, ScaleColorDiscreteModel, ScaleColorContinuousModel, MultiChartedModel],

          category: "scatter",

          props: [
            {
              name: "rows", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              levels: ["ordinal"],
              attributes: {isRequired: true}
            },
            {
              name: "x", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              levels: ["quantitative"],
              attributes: {countMin: 1, countMax: 1},
              ordinal: 1
            },
            {
              name: "y", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              levels: ["quantitative"],
              attributes: {countMin: 1, countMax: 1},
              ordinal: 2
            },
            {
              // Modal visual role
              name: "color", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              levels: ["nominal", "quantitative"],
              attributes: {
                countMax: function(rolePropType) {
                  var level = rolePropType.levelEffectiveOn(this);
                  return MeasurementLevel.type.isQuantitative(level) ? 1 : null;
                }
                // TODO: should only be applicable when color is continuous
              },
              getAttributesMaxLevelOf: function(model) {
                var mapping = model.get(this);

                // If the mapping contains a single `date` attribute,
                // consider it nominal, and not quantitative as the base code does.
                // Currently, CCC does not like dates in continuous color scales...
                if(mapping.attributes.count === 1) {
                  var dataAttr = mapping.attributes.at(0).__dataAttribute;
                  if(dataAttr && dataAttr.type === "date")
                    return "nominal";
                }

                return this.base(model);
              },
              ordinal: 6
            },
            {
              name: "multi", // VISUAL_ROLE
              base: "pentaho/visual/role/property",
              levels: ["ordinal"],
              ordinal: 10
            },
            {
              name: "labelsOption",
              valueType: LabelsOption,
              domain: ["none", "center", "left", "right", "top", "bottom"],
              isRequired: true,
              defaultValue: "none"
            }
          ]
        }
      })
      .implement({$type: bundle.structured.metricDot});
    }
  ];
});
