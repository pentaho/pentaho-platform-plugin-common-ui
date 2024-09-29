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
