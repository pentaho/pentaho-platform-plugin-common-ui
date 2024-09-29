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
  "./PointAbstract",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      v2Id: "ccc_area",
      category: "areachart"
    }
  })
  .localize({$type: bundle.structured.AreaStacked})
  .configure();
});
