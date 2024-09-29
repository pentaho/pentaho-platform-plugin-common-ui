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
  "pentaho/visual/models/Bar",
  "pentaho/ccc/visual/Bar",
  "pentaho/ccc/visual/Abstract",
  "pentaho/data/Table"
], function(BarModel, BarView, AbstractView, Table) {

  "use strict";

  describe("pentaho.visual.ccc.views.Bar", function() {

    it("should be a function", function() {
      expect(typeof BarView).toBe("function");
    });

    it("should be a sub-class of `views.Abstract`", function() {
      expect(BarView.prototype instanceof AbstractView).toBe(true);
    });

    it("should be possible to create an instance given a model", function() {
      var model = new BarModel({
        data:     {v: new Table({})},
        measures: {fields: [{name: "foo"}]}
      });

      var view = new BarView({
        width:  1,
        height: 1,
        domContainer: document.createElement("div"),
        model: model
      });
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

      var model = new BarModel({
        rows:     {fields: [{name: "country"}]},
        measures: {fields: [{name: "sales"}]},
        data:     new Table(tableSpec),
        showLegend: true
      });

      var view = new BarView({
        width:    200,
        height:   200,
        domContainer: document.createElement("div"),
        model: model
      });

      spyOn(view, "_renderCore");

      return model.update().then(function() {
        expect(view._renderCore).toHaveBeenCalled();
      });
    });
  });
});
