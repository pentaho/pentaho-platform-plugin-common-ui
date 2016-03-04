/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/visual/base",
  "pentaho/i18n!./i18n/model",
  "./types/color",
  "./types/backgroundFill",
  "./types/fontStyle",
  "./types/sides",
  "./types/labelsOption",
  "./theme/model"
], function(abstractModelFactory, bundle, colorFactory, backgroundFillFactory, fontStyleFactory,
    sidesFactory, labelsOptionFactory) {

  "use strict";

  function applicableLegend() {
    /*jshint validthis:true*/
    return this.getv("showLegend");
  }

  return function(context) {

    var Abstract = context.get(abstractModelFactory);

    return Abstract.extend({
      meta: {
        id: "pentaho/visual/ccc/abstract",
        isAbstract: true,

        props: [
          //region Visual Roles
          {
            name: "rows",
            type: ["string"],
            dataType: "string",
            isVisualRole: true,
            isRequired: false
          },
          //endregion

          //region background fill
          {
            name: "backgroundFill",
            type: backgroundFillFactory,
            isRequired: true,
            value: "none"
          },
          {
            name: "backgroundColor",
            type: colorFactory,
            applicable: function() {
              return this.getv("backgroundFill") !== "none";
            },
            isRequired: true
          },
          {
            name: "backgroundColorEnd",
            type: colorFactory,
            applicable: function() {
              return this.getv("backgroundFill") === "gradient";
            },
            isRequired: true
          },
          //endregion

          //region Cartesian Axis Tick Label and Title Label

          // For multi-charts, Size and Family also used for chart title font
          {
            name: "labelColor",
            type: colorFactory
          },
          {
            name: "labelSize",
            type: "number"
          },
          {
            name: "labelStyle",
            type: fontStyleFactory,
            isRequired: true,
            value: "plain"
          },
          {
            name: "labelFontFamily",
            type: "string"
          },
          //endregion

          //region Legend
          {
            name: "showLegend",
            type: "boolean",
            value: true
          },
          {
            name: "legendPosition",
            type: sidesFactory,
            applicable: applicableLegend,
            isRequired: true,
            value: "right"
          },
          {
            name: "legendBackgroundColor",
            type: colorFactory,
            applicable: applicableLegend
          },

          // Legend Item Label Font
          {
            name: "legendColor",
            type: colorFactory,
            applicable: applicableLegend
          },
          {
            name: "legendSize",
            type: "number",
            applicable: applicableLegend
          },
          {
            name: "legendStyle",
            type: fontStyleFactory,
            applicable: applicableLegend,
            isRequired: true,
            value: "plain"
          },
          {
            name: "legendFontFamily",
            type: "string",
            applicable: applicableLegend
          },
          //endregion

          { // TODO: do all charts have this?
            name: "labelsOption",
            type: labelsOptionFactory
          }
        ]
      }
      
    })
    .implement({meta: bundle.structured["abstract"]});
  };
});
