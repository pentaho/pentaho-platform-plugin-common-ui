/*!
* Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
*
*/
define([
  "pentaho/data/Table",
  "pentaho/data/TableView"
], function(DataTable, DataTableView) {

  var fooValue = {},
      barValue = {};

  function getDatasetDT1() {
    return {
      model: [
        {name: "country", type: "string",  label: "Country", p: {foo: fooValue}, isKey: true},
        {name: "sales",   type: "number",  label: "Sales",   p: {bar: barValue}, isContinuous: true},
        {name: "euro",    type: "boolean", label: "Euro"}
      ],
      rows: [
        {c: [ {v: "Portugal"}, {v: 12000, f: "1.2"},  true] },
        {c: [ {v: "Ireland" }, {v:  6000, f: "0.6"}, false] },
        {c: [ {v: "Italy"   }, {v: 10000, f: "1.0"},  true] },
        {c: [ {v: "France"  }, {v: 24000, f: "2.4"},  true] }
      ]
    };
  }

  describe("DataTableView -", function() {

    var dataTable;
    beforeEach(function() { dataTable = new DataTable(getDatasetDT1()); });

    it("should be a function", function() {
      expect(typeof DataTableView).toBe("function");
    });

    describe("#new() -", function() {

      describe("with no arguments -", function() {

        it("should throw", function() {
          expect(function() {
            new DataTableView();
          }).toThrow();
        });

      });

      it("should return an instance of DataTableView", function() {
        var dataView = new DataTableView(dataTable);
        expect(dataView instanceof DataTableView).toBe(true);
      });

      it("should return a data view with all source columns", function() {
        var dataView = new DataTableView(dataTable);
        expect(dataView.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());
      });

      it("should return a data view with all source rows", function() {
        var dataView = new DataTableView(dataTable);
        expect(dataView.getNumberOfRows()).toBe(dataTable.getNumberOfRows());
      });

      it("should return a data view whose source is the specified data table", function() {
        var dataView = new DataTableView(dataTable);
        expect(dataView._source).toBe(dataTable);
      });
    });

    describe("table -", function() {
      describe("#getSourceTable() -", function() {
        it("should return the view's source table", function() {
          var dataView = new DataTableView(dataTable);
          expect(dataView.getSourceTable()).toBe(dataTable);
        });
      });

      describe("#toDataTable() -", function() {
        it("should return a DataTable", function() {
          var dataView = new DataTableView(dataTable);

          expect(dataView.toDataTable() instanceof DataTable).toBe(true);
        });

        it("should not return the source data table", function() {
          var dataView = new DataTableView(dataTable);

          expect(dataView.toDataTable()).not.toBe(dataTable);
        });

        it("should return a data table having the same data", function() {
          var dataView = new DataTableView(dataTable);
          var dataTable2 = dataView.toDataTable();

          expect(dataTable2.toSpec()).toEqual(dataTable.toSpec());
        });

        it("should return a data table having only the view's visible columns", function() {
          var dataView = new DataTableView(dataTable);
          dataView.setSourceColumns([0, 1]);

          var dataTable2 = dataView.toDataTable();

          expect(dataTable2.getNumberOfColumns()).toBe(2);
          expect(dataTable2.getColumnId(0)).toBe('country');
          expect(dataTable2.getColumnId(1)).toBe('sales');

          expect(dataTable2.getNumberOfRows()).toBe(dataTable.getNumberOfRows());
        });

        it("should return a data table having only the view's visible rows", function() {
          var dataView = new DataTableView(dataTable);
          dataView.setSourceRows([0, 1]);

          var dataTable2 = dataView.toDataTable();

          expect(dataTable2.getNumberOfRows()).toBe(2);
          expect(dataTable2.getValue(0, 0)).toBe("Portugal");
          expect(dataTable2.getValue(1, 0)).toBe("Ireland");

          expect(dataTable2.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());
        });
      });
    });

    describe("columns -", function() {
      var dataView;

      beforeEach(function() {
        dataView = new DataTableView(dataTable);
        dataView.setSourceColumns([2, 0, 1]);
      });

      describe("#getNumberOfColumns() -", function() {
        it("should return 0 when there are no columns", function() {
          var dataView2 = new DataTableView(new DataTable());
          expect(dataView2.getNumberOfColumns()).toBe(0);
        });

        it("should return source column count when columns have not been set", function() {
          var dataView2 = new DataTableView(dataTable);
          expect(dataView2.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());
        });

        it("should return 2 when there are 2 visible columns", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceColumns([2, 1]);
          expect(dataView2.getNumberOfColumns()).toBe(2);
        });

        it("should return 3 when there are 3 visible columns", function() {
          expect(dataView.getNumberOfColumns()).toBe(3);
        });
      });

      describe("#getSourceColumnIndex()", function() {
        it("should return the specified index when setSourceColumns was not called", function() {
          var dataView2 = new DataTableView(dataTable);
          expect(dataView2.getSourceColumnIndex(1)).toBe(1);
        });

        it("should return the mapped index when setSourceColumns was called", function() {
          expect(dataView.getSourceColumnIndex(0)).toBe(2);
          expect(dataView.getSourceColumnIndex(1)).toBe(0);
          expect(dataView.getSourceColumnIndex(2)).toBe(1);
        });
      });

      describe("#setSourceColumns()", function() {
        it("should set all columns visible when called with a nully value", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceColumns([]);
          expect(dataView2.getNumberOfColumns()).toBe(0);

          dataView2.setSourceColumns();
          expect(dataView2.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());

          dataView2.setSourceColumns([]);
          dataView2.setSourceColumns(null);
          expect(dataView2.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());

          dataView2.setSourceColumns([]);
          dataView2.setSourceColumns(undefined);
          expect(dataView2.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());
        });

        it("should set only the specified columns visible", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceColumns([0, 1]);
          expect(dataView2.getNumberOfColumns()).toBe(2);
          expect(dataView2.getColumnId(0)).toBe("country");
          expect(dataView2.getColumnId(1)).toBe("sales"  );

          dataView2.setSourceColumns([1, 2, 1]);
          expect(dataView2.getNumberOfColumns()).toBe(3);
          expect(dataView2.getColumnId(0)).toBe("sales"  );
          expect(dataView2.getColumnId(1)).toBe("euro");
          expect(dataView2.getColumnId(2)).toBe("sales"  );
        });

        it("should return `this`", function() {
          var dataView2 = new DataTableView(dataTable);
          expect(dataView2.setSourceColumns([0, 1])).toBe(dataView2);
        });
      });

      describe("#hideColumns()", function() {
        it("should return `this`", function() {
          var dataView2 = new DataTableView(dataTable);
          expect(dataView2.hideColumns([0, 1])).toBe(dataView2);
        });

        it("should make sure the specified source column indexes are hidden", function() {
          dataView.hideColumns([0, 2]);
          expect(dataView.getNumberOfColumns()).toBe(1);
          expect(dataView.getColumnId(0)).toBe("sales");
        });

        it("should not throw if a specified column is already visible", function() {
          dataView.setSourceColumns([0, 2]);
          dataView.hideColumns([1, 0]);
          expect(dataView.getNumberOfColumns()).toBe(1);
          expect(dataView.getColumnId(0)).toBe("euro");
        });
      });

      describe("#getSourceColumns()", function() {
        it("should get all source column indexes, before setSourceColumns is called", function() {
          var dataView2 = new DataTableView(dataTable);
          expect(dataView2.getSourceColumns()).toEqual([0, 1, 2]);
        });

        it("should get the source column indexes currently visible", function() {
          expect(dataView.getSourceColumns()).toEqual([2, 0, 1]);

          dataView.setSourceColumns([1, 2]);
          expect(dataView.getSourceColumns()).toEqual([1, 2]);

          dataView.setSourceColumns([2, 2]);
          expect(dataView.getSourceColumns()).toEqual([2, 2]);
        });
      });

      describe("#getColumnType(j) -", function() {
        it("should return the column type of the given column index", function() {
          expect(dataView.getColumnType(0)).toBe("boolean");
          expect(dataView.getColumnType(1)).toBe("string");
          expect(dataView.getColumnType(2)).toBe("number");
        });
      });

      describe("#getColumnId(j) -", function() {
        it("should return the attribute name of the attribute of the given column index", function() {
          expect(dataView.getColumnId(0)).toBe("euro");
          expect(dataView.getColumnId(1)).toBe("country");
          expect(dataView.getColumnId(2)).toBe("sales");
        });
      });

      describe("#getColumnLabel(j) -", function() {
        it("should return the column label of the given column index", function() {
          expect(dataView.getColumnLabel(0)).toBe("Euro");
          expect(dataView.getColumnLabel(1)).toBe("Country");
          expect(dataView.getColumnLabel(2)).toBe("Sales");
        });
      });

      describe("#getColumnRange(j) -", function() {
        it("should return a range object with both min and max `undefined` when there is no data", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceRows([]);

          expect(dataView2.getColumnRange(1)).toEqual({min: undefined, max: undefined});
        });

        it("should return a range object with the min and max values of the specified column", function() {

          expect(dataView.getColumnRange(0)).toEqual({min: false, max: true});
          expect(dataView.getColumnRange(1)).toEqual({min: "France", max: "Portugal"});
          expect(dataView.getColumnRange(2)).toEqual({min: 6000, max: 24000});
        });
      });

      describe("#getDistinctValues(j) -", function() {

        it("should return an empty array when there is no data", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceRows([]);

          expect(dataView2.getDistinctValues(1)).toEqual([]);
        });

        it("should return an array containing the distinct values of the specified column", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceColumns([2, 0, 1]);
          dataView2.setSourceRows([2, 1, 3, 0]);

          expect(dataView2.getDistinctValues(0)).toEqual([true, false]);
          expect(dataView2.getDistinctValues(1)).toEqual(["Italy", "Ireland", "France", "Portugal"]);
          expect(dataView2.getDistinctValues(2)).toEqual([10000, 6000, 24000, 12000]);
        });
      });

      describe("#getDistinctFormattedValues(j) -", function() {

        it("should return an empty array when there is no data", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceRows([]);

          expect(dataView2.getDistinctFormattedValues(1)).toEqual([]);
        });

        it("should return an array containing the distinct formatted values of the specified column", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceColumns([2, 0, 1]);
          dataView2.setSourceRows([2, 1, 3, 0]);

          expect(dataView2.getDistinctFormattedValues(0)).toEqual(["true", "false"]);
          expect(dataView2.getDistinctFormattedValues(1)).toEqual(["Italy", "Ireland", "France", "Portugal"]);
          expect(dataView2.getDistinctFormattedValues(2)).toEqual(["1.0", "0.6", "2.4", "1.2"]);
        });
      });

      describe("#isColumnKey(j) -", function() {
        it("should return the column isKey of the given column index", function() {
          expect(dataView.isColumnKey(0)).toBe(false);
          expect(dataView.isColumnKey(1)).toBe(true);
          expect(dataView.isColumnKey(2)).toBe(false);
        });
      });

      describe("#addColumn(colSpec)", function() {
        it("should add another column to the root table as last column", function() {
          var count = dataTable.getNumberOfColumns();
          dataTable.model.attributes.add({
            name: "A",
            type: "string",
            label: "A"
          });
          dataView.addColumn("A");

          expect(dataTable.getNumberOfColumns()).toBe(count + 1);
          expect(dataTable.getColumnId(count)).toBe("A");
        });

        it("should make the new column visible in the view", function() {
          var count = dataTable.getNumberOfColumns();
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceColumns([0, 1]);

          dataTable.model.attributes.add({
            name: "A",
            type: "string",
            label: "A"
          });
          dataView2.addColumn("A");

          expect(dataTable.getColumnId(count)).toBe("A");

          expect(dataView2.getNumberOfColumns()).toBe(3);
          expect(dataView2.getColumnId(2)).toBe("A");
        });

        it("should return the index of the added view column", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceColumns([0, 1]);

          dataTable.model.attributes.add({
            name: "A",
            type: "string",
            label: "A"
          });
          var index = dataView2.addColumn("A");
          expect(index).toBe(2);
        });
      });
    });

    describe("rows -", function() {
      describe("#getNumberOfRows() -", function() {
        it("should return 0 when there are no rows", function() {
          var dataView2 = new DataTableView(new DataTable());
          expect(dataView2.getNumberOfRows()).toBe(0);
        });

        it("should return source row count when rows have not been set", function() {
          var dataView2 = new DataTableView(dataTable);
          expect(dataView2.getNumberOfRows()).toBe(dataTable.getNumberOfRows());
        });

        it("should return 2 when there are 2 visible rows", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceRows([1, 2]);
          expect(dataView2.getNumberOfRows()).toBe(2);
        });

        it("should return 3 when there are 3 visible rows", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceRows([1, 2, 0]);
          expect(dataView2.getNumberOfRows()).toBe(3);
        });
      });

      describe("#getSourceRowIndex()", function() {
        it("should return the specified index when setRows was not called", function() {
          var dataView2 = new DataTableView(dataTable);
          expect(dataView2.getSourceRowIndex(1)).toBe(1);
          expect(dataView2.getSourceRowIndex(0)).toBe(0);
        });

        it("should return the mapped index when setRows was called", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceRows([0, 2, 1]);
          expect(dataView2.getSourceRowIndex(0)).toBe(0);
          expect(dataView2.getSourceRowIndex(1)).toBe(2);
          expect(dataView2.getSourceRowIndex(2)).toBe(1);
        });
      });

      describe("#setSourceRows()", function() {
        it("should set all rows visible when called with a nully value", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceRows([]);
          expect(dataView2.getNumberOfRows()).toBe(0);

          dataView2.setSourceRows();
          expect(dataView2.getNumberOfRows()).toBe(dataTable.getNumberOfRows());

          dataView2.setSourceRows([]);
          dataView2.setSourceRows(null);
          expect(dataView2.getNumberOfRows()).toBe(dataTable.getNumberOfRows());

          dataView2.setSourceRows([]);
          dataView2.setSourceRows(undefined);
          expect(dataView2.getNumberOfRows()).toBe(dataTable.getNumberOfRows());
        });

        it("should set only the specified rows visible", function() {
          var dataView2 = new DataTableView(dataTable);
          dataView2.setSourceRows([1, 0]);
          expect(dataView2.getNumberOfRows()).toBe(2);
          expect(dataView2.getValue(0, 0)).toBe("Ireland");
          expect(dataView2.getValue(1, 0)).toBe("Portugal");

          dataView2.setSourceRows([1, 2, 1]);
          expect(dataView2.getNumberOfRows()).toBe(3);
          expect(dataView2.getValue(0, 0)).toBe("Ireland");
          expect(dataView2.getValue(1, 0)).toBe("Italy");
          expect(dataView2.getValue(2, 0)).toBe("Ireland");
        });

        it("should return `this`", function() {
          var dataView2 = new DataTableView(dataTable);
          expect(dataView2.setSourceRows([0, 1])).toBe(dataView2);
        });
      });

      describe("#getSourceRows()", function() {
        var dataView;

        beforeEach(function() {
          dataView = new DataTableView(dataTable);
        });

        it("should return null before setSourceRows is called", function() {
          expect(dataView.getSourceRows()).toBe(null);
        });

        it("should get the source column indexes currently visible", function() {
          dataView.setSourceRows([1, 2]);
          expect(dataView.getSourceRows()).toEqual([1, 2]);

          dataView.setSourceRows([2, 2]);
          expect(dataView.getSourceRows()).toEqual([2, 2]);
        });
      });
    });

    describe("cells -", function() {
      var dataView;

      beforeEach(function() {
        dataView = new DataTableView(dataTable);
        dataView.setSourceColumns([2, 0, 1]);
        dataView.setSourceRows([3, 0, 1]);
      });

      describe("#getValue()", function() {
        it("should return the value of the specified row and column", function() {
          expect(dataView.getValue(0, 1)).toBe("France");
          expect(dataView.getValue(2, 0)).toBe(false);
        });
      });

      describe("#getFormattedValue()", function() {
        it("should return the formatted value of the specified row and column", function() {
          expect(dataView.getFormattedValue(0, 2)).toBe("2.4");
          expect(dataView.getFormattedValue(1, 0)).toBe("true");
        });
      });

      describe("#getLabel()", function() {
        it("should return the label of the specified row and column", function() {
          expect(dataView.getLabel(0, 2)).toBe("2.4");
          expect(dataView.getLabel(1, 0)).toBe(undefined);
        });
      });

      describe("#getCell()", function() {
        it("should return the cell of the specified row and column", function() {
          var cell = dataView.getCell(0, 2);
          expect(cell.v).toBe(24000);
          expect(cell.f).toBe("2.4");

          cell = dataView.getCell(1, 0);
          expect(cell.v).toBe(true);
          expect(cell.f).toBe(undefined);
        });
      });

    });
  });
});
