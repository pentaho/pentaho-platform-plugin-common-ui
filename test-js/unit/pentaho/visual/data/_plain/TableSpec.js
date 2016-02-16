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
  "pentaho/data/Model",
  "pentaho/data/Attribute",
  "pentaho/data/_plain/Table",
  "pentaho/data/_plain/RowList",
  "pentaho/data/_plain/Row",
  "pentaho/data/Structure",
  "tests/pentaho/util/errorMatch"
], function(Model, Attribute, Table, RowList, Row, Structure, errorMatch) {

  function createModel1() {
    return new Model([
        {name: "A", type: "string"},
        {name: "B", type: "number"},
        {name: "C", type: "boolean"}
      ]);
  }

  describe("plain/Table -", function() {

    it("should be a function", function() {
      expect(typeof Table).toBe("function");
    });

    describe("new(spec, keyArgs) -", function() {
      var model;

      beforeEach(function() {
        model = createModel1();
      });

      it("should throw when `spec` is not specified", function() {
        expect(function() {
          new Table(null, {model: model});
        }).toThrow(errorMatch.argRequired("spec"));
      });

      it("should throw when `keyArgs.model` is not specified", function() {
        expect(function() {
          new Table({});
        }).toThrow(errorMatch.argRequired("keyArgs.model"));
      });

      describe("when `spec` has empty cols and rows arrays -", function() {
        var table;
        beforeEach(function() {
          table = new Table({cols: [], rows: []}, {model: model});
        });

        it("should create an instance of plain/Table", function() {
          expect(table instanceof Table).toBe(true);
        });

        it("should create a table with an empty rows array", function() {
          expect(table.rows instanceof Array).toBe(true);
          expect(table.rows instanceof RowList).toBe(true);
          expect(table.rows.length).toBe(0);
        });

        it("should create a table whose rows have an empty structure array", function() {
          expect(table.cols instanceof Array).toBe(true);
          expect(table.cols instanceof Structure).toBe(true);
          expect(table.cols.length).toBe(0);
        });
      });

      describe("when `spec` has 3 cols, with existing attributes, and an empty rows arrays -", function() {
        var table;
        beforeEach(function() {
          table = new Table({
              cols: ["A", "B", "C"],
              rows: []
            }, {
              model: model
            });
        });

        it("should create a table with an empty rows array", function() {
          expect(table.rows instanceof Array).toBe(true);
          expect(table.rows instanceof RowList).toBe(true);
          expect(table.rows.length).toBe(0);
        });

        it("should create a table whose rows have a structure array with length 3", function() {
          expect(table.cols instanceof Structure).toBe(true);
          expect(table.cols.length).toBe(3);
        });

        it("should create a table whose rows have a structure whose positions have the specified attributes and ordinals", function() {
          var cols = table.cols;
          expect(cols[0].attribute).toBe(model.attributes.get("A"));
          expect(cols[1].attribute).toBe(model.attributes.get("B"));
          expect(cols[2].attribute).toBe(model.attributes.get("C"));

          expect(cols[0].ordinal).toBe(0);
          expect(cols[1].ordinal).toBe(1);
          expect(cols[2].ordinal).toBe(2);
        });
      });

      describe("when `spec` has one col with an undefined attribute -", function() {
        it("should throw an error", function() {
          expect(function() {
            new Table({
              cols: ["Z"],
              rows: []
            }, {
              model: model
            });
          }).toThrowError("A attribute with name 'Z' is not defined.");
        });
      });

      describe("when `spec` has one colSpec, an object with property `attr`, the name of an existing attribute -", function() {
        it("should create a table whose rows have a structure with that attribute", function() {
          var table = new Table({
              cols: [{attr: "A"}],
              rows: []
            }, {
              model: model
            });

          expect(table.cols[0].attribute).toBe(model.attributes.get("A"));
        });
      });

      describe("when `spec` has no cols", function() {
        it("should create the column structure from the existing model attributes", function() {
          var table = new Table({
              rows: []
            }, {
              model: model
            });

          expect(table.cols.length).toBe(model.attributes.length);
          expect(table.cols[0].attribute).toBe(model.attributes[0]);
          expect(table.cols[1].attribute).toBe(model.attributes[1]);
          expect(table.cols[2].attribute).toBe(model.attributes[2]);
        });
      });

      describe("when `spec` has an empty cols array", function() {
        it("should not create the column structure from the existing model attributes", function() {
          var table = new Table({
            cols: [],
            rows: []
          }, {
            model: model
          });

          expect(table.cols.length).toBe(0);
        });
      });

      // ROWS
      describe("rows -", function() {
        describe("when `spec` has one row -", function() {
          it("should load one row", function() {
            var table = new Table({
                cols: ["A", "B", "C"],
                rows: [
                  ["a", 123, true]
                ]
              }, {
                model: model
              });

            expect(table.rows.length).toBe(1);
          });

          it("should load one row with the given cell values", function() {
            var table = new Table({
              cols: ["A", "B", "C"],
              rows: [
                ["a", 123, true]
              ]
            }, {
              model: model
            });

            var row = table.rows[0];
            expect(row.cells instanceof Array).toBe(true);
            expect(row.cells.length).toBe(3);

            expect(row.cells[0].value).toBe("a");
            expect(row.cells[0].label).toBe(undefined);

            expect(row.cells[1].value).toBe(123);
            expect(row.cells[1].label).toBe(undefined);

            expect(row.cells[2].value).toBe(true);
            expect(row.cells[2].label).toBe(undefined);
          });

          it("should register non-nully values of discrete attributes", function() {
            new Table({
                cols: ["A", "B", "C"],
                rows: [
                  ["a", 123, true]
                ]
              }, {
                model: model
              });

            var members = model.attributes.get("A").members;
            expect(members.length).toBe(1);

            expect(members[0].value).toBe("a");
            expect(members[0].label).toBe(undefined);
          });

          it("should not register null values of discrete attributes", function() {
            new Table({
                cols: ["A", "B", "C"],
                rows: [
                  [null, 123, true]
                ]
              }, {
                model: model
              });

            var members = model.attributes.get("A").members;
            expect(members.length).toBe(0);
          });

          it("should not register undefined values of discrete attributes", function() {
            new Table({
                cols: ["A", "B", "C"],
                rows: [
                  [undefined, 123, true]
                ]
              }, {
                model: model
              });

            var members = model.attributes.get("A").members;
            expect(members.length).toBe(0);
          });

          it("should register non-nully values of discrete attributes, but not use the source cell's label", function() {
            var table = new Table({
                cols: ["A", "B", "C"],
                rows: [
                  [{v: "a", f: "AAA"}, 123, true]
                ]
              }, {
                model: model
              });

            var row = table.rows[0];
            expect(row.cells instanceof Array).toBe(true);
            expect(row.cells.length).toBe(3);

            expect(row.cells[0].value).toBe("a");
            expect(row.cells[0].label).toBe("AAA");

            var members = model.attributes.get("A").members;
            expect(members.length).toBe(1);

            expect(members[0].value).toBe("a");
            expect(members[0].label).toBe(undefined);
          });

          it("should accept rows with the 'c' array property", function() {
            var table = new Table({
              cols: ["A", "B", "C"],
              rows: [
                {c: [{v: "a", f: "AAA"}, 123, true]}
              ]
            }, {
              model: model
            });

            var row = table.rows[0];
            expect(row.cells instanceof Array).toBe(true);
            expect(row.cells.length).toBe(3);

            expect(row.cells[0].value).toBe("a");
            expect(row.cells[0].label).toBe("AAA");

            expect(row.cells[1].value).toBe(123);
            expect(row.cells[2].value).toBe(true);
          });
        });

        describe("when `spec` has more than one row -", function() {

          it("should load all rows with the given cell values", function() {
            var table = new Table({
              cols: ["A", "B", "C"],
              rows: [
                [{v: "a", f: "AAA"}, 123, true],
                [{v: "b", f: "BBB"}, 345, false]
              ]
            }, {
              model: model
            });

            var row = table.rows[0];
            expect(row.cells instanceof Array).toBe(true);
            expect(row.cells.length).toBe(3);

            expect(row.cells[0].value).toBe("a");
            expect(row.cells[0].label).toBe("AAA");

            expect(row.cells[1].value).toBe(123);
            expect(row.cells[1].label).toBe(undefined);

            expect(row.cells[2].value).toBe(true);
            expect(row.cells[2].label).toBe(undefined);

            row = table.rows[1];
            expect(row.cells instanceof Array).toBe(true);
            expect(row.cells.length).toBe(3);

            expect(row.cells[0].value).toBe("b");
            expect(row.cells[0].label).toBe("BBB");

            expect(row.cells[1].value).toBe(345);
            expect(row.cells[1].label).toBe(undefined);

            expect(row.cells[2].value).toBe(false);
            expect(row.cells[2].label).toBe(undefined);
          });

          it("should register non-nully values of discrete attributes, occurring more than once, only once", function() {
            new Table({
              cols: ["A", "B", "C"],
              rows: [
                [{v: "a", f: "AAA"}, 123, true ],
                [{v: "a", f: "BBB"}, 345, false]
              ]
            }, {
              model: model
            });

            var members = model.attributes.get("A").members;
            expect(members.length).toBe(1);

            expect(members[0].value).toBe("a");
            expect(members[0].label).toBe(undefined);
          });

          it("should register all non-nully distinct values of discrete attributes, in occurrence order", function() {
            new Table({
              cols: ["A", "B", "C"],
              rows: [
                [{v: "a", f: "AAA"}, 123, true ],
                [{v: "c", f: "BBB"}, 345, false],
                [{v: "b", f: "BBB"}, 345, false]
              ]
            }, {
              model: model
            });

            var members = model.attributes.get("A").members;
            expect(members.length).toBe(3);

            expect(members[0].value).toBe("a");
            expect(members[1].value).toBe("c");
            expect(members[2].value).toBe("b");
          });
        });
      });
    });

    describe("#addColumn(colSpec, keyArgs)", function() {
      var model;

      beforeEach(function() {
        model = createModel1();
      });

      describe("when `colSpec` specifies an attribute that exists in the model -", function() {
        it("should add another column to the table ", function() {
          var table = new Table({cols: [], rows: []}, {model: model});

          expect(table.getNumberOfColumns()).toBe(0);

          // ------

          table.addColumn("A");
          expect(table.getNumberOfColumns()).toBe(1);

          table.addColumn("B");
          expect(table.getNumberOfColumns()).toBe(2);
        });
      });

      describe("when `colSpec` specifies an attribute that does not exist in the model -", function() {
        it("should throw when the specified attribute does not exist in the model", function() {
          var table = new Table({cols: [], rows: []}, {model: model});

          expect(function() {
            table.addColumn("Z");
          }).toThrowError("A attribute with name 'Z' is not defined.");
        });
      });

      it("should add another column to the table as the last column", function() {
        var table = new Table({
            cols: ["A", "B", "C"],
            rows: [
              [{v: "a", f: "AAA"}, 123, true ],
              [{v: "a", f: "BBB"}, 345, false]
            ]
          }, {model: model});

        model.attributes.add({
          name: "D",
          type: "number",
          label: "D"
        });
        table.addColumn("D");

        expect(table.getColumnId(3)).toBe("D");
      });

      it("should return the index of the added column", function() {
        var table = new Table({
          cols: ["A", "B", "C"],
          rows: [
            [{v: "a", f: "AAA"}, 123, true ],
            [{v: "a", f: "BBB"}, 345, false]
          ]
        }, {model: model});

        model.attributes.add({
          name: "D",
          type: "number",
          label: "D"
        });

        var index = table.addColumn("D");

        expect(index).toBe(3);
      });

      it("should respect all of the specified known column attributes", function() {
        var table = new Table({
            cols: ["A", "B", "C"],
            rows: [
              [{v: "a", f: "AAA"}, 123, true ],
              [{v: "a", f: "BBB"}, 345, false]
            ]
          }, {model: model});

        model.attributes.add({
          name: "D",
          type: "number",
          label: "d"
        });
        var index = table.addColumn("D");

        expect(table.getColumnId(index)).toBe("D");
        expect(table.getColumnType(index)).toBe("number");
        expect(table.getColumnLabel(index)).toBe("d");
      });

      it("should set that column's cell value to null in all existing rows", function() {
        var table = new Table({
          cols: ["A", "B", "C"],
          rows: [
            [{v: "a", f: "AAA"}, 123, true ],
            [{v: "a", f: "BBB"}, 345, false]
          ]
        }, {model: model});

        model.attributes.add({
          name: "D",
          type: "number",
          label: "d"
        });
        var colIndex = table.addColumn("D");

        var i = table.getNumberOfRows();
        while(i--) expect(table.getValue(i, colIndex)).toBe(null);
      });
    });
  });
});