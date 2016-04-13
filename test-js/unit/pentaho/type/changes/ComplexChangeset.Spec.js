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
  "pentaho/type/Context",
  "pentaho/type/complex",
  "pentaho/type/list",
  "pentaho/type/number",
  "pentaho/lang/Base",
  "tests/pentaho/util/errorMatch"
], function(ComplexChangeset, ListChangeset, Replace,
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

  describe("pentaho.type.ComplexChangeset -", function() {

    it("should be defined.", function () {
      expect(typeof ComplexChangeset).toBeDefined();
    });

    describe("instance -", function() {
      var changeset, owner, listChangeset,
        myList = new NumberList([1]),
        properties = ["foo", "bar", "myList"];

      beforeEach(function() {
        listChangeset = new ListChangeset(myList);
        listChangeset._insertOne(new PentahoNumber(3), 1);

        owner = {
          _values: {
            "foo": 5,
            "bar": 6,
            "other": 7,
            "myList": myList,
            "null": null
          },
          type: {
            get: function(name) {
              return {
                get isList() { return name === "myList" },
                get name(){ return name === "null" ? null : name; },
                type: {
                  areEqual: function(v0, v1) {
                    return v0 === v1;
                  }
                },
                toValue: function(value) { return value; }
              };
            }
          },
          get: function(prop) { return this._values[prop]; }
        };

        changeset = new ComplexChangeset(owner);
        changeset._changes = {
          "foo": new Replace("foo", 10),
          "bar": new Replace("bar", 11),
          "myList": listChangeset
        };
      });

      //region #type
      describe("#type", function() {
        it("should return a string with the value `complex`", function() {
          expect(changeset.type).toBe("complex");
        });
      }); //endregion #type

      //region #hasChange
      describe("#hasChange -", function() {
        it("should return `true` if the property exists in the ComplexChangeset", function() {
          expect(changeset.hasChange("foo")).toBe(true);
        });

        it("should return `false` if the property does not exist in the ComplexChangeset", function() {
          expect(changeset.hasChange("baz")).toBe(false);
        });
      }); //endregion #hasChange

      //region #hasChanges
      describe("#hasChanges -", function() {
        it("should return `true` if the ComplexChangeset has changes", function() {
          expect(changeset.hasChanges).toBe(true);
        });

        it("should return `false` if the ComplexChangeset does not have changes", function() {
          var emptyChangeset = new ComplexChangeset({});
          expect(emptyChangeset.hasChanges).toBe(false);
        });
      }); //endregion #hasChanges

      //region #getChange
      describe("#getChange -", function() {
        it("should return `null` if the property does not exist", function() {
          expect(changeset.hasChange("baz")).toBe(false);
          expect(changeset.getChange("baz")).toBeNull();
        });

        it("should return the change object for the given property if it exists", function() {
          expect(changeset.hasChange("foo")).toBe(true);
          expect(changeset.getChange("foo")).not.toBeNull();
        });

        it("should return `null` if the property exist, but the name as the value `null`", function() {
          expect(changeset.getChange("null")).toBeNull();
        });
      }); //endregion #getChange

      //region #get
      describe("#get -", function() {
        it("should return `null` if the property does not exist", function() {
          expect(changeset.get("baz")).toBeNull();
        });

        it("should return the new value by applying all the changes present for that property", function() {
          var list = changeset.get("myList");

          expect(list.count).toBe(2);
          expect(list.at(0).value).toBe(1);
          expect(list.at(1).value).toBe(3);
        });
      }); //endregion #get

      //region #getOld
      describe("#getOld -", function() {
        it("should return `null` if the property does not exist", function() {
          expect(changeset.getOld("baz")).toBeNull();
        });

        it("should get the old value from the owner in a replace change", function() {
          spyOn(owner, "get").and.callThrough();

          expect(changeset.getOld("foo")).toBe(5);
          expect(owner.get).toHaveBeenCalledWith("foo");
        });

        it("should return the old value before applying the change", function() {
          var list = changeset.getOld("myList");

          expect(list.count).toBe(1);
          expect(list.at(0).value).toBe(1);
        });
      }); //endregion #getOld

      //region #set
      describe("#set -", function() {
        it("should throw an error if property name is `nully`", function() {
          _setShouldThrow(changeset, undefined, 1);
          _setShouldThrow(changeset, null, 1);
          _setShouldThrow(changeset);
        });

        it("should add a new property to the ComplexChangeset", function() {
          expect(changeset.hasChange("baz")).toBe(false);
          changeset.set("baz", 1);
          expect(changeset.hasChange("baz")).toBe(true);
        });

        it("should update a property `change` if it already exists in the ComplexChangeset", function() {
          expect(changeset.getOld("foo").valueOf()).toBe(5);
          expect(changeset.get("foo").valueOf()).toBe(10);

          changeset.set("foo", 1);

          expect(changeset.getOld("foo").valueOf()).toBe(5);
          expect(changeset.get("foo").valueOf()).toBe(1);
        });

        it("should not create a change, when the value is the same", function() {
          expect(changeset.getChange("other")).toBeNull();

          changeset.set("other", 7);

          expect(changeset.getChange("other")).toBeNull();
        });

        it("should create a `ListChangeset` when the value is a list", function() {
          changeset.set("myList", [2,3]);

          expect(changeset.getChange("myList").type).toBe("list");
        });

        function _setShouldThrow(context, property, value) {
          expect(function() {
            context.set(property, value);
          }).toThrow(errorMatch.argRequired("name"));
        }
      }); //endregion #set

      //region #propertyNames
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
      }); //endregion #propertyNames

      //region #apply
      describe("#apply -", function() {
        beforeEach(function() {
          changeset._changes =  {
            "foo": new Replace("foo", 12)
          };
        });

        it("should apply changes to the complex provided and don't change its own", function() {
          var Derived = Complex.extend({
            type: {props: [{name: "foo", type: "number"}]}
          });
          var complex = new Derived({foo: 10});

          expect(complex.get("foo").valueOf()).toBe(10);
          changeset.apply(complex);

          expect(complex.get("foo").valueOf()).toBe(12);
          expect(changeset.owner.get("foo").valueOf()).toBe(5);
        });

        it("should apply changes to its own complex when none is provided", function() {
          var complex = changeset.owner;

          expect(complex.get("foo").valueOf()).toBe(5);
          changeset.apply();

          expect(complex.get("foo").valueOf()).toBe(12);
        });

        it("Should apply all changes inside a ListChangeset by applying all the changes present in the ComplexChangeset",
          function() {
            changeset._changes["myList"] = listChangeset;

            expect(myList.count).toBe(1);
            expect(myList.at(0).value).toBe(1);

            changeset.apply();

            expect(myList.count).toBe(2);
            expect(myList.at(0).value).toBe(1);
            expect(myList.at(1).value).toBe(3);
        });
      }); //endregion #apply

      //region #_freeze
      describe("#_freeze -", function() {
        it("should freeze it self and call the freeze method for all changes", function() {
          spyOn(Object, "freeze");
          
          changeset._freeze();
          expect(Object.freeze.calls.count() > 1).toBe(true);
        });
      }); //endregion #_freeze
    }); //end instance

  }); //end pentaho.lang.ComplexChangeset

});
