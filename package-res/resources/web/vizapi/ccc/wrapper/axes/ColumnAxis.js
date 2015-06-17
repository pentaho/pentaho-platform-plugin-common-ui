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
    "cdf/lib/CCC/pvc",
    "./DiscreteAxis"
], function(pvc, DiscreteAxis) {

    return DiscreteAxis.extend({
        init: function(chart) {
            var rolesToCccDimMap = chart._rolesToCccDimensionsMap;

            this.hasMeasureDiscrim =
                !chart.options.dataOptions.measuresInColumns &&
                !!(rolesToCccDimMap[this.defaultRole] ||
                   rolesToCccDimMap[chart.axes.row.defaultRole]);

            this.isHiddenMeasureDiscrim =
                this.hasMeasureDiscrim &&
                !(chart.axes.measure.genericMeasuresCount > 1);

            this.base(chart, 'column');

            this._ensureRole(this.defaultRole);

            this.realDepth = this.hasMeasureDiscrim ? (this.depth - 1) : this.depth;
        },
        methods: {
            defaultRole: 'columns',
            hiddenMeasureDiscrimDimName: 'measureDiscrim',
            measureDiscrimName: null,

            // NOTE: called during base constructor.
            _getGems: function() {
                var gems = this.base();

                if(this.hasMeasureDiscrim) {
                    gems.push({
                        isMeasureDiscrim: true,
                        id:    '__MeasureDiscrim__',
                        label: "Measure discriminator",
                        axis:  this.id,
                        role:  this.defaultRole
                    });
                }

                return gems;
            },

            _getGemDimName: function(gem) {
                if(gem.isMeasureDiscrim && this.isHiddenMeasureDiscrim) {
                    // When the measure discriminator should not be seen
                    // it should be mapped to a different and hidden dimension group
                    return (this.measureDiscrimName = this.hiddenMeasureDiscrimDimName);
                }

                var cccDimName = this.base(gem);
                if(gem.isMeasureDiscrim) {
                    if(!cccDimName) {
                        // columns role is not mapped to CCC...
                        // In this case, the discriminator goes as the last *row* dimension.
                        // Is the case, at least, in the PieChart, in which there is no "series" concept.
                        var rolesToCccDimMap = this.chart._rolesToCccDimensionsMap,
                            rowAxis          = this.chart.axes.row,
                            rowRole          = rowAxis.defaultRole,
                            rowCccDimGroup   = rolesToCccDimMap[rowRole],
                            rowNextLevel     = rowAxis.gemsByRole[rowRole].length;

                        cccDimName = pvc.buildIndexedId(rowCccDimGroup, rowNextLevel);
                    }

                    this.measureDiscrimName = cccDimName;
                }

                return cccDimName;
            },

            configureDimensionGroups: function() {

                this.base();

                // Ensure measureDiscrimName is determined
                this.cccDimList();

                if(this.measureDiscrimName)
                    this.chart.options.dimensions[this.measureDiscrimName] = {isHidden: true};
            }
        }
    });
});
