/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/type/changes/ComplexChangeset",
  "pentaho/type/changes/ListChangeset",
  "pentaho/type/changes/Replace",
  "pentaho/type/changes/Add",
  "pentaho/type/Context",
  "pentaho/type/complex",
  "pentaho/type/list",
  "pentaho/type/number",
  "pentaho/lang/Base",
  "tests/pentaho/util/errorMatch"
], function(ComplexChangeset, ListChangeset, Replace, Add,
            Context, complexFactory, listFactory, numberFactory, Base, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.type.ComplexChangeset -", function() {
    var context, Complex, List, PentahoNumber, NumberList, Derived;

    beforeEach(function() {
      context = new Context();
      Complex = context.get(complexFactory);
      List = context.get(listFactory);
      PentahoNumber = context.get(numberFactory);

      NumberList = List.extend({
        type: {of: PentahoNumber}
      });

      Derived = Complex.extend({
        type: {
          props: [
            {name: "foo", type: "number"},
            {name: "bar", type: "number"},
            {name: "myList", type: NumberList}
          ]
        }
      });
    });

    it("should be defined.", function () {
      expect(typeof ComplexChangeset).toBeDefined();
    });

    describe("instance -", function() {
      var changeset, owner, listChangeset, myList, scope,
          properties = ["foo", "myList"];

      beforeEach(function() {
        owner = new Derived({
          foo: 5,
          bar: 6,
          myList: [1]
        });
        myList = owner.myList;

        scope = context.enterChange();

        owner.foo = 10;
        owner.myList.add(3);

        listChangeset = myList.changeset;
        changeset = owner.changeset;
      });

      afterEach(function() {
        if(scope) {
          scope.dispose();
          scope = null;
        }
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
          var emptyChangeset = new ComplexChangeset(context.transaction, {});
          expect(emptyChangeset.hasChanges).toBe(false);
        });

        it("should return `false` if the ComplexChangeset has a ListChangeset that doesn't have changes", function() {
          var cset = new ComplexChangeset(context.transaction, {});
          cset._changes = {"myList" : new ListChangeset(context.transaction, myList)};

          expect(cset.hasChanges).toBe(false);
        });
      }); // endregion #hasChanges

      // region #getChange
      describe("#getChange -", function() {

        beforeEach(function() {
          scope.acceptWill();
        });

        it("should throw an error if the property does not exist in the owner of the changeset", function() {
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
        beforeEach(function() {
          // required for connecting changesets
          scope.acceptWill();
        });

        it("should throw an error if the property does not exist in the owner of the changeset", function() {
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

      // region #owner.get
      describe("#owner.get()", function() {
        it("should return the property's original value if it isn't changing", function() {
          expect(owner.bar).toBe(6);
        });

        it("should return the the property's new value if has changed", function() {
          expect(myList.count).toBe(2);
          expect(myList.at(0).value).toBe(1);
          expect(myList.at(1).value).toBe(3);
        });
      }); // endregion #get

      // region #getOld
      describe("#getOld -", function() {
        it("should throw an error if the property does not exist in the owner of the changeset", function() {
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

      // region #owner.set()
      describe("#owner.set() -", function() {
        beforeEach(function() {
          if(scope.isCurrent) scope.exit();
        });

        it("should add a new property to the ComplexChangeset", function() {
          var Derived = Complex.extend({type: {props: ["foo"]}});

          var derived = new Derived({foo: "a"});

          var txnScope = context.enterChange();

          expect(derived.hasChanges).toBe(false);

          derived.set("foo", "b");

          expect(derived.hasChanges).toBe(true);
          expect(derived.changeset.hasChange("foo")).toBe(true);

          txnScope.dispose();
        });

        it("should update a Replace change, when it already exists in the changeset", function() {
          var Derived = Complex.extend({type: {props: ["foo"]}});

          var derived = new Derived({foo: "a"});

          var txnScope = context.enterChange();

          derived.set("foo", "b");

          var change0 = derived.changeset.getChange("foo");

          expect(change0.value.valueOf()).toBe("b");

          derived.set("foo", "c");

          var change1 = derived.changeset.getChange("foo");

          expect(change0).toBe(change1);
          expect(change1.value.valueOf()).toBe("c");

          txnScope.dispose();
        });

        it("should not create a change, when the value is the same", function() {
          var Derived = Complex.extend({type: {props: ["foo"]}});

          var derived = new Derived({foo: "a"});

          var txnScope = context.enterChange();

          expect(derived.hasChanges).toBe(false);

          derived.set("foo", "a");

          expect(derived.hasChanges).toBe(false);

          txnScope.dispose();
        });

        it("should redirect Complex#set on owner to its ambient changeset", function() {

          var txnScope = context.enterChange();

          var Derived = Complex.extend({type: {props: ["foo"]}});
          var derived = new Derived({foo: "bar"});

          var changeset = new ComplexChangeset(txnScope.transaction, derived);
          expect(changeset.hasChanges).toBe(false);
          expect(changeset.owner).toBe(derived);

          // ---

          derived.set("foo", "guru");

          // ---

          expect(changeset.hasChange("foo")).toBe(true);
          txnScope.dispose();
        });
      }); // endregion #_setElement

      // region #propertyNames
      describe("#propertyNames -", function() {
        beforeEach(function() {
          // required for connecting changesets
          scope.acceptWill();
        });

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
        it("should apply changes to its owner", function() {
          expect(owner.foo).toBe(10);

          scope.accept();

          expect(owner.foo).toBe(10);
        });

        it("should update the version of its owner", function() {
          var version0 = owner.$version;

          scope.accept();

          expect(owner.$version).toBeGreaterThan(version0);
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

          var willListener = jasmine.createSpy().and.callThrough(function() {
            expect(changeset.hasChanges).toBe(true);
            expect(listChangeset.hasChanges).toBe(true);

            changeset.clearChanges();

            expect(changeset.hasChanges).toBe(false);
          });

          owner.on("will:change", willListener);

          scope.acceptWill();

          expect(willListener).toHaveBeenCalled();
        });

        it("should clear contained changesets", function() {
          var willListener = jasmine.createSpy().and.callThrough(function() {
            expect(changeset.hasChanges).toBe(true);
            expect(listChangeset.hasChanges).toBe(true);

            changeset.clearChanges();

            expect(listChangeset.hasChanges).toBe(false);
          });

          owner.on("will:change", willListener);

          scope.acceptWill();

          expect(willListener).toHaveBeenCalled();
        });
      }); // endregion #_clearChanges()

    }); //end instance

  }); //end pentaho.lang.ComplexChangeset

});
