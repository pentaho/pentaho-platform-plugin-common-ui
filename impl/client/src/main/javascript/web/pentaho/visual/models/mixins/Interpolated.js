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
  "../types/EmptyCellMode",
  "pentaho/i18n!../i18n/model"
], function(module, BaseModel, EmptyCellMode, bundle) {

  "use strict";

  // Used by: Line, BarLine e AreaStacked

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,
      props: [
        {
          name: "emptyCellMode",
          valueType: EmptyCellMode,
          isRequired: true,
          defaultValue: "gap"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Interpolation})
  .configure();
});
