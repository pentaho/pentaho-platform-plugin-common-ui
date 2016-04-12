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
  "pentaho/type/changes/Changeset",
  "pentaho/type/changes/SimpleChange",
  "pentaho/lang/Base",
  "tests/pentaho/util/errorMatch"
], function(Changeset, SimpleChange, Base, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.type.Changeset -", function() {

    it("should be defined.", function () {
      expect(typeof Changeset).toBeDefined();
    });

    describe("instance -", function() {
      var changeset,
        properties = ["foo", "bar"];

      var owner = {
        _values: {
          "foo": 5,
          "bar": 6
        },
        type: {
          get: function(name) {
            return {
              get isList() { return false; },
              get name(){ return name;},
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

      beforeEach(function() { 
        changeset = new Changeset(owner);
        changeset._properties = {
          "foo": new SimpleChange(owner, "foo", 10),
          "bar": new SimpleChange(owner, "bar", 11)
        };
      });

      describe("#owner -", function() {
        it("should return the same owner that was passed to the constructor", function() {
          expect(changeset.owner).toBe(owner);
        });

        it("changeset owner should be immutable", function() {
          expect(function() {
            changeset.owner = "foo";
          }).toThrowError(TypeError);
        });
      });

      describe("#has -", function() {
        it("should return `true` if the property exists in the ComplexChangeset", function() {
          expect(changeset.has("foo")).toBe(true);
        });

        it("should return `false` if the property does not exist in the ComplexChangeset", function() {
          expect(changeset.has("baz")).toBe(false);
        });
      }); //end #has

      describe("#getChange -", function() {
        it("should return `null` if the property does not exist", function() {
          expect(changeset.has("baz")).toBe(false);
          expect(changeset.getChange("baz")).toBe(null);
        });

        it("should return the change object for the given property if it exists", function() {
          expect(changeset.has("foo")).toBe(true);
          expect(changeset.getChange("foo")).not.toBe(null);
        });
      }); //end #getChange

      describe("#set -", function() {
        it("should throw an error if property name is `nully`", function() {
          _setShouldThrow(changeset, undefined, 1);
          _setShouldThrow(changeset, null, 1);
          _setShouldThrow(changeset);
        });

        it("should add a new property to the ComplexChangeset", function() {
          expect(changeset.has("baz")).toBe(false);
          changeset.set("baz", 1);
          expect(changeset.has("baz")).toBe(true);
        });

        it("should update a property `change` if it already exists in the ComplexChangeset", function() {
          expect(changeset.getChange("foo").oldValue).toBe(5);
          expect(changeset.getChange("foo").newValue).toBe(10);

          changeset.set("foo", 1);

          expect(changeset.getChange("foo").oldValue).toBe(5);
          expect(changeset.getChange("foo").newValue).toBe(1);
        });

        function _setShouldThrow(context, property, value) {
          expect(function() {
            context.set(property, value);
          }).toThrow(errorMatch.argRequired("name"));
        }
      }); //end #set

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
      }); //end #propertyNames

    }); //end instance

  }); //end pentaho.lang.ComplexChangeset

});