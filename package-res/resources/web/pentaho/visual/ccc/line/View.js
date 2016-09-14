/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../pointAbstract/View",
  "../trends"
], function(PointAbstractChart) {

  "use strict";

  return PointAbstractChart.extend({
    _cccClass: "LineChart",

    _supportsTrends: true,

    _readUserOptions: function(options) {
      this.base.apply(this, arguments);

      var shape = this.model.shape;
      if(shape && shape === "none") {
        options.dotsVisible = false;
      } else {
        options.dotsVisible = true;
        options.dot_shape = shape;
      }
    },

    _configureLegend: function() {

      this.base();

      var options = this.options,
          dotSize = options.dot_shapeSize;
      if(dotSize != null) {
        var dotRadius = Math.sqrt(dotSize);
        options.legendMarkerSize = Math.max(15, 2 * (dotRadius + 3));
      }
    }
  });
});
