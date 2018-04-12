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
  "pentaho/type/Context",
  "pentaho/data/Table"
], function(Context, DataTable) {

  "use strict";

  /* globals describe, it, beforeEach, beforeAll, spyOn */

  describe("pentaho.visual.role.adaptation.TupleStrategy", function() {

    var Strategy;
    var List;
    var Complex;
    var dataTable;

    var datasetFieldIndexes = {
      country: 0,
      sales: 1,
      category: 2
    };

    function getDataSpec1() {
      return {
        model: [
          {name: "country", type: "string", label: "Country"},
          {name: "sales", type: "number", label: "Sales"},
          {name: "category", type: "string", label: "Code"}
        ],
        rows: [
          {c: [{v: "PT", f: "Portugal"}, {v: 12000}, {v: "A", f: "AA1"}]},
          {c: [{v: "UK", f: "United Kingdom"}, {v: 6000}, {v: "B", f: "BB1"}]},
          {c: [{v: "ES", f: "Spain"}, {v: 60000}, {v: "A", f: "AA2"}]},
          {c: [{v: "FR", f: "France"}, {v: 20000}, null]},
          {c: [{v: "IT", f: "Italy"}, {v: 30000}, {v: null}]}
        ]
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

    beforeAll(function() {

      dataTable = new DataTable(getDataSpec1());

      return Context.createAsync()
          .then(function(context) {

            List = context.get("list");
            Complex = context.get("complex");

            return context.getDependencyApplyAsync([
              "pentaho/visual/role/adaptation/tupleStrategy"
            ], function(_Strategy) {

              Strategy = _Strategy;
            });
          });
    });

    describe(".Type", function() {

      describe("#getInputTypeFor(outputDataType, isVisualKey)", function() {

        it("should return null if not given a list type", function() {

          var Foo = Complex.extend();

          var inputType = Strategy.type.getInputTypeFor(Foo.type, true);
          expect(inputType).toBe(null);

          inputType = Strategy.type.getInputTypeFor(Foo.type, false);
          expect(inputType).toBe(null);
        });

        it("should return the same, given type, if it is a list type", function() {

          var inputType = Strategy.type.getInputTypeFor(List.type, true);
          expect(inputType).toBe(List.type);

          inputType = Strategy.type.getInputTypeFor(List.type, false);
          expect(inputType).toBe(List.type);
        });
      });

      describe("#validateApplication(schemaData, inputFieldIndexes)", function() {

        it("should return an object with isValid: true", function() {
          var result = Strategy.type.validateApplication(dataTable, [0]);
          expect(result).toEqual(jasmine.objectContaining({isValid: true}));
        });

        it("should return an object with addsFields: false", function() {
          var result = Strategy.type.validateApplication(dataTable, [0]);
          expect(result).toEqual(jasmine.objectContaining({addsFields: false}));
        });
      });

      describe("#apply(data, inputFieldIndexes)", function() {

        it("should return a strategy instance", function() {

          var strategy = Strategy.type.apply(dataTable, [0]);
          expect(strategy instanceof Strategy).toBe(true);
        });

        it("should return a strategy having the given data", function() {

          var strategy = Strategy.type.apply(dataTable, [0]);
          expect(strategy.data).toBe(dataTable);
        });

        it("should return a strategy having the given inputFieldIndexes", function() {
          var inputFieldIndexes = [0];
          var strategy = Strategy.type.apply(dataTable, inputFieldIndexes);
          expect(strategy.inputFieldIndexes).toEqual(inputFieldIndexes);
        });

        it("should return a strategy with the given inputFieldIndexes as outputFieldIndexes", function() {
          var inputFieldIndexes = [0];
          var strategy = Strategy.type.apply(dataTable, inputFieldIndexes);
          expect(strategy.outputFieldIndexes).toEqual(inputFieldIndexes);
        });
      });
    });

    describe("#isInvertible", function() {

      it("should return true", function() {

        var strategy = Strategy.type.apply(dataTable, [0]);

        expect(strategy.isInvertible).toBe(true);
      });
    });

    describe("#map(inputValues) one column", function() {

      var strategy;

      beforeEach(function() {
        strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes.category]);
      });

      it("should return a cell corresponding to a given existing value", function() {

        var outputCells = strategy.map(["A"]);

        expect(outputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"})
        ]);
      });

      it("should return a cell corresponding to a given (equal) existing cell", function() {

        var outputCells = strategy.map([new Cell("A", "AA1")]);

        expect(outputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"})
        ]);
      });

      it("should return null if given a non-existing value", function() {

        var outputCells = strategy.map(["C"]);

        expect(outputCells).toBe(null);
      });

      it("should return [{value: null}] if given an existing null", function() {

        var outputCells = strategy.map([null]);

        expect(outputCells).toEqual([jasmine.objectContaining({value: null})]);
      });

      it("should create the index only once", function() {

        spyOn(strategy, "__installIndex").and.callThrough();

        strategy.map(["A"]);

        expect(strategy.__installIndex).toHaveBeenCalledTimes(1);

        strategy.map(["A"]);

        expect(strategy.__installIndex).toHaveBeenCalledTimes(1);

        strategy.invert(["A"]);

        expect(strategy.__installIndex).toHaveBeenCalledTimes(1);
      });
    });

    describe("#map(inputValues) more than one column - total", function() {

      var strategy;

      beforeEach(function() {
        strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes.category, datasetFieldIndexes.country]);
      });

      it("should return two cells corresponding to given existing values", function() {

        var outputCells = strategy.map(["A", "PT"]);

        expect(outputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"}),
          jasmine.objectContaining({value: "PT", formatted: "Portugal"})
        ]);
      });

      it("should return two cells corresponding to given (equal) existing cells", function() {

        var outputCells = strategy.map([new Cell("A", "AA1"), new Cell("PT", "Portugal")]);

        expect(outputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"}),
          jasmine.objectContaining({value: "PT", formatted: "Portugal"})
        ]);
      });

      it("should return two cells when given existing null(s)", function() {

        var outputCells = strategy.map([null, "FR"]);

        expect(outputCells).toEqual([
          jasmine.objectContaining({value: null}),
          jasmine.objectContaining({value: "FR"})
        ]);
      });
    });

    describe("#map(inputValues) more than one column - partial", function() {

      var strategy;

      beforeEach(function() {
        strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes.category, datasetFieldIndexes.country]);
      });

      it("should return cell corresponding to given existing value", function() {

        var outputCells = strategy.map(["A"]);

        expect(outputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"})
        ]);
      });

      it("should return cell corresponding to given existing value (with undefined positions)", function() {

        var outputCells = strategy.map(["A", undefined]);

        expect(outputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"})
        ]);
      });

      it("should return cell corresponding to given (equal) existing cell", function() {

        var outputCells = strategy.map([new Cell("A", "AA1")]);

        expect(outputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"})
        ]);
      });

      it("should return [{value: null}] when given an existing null", function() {

        var outputCells = strategy.map([null]);

        expect(outputCells).toEqual([jasmine.objectContaining({value: null})]);
      });

      it("should return [{value: null}] when given an existing null (with undefined position)", function() {

        var outputCells = strategy.map([null, undefined]);

        expect(outputCells).toEqual([jasmine.objectContaining({value: null})]);
      });
    });

    describe("#invert(outputValues) one cell", function() {

      var strategy;

      beforeEach(function() {
        strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes.category]);
      });

      it("should return a cell corresponding to a given existing value", function() {

        var inputCells = strategy.invert(["A"]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"})
        ]);
      });

      it("should return a cell corresponding to a given (equal) existing cell", function() {

        var inputCells = strategy.invert([new Cell("A", "AA1")]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"})
        ]);
      });

      it("should return null if given a non-existing value", function() {

        var inputCells = strategy.invert(["C"]);

        expect(inputCells).toBe(null);
      });

      it("should return [{value: null}] if given an existing null", function() {

        var inputCells = strategy.invert([null]);

        expect(inputCells).toEqual([jasmine.objectContaining({value: null})]);
      });
    });

    describe("#invert(outputValues) more than one cell - total", function() {

      var strategy;

      beforeEach(function() {
        strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes.category, datasetFieldIndexes.country]);
      });

      it("should return two cells corresponding to given existing values", function() {
        var inputCells = strategy.invert(["A", "PT"]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"}),
          jasmine.objectContaining({value: "PT", formatted: "Portugal"})
        ]);
      });
    });

    describe("#invert(outputValues) more than one cell - partial", function() {

      var strategy;

      beforeEach(function() {
        strategy = Strategy.type.apply(dataTable, [datasetFieldIndexes.category, datasetFieldIndexes.country]);
      });

      it("should return two cells corresponding to given existing values", function() {
        var inputCells = strategy.invert(["A"]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"})
        ]);
      });

      it("should return two cells corresponding to given existing values (with undefined position)", function() {
        var inputCells = strategy.invert(["A", undefined]);

        expect(inputCells).toEqual([
          jasmine.objectContaining({value: "A", formatted: "AA1"})
        ]);
      });
    });
  });
});
