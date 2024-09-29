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
  "cdf/lib/CCC/def"
], function(module, BaseView, def) {

  "use strict";

  // "pentaho/visual/models/BarAbstract",

  return BaseView.extend(module.id, {
    _cccClass: "BarChart",

    _configureOptions: function() {

      this.base();

      var options = this.options;
      if(options.orientation !== "vertical")
        def.lazy(options.visualRoles, "category").isReversed = true;
    },

    _configureLabelsAnchor: function() {

      var options = this.options;

      options.label_textMargin = 7;

      /* eslint default-case: 0 */
      switch(this.model.labelsOption) {
        case "center":
          options.valuesAnchor = "center";
          break;

        case "insideEnd":
          options.valuesAnchor = options.orientation === "horizontal" ? "right" : "top";
          break;

        case "insideBase":
          options.valuesAnchor = options.orientation === "horizontal" ? "left" : "bottom";
          break;

        case "outsideEnd":
          if(options.orientation === "horizontal") {
            options.valuesAnchor = "right";
            options.label_textAlign = "left";
          } else {
            options.valuesAnchor = "top";
            options.label_textBaseline = "bottom";
          }
          break;
      }
    }
  })
  .implement(module.config);
});
