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
  "pentaho/visual/role/strategies/impl/CombineMapper",
  "pentaho/data/Table",
  "pentaho/data/TableView"
], function(Context, Mapper, DataTable, DataView) {

  "use strict";

  /* globals describe, it, beforeEach, beforeAll, spyOn */

  describe("pentaho.visual.role.strategies.Combine", function() {

    var Strategy;

    var propTypeKey;
    var propTypeNonKey;
    var dataTable;
    var modes = {};

    var datasetColumns = {
      StringCategorical1: 0,
      StringCategorical2: 1,
      NumberContinuous1: 2,
      NumberContinuous2: 3,
      NumberCategorical1: 4,
      NumberCategorical2: 5
    };

    function getJSONDataset() {
      return {
        model: [
          {name: "country", type: "string", label: "Country", isContinuous: false},
          {name: "city", type: "string", label: "City", isContinuous: false},
          {name: "sales", type: "number", label: "Sales", isContinuous: true},
          {name: "quantity", type: "number", label: "Qty", isContinuous: true},
          {name: "codeA", type: "number", label: "Code", isContinuous: false},
          {name: "codeB", type: "number", label: "Code", isContinuous: false}
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
              "pentaho/visual/role/strategies/combine"
            ], function(_VisualModel, _Strategy) {

              var CustomVisualModel = _VisualModel.extend({
                $type: {
                  props: [
                    {
                      name: "roleKey",
                      base: "pentaho/visual/role/property",
                      isVisualKey: true,
                      modes: [
                        {dataType: "string", isContinuous: false},
                        {dataType: "element", isContinuous: false},
                        {dataType: "number", isContinuous: true},
                        {dataType: "number", isContinuous: false}
                      ]
                    },
                    {
                      name: "roleNonKey",
                      base: "pentaho/visual/role/property",
                      isVisualKey: false
                    }
                  ]
                }
              });

              Strategy = _Strategy;

              dataTable = new DataTable(getJSONDataset());

              propTypeKey = CustomVisualModel.type.get("roleKey");
              propTypeNonKey = CustomVisualModel.type.get("roleNonKey");

              modes.StringCategorical = propTypeKey.modes.at(0);
              modes.ElementCategorical = propTypeKey.modes.at(1);
              modes.NumberContinuous = propTypeKey.modes.at(2);
              modes.NumberCategorical = propTypeKey.modes.at(3);
            });
          })
          .then(done, done.fail);

    });

    it("should be possible to create an instance", function() {
      var strategy = new Strategy();
      expect(strategy instanceof Strategy).toBe(true);
    });

    describe("#getMapper(propType, inputData, mode)", function() {

      it("should return null if given a non-key visual role", function() {

        var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.StringCategorical1]);

        var strategy = new Strategy();
        var mapper = strategy.getMapper(propTypeNonKey, dataView, propTypeNonKey.modes.at(0));

        expect(mapper).toBe(null);
      });

      describe("when given a key visual role property", function() {

        it("should return null if given a continuous mode", function() {

          var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberContinuous1]);

          var strategy = new Strategy();
          var mapper = strategy.getMapper(propTypeKey, dataView, modes.NumberContinuous);

          expect(mapper).toBe(null);
        });

        describe("when given a categorical mode", function() {

          it("should return null if given a mode having a number data type", function() {

            var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberCategorical1]);

            var strategy = new Strategy();
            var mapper = strategy.getMapper(propTypeKey, dataView, modes.NumberCategorical);

            expect(mapper).toBe(null);
          });

          it("should return a CombineMapper if given a mode having an element data type", function() {

            var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberCategorical1]);

            var strategy = new Strategy();
            var mapper = strategy.getMapper(propTypeKey, dataView, modes.ElementCategorical);

            expect(mapper instanceof Mapper).toBe(true);
          });

          it("should return a CombineMapper if given a mode having a string data type", function() {

            var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberContinuous1]);

            var strategy = new Strategy();
            var mapper = strategy.getMapper(propTypeKey, dataView, modes.StringCategorical);

            expect(mapper instanceof Mapper).toBe(true);
          });

          describe("when given a mode having a string data type", function() {

            it("should return a mapper when given one number / continuous column", function() {

              var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberContinuous1]);

              var strategy = new Strategy();
              var mapper = strategy.getMapper(propTypeKey, dataView, modes.StringCategorical);

              expect(mapper instanceof Mapper).toBe(true);
            });

            it("should return a mapper when given one number / categorical column", function() {

              var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberCategorical1]);

              var strategy = new Strategy();
              var mapper = strategy.getMapper(propTypeKey, dataView, modes.StringCategorical);

              expect(mapper instanceof Mapper).toBe(true);
            });

            it("should return a mapper when given more than one column, " +
                "having mixed data type and categorical status", function() {

              var dataView = new DataView(dataTable).setSourceColumns([
                datasetColumns.NumberCategorical1,
                datasetColumns.NumberContinuous1,
                datasetColumns.StringCategorical1,
                datasetColumns.StringCategorical2
              ]);

              var strategy = new Strategy();
              var mapper = strategy.getMapper(propTypeKey, dataView, modes.StringCategorical);

              expect(mapper instanceof Mapper).toBe(true);
            });

            it("should return a mapper with the given inputData and mode", function() {

              var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.NumberContinuous1]);

              var strategy = new Strategy();
              var mapper = strategy.getMapper(propTypeKey, dataView, modes.StringCategorical);

              expect(mapper.inputData).toBe(dataView);
              expect(mapper.mode).toBe(modes.StringCategorical);
            });
          });
        });
      });
    });
  });
});
