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
            _options: {
                orientation: 'vertical'
            },

            _configure: function() {
                this.base();

                this._configureDisplayUnits();

                if(this._showAxisTitle('base'))
                    this._configureAxisTitle('base',  this._getBaseAxisTitle());

                if(this._showAxisTitle('ortho'))
                    this._configureAxisTitle('ortho', this._getOrthoAxisTitle());
            },

            _showAxisTitle: def.fun.constant(true),

            _getOrthoAxisTitle: def.noop,

            _getBaseAxisTitle:  def.noop,

            _configureAxisTitle: function(axisType, title) {
                var unitsSuffix = this._cartesianAxesDisplayUnitsText[axisType];

                title = def.string.join(" - ", title, unitsSuffix);

                if(title) this.options[axisType + 'AxisTitle'] = title;
            },

             _getMeasureRoleTitle: function(measureRole) {
                var title = "",
                    measureAxis = this.axes.measure,
                    singleAxisGem;

                if(!measureRole) {
                    if(this.axes.measure.genericMeasuresCount === 1)
                        singleAxisGem = measureAxis.gemsByRole[measureAxis.defaultRole][0];
                } else {
                    var roleGems = measureAxis.gemsByRole[measureRole];
                    if(roleGems.length === 1) singleAxisGem = roleGems[0];
                }

                if(singleAxisGem) title += singleAxisGem.label;

                return title;
            },

            _configureAxisRange: function(primary, axisType) {
                var vizOptions = this._vizOptions,
                    suffix = primary ? '' : 'Secondary';

                if(vizOptions['autoRange' + suffix] !== 'true') {
                    var limit = vizOptions['valueAxisLowerLimit' + suffix];
                    if(limit != null) {
                        this.options[axisType + 'AxisFixedMin'] = limit;
                        this.options[axisType + 'AxisOriginIsZero'] = false;
                    }

                    limit = vizOptions['valueAxisUpperLimit' + suffix];
                    if(limit != null) this.options[axisType + 'AxisFixedMax'] = limit;
                }
            },

            _cartesianAxesDisplayUnitsText: null,

            _configureDisplayUnits: function() {
                this._cartesianAxesDisplayUnitsText = {};
            },

            _configureAxisDisplayUnits: function(primary, axisType, allowFractional) {
                if(!allowFractional)
                    this.options[axisType + 'AxisTickExponentMin'] = 0; // 10^0 => 1

                var text,
                    displayUnits = this._vizOptions['displayUnits' + (primary ? '' : 'Secondary')],
                    scaleFactor  = this._parseDisplayUnits(displayUnits);
                if(scaleFactor > 1) text = this._message('dlgChartOption_' + displayUnits);

                this._cartesianAxesDisplayUnitsText[axisType] = text || "";
            }
        }
    });
});
