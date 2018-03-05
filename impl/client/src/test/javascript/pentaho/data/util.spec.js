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
  "pentaho/type/Context"
], function(dataUtil, DataTable, Context) {

  /* globals beforeAll, it, describe, beforeEach */

  function getDatasetDT1WithNoKeyColumns() {
    return {
      model: [
        {name: "country", type: "string", label: "Country"},
        {name: "sales", type: "number", label: "Sales"}
      ],
      rows: [
        {c: [{v: "Portugal"}, {v: 12000}]},
        {c: [{v: "Ireland"}, {v: 6000}]}
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

  describe("pentaho.data.util", function() {

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

    describe(".createFilterFromCellsMap(cellsMap, dataTable, context)", function() {

      var context;
      var AbstractFilter;

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

      it("should return an AND filter when given a cell map with at least one defined column", function() {

        var cellsMap = {
          "country": new Cell("Portugal", "Portugal")
        };

        var dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
        var result = dataUtil.createFilterFromCellsMap(cellsMap, dataTable, context);

        expect(result).not.toBe(null);
        expect(result instanceof AbstractFilter).toBe(true);
        expect(result.kind).toBe("and");
      });

      it("should return an AND filter with a single IsEqual child filter " +
          "when given a cell map with one defined column", function() {

        var cellsMap = {
          "country": new Cell("Portugal", "Portugal Portugal")
        };

        var dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
        var result = dataUtil.createFilterFromCellsMap(cellsMap, dataTable, context);

        expect(result.operands.count).toBe(1);

        var isEqual = result.operands.at(0);
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

      it("should return an AND filter containing an IsEqual child filter with a null value" +
          "when given the corresponding cell has a null value", function() {

        var cellsMap = {
          "country": null
        };

        var dataTable = new DataTable(getDatasetDT1WithNoKeyColumns());
        var result = dataUtil.createFilterFromCellsMap(cellsMap, dataTable, context);

        expect(result.operands.count).toBe(1);

        var isEqual = result.operands.at(0);
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
  });
});
