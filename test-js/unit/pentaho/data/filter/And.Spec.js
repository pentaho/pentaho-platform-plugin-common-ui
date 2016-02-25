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
  "pentaho/data/filter/_Element",
  "pentaho/data/Table",
  "./_dataSpecProductSalesInStock"
], function(And, IsEqual, IsIn, Element, Table, dataSpec) {
  "use strict";

  describe("pentaho.data.filter.And", function() {

    var data, sales12k, inStock;
    beforeEach(function() {
      data = new Table(dataSpec);

      sales12k = new IsIn("sales", [12000]);
      inStock = new IsEqual("inStock", true);
    });

    describe("#type", function() {
      it("should return '$and' ", function() {
        var filter = new And([sales12k, inStock]);
        expect(filter.type).toBe("$and");
      });

      it("should be immutable.", function() {
        expect(function() {
          var filter = new And([sales12k, inStock]);
          filter.type = "fake";
        }).toThrowError(TypeError);
      });

    }); // #type

    describe("#operands", function() {

      var filter;
      beforeEach(function(){
        filter = new And([sales12k, inStock]);
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

    describe("#and", function() {
      it("should return an AND.", function() {
        var combination = sales12k.and(inStock);
        expect(combination.type).toBe("$and");
      });

      it("should add elements instead of creating ANDs of ANDs", function() {
        var filter = new And([sales12k, inStock]);
        var productA = new IsEqual("product", "A");

        var result = filter.and(productA);
        expect(result.operands.length).toBe(3);
      });
    }); // #and

    describe("#or ", function() {
      it("should return an Or.", function() {
        var filter = sales12k.or(inStock);
        expect(filter.type).toBe("$or");
      });
    }); // #or

    describe("#invert ", function() {
      it("should return a Not.", function() {
        var filter = sales12k.invert();
        expect(filter.type).toBe("$not");
      });
    }); // #invert


    describe("#contains", function() {
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

      it("should be commutative.", function() {
        var elementIn = new Element(data, 0);
        var elementOut = new Element(data, 3);

        var filter1 = new And([sales12k, inStock]);
        expect(filter1.contains(elementIn)).toBe(true);
        expect(filter1.contains(elementOut)).toBe(false);

        var filter2 = new And([inStock, sales12k]);
        expect(filter2.contains(elementIn)).toBe(true);
        expect(filter2.contains(elementOut)).toBe(false);
      });
    }); // #contains

    describe("#apply", function() {
      it("should perform an AND.", function() {
        var combination = new And([sales12k, inStock]);
        var filteredData = combination.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(1);
        expect(filteredData.getValue(0, 0)).toBe("A");
      });

      it("should be commutative.", function() {
        var combination1 = new And([sales12k, inStock]);
        var data1 = combination1.apply(data);

        var combination2 = new And([inStock, sales12k]);
        var data2 = combination2.apply(data);

        expect(data1.getNumberOfRows()).toBe(1);
        expect(data1.getNumberOfRows()).toBe(data2.getNumberOfRows());
        expect(data1.getValue(0, 0)).toBe(data2.getValue(0, 0));
      });
    }); // #apply

    describe("#toSpec", function() {
      it("should return a JSON.", function() {
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
  });
});