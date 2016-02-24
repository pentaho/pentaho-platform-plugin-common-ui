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
  "pentaho/data/filter/IsEqual",
  "pentaho/data/filter/Or",
  "pentaho/data/Element",
  "pentaho/data/Table"
], function(IsEqual, Or, Element, Table) {
  "use strict";

  describe("pentaho.data.filter.IsEqual", function() {

    var data;
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
    });

    describe("#type", function() {
      it("should return '$eq'.", function() {
        var filter = new IsEqual("sales", 12000);
        expect(filter.type).toBe("$eq");
      });
    });

    describe("#toSpec()", function() {
      it("should return a JSON matching the state of the filter.", function() {
        var sales12k = new IsEqual("sales", 12000);
        expect(sales12k.toSpec()).toEqual({
          "sales": {"$eq": 12000}
        });
      });
    });

    describe("#filter(pentaho.data.Table object)", function() {

      it("should return the matching entry.", function() {
        var isProductA = new IsEqual("product", "A");
        var filteredData = isProductA.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(1);
        expect(filteredData.getValue(0, 0)).toBe("A");
      });

      it("should return all the entries matching the criterion.", function() {
        var sales12k = new IsEqual("sales", 12000);
        var filteredData = sales12k.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(2);
        expect(filteredData.getValue(0, 0)).toBe("A");
        expect(filteredData.getValue(1, 0)).toBe("C");
      });

      it("should return an empty dataset is no match is found.", function() {
        var isProductA = new IsEqual("sales", 5000);
        var filteredData = isProductA.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(0);
      });

    });


    describe("#and ", function() {

      var sales12k, inStock;

      beforeEach(function() {
        sales12k = new IsEqual("sales", 12000);
        inStock = new IsEqual("inStock", true);
      });

      it("should return an AND.", function() {
        var combination = sales12k.and(inStock);
        expect(combination.type).toBe("$and");
      });


    });

    describe("#or ", function() {

      it("should return an Or.", function() {
        var sales12k = new IsEqual("sales", 12000);
        var inStock = new IsEqual("inStock", true);

        var combination = sales12k.or(inStock);
        expect(combination.type).toBe("$or");
      });

    });

    describe("#invert ", function() {

      it("should return a Not.", function() {
        var sales12k = new IsEqual("sales", 12000);
        var combination = sales12k.invert();
        expect(combination.type).toBe("$not");
      });


    });

    describe("#contains ", function() {

      it("should confirm if a filter with the data", function() {
        var sales12k = new IsEqual("sales", 12000);

        var containsSales12k = sales12k.contains(new Element(data, 0));

        expect(containsSales12k).toBe(true);
      });

    });

  });
});