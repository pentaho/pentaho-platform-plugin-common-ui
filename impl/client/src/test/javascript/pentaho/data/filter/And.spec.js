/*!
 * Copyright 2010 - 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/Complex",
  "pentaho/data/filter/Abstract",
  "pentaho/data/filter/Not",
  "pentaho/data/filter/And",
  "pentaho/data/filter/Or",
  "pentaho/data/filter/IsEqual"
], function(Complex, AbstractFilter, NotFilter, AndFilter, OrFilter, IsEqualFilter) {

  "use strict";

  describe("pentaho.data.filter.And", function() {

    var CustomFilter;
    var ProductSummary;

    beforeAll(function() {
      ProductSummary = Complex.extend({
        $type: {
          props: [
            {name: "name", valueType: "string", label: "Name"},
            {name: "sales", valueType: "number", label: "Sales"},
            {name: "inStock", valueType: "boolean", label: "In Stock"}
          ]
        }
      });

      var count = 1;

      CustomFilter = AbstractFilter.extend({
        compile: function() {
          return function() { return false; };
        },
        _buildContentKey: function() {
          return String(count++);
        }
      });
    });

    describe("#kind", function() {

      it("should return 'and'", function() {
        var filter  = new AndFilter();
        expect(filter.kind).toBe("and");
      });
    });

    describe("#contains(elem)", function() {
      var elem;

      beforeEach(function() {
        elem = new ProductSummary({name: "A", sales: 12000, inStock: true});
      });

      it("should return `true` if `operands` is empty", function() {

        var filter  = new AndFilter();

        var result = filter.contains(elem);

        expect(result).toBe(true);
      });

      it("should return `true` if all operand filters contain the element", function() {

        var oper1 = new CustomFilter();
        var oper2 = new CustomFilter();

        function isTrue() { return true; }

        spyOn(oper1, "compile").and.returnValue(isTrue);
        spyOn(oper2, "compile").and.returnValue(isTrue);

        var filter  = new AndFilter({operands: [oper1, oper2]});

        var result = filter.contains(elem);

        expect(result).toBe(true);
      });

      it("should return `false` if one of the operand filters does not contain the element", function() {

        var oper1 = new CustomFilter();
        var oper2 = new CustomFilter();

        function isTrue() { return true; }
        function isFalse() { return false; }

        spyOn(oper1, "compile").and.returnValue(isTrue);
        spyOn(oper2, "compile").and.returnValue(isFalse);

        var filter  = new AndFilter({operands: [oper1, oper2]});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should be commutative", function() {

        var oper1 = new CustomFilter();
        var oper2 = new CustomFilter();

        function isTrue() { return true; }
        function isFalse() { return false; }

        spyOn(oper1, "compile").and.returnValue(isTrue);
        spyOn(oper2, "compile").and.returnValue(isFalse);

        var filter  = new AndFilter({operands: [oper1, oper2]});

        var result = filter.contains(elem);

        expect(result).toBe(false);

        filter  = new AndFilter({operands: [oper2, oper1]});

        result = filter.contains(elem);

        expect(result).toBe(false);
      });

      it("should return `false` if none of the operand filters contains the element", function() {

        var oper1 = new CustomFilter();
        var oper2 = new CustomFilter();

        function isFalse() { return false; }

        spyOn(oper1, "compile").and.returnValue(isFalse);
        spyOn(oper2, "compile").and.returnValue(isFalse);

        var filter  = new AndFilter({operands: [oper1, oper2]});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });
    }); // #contains

    describe("#negate()", function() {
      it("should return an `Or` of negated operands", function() {
        var oper1 = new CustomFilter();
        var oper2 = new CustomFilter();

        var filter = new AndFilter({operands: [oper1, oper2]});

        var invFilter = filter.negate();

        expect(invFilter instanceof OrFilter);

        var opers = invFilter.operands;
        expect(opers.count).toBe(2);

        expect(opers.at(0) instanceof NotFilter).toBe(true);
        expect(opers.at(0).operand).toBe(oper1);

        expect(opers.at(1) instanceof NotFilter).toBe(true);
        expect(opers.at(1).operand).toBe(oper2);
      });
    }); // #negate

    describe("#and(filter, ...)", function() {

      it("should return itself when no operands are given", function() {
        var filter = new AndFilter();
        var result = filter.and();

        expect(result).toBe(filter);
      });

      it("should return itself when only null operands are given", function() {
        var filter = new AndFilter();
        var result = filter.and(null, null);

        expect(result).toBe(filter);
      });

      it("should return the single operand when given an operand and initially empty", function() {
        var filter = new AndFilter();
        var oper1  = new CustomFilter();

        var result = filter.and(oper1);

        expect(result).toBe(oper1);
      });

      it("should return an `And` filter when given an operand and initially not empty", function() {
        var oper1  = new CustomFilter();
        var filter = new AndFilter({operands: [oper1]});
        var oper2  = new CustomFilter();

        var result = filter.and(oper2);

        expect(result instanceof AndFilter).toBe(true);
      });

      it("should return a new filter when given an operand", function() {
        var oper1  = new CustomFilter();
        var filter = new AndFilter({operands: [oper1]});
        var oper2  = new CustomFilter();

        var result = filter.and(oper2);

        expect(result).not.toBe(filter);
        expect(result).not.toBe(oper1);
        expect(result).not.toBe(oper2);
      });

      it("should add elements instead of creating a tree of Ands", function() {
        var oper1  = new CustomFilter();
        var oper2  = new CustomFilter();
        var filter = new AndFilter({operands: [oper1, oper2]});
        var oper3  = new CustomFilter();

        var result = filter.and(oper3);

        expect(result.operands.count).toBe(3);
      });

      it("should flatten operands of a given And argument", function() {
        var oper1  = new CustomFilter();
        var oper2  = new CustomFilter();
        var filter1 = new AndFilter({operands: [oper1, oper2]});

        var oper3  = new CustomFilter();
        var filter2 = new AndFilter({operands: [oper3]});

        var result = filter1.and(filter2);

        expect(result.operands.count).toBe(3);
        expect(result.operands.at(0)).toBe(oper1);
        expect(result.operands.at(1)).toBe(oper2);
        expect(result.operands.at(2)).toBe(oper3);
      });
    }); // #and

    describe("#toSpec", function() {
      var filter;

      beforeEach(function() {
        var oper1 = new CustomFilter();
        var oper2 = new CustomFilter();

        filter = new AndFilter({operands: [oper1, oper2]});
      });

      describe("when invoked without keyword arguments", function() {
        var filterSpec;

        beforeEach(function() {
          filterSpec = filter.toSpec();
        });

        it("should omit the type", function() {
          expect(filterSpec._).toBeUndefined();
        });

        it("should specify the operands by their #nameAlias 'o' instead of their #name 'operands", function() {

          expect(filterSpec.o.length).toBe(2);
          expect(filterSpec.operands).toBeUndefined();
        });
      });

      describe("when invoked with the keyword argument `noAlias` set to `true`", function() {
        it("should specify the operands by their #name 'operands", function() {

          var filterSpec = filter.toSpec({
            noAlias: true
          });

          expect(filterSpec._).toBeUndefined();
          expect(filterSpec.o).toBeUndefined();
          expect(filterSpec.operands.length).toBe(2);

        });
      });

      describe("when invoked with the keyword argument `forceType` set to `true`", function() {
        it("should specify the type by the #alias", function() {

          var filterSpec = filter.toSpec({
            forceType: true
          });

          expect(filterSpec._).toBe("and");
        });

        it("should specify the type by the #id when the `noAlias` option is additionally specified", function() {

          var filterSpec = filter.toSpec({
            forceType: true,
            noAlias: true
          });

          expect(filterSpec._).toBe("pentaho/data/filter/And");
        });
      });

    }); // #toSpec

    describe("#contentKey", function() {

      it("should return '(and filter1 filter2)'", function() {
        var filter  = new AndFilter({operands: [
          {_: "=", p: "a", v: 1},
          {_: "=", p: "b", v: 2}
        ]});

        expect(filter.$contentKey).toBe("(and (= a 1) (= b 2))");
      });

      it("should return '(and) when there are no operands'", function() {
        var filter  = new AndFilter({});

        expect(filter.$contentKey).toBe("(and)");
      });

      it("should sort child content keys alphabetically", function() {
        var filter  = new AndFilter({operands: [
          {_: "=", p: "b", v: 2},
          {_: "=", p: "a", v: 1}
        ]});

        expect(filter.$contentKey).toBe("(and (= a 1) (= b 2))");
      });
    });
  }); // pentaho.data.filter.And

});
