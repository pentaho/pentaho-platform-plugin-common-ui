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
  "./mixins/ScaleColorDiscrete",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, ScaleColorDiscreteModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,
      mixins: [ScaleColorDiscreteModel],

      props: [
        {
          name: "columns", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "list"}
          ],
          ordinal: 6
        },
        {
          name: "multi", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "list"}
          ],
          ordinal: 10
        },
        {
          name: "measures", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: ["number"]},
            {dataType: "number"}
          ],
          ordinal: 7
        }
      ]
    }
  })
  .localize({$type: bundle.structured.CategoricalContinuousAbstract})
  .configure();
});
