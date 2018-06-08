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
  "pentaho/data/filter/IsEqual"
], function(Complex, AbstractFilter, NotFilter, IsEqualFilter) {

  "use strict";

  describe("pentaho.data.filter.Not", function() {

    var CustomFilter;
    var ProductSummary;

    function isTrue() { return true; }
    function isFalse() { return false; }

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

    describe("new ({operand})", function() {

      it("should be possible to create an instance", function() {
        var oper1 = new CustomFilter();

        var filter = new NotFilter({operand: oper1});

        expect(filter instanceof NotFilter).toBe(true);
      });

      it("should be possible to create an instance by specifying the alias `o`", function() {
        var oper1 = new CustomFilter();

        var filter = new NotFilter({o: oper1});

        expect(filter instanceof NotFilter).toBe(true);

        expect(filter.operand).toBe(oper1);
      });

    }); // new

    describe("#kind", function() {

      it("should return 'not'", function() {
        var filter  = new NotFilter();
        expect(filter.kind).toBe("not");
      });
    });

    describe("#operand", function() {

      it("should return the filter specified at construction", function() {
        var oper1 = new CustomFilter();

        var filter = new NotFilter({operand: oper1});

        expect(filter.operand).toBe(oper1);
      });
    }); // #operand

    describe("#contains(elem)", function() {

      var elem;

      beforeEach(function() {
        elem = new ProductSummary({name: "A", sales: 12000, inStock: true});
      });

      it("should return `true` if `operand` filter does not contain the element", function() {

        var oper1 = new CustomFilter();

        spyOn(oper1, "compile").and.returnValue(isFalse);

        var filter  = new NotFilter({operand: oper1});

        var result = filter.contains(elem);

        expect(result).toBe(true);
      });

      it("should return `false` if `operand` filter contains the element", function() {

        var oper1 = new CustomFilter();

        spyOn(oper1, "compile").and.returnValue(isTrue);

        var filter  = new NotFilter({operand: oper1});

        var result = filter.contains(elem);

        expect(result).toBe(false);
      });
    }); // #contains

    describe("#negate()", function() {
      it("should return `operand`, preventing double negation", function() {
        var oper1 = new CustomFilter();

        var filter  = new NotFilter({operand: oper1});

        var invFilter = filter.negate();

        expect(invFilter).toBe(oper1);
      });

      it("should return a new Not when `operand` is null", function() {
        var filter = new NotFilter();

        var invFilter = filter.negate();

        expect(invFilter).not.toBe(filter);
        expect(invFilter instanceof NotFilter).toBe(true);
        expect(invFilter.operand).toBe(filter);
      });
    }); // #negate

    describe("#_visitDefault(transformer)", function() {

      it("should return `this` if there is no operand", function() {
        var filter = new NotFilter();
        var transf = function() {};

        var result = filter.visit(transf);

        expect(result).toBe(filter);
      });

      it("should return a negated filter when the operand is transformed by the transformer", function() {
        var oper1  = new CustomFilter();
        var filter = new NotFilter({operand: oper1});
        var oper2  = new CustomFilter();

        var transf = function(filterArg) {
          return filterArg === oper1 ? oper2 : null;
        };

        var result = filter.visit(transf);

        expect(result).not.toBe(filter);
        expect(result).not.toBe(oper1);
        expect(result).not.toBe(oper2);
        expect(result instanceof NotFilter).toBe(true);
        expect(result.operand).toBe(oper2);
      });

      it("should return a clone when the operand is not transformed by the transformer", function() {
        var oper1 = new CustomFilter();
        var filter = new NotFilter({operand: oper1});

        var transf = function() { return null; };

        var result = filter.visit(transf);

        expect(result).toBe(filter);
      });
    }); // #_visitDefault

    describe("#toSpec", function() {
      var filter;

      beforeEach(function() {
        var oper = new CustomFilter();

        filter = new NotFilter({operand: oper});
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

          expect(filterSpec.o).toBeDefined();
          expect(filterSpec.operand).toBeUndefined();
        });
      });

      describe("when invoked with the keyword argument `noAlias` set to `true`", function() {
        it("should specify the operands by their #name 'operands", function() {

          var filterSpec = filter.toSpec({
            noAlias: true
          });

          expect(filterSpec._).toBeUndefined();
          expect(filterSpec.o).toBeUndefined();
          expect(filterSpec.operand).toBeDefined();

        });
      });

      describe("when invoked with the keyword argument `forceType` set to `true`", function() {
        it("should specify the type by the #alias", function() {

          var filterSpec = filter.toSpec({
            forceType: true
          });

          expect(filterSpec._).toBe("not");
        });

        it("should specify the type by the #id when the `noAlias` option is additionally specified", function() {

          var filterSpec = filter.toSpec({
            forceType: true,
            noAlias: true
          });

          expect(filterSpec._).toBe("pentaho/data/filter/Not");
        });
      });

    }); // #toSpec

    describe("#contentKey", function() {

      it("should return '(not filter)'", function() {
        var filter  = new NotFilter({operand: {_: "=", p: "a", v: 1}});

        expect(filter.$contentKey).toBe("(not (= a 1))");
      });

      it("should return '(not) when operand is not set'", function() {
        var filter  = new NotFilter({});

        expect(filter.$contentKey).toBe("(not)");
      });
    });
  });
});
