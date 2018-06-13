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
  "pentaho/visual/role/adaptation/EntityWithNumberKeyStrategy",
  "pentaho/type/List",
  "pentaho/type/Element",
  "pentaho/type/String",
  "pentaho/type/Number",
  "pentaho/type/Complex",
  "pentaho/data/Table"
], function(Strategy, List, Element, PentahoString, PentahoNumber, Complex, DataTable) {

  "use strict";

  describe("pentaho.visual.role.adaptation.EntityWithNumberKeyStrategy", function() {

    var dataTable;

    var datasetFieldIndexes1 = {
      numberKey: 0,
      other: 1,
      measure: 2
    };

    function getDataSpec1() {
      return {
        "cols": [
          "[ElapsedTime].[Value]",
          "[Time].[Other]",
          "[MEASURE:0]"
        ],
        "rows": [
          {
            "c": [
              {
                "v": "[ElapsedTime].[1002]",
                "f": "1002"
              },
              {
                "v": "[Time].[Other1]",
                "f": "Other1"
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
                "v": "[ElapsedTime].[1034]",
                "f": "1034"
              },
              {
                "v": "[Time].[Other2]",
                "f": "Other2"
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
                "v": "[ElapsedTime].[1055]",
                "f": "1055"
              },
              {
                "v": "[Time].[Other3]",
                "f": "Other3"
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
              "name": "[ElapsedTime].[Value]",
              "label": "Elapsed time",
              "type": "string",
              "isKey": true,
              "members": [
                {
                  "v": "[ElapsedTime].[1002]",
                  "f": "1002",
                  "p": {
                    "numberKey": 1002
                  }
                },
                {
                  "v": "[ElapsedTime].[1034]",
                  "f": "1034",
                  "p": {
                    "numberKey": 1034
                  }
                },
                {
                  "v": "[ElapsedTime].[1055]",
                  "f": "1055",
                  "p": {
                    "numberKey": 1055
                  }
                }
              ],
              "p": {
                "EntityWithNumberKey": {}
              }
            },
            {
              "name": "[Time].[Other]",
              "label": "Other",
              "type": "string",
              "isKey": true,
              "members": [
                {
                  "v": "[Time].[Other1]",
                  "f": "Other1"
                },
                {
                  "v": "[Time].[Other2]",
                  "f": "Other2"
                },
                {
                  "v": "[Time].[Other3]",
                  "f": "Other3"
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

      describe("#getInputTypeFor(outputDataType, isVisualKey)", function() {

        it("should return null if not given a number type, independently of isVisualKey", function() {
          var inputType = Strategy.type.getInputTypeFor(List.type, true);
          expect(inputType).toBe(null);

          inputType = Strategy.type.getInputTypeFor(List.type, false);
          expect(inputType).toBe(null);

          inputType = Strategy.type.getInputTypeFor(PentahoString.type, true);
          expect(inputType).toBe(null);

          inputType = Strategy.type.getInputTypeFor(PentahoString.type, false);
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

        it("should return null if given a date type but isVisualKey is false", function() {
          var inputType = Strategy.type.getInputTypeFor(PentahoNumber.type, false);
          expect(inputType).toBe(null);
        });

        it("should return the String type if given a number type and isVisualKey is true", function() {
          var inputType = Strategy.type.getInputTypeFor(PentahoNumber.type, true);
          expect(inputType).toBe(PentahoString.type);
        });
      });

      describe("#validateApplication(schemaData, inputFieldIndexes)", function() {

        beforeEach(function() {
          dataTable = new DataTable(getDataSpec1());
        });

        it("should return an object with isValid: true", function() {
          var result = Strategy.type.validateApplication(
            dataTable,
            [datasetFieldIndexes1.numberKey]);

          expect(result).toEqual(jasmine.objectContaining({isValid: true}));
        });

        it("should return an object with addsFields: true", function() {
          var result = Strategy.type.validateApplication(
            dataTable,
            [datasetFieldIndexes1.numberKey]);

          expect(result).toEqual(jasmine.objectContaining({addsFields: true}));
        });

        it("should return an object with isValid: false when the field is " +
          "not annotated with EntityWithNumberKey", function() {

          var result = Strategy.type.validateApplication(
            dataTable,
            [datasetFieldIndexes1.other]);

          expect(result).toEqual(jasmine.objectContaining({isValid: false}));
        });
      });

      describe("#apply(data, inputFieldIndexes)", function() {

        beforeEach(function() {
          dataTable = new DataTable(getDataSpec1());
        });

        it("should return a strategy instance", function() {
          var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.numberKey]);
          expect(strategy instanceof Strategy).toBe(true);
        });

        it("should return a strategy having the given data", function() {
          var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.numberKey]);
          expect(strategy.data).toBe(dataTable);
        });

        it("should return a strategy having the given inputFieldIndexes", function() {
          var inputFieldIndexes = [datasetFieldIndexes1.numberKey];
          var strategy = Strategy.type.apply(dataTable, inputFieldIndexes);
          expect(strategy.inputFieldIndexes).toEqual(inputFieldIndexes);
        });

        it("should add a column of number type to the data table and " +
          "return a strategy with its index as the only content of outputFieldIndexes", function() {
          var beforeColsCount = dataTable.getNumberOfColumns();

          var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.numberKey]);

          var afterColsCount = dataTable.getNumberOfColumns();

          expect(afterColsCount).toEqual(beforeColsCount + 1);

          expect(strategy.outputFieldIndexes.length).toEqual(1);

          var newColIndex = strategy.outputFieldIndexes[0];
          var newCol = dataTable.getColumnAttribute(newColIndex);

          expect(newCol.type).toEqual("number");

          var rowIndex = dataTable.getNumberOfRows();
          while(rowIndex--) {
            var sourceCell = dataTable.getCell(rowIndex, datasetFieldIndexes1.numberKey);
            var newCell = dataTable.getCell(rowIndex, newColIndex);

            expect(newCell.value).toEqual(sourceCell.referent.property("numberKey"));
          }
        });

        it("should deal with null input cells", function() {

          dataTable.getCell(1, datasetFieldIndexes1.numberKey).value = null;

          var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.numberKey]);

          var newColIndex = strategy.outputFieldIndexes[0];

          var newCell = dataTable.getCell(1, newColIndex);

          expect(newCell.value).toEqual(null);
        });

        it("should deal with cells missing numberKey value", function() {
          dataTable.getColumnAttribute(datasetFieldIndexes1.numberKey).members[1].property("numberKey", null);

          var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.numberKey]);

          var newColIndex = strategy.outputFieldIndexes[0];

          var newCell = dataTable.getCell(1, newColIndex);

          expect(newCell.value).toEqual(null);
        });

        it("should deal with cells with invalid numberKey value", function() {

          dataTable.getColumnAttribute(datasetFieldIndexes1.numberKey).members[1].property(
            "numberKey",
            "Something that isn't a number"
          );

          var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.numberKey]);

          var newColIndex = strategy.outputFieldIndexes[0];

          var newCell = dataTable.getCell(1, newColIndex);

          expect(newCell.value).toEqual(null);
        });

        it("should build labels for the created column and the values", function() {
          var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.numberKey]);

          var newColIndex = strategy.outputFieldIndexes[0];
          var newCol = dataTable.getColumnAttribute(newColIndex);

          expect(newCol.label).toEqual("Elapsed time");

          var rowIndex = dataTable.getNumberOfRows();
          while(rowIndex--) {
            var sourceCell1 = dataTable.getCell(rowIndex, datasetFieldIndexes1.numberKey);
            var newCell = dataTable.getCell(rowIndex, newColIndex);

            expect(newCell.label).toEqual(sourceCell1.label);
          }
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
        strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.numberKey]);
      });

      it("should return a cell corresponding to a given existing value", function() {
        var outputCells = strategy.map(["[ElapsedTime].[1002]"]);

        expect(outputCells).toEqual(
          [jasmine.objectContaining({value: 1002})]
        );
      });

      it("should return a cell corresponding to a given (equal value) existing cells", function() {
        var outputCells = strategy.map([new Cell("[ElapsedTime].[1002]", "1002")]);

        expect(outputCells).toEqual([jasmine.objectContaining({value: 1002})]);
      });

      it("should return null if given a non-existing value", function() {
        var outputCells = strategy.map(["[ElapsedTime].[100234]"]);

        expect(outputCells).toBe(null);
      });
    });

    describe("#invert(outputValues)", function() {

      var strategy;

      beforeEach(function() {
        dataTable = new DataTable(getDataSpec1());

        dataTable.getColumnAttribute(datasetFieldIndexes1.numberKey).members[1].property("numberKey", null);

        strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.numberKey]);
      });

      it("should return a cell corresponding to a given existing value", function() {
        var inputCells = strategy.invert([1002]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: "[ElapsedTime].[1002]", formatted: "1002"})
        ]);
      });

      it("should return a cell corresponding to a given (equal value) existing cell", function() {
        var inputCells = strategy.invert([
          new Cell(1002, "Don't care")
        ]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: "[ElapsedTime].[1002]", formatted: "1002"})
        ]);
      });

      it("should return null if given a non-existing value", function() {
        var inputCells = strategy.invert([10345]);

        expect(inputCells).toBe(null);
      });

      it("should work with null values", function() {
        var inputCells = strategy.invert([null]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: "[ElapsedTime].[1034]", formatted: "1034"})
        ]);
      });
    });
  });
});
