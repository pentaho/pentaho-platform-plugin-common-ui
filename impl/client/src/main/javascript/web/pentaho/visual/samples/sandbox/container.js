/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
