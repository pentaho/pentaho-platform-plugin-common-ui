/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/module!_",
  "./BarAbstract",
  "./types/LabelsOption",
  "./types/Shape",
  "./types/LineWidth",
  "./mixins/Interpolated",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, LabelsOption, Shape, LineWidth, InterpolatedModel, bundle) {

  "use strict";

  return BaseModel.extend({

    $type: {
      id: module.id,
      mixins: [InterpolatedModel],

      v2Id: "ccc_barline",
      category: "barchart",

      props: [
        {
          name: "measures", // VISUAL_ROLE
          fields: {isRequired: __isRequiredOneMeasure}
        },
        {
          name: "measuresLine", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: ["number"]}
          ],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 7
        },

        {
          name: "lineWidth",
          valueType: LineWidth,
          isApplicable: __hasFieldsMeasuresLine,
          isRequired: true,
          defaultValue: 1
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "center", "insideEnd", "insideBase", "outsideEnd"],
          isApplicable: __hasFieldsMeasures,
          isRequired: true,
          defaultValue: "none"
        },

        {
          name: "lineLabelsOption",
          valueType: LabelsOption,
          domain: ["none", "center", "left", "right", "top", "bottom"],
          isApplicable: __hasFieldsMeasuresLine,
          isRequired: true,
          defaultValue: "none"
        },

        {
          name: "shape",
          valueType: Shape,
          isRequired: true,
          defaultValue: "circle",
          isApplicable: __hasFieldsMeasuresLine
        }
      ]
    }
  })
  .localize({$type: bundle.structured.BarLine})
  .configure();

  function __isRequiredOneMeasure() {
    /* jshint validthis:true*/
    return !this.measures.hasFields && !this.measuresLine.hasFields;
  }

  function __hasFieldsMeasuresLine() {
    /* jshint validthis:true*/
    return this.measuresLine.hasFields;
  }

  function __hasFieldsMeasures() {
    /* jshint validthis:true*/
    return this.measures.hasFields;
  }
});
