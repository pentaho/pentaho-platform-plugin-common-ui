/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

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
  "pentaho/ccc/visual/all",

  // Views from arbitrary graphical libraries
  "pentaho/visual/views/all"
], function() {
  // Function must be here, or r.js generates a bundle whose last module, this one, is anonymous...
  "use strict";
});
