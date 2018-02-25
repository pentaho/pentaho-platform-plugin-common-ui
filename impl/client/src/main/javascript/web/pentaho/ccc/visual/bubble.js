/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
define(function() {

  "use strict";

  return [
    "./metricPointAbstract",
    "pentaho/visual/models/bubble",
    function(BaseView, Model) {

      return BaseView.extend({
        $type: {
          props: {
            model: {valueType: Model}
          }
        },

        _options: {
          sizeAxisUseAbs: false
        },

        /* Override Default map */
        _roleToCccRole: {
          "multi": "multiChart",
          "rows": "category",
          "x": "x",
          "y": "y",
          "size": "size",
          "color": "color"
        },

        _configureOptions: function() {

          this.base();

          /* jshint laxbreak:true*/
          // ~ DOT SIZE
          this.options.axisOffset = this.model.size.hasFields
              ? (1.1 * this.options.sizeAxisRatio / 2) // Axis offset like legacy analyzer
              : 0;
        }
      });
    }
  ];
});
