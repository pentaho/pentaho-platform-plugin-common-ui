define([
  "pentaho/visual/base/View",
  "pentaho/i18n!view"
], function(Visual, bundle) {

  "use strict";

  /*global document:false*/

  /**
   * @name View
   * @memberOf pentaho.visual.samples.calc
   * @class
   * @classDesc The `View` of the calculator visualization.
   *
   * @description Creates a calculator `View`.
   * @constructor
   * @param {HTMLDOMElement} element The DOM element where the visualization should render.
   * @param {pentaho.visual.samples.calc.Model} model The calculator's visualization `Model`.
   */
  return Visual.extend(/** @lends pentaho.visual.samples.calc.View */{

    /** @override */
    _init: function() {
      this.base();
      this._setupHtmlSpan();
    },

    /** @override */
    _render: function() {
      var result = this._calculate();
      // TODO: format result

      this._numSpan.innerHTML = bundle.get("result", [result]);

      this._resize();
    },

    /** @override */
    _resize: function() {
      // Center the span
      var width  = this.model.width;
      var height = this.model.height;
      this._numSpan.style.left = ((width  - this._numSpan.offsetWidth ) / 2) + "px";
      this._numSpan.style.top  = ((height - this._numSpan.offsetHeight) / 2) + "px";
    },

    /** @override */
    dispose: function() {
      this.base();

      this._numSpan = null;
    },

    // ---------

    _setupHtmlSpan: function() {
      this._numSpan = document.createElement("span");
      this._numSpan.style.fontSize = "42px";
      this._numSpan.style.position = "relative";
      this._element.appendChild(this._numSpan);
    },

    _calculate: function() {
      var dataTable = this.model.getv("data"),
          R = dataTable.getNumberOfRows(),
          measureAttrName = this.model.measure.attributes.first().name,
          jMeasure = dataTable.model.attributes.get(measureAttrName).ordinal,
          getValue = function(k) {
            var v = dataTable.getValue(k, jMeasure);
            return !isNaN(v) && v != null ? v : null;
          },
          i;

      var value = null, vi;
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
});
