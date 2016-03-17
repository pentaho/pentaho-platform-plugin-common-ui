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

  describe("pentaho.data.filter.Or", function() {

    var data, sales12k, inStock, myFilter;
    beforeEach(function() {
      data = new Table(dataSpec);
      sales12k = new filter.IsIn("sales", [12000]);
      inStock = new filter.IsEqual("inStock", true);
      myFilter = new filter.Or([sales12k, inStock])
    });


    it("should be of type 'Or'.", function() {
      expect(myFilter.type).toBe("or");
    });


    describe("#operands", function() {
      it("should be readonly.", function() {
        expect(function() {
          myFilter.operands = [new filter.IsEqual("product", "A")];
        }).toThrowError(TypeError);
      });

      it("should be immutable.", function() {
        var operands = myFilter.operands;
        myFilter.operands.push(new filter.IsEqual("product", "A"));
        expect(myFilter.operands).toEqual(operands);
      });
    }); // #operands


    describe("#walk", function(){
      it("when `iteratee` returns a filter, that filter is returned", function(){
        var result = myFilter.walk(function(node, children){
          return inStock;
        });
        expect(result).toBe(inStock);
      });

      it("when `iteratee` returns `null`, `null` is returned", function(){
        var result = myFilter.walk(function(node, children){
          return null;
        });
        expect(result).toBeNull();
      });

      it("when `iteratee` returns an array with more than one element, a new Or filter is returned", function(){
        var result = myFilter.walk(function(node, children){
          return [inStock, sales12k];
        });
        expect(result).not.toBe(myFilter);
        expect(result.operands.length).toBe(2);
        expect(result.type).toBe("or");
      });

      it("when `iteratee` returns an array with a single element, that element is returned", function(){
        var result = myFilter.walk(function(node, children){
          return [inStock];
        });
        expect(result).not.toBe(myFilter);
        expect(result).toBe(inStock);
      });

      it("when `iteratee` returns an empty array, `null` is returned", function(){
        var result = myFilter.walk(function(node, children){
          return [];
        });
        expect(result).toBeNull();
      });

    }); // #walk

    describe("#or", function() {
      it("should add elements instead of creating ORs of ORs", function() {
        var productA = new filter.IsEqual("product", "A");

        var result = myFilter.or(productA);
        expect(result.operands.length).toBe(3);
      });

      it("should return a new instance when adding more operands", function() {
        var productA = new filter.IsEqual("product", "A");

        var result = myFilter.or(productA);
        expect(result).not.toBe(myFilter);
      });

      it("should return the same instance if not adding operands", function() {
        var result = myFilter.or();
        expect(result).toBe(myFilter);
      });

    });

    describe("#and ", function() {
      it("should return an And.", function() {
        var result = myFilter.and(inStock);
        expect(result.type).toBe("and");
      });
    }); // #or

    describe("#invert", function() {

      it("should return a simplified filter, with the negated terms next to the leafs", function() {
        var result = myFilter.invert();

        expect(result.type).toBe("and");
        expect(result.operands.length).toBe(2);
        expect(result.operands[0].type).toBe("not");
        expect(result.operands[0].operand.type).toBe("isIn");
        expect(result.operands[1].type).toBe("not");
        expect(result.operands[1].operand.type).toBe("isEqual");
      });
    });

    describe("#contains", function() {

      it("should return `true` if a given `element` belongs to the dataset.", function() {
        var element = new Element(data, 0);
        expect(myFilter.contains(element)).toBe(true);
      });

      it("should return `false` if a given `element` does not belong to the dataset.", function() {
        var element = new Element(data, 3);
        expect(myFilter.contains(element)).toBe(false);
      });

      it("should return `false` if the filter has no operands.", function() {
        var myFilter = new filter.Or();
        var element = new Element(data, 0);
        expect(myFilter.contains(element)).toBe(false);
      });

      it("should perform an OR.", function() {
        [0, 1, 2].forEach(function(rowIdx) {
          var elementIn = new Element(data, rowIdx);
          expect(myFilter.contains(elementIn)).toBe(true);
        });

        [3, 4, 5, 6].forEach(function(rowIdx) {
          var elementOut = new Element(data, rowIdx);
          expect(myFilter.contains(elementOut)).toBe(false);
        });
      });

      it("should be commutative.", function() {
        var filter2 = new filter.Or([inStock, sales12k]);

        for(var k = 0; k < 7; k++) {
          var element = new Element(data, k);
          expect(myFilter.contains(element)).toBe(filter2.contains(element));
        }
      });

    }); // #contains

    describe("#apply", function() {
      it("should perform an OR.", function() {
        var filteredData = myFilter.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(3);
        expect(filteredData.getValue(0, 0)).toBe("A");
        expect(filteredData.getValue(1, 0)).toBe("B");
        expect(filteredData.getValue(2, 0)).toBe("C");
      });

    }); // #apply

    describe("#toSpec", function() {
      it("should return a JSON.", function() {
        expect(myFilter.toSpec()).toEqual({
          "$or": [
            {"sales": {"$in": [12000]}},
            {"inStock": {"$eq": true}}
          ]
        });
      });

      it("should return `null` if it has no operands.", function() {
        var myFilter = new filter.Or();
        expect(myFilter.toSpec()).toBeNull();
      });
    });

  });
});