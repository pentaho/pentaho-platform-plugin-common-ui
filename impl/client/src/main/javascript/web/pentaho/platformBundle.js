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
  // Core
  "pentaho/config/service",
  "pentaho/module/service",
  "pentaho/module/metaService",
  "pentaho/module/metaOf",
  "pentaho/module/subtypeOf",
  "pentaho/module/subtypesOf",
  "pentaho/module/instanceOf",
  "pentaho/module/instancesOf",

  // Type API
  "pentaho/type/loader",

  // Data API
  "pentaho/data/Table",
  "pentaho/data/TableView",
  "pentaho/data/filter/standard",

  // Viz. API
  "pentaho/visual/base/Model",
  "pentaho/visual/base/View",
  "pentaho/visual/base/ModelAdapter",
  "pentaho/visual/color/utils",
  "pentaho/visual/color/palettes/all",
  "pentaho/visual/models/all",
  "pentaho/visual/role/adaptation/allStrategies",
  "pentaho/visual/role/util",
  "pentaho/visual/scene/Base",

  // CCC views
  "pentaho/ccc/visual/all"
], function() {
  "use strict";
});
