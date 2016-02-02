/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  "pentaho/type/list",
  "pentaho/type/value",
  "pentaho/type/number",
  "pentaho/util/error",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Context, listFactory, valueFactory, numberFactory, error, bundle) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true, afterEach:true, jasmine:true, spyOn:true*/

  var context = new Context(),
      Value = context.get(valueFactory),
      List = context.get(listFactory),
      Number = context.get(numberFactory);

  function expectNoChanges(list) {
    expect(list._changes).toBe(null);
    expect(list._changeLevel).toBe(0);
  }

  var NumberList = List.extend({
    meta: {of: Number}
  });

  describe("pentaho.type.List -", function() {

    it("is a function", function() {
      expect(typeof List).toBe("function");
    });

    describe("#of -", function() {

      // NOTE: see also refinement.Spec.js, list usage unit tests

      it("accepts an `of` property be given a type derived from `Element`", function() {
        expect(NumberList.meta.of).toBe(Number.meta);
      });

      it("should throw if given a nully `of` property", function() {
        expect(function() {
          List.extend({
            meta: {of: null}
          });
        }).toThrowError(error.argRequired("of").message);
      });

      it("should inherit the base `of` when unspecified or undefined", function() {
        var DerivedList = List.extend();
        expect(DerivedList.meta.of).toBe(List.meta.of);

        DerivedList = List.extend({meta: {of: undefined}});
        expect(DerivedList.meta.of).toBe(List.meta.of);
      });

      it("should throw if given a null `of` property", function() {
        expect(function() {
          List.extend({
            meta: {of: null}
          });
        }).toThrowError(error.argRequired("of").message);
      });

      it("should throw if given an `of` property of a type not a subtype of `Element`", function() {
        expect(function() {
          List.extend({
            meta: {of: Value}
          });
        }).toThrowError(
            error.argInvalid("of", bundle.structured.errors.list.elemTypeNotSubtypeOfBaseElemType).message);
      });

      it("should throw if set to a different value", function() {
        var SubList = List.extend();

        expect(function() {
          SubList.meta.of = Number;
        }).toThrowError(error.operInvalid("Property 'of' cannot change.").message);
      });

      it("should not throw if set to the same value", function() {
        var SubList = List.extend();

        var elemMeta = SubList.meta.of;
        SubList.meta.of = elemMeta;
        expect(SubList.meta.of).toBe(elemMeta);
      });
    });

    describe("new (spec) -", function() {

      describe("given no arguments", function() {
        it("it should successfully create an instance", function() {
          var list = new NumberList();
          expect(list instanceof NumberList).toBe(true);
        });

        it("it should have 0 elements", function() {
          var list = new NumberList();
          var elems = list._elems;
          expect(elems.length).toBe(0);
        });

        it("should have no changes", function() {
          expectNoChanges(new NumberList());
        });
      });

      describe("given a nully argument", function() {
        it("it should successfully create an instance", function() {
          var list = new NumberList(null);
          expect(list instanceof NumberList).toBe(true);

          list = new NumberList(undefined);
          expect(list instanceof NumberList).toBe(true);
        });

        it("it should have 0 elements", function() {
          var list = new NumberList(null);
          var elems = list._elems;
          expect(elems.length).toBe(0);

          list = new NumberList(undefined);
          elems = list._elems;
          expect(elems.length).toBe(0);
        });

        it("should have no changes", function() {
          expectNoChanges(new NumberList(null));
          expectNoChanges(new NumberList(undefined));
        });
      });

      describe("given an empty array", function() {

        it("it should successfully create an instance", function() {
          var list = new NumberList([]);
          expect(list instanceof NumberList).toBe(true);
        });

        it("it should have 0 elements", function() {
          var list = new NumberList([]);
          var elems = list._elems;
          expect(elems.length).toBe(0);
        });

        it("should have no changes", function() {
          expectNoChanges(new NumberList([]));
        });
      });

      describe("given an array of convertible elements", function() {

        it("it should successfully create an instance", function() {
          var list = new NumberList([1, 2, 3]);
          expect(list instanceof NumberList).toBe(true);
        });

        it("it should have as many elements as those given", function() {
          var list = new NumberList([1, 2, 3]);
          var elems = list._elems;
          expect(elems.length).toBe(3);
        });

        it("it should convert every given value to the list element type", function() {
          var list = new NumberList([1, 2, 3]);
          var elems = list._elems;

          expect(elems[1] instanceof Number).toBe(true);
          expect(elems[0] instanceof Number).toBe(true);
          expect(elems[2] instanceof Number).toBe(true);

          expect(elems[0].value).toBe(1);
          expect(elems[1].value).toBe(2);
          expect(elems[2].value).toBe(3);
        });

        it("should have no changes", function() {
          expectNoChanges(new NumberList([1, 2, 3]));
        });
      });

      describe("given a spec object with a `d` property with an array of convertible elements", function() {

        it("it should successfully create an instance", function() {
          var list = new NumberList({d: [1, 2, 3]});
          expect(list instanceof NumberList).toBe(true);
        });

        it("it should have as many elements as those given", function() {
          var list = new NumberList({d: [1, 2, 3]});
          var elems = list._elems;
          expect(elems.length).toBe(3);
        });

        it("it should convert every given value to the list element type", function() {
          var list = new NumberList({d: [1, 2, 3]});
          var elems = list._elems;

          expect(elems[1] instanceof Number).toBe(true);
          expect(elems[0] instanceof Number).toBe(true);
          expect(elems[2] instanceof Number).toBe(true);

          expect(elems[0].value).toBe(1);
          expect(elems[1].value).toBe(2);
          expect(elems[2].value).toBe(3);
        });

        it("should have no changes", function() {
          expectNoChanges(new NumberList({d: [1, 2, 3]}));
        });
      });

      describe("given another list of convertible elements", function() {

        it("it should successfully create an instance", function() {
          var list1 = new NumberList([1, 2, 3]);
          var list2 = new NumberList(list1);
          expect(list2 instanceof NumberList).toBe(true);
        });

        it("it should have as many elements as those given", function() {
          var list1 = new NumberList([1, 2, 3]);
          var list2 = new NumberList(list1);
          var elems = list2._elems;
          expect(elems.length).toBe(3);
        });

        it("it should convert every given value to the list element type", function() {
          var list1 = new NumberList([1, 2, 3]);
          var list2 = new NumberList(list1);
          var elems = list2._elems;

          expect(elems[1] instanceof Number).toBe(true);
          expect(elems[0] instanceof Number).toBe(true);
          expect(elems[2] instanceof Number).toBe(true);

          expect(elems[0].value).toBe(1);
          expect(elems[1].value).toBe(2);
          expect(elems[2].value).toBe(3);
        });

        it("should have no changes", function() {
          var list1 = new NumberList([1, 2, 3]);
          var list2 = new NumberList(list1);
          expectNoChanges(list2);
        });
      });

      describe("given a spec object with a nully `d` property", function() {
        it("it should successfully create an instance", function() {
          var list = new NumberList({d: null});
          expect(list instanceof NumberList).toBe(true);

          list = new NumberList({d: undefined});
          expect(list instanceof NumberList).toBe(true);
        });

        it("it should have 0 elements", function() {
          var list = new NumberList({d: null});
          var elems = list._elems;
          expect(elems.length).toBe(0);

          list = new NumberList({d: undefined});
          elems = list._elems;
          expect(elems.length).toBe(0);
        });

        it("should have no changes", function() {
          expectNoChanges(new NumberList({d: null}));
        });
      });
    });

    //region read methods
    describe("#uid -", function() {
      it("should return a string value", function() {
        var uid = new List().uid;
        expect(typeof uid).toBe("string");
      });

      it("should have a distinct value for every instance", function() {
        var uid1 = new List().uid,
            uid2 = new List().uid,
            uid3 = new List().uid;
        expect(uid1).not.toBe(uid2);
        expect(uid2).not.toBe(uid3);
        expect(uid3).not.toBe(uid1);
      });
    });

    describe("#key -", function() {
      it("should return the value of #uid", function() {
        var value = new List();
        expect(value.uid).toBe(value.key);
      });
    });

    describe("#count -", function() {
      it("should return 0 when a list is created empty", function() {
        expect(new List().count).toBe(0);
      });

      it("should return 1 when a list is created with one element", function() {
        expect(new NumberList([1]).count).toBe(1);
      });

      it("should return 2 when a list is created with two elements", function() {
        expect(new NumberList([1, 2]).count).toBe(2);
      });
    });

    describe("#at -", function() {
      it("should return the element at a given index when the index is in range", function() {
        var list = new NumberList([1, 2, 3]);

        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
      });

      it("should return `null` when the index is negative", function() {
        var list = new NumberList([1, 2, 3]);

        expect(list.at(-10)).toBe(null);
      });

      it("should return `null` when the index is not less than the number of elements", function() {
        var list = new NumberList([1, 2, 3]);

        expect(list.at(10)).toBe(null);

        list = new NumberList();

        expect(list.at(10)).toBe(null);
      });
    });

    describe("#has(key) -", function() {

      it("should return `true` when a given key is present", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.has("1")).toBe(true);
        expect(list.has("2")).toBe(true);
        expect(list.has("3")).toBe(true);
      });

      it("should return `false` when a given key is nully", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.has(null)).toBe(false);
        expect(list.has(undefined)).toBe(false);
      });

      it("should return `false` when a given key is not present", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.has("4")).toBe(false);
        expect(list.has("5")).toBe(false);
        expect(list.has("6")).toBe(false);
      });

      it("should convert the given value to a string to obtain the key", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.has({toString: function() { return "1"; }})).toBe(true);
        expect(list.has(2)).toBe(true);
        expect(list.has({toString: function() { return "4"; }})).toBe(false);
      });
    });

    describe("#get(key) -", function() {

      it("should return the corresponding element when a given key is present", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.get("1").value).toBe(1);
        expect(list.get("2").value).toBe(2);
        expect(list.get("3").value).toBe(3);
      });

      it("should return `null` when a given key is nully", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.get(null)).toBe(null);
        expect(list.get(undefined)).toBe(null);
      });

      it("should return `null` when a given key is not present", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.get("4")).toBe(null);
        expect(list.get("5")).toBe(null);
        expect(list.get("6")).toBe(null);
      });

      it("should convert the given value to a string to obtain the key", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.get({toString: function() { return "1"; }}).value).toBe(1);
      });
    });

    describe("#includes(elem) -", function() {

      it("should return `true` when a given element is present", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.includes(list.at(0))).toBe(true);
        expect(list.includes(list.at(1))).toBe(true);
        expect(list.includes(list.at(2))).toBe(true);
      });

      it("should return `false` when given a nully element", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.includes(null)).toBe(false);
        expect(list.includes(undefined)).toBe(false);
      });

      it("should return `false` when a given element is not present", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.includes(new Number(4))).toBe(false);
      });

      it("should return `false` when a given element is not present although it is equal", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.includes(new Number(1))).toBe(false);
      });
    });

    describe("#indexOf(elem) -", function() {

      it("should return the corresponding index when a given element is present", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.indexOf(list.at(0))).toBe(0);
        expect(list.indexOf(list.at(1))).toBe(1);
        expect(list.indexOf(list.at(2))).toBe(2);
      });

      it("should return `-1` when given a nully element", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.indexOf(null)).toBe(-1);
        expect(list.indexOf(undefined)).toBe(-1);
      });

      it("should return `-1` when a given element is not present", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.indexOf(new Number(4))).toBe(-1);
      });

      it("should return `-1` when a given element is not present although it is equal", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.indexOf(new Number(1))).toBe(-1);
      });
    });
    //endregion

    //region write methods
    // add or update
    describe("#add(fragment) -", function() {

      it("should add a given array of convertible values to an empty list", function() {

        var list = new NumberList();

        list.add([1, 2, 3]);

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
      });

      it("should append a given array of convertible values to a non-empty list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add([4, 5, 6]);

        expect(list.count).toBe(6);

        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
        expect(list.at(3).value).toBe(4);
        expect(list.at(4).value).toBe(5);
        expect(list.at(5).value).toBe(6);
      });

      it("should ignore nully elements in the given array", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add([4, null, undefined, 6]);

        expect(list.count).toBe(5);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
        expect(list.at(3).value).toBe(4);
        expect(list.at(4).value).toBe(6);
      });

      it("should filter out duplicate values in the given array", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add([4, 4, 5]);

        expect(list.count).toBe(5);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
        expect(list.at(3).value).toBe(4);
        expect(list.at(4).value).toBe(5);
      });

      // TODO: test _update_ on complex type list
      it("should update values in the given array that are already present in the list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add([4, 2, 5]);

        expect(list.count).toBe(5);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
        expect(list.at(3).value).toBe(4);
        expect(list.at(4).value).toBe(5);
      });

      it("should add a distinct convertible value to an empty list", function() {

        var list = new NumberList();

        expect(list.count).toBe(0);

        list.add(4);

        expect(list.count).toBe(1);
        expect(list.at(0).value).toBe(4);
      });

      it("should add a distinct convertible value to a non-empty list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add(4);

        expect(list.count).toBe(4);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
        expect(list.at(3).value).toBe(4);
      });

      it("should be able to get() an added element by key", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add(4);

        expect(list.count).toBe(4);
        expect(list.get("4").value).toBe(4);
      });
    }); // add

    // insert or update
    describe("#insert(fragment, index) -", function() {

      it("should append a given array of convertible values, to an empty list, when index is not specified", function() {

        var list = new NumberList();

        list.insert([1, 2, 3]);

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
      });

      it("should append a given array of convertible values to a non-empty list, when index is not specified", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert([4, 5, 6]);

        expect(list.count).toBe(6);

        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
        expect(list.at(3).value).toBe(4);
        expect(list.at(4).value).toBe(5);
        expect(list.at(5).value).toBe(6);
      });

      it("should insert a given array of convertible values to a non-empty list, at the specified existing index", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert([4, 5, 6], 2);

        expect(list.count).toBe(6);

        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(4);
        expect(list.at(3).value).toBe(5);
        expect(list.at(4).value).toBe(6);
        expect(list.at(5).value).toBe(3);
      });

      it("should insert at the given index, yet ignoring nully elements in the given array", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert([4, null, undefined, 6], 2);

        expect(list.count).toBe(5);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(4);
        expect(list.at(3).value).toBe(6);
        expect(list.at(4).value).toBe(3);
      });

      it("should insert at the given index, yet filter out duplicate values in the given array", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert([4, 4, 5], 2);

        expect(list.count).toBe(5);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(4);
        expect(list.at(3).value).toBe(5);
        expect(list.at(4).value).toBe(3);
      });

      // TODO: test _update_ on complex type list
      it("should update values in the given array that are already present in the list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert([4, 2, 5], 2);

        expect(list.count).toBe(5);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(4);
        expect(list.at(3).value).toBe(5);
        expect(list.at(4).value).toBe(3);
      });

      it("should insert a distinct convertible value to a non-empty list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert(4, 2);

        expect(list.count).toBe(4);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(4);
        expect(list.at(3).value).toBe(3);
      });

      it("should append when the given index is the length of the list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert(4, list.count);

        expect(list.count).toBe(4);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
        expect(list.at(3).value).toBe(4);
      });

      it("should insert at count + index when the given index is negative", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert(4, -1);

        expect(list.count).toBe(4);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(4);
        expect(list.at(3).value).toBe(3);

        list.insert(5, -4);

        expect(list.count).toBe(5);
        expect(list.at(0).value).toBe(5);
        expect(list.at(1).value).toBe(1);
        expect(list.at(2).value).toBe(2);
        expect(list.at(3).value).toBe(4);
        expect(list.at(4).value).toBe(3);

        // min is 0. doesn't go around
        list.insert(6, -6);

        expect(list.count).toBe(6);
        expect(list.at(0).value).toBe(6);
        expect(list.at(1).value).toBe(5);
        expect(list.at(2).value).toBe(1);
        expect(list.at(3).value).toBe(2);
        expect(list.at(4).value).toBe(4);
        expect(list.at(5).value).toBe(3);
      });

      it("should be able to get() an inserted element by key", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert(4, 2);

        expect(list.count).toBe(4);
        expect(list.get("4").value).toBe(4);
      });
    });

    describe("#remove(fragment) -", function() {

      it("should remove a given element that is present in the list", function() {
        var list = new NumberList([1, 2, 3]);
        var elem = list.at(0);
        expect(list.count).toBe(3);

        // ----

        list.remove(elem);

        // ----

        expect(list.count).toBe(2);
        expect(list.has("1")).toBe(false);
        expect(list.at(0).value).toBe(2);
        expect(list.at(1).value).toBe(3);
      });

      it("should remove two elements, given in an array, that are present in the list", function() {
        var list = new NumberList([1, 2, 3, 4]);
        var elem1 = list.at(1);
        var elem2 = list.at(2);
        expect(list.count).toBe(4);

        // ----

        list.remove([elem1, elem2]);

        // ----

        expect(list.count).toBe(2);
        expect(list.has("2")).toBe(false);
        expect(list.has("3")).toBe(false);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(4);
      });

      it("should ignore a given element that is not present in the list", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.remove(new Number(5));

        // ----

        expect(list.count).toBe(4);
      });

      it("should ignore a given element that is not present in the list, although it is equal to one that is", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.remove(new Number(4));

        // ----

        expect(list.count).toBe(4);
      });
    }); // remove

    describe("#removeAt(start, count) -", function() {
      it("should remove the element at the given in-range index when count is 1", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.removeAt(1, 1);

        // ----

        expect(list.count).toBe(3);

        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(3);
        expect(list.at(2).value).toBe(4);
      });

      it("should remove one element at the given in-range index when count is unspecified or nully", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.removeAt(1);

        // ----

        expect(list.count).toBe(3);

        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(3);
        expect(list.at(2).value).toBe(4);

        // ===

        list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        list.removeAt(1, undefined);

        expect(list.count).toBe(3);

        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(3);
        expect(list.at(2).value).toBe(4);

        // ===

        list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        list.removeAt(1, null);

        expect(list.count).toBe(3);

        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(3);
        expect(list.at(2).value).toBe(4);
      });

      it("should remove nothing when count is less than 1", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.removeAt(1, 0);

        // ----

        expect(list.count).toBe(4);

        // ===

        list.removeAt(1, -1);

        // ----

        expect(list.count).toBe(4);
      });

      it("should remove nothing when start is not less than list.count", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.removeAt(4, 1);

        // ----

        expect(list.count).toBe(4);
      });

      it("should remove as many items as count if there exist as many items starting from start", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.removeAt(2, 2);

        // ----

        expect(list.count).toBe(2);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);

        list.removeAt(0, 3);

        // ----

        expect(list.count).toBe(0);
      });

      it("should remove starting from list.count + start when start is negative", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.removeAt(-2, 1);

        // ----

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(4);
      });
    }); // removeAt

    describe("#set(fragment, {noAdd, noUpdate, noRemove, index}) -", function() {
      // TODO: test update on complexes
      it("should append, update and remove, when no options are specified", function() {
        var list = new NumberList([1, 2, 3, 4]);
        spyOn(list, "_updateOne");

        expect(list.count).toBe(4);

        // ---

        list.set([1, 3, 5]);

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(3);
        expect(list.at(2).value).toBe(5);
        expect(list._updateOne.calls.count()).toBe(2);
      });

      it("should append and update but not remove when {noRemove: true}", function() {
        var list = new NumberList([1, 2, 3, 4]);
        spyOn(list, "_updateOne");
        expect(list.count).toBe(4);

        // ---

        list.set([1, 3, 5], {noRemove: true});

        // ---

        expect(list.count).toBe(5);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
        expect(list.at(3).value).toBe(4);
        expect(list.at(4).value).toBe(5);
        expect(list._updateOne.calls.count()).toBe(2);
      });

      it("should update and remove but not add when {noAdd: true}", function() {
        var list = new NumberList([1, 2, 3, 4]);
        spyOn(list, "_updateOne");
        expect(list.count).toBe(4);

        // ---

        list.set([1, 3, 5], {noAdd: true});

        // ---

        expect(list.count).toBe(2);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(3);
        expect(list._updateOne.calls.count()).toBe(2);
      });

      it("should add or remove but not update when {noUpdate: true}", function() {
        var list = new NumberList([1, 2, 3, 4]);
        spyOn(list, "_updateOne");
        expect(list.count).toBe(4);

        // ---

        list.set([5, 1, 3], {noUpdate: true});

        // ---

        expect(list.count).toBe(3);
        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(3);
        expect(list.at(2).value).toBe(5);
        expect(list._updateOne.calls.count()).toBe(0);
      });

      it("should empty the list when given an empty array", function() {
        var list = new NumberList([1, 2, 3, 4]);

        expect(list.count).toBe(4);

        // ---

        list.set([]);

        // ---

        expect(list.count).toBe(0);
      });
    }); // set

    describe("#toArray()", function() {
      it("should return an empty array when the list is empty", function() {
        expect(new NumberList().toArray()).toEqual([]);
      });

      it("should return an array with every element in the list", function() {
        var list = new NumberList([1, 2, 3]);
        var array = list.toArray();

        expect(array.length).toBe(list.count);
        expect(array[0]).toBe(list.at(0));
        expect(array[1]).toBe(list.at(1));
        expect(array[2]).toBe(list.at(2));
      });
    });
    //endregion

    describe("#clone()", function() {
      it("should return a different list instance", function() {
        var list = new List();
        var clone = list.clone();
        expect(clone).not.toBe(list);
      });

      it("should return a list instance with the same count", function() {
        var list = new NumberList([1, 2, 3]);
        var clone = list.clone();
        expect(clone.count).toBe(list.count);
      });

      it("should return a list instance of the same constructor", function() {
        var list = new NumberList([1, 2, 3]);
        var clone = list.clone();
        expect(clone.constructor).toBe(NumberList);
      });

      it("should return a list instance with identical elements", function() {
        var list = new NumberList([1, 2, 3]);
        var clone = list.clone();
        expect(clone.at(0)).toBe(list.at(0));
        expect(clone.at(1)).toBe(list.at(1));
        expect(clone.at(2)).toBe(list.at(2));
      });
    });

    describe("Meta -", function() {
      describe("#list -", function() {
        it("should return the value `true`", function() {
          expect(List.meta.list).toBe(true);
        });
      });

      describe("#refinement -", function() {
        it("should return the value `false`", function() {
          expect(List.meta.refinement).toBe(false);
        });
      });
    });
  });
});
