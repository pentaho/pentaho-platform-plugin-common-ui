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

  describe("pentaho.data.filter.IsIn", function() {

    var data, sales12k;
    beforeEach(function() {
      data = new Table(dataSpec);
      sales12k = new filter.IsIn("sales", [10000, 12000]);
    });

    describe("#type", function() {
      it("should return 'IsIn'.", function() {
        expect(sales12k.type).toBe("isIn");
      });

      it("should be immutable.", function() {
        expect(function() {
          sales12k.type = "fake";
        }).toThrowError(TypeError);
      });
    }); // #type

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

    describe("#and ", function() {
      it("should return an AND.", function() {
        var inStock= new filter.IsIn("inStock", [true]);
        var combination = sales12k.and(inStock);
        expect(combination.type).toBe("and");
      });
    }); // #and

    describe("#or ", function() {
      it("should return an Or.", function() {
        var inStock= new filter.IsIn("inStock", [true]);
        var combination = sales12k.or(inStock);
        expect(combination.type).toBe("or");
      });
    }); // #or

    describe("#invert ", function() {
      it("should return a Not.", function() {
        var myFilter = sales12k.invert();
        expect(myFilter.type).toBe("not");
      });
    }); // #invert

    describe("#contains ", function() {
      it("should return `true` if a given `element` belongs to the dataset.", function() {
        var containsSales12k = sales12k.contains(new Element(data, 0));
        expect(containsSales12k).toBe(true);
      });

      it("should return `false` if a given `element` belongs to the dataset.", function() {
        var containsSales12k = sales12k.contains(new Element(data, 1));
        expect(containsSales12k).toBe(false);
      });

      it("should return `false` if the set is empty", function() {
        var myFilter = new filter.IsIn("sales", []);
        var result = myFilter.contains(new Element(data, 0));
        expect(result).toBe(false);
      });

      it("should assert if the value of a given property of the element belongs to a predefined set", function(){
        [0,2].forEach(function(rowIdx){
          var element = new Element(data, rowIdx);
          expect(sales12k.contains(element)).toBe(true);
        });
        [1,3,4,5,6].forEach(function(rowIdx){
          var element = new Element(data, rowIdx);
          expect(sales12k.contains(element)).toBe(false);
        });
      });
    }); // #contains

    describe("#apply(pentaho.data.Table object)", function() {
      it("should return the matching entry", function() {
        var isProductAC = new filter.IsIn("product", ["A"]);
        var filteredData = isProductAC.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(1);
        expect(filteredData.getValue(0, 0)).toBe("A");
      });

      it("should return all the entries matching the criterion", function() {
        var isProductAC = new filter.IsIn("product", ["A", "C"]);
        var filteredData = isProductAC.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(2);
        expect(filteredData.getValue(0, 0)).toBe("A");
        expect(filteredData.getValue(1, 0)).toBe("C");
      });

      it("should return an empty dataset if no match is found.", function() {
        var isProductA = new filter.IsIn("sales", [5000, 7000]);
        var filteredData = isProductA.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(0);
      });
    }); // #apply

    describe("#toSpec()", function() {
      it("should return a JSON matching the state of the filter", function() {
        expect(sales12k.toSpec()).toEqual({
          "sales": {"$in": [10000, 12000]}
        });
      });

      it("should return `null` if the #property is not defined", function() {
        var myFilter = new filter.IsIn(undefined, [10000, 12000]);
        expect(myFilter.toSpec()).toBeNull();
      });

      it("should return `null` if #value is not defined", function() {
        var myFilter = new filter.IsIn("sales", undefined);
        expect(myFilter.toSpec()).toBeNull();
      });
    }); // #toSpec

  }); // #pentaho.data.filter.IsIn
});