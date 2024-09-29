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
  "./CategoricalContinuousAbstract"
], function(module, BaseView) {

  "use strict";

  return BaseView.extend(module.id, {
    _cccClass: "BoxplotChart",

    _roleToCccRole: {
      "rows": "category",
      "columns": "series",
      "multi": "multiChart",
      "minimum": "minimum",
      "lowerQuartile": "lowerQuartil",
      "measures": "median",
      "upperQuartile": "upperQuartil",
      "maximum": "maximum"
    }
  })
  .implement(module.config);
});
