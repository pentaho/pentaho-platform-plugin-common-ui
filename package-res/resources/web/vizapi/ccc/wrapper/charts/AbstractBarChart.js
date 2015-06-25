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
            _cccClass: 'BarChart',

            _configure: function() {
                this.base();

                var options = this.options;
                if(options.orientation !== 'vertical')
                    options.visualRoles.category = {isReversed: true};
            },

            _configureLabelsAnchor: function(options, visualSpec) {

                options.extensionPoints.label_textMargin = 7;

                switch(visualSpec.labelsOption) {
                    case 'center':
                        options.valuesAnchor = 'center';
                        break;

                    case 'inside_end':
                        options.valuesAnchor = options.orientation === 'horizontal' ? 'right' : 'top';
                        break;

                    case 'inside_base':
                        options.valuesAnchor = options.orientation === 'horizontal' ? 'left' : 'bottom';
                        break;

                    case 'outside_end':
                        if(options.orientation === 'horizontal') {
                            options.valuesAnchor = 'right';
                            options.extensionPoints.label_textAlign ='left';
                        } else {
                            options.valuesAnchor = 'top';
                            options.extensionPoints.label_textBaseline = 'bottom';
                        }
                        break;
                }
            }
        }
    });
});
