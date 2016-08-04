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
  "pentaho/type/changes/Changeset",
  "tests/pentaho/util/errorMatch"
], function(Context, Changeset, errorMatch) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.type.changes.Changeset", function() {

    var context, Complex;

    beforeEach(function() {
      context = new Context();
      Complex = context.get("complex");
    });

    it("should be defined", function () {
      expect(typeof Changeset).toBeDefined();
    });

    describe("instance -", function() {

      var owner, changeset, scope;

      beforeEach(function() {
        var Derived = Complex.extend({type: {props: [
                {name: "foo", value: "bar"}
              ]}});

        owner = new Derived();

        scope = context.enterChange();

        changeset = new Changeset(context.transaction, owner);
      });

      afterEach(function() {
        if(scope.isCurrent) scope.exit();
      });

      it("should throw error when a transaction isn't specified", function() {

        function errorOnCreate(value) {
          expect(function() {
            var changeset2 = new Changeset(value, owner);
          }).toThrow(errorMatch.argRequired("transaction"));
        }

        errorOnCreate();
        errorOnCreate(null);
        errorOnCreate(undefined);
      });

      it("should throw error when an owner isn't specified", function() {

        function errorOnCreate(value) {
          expect(function() {
            var changeset2 = new Changeset(context.transaction, value);
          }).toThrow(errorMatch.argRequired("owner"));
        }

        errorOnCreate();
        errorOnCreate(null);
        errorOnCreate(undefined);
      });

      it("should initially have isReadOnly=false", function() {

        expect(changeset.isReadOnly).toBe(false);
      });

      // region #owner
      describe("#owner -", function() {
        it("should return the same owner that was passed to the constructor", function() {
          expect(changeset.owner).toBe(owner);
        });

        it("should not allow changing the owner", function() {
          expect(function() {
            changeset.owner = "foo";
          }).toThrowError(TypeError);
        });
      }); // endregion #owner

      // region #ownerVersion
      describe("#ownerVersion -", function() {
        it("should return the version of the owner at the time it was passed to the constructor", function() {

          var v = owner.$version;

          expect(changeset.ownerVersion).toBe(v);
        });

        it("should not allow changing the ownerVersion", function() {
          expect(function() {
            changeset.ownerVersion = 200;
          }).toThrowError(TypeError);
        });
      }); // endregion #ownerVersion

      // region #_applyInternal
      describe("#_applyInternal(version)", function() {

        it("should call _apply", function() {
          changeset._apply = jasmine.createSpy();

          changeset._applyInternal(1);

          expect(changeset._apply).toHaveBeenCalled();
        });

        it("should call owner._setVersionInternal", function() {
          changeset._apply = jasmine.createSpy();

          spyOn(changeset.owner, "_setVersionInternal");

          changeset._applyInternal(1);

          expect(changeset.owner._setVersionInternal).toHaveBeenCalledWith(1);
        });

        it("should call _apply with the owner", function() {
          changeset._apply = jasmine.createSpy();

          changeset._applyInternal(1);

          expect(changeset._apply).toHaveBeenCalledWith(owner);
        });
      }); // endregion #_applyInternal

      // region #clearChanges
      describe("#clearChanges -", function() {

        it("should call _clearChanges", function() {
          changeset._clearChanges = jasmine.createSpy();

          changeset.clearChanges();

          expect(changeset._clearChanges).toHaveBeenCalled();
        });

        it("should throw when read-only", function() {
          changeset._setReadOnlyInternal();

          expect(function() {
            changeset.clearChanges();
          }).toThrow(errorMatch.operInvalid());
        });
      }); // endregion #clearChanges
    });
  });
});
