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
  "pentaho/visual/role/adaptation/impl/TupleAdapter",
  "pentaho/data/Table",
  "pentaho/data/TableView"
], function(Context, Adapter, DataTable, DataView) {

  "use strict";

  /* globals describe, it, beforeEach, beforeAll, spyOn */

  xdescribe("pentaho.visual.role.adaptation.TupleStrategy", function() {

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
              "pentaho/visual/role/adaptation/tuple"
            ], function(_VisualModel, _Strategy) {

              var CustomVisualModel = _VisualModel.extend({
                $type: {
                  props: [
                    {
                      name: "roleKey",
                      base: "pentaho/visual/role/property",
                      isVisualKey: true,
                      modes: [
                        {dataType: ["string"], isContinuous: false},
                        {dataType: "element", isContinuous: false},
                        {dataType: ["number"], isContinuous: true},
                        {dataType: ["number"], isContinuous: false},
                        {dataType: "list", isContinuous: false}
                      ]
                    },
                    {
                      name: "roleNonKey",
                      base: "pentaho/visual/role/property",
                      isVisualKey: false,
                      modes: [
                        {dataType: ["number"], isContinuous: true}
                      ]
                    }
                  ]
                }
              });

              Strategy = _Strategy;

              dataTable = new DataTable(getJSONDataset());

              propTypeKey = CustomVisualModel.type.get("roleKey");
              propTypeNonKey = CustomVisualModel.type.get("roleNonKey");

              modes.StringListCategorical = propTypeKey.modes.at(0);
              modes.ElementCategorical = propTypeKey.modes.at(1);
              modes.NumberListContinuous = propTypeKey.modes.at(2);
              modes.NumberListCategorical = propTypeKey.modes.at(3);
              modes.ElementListCategorical = propTypeKey.modes.at(4);
            });
          })
          .then(done, done.fail);

    });

    it("should be possible to create an instance", function() {
      var strategy = new Strategy();
      expect(strategy instanceof Strategy).toBe(true);
    });

    describe("#getMapper(propType, inputData, mode)", function() {

      it("should return null if given a mode having a non-list data type", function() {

        var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.StringCategorical1]);

        var strategy = new Strategy();
        var mapper = strategy.getMapper(propTypeKey, dataView, modes.ElementCategorical);

        expect(mapper).toBe(null);
      });

      describe("when given a mode having a list data type", function() {

        it("should return null if the data type of at least one of the columns " +
            "is not assignable to the mode's element type", function() {

          var dataView = new DataView(dataTable).setSourceColumns([
            datasetColumns.NumberCategorical1,
            datasetColumns.StringCategorical1
          ]);

          var strategy = new Strategy();
          var mapper = strategy.getMapper(propTypeKey, dataView, modes.NumberListCategorical);

          expect(mapper).toBe(null);
        });

        describe("when all columns have mode-compatible data types", function() {

          describe("when the mode is continuous", function() {

            it("should return null if at least one of the columns is categorical", function() {

              var dataView = new DataView(dataTable).setSourceColumns([
                datasetColumns.NumberContinuous1,
                datasetColumns.NumberCategorical1
              ]);

              var strategy = new Strategy();
              var mapper = strategy.getMapper(propTypeKey, dataView, modes.NumberListContinuous);

              expect(mapper).toBe(null);
            });

            describe("when all columns are continuous", function() {

              it("should return a TupleAdapter", function() {

                var dataView = new DataView(dataTable).setSourceColumns([
                  datasetColumns.NumberContinuous1,
                  datasetColumns.NumberContinuous2
                ]);

                var strategy = new Strategy();
                var mapper = strategy.getMapper(propTypeKey, dataView, modes.NumberListContinuous);

                expect(mapper instanceof Adapter).toBe(true);
              });
            });
          });

          describe("when the mode is categorical", function() {

            it("should return a TupleAdapter, even if some columns are continuous", function() {

              var dataView = new DataView(dataTable).setSourceColumns([
                datasetColumns.NumberCategorical1,
                datasetColumns.StringCategorical1,
                datasetColumns.NumberContinuous2
              ]);

              var strategy = new Strategy();
              var mapper = strategy.getMapper(propTypeKey, dataView, modes.ElementListCategorical);

              expect(mapper instanceof Adapter).toBe(true);
            });

            it("should return a TupleAdapter, even if the visual role is not key", function() {

              var dataView = new DataView(dataTable).setSourceColumns([
                datasetColumns.NumberContinuous1
              ]);

              var strategy = new Strategy();
              // mode: [number] / continuous
              var mapper = strategy.getMapper(propTypeNonKey, dataView, propTypeNonKey.modes.at(0));

              expect(mapper instanceof Adapter).toBe(true);
            });

            it("should return a mapper with the given inputData and mode", function() {

              var dataView = new DataView(dataTable).setSourceColumns([datasetColumns.StringCategorical1]);

              var strategy = new Strategy();
              var mapper = strategy.getMapper(propTypeKey, dataView, modes.StringListCategorical);

              expect(mapper.inputData).toBe(dataView);
              expect(mapper.mode).toBe(modes.StringListCategorical);
            });
          });
        });
      });
    });
  });
});
