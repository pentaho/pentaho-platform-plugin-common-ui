/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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
  "pentaho/data/Table"
], function(Context, Table) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false*/
  /* global document:false*/

  describe("pentaho.visual.ccc.views.Bar", function() {

    var context;
    var BarModel;
    var BarView;
    var AbstractView;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {

            context = _context;

            return context.applyAsync([
              "pentaho/visual/models/bar",
              "pentaho/ccc/visual/bar",
              "pentaho/ccc/visual/abstract"
            ], function(_BarModel, _BarView, _AbstractView) {
              BarModel = _BarModel;
              BarView  = _BarView;
              AbstractView = _AbstractView;
            });
          })
          .then(done, done.fail);
    });

    it("should be a function", function() {
      expect(typeof BarView).toBe("function");
    });

    it("should be a sub-class of `views.Abstract`", function() {
      expect(BarView.prototype instanceof AbstractView).toBe(true);
    });

    it("should be possible to create an instance given a model", function() {
      var model = new BarModel({
        data:     {v: {}},
        measures: {attributes: [{name: "foo"}]}
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
        rows:     {attributes: [{name: "country"}]},
        measures: {attributes: [{name: "sales"}]},
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
