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
  "pentaho/data/filter/Not",
  "pentaho/data/filter/Or",
  "pentaho/data/filter/IsEqual",
  "pentaho/data/filter/_Element",
  "pentaho/data/Table",
  "./_dataSpecProductSalesInStock"
], function(Not, Or, IsEqual, Element, Table, dataSpec) {
  "use strict";

  describe("pentaho.data.filter.Not", function() {

    var data, sales12k;
    beforeEach(function() {
      data = new Table(dataSpec);

      sales12k = new IsEqual("sales", 12000);
    });

    it("should throw an error if no operands are specified.", function() {
      expect(function() {
        return new Not();
      }).toThrowError();
    });

    describe("#type ", function() {
      it("should return '$not' ", function() {
        var filter = new Not(sales12k);
        expect(filter.type).toBe("$not");
      });

      it("should be immutable", function() {
        var filter = new Not(sales12k);
        expect(function() {
          filter.type = "fake";
        }).toThrowError(TypeError);
      });
    });

    describe("#operand ", function() {
      it("should be immutable", function() {
        var filter = new Not(sales12k);

        expect(function() {
          filter.operand = {};
        }).toThrowError(TypeError);
      });
    });

    describe("#and ", function() {
      it("should return an AND.", function() {
        var inStock = new IsEqual("inStock", true);
        var combination = sales12k.and(inStock);
        expect(combination.type).toBe("$and");
      });
    }); // #and

    describe("#or ", function() {
      it("should return an Or.", function() {
        var inStock = new IsEqual("inStock", true);
        var combination = sales12k.or(inStock);
        expect(combination.type).toBe("$or");
      });
    }); // #or

    describe("#invert ", function() {
      it("should return a Not.", function() {
        var filter = sales12k.invert();
        expect(filter.type).toBe("$not");
      });

      it("should prevent double negation (i.e. replace 'NOT NOT A' with 'A').", function() {
        var notSales12k = new Not(sales12k);
        expect(notSales12k.type).toBe("$not");
        expect(notSales12k.operand.type).toBe("$eq");

        var notNotSales12k = notSales12k.invert();
        expect(notNotSales12k.type).toBe("$eq");
        expect(notNotSales12k).toBe(sales12k);
      });
    }); //#invert

    describe("#contains", function() {

      it("should return `true` if a given `element` belongs to the dataset.", function() {
        var filter = new Not(sales12k);
        var element = new Element(data, 0);
        expect(filter.contains(element)).toBe(false);
      });

      it("should return `false` if a given `element` does not belong to the dataset.", function() {
        var filter = new Not(sales12k);
        var element = new Element(data, 3);
        expect(filter.contains(element)).toBe(true);
      });

    }); // #contains


    describe("#apply", function() {

      it("should return the inverse of a simple filter.", function() {
        var combination = new Not(sales12k);
        var filteredData = combination.apply(data);

        expect(filteredData.getNumberOfRows()).toBe(5);
        [
          "B", "D", "E", "F", "G"
        ].forEach(function(product, idx) {
          expect(filteredData.getValue(idx, 0)).toBe(product);
        });

      });

      it("should return the inverse of a complex filter.", function() {
        var filter = new Or([
          new IsEqual("product", "A"),
          new IsEqual("product", "B"),
          new IsEqual("product", "C")
        ]);

        var combination = new Not(filter);
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
        var filter = new Not(sales12k);

        expect(filter.toSpec()).toEqual({
          "$not": {"sales": {"$eq": 12000}}
        });
      });
    }); //#toSpec

  });
});