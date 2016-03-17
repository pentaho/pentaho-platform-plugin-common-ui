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
  "pentaho/data/filter",
  "pentaho/data/_filter/_Element",
  "pentaho/data/Table",
  "./_dataSpecProductSalesInStock"
], function(filter, Element, Table, dataSpec) {
  "use strict";

  describe("pentaho.data.filter.Not", function() {

    var data, sales12k, myFilter;
    beforeEach(function() {
      data = new Table(dataSpec);

      sales12k = new filter.IsEqual("sales", 12000);
      myFilter = new filter.Not(sales12k);
    });

    describe("#type ", function() {
      it("should return 'Not' ", function() {
        expect(myFilter.type).toBe("not");
      });

      it("should be immutable", function() {
        expect(function() {
          myFilter.type = "fake";
        }).toThrowError(TypeError);
      });
    });

    describe("#operand ", function() {
      it("should be immutable", function() {
        expect(function() {
          myFilter.operand = {};
        }).toThrowError(TypeError);
      });
    });

    describe("#walk", function() {
      it("when `iteratee` returns a filter, that filter is returned", function() {
        var inStock = new filter.IsIn("inStock", [true]);
        var result = myFilter.walk(function(node) {
          return inStock;
        });
        expect(result).toBe(inStock);
      });

      it("when `iteratee` returns `null`, `null` is returned", function() {
        var result = myFilter.walk(function(node) {
          return null;
        });
        expect(result).toBeNull();
      });

      it("when `iteratee` returns an empty array, `null` is returned", function() {
        var result = myFilter.walk(function(node) {
          return [];
        });
        expect(result).toBeNull();
      });

    }); // #walk

    describe("#and ", function() {
      it("should return an AND.", function() {
        var combination = myFilter.and(sales12k);
        expect(combination.type).toBe("and");
      });
    }); // #and

    describe("#or ", function() {
      it("should return an Or.", function() {
        var inStock = new filter.IsEqual("inStock", true);
        var combination = myFilter.or(inStock);
        expect(combination.type).toBe("or");
      });
    }); // #or

    describe("#invert ", function() {
      it("should prevent double negation (i.e. replace 'NOT NOT A' with 'A').", function() {
        expect(myFilter.type).toBe("not");
        expect(myFilter.operand.type).toBe("isEqual");

        var notNotSales12k = myFilter.invert();
        expect(notNotSales12k.type).toBe("isEqual");
        expect(notNotSales12k).toBe(sales12k);
      });
    }); //#invert

    describe("#contains", function() {
      it("should return `true` if a given `element` belongs to the dataset.", function() {
        var element = new Element(data, 0);
        expect(myFilter.contains(element)).toBe(false);
      });

      it("should return `false` if a given `element` does not belong to the dataset.", function() {
        var element = new Element(data, 3);
        expect(myFilter.contains(element)).toBe(true);
      });

      it("should perform a NOT.", function(){
        [1,3,4,5,6].forEach(function(rowIdx){
          var elementIn = new Element(data, rowIdx);
          expect(myFilter.contains(elementIn)).toBe(true);
        });
        [0, 2].forEach(function(rowIdx){
          var elementOut = new Element(data, rowIdx);
          expect(myFilter.contains(elementOut)).toBe(false);
        });
      });
    }); // #contains


    describe("#apply", function() {

      it("should return the inverse of a simple filter.", function() {
        var filteredData = myFilter.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(5);
        [
          "B", "D", "E", "F", "G"
        ].forEach(function(product, idx) {
          expect(filteredData.getValue(idx, 0)).toBe(product);
        });

      });

      it("should return the inverse of a complex filter.", function() {
        var isABC = new filter.Or([
          new filter.IsEqual("product", "A"),
          new filter.IsEqual("product", "B"),
          new filter.IsEqual("product", "C")
        ]);

        var combination = new filter.Not(isABC);
        var filteredData = combination.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(4);
        [
          "D", "E", "F", "G"
        ].forEach(function(product, idx) {
          expect(filteredData.getValue(idx, 0)).toBe(product);
        });
      });

    }); // #apply

    describe("#toSpec", function() {
      it("should return a JSON.", function() {
        var myFilter = new filter.Not(sales12k);

        expect(myFilter.toSpec()).toEqual({
          "$not": {"sales": {"$eq": 12000}}
        });
      });
    }); //#toSpec

  });
});