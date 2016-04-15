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
  "pentaho/type/Context",
  "pentaho/type/list",
  "pentaho/type/number",
  "pentaho/type/changes/ListChangeset",
  "pentaho/type/changes/Add"
], function(Context, listFactory, numberFactory, ListChangeset, Add) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */
  
  var context = new Context(),
      List = context.get(listFactory),
      PentahoNumber = context.get(numberFactory);

  var NumberList = List.extend({
    type: {of: PentahoNumber}
  });

  describe("pentaho.type.changes.ListChangeset -", function() {
    function createAndCommit(current, input, keyArgs) {
      var change = new ListChangeset({}, current);
      change.set(input, keyArgs);
      change._commit();
    }

    function expectEqualValueAt(list, checkValues) {
      var L = checkValues.length;
      expect(list.count).toBe(L);

      for(var i = 0; i < L; i++) {
        expect(list.at(i).value).toBe(checkValues[i]);
      }
    }


    it("should be defined.", function () {
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
        it("should return `zero` when a new ListChangeset is created", function() {
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

      //region #newValue
      describe("#newValue -", function() {
        it("should return the original list, because any change was applied", function() {
          var list = new NumberList([1,2,3]);
          var listElems = list._elems;

          changeset = new ListChangeset(list);
          var newValue = changeset.newValue._elems;

          for(var i = 0; i < listElems.length; i++) {
            expect(listElems[i].value).toBe(newValue[i].value);
          }
        });

        xit("should not try to calculate the new value multiple times", function() {
          //TODO: Behaviour changed, redo tests
          var list = new NumberList([1,2,3]);
          changeset = new ListChangeset(list);

          spyOn(changeset, "apply").and.callThrough();
          
          var firstNew = changeset.newValue._elems;
          var secondNew = changeset.newValue._elems;

          expect(changeset.apply.calls.count()).toBe(1);
          for(var i = 0; i < firstNew.length; i++) {
            expect(firstNew[i].value).toBe(secondNew[i].value);
          }
        });

        it("should return the new value with all changes applied", function() {
          var list = new NumberList([1,2,3]);
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
    }); //end instance
  }); //end pentaho.lang.ComplexChangeset

});
