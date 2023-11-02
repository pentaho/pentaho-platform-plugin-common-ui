/*
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2016 - 2023 Hitachi Vantara. All rights reserved.
 */
define([
  "pentaho/module!_",
  "pentaho/i18n!./i18n/model",
  "./Abstract",
  "./mixins/MultiCharted",
  "./mixins/ScaleColorDiscrete",
  "./types/TreemapLayoutMode",
  "./types/LabelsOption",
], function (module, bundle, BaseModel, MultiChartedModel, ScaleColorDiscreteModel, TreemapLayoutMode, LabelsOption) {
  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      mixins: [MultiChartedModel, ScaleColorDiscreteModel],

      category: "treemapchart",

      // Properties
      props: [
        // Visual role properties
        {
          name: "rows",
          modes: [{dataType: "list"}],
          fields: {isRequired: true}
        },
        {
          name: "size",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          ordinal: 7
        },
        {
          name: "multi",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "list"}],
          ordinal: 10
        },
        //End Visual Roles
        {
          name: "treemapLayoutMode",
          valueType: TreemapLayoutMode,
          isRequired: true,
          defaultValue: "squarify"
        },
        {
          name: "labelsOption",
          valueType: LabelsOption,
          domain: ["none", "center"],
          isApplicable: __hasFieldsSize,
          isRequired: true,
          defaultValue: "none"
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Treemap})
  .configure();

  function __hasFieldsSize() {
    return this.size.hasFields;
  }
});
