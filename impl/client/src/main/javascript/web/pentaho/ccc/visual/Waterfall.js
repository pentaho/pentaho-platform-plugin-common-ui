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
  "./BarAbstract"
], function (module, BaseView) {

  return BaseView.extend(module.id, {
    _cccClass: "WaterfallChart",

    _configureOptions: function () {
      this.base();

      this.options.direction = this.model.waterDirection;
    },

    _options: {
      orientation: 'vertical'
    }
  })
  .implement(module.config);
});
