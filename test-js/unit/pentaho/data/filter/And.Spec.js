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

  describe("pentaho.data.filter.And", function() {

    var data, sales12k, inStock, myFilter;
    beforeEach(function() {
      data = new Table(dataSpec);

      sales12k = new filter.IsIn("sales", [12000]);
      inStock = new filter.IsEqual("inStock", true);
      myFilter = new filter.And([sales12k, inStock]);
    });

    describe("#type", function() {
      it("should return 'And' ", function() {
        expect(myFilter.type).toBe("and");
      });

      it("should be immutable.", function() {
        expect(function() {
          myFilter.type = "fake";
        }).toThrowError(TypeError);
      });

    }); // #type

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

    describe("#and", function() {
      it("should return an AND.", function() {
        var result = myFilter.and(inStock);
        expect(result.type).toBe("and");
      });

      it("should return a new instance when adding more operands", function() {
        var productA = new filter.IsEqual("product", "A");

        var result = myFilter.and(productA);
        expect(result).not.toBe(myFilter);
      });

      it("should return the same instance if not adding operands", function() {
        var result = myFilter.and();
        expect(result).toBe(myFilter);
      });

      it("should add elements instead of creating ANDs of ANDs", function() {
        var productA = new filter.IsEqual("product", "A");

        var result = myFilter.and(productA);
        expect(result.operands.length).toBe(3);
      });
    }); // #and

    describe("#or ", function() {
      it("should return an Or.", function() {
        var result = myFilter.or(inStock);
        expect(result.type).toBe("or");
      });
    }); // #or

    describe("#invert ", function() {
      it("should return a simplified filter, with the negated terms next to the leafs", function() {
        var result = myFilter.invert();

        expect(result.type).toBe("or");
        expect(result.operands.length).toBe(2);
        expect(result.operands[0].type).toBe("not");
        expect(result.operands[0].operand.type).toBe("isIn");
        expect(result.operands[1].type).toBe("not");
        expect(result.operands[1].operand.type).toBe("isEqual");
      });
    }); // #invert


    describe("#contains", function() {
      it("should return `true` if a given `element` belongs to the dataset.", function() {
        var element = new Element(data, 0);
        expect(myFilter.contains(element)).toBe(true);
      });

      it("should return `false` if a given `element` does not belong to the dataset.", function() {
        var element = new Element(data, 3);
        expect(myFilter.contains(element)).toBe(false);
      });

      it("should return `true` if the filter has no operands.", function() {
        var myFilter = new filter.And();
        var element = new Element(data, 0);
        expect(myFilter.contains(element)).toBe(true);
      });


      it("should perform an AND.", function() {
        [0].forEach(function(rowIdx) {
          var elementIn = new Element(data, rowIdx);
          expect(myFilter.contains(elementIn)).toBe(true);
        });

        [1, 2, 3, 4, 5, 6].forEach(function(rowIdx) {
          var elementOut = new Element(data, rowIdx);
          expect(myFilter.contains(elementOut)).toBe(false);
        });
      });

      it("should be commutative.", function() {
        var filter2 = new filter.And([inStock, sales12k]);

        for(var k = 0; k < 7; k++) {
          var element = new Element(data, k);
          expect(myFilter.contains(element)).toBe(filter2.contains(element));
        }
      });
    }); // #contains

    describe("#apply", function() {
      it("should perform an AND.", function() {
        var filteredData = myFilter.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(1);
        expect(filteredData.getValue(0, 0)).toBe("A");
      });

    }); // #apply

    describe("#toSpec", function() {
      it("should return a JSON.", function() {
        expect(myFilter.toSpec()).toEqual({
          "$and": [
            {"sales": {"$in": [12000]}},
            {"inStock": {"$eq": true}}
          ]
        });
      });

      it("should return `null` if it has no operands.", function() {
        var myFilter = new filter.And();
        expect(myFilter.toSpec()).toBeNull();
      });
    }); // #toSpec
  });
});