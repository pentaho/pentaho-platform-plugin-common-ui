define([
  "pentaho/visual/View",
  "pentaho/i18n!view"
], function(Visual, bundle) {

  "use strict";

  /*global document:true*/

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
    /* Base class constructor
    constructor: function(element, model) {
      this.element = element;
      this.model   = model;
    },
    */

    /** @override */
    _init: function() {
      this._setupHtmlSpan();
    },

    /** @override */
    _render: function() {
      var result = this._calculate();
      // TODO: format result

      this.numSpan.innerHTML = bundle.get("result", [result]);

      this._resize();
    },

    /** @override */
    _resize: function(width, height) {
      // Center the span
      this.numSpan.style.left = ((width  - this.numSpan.offsetWidth ) / 2) + "px";
      this.numSpan.style.top  = ((height - this.numSpan.offsetHeight) / 2) + "px";
    },

    /** @override */
    dispose: function() {
      this.base();

      this.numSpan = null;
    },

    // ---------

    _setupHtmlSpan: function() {
      this.numSpan = document.createElement("span");
      this.numSpan.style.fontSize = "42px";
      this.numSpan.style.position = "relative";
      this.element.appendChild(this.numSpan);
    },

    _calculate: function() {
      var dataTable = this.data,
          R = dataTable.getNumberOfRows(),
          jMeasure = dataTable.model.attributes.get(this.model.measure),
          getValue = function(k) {
            var v = dataTable.getValue(k, jMeasure);
            return !isNaN(v) && v != null ? v : null;
          },
          i;

      var value = null, vi;
      switch(this.model.operation) {
        case "MAX":
          for(i = 0; i < R; i++)
            if((vi = getValue(i)) != null)
              value = value == null ? vi : Math.max(value, vi);
          break;

        case "MIN":
          for(i = 0; i < R; i++)
            if((vi = getValue(i)) != null)
              value = value == null ? vi : Math.min(value, vi);
          break;

        case "AVG":
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
})
