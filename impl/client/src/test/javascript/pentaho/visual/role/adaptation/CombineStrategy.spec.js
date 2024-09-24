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
  "pentaho/visual/role/adaptation/CombineStrategy",
  "pentaho/type/List",
  "pentaho/type/Element",
  "pentaho/type/String",
  "pentaho/type/Number",
  "pentaho/type/Complex",
  "pentaho/data/Table"
], function(Strategy, List, Element, PentahoString, PentahoNumber, Complex, DataTable) {

  "use strict";

  describe("pentaho.visual.role.adaptation.CombineStrategy", function() {

    var dataTable;

    var datasetFieldIndexes1 = {
      orderNumber: 0,
      country: 1,
      measure: 2
    };

    function getDataSpec1() {
      return {
        "cols": [
          "[Order].[Number]",
          "[Region].[Country]",
          "[MEASURE:0]"
        ],
        "rows": [
          {
            "c": [
              {
                "v": 1002,
                "f": "1002"
              },
              {
                "v": "[Region].[PT]",
                "f": "Portugal"
              },
              {
                "v": 110756.29999999999,
                "f": "110,756"
              }
            ]
          },
          {
            "c": [
              {
                "v": 1034,
                "f": "1034"
              },
              {
                "v": "[Region].[ES]",
                "f": "Spain"
              },
              {
                "v": 254838.01999999996,
                "f": "254,838"
              }
            ]
          },
          {
            "c": [
              {
                "v": 1055,
                "f": "1055"
              },
              {
                "v": "[Region].[FR]",
                "f": "France"
              },
              {
                "v": 187418.05,
                "f": "187,418"
              }
            ]
          }
        ],
        "model": {
          "attrs": [
            {
              "name": "[Order].[Number]",
              "label": "Order number",
              "type": "number",
              "isKey": true
            },
            {
              "name": "[Region].[Country]",
              "label": "Country",
              "type": "string",
              "isKey": true,
              "members": [
                {
                  "v": "[Region].[PT]",
                  "f": "Portugal"
                },
                {
                  "v": "[Region].[ES]",
                  "f": "Spain"
                },
                {
                  "v": "[Region].[FR]",
                  "f": "France"
                }
              ]
            },
            {
              "name": "[MEASURE:0]",
              "label": "Sales",
              "type": "number",
              "isKey": false,
              "isPercent": false
            }
          ]
        }
      };
    }

    // ---

    function Cell(value, formatted) {
      this.value = value;
      this.formatted = formatted;
    }

    Cell.prototype.valueOf = function() {
      return this.value;
    };

    Cell.prototype.toString = function() {
      return this.formatted;
    };

    // ---

    describe(".Type", function() {

      describe("#getInputTypeFor(outputDataType, isVisualKeyEf)", function() {

        it("should return null if not given a string type, independently of isVisualKeyEf", function() {
          var inputType = Strategy.type.getInputTypeFor(List.type, true);
          expect(inputType).toBe(null);

          inputType = Strategy.type.getInputTypeFor(List.type, false);
          expect(inputType).toBe(null);

          inputType = Strategy.type.getInputTypeFor(PentahoNumber.type, true);
          expect(inputType).toBe(null);

          inputType = Strategy.type.getInputTypeFor(PentahoNumber.type, false);
          expect(inputType).toBe(null);

          inputType = Strategy.type.getInputTypeFor(Element.type, true);
          expect(inputType).toBe(null);

          inputType = Strategy.type.getInputTypeFor(Element.type, false);
          expect(inputType).toBe(null);

          var Foo = Complex.extend();

          inputType = Strategy.type.getInputTypeFor(Foo.type, true);
          expect(inputType).toBe(null);

          inputType = Strategy.type.getInputTypeFor(Foo.type, false);
          expect(inputType).toBe(null);
        });

        it("should return null if given a string type but isVisualKeyEf is false", function() {
          var inputType = Strategy.type.getInputTypeFor(PentahoString.type, false);
          expect(inputType).toBe(null);
        });

        it("should return the List type if given a string type and isVisualKeyEf is true", function() {
          var inputType = Strategy.type.getInputTypeFor(PentahoString.type, true);
          expect(inputType).toBe(List.type);
        });

        it("should return the List type if given a string type and isVisualKeyEf is undefined", function() {
          var inputType = Strategy.type.getInputTypeFor(PentahoString.type, undefined);
          expect(inputType).toBe(List.type);
        });
      });

      describe("#validateApplication(schemaData, inputFieldIndexes)", function() {

        beforeEach(function() {
          dataTable = new DataTable(getDataSpec1());
        });

        describe("when one input field", function() {

          it("should return an object with isValid: true", function() {
            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes1.orderNumber]);

            expect(result).toEqual(jasmine.objectContaining({isValid: true}));
          });

          it("should return an object with addsFields: true", function() {
            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes1.orderNumber]);

            expect(result).toEqual(jasmine.objectContaining({addsFields: true}));
          });
        });

        describe("when more than one input field", function() {

          it("should return an object with isValid: true", function() {
            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes1.orderNumber, datasetFieldIndexes1.country]);

            expect(result).toEqual(jasmine.objectContaining({isValid: true}));
          });

          it("should return an object with addsFields: true", function() {
            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes1.orderNumber, datasetFieldIndexes1.country]);

            expect(result).toEqual(jasmine.objectContaining({addsFields: true}));
          });
        });
      });

      describe("#apply(data, inputFieldIndexes)", function() {

        beforeEach(function() {
          dataTable = new DataTable(getDataSpec1());
        });

        it("should return a strategy instance", function() {
          var strategy = Strategy.type.apply(dataTable, [
            datasetFieldIndexes1.orderNumber,
            datasetFieldIndexes1.country
          ]);
          expect(strategy instanceof Strategy).toBe(true);
        });

        it("should return a strategy having the given data", function() {
          var strategy = Strategy.type.apply(dataTable, [
            datasetFieldIndexes1.orderNumber,
            datasetFieldIndexes1.country
          ]);
          expect(strategy.data).toBe(dataTable);
        });

        it("should return a strategy having the given inputFieldIndexes", function() {
          var inputFieldIndexes = [
            datasetFieldIndexes1.orderNumber,
            datasetFieldIndexes1.country
          ];
          var strategy = Strategy.type.apply(dataTable, inputFieldIndexes);
          expect(strategy.inputFieldIndexes).toEqual(inputFieldIndexes);
        });

        it("should add a column of string type to the data table and " +
          "return a strategy with its index as the only content of outputFieldIndexes", function() {

          var strategy = Strategy.type.apply(dataTable, [
            datasetFieldIndexes1.orderNumber,
            datasetFieldIndexes1.country
          ]);

          var afterColsCount = dataTable.getNumberOfColumns();

          expect(afterColsCount).toBe(4);

          expect(strategy.outputFieldIndexes.length).toEqual(1);

          var newColIndex = strategy.outputFieldIndexes[0];
          var newCol = dataTable.getColumnAttribute(newColIndex);

          expect(newCol.type).toEqual("string");

          expect(dataTable.getValue(0, newColIndex)).toBe("1002~[Region].[PT]");
          expect(dataTable.getValue(1, newColIndex)).toBe("1034~[Region].[ES]");
          expect(dataTable.getValue(2, newColIndex)).toBe("1055~[Region].[FR]");
        });

        it("should deal with null input cells", function() {

          dataTable.getCell(1, datasetFieldIndexes1.orderNumber).value = null;

          var strategy = Strategy.type.apply(dataTable, [
            datasetFieldIndexes1.orderNumber,
            datasetFieldIndexes1.country
          ]);

          var newColIndex = strategy.outputFieldIndexes[0];

          var newCell = dataTable.getCell(1, newColIndex);

          expect(newCell.value).toBe("~[Region].[ES]");
        });

        it("should build labels for the created column and the values", function() {

          var strategy = Strategy.type.apply(dataTable, [
            datasetFieldIndexes1.orderNumber,
            datasetFieldIndexes1.country
          ]);

          var newColIndex = strategy.outputFieldIndexes[0];
          var newCol = dataTable.getColumnAttribute(newColIndex);

          expect(newCol.label).toEqual("Order number ~ Country");

          expect(dataTable.getFormattedValue(0, newColIndex)).toBe("1002 ~ Portugal");
          expect(dataTable.getFormattedValue(1, newColIndex)).toBe("1034 ~ Spain");
          expect(dataTable.getFormattedValue(2, newColIndex)).toBe("1055 ~ France");
        });
      });
    });

    describe("#isInvertible", function() {

      it("should return true", function() {

        dataTable = new DataTable(getDataSpec1());

        var strategy = Strategy.type.apply(dataTable, [0]);

        expect(strategy.isInvertible).toBe(true);
      });

    });

    describe("#map(inputValues)", function() {

      var strategy;

      beforeEach(function() {
        dataTable = new DataTable(getDataSpec1());

        strategy = Strategy.type.apply(dataTable, [
          datasetFieldIndexes1.orderNumber,
          datasetFieldIndexes1.country
        ]);
      });

      it("should return a cell corresponding to a given existing value", function() {

        var outputCells = strategy.map([1034, "[Region].[ES]"]);

        expect(outputCells).toEqual([jasmine.objectContaining({value: "1034~[Region].[ES]"})]);
      });

      it("should return a cell corresponding to a given (equal value) existing cells", function() {

        var outputCells = strategy.map([new Cell(1034, "1034"), new Cell("[Region].[ES]", "Spain")]);

        expect(outputCells).toEqual([jasmine.objectContaining({value: "1034~[Region].[ES]"})]);
      });

      it("should return null if given a non-existing value", function() {

        var outputCells = strategy.map([1032, "[Region].[ES]"]);

        expect(outputCells).toBe(null);
      });
    });

    describe("#invert(outputValues)", function() {

      var strategy;

      beforeEach(function() {

        dataTable = new DataTable(getDataSpec1());

        dataTable.getCell(1, datasetFieldIndexes1.orderNumber).value = null;

        strategy = Strategy.type.apply(dataTable, [
          datasetFieldIndexes1.orderNumber,
          datasetFieldIndexes1.country
        ]);
      });

      it("should return a cell corresponding to a given existing value", function() {

        var inputCells = strategy.invert(["1002~[Region].[PT]"]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: 1002, formatted: "1002"}),
          jasmine.objectContaining({value: "[Region].[PT]", formatted: "Portugal"})
        ]);
      });

      it("should return a cell corresponding to a given (equal value) existing cell", function() {

        var inputCells = strategy.invert([
          new Cell("1002~[Region].[PT]", "Don't care")
        ]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: 1002, formatted: "1002"}),
          jasmine.objectContaining({value: "[Region].[PT]", formatted: "Portugal"})
        ]);
      });

      it("should return null if given a non-existing value", function() {

        var inputCells = strategy.invert([10345]);

        expect(inputCells).toBe(null);
      });

      it("should work with null values", function() {

        var inputCells = strategy.invert(["~[Region].[ES]"]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: null}),
          jasmine.objectContaining({value: "[Region].[ES]", formatted: "Spain"})
        ]);
      });
    });
  });
});
