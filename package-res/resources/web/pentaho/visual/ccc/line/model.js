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
  "../categoricalContinuousAbstract/model",
  "pentaho/i18n!../abstract/i18n/model",
  "../abstract/types/labelsOption",
  "../abstract/types/shape",
  "../abstract/themes"
], function(visualFactory, bundle, labelsOptionFactory, shapeFactory) {

  "use strict";

  return function(context) {

    var Visual = context.get(visualFactory);

    return Visual.extend({

        meta: {
          id: "pentaho/visual/ccc/line",
          v2id: "",
          props: [
            {
              name: "labelsOption",
              type: {
                base: labelsOptionFactory,
                domain: ["none", "center", "left", "right", "top", "bottom"]
              }
            },

            {
              name: "shape",
              type: shapeFactory,
              required: true,
              value: "circle"
            }
          ]
        }

      })
      .implement({meta: bundle.structured["line"]});
  };
});
