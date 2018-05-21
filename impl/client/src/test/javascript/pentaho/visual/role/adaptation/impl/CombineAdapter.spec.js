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
/*
define([
  "pentaho/type/Context",
  "pentaho/visual/role/adaptation/impl/CombineAdapter",
  "pentaho/data/Table",
  "pentaho/data/TableView"
], function(Context, Adapter, DataTable, DataView) {

  "use strict";

  describe("pentaho.visual.role.adaptation.impl.CombineAdapter", function() {

    var propType;
    var dataTable;
    var modes = {};
    var strategy;

    var valueSeparator = "^";
    var formattedSeparator = " ^ ";

    var datasetColumns = {
      StringCategorical1: 0,
      StringCategorical2: 1,
      NumberContinuous1: 2,
      NumberContinuous2: 3,
      NumberCategorical1: 4,
      BooleanCategorical1: 5,
      DateContinuous1: 6,
      DateCategorical1: 7,
      StringCategorical3Nulls: 8
    };

    function getJSONDataset() {
      return {
        model: [
          {name: "country", type: "string", label: "Country", isContinuous: false},
          {name: "city", type: "string", label: "City", isContinuous: false},
          {name: "sales", type: "number", label: "Sales", isContinuous: true},
          {name: "quantity", type: "number", label: "Qty", isContinuous: true},
          {name: "code", type: "number", label: "Code", isContinuous: false},
          {name: "bit", type: "boolean", label: "Bit", isContinuous: false},
          {name: "date", type: "date", label: "Date", isContinuous: true},
          {name: "dateCateg", type: "date", label: "Date Categ", isContinuous: false},
          {name: "nulls", type: "string", label: "Nulls", isContinuous: false}
        ],
        rows: [
          {c: [
            {v: "PT", f: "Portugal"}, {v: "LIS", f: "Lisboa"},
            {v: 12000, f: "12000.00"}, {v: 300, f: "300"},
            {v: 1234, f: "ABC"}, {v: true, f: "ON"},
            {v: "2006-01-01", f: "A"}, {v: "2006-01-02", f: "C"},
            {v: null}
          ]},
          {c: [
            {v: "IRL", f: "Ireland"}, {v: "DUB", f: "Dublin"},
            {v: 6000, f: "6000.00"}, {v: 500, f: "500"},
            {v: 1233, f: "ABD"}, {v: false, f: "OFF"},
            {v: "2006-01-03", f: "B"}, {v: "2006-01-04", f: "D"},
            {v: null}
          ]}
        ]
      };
    }

    function buildMapper(columnIndexes, mode) {

      var dataView = new DataView(dataTable).setSourceColumns(columnIndexes);

      return new Adapter(strategy, propType, dataView, mode, valueSeparator, formattedSeparator);
    }

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(context) {
            return context.getDependencyApplyAsync([
              "pentaho/visual/base/Model"
            ], function(VisualModel) {

              var CustomVisualModel = VisualModel.extend({
                $type: {
                  props: [
                    {
                      name: "roleA",
                      base: "pentaho/visual/role/Property",
                      modes: [
                        {dataType: "string", isContinuous: false},
                        {dataType: "element", isContinuous: false}
                      ],
                      strategies: [
                        {_: "pentaho/visual/role/adaptation/combine"}
                      ]
                    }
                  ]
                }
              });

              dataTable = new DataTable(getJSONDataset());

              propType = CustomVisualModel.type.get("roleA");
              modes.StringCategorical = propType.modes.at(0);
              modes.ElementCategorical = propType.modes.at(1);
              strategy = propType.strategies.at(0);
            });
          })
          .then(done, done.fail);

    });

    it("should be possible to create an instance", function() {

      var mapper = buildMapper([datasetColumns.StringCategorical1], modes.StringCategorical);

      expect(mapper instanceof Adapter).toBe(true);
    });

    it("should have dataType equal to string", function() {

      var mapper = buildMapper([datasetColumns.NumberCategorical1], modes.ElementCategorical);

      var stringType = propType.context.get("string").type;

      expect(mapper.dataType).toBe(stringType);
    });

    function testMapping(columnIndexes, mode) {

      var mapper;

      beforeEach(function() {
        mapper = buildMapper(columnIndexes, mode);
      });

      describe("#getValue(rowIndex)", function() {

        function testGetValue(rowIndex) {

          var value = mapper.getValue(rowIndex);

          var i = -1;
          var L = columnIndexes.length;
          var values = [];
          while(++i < L) { values.push(dataTable.getValueKey(rowIndex, columnIndexes[i])); }
          var realValue = values.join(valueSeparator);

          expect(value).toBe(realValue);
        }

        it("should return the correct value (row 0)", function() {

          testGetValue(0);
        });

        it("should return the correct value (row 1)", function() {

          testGetValue(1);
        });
      });

      describe("#getFormatted(rowIndex)", function() {

        function testGetFormatted(rowIndex) {

          var formatted = mapper.getFormatted(rowIndex);

          var i = -1;
          var L = columnIndexes.length;
          var formattedValues = [];
          while(++i < L) {
            var formattedValue = dataTable.getFormattedValue(rowIndex, columnIndexes[i]);
            if(formattedValue) formattedValues.push(formattedValue);
          }
          var realFormatted = formattedValues.length ? formattedValues.join(formattedSeparator) : null;

          expect(formatted).toBe(realFormatted);
        }

        it("should return the correct formatted value (row 0)", function() {

          testGetFormatted(0);
        });

        it("should return the correct formatted value (row 1)", function() {

          testGetFormatted(1);
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

    describe("single column", function() {

      describe("when [string/categorical] columns", function() {

        var columns = [datasetColumns.StringCategorical1];

        testMapping(columns, modes.StringCategorical);
      });

      describe("when [string/categorical/null] columns", function() {

        var columns = [datasetColumns.StringCategorical3Nulls];

        testMapping(columns, modes.StringCategorical);
      });

      describe("when [number/continuous] columns", function() {

        var columns = [datasetColumns.NumberContinuous1];

        testMapping(columns, modes.StringCategorical);
      });

      describe("when [number/categorical] columns", function() {

        var columns = [datasetColumns.NumberCategorical1];

        testMapping(columns, modes.StringCategorical);
      });

      describe("when [boolean/categorical] columns", function() {

        var columns = [datasetColumns.BooleanCategorical1];

        testMapping(columns, modes.StringCategorical);
      });

      describe("when [date/continuous] columns", function() {

        var columns = [datasetColumns.DateContinuous1];

        testMapping(columns, modes.StringCategorical);
      });
    });

    describe("two similar columns", function() {

      describe("when [string/categorical, string/categorical] columns", function() {

        var columns = [datasetColumns.StringCategorical1, datasetColumns.StringCategorical2];

        testMapping(columns, modes.StringCategorical);
      });

      describe("when [string/categorical, string/categorical/null] columns", function() {

        var columns = [datasetColumns.StringCategorical1, datasetColumns.StringCategorical3Nulls];

        testMapping(columns, modes.StringCategorical);
      });

      describe("when [number/continuous, number/continuous] columns", function() {

        var columns = [datasetColumns.NumberContinuous1, datasetColumns.NumberContinuous2];

        testMapping(columns, modes.StringCategorical);
      });

      describe("when [number/categorical, number/continuous] columns", function() {

        var columns = [datasetColumns.NumberCategorical1, datasetColumns.NumberContinuous1];

        testMapping(columns, modes.StringCategorical);
      });

      describe("when [date/continuous, date/categorical] columns", function() {

        var columns = [datasetColumns.DateContinuous1, datasetColumns.DateCategorical1];

        testMapping(columns, modes.StringCategorical);
      });
    });

    describe("several columns of mixed data type and categorical nature", function() {

      describe("when [string/categorical, number/categorical, date/continuous] columns", function() {

        var columns = [
          datasetColumns.StringCategorical1,
          datasetColumns.NumberCategorical1,
          datasetColumns.DateContinuous1
        ];

        testMapping(columns, modes.StringCategorical);
      });

      describe("when [boolean/categorical, number/continuous, date/categorical] columns", function() {

        var columns = [
          datasetColumns.BooleanCategorical1,
          datasetColumns.NumberContinuous1,
          datasetColumns.DateCategorical1
        ];

        testMapping(columns, modes.StringCategorical);
      });
    });
  });

});
*/
