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
  "pentaho/visual/util",
  "pentaho/data/Table"
], function(vizUtil, Table) {

  "use strict";

  var domContainer = document.getElementById("sandbox-container");

  var dataTable = new Table({
    model: [
      {name: "family", type: "string", label: "Family"},
      {name: "sales", type: "number", label: "Sales"}
    ],
    rows: [
      {c: [{v: "plains", f: "Plains"}, 123]},
      {c: [{v: "cars", f: "Cars"}, {v: 456}]}
    ]
  });

  var vizTypeId = "pentaho/visual/samples/calc/Model";
  var modelSpec = {
    width:  100,
    height: 100,
    data: dataTable,
    levels: {
      fields: ["family"]
    },
    measure: {
      fields: ["sales"]
    },
    operation: "avg"
  };

  vizUtil.getModelAndDefaultViewClassesAsync(vizTypeId)
    .then(function(classes) {

      var model = new classes.Model(modelSpec);
      var view = new classes.View({model: model, domContainer: domContainer});

      // Export for users to play with.
      window.viz = {view: view, model: model};

      return model.update();
    })
    .then(function() {
      console.log("Viz update finished");
    })
    .catch(function(error) {
      console.log("Viz update failed: " + error.message);
    });
});
