/*!
 * Copyright 2019 Hitachi Vantara.  All rights reserved.
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
  "pentaho/visual/samples/calc/Model",
  "pentaho/visual/samples/calc/View",
  "pentaho/data/Table"
], function(CalcModel, CalcView, Table) {

  "use strict";

  describe("pentaho.visual.samples.calc.View", function() {

    it("should be a function", function() {
      expect(typeof CalcView).toBe("function");
    });

    it("should be possible to render an instance", function() {
      var tableSpec = {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "sales", type: "number", label: "Sales"}
        ],
        rows: [
          {c: [{v: "Portugal"}, {v: 12000}]},
          {c: [{v: "Ireland"}, {v: 6000}]}
        ]
      };

      var model = new CalcModel({
        width: 200,
        height: 200,
        levels: {fields: [{name: "country"}]},
        measure: {fields: [{name: "sales"}]},
        data: new Table(tableSpec),
        operation: "sum"
      });

      var view = new CalcView({
        model: model,
        domContainer: document.createElement("div")
      });

      return model.update().then(function() {
        expect(view.domContainer.firstChild.innerHTML).toContain("18000.00");
      });
    });
  });
});
