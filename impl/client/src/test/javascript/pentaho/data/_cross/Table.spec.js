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
 */
define([
  "pentaho/data/Model",
  "pentaho/data/Attribute",
  "pentaho/data/Structure",
  "pentaho/data/CellTuple",
  "pentaho/data/_cross/Table",
  "pentaho/data/_cross/Axis",
  "pentaho/data/_cross/MeasureCellSet",
  "tests/pentaho/util/errorMatch"
], function(Model, Attribute, Structure, CellTuple, Table, Axis, MeasureCellSet, errorMatch) {

  function createModel1() {
    return new Model([
      {name: "D1", type: "string" },
      {name: "D2", type: "string" },
      {name: "D3", type: "string" },
      {name: "N1", type: "number" },
      {name: "N2", type: "number" },
      {name: "B1", type: "boolean"}
    ]);
  }

  var UNDEFINED_ATTRIBUTE_FOO_ERROR = "A attribute with name 'foo' is not defined.";
  var MISMATCHED_COL_ATTR_D3_ERROR = "Invalid cross-table - attribute mismatch: 'D3'. Expected: 'D2'.";

  var NOT_MEASURE_ATTR_N2_ERROR = "A structure position with name 'N2' is not defined.";
  var NOT_MEASURE_ATTR_D1_ERROR = "A structure position with name 'D1' is not defined.";
  var NOT_MEASURE_ATTR_Z1_ERROR = "A structure position with name 'Z1' is not defined.";

  describe("cross/Table -", function() {

    var model;

    beforeEach(function() {
      model = createModel1();
    });

    it("should be a function", function() {
      expect(typeof Table).toBe("function");
    });

    describe("new(spec, keyArgs) -", function() {
      it("should throw when `keyArgs.model` is not specified", function() {
        expect(function() {
          new Table({});
        }).toThrow(errorMatch.argRequired("keyArgs.model"));
      });

      it("should create empty cols and rows axes and measures list when all these are empty or nully in `spec.layout`", function() {
        expectTable(new Table({
          layout: {
            rows: [],
            cols: [],
            meas: []
          }
        }, {model: model}));

        expectTable(new Table({
          layout: {}
        }, {model: model}));

        expectTable(new Table({
          layout: {
            rows: null,
            cols: null,
            meas: null
          }
        }, {model: model}));

        expectTable(new Table({
          layout: {
            rows: undefined,
            cols: undefined,
            meas: undefined
          }
        }, {model: model}));

        expectTable(new Table({}, {model: model}));

        function expectTable(table) {
          expect(table.rows instanceof Array).toBe(true);
          expect(table.rows.structure instanceof Structure).toBe(true);
          expect(table.rows.structure.length).toBe(0);
          expect(table.rows.length).toBe(0);

          expect(table.cols instanceof Array).toBe(true);
          expect(table.cols.structure instanceof Structure).toBe(true);
          expect(table.cols.structure.length).toBe(0);
          expect(table.cols.length).toBe(0);

          expect(table.meas instanceof MeasureCellSet).toBe(true);
          expect(table.meas.structure instanceof Structure).toBe(true);
          expect(table.meas.structure.length).toBe(0);
        }
      });

      it("should create the correct structure of axes.cols, axes.rows and measures, when these are specified in `spec.layout`", function() {
        var table = new Table({
            layout: {
              rows: ["D1", "D2"],
              cols: ["D3"],
              meas: ["N1"]
            },
            cols: ["D1", "D2"]
          }, {
            model: model
          });

        var structure = table.rows.structure;
        expect(structure instanceof Structure).toBe(true);
        expect(structure.length).toBe(2);
        expect(structure[0].attribute).toBe(model.attributes.get("D1"));
        expect(structure[1].attribute).toBe(model.attributes.get("D2"));

        structure = table.cols.structure;
        expect(structure instanceof Structure).toBe(true);
        expect(structure.length).toBe(1);
        expect(structure[0].attribute).toBe(model.attributes.get("D3"));

        structure = table.meas.structure;
        expect(structure instanceof Structure).toBe(true);
        expect(structure.length).toBe(1);
        expect(structure[0].attribute).toBe(model.attributes.get("N1"));
      });

      describe("spec.layout - undefined attributes -", function() {
        it("should throw if the cross layout has an undefined column attribute", function() {
          expect(function() {
            new Table({
              layout: {
                rows: ["D1", "D2"],
                cols: ["foo"],
                meas: ["N1"]
              },
              cols: ["D1", "D2"],
              rows: []
            }, {
              model: model
            });
          }).toThrowError(UNDEFINED_ATTRIBUTE_FOO_ERROR);
        });

        it("should throw if the cross layout has an undefined row attribute", function() {
          expect(function() {
            new Table({
              layout: {
                rows: ["D1", "foo"],
                cols: ["D3"],
                meas: ["N1"]
              },
              cols: ["D1", "D2"],
              rows: []
            }, {
              model: model
            });
          }).toThrowError(UNDEFINED_ATTRIBUTE_FOO_ERROR);
        });

        it("should throw if the /**/cross layout has an undefined measure attribute", function() {
          expect(function() {
            new Table({
              layout: {
                rows: ["D1", "D2"],
                cols: ["D3"],
                meas: ["foo"]
              },
              cols: ["D1", "D2"],
              rows: []
            }, {
              model: model
            });
          }).toThrowError(UNDEFINED_ATTRIBUTE_FOO_ERROR);
        });
      });

      describe("spec.layout - attributes consistency -", function() {
        it("should throw if a ROW column specifies a different attribute than that in the cross layout", function() {
          expect(function() {
            new Table({
              layout: {
                rows: ["D1", "D2"],
                cols: ["D3"],
                meas: ["N1"]
              },
              cols: ["D1", "D3"]
            }, {
              model: model
            });
          }).toThrowError(MISMATCHED_COL_ATTR_D3_ERROR);
        });

        it("should throw if a COL column specifies no attribute and there is more than one measure attribute", function() {
          expect(function() {
              new Table({
              layout: {
                rows: ["D1", "D2"],
                cols: ["D3"],
                meas: ["N1", "N2"]
              },
              cols: ["D1", "D2", {c: ["d3_1"]}, {c: ["d3_2"]}],
              rows: [
                {c: ["d1_1", "d2_1", 123, 234]},
                {c: ["d1_1", "d2_2", 1230, 2340]},
                {c: ["d1_2", "d2_1", 12300, 23400]}
              ]
            }, {
              model: model
            });
          }).toThrow(errorMatch.argInvalid("cols[2].attr"));
        });

        it("should throw if a COL column specifies an attribute that is not one of the measure attributes", function() {
          expect(function() {
            new Table({
              layout: {
                rows: ["D1", "D2"],
                cols: ["D3"],
                meas: ["N1"]
              },
              cols: ["D1", "D2", {c: ["d3_1"], attr: "N2"}, {c: ["d3_2"], attr: "N1"}],
              rows: [
                {c: ["d1_1", "d2_1", 123, 234]},
                {c: ["d1_1", "d2_2", 1230, 2340]},
                {c: ["d1_2", "d2_1", 12300, 23400]}
              ]
            }, {
              model: model
            });
          }).toThrowError(NOT_MEASURE_ATTR_N2_ERROR);
        });

        it("should default a COL column's attribute to the single measure attribute", function() {
          var dataTable = new Table({
            layout: {
              rows: ["D1", "D2"],
              cols: ["D3"],
              meas: ["N1"]
            },
            cols: ["D1", "D2", {c: ["d3_1"]}, {c: ["d3_2"]}],
            rows: [
              {c: ["d1_1", "d2_1", 123, 234]},
              {c: ["d1_1", "d2_2", 1230, 2340]},
              {c: ["d1_2", "d2_1", 12300, 23400]}
            ]
          }, {
            model: model
          });

          expect(dataTable.getColumnAttribute(2).name).toBe("N1");
        });
      });

      it("should load data when all of layout.rows, layout.columns and layout.meas have attributes", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: ["D3"],
            meas: ["N1"]
          },
          cols: ["D1", "D2", {c: ["d3_1"], attr: "N1"}, {c: ["d3_2"], attr: "N1"}],
          rows: [
            {c: ["d1_1", "d2_1", 123, 234]},
            {c: ["d1_1", "d2_2", 1230, 2340]},
            {c: ["d1_2", "d2_1", 12300, 23400]}
          ]
        }, {
          model: model
        });

        var axis = table.rows;
        expect(axis instanceof Axis).toBe(true);
        expect(axis.length).toBe(3);

        var position = axis[0];
        expect(position.ordinal).toBe(0);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_1");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));
        expect(position.cells[1].value).toBe("d2_1");

        position = axis[1];
        expect(position.ordinal).toBe(1);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_1");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));
        expect(position.cells[1].value).toBe("d2_2");

        position = axis[2];
        expect(position.ordinal).toBe(2);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_2");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));
        expect(position.cells[1].value).toBe("d2_1");

        axis = table.cols;
        expect(axis instanceof Axis).toBe(true);
        expect(axis.length).toBe(2);

        position = axis[0];
        expect(position.ordinal).toBe(0);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(1);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D3"));
        expect(position.cells[0].value).toBe("d3_1");

        position = axis[1];
        expect(position.ordinal).toBe(1);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(1);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D3"));
        expect(position.cells[0].value).toBe("d3_2");

        expect(table.meas.get(0, 0, 0).value).toBe(123);
        expect(table.meas.get(0, 1, 0).value).toBe(234);

        expect(table.meas.get(1, 0, 0).value).toBe(1230);
        expect(table.meas.get(1, 1, 0).value).toBe(2340);

        expect(table.meas.get(2, 0, 0).value).toBe(12300);
        expect(table.meas.get(2, 1, 0).value).toBe(23400);
      });

      it("should load data with layout.rows and layout.meas, but no layout.columns", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: [],
            meas: ["N1", "N2"]
          },
          cols: ["D1", "D2", "N1", "N2"],
          rows: [
            {c: ["d1_1", "d2_1", 123, 234]}
          ]
        }, {
          model: model
        });

        var axis = table.rows;
        expect(axis instanceof Axis).toBe(true);
        expect(axis.length).toBe(1);

        var position = axis[0];
        expect(position.ordinal).toBe(0);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_1");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));
        expect(position.cells[1].value).toBe("d2_1");

        // degenerate column tuple
        axis = table.cols;
        expect(axis instanceof Axis).toBe(true);
        expect(axis.length).toBe(1);
        expect(axis[0].cells.length).toBe(0);

        position = axis[0];
        expect(position.ordinal).toBe(0);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(0);

        expect(table.meas.get(0, 0, 0).value).toBe(123);
        expect(table.meas.get(0, 0, 1).value).toBe(234);
      });

      it("should load data with layout.columns and layout.meas, but no layout.rows", function() {
        var table = new Table({
            layout: {
              rows: [],
              cols: ["D1", "D2"],
              meas: ["N1", "N2"]
            },
            cols: [
              {c: ["d1_1", "d2_1"], attr: "N1"},
              {c: ["d1_1", "d2_1"], attr: "N2"},
              {c: ["d1_1", "d2_2"], attr: "N1"}
            ],
            rows: [
              {c: [123, 234, 345]}
            ]
          }, {
            model: model
          });

        // Degenerate row tuple
        var axis = table.rows;
        expect(axis instanceof Axis).toBe(true);
        expect(axis.length).toBe(1);
        expect(axis[0].cells.length).toBe(0);

        axis = table.cols;
        expect(axis instanceof Axis).toBe(true);
        expect(axis.length).toBe(2);

        var position = axis[0];
        expect(position.ordinal).toBe(0);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_1");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));

        position = axis[1];
        expect(position.ordinal).toBe(1);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_1");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));
        expect(position.cells[1].value).toBe("d2_2");

        expect(table.meas.get(0, 0, 0).value).toBe(123);
        expect(table.meas.get(0, 0, 1).value).toBe(234);
        expect(table.meas.get(0, 1, 0).value).toBe(345);
      });

      it("should load data with layout.rows, but no layout.columns or layout.meas", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: [],
            meas: []
          },
          cols: ["D1", "D2"],
          rows: [
            {c: ["d1_1", "d2_1"]},
            {c: ["d1_1", "d2_2"]},
            {c: ["d1_2", "d2_3"]}
          ]
        }, {
          model: model
        });

        var axis = table.rows;
        expect(axis instanceof Axis).toBe(true);
        expect(axis.length).toBe(3);

        var position = axis[0];
        expect(position.ordinal).toBe(0);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_1");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));
        expect(position.cells[1].value).toBe("d2_1");

        position = axis[1];
        expect(position.ordinal).toBe(1);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_1");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));
        expect(position.cells[1].value).toBe("d2_2");

        position = axis[2];
        expect(position.ordinal).toBe(2);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_2");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));
        expect(position.cells[1].value).toBe("d2_3");

        // empty column axis
        axis = table.cols;
        expect(axis instanceof Axis).toBe(true);
        expect(axis.length).toBe(0);

        expect(table.meas.structure.length).toBe(0);
      });

      it("should load data with layout.cols, but no layout.rows or layout.meas", function() {
          var table = new Table({
            layout: {
              rows: [],
              cols: ["D1", "D2"],
              meas: []
            },
            cols: [
              {c: ["d1_1", "d2_1"]},
              {c: ["d1_1", "d2_2"]}
            ],
            rows: []
          }, {
            model: model
          });

          var axis = table.cols;
          expect(axis instanceof Axis).toBe(true);
          expect(axis.length).toBe(2);

          var position = axis[0];
          expect(position.ordinal).toBe(0);
          expect(position.cells instanceof CellTuple).toBe(true);
          expect(position.cells.length).toBe(2);
          expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
          expect(position.cells[0].value).toBe("d1_1");
          expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));
          expect(position.cells[1].value).toBe("d2_1");

          position = axis[1];
          expect(position.ordinal).toBe(1);
          expect(position.cells instanceof CellTuple).toBe(true);
          expect(position.cells.length).toBe(2);
          expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
          expect(position.cells[0].value).toBe("d1_1");
          expect(position.cells[1].attribute).toBe(model.attributes.get("D2"));
          expect(position.cells[1].value).toBe("d2_2");

          // empty row axis
          axis = table.rows;
          expect(axis instanceof Axis).toBe(true);
          expect(axis.length).toBe(0);

          expect(table.meas.structure.length).toBe(0);
        });

      it("should load data with layout.cols and layout.rows, but no layout.meas", function() {
        var table = new Table({
          layout: {
            rows: ["D1"],
            cols: ["D2", "D3"],
            meas: []
          },
          cols: [
            "D1",
            {c: ["d2_1", "d3_1"]},
            {c: ["d2_1", "d3_2"]}
          ],
          rows: [
            ["d1_1"],
            ["d1_3"],
            ["d1_2"]
          ]
        }, {
          model: model
        });

        var axis = table.cols;
        expect(axis instanceof Axis).toBe(true);
        expect(axis.length).toBe(2);

        var position = axis[0];
        expect(position.ordinal).toBe(0);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D2"));
        expect(position.cells[0].value).toBe("d2_1");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D3"));
        expect(position.cells[1].value).toBe("d3_1");

        position = axis[1];
        expect(position.ordinal).toBe(1);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(2);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D2"));
        expect(position.cells[0].value).toBe("d2_1");
        expect(position.cells[1].attribute).toBe(model.attributes.get("D3"));
        expect(position.cells[1].value).toBe("d3_2");

        axis = table.rows;
        expect(axis instanceof Axis).toBe(true);
        expect(axis.length).toBe(3);

        position = axis[0];
        expect(position.ordinal).toBe(0);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(1);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_1");

        position = axis[1];
        expect(position.ordinal).toBe(1);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(1);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_3");

        position = axis[2];
        expect(position.ordinal).toBe(2);
        expect(position.cells instanceof CellTuple).toBe(true);
        expect(position.cells.length).toBe(1);
        expect(position.cells[0].attribute).toBe(model.attributes.get("D1"));
        expect(position.cells[0].value).toBe("d1_2");

        expect(table.meas.structure.length).toBe(0);
      });

      describe("when `spec.cols` is not specified -", function() {

        it("should not throw if there are only row attributes", function() {
          new Table({
            layout: {
              rows: ["D1", "D2"],
              cols: [],
              meas: []
            },
            rows: [
              ["d1_1", "d2_1"],
              ["d1_1", "d2_2"],
              ["d1_2", "d2_1"]
            ]
          }, {model: model});
        });

        it("should throw if there are column attributes", function() {
          expect(function() {
            new Table({
              layout: {
                rows: ["D1", "D2"],
                cols: ["D3"],
                meas: []
              },
              rows: [
                ["d1_1", "d2_1"],
                ["d1_1", "d2_2"],
                ["d1_2", "d2_1"]
              ]
            }, {model: model});
          }).toThrow(errorMatch.argInvalid("spec.cols"));
        });

        it("should throw if there are measure attributes", function() {
          expect(function() {
            new Table({
              layout: {
                rows: ["D1", "D2"],
                cols: [],
                meas: ["N1"]
              },
              rows: [
                ["d1_1", "d2_1"],
                ["d1_1", "d2_2"],
                ["d1_2", "d2_1"]
              ]
            }, {model: model});
          }).toThrow(errorMatch.argInvalid("spec.cols"));
        });
      });

      describe("spec.rows -", function() {
        it("should throw when there are duplicate row tuples", function() {
          expect(function() {
            new Table({
              layout: {
                rows: ["D1"],
                cols: [],
                meas: ["N1"]
              },
              cols: ["D1", "N1"],
              rows: [
                {c: ["d1_1", {v: 123, f: "123.0"}]},
                {c: ["d1_1", {v: 234, f: "234.0"}]}
              ]
            }, {
              model: model
            });
          }).toThrow(errorMatch.argInvalid("rows[1].c"));
        });
      });
    });

    describe("MeasureCellSet#get(r,c) -", function() {
      describe("when there is only one measure attribute -", function() {
        it("should return the cell of the single measure attribute", function() {
          var table = new Table({
            layout: {
              rows: ["D1"],
              cols: [],
              meas: ["N1"]
            },
            cols: ["D1", "N1"],
            rows: [
              {c: ["d1_1", {v: 123, f: "123.0"}]},
              {c: ["d1_2", {v: 234, f: "234.0"}]}
            ]
          }, {
            model: model
          });

          expect(table.meas.get(0, 0)).toBe(table.meas.get(0, 0, 0));
          expect(table.meas.get(1, 0)).toBe(table.meas.get(1, 0, 0));
        });
      });

      describe("when there are two measure attributes -", function() {
        it("should return the cell of the first measure attribute", function() {
          var table = new Table({
            layout: {
              rows: ["D1"],
              cols: [],
              meas: ["N1", "N2"]
            },
            cols: ["D1", "N1", "N2"],
            rows: [
              {c: ["d1_1", {v: 123, f: "123.0"}, 456]},
              {c: ["d1_2", {v: 234, f: "234.0"}, 678]}
            ]
          }, {
            model: model
          });

          expect(table.meas.get(0, 0)).toBe(table.meas.get(0, 0, 0));
          expect(table.meas.get(1, 0)).toBe(table.meas.get(1, 0, 0));
        });
      });
    });

    describe("MeasureCellSet#getByName(r,c,name) -", function() {
      describe("when there is only one measure attribute -", function() {
        it("should return the cell of the specified measure attribute name", function() {
          var table = new Table({
            layout: {
              rows: ["D1"],
              cols: [],
              meas: ["N1"]
            },
            cols: ["D1", "N1"],
            rows: [
              {c: ["d1_1", {v: 123, f: "123.0"}]},
              {c: ["d1_2", {v: 234, f: "234.0"}]}
            ]
          }, {
            model: model
          });

          expect(table.meas.get(0, 0, 0)).toBe(table.meas.getByName(0, 0, "N1"));
          expect(table.meas.get(1, 0, 0)).toBe(table.meas.getByName(1, 0, "N1"));
        });

        it("should throw when the specified attribute name is not a measure attribute", function() {
          var table = new Table({
            layout: {
              rows: ["D1"],
              cols: [],
              meas: ["N1"]
            },
            cols: ["D1", "N1"],
            rows: [
              {c: ["d1_1", 123]}
            ]
          }, {
            model: model
          });

          expect(function() {
            table.meas.getByName(0, 0, "D1");
          }).toThrowError(NOT_MEASURE_ATTR_D1_ERROR);

          expect(function() {
            table.meas.getByName(0, 0, "Z1");
          }).toThrowError(NOT_MEASURE_ATTR_Z1_ERROR);
        });
      });

      describe("when there are two measure attributes -", function() {
        it("should return the cell of the specified attribute name", function() {
          var table = new Table({
            layout: {
              rows: ["D1"],
              cols: [],
              meas: ["N1", "N2"]
            },
            cols: ["D1", "N1", "N2"],
            rows: [
              {c: ["d1_1", {v: 123, f: "123.0"}, 456]},
              {c: ["d1_2", {v: 234, f: "234.0"}, 678]}
            ]
          }, {
            model: model
          });

          expect(table.meas.get(0, 0, 0)).toBe(table.meas.getByName(0, 0, "N1"));
          expect(table.meas.get(1, 0, 0)).toBe(table.meas.getByName(1, 0, "N1"));

          expect(table.meas.get(0, 0, 1)).toBe(table.meas.getByName(0, 0, "N2"));
          expect(table.meas.get(1, 0, 1)).toBe(table.meas.getByName(1, 0, "N2"));
        });
      });
    });

    describe("#addColumn(colSpec, keyArgs)", function() {
      var model;

      beforeEach(function() {
        model = createModel1();
      });

      it("should add when table has column attributes, but no column tuples", function() {
        var table = new Table({
            layout: {
              rows: ["D1", "D2"],
              cols: ["D3"],
              meas: ["N1"]
            },
            cols: ["D1", "D2"]
          }, {
            model: model
          });

        // Has 2 cross-row columns.
        expect(table.getNumberOfColumns()).toBe(2);

        // Cols axis has no tuples
        expect(table.cols.length).toBe(0);

        // ---------

        table.addColumn({c: ["d3_1"], attr: "N1"});

        // ---------

        // Has 2 cross-row columns + 1 cross-col column
        expect(table.getNumberOfColumns()).toBe(3);

        expect(table.cols.length).toBe(1);

        var axisPos = table.cols[0];
        expect(axisPos.cells.length).toBe(1);
        expect(axisPos.cells[0].value).toBe("d3_1");
      });

      it("should add when table has column tuples and spec has a new column tuple", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: ["D3"],
            meas: ["N1"]
          },
          cols: ["D1", "D2", {c: ["d3_1"], attr: "N1"}, {c: ["d3_2"], attr: "N1"}]
        }, {
          model: model
        });

        // Has 2 cross-row columns + 2 cross-col columns.
        expect(table.getNumberOfColumns()).toBe(4);

        // Cols axis has 2 tuples
        expect(table.cols.length).toBe(2);

        // ---------

        table.addColumn({c: ["d3_3"], attr: "N1"});

        // ---------

        // Has 2 cross-row columns + 3 cross-col columns
        expect(table.getNumberOfColumns()).toBe(5);

        // Cols axis has 3 tuples
        expect(table.cols.length).toBe(3);

        var axisPos = table.cols[2];
        expect(axisPos.cells.length).toBe(1);
        expect(axisPos.cells[0].value).toBe("d3_3");
      });

      it("should add when spec has an existing column tuple and a MIC-unbound measure", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: ["D3"],
            meas: ["N1", "N2"]
          },
          cols: ["D1", "D2", {c: ["d3_1"], attr: "N1"}, {c: ["d3_2"], attr: "N1"}]
        }, {
          model: model
        });

        // Has 2 cross-row columns + 2 cross-col columns.
        expect(table.getNumberOfColumns()).toBe(4);

        // Cols axis has 2 tuples
        expect(table.cols.length).toBe(2);

        // ---------

        table.addColumn({c: ["d3_1"], attr: "N2"});

        // ---------

        // Has 2 cross-row columns + 3 cross-col columns
        expect(table.getNumberOfColumns()).toBe(5);

        // Cols axis (still) has 2 tuples
        expect(table.cols.length).toBe(2);

        var d3_1AxisPos = table.cols.get(["d3_1"]);
        expect(!!d3_1AxisPos).toBe(true);

        expect(table._micCols.length).toBe(3);
        expect(table._micCols[2].ordinal).toBe(d3_1AxisPos.ordinal);
        expect(table._micCols[2].attribute.name).toBe("N2");
      });

      it("should throw when spec has an existing column tuple and measure already bound in a MIC column", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: ["D3"],
            meas: ["N1", "N2"]
          },
          cols: ["D1", "D2", {c: ["d3_1"], attr: "N1"}, {c: ["d3_2"], attr: "N1"}]
        }, {
          model: model
        });

        // Has 2 cross-row columns + 2 cross-col columns.
        expect(table.getNumberOfColumns()).toBe(4);

        // Cols axis has 2 tuples
        expect(table.cols.length).toBe(2);

        // ---------

        expect(function() {
          table.addColumn({c: ["d3_1"], attr: "N1"});
        }).toThrow(errorMatch.argInvalid("cols[4]"));
      });

      it("should add when table has no column attributes and spec has a MIC-unbound measure", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: [],
            meas: ["N1", "N2"]
          },
          cols: ["D1", "D2", {attr: "N1"}]
        }, {
          model: model
        });

        // Has 2 cross-row columns + 1 cross-col columns.
        expect(table.getNumberOfColumns()).toBe(3);

        // Cols axis has 1 tuple (the empty tuple)
        expect(table.cols.length).toBe(1);

        // ---------

        table.addColumn({attr: "N2"});

        // ---------

        // Has 2 cross-row columns + 2 cross-col columns
        expect(table.getNumberOfColumns()).toBe(4);

        // Cols axis (still) has 1 tuple (the empty tuple)
        expect(table.cols.length).toBe(1);

        var axisPos = table.cols[0];
        expect(axisPos.cells.length).toBe(0);

        expect(table._micCols.length).toBe(2);
        expect(table._micCols[1].ordinal).toBe(0);
        expect(table._micCols[1].attribute.name).toBe("N2");

        expect(table._micCols[0].ordinal).toBe(0);
        expect(table._micCols[0].attribute.name).toBe("N1");
      });

      it("should throw when table has no column attributes and spec has measure already bound in a MIC column", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: [],
            meas: ["N1", "N2"]
          },
          cols: ["D1", "D2", {attr: "N1"}, {attr: "N2"}]
        }, {
          model: model
        });

        // Has 2 cross-row columns + 2 cross-col columns.
        expect(table.getNumberOfColumns()).toBe(4);

        // Cols axis has 1 tuple (the empty tuple)
        expect(table.cols.length).toBe(1);

        // ---------

        expect(function() {
          table.addColumn({attr: "N1"});
        }).toThrow(errorMatch.argInvalid("cols[4]"));
      });

      describe("when measure attribute is unspecified ", function() {
        describe("and there is a single measure attribute - ", function() {
          it("should add a column whose attribute is the single measure attribute", function() {
            var table = new Table({
              layout: {
                rows: ["D1", "D2"],
                cols: ["D3"],
                meas: ["N1"]
              },
              cols: ["D1", "D2", {c: ["d3_1"], attr: "N1"}]
            }, {
              model: model
            });

            expect(table.getNumberOfColumns()).toBe(3);
            expect(table.cols.length).toBe(1);

            // ---------

            table.addColumn({c: ["d3_2"]});

            // ---------

            expect(table.getNumberOfColumns()).toBe(4);

            expect(table.cols.length).toBe(2);

            expect(table._micCols.length).toBe(2);
            expect(table._micCols[1].attribute.name).toBe("N1");
          });
        });

        describe("and there is more than one measure attribute - ", function() {
          it("should throw when adding a column", function() {
            var table = new Table({
              layout: {
                rows: ["D1", "D2"],
                cols: ["D3"],
                meas: ["N1", "N2"]
              },
              cols: ["D1", "D2", {c: ["d3_1"], attr: "N1"}]
            }, {
              model: model
            });

            expect(table.getNumberOfColumns()).toBe(3);
            expect(table.cols.length).toBe(1);

            // ---------

            expect(function() {

              table.addColumn({c: ["d3_2"]});

            }).toThrow(errorMatch.argInvalid("cols[3].attr"));
          });
        });
      });

      it("should throw when spec has an attribute which is defined but is not a measure attribute", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: ["D3"],
            meas: ["N1"]
          },
          cols: ["D1", "D2", {c: ["d3_1"], attr: "N1"}]
        }, {
          model: model
        });

        expect(table.getNumberOfColumns()).toBe(3);
        expect(table.cols.length).toBe(1);

        // ---------

        expect(function() {

          table.addColumn({c: ["d3_1"], attr: "N2"});

        }).toThrowError(NOT_MEASURE_ATTR_N2_ERROR);
      });

      it("should throw when spec has an attribute which is undefined", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: ["D3"],
            meas: ["N1"]
          },
          cols: ["D1", "D2", {c: ["d3_1"], attr: "N1"}]
        }, {
          model: model
        });

        expect(table.getNumberOfColumns()).toBe(3);
        expect(table.cols.length).toBe(1);

        // ---------

        expect(function() {

          table.addColumn({c: ["d3_1"], attr: "Z1"});

        }).toThrowError(NOT_MEASURE_ATTR_Z1_ERROR);
      });

      it("should add and return the MIC index of the new column", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: ["D3"],
            meas: ["N1"]
          },
          cols: ["D1", "D2", {c: ["d3_1"], attr: "N1"}]
        }, {
          model: model
        });

        // Has 2 cross-row columns + 1 cross-col columns.
        var index = table.getNumberOfColumns();
        expect(index).toBe(3);

        // Cols axis has 1 tuples
        expect(table.cols.length).toBe(1);

        // ---------

        expect(table.addColumn({c: ["d3_2"], attr: "N1"})).toBe(index);
      });

      it("should read a null value for every measure cell, in any row, for an added, new tuple/measure combination", function() {
        var table = new Table({
          layout: {
            rows: ["D1", "D2"],
            cols: ["D3"],
            meas: ["N1"]
          },
          cols: ["D1", "D2", {c: ["d3_1"], attr: "N1"}, {c: ["d3_2"], attr: "N1"}],
          rows: [
            {c: ["d1_1", "d2_1", 123, 234]},
            {c: ["d1_1", "d2_2", 1230, 2340]},
            {c: ["d1_2", "d2_1", 12300, 23400]}
          ]
        }, {
          model: model
        });

        // Has 2 cross-row columns + 2 cross-col columns.
        expect(table.getNumberOfColumns()).toBe(4);

        expect(table.getNumberOfRows()).toBe(3);

        // Cols axis has 2 tuples
        expect(table.cols.length).toBe(2);

        // ---------

        var j = table.addColumn({c: ["d3_3"], attr: "N1"});

        // ---------

        expect(table.getValue(0, j, 0)).toBe(null);
        expect(table.getValue(1, j, 0)).toBe(null);
        expect(table.getValue(2, j, 0)).toBe(null);
      });
    });
  });
});