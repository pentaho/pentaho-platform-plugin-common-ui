/*!
 * Copyright 2010 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/type/List",
  "pentaho/type/Number",
  "pentaho/type/changes/Transaction",
  "pentaho/type/changes/ListChangeset",
  "pentaho/type/changes/ComplexChangeset",
  "pentaho/type/changes/Add",
  "tests/pentaho/util/errorMatch"
], function(Complex, List, PentahoNumber, Transaction, ListChangeset, ComplexChangeset, Add, errorMatch) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, spyOn:false */

  describe("pentaho.type.changes.ListChangeset", function() {

    function expectEqualValueAt(list, checkValues) {
      var L = checkValues.length;
      expect(list.count).toBe(L);

      for(var i = 0; i < L; i++) {
        expect(list.at(i).value).toBe(checkValues[i]);
      }
    }

    var NumberList;
    var scope;

    beforeAll(function() {
      NumberList = List.extend({
        $type: {of: PentahoNumber}
      });
    });

    beforeEach(function() {
      scope = Transaction.enter();
    });

    afterEach(function() {
      scope.dispose();
    });

    it("should be defined.", function() {
      expect(typeof ListChangeset).toBeDefined();
    });

    describe("instance -", function() {

      var changeset;

      beforeEach(function() {
        changeset = new ListChangeset(scope.transaction, new NumberList([]));
      });

      describe("#type -", function() {
        it("should return a string with the value `list`", function() {
          expect(changeset.type).toBe("list");
        });
      });

      describe("#changes -", function() {
        it("should be an empty array when a new ListChangeset is created", function() {
          expect(changeset.changes.length).toBe(0);
        });

        it("should store changes that are created", function() {
          var elem = {"foo": "bar"};
          changeset.__addChange(new Add(elem, 0)); // Create and add change.

          var changes = changeset.changes;
          expect(changes).toBeDefined();
          expect(changes[0].element).toBe(elem);
        });
      });

      describe("#hasChanges -", function() {
        it("should be `false` when a new ListChangeset is created", function() {
          expect(changeset.hasChanges).toBe(false);
        });

        it("should be `true` when it contains primitive changes", function() {
          var elem = {"foo": "bar"};
          changeset.__addChange(new Add(elem, 0));

          expect(changeset.hasChanges).toBe(true);
        });

        it("should be `true` when it contains a nested changeset with changes", function() {
          var Derived = Complex.extend();
          var elem = new Derived();
          var cset = new ComplexChangeset(scope.transaction, elem);
          Object.defineProperty(cset, "hasChanges", {value: true});

          changeset.__onChildChangesetCreated(cset);

          expect(changeset.hasChanges).toBe(true);
        });

        it("should be `false` when it contains a nested changeset without changes", function() {
          var Derived = Complex.extend();
          var elem = new Derived();
          var cset = new ComplexChangeset(scope.transaction, elem);

          changeset.__onChildChangesetCreated(cset);

          expect(changeset.hasChanges).toBe(false);
        });
      });

      describe("#__projectedMock -", function() {
        it("should return the original list when there are no changes", function() {
          var list = new NumberList([1, 2, 3]);

          changeset = new ListChangeset(scope.transaction, list);
          expect(changeset.__projectedMock).toBe(list);
        });

        it("should return a mock with all changes applied", function() {
          var list = new NumberList([1, 2, 3]);
          var listElems = list.__elems;

          changeset = new ListChangeset(scope.transaction, list);
          changeset.__addChange(new Add(list.__cast(4), 0));

          var mock = changeset.__projectedMock;
          expect(mock).not.toBe(list);

          expect(list.__elems).toBe(listElems);

          var newElems = mock.__elems;
          expect(newElems[0].value).toBe(4);

          for(var i = 0; i < listElems.length; i++) {
            expect(listElems[i].value).toBe(newElems[i + 1].value);
          }
        });

        it("should not try to calculate the projected mock multiple times", function() {
          var list = new NumberList([1, 2, 3]);

          changeset = new ListChangeset(scope.transaction, list);
          changeset.__addChange(new Add(list.__cast(4), 0));

          spyOn(changeset, "__applyFrom").and.callThrough();

          var mock1 = changeset.__projectedMock;
          var mock2 = changeset.__projectedMock;

          expect(mock1).toBe(mock2);
          expect(changeset.__applyFrom.calls.count()).toBe(1);
        });
      });

      describe("#clearChanges -", function() {
        it("should remove any created changes from the changeset during the 'will' phase", function() {
          var elem = {"foo": "bar"};
          changeset.__addChange(new Add(elem, 0)); // Create and add change.
          changeset.clearChanges();

          expect(changeset.hasChanges).toBe(false);
        });

        it("should clear changes of a nested changeset", function() {
          var Derived = Complex.extend();
          var elem = new Derived();
          var childChangeset = new ComplexChangeset(scope.transaction, elem);

          changeset.__onChildChangesetCreated(childChangeset);

          spyOn(childChangeset, "_clearChangesRecursive");

          changeset.clearChanges();

          expect(childChangeset._clearChangesRecursive).toHaveBeenCalled();
        });

        it("should throw when attempting to clear the changes from the changeset after becoming read-only", function() {
          var elem = {"foo": "bar"};
          changeset.__addChange(new Add(elem, 0)); // Create and add change.
          changeset.__setReadOnlyInternal();

          expect(function() {
            changeset.clearChanges();
          }).toThrow(errorMatch.operInvalid());
        });
      });

      describe("#__clear -", function() {

        it("should not append a `clear` change to the changeset if list is empty", function() {

          changeset.__clear(); // Create clear change.

          expect(changeset.changes.length).toBe(0);
        });

        it("should append a `clear` change to the changeset", function() {

          changeset = new ListChangeset(scope.transaction, new NumberList([1, 2]));

          changeset.__clear(); // Create clear change.

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("clear");
        });

        it("should throw when called after becoming read-only", function() {

          changeset.__setReadOnlyInternal();

          expect(function() {
            changeset.__clear();
          }).toThrow(errorMatch.operInvalid());
        });
      });

      describe("#__set(fragment, add, update, remove, move, index)", function() {

        it("should throw when called after becoming read-only", function() {
          changeset.__setReadOnlyInternal();

          expect(function() {
            changeset.__set([1], true);
          }).toThrow(errorMatch.operInvalid());
        });

        it("for a single element, and add=true, should append a `Add` change to the changeset", function() {
          changeset.__set([1], true);

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("add");
        });

        it("should prevent the creation of duplicates when add=true", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(scope.transaction, list);
          changeset.__set([9, 9, 9, 9], true);

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("add");
        });

        it("for a single element, and remove=true, should append N -1 `Remove` changes to the changeset", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(scope.transaction, list);

          changeset.__set([2], false, false, true);

          expect(changeset.changes.length).toBe(3);
          expect(changeset.changes[0].type).toBe("remove");
          expect(changeset.changes[1].type).toBe("remove");
          expect(changeset.changes[2].type).toBe("remove");
        });

        it("for two existing elements, and move=true, should append a `Move` change to the changeset", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(scope.transaction, list);

          changeset.__set([3, 2], false, false, false, true);

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("move");
        });

        it("for two existing elements, a non-existent element (add, update and move set to `true`), " +
           "should only append an `Add` and a `Move` to the changeset when the list is " +
           "composed of simple values", function() {

          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(scope.transaction, list);

          changeset.__set([5, 2], true, true, false, true);

          expect(changeset.changes.length).toBe(2);
          expect(changeset.changes[0].type).toBe("add");
          expect(changeset.changes[1].type).toBe("move");
        });
      });

      describe("#__remove -", function() {
        it("for a single element, should append a `Remove` change to the changeset", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(scope.transaction, list);
          changeset.__remove(2);

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("remove");
        });

        it("for an array of elements, should append a `Remove` change to the changeset per element", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(scope.transaction, list);
          changeset.__remove([2, 3]);

          expect(changeset.changes.length).toBe(2);
          expect(changeset.changes[0].type).toBe("remove");
          expect(changeset.changes[1].type).toBe("remove");
        });

        it("should throw when called after becoming read-only", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(scope.transaction, list);
          changeset.__setReadOnlyInternal();

          expect(function() {
            changeset.__remove(2);
          }).toThrow(errorMatch.operInvalid());
        });
      });

      describe("#__removeAt -", function() {
        var list;

        beforeEach(function() {
          list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(scope.transaction, list);
        });

        it("should do nothing if the number of elements to remove is negative", function() {
          changeset.__removeAt(1, -1);
          expect(changeset.hasChanges).toBe(false);
        });

        it("should do nothing if the starting index exceeds the number of elements", function() {
          changeset.__removeAt(5, 1);
          expect(changeset.hasChanges).toBe(false);
        });

        it("should append a `Remove` change to the changeset", function() {
          changeset.__removeAt(1, 2); // Remove two consecutive elements.

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("remove");
        });

        it("should throw when called after becoming read-only", function() {
          changeset.__setReadOnlyInternal();

          expect(function() {
            changeset.__removeAt(1);
          }).toThrow(errorMatch.operInvalid());
        });
      });

      describe("#__sort -", function() {
        it("should add append a `sort` change to the changeset", function() {
          changeset.__sort(function(x) { return x;}); // Create sort change.

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("sort");
        });

        it("should throw when called after becoming read-only", function() {
          changeset.__setReadOnlyInternal();

          expect(function() {
            changeset.__sort(function(x) { return x;});
          }).toThrow(errorMatch.operInvalid());
        });
      });

      describe("#_apply -", function() {
        it("should modify the owning object", function() {
          var list = new NumberList([1, 2, 3, 4]);

          changeset = new ListChangeset(scope.transaction, list);
          changeset.__set([5], true); // Append an element.

          changeset._apply(list); // Apply to owning list.

          scope.exit();

          expectEqualValueAt(list, [1, 2, 3, 4, 5]);
        });

        it("should recycle a previously calculated value when modifying the owning object", function() {

          var list = new NumberList([1, 2, 3, 4]);

          changeset = new ListChangeset(scope.transaction, list);

          // Append an element.
          changeset.__set([5], true);

          // Preview the future state of the list.
          var projMock  = changeset.__projectedMock;
          var projElems = projMock.__elems;
          var projKeys  = projMock.__keys;

          expect(list.__elems).not.toBe(projElems);
          expect(list.__keys).not.toBe(projKeys);

          // Apply to target list.
          changeset._apply(list);

          scope.exit();

          expectEqualValueAt(list, [1, 2, 3, 4, 5]);
          expect(list.__elems).toBe(projElems);
          expect(list.__keys).toBe(projKeys);
        });
      });

    }); // end instance
  }); // end pentaho.type.changes.ListChangeset
});
