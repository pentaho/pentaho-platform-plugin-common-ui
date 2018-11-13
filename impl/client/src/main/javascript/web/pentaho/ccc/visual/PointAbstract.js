/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/visual/models/PointAbstract",
  "pentaho/data/util",
  "pentaho/util/logger"
], function(module, BaseView, Model, dataUtil, logger) {

  "use strict";

  return BaseView.extend({
    $type: {
      id: module.id,
      props: {
        model: {valueType: Model}
      }
    },

    _setNullInterpolationMode: function(value) {
      this.options.nullInterpolationMode = value;
    },

    /**
     * Calls base plus it configures a CCC `where` condition which filters out rows having
     * a null "rows" visual role value when the visual role is operating in a continuous mode.
     *
     * A CCC `where` filter is used so that the series/color atoms order is captured.
     *
     * TODO: This is a temporary solution.
     * Ideally, visual role definitions would specify an attribute such as `allowsNullData`,
     * defaulting to `true`, and the data would be filtered out a priori.
     *
     * @protected
     * @override
     */
    _initData: function() {

      this.base();

      // Filter out rows with a null x value in a continuous axis.
      var mapping = this.model.rows;
      if(mapping.hasFields) {
        var mode = mapping.mode;
        if(mode !== null && mode.isContinuous) {

          var cccDimName = this._getMappingFieldInfosOfRole("rows")[0].name;

          this._options.dataWhere = function(datum) {
            return datum.atoms[cccDimName].value !== null;
          };
        }
      }
    }
  })
  .configure({$type: module.config});
});
