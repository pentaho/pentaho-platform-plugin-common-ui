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
  "pentaho/type/filter/isIn",
  "pentaho/type/filter/isEqual",
  "pentaho/type/filter/and",
  "pentaho/type/filter/or",
  "pentaho/type/filter/not",
  "pentaho/data/Table",
  "pentaho/visual/base/types/selectionModes"
], function(Context, modelFactory, isInFilterFactory, isEqFilterFactory, andFilterFactory, orFilterFactory,
    notFilterFactory, Table, selectionModes) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false */

  describe("pentaho.visual.base.types.selectionModes -", function() {
    var sales12k;
    var inStock;
    var countryPt;
    var myFilter;
    var model;
    var IsEqFilter;
    var AndFilter;
    var OrFilter;
    var NotFilter;

    beforeEach(function() {
      var context = new Context();

      var Model = context.get(modelFactory);

      var IsInFilter = context.get(isInFilterFactory);
      IsEqFilter = context.get(isEqFilterFactory);
      AndFilter = context.get(andFilterFactory);
      OrFilter = context.get(orFilterFactory);
      NotFilter = context.get(notFilterFactory);

      sales12k  = new IsInFilter({property: "sales",   values: [{_: "number", v: 12000}]});
      countryPt = new IsEqFilter({property: "country", value: {_: "string", v: "Portugal"}});
      inStock   = new IsEqFilter({property: "inStock", value: {_: "string", v: "true"}});
      myFilter  = new AndFilter({operands: [sales12k, inStock]});

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

        expect(result instanceof AndFilter).toBe(true);
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

        expect(result instanceof OrFilter).toBe(true);
      });

      it("should add the input selection from the current selection when " +
          "the input selection is disjoint from the current selection", function() {

        spyOn(selectionModes, "ADD").and.callThrough();
        spyOn(selectionModes, "REMOVE").and.callThrough();

        // Portugal & France
        var inputFilter = inStock;

        // Germany
        var currentFilter = new IsEqFilter({property: "country", value: {_: "string", v: "Germany"}});

        var result = selectionModes.TOGGLE.call(model, currentFilter, inputFilter);

        expect(selectionModes.REMOVE.calls.count()).toBe(0);

        expect(selectionModes.ADD.calls.count()).toBe(1);
        expect(selectionModes.ADD.calls.first().object).toBe(model);

        var args = selectionModes.ADD.calls.first().args;
        expect(args[0]).toBe(currentFilter);
        expect(args[1]).toBe(inputFilter);

        expect(result instanceof OrFilter).toBe(true);
      });
    });

    describe("ADD -", function() {
      it("should add the input selection to the current selection", function() {
        var result = selectionModes.ADD.call(model, sales12k, inStock);

        expect(result instanceof OrFilter).toBe(true);
        expect(result.operands.at(0)).toBe(sales12k);
        expect(result.operands.at(1)).toBe(inStock);
      });
    });

    describe("REMOVE -", function() {
      it("should remove the input selection from the current selection", function() {
        var result = selectionModes.REMOVE.call(model, sales12k, inStock);

        expect(result instanceof AndFilter).toBe(true);
        expect(result.operands.at(0)).toBe(sales12k);
        expect(result.operands.at(1) instanceof NotFilter).toBe(true);
        expect(result.operands.at(1).operand).toBe(inStock);
      });
    });

  }); // #pentaho.visual.base.types.selectionModes
});
