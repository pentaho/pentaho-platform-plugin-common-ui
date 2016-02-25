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

    var data, sales12k, inStock;
    beforeEach(function() {
      data = new Table(dataSpec);
      sales12k = new IsIn("sales", [12000]);
      inStock = new IsEqual("inStock", true);
    });


    it("should be of type '$or'.", function() {
      var filter = new Or(sales12k);
      expect(filter.type).toBe("$or");
    });



    describe("#operands", function() {

      var filter;
      beforeEach(function(){
        filter = new Or([sales12k, inStock]);
      });

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
        var filter = new Or([sales12k, inStock]);
        var productA = new IsEqual("product", "A");

        var result = filter.or(productA);
        expect(result.operands.length).toBe(3);
      });

      it("should return a new instance", function() {
        var filter = new Or([sales12k, inStock]);
        var productA = new IsEqual("product", "A");

        var result = filter.or(productA);
        expect(result).not.toBe(filter);
      });
    });

    describe("#invert", function() {

      it("should return a simplified filter, with the negated terms next to the leafs", function() {
        var filter0 = new Or([sales12k, inStock]);

        var filter = filter0.invert();

        expect(filter.type).toBe("$and");
        expect(filter.operands.length).toBe(2);
        expect(filter.operands[0].type).toBe("$not");
        expect(filter.operands[0].operand.type).toBe("$in");
        expect(filter.operands[1].type).toBe("$not");
        expect(filter.operands[1].operand.type).toBe("$eq");
      });
    });

    describe("#contains", function() {

      it("should return `true` if a given `element` belongs to the dataset.", function() {
        var filter = new Or([sales12k, inStock]);
        var element = new Element(data, 0);
        expect(filter.contains(element)).toBe(true);
      });

      it("should return `false` if a given `element` does not belong to the dataset.", function() {
        var filter = new Or([sales12k, inStock]);
        var element = new Element(data, 3);
        expect(filter.contains(element)).toBe(false);
      });

      it("should return `false` if the filter has no operands.", function() {
        var filter = new Or();
        var element = new Element(data, 0);
        expect(filter.contains(element)).toBe(false);
      });

    }); // #contains

    describe("#apply", function() {
      it("should perform an OR.", function() {
        var combination = new Or([sales12k, inStock]);
        var filteredData = combination.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(3);
        expect(filteredData.getValue(0, 0)).toBe("A");
        expect(filteredData.getValue(1, 0)).toBe("B");
        expect(filteredData.getValue(2, 0)).toBe("C");
      });

      it("should be commutative", function() {
        var combination1 = new Or([sales12k, inStock]);
        var data1 = combination1.apply(data);

        var combination2 = new Or([inStock, sales12k]);
        var data2 = combination2.apply(data);

        expect(data1.getNumberOfRows()).toBe(3);
        expect(data1.getNumberOfRows()).toBe(data2.getNumberOfRows());
        expect(data1.getValue(0, 0)).toBe(data2.getValue(0, 0));
      });
    }); // #apply

    describe("#toSpec", function() {
      it("should return a JSON.", function() {
        var filter = new Or([sales12k, inStock]);
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