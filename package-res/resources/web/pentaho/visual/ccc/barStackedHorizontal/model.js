/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "../barAbstract/model",
  "pentaho/i18n!../abstract/i18n/model",
  "../abstract/types/labelsOption",
  "./theme/model"
], function(barAbstractModelFactory, bundle, labelsOptionFactory) {

  "use strict";

  return function(context) {

    var BarAbstract = context.get(barAbstractModelFactory);

    return BarAbstract.extend({
        type: {
          id: "pentaho/visual/ccc/barStackedHorizontal",
          v2Id: "ccc_horzbarstacked",

          view: "View",
          styleClass: "pentaho-visual-ccc-bar-stacked-horizontal",

          props: [
            {
              name: "measures", //VISUAL_ROLE
              type: {
                props: {attributes: {isRequired: true}}
              }
            },
            {
              name: "labelsOption",
              type: {
                base: labelsOptionFactory,
                domain: ["none", "center", "insideEnd", "insideBase"]
              },
              isRequired: true,
              value: "none"
            }
          ]
        }
    })
    .implement({type: bundle.structured["barStackedHorizontal"]});
  };
});
