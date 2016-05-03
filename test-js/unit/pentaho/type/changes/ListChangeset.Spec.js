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
  "tests/pentaho/util/errorMatch",
  "pentaho/type/Context",
  "pentaho/type/list",
  "pentaho/type/number",
  "pentaho/type/changes/ListChangeset",
  "pentaho/type/changes/Add"
], function(errorMatch, Context, listFactory, numberFactory, ListChangeset, Add) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  var context = new Context(),
    List = context.get(listFactory),
    PentahoNumber = context.get(numberFactory);

  var NumberList = List.extend({
    type: {of: PentahoNumber}
  });

  describe("pentaho.type.changes.ListChangeset -", function() {
    function expectEqualValueAt(list, checkValues) {
      var L = checkValues.length;
      expect(list.count).toBe(L);

      for(var i = 0; i < L; i++) {
        expect(list.at(i).value).toBe(checkValues[i]);
      }
    }


    it("should be defined.", function() {
      expect(typeof ListChangeset).toBeDefined();
    });

    describe("instance -", function() {
      var changeset;
      beforeEach(function() {
        changeset = new ListChangeset(new NumberList([]));
      });

      //region #type
      describe("#type -", function() {
        it("should return a string with the value `list`", function() {
          expect(changeset.type).toBe("list");
        });
      }); //endregion #type

      //region #changes
      describe("#changes -", function() {
        it("should be an empty array when a new ListChangeset is created", function() {
          expect(changeset.changes.length).toBe(0);
        });

        it("should store changes that are created", function() {
          var elem = {"foo": "bar"};
          changeset._addChange(new Add(elem, 0)); //create add change

          var changes = changeset.changes;
          expect(changes).toBeDefined();
          expect(changes[0].element).toBe(elem);
        });
      }); //endregion #changes

      //region #hasChanges
      describe("#hasChanges -", function() {
        it("should be `false` when a new ListChangeset is created", function() {
          expect(changeset.hasChanges).toBe(false);
        });

        it("should be `true` when changes are created", function() {
          var elem = {"foo": "bar"};
          changeset._addChange(new Add(elem, 0)); //create add change

          expect(changeset.hasChanges).toBe(true);
        });
      }); //endregion #hasChanges


      //region #newValue
      describe("#newValue -", function() {
        it("should return the original list, because any change was applied", function() {
          var list = new NumberList([1, 2, 3]);
          var listElems = list._elems;

          changeset = new ListChangeset(list);
          var newValue = changeset.newValue._elems;

          for(var i = 0; i < listElems.length; i++) {
            expect(listElems[i].value).toBe(newValue[i].value);
          }
        });

        it("should not try to calculate the new value multiple times", function() {
          var list = new NumberList([1, 2, 3]);
          changeset = new ListChangeset(list);
          changeset._addChange(new Add(list._cast(4), 0));

          spyOn(changeset, "_applyFrom").and.callThrough();

          var firstNew = changeset.newValue._elems;
          var secondNew = changeset.newValue._elems;

          expect(changeset._applyFrom.calls.count()).toBe(1);
          for(var i = 0; i < firstNew.length; i++) {
            expect(firstNew[i].value).toBe(secondNew[i].value);
          }
        });

        it("should return the new value with all changes applied", function() {
          var list = new NumberList([1, 2, 3]);
          var listElems = list._elems;

          changeset = new ListChangeset(list);
          changeset._addChange(new Add(list._cast(4), 0));

          var newValue = changeset.newValue._elems;
          expect(newValue[0].value).toBe(4);

          for(var i = 0; i < listElems.length; i++) {
            expect(listElems[i].value).toBe(newValue[i + 1].value);
          }
        });
      }); //endregion #newValue

      //region #clearChanges
      describe("#clearChanges -", function() {
        it("should remove any created changes from the changeset during the 'will' phase", function() {
          var elem = {"foo": "bar"};
          changeset._addChange(new Add(elem, 0)); //create add change
          changeset.clearChanges();

          expect(changeset.hasChanges).toBe(false);
        });

        it("should throw when attempting to clear the changes from the changeset after the 'will' phase", function() {
          var elem = {"foo": "bar"};
          changeset._addChange(new Add(elem, 0)); //create add change
          changeset._phase = 1; // get out of the will phase

          expect(function() {
            changeset.clearChanges();
          }).toThrow(errorMatch.operInvalid("Changeset is readonly."));
        });
      }); //endregion #clearChanges

      //region #_clear
      describe("#_clear -", function() {
        it("should append a `clear` change to the changeset", function() {
          changeset._clear(); //create clear change

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("clear");
        });

        it("should throw when called after the 'will' phase", function() {
          changeset._phase = 1; // get out of the will phase

          expect(function() {
            changeset._clear();
          }).toThrow(errorMatch.operInvalid("Changeset is readonly."));
        });
      }); //endregion #_clear


      //region #_set
      describe("#_set -", function() {
        it("should throw when called after the 'will' phase", function() {
          changeset._phase = 1; // get out of the will phase

          expect(function() {
            changeset._set([1], true);
          }).toThrow(errorMatch.operInvalid("Changeset is readonly."));
        });

        it("for a single element, and the second argument set to `true`, should append a `Add` change to the changeset",
        function() {
          changeset._set([1], true);

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("add");
        });

        it("should prevent the creation of duplicates when the second argument set to `true`", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(list);
          changeset._set([9, 9, 9, 9], true);

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("add");
        });

        it("for a single element, and the third argument set to `true`, " +
           " should append N -1 `Remove` changes to the changeset", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(list);

          changeset._set([2], false, false, true);

          expect(changeset.changes.length).toBe(3);
          expect(changeset.changes[0].type).toBe("remove");
          expect(changeset.changes[1].type).toBe("remove");
          expect(changeset.changes[2].type).toBe("remove");
        });

        it("for two existing elements, and the fourth argument set to `true`, " +
           " should append a `Move` change to the changeset", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(list);

          changeset._set([3, 2], false, false, false, true);

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("move");
        });

        it("for two existing elements, a non-existent element " +
           "(with the first, second and fourth arguments set to `true`), " +
           " should only append an `Add` and a `Move` to the changeset " +
           "when the list is composed of simple values", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(list);

          changeset._set([5, 2], true, true, false, true);

          expect(changeset.changes.length).toBe(2);
          expect(changeset.changes[0].type).toBe("add");
          expect(changeset.changes[1].type).toBe("move");
        });
      }); //endregion #_removeAt

      // region #_remove
      describe("#_remove -", function() {
        it("for a single element, should append a `Remove` change to the changeset", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(list);
          changeset._remove(2);

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("remove");
        });

        it("for an array of elements, should append a `Remove` change to the changeset per element", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(list);
          changeset._remove([2, 3]);

          expect(changeset.changes.length).toBe(2);
          expect(changeset.changes[0].type).toBe("remove");
          expect(changeset.changes[1].type).toBe("remove");
        });

        it("should throw when called after the 'will' phase", function() {
          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(list);
          changeset._phase = 1; // get out of the will phase

          expect(function() {
            changeset._remove(2);
          }).toThrow(errorMatch.operInvalid("Changeset is readonly."));
        });
      }); //endregion #_removeAt

      // region #_removeAt
      describe("#_removeAt -", function() {
        var list;

        beforeEach(function(){
          list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(list);
        });

        it("should do nothing if the number of elements to remove is negative", function() {
          changeset._removeAt(1, -1);
          expect(changeset.hasChanges).toBe(false);
        });

        it("should do nothing if the starting index exceeds the number of elements", function() {
          changeset._removeAt(5, 1);
          expect(changeset.hasChanges).toBe(false);
        });

        it("should append a `Remove` change to the changeset", function() {
          changeset._removeAt(1, 2); //remove two consecutive elements

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("remove");
        });

        it("should throw when called after the 'will' phase", function() {
          changeset._phase = 1; // get out of the will phase

          expect(function() {
            changeset._removeAt(1);
          }).toThrow(errorMatch.operInvalid("Changeset is readonly."));
        });
      }); //endregion #_removeAt

      //region #_sort
      describe("#_sort -", function() {
        it("should add append a `sort` change to the changeset", function() {
          changeset._sort(function(x) { return x;}); //create sort change

          expect(changeset.changes.length).toBe(1);
          expect(changeset.changes[0].type).toBe("sort");
        });
        it("should throw when called after the 'will' phase", function() {
          changeset._phase = 1; // get out of the will phase

          expect(function() {
            changeset._sort(function(x) { return x;});
          }).toThrow(errorMatch.operInvalid("Changeset is readonly."));
        });
      }); //endregion #_sort

      // region #_apply
      describe("#_apply -", function() {
        it("should modify the owning object", function() {

          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(list);
          changeset._set([5], true); //append an element

          changeset._apply(list); // apply to owning list
          expectEqualValueAt(list, [1, 2, 3, 4, 5]);
        });

        it("should recycle a previously calculated value when modifying the owning object", function() {

          var list = new NumberList([1, 2, 3, 4]);
          changeset = new ListChangeset(list);
          changeset._set([5], true); //append an element

          var proposedList = changeset.newValue; //preview the future state of the list
          var _elems = proposedList._elems;
          var _keys = proposedList._keys;

          expect(list._elems).not.toBe(_elems);
          expect(list._keys).not.toBe(_keys);

          changeset._apply(list); // apply to target list

          expectEqualValueAt(list, [1, 2, 3, 4, 5]);
          expect(list._elems).toBe(_elems);
          expect(list._keys).toBe(_keys);

        });


      }); //endregion #_sort

    }); //end instance
  }); //end pentaho.lang.ComplexChangeset

});
