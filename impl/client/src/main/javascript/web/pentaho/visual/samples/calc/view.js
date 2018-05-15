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
  "./Model",
  "pentaho/visual/base/View",
  "pentaho/i18n!view"
], function(module, Model, BaseView, bundle) {

  "use strict";

  /**
   * @name View
   * @memberOf pentaho.visual.samples.calc
   * @class
   * @extends pentaho.visual.base.View
   * @amd pentaho/visual/samples/calc/View
   *
   * @classDesc The `View` of the calculator visualization.
   */

  return BaseView.extend(/** @lends pentaho.visual.samples.calc.View# */{
    $type: {
      id: module.id,
      props: {
        model: {valueType: Model}
      }
    },

    /** @inheritDoc */
    _initDomContainer: function() {

      var numSpan = document.createElement("span");
      numSpan.style.fontSize = "42px";
      numSpan.style.position = "relative";

      this.domContainer.appendChild(numSpan);
    },

    /** @inheritDoc */
    _updateAll: function() {

      var result = this.__calculate();

      this.domContainer.firstChild.innerHTML = bundle.get("result", [result.toFixed(2)]);

      this._updateSize();
    },

    /** @inheritDoc */
    _updateSize: function() {

      var element = this.domContainer.firstChild;

      // Center the span
      var width  = this.width;
      var height = this.height;
      element.style.left = ((width - element.offsetWidth) / 2) + "px";
      element.style.top  = ((height - element.offsetHeight) / 2) + "px";
    },

    // ---------

    __calculate: function() {
      var dataTable = this.model.data;
      var rowCount = dataTable.getNumberOfRows();
      var measureIndex = this.model.measure.fieldIndexes[0];

      var getValue = function(k) {
        var v = dataTable.getValue(k, measureIndex);
        return !isNaN(v) && v != null ? v : null;
      };

      var aggregatedValue = null;
      var rowIndex;
      var value;

      /* eslint default-case: 0 */
      switch(this.model.operation) {
        case "max":
          for(rowIndex = 0; rowIndex < rowCount; rowIndex++)
            if((value = getValue(rowIndex)) != null)
              aggregatedValue = aggregatedValue == null ? value : Math.max(aggregatedValue, value);
          break;

        case "min":
          for(rowIndex = 0; rowIndex < rowCount; rowIndex++)
            if((value = getValue(rowIndex)) != null)
              aggregatedValue = aggregatedValue == null ? value : Math.min(aggregatedValue, value);
          break;

        case "avg":
          var total = aggregatedValue = 0;
          if(rowCount) {
            for(rowIndex = 0; rowIndex < rowCount; rowIndex++)
              if((value = getValue(rowIndex)) != null)
                total += value;
            aggregatedValue = total / rowCount;
          }
          break;
      }

      return aggregatedValue;
    }
  })
  .configure({$type: module.config});
});
