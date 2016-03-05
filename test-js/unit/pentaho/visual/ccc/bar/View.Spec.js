/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "pentaho/visual/ccc/bar/View",
  "pentaho/visual/ccc/abstract/View",
  "pentaho/data/Table",
  "pentaho/visual/ccc/bar"
], function(Context, BarView, AbstractView, Table) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false*/
  /*global document:false*/

  var context = new Context(),
      BarModel = context.get("pentaho/visual/ccc/bar");

  describe("pentaho.visual.ccc.bar.View", function() {
    it("should be a function", function() {
      expect(typeof BarView).toBe("function");
    });

    it("should be a sub-class of `abstract.View`", function() {
      expect(BarView.prototype instanceof AbstractView).toBe(true);
    });

    it("should be possible to create an instance given an element and a model", function() {
      var model = new BarModel({
        width:    1,
        height:   1,
        data:     {v: {}},
        measures: ["foo"]
      });

      var elem = document.createElement("div");
      new BarView(elem, model);
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
        width:    200,
        height:   200,
        rows:     ["country"],
        measures: ["sales"],
        data:     new Table(tableSpec),
        showLegend: true
      });
      var elem = document.createElement("div");
      var view = new BarView(elem, model);

      spyOn(view, "_renderCore");

      view.render().then(function() {
        expect(view._renderCore).toHaveBeenCalled();
        done();
      }, done.fail);
    });
  });
});
