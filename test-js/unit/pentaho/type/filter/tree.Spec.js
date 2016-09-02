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
  "pentaho/type/filter/tree",
  "pentaho/type/Context",
  "tests/pentaho/util/errorMatch"
], function(abstractFactory, treeFactory, Context, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true*/

  describe("pentaho.type.filter.Tree", function() {

    var context = new Context();
    var AbstractFilter = context.get(abstractFactory);
    var TreeFilter = context.get(treeFactory);
    var CustomFilter = AbstractFilter.extend({_contains: function() { return false; }});
    var CustomTreeFilter = TreeFilter.extend({_contains: function() { return false; }});

    describe("new ({operands})", function() {

      it("should be possible to create an instance", function() {
        var oper1 = new CustomFilter();

        var filter = new CustomTreeFilter({operands: [oper1]});

        expect(filter instanceof CustomTreeFilter).toBe(true);
      });
    });

    describe("#operands", function() {

      it("should return an operands list with the filters specified at construction", function() {
        var oper1 = new CustomFilter();
        var oper2 = new CustomFilter();

        var filter = new CustomTreeFilter({operands: [oper1, oper2]});

        var opers = filter.operands;
        expect(opers.count).toBe(2);
        expect(opers.at(0)).toBe(oper1);
        expect(opers.at(1)).toBe(oper2);
      });
    }); //#operands

    describe("#_visitDefault(transformer)", function() {

      it("should return a new filter of the same type when any operand is transformed by the transformer", function() {
        var filter1 = new CustomTreeFilter();
        var filter2 = new CustomFilter();

        var transf = jasmine.createSpy().and.returnValue(null);

        spyOn(filter1, "visitOperands").and.returnValue([filter2]);

        var filter3 = filter1.visit(transf);

        expect(filter3).not.toBe(filter1);
        expect(filter3).not.toBe(filter2);
        expect(filter3 instanceof CustomTreeFilter).toBe(true);
        expect(filter3.operands.count).toBe(1);
        expect(filter3.operands.at(0)).toBe(filter2);
      });

      it("should return this when no operand is transformed by the transformer", function() {
        var filter1 = new CustomTreeFilter();

        var transf = jasmine.createSpy().and.returnValue(null);

        spyOn(filter1, "visitOperands").and.returnValue(null);

        var filter2 = filter1.visit(transf);

        expect(filter2).toBe(filter1);
      });
    }); // #_visitDefault

    describe("#visitOperands(transformer, {where})", function() {
      it("should throw when transformer is nully", function() {
        var filter = new CustomTreeFilter();

        expect(function() {
          filter.visitOperands();
        }).toThrow(errorMatch.argRequired("transformer"));
      });

      it("should return null if none of the operands is transformed", function() {
        var filter = new CustomTreeFilter();

        var transf = jasmine.createSpy().and.returnValue(null);

        var result = filter.visitOperands(transf);

        expect(result).toBe(null);
      });

      it("should return an array with all operands if at least one operand is transformed", function() {
        var oper1 = new CustomFilter();
        var oper2 = new CustomFilter();
        var oper3 = new CustomFilter();
        var filter = new CustomTreeFilter({operands: [oper1, oper2, oper3]});

        var oper4 = new CustomFilter();

        var transf = jasmine.createSpy().and.callFake(function(filterArg) {
          return filterArg === oper2 ? oper4 : null;
        });

        expect(filter.operands.at(0)).toBe(oper1);
        expect(filter.operands.at(1)).toBe(oper2);
        expect(filter.operands.at(2)).toBe(oper3);

        var result = filter.visitOperands(transf);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(3);

        expect(result[0]).toBe(oper1);
        expect(result[1]).toBe(oper4);
        expect(result[2]).toBe(oper3);
      });

      it("should consider elements filtered out by `keyArgs.where` as a modification and " +
         "return a non-null array with those elements removed", function() {
        var oper1 = new CustomFilter();
        var oper2 = new CustomFilter();
        var oper3 = new CustomFilter();
        var filter = new CustomTreeFilter({operands: [oper1, oper2, oper3]});

        var transf = function() {};

        var result = filter.visitOperands(transf, {where: function(oper) { return oper !== oper2; }});

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);

        expect(result[0]).toBe(oper1);
        expect(result[1]).toBe(oper3);
      });
    }); // #visitOperands
  }); // pentaho.type.filter.Tree
});