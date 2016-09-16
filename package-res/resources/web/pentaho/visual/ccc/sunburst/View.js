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
  "cdf/lib/CCC/protovis",
  "cdf/lib/CCC/def",
  "../abstract/View",
  "../util",
  "pentaho/i18n!../abstract/i18n/view"
], function(pv, def, AbstractChart, util, bundle) {

  "use strict";

  return AbstractChart.extend({
    _cccClass: "SunburstChart",

    _roleToCccRole: {
      "multi": "multiChart",
      "rows": "category",
      "size": "size"
    },

    _discreteColorRole: "rows",

    _options: {
      valuesVisible: true,
      valuesOverflow: "trim",
      valuesOptimizeLegibility: false,
      colorMode: "slice"
    },

    // Changed in _configureDisplayUnits according to option "displayUnits".
    _formatSize: function(sizeVar, sizeDim) {
      return sizeVar.label;
    },

    _readUserOptions: function(options) {

      this.base.apply(this, arguments);

      var model = this.model;

      var value = model.sliceOrder;
      if(value) options.sliceOrder = value;

      var emptySlicesHidden = model.emptySlicesHidden;
      this._hideNullMembers = emptySlicesHidden;

      if(emptySlicesHidden)
        options.slice_visible = function(scene) {
          return !util.isNullMember(scene.vars.category.value);
        };

      options.label_textStyle = this.model.labelColor;

      // Determine whether to show values label
      if(model.labelsOption !== "none" && this.axes.measure.boundRoles.size) {
        options.label_textBaseline = "bottom";
        options.label_textMargin = 2;

        options.label_visible = function(scene) {
          // Only show the size label if the size-value label also fits
          var pvLabel = this.pvMark;
          var ir = scene.innerRadius;
          var irmin = ir;
          var or = scene.outerRadius;
          var tm = pvLabel.textMargin();
          var a = scene.angle; // angle span
          var m = pv.Text.measure(scene.vars.size.label, pvLabel.font());
          var twMax;

          if(a < Math.PI) {
            var th = m.height * 0.85; // tight text bounding box

            // The effective height of text that must be covered.
            // one text margin, for the anchor,
            // half text margin for the anchor's opposite side.
            // All on only one of the sides of the wedge.
            var thEf = 2 * (th + 3 * tm / 2);

            // Minimum inner radius whose straight-arc has a length `thEf`
            irmin = Math.max(irmin, thEf / (2 * Math.tan(a / 2)));
          }

          // Here, on purpose, we're not including two `tm`, for left and right,
          // cause we don't want that the clipping by height, the <= 0 test below,
          // takes into account the inner margin. I.e., text is allowed to be shorter,
          // in the inner margin zone, which, after all, is supposed to not have any text!
          twMax = (or - tm) - irmin;

          // If with this angle-span only at a very far
          // radius would `th` be achieved, then text will never fit,
          // not even trimmed.
          if(twMax <= 0 || m.width > twMax - tm) return false;

          // Continue with normal processing for the main label.
          return null;
        };

        var me = this;
        options.label_add = function() {
          return new pv.Label()
              .visible(function(scene) {
                var pvMainLabel = this.proto;
                return pvMainLabel.visible();
              })
              .text(function(scene) {
                /* jshint laxbreak:true*/
                var pvMainLabel = this.proto;
                return !pvMainLabel.text()
                    ? ""
                    : me._formatSize(scene.vars.size, scene.firstAtoms.size.dimension);
              })
              .textBaseline("top");
        };
      }
    },

    _configure: function() {
      this.base();

      this.options.rootCategoryLabel = bundle.get("sunburst.rootCategoryLabel");

      this._configureDisplayUnits();
    },

    _configureLabels: function(options) {
      // Sunburst always shows category labels.
      options.valuesFont = util.defaultFont(util.readFontModel(this.model, "label"));
      options.label_textStyle = this.model.labelColor;
    },

    _configureDisplayUnits: function() {
      var displayUnitsType = this.model.type.get("displayUnits", true).type;
      var displayUnits = this.model.displayUnits;
      var scaleFactor = displayUnitsType.scaleFactorOf(displayUnits);
      if(scaleFactor > 1) {
        var dims = this.options.dimensions;
        var dimSize = dims.size || (dims.size = {});

        // Values returned by the server are already divided by scaleFactor.
        // The formatting, however is that of the original value.
        // Here, we also want to show shorter values, so that they fit on slices.
        // In the tooltip, however we want to show the original values.
        // So, the strategy is:
        // * remove the scale from values in the data table, reverting to original
        // * scale and format the values only when showing them in the slice.

        // Undo scaling applied by the server
        // The existence of a converter discards any label received through a google style cell
        // (DataTable conversion sends values and labels to CCC as a google-style cell).
        dimSize.converter = function(v) {
          return (v != null && !isNaN(v)) ? (v * scaleFactor) : v;
        };

        // Override slice size label formatting function
        this._formatSize = function(sizeVar, sizeDim) {
          var size = sizeVar.value;
          // Scale & Format using the size dimension's formatting function
          return size == null ? "" : sizeDim.format(size / scaleFactor);
        };
      } else {
        delete this._formatSize;
      }
    },

    /** @override */
    _getDiscreteColorMap: function() {
      // Always return a color map, even if no fixed member colors exist.
      // This leads into creating the general #_createDiscreteColorMapScaleFactory color scale.
      var colorMap = {};
      var memberPalette = this._getMemberPalette();
      if(memberPalette) {
        // The color role, "rows" is required, so necessarily C > 0.
        // Also, there can be at most one measure gem, "size", so M <= 1.
        // Use member colors of all of the color attributes.
        this._getDiscreteColorMappingAttrInfos().forEach(function(colorMAInfo) {
          // Copy map values to colorMap.
          // All color maps are joined together and there will be no
          // value collisions because the key is prefixed with the category.
          var map = memberPalette[colorMAInfo.name];
          if(map) this._copyColorMap(colorMap, map);
        }, this);
      }

      return colorMap;
    },

    _createDiscreteColorMapScaleFactory: function(colorMap, defaultScale) {
      // Sunburst Level 1 Wedge Key: "[Department].[VAL]"
      // Sunburst Level 2 Wedge Key: "[Department].[VAL]~[Region].[USA]"
      // colorMap= {
      //   "[Region].[USA]" : "#FF00FF"
      //   "[Department].[USA]" : "#AAFF00"
      // }
      return function scaleFactory() {
        return function(compKey) {
          if(compKey) {
            var keys = compKey.split("~");
            var level = keys.length - 1;
            var keyLevel = keys[level];

            // Obtain color for most specific key from color map.
            // If color map has no color and it is the 1st level,
            //  then reserve a color from the default color scale.
            // Otherwise, return undefined, meaning that a derived color should be used.
            return def.getOwn(colorMap, keyLevel) || (level ? undefined : defaultScale(keyLevel));
          }
        };
      };
    }
  });
});
