/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "./CartesianAbstract",
  "./mixins/ScaleColorDiscrete",
  "pentaho/i18n!./i18n/model"
], function(module, BaseModel, ScaleColorDiscreteModel, bundle) {

  "use strict";

  return BaseModel.extend({
    $type: {
      id: module.id,
      isAbstract: true,
      mixins: [ScaleColorDiscreteModel],

      props: [
        {
          name: "columns", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "list"}
          ],
          ordinal: 6
        },
        {
          name: "multi", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: "list"}
          ],
          ordinal: 10
        },
        {
          name: "measures", // VISUAL_ROLE
          base: "pentaho/visual/role/Property",
          modes: [
            {dataType: ["number"]},
            {dataType: "number"}
          ],
          ordinal: 7
        }
      ]
    }
  })
  .localize({$type: bundle.structured.CategoricalContinuousAbstract})
  .configure();
});
