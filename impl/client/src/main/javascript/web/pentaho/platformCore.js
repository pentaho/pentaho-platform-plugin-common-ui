/*!
 * Copyright 2019 Hitachi Vantara. All rights reserved.
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
  "pentaho/config/service",
  "pentaho/module/service",
  "pentaho/module/metaService",
  "pentaho/module/metaOf",
  "pentaho/module/subtypeOf",
  "pentaho/module/subtypesOf",
  "pentaho/module/instanceOf",
  "pentaho/module/instancesOf",

  "pentaho/i18n/MessageBundle",
  "pentaho/i18n/LoadConfigAnnotation",

  "pentaho/theme/main",
  "pentaho/theme/LoadThemeAnnotation",

  "pentaho/csrf/service",

  "pentaho/lang/UserError",
  "pentaho/lang/RuntimeError",
  "pentaho/lang/Event",
  "pentaho/lang/EventSource",
  "pentaho/lang/Collection",
  "pentaho/util/date"
], function() {
  // Function must be here, or r.js generates a bundle whose last module, this one, is anonymous...
  "use strict";
});
