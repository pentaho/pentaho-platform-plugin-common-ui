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
  "pentaho/type/Context",
  "pentaho/type/list",
  "pentaho/type/value",
  "pentaho/type/number",
  "pentaho/type/string",
  "pentaho/type/complex",
  "pentaho/util/fun",
  "tests/pentaho/util/errorMatch"
], function(Context, listFactory, valueFactory, numberFactory, stringFactory, complexFactory, fun, errorMatch) {

  "use strict";

  /* global describe:true, it:true, expect:true, beforeEach:true, afterEach:true, jasmine:true, spyOn:true,
    TypeError:true */

  var context = new Context();
  var Value = context.get(valueFactory);
  var List = context.get(listFactory);
  var Complex = context.get(complexFactory);
  var PentahoNumber = context.get(numberFactory);

  function expectNoChanges(list) {
    expect(list.$changeset).toBe(null);
  }

  var NumberList = List.extend({
    type: {of: PentahoNumber}
  });

  describe("pentaho.type.List -", function() {

    function _expectEqualValueAt(list, checkValues) {
      var L = checkValues.length;
      expect(list.count).toBe(L);
      for(var i = 0; i < L; i++) {
        expect(list.at(i).value).toBe(checkValues[i]);
      }
    }

    it("is a function", function() {
      expect(typeof List).toBe("function");
    });

    // region #of
    describe("#of -", function() {

      it("accepts an `of` property be given a type derived from `Element`", function() {
        expect(NumberList.type.of).toBe(PentahoNumber.type);
      });

      it("should throw if given a nully `of` property", function() {
        expect(function() {
          List.extend({
            type: {of: null}
          });
        }).toThrow(errorMatch.argRequired("of"));
      });

      it("should inherit the base `of` when unspecified or undefined", function() {
        var DerivedList = List.extend();
        expect(DerivedList.type.of).toBe(List.type.of);

        DerivedList = List.extend({type: {of: undefined}});
        expect(DerivedList.type.of).toBe(List.type.of);
      });

      it("should throw if given a null `of` property", function() {
        expect(function() {
          List.extend({
            type: {of: null}
          });
        }).toThrow(errorMatch.argRequired("of"));
      });

      it("should throw if given an `of` property of a type not a subtype of `Element`", function() {
        expect(function() {
          List.extend({
            type: {of: Value}
          });
        }).toThrow(errorMatch.argInvalid("of"));
      });

      it("should throw if set to a different value", function() {
        var SubList = List.extend();

        expect(function() {
          SubList.type.of = PentahoNumber;
        }).toThrow(errorMatch.operInvalid());
      });

      it("should not throw if set to the same value", function() {
        var SubList = List.extend();

        var elemType = SubList.type.of;
        SubList.type.of = elemType;
        expect(SubList.type.of).toBe(elemType);
      });
    }); // endregion #of

    // region constructor
    describe("new (spec) -", function() {

      describe("given no arguments", function() {
        it("it should successfully create an instance", function() {
          var list = new NumberList();
          expect(list instanceof NumberList).toBe(true);
        });

        it("it should have 0 elements", function() {
          var list = new NumberList();
          var elems = list.__elems;
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
          var elems = list.__elems;
          expect(elems.length).toBe(0);

          list = new NumberList(undefined);
          elems = list.__elems;
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
          var elems = list.__elems;
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
          var elems = list.__elems;
          expect(elems.length).toBe(3);
        });

        it("it should convert every given value to the list element type", function() {
          var list = new NumberList([1, 2, 3]);
          var elems = list.__elems;

          expect(elems[1] instanceof PentahoNumber).toBe(true);
          expect(elems[0] instanceof PentahoNumber).toBe(true);
          expect(elems[2] instanceof PentahoNumber).toBe(true);

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
          var elems = list.__elems;
          expect(elems.length).toBe(3);
        });

        it("it should convert every given value to the list element type", function() {
          var list = new NumberList({d: [1, 2, 3]});
          var elems = list.__elems;

          expect(elems[1] instanceof PentahoNumber).toBe(true);
          expect(elems[0] instanceof PentahoNumber).toBe(true);
          expect(elems[2] instanceof PentahoNumber).toBe(true);

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
          var elems = list2.__elems;
          expect(elems.length).toBe(3);
        });

        it("it should convert every given value to the list element type", function() {
          var list1 = new NumberList([1, 2, 3]);
          var list2 = new NumberList(list1);
          var elems = list2.__elems;

          expect(elems[1] instanceof PentahoNumber).toBe(true);
          expect(elems[0] instanceof PentahoNumber).toBe(true);
          expect(elems[2] instanceof PentahoNumber).toBe(true);

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
          var elems = list.__elems;
          expect(elems.length).toBe(0);

          list = new NumberList({d: undefined});
          elems = list.__elems;
          expect(elems.length).toBe(0);
        });

        it("should have no changes", function() {
          expectNoChanges(new NumberList({d: null}));
        });
      });
    }); // endregion constructor

    // region read methods
    describe("#$uid -", function() {
      it("should return a string value", function() {
        var uid = new List().$uid;
        expect(typeof uid).toBe("string");
      });

      it("should have a distinct value for every instance", function() {
        var uid1 = new List().$uid;
        var uid2 = new List().$uid;
        var uid3 = new List().$uid;
        expect(uid1).not.toBe(uid2);
        expect(uid2).not.toBe(uid3);
        expect(uid3).not.toBe(uid1);
      });
    });

    describe("#$key -", function() {
      it("should return the value of #uid", function() {
        var value = new List();
        expect(value.$uid).toBe(value.$key);
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
      it("should throw when the index is nully", function() {
        var list = new NumberList([1, 2, 3]);

        expect(function() {
          list.at(null);
        }).toThrow(errorMatch.argRequired("index"));

        expect(function() {
          list.at(undefined);
        }).toThrow(errorMatch.argRequired("index"));
      });

      it("should return the element at a given index when the index is in range", function() {
        var list = new NumberList([1, 2, 3]);

        expect(list.at(0).value).toBe(1);
        expect(list.at(1).value).toBe(2);
        expect(list.at(2).value).toBe(3);
      });

      it("should return null when the index is negative", function() {
        var list = new NumberList([1, 2, 3]);

        expect(list.at(-2)).toBe(null);
      });

      it("should return null when the index is not less than the number of elements", function() {
        var list = new NumberList([1, 2, 3]);

        expect(list.at(10)).toBe(null);
      });

      it("should return null when the index is positive and there are no elements", function() {
        var list = new NumberList();

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
        expect(list.includes(new PentahoNumber(4))).toBe(false);
      });

      it("should return `false` when a given element is not present although it is equal", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.includes(new PentahoNumber(1))).toBe(false);
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
        expect(list.indexOf(new PentahoNumber(4))).toBe(-1);
      });

      it("should return `-1` when a given element is not present although it is equal", function() {
        var list = new NumberList([1, 2, 3]);
        expect(list.indexOf(new PentahoNumber(1))).toBe(-1);
      });
    });

    describe("#each(fun, ctx)", function() {

      it("should call `fun` for every element of the list, in order", function() {
        var list = new NumberList([10, 20, 30]);

        var fun = jasmine.createSpy();

        list.each(fun);

        var calls = fun.calls.all();
        expect(calls.length).toBe(3);

        expect(calls[0].args.length).toBe(3);
        expect(calls[0].args[0].value).toBe(10);
        expect(calls[0].args[1]).toBe(0);
        expect(calls[0].args[2]).toBe(list);

        expect(calls[1].args.length).toBe(3);
        expect(calls[1].args[0].value).toBe(20);
        expect(calls[1].args[1]).toBe(1);
        expect(calls[1].args[2]).toBe(list);

        expect(calls[2].args.length).toBe(3);
        expect(calls[2].args[0].value).toBe(30);
        expect(calls[2].args[1]).toBe(2);
        expect(calls[2].args[2]).toBe(list);
      });

      it("should call `fun` with the specified `ctx`", function() {
        var list = new NumberList([10]);

        var fun = jasmine.createSpy();
        var ctx = {};
        list.each(fun, ctx);

        var calls = fun.calls.all();
        expect(fun.calls.first().object).toBe(ctx);
      });

      it("should stop iteration if `fun` returns `false`", function() {
        var list = new NumberList([10, 20, 30]);

        var fun = jasmine.createSpy().and.callFake(function(v, i) {
          if(i === 1) return false;
        });

        list.each(fun);

        expect(fun.calls.count()).toBe(2);
      });
    });
    // endregion

    // region isReadOnly
    describe("#isReadOnly", function() {

      it("should be false by default", function() {
        var list = new NumberList();

        expect(list.isReadOnly).toBe(false);
      });

      it("should allow creating a read-only list by specifying keyArgs.isReadOnly: true", function() {

        var list = new NumberList(null, {isReadOnly: true});

        expect(list.isReadOnly).toBe(true);
      });
    });
    // endregion

    // region write methods

    // add or update
    // region #add(fragment)
    describe("#add(fragment) -", function() {

      it("should add a given array of convertible values to an empty list", function() {

        var list = new NumberList();

        list.add([1, 2, 3]);
        _expectEqualValueAt(list, [1, 2, 3]);
      });

      it("should throw a TypeError if list is read-only", function() {

        var list = new NumberList(null, {isReadOnly: true});

        expect(function() {
          list.add([1, 2, 3]);
        }).toThrowError(TypeError);

        expect(list.count).toBe(0);
      });

      it("should append a given array of convertible values to a non-empty list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add([4, 5, 6]);
        _expectEqualValueAt(list, [1, 2, 3, 4, 5, 6]);
      });

      it("should ignore nully elements in the given array", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add([4, null, undefined, 6]);
        _expectEqualValueAt(list, [1, 2, 3, 4, 6]);
      });

      it("should filter out duplicate values in the given array", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add([4, 4, 5]);
        _expectEqualValueAt(list, [1, 2, 3, 4, 5]);
      });

      // TODO: test _update_ on complex type list
      it("should update values in the given array that are already present in the list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add([4, 2, 5]);
        _expectEqualValueAt(list, [1, 2, 3, 4, 5]);
      });

      it("should add a distinct convertible value to an empty list", function() {

        var list = new NumberList();

        expect(list.count).toBe(0);

        list.add(4);
        _expectEqualValueAt(list, [4]);
      });

      it("should add a distinct convertible value to a non-empty list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add(4);
        _expectEqualValueAt(list, [1, 2, 3, 4]);
      });

      it("should be able to get() an added element by key", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.add(4);
        expect(list.count).toBe(4);
        expect(list.get("4").value).toBe(4);
      });

      it("should only append the values not present in the list and update the values already present", function() {

        var list = new NumberList([1, 5, 10, 11, 40]);

        expect(list.count).toBe(5);

        list.add([5, 11, 2, 3, 1, 10]);
        _expectEqualValueAt(list, [1, 5, 10, 11, 40, 2, 3]);
      });
    }); // endregion #add

    // insert or update
    // region #insert(fragment, index)
    describe("#insert(fragment, index) -", function() {
      it("should emit will and did change events on the containing complex object", function() {

        var Derived = Complex.extend({
          type: {
            props: {
              foo: {valueType: NumberList}
            }
          }
        });

        var derived = new Derived();

        var listeners = jasmine.createSpyObj("listeners", ["will", "did", "rejected"]);
        derived.on("will:change", listeners.will);
        derived.on("rejected:change", listeners.rejected);
        derived.on("did:change", listeners.did);

        var list = derived.get("foo");

        list.insert([1, 2, 3]);

        // ----

        expect(listeners.will).toHaveBeenCalled();
        expect(listeners.did).toHaveBeenCalled();
        expect(listeners.rejected).not.toHaveBeenCalled();
      });

      it("should append a given array of convertible values, to an empty list, when index is not specified",
      function() {

        var list = new NumberList();

        list.insert([1, 2, 3]);
        _expectEqualValueAt(list, [1, 2, 3]);
      });

      it("should throw a TypeError if list is read-only", function() {

        var list = new NumberList(null, {isReadOnly: true});

        expect(function() {
          list.insert([1, 2, 3]);
        }).toThrowError(TypeError);

        expect(list.count).toBe(0);
      });

      it("should append a given array of convertible values to a non-empty list, when index is not specified",
      function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert([4, 5, 6]);
        _expectEqualValueAt(list, [1, 2, 3, 4, 5, 6]);
      });

      it("should insert a given array of convertible values to a non-empty list, at the specified existing index",
      function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert([4, 5, 6], 2);
        _expectEqualValueAt(list, [1, 2, 4, 5, 6, 3]);
      });

      it("should insert at the given index, yet ignoring nully elements in the given array", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert([4, null, undefined, 6], 2);
        _expectEqualValueAt(list, [1, 2, 4, 6, 3]);
      });

      it("should insert at the given index, yet filter out duplicate values in the given array", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert([4, 4, 5], 2);
        _expectEqualValueAt(list, [1, 2, 4, 5, 3]);
      });

      // TODO: test _update_ on complex type list
      it("should update values in the given array that are already present in the list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert([4, 2, 5], 2);
        _expectEqualValueAt(list, [1, 2, 4, 5, 3]);
      });

      it("should insert a distinct convertible value to a non-empty list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert(4, 2);
        _expectEqualValueAt(list, [1, 2, 4, 3]);
      });

      it("should append when the given index is the length of the list", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert(4, list.count);
        _expectEqualValueAt(list, [1, 2, 3, 4]);
      });

      it("should insert at count + index when the given index is negative", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert(4, -1);
        _expectEqualValueAt(list, [1, 2, 4, 3]);

        list.insert(5, -4);
        _expectEqualValueAt(list, [5, 1, 2, 4, 3]);

        // min is 0. doesn't go around
        list.insert(6, -6);
        _expectEqualValueAt(list, [6, 5, 1, 2, 4, 3]);
      });

      it("should be able to get() an inserted element by key", function() {

        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        list.insert(4, 2);

        expect(list.count).toBe(4);
        expect(list.get("4").value).toBe(4);
      });

      it("should only insert the values not present in the list, at the specified existing index and " +
         "update the values already present", function() {
        var list = new NumberList([1, 5, 10, 11, 40]);

        expect(list.count).toBe(5);

        list.insert([5, 11, 2, 3, 1, 10], 1);
        _expectEqualValueAt(list, [1, 2, 3, 5, 10, 11, 40]);
      });
    }); // endregion #insert

    // region #remove(fragment)
    describe("#remove(fragment) -", function() {
      it("should emit will and did change events on the containing complex object", function() {

        var Derived = Complex.extend({
          type: {
            props: {
              foo: {valueType: NumberList, defaultValue: [1, 2, 3]}
            }
          }
        });

        var derived = new Derived();

        var listeners = jasmine.createSpyObj("listeners", ["will", "did", "rejected"]);
        derived.on("will:change", listeners.will);
        derived.on("rejected:change", listeners.rejected);
        derived.on("did:change", listeners.did);

        var list = derived.foo;

        list.remove(list.at(0));

        // ----

        expect(listeners.will).toHaveBeenCalled();
        expect(listeners.did).toHaveBeenCalled();
        expect(listeners.rejected).not.toHaveBeenCalled();
      });

      it("should throw a TypeError if list is read-only", function() {

        var list = new NumberList([1, 2, 3], {isReadOnly: true});

        expect(function() {
          list.remove([1]);
        }).toThrowError(TypeError);

        expect(list.count).toBe(3);
      });

      it("should remove a given element that is present in the list", function() {
        var list = new NumberList([1, 2, 3]);
        var elem = list.at(0);
        expect(list.count).toBe(3);

        // ----

        list.remove(elem);

        // ----

        expect(list.has("1")).toBe(false);
        _expectEqualValueAt(list, [2, 3]);
      });

      it("should remove two elements, given in an array, that are present in the list", function() {
        var list = new NumberList([0, 1, 2, 3]);
        var elem1 = list.at(1);
        var elem2 = list.at(2);
        expect(list.count).toBe(4);

        // ----

        list.remove([elem1, elem2]);

        // ----

        expect(list.has("1")).toBe(false);
        expect(list.has("2")).toBe(false);
        _expectEqualValueAt(list, [0, 3]);
      });

      it("should remove two blocks of two elements, given in an array, that are present in the list", function() {
        var list = new NumberList([1, 2, 3, 4, 5]);
        var elem0 = list.at(0);
        var elem1 = list.at(1);
        var elem3 = list.at(3);
        var elem4 = list.at(4);
        expect(list.count).toBe(5);

        // ----

        list.remove([elem0, elem1, elem3, elem4]);

        // ----

        expect(list.has("1")).toBe(false);
        expect(list.has("2")).toBe(false);
        expect(list.has("3")).toBe(true);
        expect(list.has("4")).toBe(false);
        expect(list.has("5")).toBe(false);
        _expectEqualValueAt(list, [3]);
      });

      it("should ignore a given element that is not present in the list", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.remove(new PentahoNumber(5));

        // ----

        expect(list.count).toBe(4);
      });

    }); // endregion #remove

    // region #clear()
    describe("#clear() -", function() {
      it("should emit will and did change events on the containing complex object", function() {

        var Derived = Complex.extend({
          type: {
            props: {
              foo: {valueType: NumberList, defaultValue: [1, 2, 3]}
            }
          }
        });

        var derived = new Derived();

        var listeners = jasmine.createSpyObj("listeners", ["will", "did", "rejected"]);
        derived.on("will:change", listeners.will);
        derived.on("rejected:change", listeners.rejected);
        derived.on("did:change", listeners.did);

        derived.foo.clear();

        // ----

        expect(listeners.will).toHaveBeenCalled();
        expect(listeners.did).toHaveBeenCalled();
        expect(listeners.rejected).not.toHaveBeenCalled();
      });

      it("should clear all elements of the list", function() {
        var list = new NumberList([1, 2, 3]);

        expect(list.count).toBe(3);

        // ----

        list.clear();

        // ----

        expect(list.count).toBe(0);
      });

      it("should throw a TypeError if list is read-only", function() {

        var list = new NumberList([1, 2, 3], {isReadOnly: true});

        expect(function() {
          list.clear();
        }).toThrowError(TypeError);

        expect(list.count).toBe(3);
      });
    }); // endregion #clear

    // region #removeAt(start, count[, silent])
    describe("#removeAt(start, count[, silent]) -", function() {
      it("should emit will and did change events on the containing complex object", function() {

        var Derived = Complex.extend({
          type: {
            props: {
              foo: {valueType: NumberList, defaultValue: [1, 2, 3, 4]}
            }
          }
        });

        var derived = new Derived();

        var listeners = jasmine.createSpyObj("listeners", ["will", "did", "rejected"]);
        derived.on("will:change", listeners.will);
        derived.on("rejected:change", listeners.rejected);
        derived.on("did:change", listeners.did);

        derived.foo.removeAt(1, 1);

        // ----

        expect(listeners.will).toHaveBeenCalled();
        expect(listeners.did).toHaveBeenCalled();
        expect(listeners.rejected).not.toHaveBeenCalled();
      });

      it("should throw a TypeError if list is read-only", function() {

        var list = new NumberList([1, 2, 3], {isReadOnly: true});

        expect(function() {
          list.removeAt(1);
        }).toThrowError(TypeError);

        expect(list.count).toBe(3);
      });

      it("should remove the element at the given in-range index when count is 1", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.removeAt(1, 1);

        // ----

        _expectEqualValueAt(list, [1, 3, 4]);
      });

      it("should remove one element at the given in-range index when count is unspecified or nully", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ----

        list.removeAt(1);

        // ----

        _expectEqualValueAt(list, [1, 3, 4]);

        // ===

        list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        list.removeAt(1, undefined);

        _expectEqualValueAt(list, [1, 3, 4]);

        // ===

        list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        list.removeAt(1, null);

        _expectEqualValueAt(list, [1, 3, 4]);
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

        _expectEqualValueAt(list, [1, 2]);

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

        _expectEqualValueAt(list, [1, 2, 4]);
      });
    }); // endregion #removeAt

    // region #set(fragment, {noAdd, noUpdate, noRemove, noMove, index})
    describe("#set(fragment, {noAdd, noUpdate, noRemove, noMove, index}) -", function() {

      it("should throw a TypeError if list is read-only", function() {

        var list = new NumberList([1, 2, 3], {isReadOnly: true});

        expect(function() {
          list.set([1, 2]);
        }).toThrowError(TypeError);

        expect(list.count).toBe(3);
      });

      it("preserves the order of new elements when they are simple objects", function() {

        var list = new NumberList();
        var spec = [1, 2, 3, 4];
        list.set(spec);
        expect(list.toSpec()).toEqual(spec);
      });

      it("preserves the order of new elements when they are complex objects", function() {
        var MyComplex = Complex.extend({
          type: {
            props: [{
              name: "k",
              valueType: "number"
            }]
          }
        });

        var ComplexList = List.extend({
          type: {of: MyComplex}
        });

        var list = new ComplexList();
        var spec = [{
          k: 1
        }, {
          k: 2
        }, {
          k: 3
        }, {
          k: 4
        }];
        list.set(spec);
        expect(list.toSpec()).toEqual(spec);
      });

      // TODO: test update on complexes
      it("should append, update, remove and move, when no options are specified", function() {
        var list = new NumberList([1, 5, 10, 11, 40]);
        expect(list.count).toBe(5);

        // ---

        list.set([5, 11, 2, 3, 1, 10]);

        // ---

        _expectEqualValueAt(list, [5, 11, 2, 3, 1, 10]);
      });

      it("should append and update but not remove when {noRemove: true}", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ---

        list.set([1, 3, 5], {noRemove: true});

        // ---

        _expectEqualValueAt(list, [1, 2, 3, 4, 5]);
      });

      it("should update and remove but not add when {noAdd: true}", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ---

        list.set([1, 3, 5], {noAdd: true});

        // ---

        _expectEqualValueAt(list, [1, 3]);
      });

      it("should add or remove but not update when {noUpdate: true}", function() {
        var list = new NumberList([1, 2, 3, 4]);
        expect(list.count).toBe(4);

        // ---

        list.set([5, 1, 3], {noUpdate: true});

        // ---

        _expectEqualValueAt(list, [5, 1, 3]);
      });

      it("should modify the ordering of the elements", function() {
        var list = new NumberList([1, 2, 3, 4]);

        list.set([1, 3, 2, 4]);

        _expectEqualValueAt(list, [1, 3, 2, 4]);
      });

      it("should modify the ordering of the elements when {noRemove: true}", function() {
        var list = new NumberList([1, 2, 3, 4]);

        list.set([3, 2], {noRemove: true});

        _expectEqualValueAt(list, [1, 3, 2, 4]);
      });

      it("should empty the list when given an empty array", function() {
        var list = new NumberList([1, 2, 3, 4]);

        expect(list.count).toBe(4);

        // ---

        list.set([]);

        // ---

        expect(list.count).toBe(0);
      });
    }); // endregion set

    // region #toArray
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

      it("should call the given map function for each element and return an array of its results", function() {
        var list = new NumberList([1, 2, 3]);
        var array = list.toArray(function(v) { return v * 2; });

        expect(array.length).toBe(list.count);
        expect(array[0]).toBe(2);
        expect(array[1]).toBe(4);
        expect(array[2]).toBe(6);
      });

      it("should call the given map function on the specified JS context object", function() {
        var list = new NumberList([1]);
        var spy = jasmine.createSpy();
        var ctx = {};
        list.toArray(spy, ctx);

        expect(spy.calls.first().object).toBe(ctx);
      });
    }); // endregion #toArray

    // region #sort(comparer[, silent])
    describe("#sort(comparer[, silent]) -", function() {
      it("should emit will and did change events on the containing complex object", function() {

        var Derived = Complex.extend({
          type: {
            props: {
              foo: {valueType: NumberList, defaultValue: [4, 2, 1, 3]}
            }
          }
        });

        var derived = new Derived();

        var listeners = jasmine.createSpyObj("listeners", ["will", "did", "rejected"]);
        derived.on("will:change", listeners.will);
        derived.on("rejected:change", listeners.rejected);
        derived.on("did:change", listeners.did);

        derived.foo.sort(fun.compare);

        expect(listeners.will).toHaveBeenCalled();
        expect(listeners.did).toHaveBeenCalled();
        expect(listeners.rejected).not.toHaveBeenCalled();
      });

      it("should sort the list", function() {
        var list = new NumberList([4, 2, 1, 3]);

        list.sort(fun.compare);

        // ----

        _expectEqualValueAt(list, [1, 2, 3, 4]);
      });

      it("should throw a TypeError if list is read-only", function() {

        var list = new NumberList([2, 1, 3], {isReadOnly: true});

        expect(function() {
          list.sort();
        }).toThrowError(TypeError);

        expect(list.at(0).value).toBe(2);
        expect(list.at(1).value).toBe(1);
        expect(list.at(2).value).toBe(3);
      });
    }); // endregion #sort
    // endregion

    // region #clone
    describe("#clone()", function() {
      it("should return a different list instance", function() {
        var list = new List();
        var clone = list.clone();
        expect(clone).not.toBe(list);
      });

      it("should return an editable clone if list is read-only", function() {

        var list = new NumberList([2, 1, 3], {isReadOnly: true});

        var clone = list.clone();

        expect(clone.isReadOnly).toBe(false);
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
    }); // endregion #clone

    // region Type
    describe("Type -", function() {
      describe("#isList -", function() {
        it("should return the value `true`", function() {
          expect(List.type.isList).toBe(true);
        });
      });

      describe("#isContainer", function() {
        it("should have value `true`", function() {
          expect(List.type.isContainer).toBe(true);
        });
      });
    }); // endregion Type

  });
});
