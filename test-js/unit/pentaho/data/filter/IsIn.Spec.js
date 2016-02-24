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
  "pentaho/data/filter/IsIn",
  "pentaho/data/Element",
  "pentaho/data/Table"
], function(IsIn, Element, Table) {
  "use strict";

  describe("pentaho.data.Filter", function() {

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

    it("should be of type '$in' ", function() {
      var filter = new IsIn("sales", [10000, 12000]);
      expect(filter.type).toBe("$in");
    });

    describe("#toSpec()", function() {
      it("should return a JSON matching the state of the filter", function() {
        var sales12k = new IsIn("sales", [10000, 12000]);
        expect(sales12k.toSpec()).toEqual({
          "sales": {"$in": [10000, 12000]}
        });
      });
    });

    describe("#filter(pentaho.data.Table object)", function() {
      it("should return the matching entry", function() {
        var isProductAC = new IsIn("product", ["A"]);
        var filteredData = isProductAC.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(1);
        expect(filteredData.getValue(0, 0)).toBe("A");
      });

      it("should return all the entries matching the criterion", function() {
        var isProductAC = new IsIn("product", ["A", "C"]);
        var filteredData = isProductAC.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(2);
        expect(filteredData.getValue(0, 0)).toBe("A");
        expect(filteredData.getValue(1, 0)).toBe("C");
      });

      it("should return an empty dataset is no match is found.", function() {
        var isProductA = new IsIn("sales", [5000, 7000]);
        var filteredData = isProductA.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(0);
      });
    });

  });
});