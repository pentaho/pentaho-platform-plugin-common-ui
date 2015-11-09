/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "pentaho/visual/data/Table"
], function(DataTable) {

  function getCrossDatasetFull1() {
    return {
      model: [
        {
          name:  "orderStatus",
          type:  "string",
          label: "Order Status"
        },
        {
          name:  "productFamily",
          type:  "string",
          label: "Product Family"
        },
        {
          name:  "customerCountry",
          type:  "string",
          label: "Customer Country",
          members: [
            {v: "pt", f: "Portugal"},
            {v: "fr", f: "France"},
            {v: "uk", f: "United Kingdom"}
          ]
        },
        {
          name:  "sum(sales)",
          type:  "number",
          label: "Sum of Sales"
        }
      ],

      layout: {
        rows: ["orderStatus", "productFamily"],
        cols: ["customerCountry"],
        meas: ["sum(sales)"]
      },

      cols: [
        {attr: "orderStatus"},
        {attr: "productFamily"},
        {attr: "sum(sales)", c: [{v: "pt"}]},
        {attr: "sum(sales)", c: [{v: "uk"}]},
        {attr: "sum(sales)", c: [{v: "fr"}]}
      ],

      rows: [
        {c: [{v: "created"},    {v: "car"       }, {v: 200000}, {v: 500000}, {v: 700000}]},
        {c: [{v: "created"},    {v: "bicycle"   }, {v:   1500}, {v:   5000}, {v:   3000}]},
        {c: [{v: "created"},    {v: "motorcycle"}, {v:  70000}, {v:  30000}, {v:  80500}]},

        {c: [{v: "dispatched"}, {v: "car"       }, {v: 400000}, {v: 200000}, {v: 100000}]},
        {c: [{v: "delivered"},  {v: "car"       }, {v: 400000}, {v: 200000}, {v: 100000}]}
      ]
    };
  }

  function getPlainDatasetFull1() {
    return {
      model: [
        {
          name:  "orderStatus",
          type:  "string",
          label: "Order Status"
        },
        {
          name:  "productFamily",
          type:  "string",
          label: "Product Family"
        },
        {
          name:  "customerCountry",
          type:  "string",
          label: "Customer Country",
          members: [
            {v: "pt", f: "Portugal"},
            {v: "fr", f: "France"},
            {v: "uk", f: "United Kingdom"}
          ]
        },
        {
          name:  "sum(sales)",
          type:  "number",
          label: "Sum of Sales"
        }
      ],

      cols: [
        {attr: "orderStatus"},
        {attr: "productFamily"},
        {attr: "customerCountry"},
        {attr: "sum(sales)"}
      ],

      rows: [
        {c: [{v: "created"}, {v: "car"}, {v: "pt"}, {v: 200000}]},
        {c: [{v: "created"}, {v: "car"}, {v: "uk"}, {v: 500000}]},
        {c: [{v: "created"}, {v: "car"}, {v: "fr"}, {v: 700000}]},

        {c: [{v: "created"}, {v: "bicycle"}, {v: "pt"}, {v: 1500}]},
        {c: [{v: "created"}, {v: "bicycle"}, {v: "uk"}, {v: 5000}]},
        {c: [{v: "created"}, {v: "bicycle"}, {v: "fr"}, {v: 3000}]},

        {c: [{v: "created"}, {v: "motorcycle"}, {v: "pt"}, {v: 70000}]},
        {c: [{v: "created"}, {v: "motorcycle"}, {v: "uk"}, {v: 30000}]},
        {c: [{v: "created"}, {v: "motorcycle"}, {v: "fr"}, {v: 80500}]},

        {c: [{v: "dispatched"}, {v: "car"}, {v: "pt"}, {v: 400000}]},
        {c: [{v: "dispatched"}, {v: "car"}, {v: "uk"}, {v: 200000}]},
        {c: [{v: "dispatched"}, {v: "car"}, {v: "fr"}, {v: 100000}]},

        {c: [{v: "delivered"}, {v: "car"}, {v: "pt"}, {v: 400000}]},
        {c: [{v: "delivered"}, {v: "car"}, {v: "uk"}, {v: 200000}]},
        {c: [{v: "delivered"}, {v: "car"}, {v: "fr"}, {v: 100000}]}
      ]
    };
  }

  describe("DataTable - Cross-table format -", function() {

    it("should load a complete and valid JSON", function() {
      expect(function() {
        new DataTable(getCrossDatasetFull1());
      }).not.toThrow();
    });

    describe("COL column ids -", function() {
      it("should default column ids to be junction of all cell values and the attribute name", function() {
        var jsTable = getCrossDatasetFull1();
        var rowColCount = jsTable.layout.rows.length;

        var dataTable = new DataTable(jsTable);

        expect(dataTable.getColumnId(rowColCount + 0)).toBe("pt~sum(sales)");
        expect(dataTable.getColumnId(rowColCount + 1)).toBe("uk~sum(sales)");
        expect(dataTable.getColumnId(rowColCount + 2)).toBe("fr~sum(sales)");
      });
    });

    describe("COL column labels -", function() {
      it("should default column labels to be junction of all cell labels and the attribute label", function() {
        var jsTable = getCrossDatasetFull1();
        var rowColCount = jsTable.layout.rows.length;

        var dataTable = new DataTable(jsTable);

        expect(dataTable.getColumnLabel(rowColCount + 0)).toBe("Portugal~Sum of Sales");
        expect(dataTable.getColumnLabel(rowColCount + 1)).toBe("United Kingdom~Sum of Sales");
        expect(dataTable.getColumnLabel(rowColCount + 2)).toBe("France~Sum of Sales");
      });
    });

    describe("#toPlainTable() -", function() {

      describe("on a plain table -", function() {
        it("should return `this`", function() {
          var dataTable = new DataTable();
          expect(dataTable.toPlainTable()).toBe(dataTable);
        });
      });

      describe("on a cross table -", function() {
        var dataTable, result;
        beforeEach(function() {
          var jsTable = getCrossDatasetFull1();

          dataTable = new DataTable(jsTable);
          result = dataTable.toPlainTable();
        });

        it("should return a different table", function() {
          expect(result instanceof DataTable).toBe(true);
          expect(result).not.toBe(dataTable);
        });

        it("should return a plain table", function() {
          expect(result.layout == null).toBe(true);
        });

        it("should return a table with as many columns as the original cross layout", function() {
          var crossTable = dataTable.implem;
          var C = crossTable.rows.structure.length +
                  crossTable.cols.structure.length +
                  crossTable.meas.structure.length;

          expect(result.getNumberOfColumns()).toBe(C);
        });

        it("should return a table whose columns have the attributes of the cross layout's " +
            "rows, cols and measures, in that order", function() {
          var crossTable = dataTable.implem;
          var xR = crossTable.rows.structure.length;
          var xC = crossTable.cols.structure.length;
          var xM = crossTable.meas.structure.length;

          for(var i = 0; i < xR; i++)
            expect(result.getColumnAttribute(i)).toBe(crossTable.rows.structure[i].attribute);

          for(i = 0; i < xC; i++)
            expect(result.getColumnAttribute(xR + i)).toBe(crossTable.cols.structure[i].attribute);

          for(i = 0; i < xM; i++)
            expect(result.getColumnAttribute(xR + xC + i)).toBe(crossTable.meas.structure[i].attribute);
        });

        it("should return a table having the same data", function() {
          var plainTable = new DataTable(getPlainDatasetFull1());

          expect(result.toSpec()).toEqual(plainTable.toSpec());
        });
      });
    });
  });
});
