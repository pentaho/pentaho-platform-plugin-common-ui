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
  "../../Model",
  "../types/SizeByNegativesMode",
  "pentaho/i18n!../i18n/model"
], function(module, BaseModel, SizeByNegativesMode, bundle) {

  "use strict";

  // Used by: HG, Scatter
  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,
      props: [
        {
          name: "sizeByNegativesMode",
          valueType: SizeByNegativesMode,
          isApplicable: function() { return this.countOf("size") > 0; },
          isRequired: true,
          defaultValue: "negLowest"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.ScaleSizeContinuous})
  .configure();
});
