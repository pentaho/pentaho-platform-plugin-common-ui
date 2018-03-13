/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/Context",
  "pentaho/data/Table",
  "tests/pentaho/util/errorMatch"
], function(Context, DataTable, errorMatch) {

  "use strict";

  describe("pentaho.data.filter.Abstract", function() {

    var context;
    var AbstractFilter;
    var NotFilter;
    var AndFilter;
    var OrFilter;
    var CustomFilter;
    var TrueFilter;
    var FalseFilter;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {

            context = _context;

            return context.getDependencyApplyAsync([
              "pentaho/data/filter/abstract",
              "pentaho/data/filter/not",
              "pentaho/data/filter/and",
              "pentaho/data/filter/or",
              "pentaho/data/filter/true",
              "pentaho/data/filter/false",
              "pentaho/data/filter/isEqual",
              "pentaho/data/filter/isGreater",
              "pentaho/data/filter/isLess"
            ], function(Abstract, Not, And, Or, True, False) {
              AbstractFilter = Abstract;
              NotFilter = Not;
              AndFilter = And;
              OrFilter = Or;
              TrueFilter = True;
              FalseFilter = False;

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
          })
          .then(done, done.fail);
    });

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

    describe("Logical manipulation and simplification", function() {

      function createFilter(spec) {
        return AbstractFilter.type.create(spec);
      }

      function specToDnf(spec) {
        return createFilter(spec).toDnf();
      }

      describe("#toDnf()", function () {

        function expectDnf(specIn, specOut) {
          var fDnf = specToDnf(specIn);

          if (specOut) {
            expect(fDnf.toSpec({forceType: true})).toEqual(specOut);
          }
        }

        it("should convert an empty `or` to false", function () {

          expectDnf({
            _: "or"
          }, {
            _: "false"
          });
        });

        it("should convert an empty `and` to true", function () {

          expectDnf({
            _: "and"
          }, {
            _: "true"
          });
        });

        it("should preserve a filter already in DNF", function () {

          expectDnf({
            _: "or",
            o: [
              {
                _: "and",
                o: [{_: "=", p: "a", v: 1}]
              }
            ]
          }, {
            _: "or",
            o: [
              {
                _: "and",
                o: [{_: "=", p: "a", v: 1}]
              }
            ]
          });
        });

        it("should apply De Morgan Rule 1 - NOT over AND", function () {

          expectDnf({
              _: "not",
              o: {_: "and", o: [{_: "=", p: "a", v: 1}]}
            },
            {
              _: "or",
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

        it("should apply De Morgan Rule 2 - NOT over OR", function () {

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

        it("should eliminate double-negations", function () {

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

        it("should distribute AND over OR", function () {

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

        it("should distribute AND over OR - multiple OR terms", function () {

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

        it("should distribute AND over OR - multiple AND and OR terms", function () {

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

        it("should allow subtraction", function () {

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
            _: "false"
          });
        });

        it("should allow subtraction ii", function () {
          // tuple 1 - {a: 1, b: 2}
          var tuple1 = {
            _: "and",
            o: [
              {_: "=", p: "a", v: 1},
              {_: "=", p: "b", v: 2}
            ]
          };

          // tuple 2 - {a: 3, b: 4}
          var tuple2 = {
            _: "and",
            o: [
              {_: "=", p: "a", v: 3},
              {_: "=", p: "b", v: 4}
            ]
          };

          // tuple 3 - {a: 5, b: 6}
          var tuple3 = {
            _: "and",
            o: [
              {_: "=", p: "a", v: 5},
              {_: "=", p: "b", v: 6}
            ]
          };

          var originalDnf = {_: "or", o: [tuple1, tuple2]}

          var removeDnf = {
            _: "or",
            o: [tuple1, tuple3]
          };

          expectDnf(
            {_: "and", o: [originalDnf, {_: "not", o: removeDnf}]},
            {_: "or", o: [tuple2]});
        });

        it("should not try to subtract or simplify literals other than isEqual", function () {
          // tuple 1 - {a=1, b=2, a>0}
          var tuple1 = {
            _: "and",
            o: [
              {_: "=", p: "a", v: 1},
              {_: "=", p: "b", v: 2},
              {_: ">", p: "a", v: 0}
            ]
          };

          // tuple 2 - {a=3, b=4, a>1}
          var tuple2 = {
            _: "and",
            o: [
              {_: "=", p: "a", v: 3},
              {_: "=", p: "b", v: 4},
              {_: ">", p: "a", v: 1}
            ]
          };

          // tuple 3 - {a!=1, b!=2, a<=5}
          var tuple3 = {
            _: "and",
            o: [
              {_: "not", o: {_: "=", p: "a", v: 1}},
              {_: "not", o: {_: "=", p: "b", v: 2}},
              {_: "not", o: {_: ">", p: "a", v: 5}}
            ]
          };

          // tuple 4 - {a=3, b=4, a>1, a<=5}
          var tuple4 = {
            _: "and",
            o: [
              {_: "=", p: "a", v: 3},
              {_: "=", p: "b", v: 4},
              {_: ">", p: "a", v: 1},
              {_: "<=", p: "a", v: 5}
            ]
          };

          var originalDnf = {_: "or", o: [tuple1, tuple2]}

          var removeDnf = {
            _: "or",
            o: [tuple3]
          };

          var resultDnf = {
            _: "or",
            o: [tuple4]
          };

          expectDnf(
            {_: "and", o: [originalDnf, removeDnf]},
            resultDnf
          );

        });

      });
      describe("#andNot()", function () {

        function expectAndNot(specIn, specSubstract, specOut) {
          var fDnfIn = specToDnf(specIn);
          var fDnfSubtract = specToDnf(specSubstract);

          var fOut = fDnfIn.andNot(fDnfSubtract);

          if (specOut) {
            expect(fOut.toSpec({forceType: true})).toEqual(specOut);
          }
        }

        it("correctly subtracts isEqual predicates", function () {
          // (a=1) or ((a=2) and (b=3))
          var originalSpec = {
            _: "or",
            o: [
              {_: "=", p: "a", v: 1},
              {
                _: "and",
                o: [
                  {_: "=", p: "a", v: 2},
                  {_: "=", p: "b", v: 3}
                ]
              }
            ]
          };

          // a=1
          var subtractSpec1 = {_: "=", p: "a", v: 1};

          // a=2
          var subtractSpec2 = {_: "=", p: "a", v: 2};

          // (a=2) and (b=3)
          var expected1 = {
            _: "or",
            o: [{
              _: "and",
              o: [
                {_: "=", p: "a", v: 2},
                {_: "=", p: "b", v: 3}
              ]
            }]
          };

          // (a=1)
          var expected2 = {
            _: "or",
            o: [{
              _: "and",
              o: [{_: "=", p: "a", v: 1}]
            }]
          };

          expectAndNot(originalSpec, subtractSpec1, expected1);
          expectAndNot(originalSpec, subtractSpec2, expected2);

        });

        it("correctly deals with terminal filters other than isEquals", function(){
           // (b=1) or (a>0) or ((a=2) and (b=3) and (a<5))
          var originalSpec = {
            _: "or",
            o: [
              {_: "=", p: "b", v: 1},
              {_: ">", p: "a", v: 0},
              {
                _: "and",
                o: [
                  {_: "=", p: "a", v: 2},
                  {_: "=", p: "b", v: 3},
                  {_: "<", p: "a", v: 5}
                ]
              }
            ]
          };

          // a=2 or b=1 or a>3
          var subtractSpec = {
            _: "or", o: [
              {_: "=", p: "a", v: 2},
              {_: "=", p: "b", v: 1},
              {_: ">", p: "a", v: 3}
            ]
          };

          // a!=2 and b!=1 and a>0 and a<=3
          var expected = {
            _: "or",
            o:[{
              _: "and",
              o: [
                {_: ">", p: "a", v: 0},
                {_: "not", o: {_: "=", p: "a", v: 2}},
                {_: "not", o: {_: "=", p: "b", v: 1}},
                {_: "<=", p: "a", v: 3}
              ]
            }]
          };

         expectAndNot(originalSpec, subtractSpec, expected);

        });
      });

      describe("#toExtensional()", function() {

        /**
         *
         * @return {pentaho.data.AbstractTable}
         */
        function getTable() {
          return new DataTable({
            model: [
              {name: "Country", type: "string"},
              {name: "Sales", type: "number"},
              {name: "Years", type: "number"}
            ],
            rows: [
              {c: [{v: "Portugal"}, {v: 12000}, {v: 2003}]},
              {c: [{v: "Portugal"}, {v: 6000}, {v: 2004}]},
              {c: [{v: "Spain"}, {v: 12000}, {v: 2003}]},
              {c: [{v: "Spain"}, {v: 1000}, {v: 2005}]}
            ]
          });
        }

        it("Adds a condition on a property not explicitly included in the intentional filter", function () {
          var intentionalFilter = createFilter({_: "=", p: "Country", v: "Portugal"});
          var table = getTable();
          var keyColumns = ["Country", "Years"];

          var actualExtensionalFilter = intentionalFilter.toExtensional(table, keyColumns);
          var expectedExtensionalFilterSpec = {
            _: "or",
            o: [ {_: "and",
                  o: [ {_: "=", p: "Country", v:"Portugal"},
                       {_: "=", p: "Years",   v:2003}]}, // Years added
                 {_: "and",
                  o: [ {_: "=", p: "Country", v:"Portugal"},
                       {_: "=", p: "Years",   v:2004}]}]}; // Years added

          expect(actualExtensionalFilter.toSpec({forceType: true})).toEqual(expectedExtensionalFilterSpec);
        });

        it("An Or filter without operands is considered as False", function () {
          var table = getTable();
          var keyColumns = ["Country"];
          var intentionalFilter = createFilter({_: "or"});

          var actualExtensionalFilter = intentionalFilter.toExtensional(table, keyColumns);

          expect(actualExtensionalFilter instanceof FalseFilter).toBe(true);
        });

        it("If the provided data is empty then the extensional filter should be False", function () {
          var emptyTable = new DataTable();
          var keyColumns = ["Country"];
          var intentionalFilter = createFilter({_: "=", p: "Country", v: "Portugal"});

          var actualExtensionalFilter = intentionalFilter.toExtensional(emptyTable, keyColumns);

          expect(actualExtensionalFilter instanceof FalseFilter).toBe(true);
        });

        it("If the resulting filtered data of the intentional filter is empty then the extensional filter should be False", function () {
          var table = getTable();
          var keyColumns = ["Country"];
          var intentionalFilter = createFilter({_: "=", p: "Country", v: "NonExistingCountry"});

          //verifying assumptions
          expect(table.filter(intentionalFilter).getNumberOfRows()).toEqual(0);

          var actualExtensionalFilter = intentionalFilter.toExtensional(table, keyColumns);

          expect(actualExtensionalFilter instanceof FalseFilter).toBe(true);
        });


        it("If there is data that passes the filter but no KeyColumns are specified then Throw error", function () {
          var table = getTable();
          var emptyKeyColumns = [];
          var intentionalFilter = createFilter({_: "=", p: "Country", v: "Portugal"});

          //verifying assumptions
          expect(table.filter(intentionalFilter).getNumberOfRows()).toBeGreaterThan(0);

          expect(function() {
            intentionalFilter.toExtensional(table, emptyKeyColumns);
          }).toThrow(errorMatch.argInvalid("keyColumnNames"));
        });

      });
    });

  }); // pentaho.data.filter.Abstract
});
