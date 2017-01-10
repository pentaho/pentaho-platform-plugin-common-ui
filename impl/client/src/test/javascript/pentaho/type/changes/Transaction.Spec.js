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
  "pentaho/type/changes/TransactionScope",
  "pentaho/type/changes/Transaction",
  "pentaho/type/changes/TransactionRejectedError",
  "pentaho/type/changes/Changeset",
  "pentaho/type/changes/ChangeRef",
  "tests/pentaho/util/errorMatch"
], function(Context, TransactionScope, Transaction, TransactionRejectedError, Changeset, ChangeRef, errorMatch) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, jasmine:false */

  describe("pentaho.type.changes.Transaction", function() {
    var context;

    beforeEach(function() {
      context = new Context();
    });

    describe("new(context)", function() {
      it("should be defined", function () {
        expect(typeof Transaction).toBeDefined();
      });

      it("should throw if context is not specified", function () {
        expect(function() {
          var txn = new Transaction();
        }).toThrow(errorMatch.argRequired("context"));
      });

      it("should have isProposed = true", function() {
        var txn = new Transaction(context);

        expect(txn.isProposed).toBe(true);
      });

      it("should have isReadOnly = false", function() {
        var txn = new Transaction(context);

        expect(txn.isReadOnly).toBe(false);
      });

      it("should have isCurrent = false", function() {
        var txn = new Transaction(context);

        expect(txn.isCurrent).toBe(false);
      });

      it("should have result = null", function() {
        var txn = new Transaction(context);

        expect(txn.result).toBe(null);
      });
    });

    describe("#getChangeset(uid)", function() {
      var Derived;

      beforeEach(function() {
        Derived = context.get({props: ["x"]});
      });

      it("should return null for a container which has had no changes yet", function() {
        var txn = new Transaction(context);
        var container = new Derived();

        var cset = txn.getChangeset(container);

        expect(cset).toBe(null);
      });

      it("should return a changeset for a container which has changes", function() {
        var txn = new Transaction(context);
        var scope = txn.enter();
        var container = new Derived();
        container.x = "foo";

        var cset = txn.getChangeset(container.$uid);

        expect(cset instanceof Changeset).toBe(true);

        scope.exit();
      });

      it("should return a changeset whose owner is container", function() {
        var txn = new Transaction(context);
        var scope = txn.enter();
        var container = new Derived();
        container.x = "foo";

        var cset = txn.getChangeset(container.$uid);

        expect(cset.owner).toBe(container);

        scope.exit();
      });

      it("should return a changeset for a container which has had changes", function() {
        var txn = new Transaction(context);
        var scope = txn.enter();
        var container = new Derived();
        container.x = "foo";
        container.changeset.clearChanges();

        var cset = txn.getChangeset(container.$uid);

        expect(cset instanceof Changeset).toBe(true);

        scope.exit();
      });
    });

    describe("#_addChangeset(changeset)", function() {
      var Derived;

      beforeEach(function() {
        Derived = context.get({props: ["x"]});
      });

      it("should throw if transaction is already read-only", function() {
        var txn = new Transaction(context);
        var scope = txn.enter();
        scope.acceptWill();
        scope.exit();

        expect(txn.isReadOnly).toBe(true);
        expect(txn.isProposed).toBe(true);

        var container = new Derived();

        expect(function() {
          var cset = new Changeset(txn, container);
        }).toThrow(errorMatch.operInvalid());
      });

      it("should add the changeset and make it available through #getChangeset", function() {
        var txn = new Transaction(context);
        var container = new Derived();

        var cset = new Changeset(txn, container);

        var cset2 = txn.getChangeset(container.$uid);

        expect(cset).toBe(cset2);
      });

      it("should add the changeset and not sync the container's changeset if txn is not current", function() {
        var txn = new Transaction(context);
        var container = new Derived();
        var cset = new Changeset(txn, container);

        expect(container.changeset).toBe(null);
      });

      it("should add the changeset and sync the container's changeset if txn is current", function() {
        var txn = new Transaction(context);
        var scope = txn.enter();

        var container = new Derived();
        var cset = new Changeset(txn, container);

        expect(container.changeset).toBe(cset);

        scope.exit();
      });
    });

    describe("#_ensureChangeRef(container)", function() {
      var Derived;

      beforeEach(function() {
        Derived = context.get({props: ["x"]});
      });

      it("should create a ChangeRef for a container which has no ref changes yet", function() {
        var txn = new Transaction(context);
        var container = new Derived();

        var cref = txn._ensureChangeRef(container);

        expect(cref instanceof ChangeRef).toBe(true);
      });

      it("should return the same  ChangeRef for a container which has had ref changes", function() {
        var txn = new Transaction(context);
        var scope = txn.enter();
        var container = new Derived();

        var cref1 = txn._ensureChangeRef(container);
        var cref2 = txn._ensureChangeRef(container);

        expect(cref1).toBe(cref2);

        scope.exit();
      });

      it("should return a ChangeRef with container as its owner", function() {
        var txn = new Transaction(context);
        var scope = txn.enter();
        var container = new Derived();

        var cref = txn._ensureChangeRef(container);

        expect(cref.owner).toBe(container);

        scope.exit();
      });
    });

    describe("#_getChangeRef(uid)", function() {
      var Derived;

      beforeEach(function() {
        Derived = context.get({props: ["x"]});
      });

      it("should return null for a container which has had no ref changes yet", function() {
        var txn = new Transaction(context);
        var container = new Derived();

        var cref = txn._getChangeRef(container.$uid);

        expect(cref).toBe(null);
      });

      it("should return a ChangeRef for a container which has ref changes", function() {
        var txn = new Transaction(context);
        var scope = txn.enter();
        var container = new Derived();
        txn._ensureChangeRef(container);

        var cref = txn._getChangeRef(container.$uid);

        expect(cref instanceof ChangeRef).toBe(true);

        scope.exit();
      });

      it("should return a ChangeRef whose owner is container", function() {
        var txn = new Transaction(context);
        var scope = txn.enter();
        var container = new Derived();
        txn._ensureChangeRef(container);

        var cref = txn._getChangeRef(container.$uid);

        expect(cref.owner).toBe(container);

        scope.exit();
      });
    });

    describe("#_eachChangeset(fun)", function() {
      var Derived, txn, scope, inst1, inst2, inst3;

      beforeEach(function() {
        Derived = context.get({props: ["x"]});

        txn = new Transaction(context);

        scope = txn.enter();

        inst1 = new Derived();
        inst2 = new Derived();
        inst3 = new Derived();

        inst1.x = "1";
        inst2.x = "2";
        inst3.x = "3";
      });

      afterEach(function() {
        scope.exit();
      });

      it("should call fun once per changeset in the transaction", function() {
        var fun = jasmine.createSpy();

        txn._eachChangeset(fun);

        expect(fun.calls.count()).toBe(3);
      });

      it("should call fun once with each changeset in the transaction", function() {
        var fun = jasmine.createSpy();

        txn._eachChangeset(fun);

        expect(fun).toHaveBeenCalledWith(inst1.changeset);
        expect(fun).toHaveBeenCalledWith(inst2.changeset);
        expect(fun).toHaveBeenCalledWith(inst3.changeset);
      });

      it("should call fun with the transaction as JS context", function() {
        var fun = jasmine.createSpy();

        txn._eachChangeset(fun);

        expect(fun.calls.first().object).toBe(txn);
      });
    });

    // enter, _scopeEnter, _enteringAmbient
    describe("#enter()", function() {
      var Derived, txn;

      beforeEach(function() {
        Derived = context.get({props: ["x"]});

        txn = new Transaction(context);
      });

      it("should return a transaction scope", function() {

        var scope = txn.enter();

        expect(scope instanceof TransactionScope).toBe(true);

        scope.exit();
      });

      it("should return a new transaction scope each time", function() {

        var scope1 = txn.enter();
        var scope2 = txn.enter();

        expect(scope1).not.toBe(scope2);

        scope2.exit();
        scope1.exit();
      });

      it("should return a first scope that has isRoot=true", function() {

        var scope = txn.enter();

        expect(scope.isRoot).toBe(true);

        scope.exit();
      });

      it("should return a second transaction scope that has isRoot=false", function() {

        var scope1 = txn.enter();
        var scope2 = txn.enter();

        expect(scope2.isRoot).toBe(false);

        scope2.exit();
        scope1.exit();
      });

      it("should return a transaction scope with context as its context", function() {

        var scope = txn.enter();

        expect(scope.context).toBe(txn.context);

        scope.exit();
      });

      it("should then have isCurrent = true", function() {

        var scope = txn.enter();

        expect(txn.isCurrent).toBe(true);

        scope.exit();
      });

      it("should still have isReadOnly = false", function() {

        var scope = txn.enter();

        expect(txn.isReadOnly).toBe(false);

        scope.exit();
      });

      it("should return a transaction scope with transaction as its transaction", function() {

        var scope = txn.enter();

        expect(scope.transaction).toBe(txn);

        scope.exit();
      });

      it("should throw if transaction already committed", function() {

        txn.enter().accept();

        expect(function() {
          txn.enter();
        }).toThrow(errorMatch.operInvalid());
      });

      it("should throw if in transaction is in concurrency error", function() {

        var scope = txn.enter();

        var container = new Derived();
        container.x = "foo";

        scope.exit();

        // txn is not committed!

        expect(container.x).toBe(null);

        // Now change container aside

        container.x = "bar";

        // Now try to reenter the old transaction

        expect(function() {
          txn.enter();
        }).toThrowError(TransactionRejectedError);
      });

      it("should attach changesets to modified containers", function() {
        var scope = txn.enter();

        var inst1 = new Derived();
        var inst2 = new Derived();
        var inst3 = new Derived();

        inst1.x = "1";
        inst2.x = "2";
        inst3.x = "3";

        scope.exit();

        expect(inst1.changeset).toBe(null);
        expect(inst2.changeset).toBe(null);
        expect(inst3.changeset).toBe(null);

        scope = txn.enter();

        var cset1 = txn.getChangeset(inst1.$uid);
        var cset2 = txn.getChangeset(inst2.$uid);
        var cset3 = txn.getChangeset(inst3.$uid);

        expect(cset1).not.toBe(null);
        expect(cset2).not.toBe(null);
        expect(cset3).not.toBe(null);

        expect(inst1.changeset).toBe(cset1);
        expect(inst2.changeset).toBe(cset2);
        expect(inst3.changeset).toBe(cset3);

        scope.exit();
      });

      it("should detach changesets from modified containers on scope exit", function() {
        var scope = txn.enter();

        var inst1 = new Derived();
        var inst2 = new Derived();
        var inst3 = new Derived();

        inst1.x = "1";
        inst2.x = "2";
        inst3.x = "3";

        var cset1 = txn.getChangeset(inst1.$uid);
        var cset2 = txn.getChangeset(inst2.$uid);
        var cset3 = txn.getChangeset(inst3.$uid);

        expect(inst1.changeset).toBe(cset1);
        expect(inst2.changeset).toBe(cset2);
        expect(inst3.changeset).toBe(cset3);

        scope.exit();

        expect(inst1.changeset).toBe(null);
        expect(inst2.changeset).toBe(null);
        expect(inst3.changeset).toBe(null);
      });
    });
  });
});
