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
  "./PointAbstract",
  "./_trends"
], function(module, BaseView) {

  "use strict";

  // "pentaho/visual/models/Line"

  return BaseView.extend(module.id, {
    _cccClass: "LineChart",

    _supportsTrends: true,

    _configureOptions: function() {

      this.base();

      var options = this.options;

      var shape = this.model.shape;
      if(shape && shape === "none") {
        options.dotsVisible = false;
      } else {
        options.dotsVisible = true;
        options.dot_shape = shape;
      }
    }
  })
  .implement(module.config);
});
