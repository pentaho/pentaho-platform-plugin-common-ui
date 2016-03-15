/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/visual/base",
  "pentaho/data/filter",
  "pentaho/data/Table",
  "pentaho/visual/base/types/selectionModes"
], function(Context, modelFactory, filter, Table, selectionModes) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false */

  describe("pentaho.visual.base.types.selectionModes -", function() {
    var sales12k;
    var inStock;
    var countryPt;
    var myFilter;
    var model;

    beforeEach(function() {
      sales12k  = new filter.IsIn("sales", [12000]);
      countryPt = new filter.IsEqual("country", "Portugal");
      inStock   = new filter.IsEqual("inStock", "true");
      myFilter  = new filter.And([sales12k, inStock]);

      var context = new Context();
      var Model = context.get(modelFactory);
      var dataSpec = {
        model: [
          {name: "country", type: "string"},
          {name: "sales",   type: "number"},
          {name: "inStock", type: "string"}
        ],
        rows: [
          {c: [{v: "Portugal"}, {v: 12000}, {v: "true" }]},
          {c: [{v: "Ireland" }, {v:  6000}, {v: "false"}]},
          {c: [{v: "France"  }, {v: 50000}, {v: "true" }]},
          {c: [{v: "Germany" }, {v: 12000}, {v: "false"}]},
          {c: [{v: "Italy"   }, {v: 12000}, {v: "false"}]}
        ]
      };

      model = new Model({
        width: 1,
        height: 1,
        data: new Table(dataSpec)
      });
    });

    describe("REPLACE -", function() {
      it("should discard current selection and return input selection", function() {
        var result = selectionModes.REPLACE.call(model, sales12k, inStock);

        expect(result).toBe(inStock);
      });
    });

    describe("TOGGLE -", function() {
      it("should remove the input selection from the current selection when " +
         "the input selection is fully contained in the current selection", function() {

        spyOn(selectionModes, "ADD").and.callThrough();
        spyOn(selectionModes, "REMOVE").and.callThrough();

        // Only the Portugal row is sales12k and inStock
        var inputFilter = sales12k.and(inStock);

        var result = selectionModes.TOGGLE.call(model, sales12k, inputFilter);

        expect(selectionModes.ADD.calls.count()).toBe(0);

        expect(selectionModes.REMOVE.calls.count()).toBe(1);
        expect(selectionModes.REMOVE.calls.first().object).toBe(model);

        var args = selectionModes.REMOVE.calls.first().args;
        expect(args[0]).toBe(sales12k);
        expect(args[1]).toBe(inputFilter);

        expect(result.type).toBe("and");
      });

      it("should add the input selection from the current selection when " +
          "the input selection is partially contained in the current selection", function() {

        spyOn(selectionModes, "ADD").and.callThrough();
        spyOn(selectionModes, "REMOVE").and.callThrough();

        // Portugal & France
        var inputFilter = inStock;

        // Portugal & Germany & Italy
        var currentFilter = sales12k;

        var result = selectionModes.TOGGLE.call(model, currentFilter, inputFilter);

        expect(selectionModes.REMOVE.calls.count()).toBe(0);

        expect(selectionModes.ADD.calls.count()).toBe(1);
        expect(selectionModes.ADD.calls.first().object).toBe(model);

        var args = selectionModes.ADD.calls.first().args;
        expect(args[0]).toBe(currentFilter);
        expect(args[1]).toBe(inputFilter);

        expect(result.type).toBe("or");
      });

      it("should add the input selection from the current selection when " +
          "the input selection is disjoint from the current selection", function() {

        spyOn(selectionModes, "ADD").and.callThrough();
        spyOn(selectionModes, "REMOVE").and.callThrough();

        // Portugal & France
        var inputFilter = inStock;

        // Germany
        var currentFilter = new filter.IsEqual("country", "Germany");

        var result = selectionModes.TOGGLE.call(model, currentFilter, inputFilter);

        expect(selectionModes.REMOVE.calls.count()).toBe(0);

        expect(selectionModes.ADD.calls.count()).toBe(1);
        expect(selectionModes.ADD.calls.first().object).toBe(model);

        var args = selectionModes.ADD.calls.first().args;
        expect(args[0]).toBe(currentFilter);
        expect(args[1]).toBe(inputFilter);

        expect(result.type).toBe("or");
      });
    });

    describe("ADD -", function() {
      it("should add the input selection to the current selection", function() {
        var result = selectionModes.ADD.call(model, sales12k, inStock);

        expect(result.type).toBe("or");
        expect(result.operands[0]).toBe(sales12k);
        expect(result.operands[1]).toBe(inStock);
      });
    });

    describe("REMOVE -", function() {
      it("should remove the input selection from the current selection", function() {
        var result = selectionModes.REMOVE.call(model, sales12k, inStock);

        expect(result.type).toBe("and");
        expect(result.operands[0]).toBe(sales12k);
        expect(result.operands[1].type).toBe("not");
        expect(result.operands[1].operand).toBe(inStock);
      });
    });

  }); // #pentaho.visual.base.types.selectionModes
});
