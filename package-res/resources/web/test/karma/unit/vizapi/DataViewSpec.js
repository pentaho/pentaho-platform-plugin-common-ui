define([
  "common-ui/vizapi/DataTable"
], function() {

  var DataTable = pentaho.DataTable,
      DataView  = pentaho.DataView,
      fooValue = {},
      barValue = {};

  function getDatasetDT1() {
    return {
      cols: [
        {id: "country", type: "string",  label: "Country", foo: fooValue},
        {id: "sales",   type: "number",  label: "Sales",   bar: barValue},
        {id: "euro",    type: "boolean", label: "Euro"   }
      ],
      rows: [
        {c: [ {v: "Portugal"}, {v: 12000, f: "1.2"},  true] },
        {c: [ {v: "Ireland" }, {v:  6000, f: "0.6"}, false] },
        {c: [ {v: "Italy"   }, {v: 10000, f: "1.0"},  true] },
        {c: [ {v: "France"  }, {v: 24000, f: "2.4"},  true] },
      ]
    };
  }

  describe("DataView -", function() {

    var dataTable;
    beforeEach(function() { dataTable = new DataTable(getDatasetDT1()); });

    it("should be a function", function() {
      expect(typeof DataView).toBe("function");
    });

    describe("#new() -", function() {

      describe("with no arguments -", function() {

        it("should throw", function() {
          expect(function() {
            new DataView();
          }).toThrow();
        });

      });

      describe("with one argument, a plain JavaScript object in DataTable format -", function() {

        it("should return an instance of DataView", function() {
          var dataView = new DataView(dataTable);
          expect(dataView instanceof DataView).toBe(true);
        });

        it("should return a data view with all source columns", function() {
          var dataView = new DataView(dataTable);
          expect(dataView.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());
        });

        it("should return a data view with all source rows", function() {
          var dataView = new DataView(dataTable);
          expect(dataView.getNumberOfRows()).toBe(dataTable.getNumberOfRows());
        });

        it("should return a data view whose source is the specified data table", function() {
          var dataView = new DataView(dataTable);
          expect(dataView._source).toBe(dataTable);
        });
      });
    });

    describe("table -", function() {
      describe("#getSourceTable() -", function() {
        it("should return the view's source table", function() {
          var dataView = new DataView(dataTable);
          expect(dataView.getSourceTable()).toBe(dataTable);
        });
      });

      describe("#toDataTable() -", function() {
        it("should return a DataTable", function() {
          var dataView = new DataView(dataTable);

          expect(dataView.toDataTable() instanceof DataTable).toBe(true);
        });

        it("should not return the source data table", function() {
          var dataView = new DataView(dataTable);

          expect(dataView.toDataTable()).not.toBe(dataTable);
        });

        it("should return a data table having the same data", function() {
          var dataView = new DataView(dataTable);
          var dataTable2 = dataView.toDataTable();

          expect(dataTable2.toJSON()).toEqual(dataTable.toJSON());
        });

        it("should return a data table having only the view's visible columns", function() {
          var dataView = new DataView(dataTable);
          dataView.setColumns([0, 1]);

          var dataTable2 = dataView.toDataTable();

          expect(dataTable2.getNumberOfColumns()).toBe(2);
          expect(dataTable2.getColumnId(0)).toBe('country');
          expect(dataTable2.getColumnId(1)).toBe('sales');

          expect(dataTable2.getNumberOfRows()).toBe(dataTable.getNumberOfRows());
        });

        it("should return a data table having only the view's visible rows", function() {
          var dataView = new DataView(dataTable);
          dataView.setRows([0, 1]);

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
        dataView = new DataView(dataTable);
        dataView.setColumns([2, 0, 1]);
      });

      describe("#getNumberOfColumns() -", function() {
        it("should return 0 when there are no columns", function() {
          var dataView2 = new DataView(new DataTable());
          expect(dataView2.getNumberOfColumns()).toBe(0);
        });

        it("should return source column count when columns have not been set", function() {
          var dataView2 = new DataView(dataTable);
          expect(dataView2.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());
        });

        it("should return 2 when there are 2 visible columns", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setColumns([2, 1]);
          expect(dataView2.getNumberOfColumns()).toBe(2);
        });

        it("should return 3 when there are 3 visible columns", function() {
          expect(dataView.getNumberOfColumns()).toBe(3);
        });
      });

      describe("#getTableColumnIndex()", function() {
        it("should return the specified index when setColumns was not called", function() {
          var dataView2 = new DataView(dataTable);
          expect(dataView2.getTableColumnIndex(1)).toBe(1);
        });

        it("should return the mapped index when setColumns was called", function() {
          expect(dataView.getTableColumnIndex(0)).toBe(2);
          expect(dataView.getTableColumnIndex(1)).toBe(0);
          expect(dataView.getTableColumnIndex(2)).toBe(1);
        });
      });

      describe("#setColumns()", function() {
        it("should set all columns visible when called with a nully value", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setColumns([]);
          expect(dataView2.getNumberOfColumns()).toBe(0);

          dataView2.setColumns();
          expect(dataView2.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());

          dataView2.setColumns([]);
          dataView2.setColumns(null);
          expect(dataView2.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());

          dataView2.setColumns([]);
          dataView2.setColumns(undefined);
          expect(dataView2.getNumberOfColumns()).toBe(dataTable.getNumberOfColumns());
        });

        it("should set only the specified columns visible", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setColumns([0, 1]);
          expect(dataView2.getNumberOfColumns()).toBe(2);
          expect(dataView2.getColumnId(0)).toBe("country");
          expect(dataView2.getColumnId(1)).toBe("sales"  );

          dataView2.setColumns([1, 2, 1]);
          expect(dataView2.getNumberOfColumns()).toBe(3);
          expect(dataView2.getColumnId(0)).toBe("sales"  );
          expect(dataView2.getColumnId(1)).toBe("euro");
          expect(dataView2.getColumnId(2)).toBe("sales"  );
        });

        it("should return `this`", function() {
          var dataView2 = new DataView(dataTable);
          expect(dataView2.setColumns([0, 1])).toBe(dataView2);
        });
      });

      describe("#hideColumns()", function() {
        it("should return `this`", function() {
          var dataView2 = new DataView(dataTable);
          expect(dataView2.hideColumns([0, 1])).toBe(dataView2);
        });

        it("should make sure the specified source column indexes are hidden", function() {
          dataView.hideColumns([0, 2]);
          expect(dataView.getNumberOfColumns()).toBe(1);
          expect(dataView.getColumnId(0)).toBe("sales");
        });

        it("should not throw if a specified column is already visible", function() {
          dataView.setColumns([0, 2]);
          dataView.hideColumns([1, 0]);
          expect(dataView.getNumberOfColumns()).toBe(1);
          expect(dataView.getColumnId(0)).toBe("euro");
        });
      });

      describe("#getViewColumns()", function() {
        it("should get all source column indexes, before setColumns is called", function() {
          var dataView2 = new DataView(dataTable);
          expect(dataView2.getViewColumns()).toEqual([0, 1, 2]);
        });

        it("should get the source column indexes currently visible", function() {
          expect(dataView.getViewColumns()).toEqual([2, 0, 1]);

          dataView.setColumns([1, 2]);
          expect(dataView.getViewColumns()).toEqual([1, 2]);

          dataView.setColumns([2, 2]);
          expect(dataView.getViewColumns()).toEqual([2, 2]);
        });
      });

      describe("#getColumnType() -", function() {
        it("should return the column type of the given column index", function() {
          expect(dataView.getColumnType(0)).toBe("boolean");
          expect(dataView.getColumnType(1)).toBe("string");
          expect(dataView.getColumnType(2)).toBe("number");
        });
      });

      describe("#getColumnId() -", function() {
        it("should return the column id of the given column index", function() {
          expect(dataView.getColumnId(0)).toBe("euro");
          expect(dataView.getColumnId(1)).toBe("country");
          expect(dataView.getColumnId(2)).toBe("sales");
        });
      });

      describe("#getColumnLabel() -", function() {
        it("should return the column label of the given column index", function() {
          expect(dataView.getColumnLabel(0)).toBe("Euro");
          expect(dataView.getColumnLabel(1)).toBe("Country");
          expect(dataView.getColumnLabel(2)).toBe("Sales");
        });
      });

      describe("#getColumnProperty() -", function() {
        it("should return the value of the specified column property", function() {
          expect(dataView.getColumnProperty(1, "foo")).toBe(fooValue);
          expect(dataView.getColumnProperty(2, "bar")).toBe(barValue);
        });

        it("should return `undefined` for a column property which is not defined", function() {
          expect(dataView.getColumnProperty(0, "foo")).toBeUndefined();
        });
      });

      describe("#setColumnProperty() -", function() {
        it("should set the value of the specified column property", function() {
          var guru = {};
          dataView.setColumnProperty(0, "guru", guru);

          expect(dataView.getColumnProperty(0, "guru")).toBe(guru);
          expect(dataTable.getColumnProperty(2, "guru")).toBe(guru);
        });
      });

      describe("#getColumnRange() -", function() {
        it("should return a range object with both min and max `undefined` when there is no data", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setRows([]);

          expect(dataView2.getColumnRange(1)).toEqual({min: undefined, max: undefined});
        });

        it("should return a range object with the min and max values of the specified column", function() {

          expect(dataView.getColumnRange(0)).toEqual({min: false, max: true});
          expect(dataView.getColumnRange(1)).toEqual({min: "France", max: "Portugal"});
          expect(dataView.getColumnRange(2)).toEqual({min: 6000, max: 24000});
        });
      });

      describe("#getDistinctValues() -", function() {

        it("should return an empty array when there is no data", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setRows([]);

          expect(dataView2.getDistinctValues(1)).toEqual([]);
        });

        it("should return an array containing the distinct values of the specified column", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setColumns([2, 0, 1]);
          dataView2.setRows([2, 1, 3, 0]);

          expect(dataView2.getDistinctValues(0)).toEqual([true, false]);
          expect(dataView2.getDistinctValues(1)).toEqual(["Italy", "Ireland", "France", "Portugal"]);
          expect(dataView2.getDistinctValues(2)).toEqual([10000, 6000, 24000, 12000]);
        });
      });

      describe("#getDistinctFormattedValues() -", function() {

        it("should return an empty array when there is no data", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setRows([]);

          expect(dataView2.getDistinctFormattedValues(1)).toEqual([]);
        });

        it("should return an array containing the distinct formatted values of the specified column", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setColumns([2, 0, 1]);
          dataView2.setRows([2, 1, 3, 0]);

          expect(dataView2.getDistinctFormattedValues(0)).toEqual(["true", "false"]);
          expect(dataView2.getDistinctFormattedValues(1)).toEqual(["Italy", "Ireland", "France", "Portugal"]);
          expect(dataView2.getDistinctFormattedValues(2)).toEqual(["1.0", "0.6", "2.4", "1.2"]);
        });
      });

      describe("#addColumn()", function() {
        it("should add another column to the root table as last column", function() {
          var count = dataTable.getNumberOfColumns();
          dataView.addColumn({id: "A", type: "string", label: "A"});

          expect(dataTable.getNumberOfColumns()).toBe(count + 1);
          expect(dataTable.getColumnId(count)).toBe("A");
        });

        it("should make the new column visible in the view", function() {
          var count = dataTable.getNumberOfColumns();
          var dataView2 = new DataView(dataTable);
          dataView2.setColumns([0, 1]);
          dataView2.addColumn({id: "A", type: "string", label: "A"});

          expect(dataTable.getColumnId(count)).toBe("A");

          expect(dataView2.getNumberOfColumns()).toBe(3);
          expect(dataView2.getColumnId(2)).toBe("A");
        });

        it("should return the index of the added view column", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setColumns([0, 1]);
          var index = dataView2.addColumn({id: "A", type: "string", label: "A"});
          expect(index).toBe(2);
        });
      });
    });

    describe("rows -", function() {
      describe("#getNumberOfRows() -", function() {
        it("should return 0 when there are no rows", function() {
          var dataView2 = new DataView(new DataTable());
          expect(dataView2.getNumberOfRows()).toBe(0);
        });

        it("should return source row count when rows have not been set", function() {
          var dataView2 = new DataView(dataTable);
          expect(dataView2.getNumberOfRows()).toBe(dataTable.getNumberOfRows());
        });

        it("should return 2 when there are 2 visible rows", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setRows([1, 2]);
          expect(dataView2.getNumberOfRows()).toBe(2);
        });

        it("should return 3 when there are 3 visible rows", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setRows([1, 2, 0]);
          expect(dataView2.getNumberOfRows()).toBe(3);
        });
      });

      describe("#getTableRowIndex()", function() {
        it("should return the specified index when setRows was not called", function() {
          var dataView2 = new DataView(dataTable);
          expect(dataView2.getTableRowIndex(1)).toBe(1);
          expect(dataView2.getTableRowIndex(0)).toBe(0);
        });

        it("should return the mapped index when setRows was called", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setRows([0, 2, 1]);
          expect(dataView2.getTableRowIndex(0)).toBe(0);
          expect(dataView2.getTableRowIndex(1)).toBe(2);
          expect(dataView2.getTableRowIndex(2)).toBe(1);
        });
      });

      describe("#setRows()", function() {
        it("should set all rows visible when called with a nully value", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setRows([]);
          expect(dataView2.getNumberOfRows()).toBe(0);

          dataView2.setRows();
          expect(dataView2.getNumberOfRows()).toBe(dataTable.getNumberOfRows());

          dataView2.setRows([]);
          dataView2.setRows(null);
          expect(dataView2.getNumberOfRows()).toBe(dataTable.getNumberOfRows());

          dataView2.setRows([]);
          dataView2.setRows(undefined);
          expect(dataView2.getNumberOfRows()).toBe(dataTable.getNumberOfRows());
        });

        it("should set only the specified rows visible", function() {
          var dataView2 = new DataView(dataTable);
          dataView2.setRows([1, 0]);
          expect(dataView2.getNumberOfRows()).toBe(2);
          expect(dataView2.getValue(0, 0)).toBe("Ireland");
          expect(dataView2.getValue(1, 0)).toBe("Portugal");

          dataView2.setRows([1, 2, 1]);
          expect(dataView2.getNumberOfRows()).toBe(3);
          expect(dataView2.getValue(0, 0)).toBe("Ireland");
          expect(dataView2.getValue(1, 0)).toBe("Italy");
          expect(dataView2.getValue(2, 0)).toBe("Ireland");
        });

        it("should return `this`", function() {
          var dataView2 = new DataView(dataTable);
          expect(dataView2.setRows([0, 1])).toBe(dataView2);
        });
      });

      describe("#getViewRows()", function() {
        var dataView;

        beforeEach(function() {
          dataView = new DataView(dataTable);
        });

        it("should return null before setColumns is called", function() {
          expect(dataView.getViewRows()).toBe(null);
        });

        it("should get the source column indexes currently visible", function() {
          dataView.setRows([1, 2]);
          expect(dataView.getViewRows()).toEqual([1, 2]);

          dataView.setRows([2, 2]);
          expect(dataView.getViewRows()).toEqual([2, 2]);
        });
      });
    });

    describe("cells -", function() {
      var dataView;

      beforeEach(function() {
        dataView = new DataView(dataTable);
        dataView.setColumns([2, 0, 1]);
        dataView.setRows([3, 0, 1]);
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
          expect(dataView.getLabel(1, 0)).toBe(null);
        });
      });

      describe("#getCell()", function() {
        it("should return the cell of the specified row and column", function() {
          expect(dataView.getCell(0, 2)).toEqual({v: 24000, f: "2.4"});
          expect(dataView.getCell(1, 0)).toEqual({v: true,  f:  null});
        });
      });

    });
  });
});
