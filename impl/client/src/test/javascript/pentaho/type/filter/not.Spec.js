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
  "pentaho/type/filter/abstract",
  "pentaho/type/filter/not",
  "pentaho/type/Context",
  "pentaho/type/complex",
  "tests/pentaho/util/errorMatch"
], function(abstractFactory, notFactory, Context, complexFactory, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.filter.Not", function() {

    var context = new Context();
    var AbstractFilter = context.get(abstractFactory);
    var NotFilter = context.get(notFactory);
    var Complex = context.get(complexFactory);
    var CustomFilter = AbstractFilter.extend({_contains: function() { return false; }});

    var ProductSummary = Complex.extend({
      type: {
        props: [
          {name: "name",    type: "string",  label: "Name"    },
          {name: "sales",   type: "number",  label: "Sales"   },
          {name: "inStock", type: "boolean", label: "In Stock"}
        ]
      }
    });

    describe("new ({operand})", function() {

      it("should be possible to create an instance", function() {
        var oper1 = new CustomFilter();

        var filter = new NotFilter({operand: oper1});

        expect(filter instanceof NotFilter).toBe(true);
      });
    });

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
    }); //#operand

    describe("#contains(elem)", function() {

      var elem = new ProductSummary({name: "A", sales: 12000, inStock: true});

      it("should return `true` if `operand` filter does not contain the element", function() {

        var oper1 = new CustomFilter();

        spyOn(oper1, "_contains").and.returnValue(false);

        var filter  = new NotFilter({operand: oper1});

        var result = filter.contains(elem);

        expect(result).toBe(true);
      });

      it("should return `false` if `operand` filter contains the element", function() {

        var oper1 = new CustomFilter();

        spyOn(oper1, "_contains").and.returnValue(true);

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

      it("should return `this` when the operand is not transformed by the transformer", function() {
        var oper1  = new CustomFilter();
        var filter = new NotFilter({operand: oper1});

        var transf = function() { return null; };

        var result = filter.visit(transf);

        expect(result).toBe(filter);
      });
    }); // #_visitDefault

  }); // pentaho.type.filter.Not
});