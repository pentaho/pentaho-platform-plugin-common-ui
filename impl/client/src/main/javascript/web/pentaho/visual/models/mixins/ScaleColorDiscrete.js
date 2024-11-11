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
  "pentaho/i18n!../i18n/model"
], function(module, BaseModel, bundle) {

  "use strict";

  // Used by all vizs but HG and GEO

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,
      props: [
        {
          name: "palette",
          base: "pentaho/visual/color/PaletteProperty",
          levels: ["nominal"],
          isRequired: true
        }
      ]
    }
  })
  .localize({$type: bundle.structured.ScaleColorDiscrete})
  .configure();
});
