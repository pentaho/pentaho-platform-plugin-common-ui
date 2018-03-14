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
  "pentaho/visual/role/adaptation/impl/IdentityAdapter",
  "pentaho/data/Table",
  "pentaho/data/TableView"
], function(Context, Adapter, DataTable, DataView) {

  "use strict";

  /* globals describe, it, beforeEach, beforeAll, spyOn */

  xdescribe("pentaho.visual.role.adaptation.IdentityStrategy", function() {

    var Strategy;

    var propType;
    var dataTable;
    var modes = {};

    var datasetColumns = {
      StringCategorical: 0,
      NumberContinuous: 1,
      NumberCategorical: 2
    };

    function getJSONDataset() {
      return {
        model: [
          {name: "country", type: "string", label: "Country", isContinuous: false},
          {name: "sales", type: "number", label: "Sales", isContinuous: true},
          {name: "code", type: "number", label: "Code", isContinuous: false}
        ],
        rows: [
          {c: [{v: "Portugal"}, {v: 12000}]},
          {c: [{v: "Ireland"}, {v: 6000}]}
        ]
      };
    }

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(context) {
            return context.getDependencyApplyAsync([
              "pentaho/visual/base/model",
              "pentaho/visual/role/adaptation/identity"
            ], function(_VisualModel, _Strategy) {

              var CustomVisualModel = _VisualModel.extend({
                $type: {
                  props: [
                    {
                      name: "roleA",
                      base: "pentaho/visual/role/property",
                      modes: [
                        {dataType: "number", isContinuous: true},
                        {dataType: "number", isContinuous: false},
                        {dataType: "string", isContinuous: false}
                      ]
                    }
                  ]
                }
              });

              Strategy = _Strategy;

              dataTable = new DataTable(getJSONDataset());

              propType = CustomVisualModel.type.get("roleA");
              modes.NumberContinuous = propType.modes.at(0);
              modes.NumberCategorical = propType.modes.at(1);
              modes.StringCategorical = propType.modes.at(2);
            });
          })
          .then(done, done.fail);

    });

    it("should be possible to create an instance", function() {
      var strategy = new Strategy();
      expect(strategy instanceof Strategy).toBe(true);
    });

    describe("#getMapper(propType, inputData, mode)", function() {

      it("should return null if given a table with more than one column", function() {

        var strategy = new Strategy();
        var mapper = strategy.getMapper(propType, dataTable, modes.NumberCategorical);

        expect(mapper).toBe(null);
      });

      describe("when given a table with a single column", function() {

        it("should return null if given a number / categorical column and a number / continuous mode", function() {

          var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberCategorical]);

          var strategy = new Strategy();
          var mapper = strategy.getMapper(propType, dataView, modes.NumberContinuous);

          expect(mapper).toBe(null);
        });

        it("should return null if given a string / categorical column and a number / categorical mode", function() {

          var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.StringCategorical]);

          var strategy = new Strategy();
          var mapper = strategy.getMapper(propType, dataView, modes.NumberCategorical);

          expect(mapper).toBe(null);
        });

        // Can downgrade continuous column into a categorical mode.
        it("should return an IdentityAdapter if given a number / continuous column " +
            "and a number / categorical mode", function() {

          var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberContinuous]);

          var strategy = new Strategy();
          var mapper = strategy.getMapper(propType, dataView, modes.NumberCategorical);

          expect(mapper instanceof Adapter).toBe(true);
        });

        // Exact match
        it("should return an IdentityAdapter if given a number / continuous column " +
            "and a number / continuous mode", function() {

          var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberContinuous]);

          var strategy = new Strategy();
          var mapper = strategy.getMapper(propType, dataView, modes.NumberContinuous);

          expect(mapper instanceof Adapter).toBe(true);
        });

        // Exact match
        it("should return an IdentityAdapter if given a number / categorical column " +
            "and a number / categorical mode", function() {

          var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberCategorical]);

          var strategy = new Strategy();
          var mapper = strategy.getMapper(propType, dataView, modes.NumberCategorical);

          expect(mapper instanceof Adapter).toBe(true);
        });

        it("should return an IdentityAdapter if given a string / categorical column " +
            "and a string / categorical mode", function() {

          var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.StringCategorical]);

          var strategy = new Strategy();
          var mapper = strategy.getMapper(propType, dataView, modes.StringCategorical);

          expect(mapper instanceof Adapter).toBe(true);
        });

        it("should return a mapper with the given inputData and mode", function() {

          var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.StringCategorical]);

          var strategy = new Strategy();
          var mapper = strategy.getMapper(propType, dataView, modes.StringCategorical);

          expect(mapper.inputData).toBe(dataView);
          expect(mapper.mode).toBe(modes.StringCategorical);
        });
      });
    });
  });
});
