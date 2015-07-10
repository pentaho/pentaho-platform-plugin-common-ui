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
    "cdf/lib/CCC/def"
], function(def) {

    return def.type()
        .init(function(chart, axisId) {
            this.chart = chart;
            this.id = axisId;

            // Every role, bound or not may have an entry here
            this.gemsByRole    = {}; // roleId -> [gem, ...]
            this.indexesByRole = {}; // roleId -> [number, ...]

            // Only bound roles will have an entry in this set
            this.boundRoles = {}; // roleId -> true

            // Bound roles will have an entry here,
            // in order of appearence in gems.
            this.boundRolesIdList = []; // [i] -> roleId

            this.gems  = this._getGems();
            this.depth = this.gems.length;
            this.formulas = [];

            this.gems.forEach(initGem, this);

            /** @instance */
            function initGem(gem, index) {
                // Overwrite axis id with corresponding Axis instance
                gem.axis  = this;
                gem.index = index;

                var roleId = gem.role;
                if(roleId && roleId !== 'undefined') {
                    if(this._ensureRole(roleId)) {
                        /* New role */
                        this.boundRoles[roleId] = true;
                        this.boundRolesIdList.push(roleId);
                    }

                    var roleGems = this.gemsByRole[roleId];
                    gem.roleLevel = roleGems.length;
                    roleGems.push(gem);

                    this.indexesByRole[roleId].push(index);
                }

                this.formulas.push(gem.formula);
            }
        })
        .add({
            defaultRole: null,

            _ensureRole: function(roleId) {
                if(!this.gemsByRole[roleId]) {
                    this.gemsByRole[roleId]    = [];
                    this.indexesByRole[roleId] = [];

                    return true;
                }
            },

            configure: function(virtualItemStartIndex, cccDimNamesSet) {
                this.configureDimensionGroups();
                return this.configureReaders(virtualItemStartIndex, cccDimNamesSet);
            },

            configureDimensionGroups: function() {
            },

            // We need to specify readers with indexes only because of unmapped
            // gems that reach the dataTable.
            // Because this is probably an analyzer bug,
            // we fix this by adjusting the readers' indexes,
            // (and not filtering the table columns, which is more difficult to do).
            configureReaders: function(virtualItemStartIndex, cccDimNamesSet) {
                var readers = this.chart.options.readers,
                    index   = virtualItemStartIndex;

                this.cccDimList().forEach(function(dimName) {
                    if(dimName == null || !def.hasOwn(cccDimNamesSet, dimName)) {

                        if(dimName != null) { cccDimNamesSet[dimName] = true; }

                        readers.push(this._createReader(dimName, index));
                        index++;
                    }
                }, this);

                return index;
            },

            _createReader: function(dimName, index) {
                return {
                    // when dimName is null, the reader simply consumes the index,
                    // and prevents a default reader
                    names:   dimName,
                    indexes: index
                };
            },

            // NOTE: called during base constructor.
            _getGems: function() {
                var gems = this.chart._axesGemsInfo[this.id];
                var vizHelper = this.chart._vizHelper;
                if(vizHelper.completeAxisGemsMetadata) { // available on the client
                    vizHelper.completeAxisGemsMetadata(this.id, gems);
                }

                return gems;
            },

            getAxisLabel: function() {
                var labels = def.query(this._getAxisLabelGems())
                                .where(function(gem) { return gem.cccDimName; })
                                .select(function(gem) { return gem.label; })
                                .array(),
                    last   = labels.pop(),
                    first  = labels.join(", ");

                if(first && last) {
                    return this.chart._message('chartAxisTitleMultipleDimText', [first, last]);
                }

                return first || last;
            },

            _getAxisLabelGems: function() {
                return this.gems;
            },

            buildHtmlTooltip: function(lines, complex, context) {
                this.gems.forEach(
                    this._buildGemHtmlTooltip.bind(this, lines, complex, context));
            },

            _buildGemHtmlTooltip: function(lines, complex, context, gem, index) {
                // Multi-chart formulas are not shown in the tooltip.
                // They're on the small chart's title.
                if(gem.cccDimName && gem.role !== this.chart._multiRole) {
                    var atom = complex.atoms[gem.cccDimName];
                    if(!atom.dimension.type.isHidden && (!complex.isTrend || atom.value != null)) {
                        // ex: "Line: Ships"
                        lines.push(def.html.escape(gem.label) + ': ' + def.html.escape(atom.label));
                    }
                }
            },

           /**
            * Obtains the ccc dimensions that this axis uses,
            * in the order they are laid out in
            * the CCC's virtual item.
            */
           cccDimList: def.method({isAbstract: true}),

           fillCellSelection: def.method({isAbstract: true})
        });
});
