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
  "pentaho/type/complex",
  "pentaho/type/changes/Changeset",
  "tests/pentaho/util/errorMatch"
], function(Context, complexFactory, Changeset, errorMatch) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  var context = new Context(),
      Complex = context.get(complexFactory);

  describe("pentaho.type.changes.Changeset -", function() {
    it("should be defined", function () {
      expect(typeof Changeset).toBeDefined();
    });

    describe("instance -", function() {

      var owner, changeset;

      beforeEach(function() {
        var Derived = Complex.extend({type: {props: [
                {name: "foo", value: "bar"}
              ]}});

        owner = new Derived();
        changeset = new Changeset(owner);
      });

      it("should throw error when a owner isn't specified", function() {

        function errorOnCreate(value) {
          expect(function() {
            var changeset2 = new Changeset(value);
          }).toThrow(errorMatch.argRequired("owner"));
        }

        errorOnCreate();
        errorOnCreate(null);
        errorOnCreate(undefined);
      });

      //region #owner
      describe("#owner -", function() {
        it("should return the same owner that was passed to the constructor", function() {
          expect(changeset.owner).toBe(owner);
        });

        it("should not allow changing the owner", function() {
          expect(function() {
            changeset.owner = "foo";
          }).toThrowError(TypeError);
        });

        it("should set owner._changeset to the the changeset", function() {
          expect(owner._changeset).toBe(changeset);
        });
      }); //endregion #owner

      //region #hasChanges
      describe("#hasChanges -", function() {
        it("should always return `false`", function() {
          expect(changeset.hasChanges).toBe(false);
        });
      }); //endregion #hasChanges

      //region #apply
      describe("#apply -", function() {

        it("should call _apply", function() {
          changeset._apply = jasmine.createSpy();

          changeset.apply();

          expect(changeset._apply).toHaveBeenCalled();
        });

        it("should call _apply with the owner", function() {
          changeset._apply = jasmine.createSpy();

          changeset.apply();

          expect(changeset._apply).toHaveBeenCalledWith(owner);
        });

        it("should throw when already applied or rejected", function() {
          changeset.reject();

          expect(function() {
            changeset.apply();
          }).toThrow(errorMatch.operInvalid());
        });

        it("should clear the owner's current changeset", function() {
          changeset._apply = jasmine.createSpy();

          expect(owner._changeset).toBe(changeset);

          changeset.apply();

          expect(owner._changeset).toBe(null);
        });
      }); //endregion #apply

      //region #reject
      describe("#reject -", function() {

        it("should call _reject", function() {
          spyOn(changeset, "_reject").and.callThrough();

          changeset.reject();

          expect(changeset._reject).toHaveBeenCalled();
        });

        it("should throw when already applied or rejected", function() {
          changeset.reject();

          expect(function() {
            changeset.reject();
          }).toThrow(errorMatch.operInvalid());
        });

        it("should clear the owner's current changeset", function() {

          expect(owner._changeset).toBe(changeset);

          changeset.reject();

          expect(owner._changeset).toBe(null);
        });
      }); //endregion #reject

      //region #clearChanges
      describe("#clearChanges -", function() {

        it("should call _clearChanges", function() {
          spyOn(changeset, "_clearChanges").and.callThrough();

          changeset.clearChanges();

          expect(changeset._clearChanges).toHaveBeenCalled();
        });

        it("should throw when already applied or rejected", function() {
          changeset.reject();

          expect(function() {
            changeset.clearChanges();
          }).toThrow(errorMatch.operInvalid());
        });
      }); //endregion #clearChanges
    });
  });
});
