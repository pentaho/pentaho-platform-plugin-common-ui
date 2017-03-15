/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/filter/and",
  "pentaho/type/filter/or",
  "pentaho/type/Context",
  "tests/pentaho/util/errorMatch"
], function(abstractFactory, notFactory, andFactory, orFactory, Context, errorMatch) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  describe("pentaho.type.filter.Abstract", function() {

    var context = new Context();
    var AbstractFilter = context.get(abstractFactory);
    var NotFilter = context.get(notFactory);
    var AndFilter = context.get(andFactory);
    var OrFilter = context.get(orFactory);
    var CustomFilter = AbstractFilter.extend({_contains: function() { return false; }});

    describe("#negate()", function() {

      it("should return a Not filter with the original filter as `operand`", function() {

        var filter = new CustomFilter();

        var invFilter = filter.negate();

        expect(invFilter instanceof NotFilter).toBe(true);

        expect(invFilter.operand).toBe(filter);
      });
    }); // #negate

    describe("#and(oper2, oper3, ...)", function() {

      it("should return the filter when no arguments are given", function() {

        var filter1 = new CustomFilter();
        var combination = filter1.and();

        expect(combination).toBe(filter1);
      });

      it("should return an And filter with all filters as operands", function() {

        var filter1 = new CustomFilter();
        var filter2 = new CustomFilter();
        var filter3 = new CustomFilter();

        var combination = filter1.and(filter2, filter3);

        expect(combination instanceof AndFilter).toBe(true);

        var operands = combination.operands;
        expect(operands.count).toBe(3);
        expect(operands.at(0)).toBe(filter1);
        expect(operands.at(1)).toBe(filter2);
        expect(operands.at(2)).toBe(filter3);
      });
    }); // #and

    describe("#or(oper2, oper3, ...)", function() {

      it("should return the filter when no arguments are given", function() {

        var filter1 = new CustomFilter();
        var combination = filter1.or();

        expect(combination).toBe(filter1);
      });

      it("should return an Or filter with all filters as operands", function() {

        var filter1 = new CustomFilter();
        var filter2 = new CustomFilter();
        var filter3 = new CustomFilter();

        var combination = filter1.or(filter2, filter3);

        expect(combination instanceof OrFilter).toBe(true);

        var operands = combination.operands;
        expect(operands.count).toBe(3);
        expect(operands.at(0)).toBe(filter1);
        expect(operands.at(1)).toBe(filter2);
        expect(operands.at(2)).toBe(filter3);
      });
    }); // #or

    describe("#visit(transformer)", function() {

      it("should throw when transformer is nully", function() {
        var filter = new CustomFilter();

        expect(function() {
          filter.visit();
        }).toThrow(errorMatch.argRequired("transformer"));
      });

      it("should call the transformer with _this_ as argument", function() {
        var filter = new CustomFilter();
        var transf = jasmine.createSpy();

        filter.visit(transf);

        expect(transf.calls.count()).toBe(1);

        expect(transf.calls.first().args.length).toBe(1);
        expect(transf.calls.first().args[0]).toBe(filter);
      });

      it("should return what the transformer returns, if non-nully", function() {
        var filter1 = new CustomFilter();
        var filter2 = new CustomFilter();

        var transf = jasmine.createSpy().and.returnValue(filter2);

        var result = filter1.visit(transf);

        expect(result).toBe(filter2);
      });

      it("should call _visitDefault with the transformer if the transformer returns nully", function() {
        var filter1 = new CustomFilter();

        var transf = jasmine.createSpy().and.returnValue(null);

        spyOn(filter1, "_visitDefault");

        filter1.visit(transf);

        expect(filter1._visitDefault.calls.count()).toBe(1);
        expect(filter1._visitDefault.calls.first().args.length).toBe(1);
        expect(filter1._visitDefault.calls.first().args[0]).toBe(transf);
      });

      it("should return the result of _visitDefault if the transformer returns nully", function() {
        var filter1 = new CustomFilter();
        var filter2 = new CustomFilter();

        var transf = jasmine.createSpy().and.returnValue(null);

        spyOn(filter1, "_visitDefault").and.returnValue(filter2);

        var result = filter1.visit(transf);

        expect(result).toBe(filter2);
      });
    }); // #visit

    describe("#toDnf()", function() {

      function createFilter(spec) {
        return AbstractFilter.type.create(spec);
      }

      function specToDnf(spec) {
        return createFilter(spec).toDnf();
      }

      function expectDnf(specIn, specOut) {
        var fDnf = specToDnf(specIn);

        if(specOut) {
          expect(fDnf.toSpec({forceType: true})).toEqual(specOut);
        }
      }

      it("should preserve a filter already in DNF", function() {
        expectDnf({
          _: "or"
        }, {
          _: "or"
        });
      });

      it("should apply De Morgan Rule 1 - NOT over AND", function() {
        expectDnf({
          _: "not",
          o: {_: "and", o: [{_: "=", p: "a", v: 1}]}
        },
        {_: "or",
          o: [
            {
              _: "and",
              o: [
                {_: "not", o: {_: "=", p: "a", v: 1}}
              ]
            }
          ]
        });
      });

      it("should apply De Morgan Rule 2 - NOT over OR", function() {
        expectDnf({
          _: "not",
          o: {
            _: "or",
            o: [
                {_: "=", p: "a", v: 1}
            ]
          }
        }, {
          _: "or",
          o: [
            {
              _: "and",
              o: [
                {
                  _: "not",
                  o: {_: "=", p: "a", v: 1}
                }
              ]
            }
          ]
        });
      });

      it("should eliminate double-negations", function() {
        expectDnf({
          _: "not",
          o: {
            _: "not",
            o: {
              _: "or",
              o: [
                {_: "=", p: "a", v: 1}
              ]
            }
          }
        }, {
          _: "or",
          o: [
            {
              _: "and",
              o: [
                {_: "=", p: "a", v: 1}
              ]
            }
          ]
        });
      });

      it("should distribute AND over OR", function() {
        expectDnf({
          _: "and",
          o: [
            {
              _: "or",
              o: [
                {
                  _: "not",
                  o: {_: "=", p: "a", v: 1}
                }
              ]
            }
          ]
        }, {
          _: "or",
          o: [
            {
              _: "and",
              o: [
                {
                  _: "not",
                  o: {_: "=", p: "a", v: 1}
                }
              ]
            }
          ]
        });
      });

      it("should distribute AND over OR - multiple OR terms", function() {
        expectDnf({
          _: "and",
          o: [
            {
              _: "or",
              o: [
                {_: "not", o: {_: "=", p: "a", v: 1}},
                {_: "=", p: "b", v: 1}
              ]
            }
          ]
        }, {
          _: "or",
          o: [
            {
              _: "and",
              o: [
                {_: "not", o: {_: "=", p: "a", v: 1}}
              ]
            },
            {
              _: "and",
              o: [
                {_: "=", p: "b", v: 1}
              ]
            }
          ]
        });
      });

      it("should distribute AND over OR - multiple AND and OR terms", function() {
        expectDnf({
          _: "and",
          o: [
            {
              _: "or",
              o: [
                {_: "=", p: "a", v: 1},
                {_: "=", p: "b", v: 1}
              ]
            },
            {
              _: "or",
              o: [
                {_: "=", p: "c", v: 1},
                {_: "=", p: "d", v: 1}
              ]
            }
          ]
        }, {
          _: "or",
          o: [
            {
              _: "and",
              o: [
                {_: "=", p: "a", v: 1},
                {_: "=", p: "c", v: 1}
              ]
            },
            {
              _: "and",
              o: [
                {_: "=", p: "a", v: 1},
                {_: "=", p: "d", v: 1}
              ]
            },
            {
              _: "and",
              o: [
                {_: "=", p: "b", v: 1},
                {_: "=", p: "c", v: 1}
              ]
            },
            {
              _: "and",
              o: [
                {_: "=", p: "b", v: 1},
                {_: "=", p: "d", v: 1}
              ]
            }
          ]
        });
      });

      it("should allow subtraction", function() {
        expectDnf({
          _: "and",
          o: [
            {_: "=", p: "a", v: 1},
            {
              _: "not",
              o: {
                _: "or",
                o: [
                  {_: "=", p: "a", v: 1},
                  {_: "=", p: "b", v: 2}
                ]
              }
            }
          ]
        }, {
          _: "or"
        });

        var result = {
          _: 'or',
          o: [
            {
              _: 'and',
              o: [
                {_: '=', p: 'a', v: 1 },
                { _: 'not', o: { _: '=', p: 'a', v: 1 }},
                { _: 'not', o: { _: '=', p: 'b', v: 2 }}
              ]
            }
          ]
        };

      });
    });

  }); // pentaho.type.filter.Abstract
});
