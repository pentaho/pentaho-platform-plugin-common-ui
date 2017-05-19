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
  "pentaho/visual/models/sunburst",
  "./abstract",
  "cdf/lib/CCC/protovis",
  "cdf/lib/CCC/def",
  "./_util",
  "pentaho/i18n!./i18n/view"
], function(module, modelFactory, baseViewFactory, pv, def, util, bundle) {

  "use strict";

  return function(context) {

    var BaseView = context.get(baseViewFactory);

    return BaseView.extend({
      type: {
        id: module.id,
        props: {
          model: {type: modelFactory}
        }
      },

      _cccClass: "SunburstChart",

      _roleToCccRole: {
        "multi": "multiChart",
        "rows": "category",
        "size": "size"
      },

      _discreteColorRole: "rows",

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

        var labelColor = this.model.labelColor;
        if(labelColor != null) {
          options.label_textStyle= labelColor;
        }

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
                  if(!pvMainLabel.text()) return "";
                  var sizeCccDimName = me._getMappingAttrInfosByRole("size")[0].cccDimName;
                  return me._formatSize(scene.vars.size, scene.firstAtoms[sizeCccDimName].dimension);
                })
                .textBaseline("top");
          };
        }
      },

      _configureOptions: function() {

        this.base();

        this.options.rootCategoryLabel = bundle.get("sunburst.rootCategoryLabel");

        this._configureDisplayUnits();
      },

      _configureLabels: function(options) {
        // Sunburst shows category labels unless overridden through extension points.
        var valuesVisible = !!def.get(this._validExtensionOptions, "valuesVisible", options.valuesVisible);

        options.valuesVisible = valuesVisible;

        if(valuesVisible) {
          options.valuesFont = util.defaultFont(util.readFontModel(this.model, "label"));
        }
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
          // The existence of a converter discards any label received through a Google-style cell
          // (DataTable conversion sends values and labels to CCC as a Google-style cell).
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
            // TODO: Mondrian/Analyzer specific
            // Copy map values to colorMap.
            // All color maps are joined together and there will be no
            // value collisions because Mondrian keys are prefixed with the dimensions they belong to...
            if(colorMAInfo && colorMAInfo.attr) {
              var map = memberPalette[colorMAInfo.attr.name];
              if(map) this._copyColorMap(colorMap, map);
            }
          }, this);
        }

        return colorMap;
      },

      _createDiscreteColorMapScaleFactory: function(colorMapScale, defaultScale) {
        // Sunburst Level 1 Wedge Key: "[Department].[VAL]"
        // Sunburst Level 2 Wedge Key: "[Department].[VAL]~[Region].[USA]"
        // colorMap= {
        //   "[Region].[USA]" : "#FF00FF"
        //   "[Department].[VAL]" : "#AAFF00"
        // }

        // Make sure the scales returned by scaleFactory
        // "are like" pv.Scale - have all the necessary methods.
        return function safeScaleFactory() {
          return def.copy(scaleFactory(), defaultScale);
        };

        function scaleFactory() {
          return function(compKey) {
            if(compKey) {
              var keys = compKey.split("~");
              var level = keys.length - 1;
              var keyLevel = keys[level];

              // Obtain color for most specific key from color map.
              // If color map has no color and it is the 1st level (level = 0),
              //  then reserve a color from the default color scale.
              // Otherwise, return undefined, meaning that a derived color should be used.
              return colorMapScale(keyLevel) || (level ? undefined : defaultScale(keyLevel));
            }
          };
        }
      }
    });
  };
});
