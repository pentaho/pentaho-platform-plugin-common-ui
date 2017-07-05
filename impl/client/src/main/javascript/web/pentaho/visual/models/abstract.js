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
  "pentaho/visual/base",
  "pentaho/i18n!./i18n/model",
  "./types/color",
  "./types/backgroundFill",
  "./types/fontStyle",
  "./types/sides",
  "./types/labelsOption",
  "./theme/model"
], function(module, baseModelFactory, bundle, colorFactory, backgroundFillFactory, fontStyleFactory,
    sidesFactory, labelsOptionFactory) {

  "use strict";

  function isApplicableLegend() {
    /* jshint validthis:true */
    return this.showLegend;
  }

  return function(context) {

    var BaseModel = context.get(baseModelFactory);

    return BaseModel.extend({
      type: {
        id: module.id,

        isAbstract: true,

        defaultView: "pentaho/ccc/visual/abstract",

        props: [
          // region Visual Roles
          {
            name: "rows", // VISUAL_ROLE
            base: "pentaho/visual/role/property",
            levels: ["ordinal", "quantitative"], // modal by default
            ordinal: 5
          },
          // endregion

          // region background fill
          {
            name: "backgroundFill",
            valueType: backgroundFillFactory,
            isRequired: true,
            defaultValue: "none"
          },
          {
            name: "backgroundColor",
            valueType: colorFactory,
            isApplicable: function() {
              return this.backgroundFill !== "none";
            },
            isRequired: true
          },
          {
            name: "backgroundColorEnd",
            valueType: colorFactory,
            isApplicable: function() {
              return this.backgroundFill === "gradient";
            },
            isRequired: true
          },
          // endregion

          // region Cartesian Axis Tick Label and Title Label

          // For multi-charts, Size and Family also used for chart title font
          {
            name: "labelColor",
            valueType: colorFactory
          },
          {
            name: "labelSize",
            valueType: "number"
          },
          {
            name: "labelStyle",
            valueType: fontStyleFactory,
            isRequired: true,
            defaultValue: "plain"
          },
          {
            name: "labelFontFamily",
            valueType: "string"
          },
          // endregion

          // region Legend
          {
            name: "showLegend",
            valueType: "boolean",
            defaultValue: true
          },
          {
            name: "legendPosition",
            valueType: sidesFactory,
            isApplicable: isApplicableLegend,
            isRequired: true,
            defaultValue: "right"
          },
          {
            name: "legendBackgroundColor",
            valueType: colorFactory,
            isApplicable: isApplicableLegend
          },

          // Legend Item Label Font
          {
            name: "legendColor",
            valueType: colorFactory,
            isApplicable: isApplicableLegend
          },
          {
            name: "legendSize",
            valueType: "number",
            isApplicable: isApplicableLegend
          },
          {
            name: "legendStyle",
            valueType: fontStyleFactory,
            isApplicable: isApplicableLegend,
            isRequired: true,
            defaultValue: "plain"
          },
          {
            name: "legendFontFamily",
            valueType: "string",
            isApplicable: isApplicableLegend
          },
          // endregion

          { // TODO: do all charts have this?
            name: "labelsOption",
            valueType: labelsOptionFactory
          }
        ]
      }

    })
    /* eslint dot-notation:0 */
    .implement({type: bundle.structured["abstract"]});
  };
});
