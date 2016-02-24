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
  "pentaho/data/filter/And",
  "pentaho/data/filter/IsEqual",
  "pentaho/data/filter/IsIn",
  "pentaho/data/Element",
  "pentaho/data/Table"
], function(And, IsEqual, IsIn, Element, Table) {
  "use strict";

  describe("pentaho.data.filter.And", function() {

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


    it("should be of type '$and' ", function() {
      var filter = new And();
      expect(filter.type).toBe("$and");
    });

    it("should be commutative", function() {
      var sales12k = new IsIn("sales", [12000]);
      var inStock = new IsEqual("inStock", true);
      var combination1 = new And([sales12k, inStock]);
      var data1 = combination1.apply(data);

      var combination2 = new And([inStock, sales12k]);
      var data2 = combination2.apply(data);

      expect(data1.getNumberOfRows()).toBe(1);
      expect(data1.getNumberOfRows()).toBe(data2.getNumberOfRows());
      expect(data1.getValue(0, 0)).toBe(data2.getValue(0, 0));
    });

    it("should perform an AND.", function() {
      var sales12k = new IsIn("sales", [12000]);
      var inStock = new IsEqual("inStock", true);

      var combination = new And([sales12k, inStock]);
      var filteredData = combination.apply(data);

      expect(filteredData.getNumberOfRows()).toBe(1);
      expect(filteredData.getValue(0, 0)).toBe("A");
    });

    describe("#toSpec", function() {
      it("should return a JSON.", function() {
        var sales12k = new IsIn("sales", [12000]);
        var inStock = new IsEqual("inStock", true);

        var combination = new And([sales12k, inStock]);
        expect(combination.toSpec()).toEqual({
          "$and": [
            {"sales": {"$in": [12000]}},
            {"inStock": {"$eq": true}}
          ]
        });
      });

      it("should return `null` if it has no operands.", function() {
        var combination = new And();
        expect(combination.toSpec()).toBeNull();
      });
    }); // #toSpec


    describe("#contains", function() {

      var sales12k, inStock;
      beforeEach(function() {
        sales12k = new IsIn("sales", [12000]);
        inStock = new IsEqual("inStock", true);
      });

      it("should return `true` if a given `element` belongs to the dataset.", function() {
        var filter = new And([sales12k, inStock]);
        var element = new Element(data, 0);
        expect(filter.contains(element)).toBe(true);
      });

      it("should return `false` if a given `element` does not belong to the dataset.", function() {
        var filter = new And([sales12k, inStock]);
        var element = new Element(data, 3);
        expect(filter.contains(element)).toBe(false);
      });

      it("should return `true` if the filter has no operands.", function() {
        var filter = new And();
        var element = new Element(data, 0);
        expect(filter.contains(element)).toBe(true);
      });

    }); // #contains


    describe("#and", function() {
      it("should add elements instead of creating ANDs of ANDs", function() {
        var sales12k = new IsIn("sales", [12000]);
        var inStock = new IsEqual("inStock", true);
        var combined1 = new And([sales12k, inStock]);
        var productA = new IsEqual("product", "A");

        var result = combined1.and(productA);

        expect(result).toBe(combined1);
        expect(result.children.length).toBe(3);
      });
    });

  });
});