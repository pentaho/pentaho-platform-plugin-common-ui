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
  "pentaho/data/filter/_Element",
  "pentaho/data/Table",
  "./_dataSpecProductSalesInStock"
], function(IsIn, Element, Table, dataSpec) {
  "use strict";

  describe("pentaho.data.filter.IsIn", function() {

    var data, sales12k, inStock;
    beforeEach(function() {
      data = new Table(dataSpec);
      sales12k = new IsIn("sales", [10000, 12000]);
      inStock= new IsIn("inStock", [true]);
    });

    describe("#value", function() {
      it("should be immutable", function() {
        expect(function() {
          sales12k.value = [11000, 13000];
        }).toThrowError(TypeError);
      });
    }); //#value

    describe("#property", function() {
      it("should be immutable", function() {
        expect(function() {
          sales12k.property = "inStock";
        }).toThrowError(TypeError);
      });
    }); //#property

    describe("#type", function() {
      it("should return '$in'.", function() {
        expect(sales12k.type).toBe("$in");
      });

      it("should be immutable.", function() {
        expect(function() {
          sales12k.type = "fake";
        }).toThrowError(TypeError);
      });
    }); // #type

    describe("#and ", function() {
      it("should return an AND.", function() {
        var combination = sales12k.and(inStock);
        expect(combination.type).toBe("$and");
      });
    }); // #and

    describe("#or ", function() {
      it("should return an Or.", function() {
        var combination = sales12k.or(inStock);
        expect(combination.type).toBe("$or");
      });
    }); // #or

    describe("#invert ", function() {
      it("should return a Not.", function() {
        var filter = sales12k.invert();
        expect(filter.type).toBe("$not");
      });
    }); // #invert

    describe("#contains ", function() {
      it("should confirm if a filter with the data", function() {
        var containsSales12k = sales12k.contains(new Element(data, 0));
        expect(containsSales12k).toBe(true);
      });
    }); // #contains

    describe("#apply(pentaho.data.Table object)", function() {
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
    }); // #apply

    describe("#toSpec()", function() {
      it("should return a JSON matching the state of the filter", function() {
        var sales12k = new IsIn("sales", [10000, 12000]);
        expect(sales12k.toSpec()).toEqual({
          "sales": {"$in": [10000, 12000]}
        });
      });
    }); // #toSpec

  }); // #pentaho.data.filter.IsIn
});