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
    "./AbstractAxis"
], function(def, AbstractAxis) {

    return AbstractAxis.extend({
        init: function(chart) {
            this.base(chart, 'measure');

            this._ensureRole(this.defaultRole);

            this.genericMeasuresCount = 0;
            this.genericMeasureRoles = {};

            def.eachOwn(this.gemsByRole, function(gems, role) {
                if(role.indexOf('measures') === 0) {
                    this.genericMeasureRoles[role] = true;
                    this.genericMeasuresCount += gems.length;
                }
            }, this);
        },
        methods: {
            defaultRole: 'measures',

            /**
             * Filters the report definition formulas
             * excluding those not returned in the data table.
             *
             * Note this is called during base constructor.
             */
            _getGems: function() {
                return this.base().filter(function(gem) {
                    var meaId = gem.id,
                        measureInfo;

                    if(meaId && (measureInfo = def.getOwn(this.chart._measuresInfo, meaId))) {
                        gem.role = measureInfo.role;
                        return true;
                    }
                    return false;
                }, this);
            },

            cccDimList: function() {
                if(!this._cccDimList) {
                    this._cccDimList = this.chart._measureRolesInfoList
                        .map(function(role) {
                            this.gemsByRole[role.id].forEach(function(gem) {
                                gem.cccDimName = role.cccDimName;
                            });

                            return role.cccDimName;
                        }, this);
                }

                return this._cccDimList;
            },

            _buildGemHtmlTooltip: function(lines, complex, context, gem/*, index*/) {
                /*
                 * When using measure discriminator column,
                 * only the "active" measure in 'complex'
                 * is placed in the tooltip.
                 */
                var colAxis = this.chart.axes.column;
                if(colAxis.measureDiscrimName &&
                   def.hasOwn(this.genericMeasureRoles, gem.role) &&
                   gem.id !== complex.atoms[colAxis.measureDiscrimName].value) {
                   return;
                }

                // Obtain the dimension assigned to the role
                var cccDimName = this.chart._measureRolesInfo[gem.role].cccDimName;
                if(cccDimName) {
                    var atom = complex.atoms[cccDimName];
                    if(!atom.dimension.type.isHidden && (!complex.isTrend || atom.value != null)) {
                        // ex: "GemLabel (RoleDesc): 200 (10%)"
                        var tooltipLine = def.html.escape(gem.label);

                        // Role description
                        if(this.chart._noRoleInTooltipMeasureRoles[gem.role] !== true)
                            tooltipLine += " (" + def.html.escape(gem.role) + ")";

                        tooltipLine += ": " + def.html.escape(this._getAtomLabel(atom, context));

                        if(!this.chart._noPercentInTootltipForPercentGems || gem.measureType !== 'PCTOF') {
                            var valuePct = this._getAtomPercent(atom, context);
                            if(valuePct != null)
                                tooltipLine += " (" + def.html.escape(''+valuePct) + ")";
                        }

                        // TODO: OMG! this piece of merged code is completely messed up!!!

                        var suffix;

                        // It can happen that the scene has more than one datum.
                        // One is a null one and the other an interpolated one.
                        // We may receive the null one in `complex` and
                        // miss detecting that the scene is actually interpolated.
                        if(context && context.scene && context.scene.datums()) {
                            if(context.scene.datums().where(function(d) { return d.isInterpolated && d.interpDimName === cccDimName; }).first()) {
                                suffix = this.chart._message('chartTooltipGemInterp_' + complexInterp.interpolation);
                            }
                        } else if(complex.isTrend/* && atom.label*/) {
                            // TODO: "atom.label" -- is a weak test for trended measures,
                            // that relies on the fact that non-trended measures are left null
                            suffix = "(" + this.chart.options.trendLabel + ")"; //this.chart._message('chartTooltipGemTrend_' + complex.trendType);
                        }

                        if(suffix) tooltipLine += " " + suffix;

                        lines.push(tooltipLine);
                    }
                }
            },

            _getAtomLabel: function(atom, context) {
                var group;
                if(context && (group = context.scene.group)) {
                    var isMultiDatumGroup = group && group.count() > 1;
                    if(isMultiDatumGroup) {
                        var dim = group.dimensions(atom.dimension.name);
                        return dim.format(dim.value({visible: true}));
                    }
                }

                // Default, for scenes of single datums.
                return atom.label;
            },

            _getAtomPercent: function(atom, context) {
                if(context) {
                    var cccChart = context.chart,
                        data = cccChart.data,
                        cccDimName = atom.dimension.name,
                        visRoles = context.panel.visualRolesOf(cccDimName, /*includeChart*/true);

                    if(visRoles && visRoles.some(function(r) { return r.isPercent; })) {
                        var group = context.scene.group,
                            dim   = (group || data).dimensions(cccDimName),
                            pct   = group
                                ? dim.percentOverParent({visible: true})
                                : dim.percent(atom.value);

                        return dim.type.format().percent()(pct);
                    }
                }
            },

            fillCellSelection: function(selection, complex/*, selectionExcludesMulti*/) {
                // Add a description of the selected values.
                // At the time of writing, analyzer discards selection.value.
                selection.value = def.query(this.gems)
                    .select(function(gem) {
                        var cccDimName = this.chart._measureRolesInfo[gem.role].cccDimName;
                        if(cccDimName) return complex.atoms[cccDimName].label;
                    }, this)
                    .where(def.truthy)
                    .array()
                    .join(" ~ ");
            }
        }
    });
});
