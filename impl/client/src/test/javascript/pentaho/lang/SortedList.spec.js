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
  "pentaho/lang/SortedList",
  "pentaho/lang/List",
  "pentaho/lang/Base"
], function(SortedList, List, Base) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false */

  describe("pentaho.lang.SortedList -", function() {
    it("should be defined", function() {
      expect(SortedList).toBeDefined();
    });

    describe("untyped use", function() {
      var reverseSort = function(e1, e2) {
        var v1 = e1.valueOf();
        var v2 = e2.valueOf();

        return v1 === v2 ? 0 : (v1 > v2 ? -1 : 1);
      };

      var unsortedValues;

      var expectedDefaultOrder;
      var expectedCustomOrder;

      beforeEach(function() {
        unsortedValues = [5, 2, 3, 6, 1, 4];
        expectedDefaultOrder = [1, 2, 3, 4, 5, 6];
        expectedCustomOrder = [6, 5, 4, 3, 2, 1];
      });

      describe("construction", function() {
        describe("constructor", function() {
          var list;

          beforeEach(function() {
            list = new SortedList();
          });

          it("should be defined", function() {
            expect(list).toBeDefined();
          });

          it("should be a SortedList", function() {
            expect(list instanceof SortedList).toBe(true);
          });

          it("should be a List", function() {
            expect(list instanceof List).toBe(true);
          });

          it("should be a Array", function() {
            expect(list instanceof Array).toBe(true);
          });
        });

        describe("cast with .to(...)", function() {
          var list;

          beforeEach(function() {
            list = SortedList.to([1, 2]);
          });

          it("should be a SortedList", function() {
            expect(list instanceof SortedList).toBe(true);
          });

          it("should be a List", function() {
            expect(list instanceof List).toBe(true);
          });

          it("should be a Array", function() {
            expect(list instanceof Array).toBe(true);
          });
        });
      });

      describe("default sort", function() {
        describe("sort on cast with .to(...)", function() {
          var list;

          beforeEach(function() {
            list = SortedList.to(unsortedValues);
          });

          it("should be sorted", function() {
            expect(list.slice()).toEqual(expectedDefaultOrder);
          });
        });

        describe("sort on push", function() {
          var list;

          beforeEach(function() {
            list = new SortedList();
          });

          it("should sort on push", function() {
            unsortedValues.forEach(function(e) {
              list.push(e);
            });

            expect(list.slice()).toEqual(expectedDefaultOrder);
          });

          it("should sort on multi-value push", function() {
            list.push(5, 2, 3, 6, 1, 4);

            expect(list.slice()).toEqual([1, 2, 3, 4, 5, 6]);
          });

          it("should accept null values", function() {
            list.push(3, 2, null, 1);

            expect(list.slice()).toEqual([null, 1, 2, 3]);
          });

          it("should ignore undefined values", function() {
            list.push(3, 2, undefined, 1);

            expect(list.slice()).toEqual([1, 2, 3]);
          });

          it("should accept repeated values", function() {
            list.push(3, 3, 3, 3, 5, 1);

            expect(list.slice()).toEqual([1, 3, 3, 3, 3, 5]);
          });
        });
      });

      describe("custom sort", function() {
        describe("sort on cast with .to(...)", function() {
          var list;

          beforeEach(function() {
            list = SortedList.to(unsortedValues, {"comparer": reverseSort});
          });

          it("should be sorted", function() {
            expect(list.slice()).toEqual(expectedCustomOrder);
          });
        });

        describe("sort on push", function() {
          var list;

          beforeEach(function() {
            list = new SortedList({"comparer": reverseSort});
          });

          it("should sort on push", function() {
            unsortedValues.forEach(function(e) {
              list.push(e);
            });

            expect(list.slice()).toEqual(expectedCustomOrder);
          });
        });
      });
    });

    describe("typed use", function() {
      var elementSort = function(e1, e2) {
        if (e1 == null || e2 == null) {
          if (e1 != null) {
            return 1;
          }

          if (e2 != null) {
            return -1;
          }

          return 0;
        }

        // order by increment and only then by index
        var v1 = e1.increment;
        var v2 = e2.increment;

        if (v1 === v2) {
          v1 = e1.index;
          v2 = e2.index;
        }

        return v1 === v2 ? 0 : (v1 > v2 ? 1 : -1);
      };

      var Element = Base.extend({
        index: 0,
        increment: 0,

        constructor: function(index, increment) {
          this.index = index;
          this.increment = increment || 0;
        },

        toString: function() {
          return this.index + " (" + this.increment + ")";
        }
      }, {
        to: function(value) {
          if (value instanceof Element) {
            return value;
          }

          if (typeof value === 'number') {
            return new Element(value);
          }

          if (value === null) {
            return null;
          }
        }
      });

      var e1 = new Element(1, 2);
      var e2 = new Element(2, 2);
      var e3 = new Element(3, 1);
      var e4 = new Element(4, 3);
      var e5 = new Element(5, 2);
      var e6 = new Element(6, 3);

      var unsortedValues;

      var expectedDefaultOrder;
      var expectedCustomOrder;

      var SortedElements = SortedList.extend({
        elemClass: Element
      });

      beforeEach(function() {
        unsortedValues = [e5, e2, e3, e6, e1, e4];
        expectedDefaultOrder = [e1, e2, e3, e4, e5, e6];
        expectedCustomOrder = [e3, e1, e2, e5, e4, e6];
      });

      describe("construction", function() {
        describe("constructor", function() {
          var list;

          beforeEach(function() {
            list = new SortedElements();
          });

          it("should be defined", function() {
            expect(list).toBeDefined();
          });

          it("should be a SortedElements", function() {
            expect(list instanceof SortedElements).toBe(true);
          });

          it("should be a SortedList", function() {
            expect(list instanceof SortedList).toBe(true);
          });

          it("should be a List", function() {
            expect(list instanceof List).toBe(true);
          });

          it("should be a Array", function() {
            expect(list instanceof Array).toBe(true);
          });
        });

        describe("cast with .to(...)", function() {
          var list;

          beforeEach(function() {
            list = SortedElements.to([1, 2]);
          });

          it("should be a SortedElements", function() {
            expect(list instanceof SortedElements).toBe(true);
          });

          it("should be a SortedList", function() {
            expect(list instanceof SortedList).toBe(true);
          });

          it("should be a List", function() {
            expect(list instanceof List).toBe(true);
          });

          it("should be a Array", function() {
            expect(list instanceof Array).toBe(true);
          });

          it("should cast elements", function() {
            expect(list[0] instanceof Element).toBe(true);
            expect(list[1] instanceof Element).toBe(true);
          });
        });
      });

      describe("default sort", function() {
        describe("sort on cast with .to(...)", function() {
          var list;

          beforeEach(function() {
            list = SortedElements.to(unsortedValues);
          });

          it("should be sorted", function() {
            expect(list.slice()).toEqual(expectedDefaultOrder);
          });
        });

        describe("sort on push", function() {
          var list;

          beforeEach(function() {
            list = new SortedElements();
          });

          it("should sort on push", function() {
            unsortedValues.forEach(function(e) {
              list.push(e);
            });

            expect(list.slice()).toEqual(expectedDefaultOrder);
          });
        });
      });

      describe("custom sort", function() {
        describe("sort on cast with .to(...)", function() {
          var list;

          beforeEach(function() {
            list = SortedElements.to(unsortedValues, {"comparer": elementSort});
          });

          it("should be sorted", function() {
            expect(list.slice()).toEqual(expectedCustomOrder);
          });
        });

        describe("sort on push", function() {
          var list;

          beforeEach(function() {
            list = new SortedElements({"comparer": elementSort});
          });

          it("should sort on push", function() {
            unsortedValues.forEach(function(e) {
              list.push(e);
            });

            expect(list.slice()).toEqual(expectedCustomOrder);
          });
        });
      });
    });

    describe("changing sort function", function() {
      var customSortFunction = function() {};

      it("should call sort when changing", function() {
        var list = new SortedList();
        spyOn(list, 'sort');

        list.comparer = customSortFunction;

        expect(list.sort).toHaveBeenCalledTimes(1);

        list.comparer = null;

        expect(list.sort).toHaveBeenCalledTimes(2);
      });

      it("should not call sort when not changing", function() {
        var list = new SortedList({"comparer": customSortFunction});
        spyOn(list, 'sort');

        list.comparer = customSortFunction;

        expect(list.sort).not.toHaveBeenCalled();
      });

      it("should return to the default function when setting null", function() {
        var list = new SortedList({"comparer": customSortFunction});

        expect(list.comparer).not.toEqual(SortedList.prototype.comparer);

        list.comparer = null;

        expect(list.comparer).toEqual(SortedList.prototype.comparer);
      });

      it("should return to default function when setting undefined", function() {
        var list = new SortedList({"comparer": customSortFunction});

        expect(list.comparer).not.toEqual(SortedList.prototype.comparer);

        list.comparer = undefined;

        expect(list.comparer).toEqual(SortedList.prototype.comparer);
      });

      it("should keep default function when setting null", function() {
        var list = new SortedList();

        expect(list.comparer).toEqual(SortedList.prototype.comparer);

        list.comparer = null;

        expect(list.comparer).toEqual(SortedList.prototype.comparer);
      });

      it("should keep default function when setting undefined", function() {
        var list = new SortedList();

        expect(list.comparer).toEqual(SortedList.prototype.comparer);

        list.comparer = undefined;

        expect(list.comparer).toEqual(SortedList.prototype.comparer);
      });
    });

    describe("restrictions", function() {
      var sortingFunction = function() {
        return -1;
      };

      var list;

      beforeEach(function() {
        list = new SortedList({"comparer": sortingFunction});
      });

      it("should throw if calling insert", function() {
        expect(function() {
          list.insert(5, 0);
        }).toThrowError();
      });

      it("should throw if calling replace", function() {
        expect(function() {
          list.replace(5, 0, 6);
        }).toThrowError();
      });

      it("should throw if adding elements with splice", function() {
        expect(function() {
          list.splice(1, 0, 6, 7, 8);
        }).toThrowError();
      });

      it("should not throw if calling splice without adding elements", function() {
        expect(function() {
          list.splice(0, 0);
        }).not.toThrowError();
      });

      it("should throw calling sort with a different sorting function", function() {
        expect(function() {
          list.sort(function() {
            return 0;
          });
        }).toThrowError();
      });

      it("should not throw if sort without a different sorting function", function() {
        expect(function() {
          list.sort();
          list.sort(sortingFunction);
        }).not.toThrowError();
      });

      it("should throw if calling copyWithin", function() {
        expect(function() {
          list.copyWithin(0, 1, 6);
        }).toThrowError();
      });

      it("should throw if calling fill", function() {
        expect(function() {
          list.fill(5);
        }).toThrowError();
      });

      it("should throw if calling reverse", function() {
        expect(function() {
          list.reverse();
        }).toThrowError();
      });

      it("should throw if calling unshift", function() {
        expect(function() {
          list.unshift(5);
        }).toThrowError();
      });
    });
  });
});
