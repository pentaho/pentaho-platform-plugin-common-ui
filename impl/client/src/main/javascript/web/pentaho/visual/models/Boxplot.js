/*!
 * Copyright 2023 Hitachi Vantara. All rights reserved.
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
  "pentaho/module!_",
  "./CategoricalContinuousAbstract",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      category: "misc2",

      props: [
        // VISUAL_ROLES
        {
          name: "rows",
          modes: [{dataType: "list"}],
          fields: {isRequired: true}
        },
        {
          name: "lowerQuartile",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 8
        },
        {
          name: "upperQuartile",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 9
        },
        {
          name: "measures",
          modes: [{dataType: "number"}],
          fields: {isRequired: __isRequiredOneMeasure}
        },
        {
          name: "minimum",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 10
        },
        {
          name: "maximum",
          base: "pentaho/visual/role/Property",
          modes: [{dataType: "number"}],
          fields: {isRequired: __isRequiredOneMeasure},
          ordinal: 11
        },
        {
          name: "multi",
          ordinal: 12
        },
        // End VISUAL_ROLES
        {
          name: "labelsOption",
          isApplicable: false
        }
      ]
    }
  })
  .localize({$type: bundle.structured.Boxplot})
  .configure();

  function __isRequiredOneMeasure() {
    return !this.lowerQuartile.hasFields && !this.upperQuartile.hasFields &&
      !this.measures.hasFields && !this.minimum.hasFields && !this.maximum.hasFields;
  }
});
