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
    "./AbstractCategoricalContinuousChart"
], function(AbstractCategoricalContinuousChart) {

    return AbstractCategoricalContinuousChart.extend({
        methods: {
            _cccClass: 'BoxplotChart',

            _roleToCccDimGroup: {
                'multi':       'multiChart',
                'rows':        'category',
                'measures':    'median',
                'percentil25': 'percentil25',
                'percentil75': 'percentil75',
                'percentil5':  'percentil5',
                'percentil95': 'percentil95'
            },

            _options: {
                boxRuleWhisker_strokeDasharray: '- '
            }
            /*
            _readData: function() {

                this.base();

                // In CCC, it is read as a custom format (more relational-like)
                // Where categoriesCount is the number of "category" dimensions,
                // not including multi-chart columns...
                this.options.dataCategoriesCount = this.axes.row.gemsByRole.rows.length;
            }
            */
        }
    });
});
