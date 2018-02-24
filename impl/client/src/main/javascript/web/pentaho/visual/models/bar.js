/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/i18n!./i18n/model"
], function(bundle) {

  "use strict";

  return [
    "./barAbstract",
    "./types/labelsOption",
    "./mixins/trended",
    function(BaseModel, LabelsOption, TrendedModel) {

      return BaseModel.extend({
        $type: {
          mixins: [TrendedModel],

          v2Id: "ccc_bar",
          category: "barchart",
          defaultView: "pentaho/ccc/visual/bar",

          props: [
            {
              name: "measures", // VISUAL_ROLE
              fields: {isRequired: true},
              ordinal: 7
            },
            {
              name: "labelsOption",
              valueType: LabelsOption,
              domain: ["none", "center", "insideEnd", "insideBase", "outsideEnd"],
              isRequired: true,
              defaultValue: "none"
            }
          ]
        }
      })
      .implement({$type: bundle.structured.bar});
    }
  ];
});
