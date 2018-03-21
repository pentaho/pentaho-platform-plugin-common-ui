/*!
 * Copyright 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/data/Table",
  "../role/adaptationUtil"
], function(Context, Table, adaptationUtil) {

  "use strict";

  /* globals describe, it, beforeEach, afterEach, beforeAll, spyOn */

  var context;
  var Model;
  var ModelAdapter;
  var buildAdapter = adaptationUtil.buildAdapter;
  var ModelWithStringRole;
  var ElementIdentityStrategy;

  describe("pentaho.visual.role.ExternalMapping", function() {

    var context;

    beforeEach(function(done) {

      Context.createAsync()
          .then(function(_context) {

            context = _context;

            return context.getDependencyApplyAsync([
              "pentaho/visual/base/model",
              "pentaho/visual/base/modelAdapter",
              "pentaho/visual/role/adaptation/strategy"
            ], function(_Model, _ModelAdapter, _BaseStrategy) {
              Model = _Model;
              ModelAdapter = _ModelAdapter;

              var mocks = adaptationUtil.createMocks(Model, ModelAdapter, _BaseStrategy);

              ModelWithStringRole = mocks.ModelWithStringRole;
              ElementIdentityStrategy = mocks.ElementIdentityStrategy;

            });
          })
          .then(done, done.fail);

    });

    function getDataSpec1() {
      return {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "product", type: "string", label: "Product"},
          {name: "sales", type: "number", label: "Sales"},
          {name: "date", type: "date", label: "Date"}
        ],
        rows: [
          {c: ["Portugal", "fish", 100, "2016-01-01"]},
          {c: ["Ireland", "beer", 200, "2016-01-02"]}
        ]
      };
    }

    describe("#adapter", function() {

      it("should get the current role adapter if the mapping is valid", function() {

        var strategies = [new ElementIdentityStrategy()];

        var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
          {
            name: "roleA",
            strategies: strategies
          }
        ]);

        var model = new ModelWithStringRole();

        var modelAdapter = new DerivedModelAdapter({
          model: model,
          data: new Table(getDataSpec1()),
          roleA: {
            fields: ["country"]
          }
        });

        var adapter1 = modelAdapter.roleA.adapter;

        expect(adapter1).not.toBe(null);
      });

      it("should get null if the mapping is valid", function() {

        var strategies = [new ElementIdentityStrategy()];

        var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
          {
            name: "roleA",
            strategies: strategies
          }
        ]);

        var model = new ModelWithStringRole();

        var modelAdapter = new DerivedModelAdapter({
          model: model,
          data: new Table(getDataSpec1()),
          roleA: {
            fields: ["sales"]
          }
        });

        var adapter1 = modelAdapter.roleA.adapter;

        expect(adapter1).toBe(null);
      });
    });

    describe("#mode", function() {

      it("should get the current mode if the mapping is valid", function() {

        var strategies = [new ElementIdentityStrategy()];

        var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
          {
            name: "roleA",
            strategies: strategies
          }
        ]);

        var model = new ModelWithStringRole();

        var modelAdapter = new DerivedModelAdapter({
          model: model,
          data: new Table(getDataSpec1()),
          roleA: {
            fields: ["country"]
          }
        });

        var mode = modelAdapter.roleA.mode;

        expect(mode).toBe(DerivedModelAdapter.type.get("roleA").modes.at(0));
      });

      it("should get null if the mapping is valid", function() {

        var strategies = [new ElementIdentityStrategy()];

        var DerivedModelAdapter = buildAdapter(ModelAdapter, ModelWithStringRole, [
          {
            name: "roleA",
            strategies: strategies
          }
        ]);

        var model = new ModelWithStringRole();

        var modelAdapter = new DerivedModelAdapter({
          model: model,
          data: new Table(getDataSpec1()),
          roleA: {
            fields: ["sales"]
          }
        });

        var mode = modelAdapter.roleA.mode;

        expect(mode).toBe(null);
      });
    });
  });
});
