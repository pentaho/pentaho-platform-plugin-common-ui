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
  "tests/pentaho/util/errorMatch"
], function(Changeset, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.type.changes.Changeset -", function() {
    it("should be defined", function () {
      expect(typeof Changeset).toBeDefined();
    });

    describe("instance -", function() {
      function errorOnCreate(value) {
        expect(function() {
          new Changeset(value);
        }).toThrow(errorMatch.argRequired("owner"));
      }

      var owner, changeset;
      beforeEach(function() {
        owner = {"foo":"bar"};
        changeset = new Changeset(owner);
      });

      it("should throw error when a owner isn't specified", function() {
        errorOnCreate();
        errorOnCreate(null);
        errorOnCreate(undefined);
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

      describe("#newValue -", function() {
        it("should return undefined", function() {
          expect(changeset.newValue).not.toBeDefined();
        });
      });

      describe("#oldValue -", function() {
        it("should return undefined", function() {
          expect(changeset.oldValue).not.toBeDefined();
        });
      });

      describe("#apply -", function() {
        it("Should throw a `Not Implemented` error", function() {
          expect(function() {
            changeset.apply();
          }).toThrow(errorMatch.notImplemented());
        });
      });

    });

  });

});
