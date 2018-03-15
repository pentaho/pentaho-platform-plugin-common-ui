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

  xdescribe("pentaho.visual.role.adaptation.impl.IdentityAdapter", function() {

    var propType;
    var dataTable;
    var modes = {};
    var strategy;

    var datasetColumns = {
      StringCategorical: 0,
      NumberContinuous: 1,
      NumberCategorical: 2,
      BooleanCategorical: 3,
      DateContinuous: 4,
      StringCategoricalNulls: 5
    };

    function getJSONDataset() {
      return {
        model: [
          {name: "country", type: "string", label: "Country", isContinuous: false},
          {name: "sales", type: "number", label: "Sales", isContinuous: true},
          {name: "code", type: "number", label: "Code", isContinuous: false},
          {name: "bit", type: "boolean", label: "Bit", isContinuous: false},
          {name: "date", type: "date", label: "Date", isContinuous: true},
          {name: "nulls", type: "string", label: "Nulls", isContinuous: false}
        ],
        rows: [
          {c: [
            {v: "Portugal", f: "PT"}, {v: 12000, f: "12000.00"}, {v: 1234, f: "ABC"},
            {v: true, f: "ON"}, {v: "2006-01-01", f: "A"},
            {v: null}
          ]},
          {c: [
            {v: "Ireland", f: "IRL"}, {v: 6000, f: "6000.00"}, {v: 1233, f: "ABD"},
            {v: false, f: "OFF"}, {v: "2006-01-02", f: "B"},
            {v: null}
          ]}
        ]
      };
    }

    function buildMapper(columnIndex, mode) {

      var dataView = new DataView(dataTable).setSourceColumns([columnIndex]);

      var columnType = propType.context.get(dataView.getColumnType(0)).type;

      return new Adapter(strategy, propType, dataView, mode, columnType);
    }

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(context) {
            return context.getDependencyApplyAsync([
              "pentaho/visual/base/model"
            ], function(VisualModel) {

              var CustomVisualModel = VisualModel.extend({
                $type: {
                  props: [
                    {
                      name: "roleA",
                      base: "pentaho/visual/role/property",
                      modes: [
                        {dataType: "number", isContinuous: true},
                        {dataType: "number", isContinuous: false},
                        {dataType: "string", isContinuous: false},
                        {dataType: "element", isContinuous: false},
                        {dataType: "element", isContinuous: true}
                      ],
                      strategies: [
                        {_: "pentaho/visual/role/adaptation/identity"}
                      ]
                    }
                  ]
                }
              });

              dataTable = new DataTable(getJSONDataset());

              propType = CustomVisualModel.type.get("roleA");
              modes.NumberContinuous = propType.modes.at(0);
              modes.NumberCategorical = propType.modes.at(1);
              modes.StringCategorical = propType.modes.at(2);
              modes.ElementCategorical = propType.modes.at(3);
              modes.ElementContinuous = propType.modes.at(4);
              strategy = propType.strategies.at(0);
            });
          })
          .then(done, done.fail);

    });

    it("should be possible to create an instance", function() {

      var mapper = buildMapper(datasetColumns.StringCategorical, modes.StringCategorical);

      expect(mapper instanceof Adapter).toBe(true);
    });

    it("should have dataType equal to the mapped column's data type", function() {

      var mapper = buildMapper(datasetColumns.StringCategorical, modes.ElementCategorical);

      var columnType = propType.context.get(mapper.inputData.getColumnType(0)).type;

      expect(mapper.dataType).toBe(columnType);
    });

    function testMapping(columnIndex, mode) {

      var mapper;

      beforeEach(function() {
        mapper = buildMapper(columnIndex, mode);
      });

      describe("#getValue(rowIndex)", function() {

        it("should return the correct value (row 0)", function() {
          var value = mapper.getValue(0);

          var realValue = dataTable.getValue(0, columnIndex);

          expect(value).toBe(realValue);
        });

        it("should return the correct value (row 1)", function() {
          var value = mapper.getValue(1);

          var realValue = dataTable.getValue(1, columnIndex);

          expect(value).toBe(realValue);
        });
      });

      describe("#getFormatted(rowIndex)", function() {

        it("should return the correct formatted value (row 0)", function() {
          var formatted = mapper.getFormatted(0);

          var realFormatted = dataTable.getFormattedValue(0, columnIndex);

          expect(formatted).toBe(realFormatted);
        });

        it("should return the correct formatted value (row 1)", function() {
          var formatted = mapper.getFormatted(1);

          var realFormatted = dataTable.getFormattedValue(1, columnIndex);

          expect(formatted).toBe(realFormatted);
        });
      });

      describe("#invertValue(value)", function() {

        it("should return the correct row if it was previously asked to getValue (row 0)", function() {

          mapper.getValue(1);

          var value = mapper.getValue(0);
          var rowIndex = mapper.invertValue(value);

          expect(rowIndex).toBe(0);
        });

        it("should return the correct row if it was previously asked to getValue (row 1)", function() {

          mapper.getValue(0);

          var value = mapper.getValue(1);
          var rowIndex = mapper.invertValue(value);

          expect(rowIndex).toBe(1);
        });
      });
    }

    describe("when string/categorical column to element/categorical mode", function() {

      testMapping(datasetColumns.StringCategorical, modes.ElementCategorical);
    });

    describe("when string/categorical/null column to string/categorical mode", function() {

      testMapping(datasetColumns.StringCategoricalNulls, modes.StringCategorical);
    });

    describe("when number/categorical column to element/categorical mode", function() {

      testMapping(datasetColumns.NumberCategorical, modes.ElementCategorical);
    });

    describe("when number/categorical column to number/categorical mode", function() {

      testMapping(datasetColumns.NumberCategorical, modes.NumberCategorical);
    });

    describe("when number/continuous column to number/categorical mode", function() {

      testMapping(datasetColumns.NumberContinuous, modes.NumberCategorical);
    });

    describe("when date/continuous column to element/continuous mode", function() {

      testMapping(datasetColumns.DateContinuous, modes.ElementContinuous);
    });

    describe("when date/continuous column to element/categorical mode", function() {

      testMapping(datasetColumns.DateContinuous, modes.ElementCategorical);
    });

    describe("when boolean/categorical column to element/categorical mode", function() {

      testMapping(datasetColumns.BooleanCategorical, modes.ElementCategorical);
    });
  });
});
