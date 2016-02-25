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
  "pentaho/data/filter/Or",
  "pentaho/data/filter/IsEqual",
  "pentaho/data/filter/IsIn",
  "pentaho/data/filter/_Element",
  "pentaho/data/Table",
  "./_dataSpecProductSalesInStock"
], function(Or, IsEqual, IsIn, Element, Table, dataSpec) {
  "use strict";

  describe("pentaho.data.filter.Or", function() {

    var data, sales12k, inStock, filter;
    beforeEach(function() {
      data = new Table(dataSpec);
      sales12k = new IsIn("sales", [12000]);
      inStock = new IsEqual("inStock", true);
      filter = new Or([sales12k, inStock])
    });


    it("should be of type '$or'.", function() {
      expect(filter.type).toBe("$or");
    });


    describe("#operands", function() {
      it("should be readonly.", function() {
        expect(function() {
          filter.operands = [new IsEqual("product", "A")];
        }).toThrowError(TypeError);
      });

      it("should be immutable.", function() {
        var operands = filter.operands;
        filter.operands.push(new IsEqual("product", "A"));
        expect(filter.operands).toEqual(operands);
      });
    }); // #operands

    describe("#or", function() {
      it("should add elements instead of creating ORs of ORs", function() {
        var productA = new IsEqual("product", "A");

        var result = filter.or(productA);
        expect(result.operands.length).toBe(3);
      });

      it("should return a new instance", function() {
        var productA = new IsEqual("product", "A");

        var result = filter.or(productA);
        expect(result).not.toBe(filter);
      });
    });

    describe("#and ", function() {
      it("should return an And.", function() {
        var result = filter.and(inStock);
        expect(result.type).toBe("$and");
      });
    }); // #or

    describe("#invert", function() {

      it("should return a simplified filter, with the negated terms next to the leafs", function() {
        var result = filter.invert();

        expect(result.type).toBe("$and");
        expect(result.operands.length).toBe(2);
        expect(result.operands[0].type).toBe("$not");
        expect(result.operands[0].operand.type).toBe("$in");
        expect(result.operands[1].type).toBe("$not");
        expect(result.operands[1].operand.type).toBe("$eq");
      });
    });

    describe("#contains", function() {

      it("should return `true` if a given `element` belongs to the dataset.", function() {
        var element = new Element(data, 0);
        expect(filter.contains(element)).toBe(true);
      });

      it("should return `false` if a given `element` does not belong to the dataset.", function() {
        var element = new Element(data, 3);
        expect(filter.contains(element)).toBe(false);
      });

      it("should return `false` if the filter has no operands.", function() {
        var filter = new Or();
        var element = new Element(data, 0);
        expect(filter.contains(element)).toBe(false);
      });

      it("should perform an OR.", function() {
        [0, 1, 2].forEach(function(rowIdx) {
          var elementIn = new Element(data, rowIdx);
          expect(filter.contains(elementIn)).toBe(true);
        });

        [3, 4, 5, 6].forEach(function(rowIdx) {
          var elementOut = new Element(data, rowIdx);
          expect(filter.contains(elementOut)).toBe(false);
        });
      });

      it("should be commutative.", function() {
        var filter2 = new Or([inStock, sales12k]);

        for(var k = 0; k < 7; k++) {
          var element = new Element(data, k);
          expect(filter.contains(element)).toBe(filter2.contains(element));
        }
      });

    }); // #contains

    describe("#apply", function() {
      it("should perform an OR.", function() {
        var filteredData = filter.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(3);
        expect(filteredData.getValue(0, 0)).toBe("A");
        expect(filteredData.getValue(1, 0)).toBe("B");
        expect(filteredData.getValue(2, 0)).toBe("C");
      });

      it("should be commutative", function() {
        var data1 = filter.apply(data);

        var filter2 = new Or([inStock, sales12k]);
        var data2 = filter2.apply(data);

        expect(data1.getNumberOfRows()).toBe(3);
        expect(data1.getNumberOfRows()).toBe(data2.getNumberOfRows());
        for(var k = 0; k < 3; k++) {
          expect(data1.getValue(k, 0)).toBe(data2.getValue(k, 0));
        }
      });
    }); // #apply

    describe("#toSpec", function() {
      it("should return a JSON.", function() {
        expect(filter.toSpec()).toEqual({
          "$or": [
            {"sales": {"$in": [12000]}},
            {"inStock": {"$eq": true}}
          ]
        });
      });

      it("should return `null` if it has no operands.", function() {
        var filter = new Or();
        expect(filter.toSpec()).toBeNull();
      });
    });

  });
});