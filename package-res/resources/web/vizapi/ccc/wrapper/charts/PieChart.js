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
    "./AbstractChart"
], function(def, AbstractChart) {

    return AbstractChart.extend({
        methods: {
            _cccClass: 'PieChart',

            _rolesToCccDimensionsMap: {
                'columns':  'multiChart',
                //'rows':     'category',
                'multi':    null
                //'measures': 'value'
            },

            _multiRole: 'columns',

            _discreteColorRole: 'rows',

            _noPercentInTootltipForPercentGems: true,

            _options: {
                legendShape: 'circle',

                titlePosition: 'bottom',

                dataOptions: {
                    measuresInColumns: false
                },

                extensionPoints: {
                    slice_strokeStyle:'white',
                    slice_lineWidth:   0.8
                }
            },

            _configure: function() {
                this.base();

                if(this.options.valuesVisible) this._configureValuesMask();
            },

            _showLegend: function() {
                return this.options.legend && this.axes.row.depth > 0;
            },

            _configureLabels: function(options, vizOptions) {
                this.base.apply(this, arguments);

                if(options.valuesVisible) {
                    options.valuesLabelStyle = vizOptions.labelsOption;
                }
            },

            _configureMultiChart: function() {
                this.base();

                this.options.legendSizeMax = '50%';
            },

            _configureValuesMask: function() {
                // Change values mask according to each category's
                // discriminated measure being PCTOF or not
                var colAxis = this.axes.column,
                    meaDiscrimName = colAxis.measureDiscrimName;
                if(meaDiscrimName) {
                    var gemsMap = this.gemsMap;

                    this.options.pie = {
                        scenes: {
                            category: {
                                sliceLabelMask: function() {
                                    var meaAtom = this.atoms[meaDiscrimName],
                                        meaGemId, meaGem;
                                    if(meaAtom &&
                                       (meaGemId = meaAtom.value) &&
                                       (meaGem = gemsMap[meaGemId]) && meaGem.measureType === 'PCTOF') {
                                        return "{value}"; // the value is the percentage itself;
                                    }

                                    return "{value} ({value.percent})";
                                }
                            }
                        }
                    };
                }
            },

            _selectionExcludesMultiGems: def.fun.constant(false)
        }
    });
});
