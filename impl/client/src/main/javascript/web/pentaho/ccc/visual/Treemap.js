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
  "./Abstract",
  "cdf/lib/CCC/def"
], function(module, BaseView, def) {

  "use strict";

  return BaseView.extend(module.id, {
    _cccClass: "TreemapChart",

    _roleToCccRole: {
      "rows": "category",
      "multi": "multiChart",
      "size": "size"
    },

    _discreteColorRole: "rows",

    _configureOptions: function() {
      this.base();

      this.options.layoutMode = this.model.treemapLayoutMode;
    },

    _configureLabels: function() {
      var model = this.model;
      var options = this.options;

      var valuesVisible = !!def.get(this._validExtensionOptions, "valuesVisible", options.valuesVisible);

      options.valuesVisible = valuesVisible;

      if(valuesVisible && model.labelsOption !== "none" && this.model.size.hasFields) {
        options.valuesMask = this._configureValuesMask();
      }
    },

    _configureValuesMask: function() {
      return "{category} ({size})";
    }

  }).implement(module.config);
});
