/*!
* Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
    "./AbstractChart",
    "../util"
], function(pv, AbstractChart, util) {

    return AbstractChart.extend({
        methods: {
            _cccClass: 'SunburstChart',

            _rolesToCccDimensionsMap: {
                'columns':  null,
                'measures': null,
                'size':     'size'
            },

            _discreteColorRole: 'rows',

            _useLabelColor: false,

            _options: {
                valuesVisible: true,
                valuesOverflow: 'trim',
                valuesOptimizeLegibility: false,
                colorMode: 'slice'
            },

            // Changed in _configureDisplayUnits according to option "displayUnits".
            _formatSize: function(sizeVar, sizeDim) {
                return sizeVar.label;
            },

            _readUserOptions: function(options, drawSpec) {
                this.base(options, drawSpec);

                var eps = options.extensionPoints;

                this._hideNullMembers = drawSpec.emptySlicesHidden;

                if(drawSpec.emptySlicesHidden)
                    eps.slice_visible = function(scene) {
                        return util.isNullMember(scene.vars.category.value);
                    };

                eps.label_textStyle = drawSpec.labelColor;

                // Determine whether to show values label
                if (drawSpec.labelsOption != "none" && this.axes.measure.boundRoles.size) {
                    eps.label_textBaseline = "bottom";
                    eps.label_textMargin = 2;

                    eps.label_visible = function(scene) {
                        // Only show the size label if the size-value label also fits
                        var pvLabel = this.pvMark,
                            ir = scene.innerRadius,
                            irmin = ir,
                            or = scene.outerRadius,
                            tm = pvLabel.textMargin(),
                            a  = scene.angle, // angle span
                            m  = pv.Text.measure(scene.vars.size.label, pvLabel.font()),
                            twMax;

                        if(a < Math.PI) {
                            var th = m.height * 0.85, // tight text bounding box
                                // The effective height of text that must be covered.
                                // one text margin, for the anchor,
                                // half text margin for the anchor's opposite side.
                                // All on only one of the sides of the wedge.
                                thEf = 2 * (th + 3*tm/2);

                            // Minimum inner radius whose straight-arc has a length `thEf`
                            irmin = Math.max(
                                irmin,
                                thEf / (2 * Math.tan(a / 2)));
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
                    eps.label_add = function() {
                        return new pv.Label()
                            .visible(function(scene) {
                                var pvMainLabel = this.proto;
                                return pvMainLabel.visible();
                            })
                            .text(function(scene) {
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

                this.options.rootCategoryLabel = this._message('chartSunburstRootCategoryLabel');

                this._configureDisplayUnits();
            },

            _configureDisplayUnits: function() {
                var scaleFactor = this._parseDisplayUnits(this._drawSpec.displayUnits);
                if(scaleFactor > 1) {
                    var dims = this.options.dimensions,
                        dimSize = dims.size || (dims.size = {});

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
                        return (v != null && !isNaN(v))
                            ? (v * scaleFactor)
                            : v;
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
            }
        }
    });
});
