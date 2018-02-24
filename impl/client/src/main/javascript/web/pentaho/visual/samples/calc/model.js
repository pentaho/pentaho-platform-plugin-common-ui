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
  "pentaho/i18n!model",
  "./theme/model"
], function(bundle) {

  "use strict";

  return ["pentaho/visual/base/model", function(BaseModel) {

    var operDomain = bundle.structured.operation.domain;

    /**
     * @name pentaho.visual.samples.calc.Model
     * @class
     * @extends pentaho.visual.base.Model
     * @amd {pentaho.type.spec.UTypeModule<pentaho.visual.samples.calc.Model>} pentaho/visual/samples/calc
     */
    return BaseModel.extend({
      $type: {
        v2Id: "sample_calc",
        defaultView: "./view",

        props: [
          {
            name: "levels",
            base: "pentaho/visual/role/property",
            modes: [{dataType: "list"}],
            fields: {isRequired: true}
          },
          {
            name: "measure",
            base: "pentaho/visual/role/property",
            modes: [{dataType: "number"}],
            fields: {isRequired: true}
          },
          {
            name: "operation",
            valueType: "string",
            domain: [
              {v: "min", f: operDomain.min.f},
              {v: "max", f: operDomain.max.f},
              {v: "avg", f: operDomain.avg.f},
              {v: "sum", f: operDomain.sum.f}
            ],
            defaultValue: "min"
          }
        ]
      }
    })
    .implement({$type: bundle.structured.type});
  }];
});
