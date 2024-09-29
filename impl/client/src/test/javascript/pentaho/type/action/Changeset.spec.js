/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/type/Complex",
  "pentaho/type/action/Transaction",
  "pentaho/type/action/Changeset",
  "tests/pentaho/util/errorMatch"
], function(Complex, Transaction, Changeset, errorMatch) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false */

  describe("pentaho.type.action.Changeset", function() {

    it("should be defined", function() {
      expect(typeof Changeset).toBeDefined();
    });

    describe("instance -", function() {

      var Derived;

      var target;
      var changeset;
      var scope;

      beforeAll(function() {

        Derived = Complex.extend({
          $type: {
            props: [
              {name: "foo", defaultValue: "bar"}
            ]
          }
        });
      });

      beforeEach(function() {

        target = new Derived();

        scope = Transaction.enter();

        changeset = new Changeset(scope.transaction, target);
      });

      afterEach(function() {
        if(scope.isCurrent) scope.exit();
      });

      it("should throw error when a transaction isn't specified", function() {

        function errorOnCreate(value) {
          expect(function() {
            var changeset2 = new Changeset(value, target);
          }).toThrow(errorMatch.argRequired("transaction"));
        }

        errorOnCreate();
        errorOnCreate(null);
        errorOnCreate(undefined);
      });

      it("should throw error when an target isn't specified", function() {

        function errorOnCreate(value) {
          expect(function() {
            var changeset2 = new Changeset(scope.transaction, value);
          }).toThrow(errorMatch.argRequired("target"));
        }

        errorOnCreate();
        errorOnCreate(null);
        errorOnCreate(undefined);
      });

      it("should initially have isReadOnly=false", function() {

        expect(changeset.isReadOnly).toBe(false);
      });

      describe("#transactionVersion", function() {

        it("should be initialized with its transaction's current version number", function() {

          var transaction = scope.transaction;
          var transactionVersion = transaction.version;

          expect(changeset.transactionVersion).toBe(transactionVersion);
        });
      });

      // region #target
      describe("#target -", function() {
        it("should return the same target that was passed to the constructor", function() {
          expect(changeset.target).toBe(target);
        });

        it("should not allow changing the target", function() {
          expect(function() {
            changeset.target = "foo";
          }).toThrowError(TypeError);
        });
      }); // endregion #target

      // region #targetVersion
      describe("#targetVersion -", function() {
        it("should return the version of the target at the time it was passed to the constructor", function() {

          var v = target.$version;

          expect(changeset.targetVersion).toBe(v);
        });

        it("should not allow changing the targetVersion", function() {
          expect(function() {
            changeset.targetVersion = 200;
          }).toThrowError(TypeError);
        });
      }); // endregion #targetVersion

      // region #_applyInternal
      describe("#_applyInternal(version)", function() {

        it("should call _apply", function() {
          changeset._apply = jasmine.createSpy();

          changeset._applyInternal(1);

          expect(changeset._apply).toHaveBeenCalled();
        });

        it("should call target.__setVersionInternal", function() {
          changeset._apply = jasmine.createSpy();

          spyOn(changeset.target, "__setVersionInternal");

          changeset._applyInternal(1);

          expect(changeset.target.__setVersionInternal).toHaveBeenCalledWith(1);
        });

        it("should call _apply with the target", function() {
          changeset._apply = jasmine.createSpy();

          changeset._applyInternal(1);

          expect(changeset._apply).toHaveBeenCalledWith(target);
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

          changeset.__setReadOnlyInternal();

          expect(function() {
            changeset.clearChanges();
          }).toThrow(errorMatch.operInvalid());
        });

        it("should increment #transactionVersion", function() {

          changeset._clearChanges = jasmine.createSpy();

          var transactionVersion = changeset.transactionVersion;

          changeset.clearChanges();

          expect(changeset.transactionVersion).toBeGreaterThan(transactionVersion);
        });
      }); // endregion #clearChanges
    });
  });
});
