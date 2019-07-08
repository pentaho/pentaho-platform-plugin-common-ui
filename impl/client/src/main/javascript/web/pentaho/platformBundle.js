/*!
 * Copyright 2018 - 2019 Hitachi Vantara. All rights reserved.
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
  "./platformCore",

  // Type API
  "pentaho/type/loader",

  // Data API
  "pentaho/data/Table",
  "pentaho/data/TableView",
  "pentaho/data/filter/standard",

  // Viz. API
  "pentaho/visual/Model",
  "pentaho/visual/impl/View",
  "pentaho/visual/ModelAdapter",
  "pentaho/visual/action/WellKnownErrorNames",
  "pentaho/visual/color/util",
  "pentaho/visual/color/palettes/all",
  "pentaho/visual/models/all",
  "pentaho/visual/role/adaptation/allStrategies",
  "pentaho/visual/role/util",
  "pentaho/visual/scene/Base",
  "pentaho/visual/util",

  // Ends up being requested before isBrowsable: false is read, so it's just best to include it.
  "pentaho/visual/samples/calc/Model",

  // CCC views
  "pentaho/ccc/visual/all"
], function() {
  // Function must be here, or r.js generates a bundle whose last module, this one, is anonymous...
  "use strict";
});
