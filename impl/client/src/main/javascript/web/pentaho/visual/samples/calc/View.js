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
  "module",
  "pentaho/visual/impl/View",
  "pentaho/i18n!view"
], function(module, BaseView, bundle) {

  "use strict";

  /**
   * @name View
   * @memberOf pentaho.visual.samples.calc
   * @class
   * @extends pentaho.visual.impl.View
   *
   * @amd pentaho/visual/samples/calc/View
   *
   * @classDesc The `View` of the calculator visualization.
   */

  return BaseView.extend(module.id, /** @lends pentaho.visual.samples.calc.View# */{

    constructor: function(viewSpec) {

      this.base(viewSpec);

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
      var width  = this.model.width;
      var height = this.model.height;
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

        case "sum":
          aggregatedValue = 0;
          if(rowCount) {
            for(rowIndex = 0; rowIndex < rowCount; rowIndex++)
              if((value = getValue(rowIndex)) != null)
                aggregatedValue += value;
          }
          break;
      }

      return aggregatedValue;
    }
  });
});
