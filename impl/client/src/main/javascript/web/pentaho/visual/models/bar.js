/*!
 * Copyright 2010 - 2017 Pentaho Corporation. All rights reserved.
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
  "module",
  "./barAbstract",
  "pentaho/i18n!./i18n/model",
  "./types/labelsOption",
  "./mixins/trended"
], function(module, baseModelFactory, bundle, labelsOptionFactory, trendedFactory) {

  "use strict";

  return function(context) {

    var BaseModel = context.get(baseModelFactory);

    return BaseModel.extend({
      type: {
        id: module.id,
        mixins: [trendedFactory],

        v2Id: "ccc_bar",
        category: "barchart",
        defaultView: "pentaho/ccc/visual/bar",

        props: [
          {
            name: "measures", // VISUAL_ROLE
            attributes: {isRequired: true},
            ordinal: 7
          },
          {
            name: "labelsOption",
            valueType: labelsOptionFactory,
            domain: ["none", "center", "insideEnd", "insideBase", "outsideEnd"],
            isRequired: true,
            defaultValue: "none"
          }
        ]
      }
    })
    .implement({type: bundle.structured.bar});
  };
});
