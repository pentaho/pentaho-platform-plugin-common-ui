/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/visual/role/adaptation/Strategy",
  "pentaho/data/Table",
  "tests/pentaho/util/errorMatch"
], function(BaseStrategy, DataTable, errorMatch) {

  "use strict";

  describe("pentaho.visual.role.adaptation.Strategy", function() {

    var dataTable;

    var Strategy = BaseStrategy.extend({

      constructor: function(instSpec) {

        this.base(instSpec);

        this._setOutputFieldIndexes(instSpec.outputFieldIndexes);
      }
    });

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

    beforeAll(function() {
      dataTable = new DataTable(getDataSpec1());
    });

    describe("new (instSpec)", function() {

      it("should throw if instSpec.data is not specified", function() {
        expect(function() {
          // eslint-disable-next-line no-new
          new Strategy({
            inputFieldIndexes: [1],
            outputFieldIndexes: [2]
          });
        }).toThrow(errorMatch.argRequired("instSpec.data"));
      });

      it("should throw if instSpec.inputFieldIndexes is not specified", function() {
        expect(function() {
          // eslint-disable-next-line no-new
          new Strategy({
            data: dataTable,
            outputFieldIndexes: [2]
          });
        }).toThrow(errorMatch.argRequired("instSpec.inputFieldIndexes"));
      });

      it("should throw if instSpec.outputFieldIndexes is not specified", function() {
        expect(function() {
          // eslint-disable-next-line no-new
          new Strategy({
            data: dataTable,
            inputFieldIndexes: [1]
          });
        }).toThrow(errorMatch.argRequired("instSpec.outputFieldIndexes"));
      });
    });

    describe("#isInvertible", function() {

      it("should return false", function() {

        var strategy = new Strategy({
          data: dataTable,
          inputFieldIndexes: [1],
          outputFieldIndexes: [2]
        });

        expect(strategy.isInvertible).toBe(false);
      });
    });

    describe("#outputFieldNames", function() {

      it("should return an array of the corresponding field names", function() {

        var strategy = new Strategy({
          data: dataTable,
          inputFieldIndexes: [1],
          outputFieldIndexes: [2, 1]
        });

        expect(strategy.outputFieldNames).toEqual(["category", "sales"]);
      });
    });

    describe("#invert(outputValues)", function() {

      it("should throw not implemented", function() {

        var strategy = new Strategy({
          data: dataTable,
          inputFieldIndexes: [1],
          outputFieldIndexes: [2]
        });

        expect(function() {
          strategy.invert();
        }).toThrow(errorMatch.operInvalid());
      });
    });
  });
});
