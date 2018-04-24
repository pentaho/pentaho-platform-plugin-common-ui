/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/type/String",
  "pentaho/type/mixins/Enum"
], function(module, PentahoString, EnumMixin) {
  /**
   * @name pentaho.visual.role.adaptation.TimeIntervalDuration
   * @class
   * @extends pentaho.type.String
   *
   * @amd pentaho/visual/role/adaptation/TimeIntervalDuration
   *
   * @private
   */
  return PentahoString.extend({
    $type: /** @lends pentaho.visual.role.adaptation.TimeIntervalDurationType# */ {
      id: module.id,

      mixins: [EnumMixin],
      domain: [
        "year",
        "halfYear",
        "quarter",
        "month",
        "week",
        "day",
        "hour",
        "minute",
        "second",
        "millisecond"
      ]
    }
  }).configure({$type: module.config});
});
