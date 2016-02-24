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
  "pentaho/data/filter/Not",
  "pentaho/data/filter/Or",
  "pentaho/data/filter/IsEqual",
  "pentaho/data/Element",
  "pentaho/data/Table"
], function(Not, Or, IsEqual, Element, Table) {
  "use strict";

  describe("pentaho.data.filter.Not", function() {

    var data, sales12k;
    beforeEach(function() {
      data = new Table({
        model: [
          {name: "product", type: "string", label: "Product"},
          {name: "sales", type: "number", label: "Sales"},
          {name: "inStock", type: "boolean", label: "In Stock"}
        ],
        rows: [
          {c: [{v: "A"}, {v: 12000}, {v: true}]},
          {c: [{v: "B"}, {v: 6000}, {v: true}]},
          {c: [{v: "C"}, {v: 12000}, {v: false}]},
          {c: [{v: "D"}, {v: 1000}, {v: false}]},
          {c: [{v: "E"}, {v: 2000}, {v: false}]},
          {c: [{v: "F"}, {v: 3000}, {v: false}]},
          {c: [{v: "G"}, {v: 4000}, {v: false}]}
        ]
      });

      sales12k = new IsEqual("sales", 12000);
    });

    it("should be of type '$not' ", function() {
      var filter = new Not();
      expect(filter.type).toBe("$not");
    });


    describe("#toSpec", function() {
      it("should return a JSON.", function() {
        var filter = new Not(sales12k);

        expect(filter.toSpec()).toEqual({
          "$not": {"sales": {"$eq": 12000}}
        });
      });

      it("should return `null` if it has no operands.", function() {
        var combination = new Not();
        expect(combination.toSpec()).toBeNull();
      });
    });


    describe("#apply", function(){

      it("should return the inverse of a simple filter.", function() {
        var combination = new Not(sales12k);
        var filteredData = combination.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(5);
        [
          "B", "D", "E", "F", "G"
        ].forEach(function(product, idx) {
          expect(filteredData.getValue(idx, 0)).toBe(product);
        });

      });

      it("should return the inverse of a complex filter.", function() {
        var filter = new Or();
        filter
          .insert(new IsEqual("product", "A"))
          .insert(new IsEqual("product", "B"))
          .insert(new IsEqual("product", "C"));

        var combination = new Not(filter);
        var filteredData = combination.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(4);
        [
          "D", "E", "F", "G"
        ].forEach(function(product, idx) {
          expect(filteredData.getValue(idx, 0)).toBe(product);
        });

      });

    }); // #apply

  });
});