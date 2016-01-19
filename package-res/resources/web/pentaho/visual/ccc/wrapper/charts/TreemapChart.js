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
    "./AbstractChart"
], function(AbstractChart) {

    return AbstractChart.extend({
        methods: {
            _cccClass: 'TreemapChart',

            _roleToCccDimGroup: {
                'multi':    'multiChart',
                'rows':     'category',
                'size':     'size'
            },

            _discreteColorRole: 'rows',

            _useLabelColor: false,

            _options: {
                //rootCategoryLabel:  Set in configure
                valuesVisible: true
                //valuesOptimizeLegibility: true
            },

            _configure: function() {
                this.base();

                this.options.rootCategoryLabel = this._message('chartTreeMapRootCategoryLabel');
            },

            _getDiscreteColors: function() {
                // Don't use memberPalette for now
                // as the given colors don't match the members that
                // are actually colored in this visual type.
                return this._getDefaultDiscreteColors();
            }
        }
    });
});
