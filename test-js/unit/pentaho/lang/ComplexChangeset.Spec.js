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
  "pentaho/lang/ComplexChangeset",
  "pentaho/lang/Base",
  "pentaho/util/error"
], function(ComplexChangeset, Base, error) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.lang.ComplexChangeset -", function() {

    it("should be defined.", function () {
      expect(typeof ComplexChangeset).toBeDefined();
    });

    describe("instance -", function() {
      var changeset,
        properties = ["foo", "bar"];

      var owner = {
        type: {
          get: function() {
            return {
              get isList() { return false; },
              toValue: function(value) { return value; }
            };
          }
        },
        get: function() {}
      };

      beforeEach(function() {
        changeset = new ComplexChangeset(owner);
        properties.forEach(function(prop, i) {
          changeset._setValueChange(prop, 10 + i, 5 + i);
        });
      });

      describe("#owner -", function() {
        it("should return the same owner that was passed to the constructor", function() {
          expect(changeset.owner).toBe(owner);
        });

        it("changeset owner should be immutable", function() {
          expect(function() { changeset.owner = "foo"; }).toThrowError(TypeError);
        })
      });

      describe("#has -", function() {
        it("should return `true` if the property exists in the ComplexChangeset", function() {
          expect(changeset.has("foo")).toBe(true);
        });

        it("should return `false` if the property does not exist in the ComplexChangeset", function() {
          expect(changeset.has("baz")).toBe(false);
        });
      }); //end #has

      describe("#get -", function() {
        it("should return `null` if the property does not exist", function() {
          expect(changeset.has("baz")).toBe(false);
          expect(changeset.get("baz")).toBe(null);
        });

        it("should return the change object for the given property if it exists", function() {
          expect(changeset.has("foo")).toBe(true);
          expect(changeset.get("foo")).not.toBe(null);
        });
      }); //end #get

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

        it("should updated a property `change` if it already exists in the ComplexChangeset", function() {
          expect(changeset.get("foo").oldValue).toBe(5);
          expect(changeset.get("foo").newValue).toBe(10);

          changeset.set("foo", 1);

          expect(changeset.get("foo").oldValue).toBe(5);
          expect(changeset.get("foo").newValue).toBe(1);
        });

        function _setShouldThrow(context, property, value) {
          expect(function() { context.set(property, value); }).toThrow(error.argRequired("property"));
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
          expect(function() { changeset.propertyNames = "foo"; }).toThrowError(TypeError);
        });
      }); //end #propertyNames

      describe("#each", function() {
        it("should iterate throw all properties in the changeset", function() {
          var index = 0;
          changeset.each(function(prop, name) {
            expect(name).toBe(properties[index++]);
          }, changeset);

          expect(changeset.propertyNames.length).toBe(index);
        });
      }); //end #each

    }); //end instance

  }); //end pentaho.lang.ComplexChangeset

});