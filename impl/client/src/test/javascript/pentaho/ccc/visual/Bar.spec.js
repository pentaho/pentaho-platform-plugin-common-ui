/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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

    it("should be possible to render an instance", function(done) {
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

      view.update().then(function() {
        expect(view._renderCore).toHaveBeenCalled();
        done();
      }, done.fail);
    });
  });
});
