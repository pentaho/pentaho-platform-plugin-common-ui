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
  "pentaho/type/Number",
  "pentaho/type/mixins/Enum",
  "pentaho/i18n!../i18n/model"
], function(module, PentahoNumber, EnumMixin, bundle) {

  "use strict";

  return PentahoNumber.extend({
    $type: {
      id: module.id,
      mixins: [EnumMixin],
      domain: [1, 2, 3, 4, 5, 6, 7, 8]
    }
  })
  .localize({$type: bundle.structured.LineWidth})
  .configure({$type: module.config});
});
