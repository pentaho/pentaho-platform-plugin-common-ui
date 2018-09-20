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
  "pentaho/visual/role/adaptation/EntityWithTimeIntervalKeyStrategy",
  "pentaho/type/List",
  "pentaho/type/Element",
  "pentaho/type/String",
  "pentaho/type/Date",
  "pentaho/type/Complex",
  "pentaho/data/Table",
  "pentaho/util/date"
], function(Strategy, List, Element, PentahoString, PentahoDate, Complex, DataTable, dateUtil) {

  "use strict";

  describe("pentaho.visual.role.adaptation.EntityWithTimeIntervalKeyStrategy", function() {

    var dataTable;

    var datasetFieldIndexes1 = {
      months: 0,
      years: 1,
      other: 2,
      measure: 3
    };

    var datasetFieldIndexes2 = {
      instant: 0,
      other: 1,
      measure: 2
    };

    function getDataSpec1() {
      return {
        "cols": [
          "[Time].[Months]",
          "[Time].[Years]",
          "[Time].[Other]",
          "[MEASURE:0]"
        ],
        "rows": [
          {
            "c": [
              {
                "v": "[Time].[2003].[QTR1].[Jan]",
                "f": "Jan"
              },
              {
                "v": "[Time].[2003]",
                "f": "2003"
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
                "v": "[Time].[2004].[QTR1].[Feb]",
                "f": "Feb"
              },
              {
                "v": "[Time].[2004]",
                "f": "2004"
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
                "v": "[Time].[2004].[QTR3].[Jul]",
                "f": "Jan"
              },
              {
                "v": "[Time].[2004]",
                "f": "2005"
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
              "name": "[Time].[Months]",
              "label": "Months",
              "type": "string",
              "isKey": true,
              "members": [
                {
                  "v": "[Time].[2003].[QTR1].[Jan]",
                  "f": "Jan",
                  "p": {
                    "startDateTime": "2003-01-01T00:00:00"
                  }
                },
                {
                  "v": "[Time].[2004].[QTR1].[Feb]",
                  "f": "Jan",
                  "p": {
                    "startDateTime": "2004-02-01T00:00:00"
                  }
                },
                {
                  "v": "[Time].[2004].[QTR3].[Jul]",
                  "f": "Jul",
                  "p": {
                    "startDateTime": "2004-07-01T00:00:00"
                  }
                }
              ],
              "p": {
                "EntityWithTimeIntervalKey": {
                  "duration": "month",
                  "isStartDateTimeProvided": true
                }
              }
            },
            {
              "name": "[Time].[Years]",
              "label": "Years",
              "type": "string",
              "isKey": true,
              "members": [
                {
                  "v": "[Time].[2003]",
                  "f": "2003"
                },
                {
                  "v": "[Time].[2004]",
                  "f": "2004"
                }
              ],
              "p": {
                "EntityWithTimeIntervalKey": {
                  "duration": "year",
                  "isStartDateTimeProvided": false
                }
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

    function getDataSpec2() {
      return {
        "cols": [
          "[Time].[Instant]",
          "[Time].[Other]",
          "[MEASURE:0]"
        ],
        "rows": [
          {
            "c": [
              {
                "v": "[Time].[2003-04-01T11:20:06]",
                "f": "20:06"
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
                "v": "[Time].[2003-04-01T11:20:10]",
                "f": "20:10"
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
          }
        ],
        "model": {
          "attrs": [
            {
              "name": "[Time].[Instant]",
              "label": "Sample time",
              "type": "string",
              "isKey": true,
              "members": [
                {
                  "v": "[Time].[2003-04-01T11:20:06]",
                  "f": "20:06",
                  "p": {
                    "startDateTime": "2003-04-01T11:20:06"
                  }
                },
                {
                  "v": "[Time].[2003-04-01T11:20:10]",
                  "f": "20:10",
                  "p": {
                    "startDateTime": "2003-04-01T11:20:10"
                  }
                }
              ],
              "p": {
                "EntityWithTimeIntervalKey": {
                  "duration": "instant",
                  "isStartDateTimeProvided": true
                }
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

        it("should return null if not given a date type, independently of isVisualKeyEf", function() {
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

        it("should return null if given a date type but isVisualKeyEf is false", function() {
          var inputType = Strategy.type.getInputTypeFor(PentahoDate.type, false);
          expect(inputType).toBe(null);
        });

        it("should return the List of Strings type if given a date type and isVisualKeyEf is true", function() {
          var inputType = Strategy.type.getInputTypeFor(PentahoDate.type, true);
          expect(inputType.isList).toBe(true);
          expect(inputType.of).toBe(PentahoString.type);
        });

        it("should return the List of Strings type if given a date type and isVisualKeyEf is undefined", function() {
          var inputType = Strategy.type.getInputTypeFor(PentahoDate.type, undefined);
          expect(inputType.isList).toBe(true);
          expect(inputType.of).toBe(PentahoString.type);
        });
      });

      describe("#validateApplication(schemaData, inputFieldIndexes)", function() {

        describe("proper duration", function() {

          beforeEach(function() {
            dataTable = new DataTable(getDataSpec1());
          });

          it("should return an object with isValid: true", function() {
            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);

            expect(result).toEqual(jasmine.objectContaining({isValid: true}));
          });

          it("should return an object with addsFields: true", function() {
            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);

            expect(result).toEqual(jasmine.objectContaining({addsFields: true}));
          });

          it("should return an object with isValid: false when not all fields are " +
            "annotated with EntityWithTimeIntervalKey", function() {
            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes1.years, datasetFieldIndexes1.months, datasetFieldIndexes1.other]
            );
            expect(result).toEqual(jasmine.objectContaining({isValid: false}));
          });

          it("should return an object with isValid: false if there " +
            "are no fields with isStartDateTimeProvided=true", function() {
            dataTable.getColumnAttribute(datasetFieldIndexes1.months)
              .property("EntityWithTimeIntervalKey").isStartDateTimeProvided = false;

            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes1.years, datasetFieldIndexes1.months]
            );
            expect(result).toEqual(jasmine.objectContaining({isValid: false}));
          });
        });

        describe("instant duration", function() {

          beforeEach(function() {
            dataTable = new DataTable(getDataSpec2());
          });

          it("should return an object with isValid: true", function() {
            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes2.instant]);

            expect(result).toEqual(jasmine.objectContaining({isValid: true}));
          });

          it("should return an object with addsFields: true", function() {
            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes2.instant]);

            expect(result).toEqual(jasmine.objectContaining({addsFields: true}));
          });

          it("should return an object with isValid: false when not all fields are " +
            "annotated with EntityWithTimeIntervalKey", function() {
            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes2.instant, datasetFieldIndexes2.other]
            );
            expect(result).toEqual(jasmine.objectContaining({isValid: false}));
          });

          it("should return an object with isValid: false if there " +
            "are no fields with isStartDateTimeProvided=true", function() {
            dataTable.getColumnAttribute(datasetFieldIndexes2.instant)
              .property("EntityWithTimeIntervalKey").isStartDateTimeProvided = false;

            var result = Strategy.type.validateApplication(
              dataTable,
              [datasetFieldIndexes2.instant]
            );
            expect(result).toEqual(jasmine.objectContaining({isValid: false}));
          });
        });
      });

      describe("#apply(data, inputFieldIndexes)", function() {

        describe("proper duration", function() {

          beforeEach(function() {
            dataTable = new DataTable(getDataSpec1());
          });

          it("should return a strategy instance", function() {
            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);
            expect(strategy instanceof Strategy).toBe(true);
          });

          it("should return a strategy having the given data", function() {
            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);
            expect(strategy.data).toBe(dataTable);
          });

          it("should return a strategy having the given inputFieldIndexes", function() {
            var inputFieldIndexes = [datasetFieldIndexes1.years, datasetFieldIndexes1.months];
            var strategy = Strategy.type.apply(dataTable, inputFieldIndexes);
            expect(strategy.inputFieldIndexes).toEqual(inputFieldIndexes);
          });

          it("should add a column of dates to the data table and " +
            "return a strategy with its index as the only content of outputFieldIndexes", function() {
            var beforeColsCount = dataTable.getNumberOfColumns();

            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);

            var afterColsCount = dataTable.getNumberOfColumns();

            expect(afterColsCount).toEqual(beforeColsCount + 1);

            expect(strategy.outputFieldIndexes.length).toEqual(1);

            var newColIndex = strategy.outputFieldIndexes[0];
            var newCol = dataTable.getColumnAttribute(newColIndex);

            expect(newCol.type).toEqual("date");

            var rowIndex = dataTable.getNumberOfRows();
            while(rowIndex--) {
              var sourceCell = dataTable.getCell(rowIndex, datasetFieldIndexes1.months);
              var newCell = dataTable.getCell(rowIndex, newColIndex);

              expect(newCell.value).toEqual(dateUtil.parseDateEcma262v7(sourceCell.referent.property("startDateTime")));
            }
          });

          it("should deal with null input cells", function() {

            dataTable.getCell(1, datasetFieldIndexes1.months).value = null;

            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);

            var newColIndex = strategy.outputFieldIndexes[0];

            var newCell = dataTable.getCell(1, newColIndex);

            expect(newCell.value).toEqual(null);
          });

          it("should deal with cells missing startDateTime value", function() {
            dataTable.getColumnAttribute(datasetFieldIndexes1.months).members[1].property("startDateTime", null);

            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);

            var newColIndex = strategy.outputFieldIndexes[0];

            var newCell = dataTable.getCell(1, newColIndex);

            expect(newCell.value).toEqual(null);
          });

          it("should deal with cells with invalid startDateTime value", function() {
            dataTable.getColumnAttribute(datasetFieldIndexes1.months).members[1].property(
              "startDateTime",
              "Something that isn't a date"
            );

            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);

            var newColIndex = strategy.outputFieldIndexes[0];

            var newCell = dataTable.getCell(1, newColIndex);

            expect(newCell.value).toEqual(null);
          });

          it("should build labels for the created column and the values", function() {
            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);

            var newColIndex = strategy.outputFieldIndexes[0];
            var newCol = dataTable.getColumnAttribute(newColIndex);

            expect(newCol.label).toEqual("Years, Months");

            var rowIndex = dataTable.getNumberOfRows();
            while(rowIndex--) {
              var sourceCell1 = dataTable.getCell(rowIndex, datasetFieldIndexes1.years);
              var sourceCell2 = dataTable.getCell(rowIndex, datasetFieldIndexes1.months);
              var newCell = dataTable.getCell(rowIndex, newColIndex);

              expect(newCell.label).toEqual(sourceCell1.label + ", " + sourceCell2.label);
            }
          });
        });

        describe("instant duration", function() {

          beforeEach(function() {
            dataTable = new DataTable(getDataSpec2());
          });

          it("should return a strategy instance", function() {
            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes2.instant]);
            expect(strategy instanceof Strategy).toBe(true);
          });

          it("should add a column of dates to the data table and " +
            "return a strategy with its index as the only content of outputFieldIndexes", function() {
            var beforeColsCount = dataTable.getNumberOfColumns();

            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes2.instant]);

            var afterColsCount = dataTable.getNumberOfColumns();

            expect(afterColsCount).toEqual(beforeColsCount + 1);

            expect(strategy.outputFieldIndexes.length).toEqual(1);

            var newColIndex = strategy.outputFieldIndexes[0];
            var newCol = dataTable.getColumnAttribute(newColIndex);

            expect(newCol.type).toEqual("date");

            var rowIndex = dataTable.getNumberOfRows();
            while(rowIndex--) {
              var sourceCell = dataTable.getCell(rowIndex, datasetFieldIndexes2.instant);
              var newCell = dataTable.getCell(rowIndex, newColIndex);

              expect(newCell.value).toEqual(dateUtil.parseDateEcma262v7(sourceCell.referent.property("startDateTime")));
            }
          });

          it("should deal with null input cells", function() {

            dataTable.getCell(1, datasetFieldIndexes2.instant).value = null;

            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes2.instant]);

            var newColIndex = strategy.outputFieldIndexes[0];

            var newCell = dataTable.getCell(1, newColIndex);

            expect(newCell.value).toEqual(null);
          });

          it("should deal with cells missing startDateTime value", function() {
            dataTable.getColumnAttribute(datasetFieldIndexes2.instant).members[1].property("startDateTime", null);

            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes2.instant]);

            var newColIndex = strategy.outputFieldIndexes[0];

            var newCell = dataTable.getCell(1, newColIndex);

            expect(newCell.value).toEqual(null);
          });

          it("should deal with cells with invalid startDateTime value", function() {
            dataTable.getColumnAttribute(datasetFieldIndexes2.instant).members[1].property(
              "startDateTime",
              "Something that isn't a date"
            );

            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes2.instant]);

            var newColIndex = strategy.outputFieldIndexes[0];

            var newCell = dataTable.getCell(1, newColIndex);

            expect(newCell.value).toEqual(null);
          });

          it("should build labels for the created column and the values", function() {
            var strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes2.instant]);

            var newColIndex = strategy.outputFieldIndexes[0];
            var newCol = dataTable.getColumnAttribute(newColIndex);

            expect(newCol.label).toEqual("Sample time");

            var rowIndex = dataTable.getNumberOfRows();
            while(rowIndex--) {
              var sourceCell1 = dataTable.getCell(rowIndex, datasetFieldIndexes2.instant);
              var newCell = dataTable.getCell(rowIndex, newColIndex);

              expect(newCell.label).toEqual(sourceCell1.label);
            }
          });
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

      describe("proper duration", function() {

        beforeEach(function() {
          dataTable = new DataTable(getDataSpec1());
          strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);
        });

        it("should return a cell corresponding to a given existing value", function() {
          var outputCells = strategy.map(["[Time].[2003]", "[Time].[2003].[QTR1].[Jan]"]);

          expect(outputCells).toEqual(
            [jasmine.objectContaining({value: dateUtil.parseDateEcma262v7("2003-01-01T00:00:00")})]
          );
        });

        it("should be ok omitting non-relevant fields", function() {
          var outputCells = strategy.map([null, "[Time].[2003].[QTR1].[Jan]"]);

          expect(outputCells).toEqual(
            [jasmine.objectContaining({value: dateUtil.parseDateEcma262v7("2003-01-01T00:00:00")})]
          );
        });

        it("should return a cell corresponding to a given (equal value) existing cells", function() {
          var outputCells = strategy.map([new Cell("[Time].[2003]", "2003"), new Cell(
            "[Time].[2003].[QTR1].[Jan]",
            "Jan"
          )]);

          expect(outputCells).toEqual(
            [jasmine.objectContaining({value: dateUtil.parseDateEcma262v7("2003-01-01T00:00:00")})]
          );
        });

        it("should return null if given a non-existing value", function() {
          var outputCells = strategy.map(["[Time].[2003]", "[Time].[2003].[QTR1].[Mar]"]);

          expect(outputCells).toBe(null);
        });
      });

      describe("instant duration", function() {

        beforeEach(function() {
          dataTable = new DataTable(getDataSpec2());
          strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes2.instant]);
        });

        it("should return a cell corresponding to a given existing value", function() {
          var outputCells = strategy.map(["[Time].[2003-04-01T11:20:10]"]);

          expect(outputCells).toEqual(
            [jasmine.objectContaining({value: dateUtil.parseDateEcma262v7("2003-04-01T11:20:10")})]
          );
        });

        it("should return a cell corresponding to a given (equal value) existing cells", function() {
          var outputCells = strategy.map([new Cell("[Time].[2003-04-01T11:20:10]", "20:10")]);

          expect(outputCells).toEqual(
            [jasmine.objectContaining({value: dateUtil.parseDateEcma262v7("2003-04-01T11:20:10")})]
          );
        });

        it("should return null if given a non-existing value", function() {
          var outputCells = strategy.map(["[Time].[2003-04-01T11:20:55]"]);

          expect(outputCells).toBe(null);
        });
      });
    });

    describe("#invert(outputValues)", function() {

      var strategy;

      describe("proper duration", function() {

        beforeEach(function() {
          dataTable = new DataTable(getDataSpec1());

          dataTable.getColumnAttribute(datasetFieldIndexes1.months).members[1].property("startDateTime", null);

          strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes1.years, datasetFieldIndexes1.months]);
        });

        it("should return a cell corresponding to a given existing value", function() {
          var inputCells = strategy.invert([dateUtil.parseDateEcma262v7("2003-01-01T00:00:00")]);

          expect(inputCells).toEqual(
            [
              jasmine.objectContaining({value: "[Time].[2003]", formatted: "2003"}),
              jasmine.objectContaining({value: "[Time].[2003].[QTR1].[Jan]", formatted: "Jan"})
            ]
          );
        });

        it("should return a cell corresponding to a given (equal value) existing cell", function() {
          var inputCells = strategy.invert([
            new Cell(dateUtil.parseDateEcma262v7("2003-01-01T00:00:00"), "Don't care")
          ]);

          expect(inputCells).toEqual(
            [
              jasmine.objectContaining({value: "[Time].[2003]", formatted: "2003"}),
              jasmine.objectContaining({value: "[Time].[2003].[QTR1].[Jan]", formatted: "Jan"})
            ]
          );
        });

        it("should return null if given a non-existing value", function() {
          var inputCells = strategy.invert([dateUtil.parseDateEcma262v7("1981-07-27T19:00:00")]);

          expect(inputCells).toBe(null);
        });

        it("should work with null values", function() {
          var inputCells = strategy.invert([null]);

          expect(inputCells).toEqual(
            [
              jasmine.objectContaining({value: "[Time].[2004]", formatted: "2004"}),
              jasmine.objectContaining({value: "[Time].[2004].[QTR1].[Feb]", formatted: "Feb"})
            ]
          );
        });
      });

      describe("instant duration", function() {

        beforeEach(function() {
          dataTable = new DataTable(getDataSpec2());

          dataTable.getColumnAttribute(datasetFieldIndexes2.instant).members[1].property("startDateTime", null);

          strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes2.instant]);
        });

        it("should return a cell corresponding to a given existing value", function() {
          var inputCells = strategy.invert([dateUtil.parseDateEcma262v7("2003-04-01T11:20:06")]);

          expect(inputCells).toEqual([
            jasmine.objectContaining({value: "[Time].[2003-04-01T11:20:06]", formatted: "20:06"})
          ]);
        });

        it("should return a cell corresponding to a given (equal value) existing cell", function() {
          var inputCells = strategy.invert([
            new Cell(dateUtil.parseDateEcma262v7("2003-04-01T11:20:06"), "Don't care")
          ]);

          expect(inputCells).toEqual([
            jasmine.objectContaining({value: "[Time].[2003-04-01T11:20:06]", formatted: "20:06"})
          ]);
        });

        it("should return null if given a non-existing value", function() {
          var inputCells = strategy.invert([dateUtil.parseDateEcma262v7("2003-04-01T11:20:55")]);

          expect(inputCells).toBe(null);
        });

        it("should work with null values", function() {
          var inputCells = strategy.invert([null]);

          expect(inputCells).toEqual([
            jasmine.objectContaining({value: "[Time].[2003-04-01T11:20:10]", formatted: "20:10"})
          ]);
        });
      });
    });
  });
});
