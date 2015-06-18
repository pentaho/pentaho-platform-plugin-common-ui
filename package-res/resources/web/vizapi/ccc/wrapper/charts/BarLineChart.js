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
    "cdf/lib/CCC/def",
    "./AbstractBarChart",
    "../util"
], function(def, AbstractBarChart, util) {

    return AbstractBarChart.extend({
        methods: {
            _rolesToCccDimensionsMap: {
                'measuresLine': 'value' // maps to same dim group as 'measures' role
            },

            _noRoleInTooltipMeasureRoles: {'measures': true, 'measuresLine': true},

            _options: {
                plot2: true,
                secondAxisIndependentScale: false,
                // prevent default of -1 (which means last series) // TODO: is this needed??
                secondAxisSeriesIndexes: null
            },

            _setNullInterpolationMode: function(options, value) {
                options.plot2NullInterpolationMode = value;
            },

            _initAxes: function() {
                this.base();

                this._measureDiscrimGem || def.assert("Must exist to distinguish measures.");

                var measureDiscrimCccDimName = this._measureDiscrimGem.cccDimName,
                    meaAxis = this.axes.measure,
                    barGems = meaAxis.gemsByRole[meaAxis.defaultRole],
                    barGemsById = def.query(barGems) // bar: measures, line: measuresLine
                        .uniqueIndex(function(gem) { return gem.id; });

                // Create the dataPart dimension calculation
                this.options.calculations.push({
                    names: 'dataPart',
                    calculation: function(datum, atoms) {
                        var meaGemId = datum.atoms[measureDiscrimCccDimName].value;
                        // Data part codes
                        // 0 -> bars
                        // 1 -> lines
                        atoms.dataPart = def.hasOwn(barGemsById, meaGemId) ? '0' : '1';
                    }
                });
            },

            _readUserOptions: function(options, drawSpec) {
                this.base(options, drawSpec);

                var shape = drawSpec.shape;
                if(shape && shape === 'none') {
                    options.pointDotsVisible = false;
                } else {
                    options.pointDotsVisible = true;
                    options.extensionPoints.pointDot_shape = shape;
                }
            },

            _configure: function() {
                this.base();

                this._configureAxisRange(/*isPrimary*/false, 'ortho2');

                this._configureAxisTitle('ortho2',"");

                this.options.plot2OrthoAxis = 2;

                // Plot2 uses same color scale
                // options.plot2ColorAxis = 2;
                // options.color2AxisTransform = null;
            },

            _configureLabels: function(options, drawSpec) {
                this.base.apply(this, arguments);

                // Plot2
                var lineLabelsAnchor = drawSpec.lineLabelsOption;
                if(lineLabelsAnchor && lineLabelsAnchor !== 'none') {
                    options.plot2ValuesVisible = true;
                    options.plot2ValuesAnchor  = lineLabelsAnchor;
                    options.plot2ValuesFont    = util.defaultFont(util.readFont(drawSpec, 'label'));
                    options.extensionPoints.plot2Label_textStyle = drawSpec.labelColor;
                }
            },

            _configureDisplayUnits: function() {
                this.base();

                this._configureAxisDisplayUnits(/*isPrimary*/false, 'ortho2');
            }
        }
    });
});
