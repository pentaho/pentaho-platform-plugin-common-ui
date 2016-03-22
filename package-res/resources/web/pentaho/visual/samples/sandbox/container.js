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
  "pentaho/type/Context",
  "pentaho/visual/samples/calc/model",
  "pentaho/visual/samples/calc/View",
  "pentaho/data/Table"
], function(Context, modelFactory, View, Table) {

  var containerElement = document.querySelector(".sandbox-container");
  var vizElement = document.createElement("div");
  containerElement.appendChild(vizElement);

  var data = new Table({
    model: [
      {name: "family", type: "string", label: "Family"},
      {name: "sales", type: "number", label: "Sales"}
    ],
    rows: [
      {c: [{v: "plains", f: "Plains"}, 123]},
      {c: [{v: "cars", f: "Cars"}, {v: 456}]}
    ]
  });

  var context = new Context();
  var Model = context.get(modelFactory);
  var model = new Model({
    width: 0,
    height: 0,
    isInteractive: true,
    data: data,
    measure: "sales",
    operation: "avg"
  });

  var view = new View(vizElement, model);
  view.render().then(function() {
    console.log("render yielded", arguments);
  });

  window.app = {
    context: context,
    view: view,
    View: View,
    Model: Model
  };

});
