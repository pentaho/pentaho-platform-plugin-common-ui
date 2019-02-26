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
  "../Model",
  "./types/Color",
  "./types/BackgroundFill",
  "./types/FontStyle",
  "./types/Sides",
  "./types/LabelsOption",
  "pentaho/i18n!./i18n/model",
  "./theme/model"
], function(module, BaseModel, Color, BackgroundFill, FontStyle, Sides, LabelsOption, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,

      props: [
        // region Visual Roles
        {
          name: "rows", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          isVisualKey: true,
          modes: [
            {dataType: "number"},
            {dataType: "date"},
            {dataType: "list"} // catch-all
          ],
          ordinal: 5
        },
        // endregion

        // region background fill
        {
          name: "backgroundFill",
          valueType: BackgroundFill,
          isRequired: true,
          defaultValue: "none"
        },
        {
          name: "backgroundColor",
          valueType: Color,
          isApplicable: function() {
            return this.backgroundFill !== "none";
          },
          isRequired: true
        },
        {
          name: "backgroundColorEnd",
          valueType: Color,
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
          valueType: Color
        },
        {
          name: "labelSize",
          valueType: "number"
        },
        {
          name: "labelStyle",
          valueType: FontStyle,
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
          valueType: Sides,
          isApplicable: __isApplicableLegend,
          isRequired: true,
          defaultValue: "right"
        },
        {
          name: "legendBackgroundColor",
          valueType: Color,
          isApplicable: __isApplicableLegend
        },

        // Legend Item Label Font
        {
          name: "legendColor",
          valueType: Color,
          isApplicable: __isApplicableLegend
        },
        {
          name: "legendSize",
          valueType: "number",
          isApplicable: __isApplicableLegend
        },
        {
          name: "legendStyle",
          valueType: FontStyle,
          isApplicable: __isApplicableLegend,
          isRequired: true,
          defaultValue: "plain"
        },
        {
          name: "legendFontFamily",
          valueType: "string",
          isApplicable: __isApplicableLegend
        },
        // endregion

        { // TODO: do all charts have this?
          name: "labelsOption",
          valueType: LabelsOption
        }
      ]
    }

  })
  .localize({$type: bundle.structured.Abstract})
  .configure({$type: module.config});

  function __isApplicableLegend() {
    /* jshint validthis:true */
    return this.showLegend;
  }
});
