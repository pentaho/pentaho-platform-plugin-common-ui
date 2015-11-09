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
    "cdf/lib/CCC/pvc",
    "./AbstractAxis",
    "../util"
], function(def, pvc, AbstractAxis, util) {

    return AbstractAxis.extend({
        methods: {
            _nonMultiGemFilter: function(gem) {
                return gem.role !== this.chart._multiRole;
            },

            _isNullMember: function(complex, gem) {
                var atom = complex.atoms[gem.cccDimName];
                return util.isNullMember(atom.value);
            },

            _buildGemHtmlTooltip: function(lines, complex, context, gem, index) {
                /*
                 * Multi-chart formulas are not shown in the tooltip
                 * They're on the small chart's title.
                 *
                 * Also, if the chart hides null members,
                 * don't show them in the tooltip.
                 * Using the scene's group, preferably, because the datum (here the complex) may have dimensions
                 * that are null in the groups' own atoms.
                 */
                if(this._nonMultiGemFilter(gem) &&
                   !(this.chart._hideNullMembers && this._isNullMember(context.scene.group || complex, gem))) {
                    this.base.apply(this, arguments);
                }
            },

            fillCellSelection: function(selection, complex, selectionExcludesMulti) {
                var forms  = [],
                    values = [],
                    label;

                this.getSelectionGems(selectionExcludesMulti)
                    .each(function(gem) {
                        var atom = complex.atoms[gem.cccDimName];
                        forms.push(gem.name);

                        // Translate back null member values to the original member value,
                        // which is accessible in rawValue.
                        values.push(atom.value == null ? atom.rawValue : atom.value);
                        label = atom.label; // TODO is this ok?
                    });

                if(forms.length) {
                    var axisId = this.id;
                    // Dummy property, just to force Analyzer to read the axis info
                    selection[axisId] = true;

                    selection[axisId + 'Id'   ] = forms;
                    selection[axisId + 'Item' ] = values;
                    selection[axisId + 'Label'] = label;
                }
            },

            getSelectionGems: function(selectionExcludesMulti) {
                if(selectionExcludesMulti == null) selectionExcludesMulti = true;

                return def.query(this.gems)
                     .where(function(gem) {
                        return !gem.isMeasureDiscrim && (!selectionExcludesMulti || this._nonMultiGemFilter(gem));
                     }, this);
            }
        }
    });
});
