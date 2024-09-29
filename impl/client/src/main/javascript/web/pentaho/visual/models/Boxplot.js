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
  "./CategoricalContinuousAbstract",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      category: "misc2",

      props: [
        // VISUAL_ROLES
        {
          name: "rows",
          modes: [{dataType: "list"}],
          fields: {isRequired: true}
        },
        {
          name: "lowerQuartile",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 8
        },
        {
          name: "upperQuartile",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 9
        },
        {
          name: "measures",
          modes: [{dataType: "number"}],
          fields: {isRequired: __isRequiredOneMeasure}
        },
        {
          name: "minimum",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 10
        },
        {
          name: "maximum",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 11
        },
        {
          name: "multi",
          ordinal: 12
        },
        // End VISUAL_ROLES
        {
          name: "labelsOption",
          isApplicable: false
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Boxplot})
  .configure();

  function __isRequiredOneMeasure() {
    return !this.lowerQuartile.hasFields && !this.upperQuartile.hasFields &&
      !this.measures.hasFields && !this.minimum.hasFields && !this.maximum.hasFields;
  }
});
