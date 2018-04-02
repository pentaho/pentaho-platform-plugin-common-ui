/*!
 * Copyright 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/data/util",
  "pentaho/data/Table",
  "pentaho/data/TableView",
  "pentaho/type/Context"
], function(dataUtil, DataTable, DataTableView, Context) {

  /* globals beforeAll, it, describe, beforeEach */

  function getDatasetDT1WithNoKeyColumns() {
    return {
      model: [
        {name: "country", type: "string", label: "Country"},
        {name: "sales", type: "number", label: "Sales"},
        {name: "achieved", type: "boolean", label: "Achieved"},
        {name: "date", type: "date", label: "Date"}
      ],
      rows: [
        {c: [{v: "Portugal"}, {v: 12000}, true]},
        {c: [{v: "Ireland"}, {v: 6000}, false]}
      ]
    };
  }

  function getDatasetDT2WithOneKeyColumn() {
    return {
      model: [
        {name: "country", type: "string", label: "Country", isKey: true},
        {name: "sales", type: "number", label: "Sales"}
      ],
      rows: [
        {c: [{v: "Portugal"}, {v: 12000}]},
        {c: [{v: "Ireland"}, {v: 6000}]}
      ]
    };
  }

  function getDatasetDT3WithTwoKeyColumns() {
    return {
      model: [
        {name: "country", type: "string", label: "Country", isKey: true},
        {name: "city", type: "string", label: "City", isKey: true},
        {name: "sales", type: "number", label: "Sales"}
      ],
      rows: [
        {c: [{v: "Portugal"}, "Lisbon", {v: 12000}]},
        {c: [{v: "Ireland"}, "Edinburgh", {v: 6000}]}
      ]
    };
  }

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

  describe("pentaho.data.util", function() {

    var context;
    var AbstractFilter;

    beforeAll(function(done) {

      Context.createAsync()
        .then(function(_context) {

          context = _context;

          return context.getDependencyApplyAsync([
            "pentaho/data/filter/abstract",
            // These need to be loaded for createFilterFromCellsMap to work.
            "pentaho/data/filter/isEqual",
            "pentaho/data/filter/and"
          ], function(_AbstractFilter) {
            AbstractFilter = _AbstractFilter;
          });
        })
        .then(done, done.fail);
    });

    it("should be a plain object", function() {
      expect(dataUtil.constructor).toBe(Object);
    });

    describe(".hasAnyKeyColumns(dataTable)", function() {

      it("should return `false` if the data table has zero key columns", function() {
        var dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
        var result = dataUtil.hasAnyKeyColumns(dataTable);

        expect(result).toBe(false);
      });

      it("should return `true` if the data table has one key column", function() {
        var dataTable = new DataTable(getDatasetDT2WithOneKeyColumn());
        var result = dataUtil.hasAnyKeyColumns(dataTable);

        expect(result).toBe(true);
      });

      it("should return `true` if the data table has two key columns", function() {
        var dataTable = new DataTable(getDatasetDT2WithOneKeyColumn());
        var result = dataUtil.hasAnyKeyColumns(dataTable);

        expect(result).toBe(true);
      });
    });

    describe(".getCellValue(valueOrCell)", function() {

      it("returns null when given null", function() {
        var value = dataUtil.getCellValue(null);

        expect(value).toBe(null);
      });

      it("returns undefined when given undefined", function() {
        var value = dataUtil.getCellValue(undefined);

        expect(value).toBe(undefined);
      });

      it("returns a Date when given a Date", function() {
        var valueIn = new Date();
        var valueOut = dataUtil.getCellValue(valueIn);

        expect(valueOut).toBe(valueIn);
      });

      it("returns a number when given a number", function() {
        var valueIn = 1;
        var valueOut = dataUtil.getCellValue(valueIn);

        expect(valueOut).toBe(valueIn);
      });

      it("returns a boolean when given a boolean", function() {
        var valueIn = true;
        var valueOut = dataUtil.getCellValue(valueIn);

        expect(valueOut).toBe(valueIn);
      });

      it("returns a string when given a string", function() {
        var valueIn = "foo";
        var valueOut = dataUtil.getCellValue(valueIn);

        expect(valueOut).toBe(valueIn);
      });

      it("returns the value of a Cell when given a cell", function() {
        var valueIn = new Cell("foo", "Bar");
        var valueOut = dataUtil.getCellValue(valueIn);

        expect(valueOut).toBe(valueIn.value);
      });
    });

    describe(".createFilterFromCellsMap(cellsMap, dataTable, context)", function() {

      it("should return null when given an empty cell map", function() {

        var cellsMap = {};
        var dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
        var result = dataUtil.createFilterFromCellsMap(cellsMap, dataTable, context);

        expect(result).toBe(null);
      });

      it("should return null when given a cell map with a single undefined column", function() {

        var cellsMap = {
          "foo": new Cell("bar", "Bar")
        };

        var dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
        var result = dataUtil.createFilterFromCellsMap(cellsMap, dataTable, context);

        expect(result).toBe(null);
      });

      it("should return an AND filter when given a cell map with at least two defined columns", function() {

        var cellsMap = {
          "country": new Cell("Portugal", "Portugal"),
          "sales": new Cell(1000, "1000")
        };

        var dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
        var result = dataUtil.createFilterFromCellsMap(cellsMap, dataTable, context);

        expect(result).not.toBe(null);
        expect(result instanceof AbstractFilter).toBe(true);
        expect(result.kind).toBe("and");
      });

      it("should return a single IsEqual filter when given a cell map with one defined column", function() {

        var cellsMap = {
          "country": new Cell("Portugal", "Portugal Portugal")
        };

        var dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
        var isEqual = dataUtil.createFilterFromCellsMap(cellsMap, dataTable, context);

        expect(isEqual instanceof AbstractFilter).toBe(true);
        expect(isEqual.kind).toBe("isEqual");
        expect(isEqual.property).toBe("country");
        expect(isEqual.getv("value")).toBe("Portugal");
        expect(isEqual.getf("value")).toBe("Portugal Portugal");
      });

      it("should return an AND filter with two IsEqual child filters " +
          "when given a cell map with two defined columns", function() {

        var cellsMap = {
          "country": new Cell("Portugal", "Portugal Portugal"),
          "city": new Cell("Lisbon", "Lisboa")
        };

        var dataTable = new DataTable(getDatasetDT3WithTwoKeyColumns());
        var result = dataUtil.createFilterFromCellsMap(cellsMap, dataTable, context);

        expect(result.operands.count).toBe(2);

        var isEqual = result.operands.at(0);
        expect(isEqual instanceof AbstractFilter).toBe(true);
        expect(isEqual.kind).toBe("isEqual");
        expect(isEqual.property).toBe("country");
        expect(isEqual.value).toBe("Portugal");

        isEqual = result.operands.at(1);
        expect(isEqual instanceof AbstractFilter).toBe(true);
        expect(isEqual.kind).toBe("isEqual");
        expect(isEqual.property).toBe("city");
        expect(isEqual.getv("value")).toBe("Lisbon");
        expect(isEqual.getf("value")).toBe("Lisboa");
      });

      it("should return an IsEqual filter with a null value when the given cell has a null value", function() {

        var cellsMap = {
          "country": null
        };

        var dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
        var isEqual = dataUtil.createFilterFromCellsMap(cellsMap, dataTable, context);

        expect(isEqual instanceof AbstractFilter).toBe(true);
        expect(isEqual.kind).toBe("isEqual");
        expect(isEqual.property).toBe("country");
        expect(isEqual.get("value")).toBe(null);
      });

      it("should accept degenerate cells that only implement valueOf/toString", function() {

        var cellsMap = {
          "country": "Portugal",
          "city": "Lisbon"
        };

        var dataTable = new DataTable(getDatasetDT3WithTwoKeyColumns());
        var result = dataUtil.createFilterFromCellsMap(cellsMap, dataTable, context);

        expect(result.operands.count).toBe(2);

        var isEqual = result.operands.at(0);
        expect(isEqual instanceof AbstractFilter).toBe(true);
        expect(isEqual.kind).toBe("isEqual");
        expect(isEqual.property).toBe("country");
        expect(isEqual.getv("value")).toBe("Portugal");
        expect(isEqual.getf("value")).toBe("Portugal");

        isEqual = result.operands.at(1);
        expect(isEqual instanceof AbstractFilter).toBe(true);
        expect(isEqual.kind).toBe("isEqual");
        expect(isEqual.property).toBe("city");
        expect(isEqual.getv("value")).toBe("Lisbon");
        expect(isEqual.getf("value")).toBe("Lisbon");
      });
    });

    describe(".createFilterIsEqualFromCell(dataPlain, columnId, cell, context)", function() {
      var dataTable;

      beforeAll(function() {
        dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
      });

      it("should return null when given an undefined columnId", function() {

        var result = dataUtil.createFilterIsEqualFromCell(dataTable, "foo", new Cell("foo", "bar"), context);

        expect(result).toBe(null);
      });

      it("should return an isEqual filter when given a defined columnId", function() {

        var result = dataUtil.createFilterIsEqualFromCell(dataTable, "country", new Cell("PT", "Portugal"), context);

        expect(result).not.toBe(null);
        expect(result instanceof AbstractFilter).toBe(true);
        expect(result.kind).toBe("isEqual");
      });

      it("should return an isEqual filter whose property is the given columnId", function() {

        var result = dataUtil.createFilterIsEqualFromCell(dataTable, "country", new Cell("PT", "Portugal"), context);

        expect(result.property).toBe("country");
      });

      it("should return an isEqual filter whose value is null when given a null cell", function() {

        var result = dataUtil.createFilterIsEqualFromCell(dataTable, "country", null, context);

        expect(result.value).toBe(null);
      });

      it("should return an isEqual filter whose value is the same as that of the given cell", function() {

        var result = dataUtil.createFilterIsEqualFromCell(dataTable, "country", new Cell("PT", "Portugal"), context);

        expect(result.value).toBe("PT");
      });

      it("should return an isEqual filter whose formatter value is the same as that of the given cell", function() {

        var result = dataUtil.createFilterIsEqualFromCell(dataTable, "country", new Cell("PT", "Portugal"), context);

        expect(result.get("value").formatted).toBe("Portugal");
      });

      it("should return an isEqual filter whose value type is that of the column data type (string)", function() {

        var result = dataUtil.createFilterIsEqualFromCell(dataTable, "country", new Cell("PT", "Portugal"), context);

        expect(result.get("value").$type.alias).toBe("string");
      });

      it("should return an isEqual filter whose value type is that of the column data type (number)", function() {

        var result = dataUtil.createFilterIsEqualFromCell(dataTable, "sales", new Cell(1000, "1000"), context);

        expect(result.get("value").$type.alias).toBe("number");
      });

      it("should return an isEqual filter whose value type is that of the column data type (boolean)", function() {

        var result = dataUtil.createFilterIsEqualFromCell(dataTable, "date", new Cell("2016-01-01"), context);

        expect(result.get("value").$type.alias).toBe("date");
      });
    });

    describe(".getColumnIndexesByIds(dataTable, columnIds)", function() {

      var dataTable;

      beforeAll(function() {
        dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
      });

      it("should accept an empty array and return an empty array", function() {

        var result = dataUtil.getColumnIndexesByIds(dataTable, []);

        expect(result).toEqual([]);
      });

      it("should translate an array with a defined column id into the corresponding index", function() {

        var result = dataUtil.getColumnIndexesByIds(dataTable, ["achieved"]);

        expect(result).toEqual([2]);
      });

      it("should translate an array with all defined column ids into the corresponding indexes", function() {

        var result = dataUtil.getColumnIndexesByIds(dataTable, ["achieved", "country"]);

        expect(result).toEqual([2, 0]);
      });

      it("should return null if any of the ids is not defined", function() {

        var result = dataUtil.getColumnIndexesByIds(dataTable, ["achieved", "foo", "country"]);

        expect(result).toBe(null);
      });
    });

    describe(".buildRowPredicateNotAllNullColumns(columnIndexes)", function() {

      var dataTable;

      beforeAll(function() {

        dataTable = new DataTable({
          model: [
            {name: "country", type: "string", label: "Country"},
            {name: "sales", type: "number", label: "Sales"},
            {name: "achieved", type: "boolean", label: "Achieved"},
            {name: "date", type: "date", label: "Date"}
          ],
          rows: [
            {c: [{v: "Portugal"}, {v: 12000}, true]},
            {c: [{v: "Ireland"}, {v: 6000}, false, "2016-01-01"]},
            {c: [{v: "Spain"}, null, null, null]},
            {c: [{v: "Russia"}, null, null, null]},
            {c: [{v: "France"}, {v: 24000}, false]}
          ]
        });
      });

      it("should return a function", function() {

        var predicate = dataUtil.buildRowPredicateNotAllNullColumns([1, 2, 3]);

        expect(typeof predicate).toBe("function");
      });

      it("should accept an empty array of columns and should always return false", function() {

        var predicate = dataUtil.buildRowPredicateNotAllNullColumns([]);

        expect(predicate(dataTable, 0)).toBe(false);
        expect(predicate(dataTable, 1)).toBe(false);
        expect(predicate(dataTable, 2)).toBe(false);
        expect(predicate(dataTable, 3)).toBe(false);
      });

      it("should return false if all columns are null", function() {

        var predicate = dataUtil.buildRowPredicateNotAllNullColumns([1, 2, 3]);

        expect(predicate(dataTable, 2)).toBe(false);
        expect(predicate(dataTable, 3)).toBe(false);
      });

      it("should return true if not all columns are null", function() {

        var predicate = dataUtil.buildRowPredicateNotAllNullColumns([1, 2, 3]);

        expect(predicate(dataTable, 0)).toBe(true);
        expect(predicate(dataTable, 1)).toBe(true);
        expect(predicate(dataTable, 4)).toBe(true);
      });
    });

    describe(".filterByPredicate(dataPlain, rowPredicate)", function() {

      var dataTable;

      beforeAll(function() {

        dataTable = new DataTable({
          model: [
            {name: "country", type: "string", label: "Country"},
            {name: "sales", type: "number", label: "Sales"},
            {name: "achieved", type: "boolean", label: "Achieved"},
            {name: "date", type: "date", label: "Date"}
          ],
          rows: [
            {c: [{v: "Portugal"}, {v: 12000}, true]},
            {c: [{v: "Ireland"}, {v: 6000}, false, "2016-01-01"]},
            {c: [{v: "Spain"}, null, null, null]},
            {c: [{v: "Russia"}, null, null, null]},
            {c: [{v: "France"}, {v: 24000}, false]}
          ]
        });
      });

      it("should return the given data table if all rows are selected", function() {

        var result = dataUtil.filterByPredicate(dataTable, function() { return true; });

        expect(result).toBe(dataTable);
      });

      it("should return a data view if not all rows are selected", function() {

        var result = dataUtil.filterByPredicate(dataTable, function(dataTable, rowIndex) {
          return dataTable.getValue(rowIndex, 0) === "Portugal";
        });

        expect(result).not.toBe(dataTable);
        expect(result instanceof DataTableView).toBe(true);
      });

      it("should return a data view with the rows for which the predicate returns true", function() {

        var result = dataUtil.filterByPredicate(dataTable, function(dataTable, rowIndex) {
          return dataTable.getValue(rowIndex, 0) === "Ireland";
        });

        expect(result.getNumberOfRows()).toBe(1);
        expect(result.getValue(0, 0)).toBe("Ireland");
      });
    });
  });
});
