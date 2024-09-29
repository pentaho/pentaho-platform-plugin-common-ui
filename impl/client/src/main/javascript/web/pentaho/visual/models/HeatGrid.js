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
  "./CartesianAbstract",
  "./types/Shape",
  "./types/LabelsOption",
  "./mixins/ScaleSizeContinuous",
  "./mixins/ScaleColorContinuous",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, Shape, LabelsOption, ScaleSizeContinuousModel, ScaleColorContinuousModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [ScaleSizeContinuousModel, ScaleColorContinuousModel],

      v2Id: "ccc_heatgrid",
      category: "heatgrid",

      props: [
        {
          name: "rows", // VISUAL_ROLE
          modes: [
            {dataType: "list"}
          ],
          fields: {isRequired: true},
          ordinal: 5
        },
        {
          name: "columns", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "list"}
          ],
          ordinal: 6
        },
        {
          name: "color", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "number"}
          ],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 7
        },
        {
          name: "size", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "number"}
          ],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 8
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "center"],
          isRequired: true,
          defaultValue: "none"
        },
        {
          name: "shape",
          valueType: Shape,
          domain: ["none", "circle", "square"],
          isRequired: true,
          defaultValue: "square"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.HeatGrid})
  .configure();

  function __isRequiredOneMeasure() {
    /* jshint validthis:true*/
    return !this.size.hasFields && !this.color.hasFields;
  }
});
