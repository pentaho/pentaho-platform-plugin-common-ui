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
  "../barNormalizedAbstract/model",
  "pentaho/i18n!../abstract/i18n/model"
], function(barNormalizedAbstractModelFactory, bundle) {

  "use strict";

  return function(context) {

    var BarNormalizedAbstract = context.get(barNormalizedAbstractModelFactory);

    return BarNormalizedAbstract.extend({
        meta: {
          id: "pentaho/visual/ccc/barNormalizedHorizontal",
          v2Id: "ccc_horzbarnormalized",

          view: "View",
          styleClass: "pentaho-visual-ccc-bar-normalized-horizontal"
        }
    })
    .implement({meta: bundle.structured["barNormalizedHorizontal"]});
  };
});
