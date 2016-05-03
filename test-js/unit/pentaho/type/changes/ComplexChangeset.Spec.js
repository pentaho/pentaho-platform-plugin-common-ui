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

  var context = new Context(),
      Complex = context.get(complexFactory),
      List = context.get(listFactory),
      PentahoNumber = context.get(numberFactory);

  var NumberList = List.extend({
    type: {of: PentahoNumber}
  });

  var Derived = Complex.extend({
    type: {
      props: [
        {name: "foo", type: "number"},
        {name: "bar", type: "number"},
        {name: "myList", type: NumberList}
      ]
    }
  });

  describe("pentaho.type.ComplexChangeset -", function() {

    it("should be defined.", function () {
      expect(typeof ComplexChangeset).toBeDefined();
    });

    describe("instance -", function() {
      var changeset, owner, listChangeset, myList,
          properties = ["foo", "myList"];

      beforeEach(function() {
        owner = new Derived({ "foo": 5, "bar": 6, "myList": [1] });

        myList = owner.get("myList");

        listChangeset = new ListChangeset(myList);
        listChangeset._addChange(new Add(new PentahoNumber(3), 1));

        changeset = new ComplexChangeset(owner);
        changeset._changes = {
          "foo":    new Replace("foo", 10),
          "myList": listChangeset
        };
      });

      //region #type
      describe("#type", function() {
        it("should return a string with the value `complex`", function() {
          expect(changeset.type).toBe("complex");
        });
      }); //endregion #type

      //region #hasChanges
      describe("#hasChanges -", function() {
        it("should return `true` if the ComplexChangeset has changes", function() {
          expect(changeset.hasChanges).toBe(true);
        });

        it("should return `false` if the ComplexChangeset does not have changes", function() {
          var emptyChangeset = new ComplexChangeset({});
          expect(emptyChangeset.hasChanges).toBe(false);
        });

        it("should return `false` if the ComplexChangeset has a ListChangeset that doesn't have changes", function() {
          var _changeset = new ComplexChangeset({});
          _changeset._changes = { "myList" : new ListChangeset(myList) };

          expect(_changeset.hasChanges).toBe(false);
        });
      }); //endregion #hasChanges

      //region #getChange
      describe("#getChange -", function() {
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
      }); //endregion #getChange

      //region #hasChange
      describe("#hasChange -", function() {
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
      }); //endregion #hasChange

      //region #get
      describe("#get -", function() {
        it("should throw an error if the property does not exist in the owner of the changeset", function() {
          expect(function() {
            changeset.get("baz");
          }).toThrow(errorMatch.argInvalid("name"));
        });

        it("should return the property's original value if it hasn't changed", function() {
          expect(changeset.get("bar").value).toBe(6);
        });

        it("should return the the property's new value if has changed", function() {
          var list = changeset.get("myList");

          expect(list.count).toBe(2);
          expect(list.at(0).value).toBe(1);
          expect(list.at(1).value).toBe(3);
        });
      }); //endregion #get

      //region #getOld
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
      }); //endregion #getOld

      //region #_set
      describe("#_set -", function() {
        function _setShouldThrow(context, property, value) {
          expect(function() {
            context._set(property, value);
          }).toThrow(errorMatch.argRequired("name"));
        }

        it("should throw an error if property name is `nully`", function() {
          _setShouldThrow(changeset, undefined, 1);
          _setShouldThrow(changeset, null, 1);
          _setShouldThrow(changeset);
        });

        it("should add a new property to the ComplexChangeset", function() {
          expect(changeset.hasChange("bar")).toBe(false);
          changeset._set("bar", 1);
          expect(changeset.hasChange("bar")).toBe(true);
        });

        it("should update a property `change` if it already exists in the ComplexChangeset", function() {
          expect(changeset.getOld("foo").valueOf()).toBe(5);
          expect(changeset.get("foo").valueOf()).toBe(10);

          changeset._set("foo", 1);

          expect(changeset.getOld("foo").valueOf()).toBe(5);
          expect(changeset.get("foo").valueOf()).toBe(1);
        });

        it("should not create a change, when the value is the same", function() {
          expect(changeset.getChange("bar")).toBeNull();

          changeset._set("bar", 6);

          expect(changeset.getChange("bar")).toBeNull();
        });

        it("should create a `ListChangeset` when the value is a list", function() {
          changeset._set("myList", [2,3]);

          expect(changeset.getChange("myList").type).toBe("list");
        });

        it("should redirect Complex#set on owner to its current changeset", function() {
          var Derived = Complex.extend({type: {props: ["foo"]}});
          var derived = new Derived({foo: "bar"});
          var changeset = new ComplexChangeset(derived);

          expect(changeset.hasChanges).toBe(false);
          expect(changeset.owner).toBe(derived);
          expect(derived._changeset).toBe(changeset);

          // ---

          derived.set("foo", "guru");

          // ---

          expect(changeset.hasChange("foo")).toBe(true);
        });
      }); //endregion #_set

      //region #propertyNames
      describe("#propertyNames -", function() {
        it("should return an empty array if it is a newly created changeset", function() {
          var _changeset = new ComplexChangeset({});
          var propertyNames = _changeset.propertyNames;

          expect(propertyNames instanceof Array).toBe(true);
          expect(propertyNames.length).toBe(0);
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
      }); //endregion #propertyNames

      //region #apply
      describe("#apply -", function() {
        it("should apply changes to its owner", function() {
          var complex = changeset.owner;

          expect(complex.get("foo").valueOf()).toBe(5);

          changeset.apply();

          expect(complex.get("foo").valueOf()).toBe(10);
        });

        it("should apply all changes of a contained ListChangeset", function() {
          expect(myList.count).toBe(1);
          expect(myList.at(0).value).toBe(1);

          changeset.apply();

          expect(myList.count).toBe(2);
          expect(myList.at(0).value).toBe(1);
          expect(myList.at(1).value).toBe(3);
        });
      }); //endregion #apply

      //region #cancel
      describe("#cancel", function() {
        it("should cancel contained changesets", function() {
          expect(changeset.isProposed).toBe(true);
          expect(listChangeset.isProposed).toBe(true);

          changeset.cancel();

          expect(changeset.isCanceled).toBe(true);
          expect(listChangeset.isCanceled).toBe(true);
        });
      }); //endregion #cancel

      //region #_clearChanges
      describe("#_clearChanges", function() {
        it("should retain no changes", function() {
          expect(changeset.hasChanges).toBe(true);
          expect(listChangeset.hasChanges).toBe(true);

          changeset.clearChanges();

          expect(changeset.hasChanges).toBe(false);
        });

        it("should cancel contained changesets", function() {
          expect(changeset.hasChanges).toBe(true);
          expect(listChangeset.isProposed).toBe(true);

          changeset.clearChanges();

          expect(changeset.isProposed).toBe(true);
          expect(listChangeset.isCanceled).toBe(true);
        });
      }); //endregion #cancel
    }); //end instance

  }); //end pentaho.lang.ComplexChangeset

});
