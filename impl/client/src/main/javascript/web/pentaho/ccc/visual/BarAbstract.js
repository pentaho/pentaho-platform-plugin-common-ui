/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
