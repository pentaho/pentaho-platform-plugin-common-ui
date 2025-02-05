/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define([
  "pentaho/type/Complex",
  "pentaho/type/List",
  "pentaho/type/Number",
  "pentaho/type/action/Transaction",
  "pentaho/type/action/ComplexChangeset",
  "pentaho/type/action/ListChangeset",
  "tests/pentaho/util/errorMatch"
], function(Complex, List, PentahoNumber, Transaction, ComplexChangeset, ListChangeset, errorMatch) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.type.action.ComplexChangeset -", function() {

    var NumberList;
    var Derived;
    var DerivedInner;

    beforeAll(function() {

      NumberList = List.extend({
        $type: {of: PentahoNumber}
      });

      DerivedInner = Complex.extend({
        $type: {
          props: [
            {name: "x", valueType: PentahoNumber},
            {name: "y", valueType: PentahoNumber}
          ]
        }
      });

      Derived = Complex.extend({
        $type: {
          props: [
            {name: "foo", valueType: PentahoNumber},
            {name: "bar", valueType: PentahoNumber},
            {name: "myList", valueType: NumberList},
            {name: "myComplex", valueType: DerivedInner}
          ]
        }
      });
    });

    it("should be defined.", function() {
      expect(typeof ComplexChangeset).toBeDefined();
    });

    describe("instance -", function() {
      var changeset;
      var target;
      var listChangeset;
      var myList;
      var myComplex;
      var scope;
      var properties = ["foo", "myList"];

      beforeEach(function() {
        target = new Derived({
          foo: 5,
          bar: 6,
          myList: [1],
          myComplex: new DerivedInner({x: 1})
        });
        myList = target.myList;
        myComplex = target.myComplex;

        scope = Transaction.enter();

        target.foo = 10;
        target.myList.add(3);

        listChangeset = myList.$changeset;
        changeset = target.$changeset;
      });

      afterEach(function() {
        if(scope) {
          scope.dispose();
          scope = null;
        }
      });

      describe("#transactionVersion", function() {

        it("should be initialized with its transaction's current version number", function() {

          var transaction = scope.transaction;
          var transactionVersion = transaction.version;

          var target = new Derived();

          var changeset = new ComplexChangeset(transaction, target);

          expect(changeset.transactionVersion).toBe(transactionVersion);
        });

        it("should be incremented when the value of a property is changed", function() {

          var transactionVersion = changeset.transactionVersion;

          target.bar = 20;

          expect(changeset.transactionVersion).toBeGreaterThan(transactionVersion);
        });

        it("should be incremented when the value of a property goes back to its initial value", function() {

          target.bar = 20;

          var transactionVersion = changeset.transactionVersion;

          target.bar = 5;

          expect(changeset.transactionVersion).toBeGreaterThan(transactionVersion);
        });

        it("should be incremented when changes are cleared", function() {

          target.bar = 20;

          var transactionVersion = changeset.transactionVersion;

          changeset.clearChanges();

          expect(changeset.transactionVersion).toBeGreaterThan(transactionVersion);
        });

        it("should be incremented when a nested changeset has a new change", function() {

          var transactionVersion = changeset.transactionVersion;

          target.myList.add(4);

          expect(changeset.transactionVersion).toBeGreaterThan(transactionVersion);
        });

        it("should be incremented when a nested changeset is cleared", function() {

          var transactionVersion = changeset.transactionVersion;

          target.myList.$changeset.clearChanges();

          expect(changeset.transactionVersion).toBeGreaterThan(transactionVersion);
        });
      });

      // region #type
      describe("#type", function() {
        it("should return a string with the value `complex`", function() {
          expect(changeset.type).toBe("complex");
        });
      }); // endregion #type

      // region #hasChanges
      describe("#hasChanges -", function() {
        it("should return `true` if the ComplexChangeset has changes", function() {
          expect(changeset.hasChanges).toBe(true);
        });

        it("should return `false` if the ComplexChangeset does not have changes", function() {
          var emptyChangeset = new ComplexChangeset(scope.transaction, new Derived());
          expect(emptyChangeset.hasChanges).toBe(false);
        });

        it("should return `false` if the ComplexChangeset has a ListChangeset that doesn't have changes", function() {
          var cset = new ComplexChangeset(scope.transaction, new Derived());
          cset._changes = {"myList": new ListChangeset(scope.transaction, myList)};

          expect(cset.hasChanges).toBe(false);
        });

        it("should return `true` if the ComplexChangeset has a ListChangeset that has changes", function() {
          var cset = new ComplexChangeset(scope.transaction, new Derived());
          cset._changes = {"myList": {hasChanges: true}};

          expect(cset.hasChanges).toBe(true);
        });
      }); // endregion #hasChanges

      // region #getChange
      describe("#getChange -", function() {

        beforeEach(function() {
          scope.acceptWill();
        });

        it("should throw an error if the property does not exist in the target of the changeset", function() {
          expect(function() {
            changeset.getChange("baz");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should return `null` if the property exists but didn't change its value", function() {
          expect(changeset.hasChange("bar")).toBe(false);
          expect(changeset.getChange("bar")).toBeNull();
        });

        it("should return the change object for the given property if it exists and its value changed", function() {
          expect(changeset.hasChange("foo")).toBe(true);
          expect(changeset.getChange("foo")).not.toBeNull();
        });
      }); // endregion #getChange

      // region #hasChange
      describe("#hasChange -", function() {
        it("should throw an error if the property does not exist in the target of the changeset", function() {
          expect(function() {
            changeset.hasChange("baz");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should return `true` if the property exists in the ComplexChangeset", function() {
          expect(changeset.hasChange("foo")).toBe(true);
        });

        it("should return `false` if the property does not exist in the ComplexChangeset", function() {
          expect(changeset.hasChange("bar")).toBe(false);
        });
      }); // endregion #hasChange

      // region #compose
      describe("#compose -", function () {
        var secondChangeset;

        function expectEqualChanges(actual, expected) {
          expect(expected).toBeDefined();
          expect(actual).toBeDefined();

          expect(actual).toBe(expected);
        }

        describe("should throw when", function() {

          it("composing with a changeset which is not an instanceof `ComplexChangeset`", function () {
            secondChangeset = new ListChangeset(scope.transaction, myList);

            expect(function () {
              changeset.compose(secondChangeset)
            }).toThrow(errorMatch.argInvalidType("changeset", "pentaho.type.action.ComplexChangeset", typeof secondChangeset));
          });

          it("the changeset is the same has itself", function () {
            secondChangeset = changeset;

            expect(function () {
              changeset.compose(secondChangeset)
            }).toThrow(errorMatch.argInvalid("changeset"));
          });

          it("the changeset has a different target", function () {
            secondChangeset = new ComplexChangeset(scope.transaction, new Derived());

            expect(function () {
              changeset.compose(secondChangeset)
            }).toThrow(errorMatch.argInvalid("changeset.target"));
          });

          it("the changeset has a previous target version", function () {
            var targetVersion = 0;

            secondChangeset = new ComplexChangeset(scope.transaction, target);
            spyOnProperty(secondChangeset, "targetVersion", "get").and.returnValue(targetVersion++);
            spyOnProperty(changeset, "targetVersion", "get").and.returnValue(targetVersion);

            expect(function () {
              changeset.compose(secondChangeset)
            }).toThrow(errorMatch.argInvalid("changeset.targetVersion"));
          });
        });

        it("should create a new ComplexChangeset which is read-only", function() {
          secondChangeset = new ComplexChangeset(scope.transaction, target);

          var composedChangeset = changeset.compose(secondChangeset);

          // ---

          expect(composedChangeset).not.toBe(changeset);
          expect(composedChangeset).not.toBe(secondChangeset);

          expect(composedChangeset.isReadOnly).toBe(true);
        });

        it("should use the new Change, when it previously did not exist", function() {
          scope.accept();

          Transaction.enter().using(function(scope) {
            target.myComplex = new DerivedInner();

            secondChangeset = target.$changeset;
            scope.accept();
          });

          var composedChangeset = changeset.compose(secondChangeset);

          // ---

          var previousChange = changeset.getChange("myComplex");
          var newChange = secondChangeset.getChange("myComplex");
          var composedChange = composedChangeset.getChange("myComplex");

          expect(previousChange).toBeNull();
          expect(newChange.type).toBe("replace");

          expectEqualChanges(composedChange, newChange);
        });

        it("should choose the new Replace change, over a previous child ComplexChangeset", function() {
          myComplex.x = 2;
          scope.accept();

          Transaction.enter().using(function(scope) {
            target.myComplex = new DerivedInner();

            secondChangeset = target.$changeset;
            scope.accept();
          });

          var composedChangeset = changeset.compose(secondChangeset);

          // ---

          var previousChange = changeset.getChange("myComplex");
          var newChange = secondChangeset.getChange("myComplex");
          var composedChange = composedChangeset.getChange("myComplex");

          expect(previousChange.type).toBe("complex");
          expect(newChange.type).toBe("replace");

          expectEqualChanges(composedChange, newChange);
        });

        it("should choose the new child ComplexChangeset, over a previous Replace change", function() {
          target.myComplex = new DerivedInner();
          scope.accept();

          Transaction.enter().using(function(scope) {
            target.myComplex.x = 2;

            secondChangeset = target.$changeset;
            scope.accept();
          });

          var composedChangeset = changeset.compose(secondChangeset);

          // ---

          var previousChange = changeset.getChange("myComplex");
          var newChange = secondChangeset.getChange("myComplex");
          var composedChange = composedChangeset.getChange("myComplex");

          expect(previousChange.type).toBe("replace");
          expect(newChange.type).toBe("complex");

          expectEqualChanges(composedChange, newChange);
        });

        it("should combine the new child ComplexChangeset, with the previous child ComplexChangeset", function() {
          target.myComplex.x = 2;
          scope.accept();

          Transaction.enter().using(function(scope) {
            target.myComplex.y = 2;

            secondChangeset = target.$changeset;
            scope.accept();
          });

          var composedChangeset = changeset.compose(secondChangeset);

          // ---

          var previousChange = changeset.getChange("myComplex");
          var newChange = secondChangeset.getChange("myComplex");
          var composedChange = composedChangeset.getChange("myComplex");

          expect(previousChange.type).toBe("complex");
          expect(newChange.type).toBe("complex");
          expect(composedChange.type).toBe("complex");

          expectEqualChanges(composedChange.getChange("x"), previousChange.getChange("x"));
          expectEqualChanges(composedChange.getChange("y"), newChange.getChange("y"));
        });

        it("should combine the new child ListChangeset, with the previous child ListChangeset", function() {
          scope.accept();

          Transaction.enter().using(function(scope) {
            target.myList.remove(1);

            secondChangeset = target.$changeset;
            scope.accept();
          });

          var composedChangeset = changeset.compose(secondChangeset);

          // ---

          var previousChange = changeset.getChange("myList");
          var newChange = secondChangeset.getChange("myList");
          var composedChange = composedChangeset.getChange("myList");

          expect(previousChange.type).toBe("list");
          expect(newChange.type).toBe("list");
          expect(composedChange.type).toBe("list");

          expectEqualChanges(composedChange.changes[0], previousChange.changes[0]);
          expectEqualChanges(composedChange.changes[1], newChange.changes[0]);
        });
      }); // endregion

      // region #target.get
      describe("#target.get()", function() {
        it("should return the property's original value if it isn't changing", function() {
          expect(target.bar).toBe(6);
        });

        it("should return the the property's new value if has changed", function() {
          expect(myList.count).toBe(2);
          expect(myList.at(0).value).toBe(1);
          expect(myList.at(1).value).toBe(3);
        });
      }); // endregion #get

      // region #getOld
      describe("#getOld -", function() {
        it("should throw an error if the property does not exist in the target of the changeset", function() {
          expect(function() {
            changeset.getOld("baz");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should get the property's original value, regarding of it having changed value or not", function() {
          expect(changeset.getOld("foo").value).toBe(5);
          expect(changeset.getOld("bar").value).toBe(6);
          expect(changeset.getOld("myList")).toBe(myList);
        });
      }); // endregion #getOld

      // region #target.set()
      describe("#target.set() -", function() {

        beforeEach(function() {
          if(scope.isCurrent) scope.exit();
        });

        it("should add a new property to the ComplexChangeset", function() {
          var Derived = Complex.extend({$type: {props: ["foo"]}});

          var derived = new Derived({foo: "a"});

          var txnScope = Transaction.enter();

          expect(derived.$hasChanges).toBe(false);

          derived.set("foo", "b");

          expect(derived.$hasChanges).toBe(true);
          expect(derived.$changeset.hasChange("foo")).toBe(true);

          txnScope.dispose();
        });

        it("should update a Replace change, when it already exists in the changeset", function() {
          var Derived = Complex.extend({$type: {props: ["foo"]}});

          var derived = new Derived({foo: "a"});

          var txnScope = Transaction.enter();

          derived.set("foo", "b");

          var change0 = derived.$changeset.getChange("foo");

          expect(change0.value.valueOf()).toBe("b");

          derived.set("foo", "c");

          var change1 = derived.$changeset.getChange("foo");

          expect(change0).toBe(change1);
          expect(change1.value.valueOf()).toBe("c");

          txnScope.dispose();
        });

        it("should not create a change, when the value is the same", function() {
          var Derived = Complex.extend({$type: {props: ["foo"]}});

          var derived = new Derived({foo: "a"});

          var txnScope = Transaction.enter();

          expect(derived.$hasChanges).toBe(false);

          derived.set("foo", "a");

          expect(derived.$hasChanges).toBe(false);

          txnScope.dispose();
        });

        it("should redirect Complex#set on target to its ambient changeset", function() {

          var txnScope = Transaction.enter();

          var Derived = Complex.extend({$type: {props: ["foo"]}});
          var derived = new Derived({foo: "bar"});

          spyOn(derived, "_createChangeset").and.returnValue(new ComplexChangeset(txnScope.transaction, derived));

          var changeset = txnScope.transaction.ensureChangeset(derived);

          expect(changeset.hasChanges).toBe(false);
          expect(changeset.target).toBe(derived);

          // ---

          derived.set("foo", "guru");

          // ---

          expect(changeset.hasChange("foo")).toBe(true);
          txnScope.dispose();
        });

        it("should substitute a previous child changeset with a replace change", function() {

          var txnScope = Transaction.enter();

          var ComplexValue = Complex.extend({
            $type: {
              props: [
                {name: "a", valueType: "number"},
                {name: "b", valueType: "number"}
              ]
            }
          });

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "foo", valueType: ComplexValue}
              ]
            }
          });

          var derived = new Derived({foo: {a: 1, b: 2}});

          spyOn(derived, "_createChangeset").and.returnValue(new ComplexChangeset(txnScope.transaction, derived));

          var changeset = txnScope.transaction.ensureChangeset(derived);

          expect(changeset.hasChanges).toBe(false);
          expect(changeset.target).toBe(derived);

          // ---

          // Create a child changeset that gets hooked up to changeset
          derived.foo.a = 3;

          // ---

          expect(changeset.getChange("foo") instanceof ComplexChangeset).toBe(true);

          // ---
          // Replace the child changeset with a replace change.

          var newFooValue = new ComplexValue({a: 4, b: 5});

          derived.foo = newFooValue;

          expect(changeset.getChange("foo").type).toBe("replace");

          txnScope.dispose();
        });

        it("should preserve a previous replace over a new child changeset", function() {

          var txnScope = Transaction.enter();

          var ComplexValue = Complex.extend({
            $type: {
              props: [
                {name: "a", valueType: "number"},
                {name: "b", valueType: "number"}
              ]
            }
          });

          var Derived = Complex.extend({
            $type: {
              props: [
                {name: "foo", valueType: ComplexValue}
              ]
            }
          });

          var derived = new Derived({foo: {a: 1, b: 2}});

          spyOn(derived, "_createChangeset").and.returnValue(new ComplexChangeset(txnScope.transaction, derived));

          var changeset = txnScope.transaction.ensureChangeset(derived);

          expect(changeset.hasChanges).toBe(false);
          expect(changeset.target).toBe(derived);

          // ---
          // Replace foo.
          var newFooValue = new ComplexValue({a: 4, b: 5});

          derived.foo = newFooValue;

          expect(changeset.getChange("foo").type).toBe("replace");

          var transactionVersion = changeset.transactionVersion;

          // ---
          // Create a child changeset but do not hook into it.

          newFooValue.a = 2;

          expect(changeset.getChange("foo").type).toBe("replace");

          // ---
          // However, it should increment the transaction version.
          expect(changeset.transactionVersion).toBeGreaterThan(transactionVersion);

          txnScope.dispose();
        });

      }); // endregion #target.set()

      // region #propertyNames
      describe("#propertyNames -", function() {

        it("should return an array with all property names of the changeset", function() {
          var propertyNames = changeset.propertyNames;

          expect(propertyNames.length).toBe(properties.length);

          propertyNames.forEach(function(prop, index) {
            expect(prop).toBe(properties[index]);
          });
        });

        it("changeset propertyNames should be immutable", function() {
          expect(function() {
            changeset.propertyNames = "foo";
          }).toThrowError(TypeError);
        });
      }); // endregion #propertyNames

      // region scope.accept()
      describe("scope.accept()", function() {
        it("should apply changes to its target", function() {
          expect(target.foo).toBe(10);

          scope.accept();

          expect(target.foo).toBe(10);
        });

        it("should update the version of its target", function() {
          var version0 = target.$version;

          scope.accept();

          expect(target.$version).toBeGreaterThan(version0);
        });

        it("should apply all changes of a contained ListChangeset", function() {
          expect(myList.count).toBe(2);
          expect(myList.at(0).value).toBe(1);
          expect(myList.at(1).value).toBe(3);

          scope.accept();

          expect(myList.count).toBe(2);
          expect(myList.at(0).value).toBe(1);
          expect(myList.at(1).value).toBe(3);
        });
      }); // endregion scope.accept()

      // region #_clearChanges()
      describe("#_clearChanges()", function() {

        it("cannot be called after acceptWill", function() {

          scope.acceptWill();

          expect(function() {
            changeset.clearChanges();
          }).toThrow(errorMatch.operInvalid());
        });

        it("should retain no changes", function() {

          var initListener = jasmine.createSpy().and.callThrough(function() {
            expect(changeset.hasChanges).toBe(true);
            expect(listChangeset.hasChanges).toBe(true);

            changeset.clearChanges();

            expect(changeset.hasChanges).toBe(false);
          });

          target.on("change", {init: initListener});

          scope.acceptWill();

          expect(initListener).toHaveBeenCalled();
        });

        it("should clear contained changesets", function() {
          var initListener = jasmine.createSpy().and.callThrough(function() {
            expect(changeset.hasChanges).toBe(true);
            expect(listChangeset.hasChanges).toBe(true);

            changeset.clearChanges();

            expect(listChangeset.hasChanges).toBe(false);
          });

          target.on("change", {init: initListener});

          scope.acceptWill();

          expect(initListener).toHaveBeenCalled();
        });
      }); // endregion #_clearChanges()

    }); // end instance

  }); // end pentaho.lang.ComplexChangeset

});
