/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "module",
  "./model",
  "pentaho/visual/base/view",
  "pentaho/i18n!view"
], function(module, modelFactory, baseViewFactory, bundle) {

  "use strict";

  /* global document:false*/

  return function(context) {

    /**
     * @name View
     * @memberOf pentaho.visual.samples.calc
     * @class
     * @extends pentaho.visual.base.View
     * @amd {pentaho.type.Factory<pentaho.visual.samples.calc.View>} pentaho/visual/samples/calc/view
     *
     * @classDesc The `View` of the calculator visualization.
     */

    var BaseView = context.get(baseViewFactory);

    return BaseView.extend(/** @lends pentaho.visual.samples.calc.View# */{
      type: {
        id: module.id,
        props: {
          model: {valueType: modelFactory}
        }
      },

      _initDomContainer: function() {

        var numSpan = document.createElement("span");
        numSpan.style.fontSize = "42px";
        numSpan.style.position = "relative";

        this.domContainer.appendChild(numSpan);
      },

      _updateAll: function() {

        var result = this._calculate();

        // TODO: format result

        this.domContainer.firstChild.innerHTML = bundle.get("result", [result]);

        this._updateSize();
      },

      _updateSize: function() {

        var element = this.domContainer.firstChild;

        // Center the span
        var width  = this.width;
        var height = this.height;
        element.style.left = ((width - element.offsetWidth) / 2) + "px";
        element.style.top  = ((height - element.offsetHeight) / 2) + "px";
      },

      // ---------

      _calculate: function() {
        var dataTable = this.model.data;
        var R = dataTable.getNumberOfRows();
        var measureAttrName = this.model.measure.attributes.at(0).name;
        var jMeasure = dataTable.getColumnIndexByAttribute(measureAttrName);
        var getValue = function(k) {
          var v = dataTable.getValue(k, jMeasure);
          return !isNaN(v) && v != null ? v : null;
        };
        var value = null;
        var i;
        var vi;

        /* eslint default-case: 0 */
        switch(this.model.operation) {
          case "max":
            for(i = 0; i < R; i++)
              if((vi = getValue(i)) != null)
                value = value == null ? vi : Math.max(value, vi);
            break;

          case "min":
            for(i = 0; i < R; i++)
              if((vi = getValue(i)) != null)
                value = value == null ? vi : Math.min(value, vi);
            break;

          case "avg":
            var total = value = 0;
            if(R) {
              for(i = 0; i < R; i++)
                if((vi = getValue(i)) != null)
                  total += vi;
              value = total / R;
            }
            break;
        }

        return value;
      }
    });
  };
});
