/*!
 * Copyright 2010 - 2019 Hitachi Vantara. All rights reserved.
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
  "pentaho/type/Complex",
  "pentaho/type/action/TransactionScope",
  "pentaho/type/action/Transaction",
  "pentaho/type/action/TransactionRejectedError",
  "pentaho/type/action/Changeset",
  "pentaho/type/action/ChangeRef",
  "tests/pentaho/util/errorMatch"
], function(Complex, TransactionScope, Transaction, TransactionRejectedError, Changeset, ChangeRef, errorMatch) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, jasmine:false */

  describe("pentaho.type.action.Transaction", function() {

    var DerivedComplex;

    beforeAll(function() {
      DerivedComplex = Complex.extend({
        $type: {
          props: ["x"]
        }
      });
    });

    describe("new()", function() {
      it("should be defined", function() {
        expect(typeof Transaction).toBeDefined();
      });

      it("should have isReadOnly = false", function() {
        var txn = new Transaction();

        expect(txn.isReadOnly).toBe(false);
      });

      it("should have isCurrent = false", function() {
        var txn = new Transaction();

        expect(txn.isCurrent).toBe(false);
      });
    });

    describe("#getChangeset(uid)", function() {

      it("should return null for a container which has had no changes yet", function() {
        var txn = new Transaction();
        var container = new DerivedComplex();

        var cset = txn.getChangeset(container);

        expect(cset).toBe(null);
      });

      it("should return a changeset for a container which has changes", function() {
        var txn = new Transaction();
        var scope = txn.enter();
        var container = new DerivedComplex();
        container.x = "foo";

        var cset = txn.getChangeset(container.$uid);

        expect(cset instanceof Changeset).toBe(true);

        scope.exit();
      });

      it("should return a changeset whose target is container", function() {
        var txn = new Transaction();
        var scope = txn.enter();
        var container = new DerivedComplex();
        container.x = "foo";

        var cset = txn.getChangeset(container.$uid);

        expect(cset.target).toBe(container);

        scope.exit();
      });

      it("should return a changeset for a container which has had changes", function() {
        var txn = new Transaction();
        var scope = txn.enter();
        var container = new DerivedComplex();
        container.x = "foo";
        container.$changeset.clearChanges();

        var cset = txn.getChangeset(container.$uid);

        expect(cset instanceof Changeset).toBe(true);

        scope.exit();
      });
    });

    describe("#ensureChangeset(changeset)", function() {

      it("should throw if transaction is already read-only and a changeset does not yet exist", function() {
        var txn = new Transaction();
        var scope = txn.enter();
        scope.acceptWill();
        scope.exit();

        expect(txn.isReadOnly).toBe(true);
        expect(txn.isSettled).toBe(false);

        var container = new DerivedComplex();
        expect(function() {
          txn.ensureChangeset(container);
        }).toThrow(errorMatch.operInvalid());
      });

      it("should add the changeset and make it available through #getChangeset", function() {
        var txn = new Transaction();
        var container = new DerivedComplex();

        var cset = txn.ensureChangeset(container);

        var cset2 = txn.getChangeset(container.$uid);

        expect(cset).toBe(cset2);
      });

      it("should add the changeset and not sync the container's changeset if txn is not current", function() {
        var txn = new Transaction();
        var container = new DerivedComplex();

        txn.ensureChangeset(container);

        expect(container.$changeset).toBe(null);
      });

      it("should add the changeset and sync the container's changeset if txn is current", function() {
        var txn = new Transaction();

        var scope = txn.enter();

        var container = new DerivedComplex();

        var cset = txn.ensureChangeset(container);

        expect(container.$changeset).toBe(cset);

        scope.exit();
      });
    });

    describe("#__ensureChangeRef(container)", function() {

      it("should create a ChangeRef for a container which has no ref changes yet", function() {
        var txn = new Transaction();
        var container = new DerivedComplex();

        var cref = txn.__ensureChangeRef(container);

        expect(cref instanceof ChangeRef).toBe(true);
      });

      it("should return the same  ChangeRef for a container which has had ref changes", function() {
        var txn = new Transaction();
        var scope = txn.enter();
        var container = new DerivedComplex();

        var cref1 = txn.__ensureChangeRef(container);
        var cref2 = txn.__ensureChangeRef(container);

        expect(cref1).toBe(cref2);

        scope.exit();
      });

      it("should return a ChangeRef with container as its target", function() {
        var txn = new Transaction();
        var scope = txn.enter();
        var container = new DerivedComplex();

        var cref = txn.__ensureChangeRef(container);

        expect(cref.target).toBe(container);

        scope.exit();
      });
    });

    describe("#__getChangeRef(uid)", function() {

      it("should return null for a container which has had no ref changes yet", function() {
        var txn = new Transaction();
        var container = new DerivedComplex();

        var cref = txn.__getChangeRef(container.$uid);

        expect(cref).toBe(null);
      });

      it("should return a ChangeRef for a container which has ref changes", function() {
        var txn = new Transaction();
        var scope = txn.enter();
        var container = new DerivedComplex();
        txn.__ensureChangeRef(container);

        var cref = txn.__getChangeRef(container.$uid);

        expect(cref instanceof ChangeRef).toBe(true);

        scope.exit();
      });

      it("should return a ChangeRef whose target is container", function() {
        var txn = new Transaction();
        var scope = txn.enter();
        var container = new DerivedComplex();
        txn.__ensureChangeRef(container);

        var cref = txn.__getChangeRef(container.$uid);

        expect(cref.target).toBe(container);

        scope.exit();
      });
    });

    describe("#__eachChangeset(fun)", function() {

      var txn;
      var scope;
      var inst1;
      var inst2;
      var inst3;

      beforeEach(function() {

        txn = new Transaction();

        scope = txn.enter();

        inst1 = new DerivedComplex();
        inst2 = new DerivedComplex();
        inst3 = new DerivedComplex();

        inst1.x = "1";
        inst2.x = "2";
        inst3.x = "3";
      });

      afterEach(function() {
        scope.exit();
      });

      it("should call fun once per changeset in the transaction", function() {
        var fun = jasmine.createSpy();

        txn.__eachChangeset(fun);

        expect(fun.calls.count()).toBe(3);
      });

      it("should call fun once with each changeset in the transaction", function() {
        var fun = jasmine.createSpy();

        txn.__eachChangeset(fun);

        expect(fun).toHaveBeenCalledWith(inst1.$changeset);
        expect(fun).toHaveBeenCalledWith(inst2.$changeset);
        expect(fun).toHaveBeenCalledWith(inst3.$changeset);
      });

      it("should call fun with the transaction as JS context", function() {
        var fun = jasmine.createSpy();

        txn.__eachChangeset(fun);

        expect(fun.calls.first().object).toBe(txn);
      });
    });

    // enter, __scopeEnter, __enteringAmbient
    describe("#enter()", function() {

      var txn;

      beforeEach(function() {
        txn = new Transaction();
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

        var container = new DerivedComplex();
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

        var inst1 = new DerivedComplex();
        var inst2 = new DerivedComplex();
        var inst3 = new DerivedComplex();

        inst1.x = "1";
        inst2.x = "2";
        inst3.x = "3";

        scope.exit();

        expect(inst1.$changeset).toBe(null);
        expect(inst2.$changeset).toBe(null);
        expect(inst3.$changeset).toBe(null);

        scope = txn.enter();

        var cset1 = txn.getChangeset(inst1.$uid);
        var cset2 = txn.getChangeset(inst2.$uid);
        var cset3 = txn.getChangeset(inst3.$uid);

        expect(cset1).not.toBe(null);
        expect(cset2).not.toBe(null);
        expect(cset3).not.toBe(null);

        expect(inst1.$changeset).toBe(cset1);
        expect(inst2.$changeset).toBe(cset2);
        expect(inst3.$changeset).toBe(cset3);

        scope.exit();
      });

      it("should detach changesets from modified containers on scope exit", function() {
        var scope = txn.enter();

        var inst1 = new DerivedComplex();
        var inst2 = new DerivedComplex();
        var inst3 = new DerivedComplex();

        inst1.x = "1";
        inst2.x = "2";
        inst3.x = "3";

        var cset1 = txn.getChangeset(inst1.$uid);
        var cset2 = txn.getChangeset(inst2.$uid);
        var cset3 = txn.getChangeset(inst3.$uid);

        expect(inst1.$changeset).toBe(cset1);
        expect(inst2.$changeset).toBe(cset2);
        expect(inst3.$changeset).toBe(cset3);

        scope.exit();

        expect(inst1.$changeset).toBe(null);
        expect(inst2.$changeset).toBe(null);
        expect(inst3.$changeset).toBe(null);
      });
    });

    describe("#_onPhaseInit", function() {

      var transaction;
      var scope;

      beforeEach(function() {
        transaction = new Transaction();
        scope = transaction.enter();
      });

      afterEach(function() {
        scope.exit();
      });

      // region scenario functions
      function scenarioNeighborhood() {
        // DAG.
        // 3 graphs.
        // Simple values.
        // Complex values.
        // List of complex values.
        // Nodes at 5 != net orders.
        // More than one path to the same node.
        // Leafs and roots at different levels.

        var scenario = {
          graph1: {},
          graph2: {},
          graph3: {}
        };

        scenario.Animal = Complex.extend({
          $type: {
            props: [
              {name: "name", valueType: "string"},
              {name: "age", valueType: "number"}
            ]
          }
        });

        scenario.Person = Complex.extend({
          $type: {
            props: [
              {name: "name", valueType: "string"},
              {name: "age", valueType: "number"},
              {name: "pets", valueType: [scenario.Animal]}
            ]
          }
        });

        scenario.House = Complex.extend({
          $type: {
            props: [
              {name: "color", valueType: "string"},
              {name: "target", valueType: scenario.Person},
              {name: "residents", valueType: [scenario.Person]}
            ]
          }
        });

        /* GRAPH 1
         *
         *  4          3           2             1                       0
         *
         * dog1 ----(pets)----> person1  ---(residents)---------\
         *                 /                                     >--> house1
         * dog2 ----(pets)----> person2  ---(target, residents)--/
         *
         * (8 changesets)
         */
        scenario.graph1.dog1 = new scenario.Animal({name: "oscar", age: 3});
        scenario.graph1.dog2 = new scenario.Animal({name: "wilde", age: 3});
        scenario.graph1.person1 = new scenario.Person({
          name: "Robert",
          age: 30,
          pets: [
            scenario.graph1.dog1, scenario.graph1.dog2
          ]
        });
        scenario.graph1.person2 = new scenario.Person({name: "Maria", age: 33, pets: [scenario.graph1.dog2]});
        scenario.graph1.house1 = new scenario.House({
          color: "red",
          target: scenario.graph1.person2,
          residents: [scenario.graph1.person1, scenario.graph1.person2]
        });

        /* GRAPH 2
         *
         *  4          3            2                1                0
         *
         * cat1 ----(pets)---->  person1  ---(target, residents)--> house1
         *
         *
         * For reference, because of list containers, the actual graph is more like this:
         *
         * cat1 ---- pets ---->  person1  ------ (target) --------> house1
         *                                \                    /
         *                                 \----> residents --/
         *
         *
         * (5 changesets)
         */
        scenario.graph2.cat1 = new scenario.Animal({name: "felix", age: 3});
        scenario.graph2.person1 = new scenario.Person({name: "Sophia", age: 20, pets: [scenario.graph2.cat1]});
        scenario.graph2.house1 = new scenario.House({
          color: "pink",
          target: scenario.graph2.person1,
          residents: [scenario.graph2.person1]
        });

        /* GRAPH 3
         *
         *   2         1            0
         * dog1 ----(pets)---->  person1
         *
         *
         * (3 changesets)
         */
        scenario.graph3.dog1 = new scenario.Animal({name: "can", age: 9});
        scenario.graph3.person1 = new scenario.Person({name: "Trash", age: 20, pets: [scenario.graph3.dog1]});

        return scenario;
      }
      // endregion

      function expectQueue(targets) {

        expect(transaction.__commitInitQueue.slice())
          .toEqual(targets.map(function(target) { return target.$changeset; }));
      }

      describe("when there are no changes", function() {

        it("should return immediately", function() {

          spyOn(transaction, "__setupCommitInitQueue");

          transaction._onPhaseInit();

          expect(transaction.__setupCommitInitQueue).not.toHaveBeenCalled();
        });

        it("should not become rejected", function() {

          transaction._onPhaseInit();

          expect(transaction.isRejected).toBe(false);
        });
      });

      describe("when there are changes", function() {

        it("should call __setupCommitInitQueue to initialize the queue", function() {

          spyOnProperty(transaction, "version", "get").and.returnValue(1);
          spyOn(transaction, "__setupCommitInitQueue").and.callFake(function() {
            transaction.__commitInitQueue = [];
          });

          transaction._onPhaseInit();

          expect(transaction.__setupCommitInitQueue).toHaveBeenCalled();
        });

        describe("#__setupCommitInitQueue", function() {

          it("should create the queue data structures", function() {

            transaction.__setupCommitInitQueue();

            expect(transaction.__commitInitQueue instanceof Array).toBe(true);
            expect(typeof transaction.__commitInitQueueSet).toBe("object");
            expect(transaction.__commitInitChangeset).toBe(null);
          });

          it("should add leaf changesets of all graphs to the queue in correct order", function() {

            var neighborhood = scenarioNeighborhood();

            // Total order:
            // 1. net order descending.
            // 2. changeset creation order.

            // => 3 changesets (net order 2)
            neighborhood.graph3.dog1.name = "can2";

            // => 5 changesets  (net order 4)
            neighborhood.graph1.dog1.name = "oscar2";
            //   Not a leaf  (net order 2)
            neighborhood.graph1.person1.name = "Robert2";

            // => 5 changesets (net order 4)
            neighborhood.graph2.cat1.name = "felix2";

            transaction.__setupCommitInitQueue();

            expectQueue([
              neighborhood.graph1.dog1,
              neighborhood.graph2.cat1,
              neighborhood.graph3.dog1
            ]);
          });

          it("should return false if there are no changeset targets have change:init listeners", function() {

            var neighborhood = scenarioNeighborhood();

            // => 3 changesets (net order 2)
            neighborhood.graph3.dog1.name = "can2";

            var result = transaction.__setupCommitInitQueue();

            expect(result).toBe(false);
          });

          it("should return true if there is at least one changeset target that has change:init listeners", function() {

            var neighborhood = scenarioNeighborhood();

            neighborhood.graph3.dog1.on("change", {init: jasmine.createSpy("change:init")});

            // => 3 changesets (net order 2)
            neighborhood.graph3.dog1.name = "can2";

            var result = transaction.__setupCommitInitQueue();

            expect(result).toBe(true);
          });
        });

        describe("when __setupCommitInitQueue returns false", function() {

          it("should return not rejected immediately", function() {

            var neighborhood = scenarioNeighborhood();

            // => 3 changesets (net order 2)
            neighborhood.graph3.dog1.name = "can2";

            spyOn(transaction, "__setupCommitInitQueue").and.returnValue(false);

            spyOn(neighborhood.graph3.dog1, "_onChangeInit");
            spyOn(neighborhood.graph3.person1, "_onChangeInit");
            spyOn(neighborhood.graph3.person1.pets, "_onChangeInit");

            transaction._onPhaseInit();

            expect(neighborhood.graph3.dog1._onChangeInit).not.toHaveBeenCalled();
            expect(neighborhood.graph3.person1._onChangeInit).not.toHaveBeenCalled();
            expect(neighborhood.graph3.person1.pets._onChangeInit).not.toHaveBeenCalled();

            expect(transaction.isRejected).toBe(false);
          });
        });

        describe("when __setupCommitInitQueue returns true", function() {

          it("should call _onChangeInit on every changeset in queue order", function() {

            var neighborhood = scenarioNeighborhood();

            neighborhood.graph3.dog1.on("change", {init: jasmine.createSpy("change:init")});

            // => 3 changesets (net order 2)
            neighborhood.graph3.dog1.name = "can2";

            var order = 1;
            var dog1Order;
            var petsOrder;
            var person1Order;

            spyOn(neighborhood.graph3.dog1, "_onChangeInit").and.callFake(function() {
              dog1Order = order++;
            });
            spyOn(neighborhood.graph3.person1.pets, "_onChangeInit").and.callFake(function() {
              petsOrder = order++;
            });
            spyOn(neighborhood.graph3.person1, "_onChangeInit").and.callFake(function() {
              person1Order = order++;
            });

            transaction._onPhaseInit();

            expect(neighborhood.graph3.dog1._onChangeInit).toHaveBeenCalledTimes(1);
            expect(neighborhood.graph3.person1._onChangeInit).toHaveBeenCalledTimes(1);
            expect(neighborhood.graph3.person1.pets._onChangeInit).toHaveBeenCalledTimes(1);

            expect(dog1Order).toBe(1);
            expect(petsOrder).toBe(2);
            expect(person1Order).toBe(3);
          });

          describe("when a changeset target cancels the event", function() {

            it("should call __finalizeCommitInitQueue and return rejected", function() {

              var neighborhood = scenarioNeighborhood();

              spyOn(transaction, "__finalizeCommitInitQueue");

              var cancelReason = new Error();

              neighborhood.graph3.dog1.on("change", {init: jasmine.createSpy("change:init")});

              // => 3 changesets (net order 2)
              neighborhood.graph3.dog1.name = "can2";

              spyOn(neighborhood.graph3.dog1, "_onChangeInit")
                .and.callFake(function(actionExecution) {
                  actionExecution.reject(cancelReason);
                });

              spyOn(neighborhood.graph3.person1.pets, "_onChangeInit");
              spyOn(neighborhood.graph3.person1, "_onChangeInit");

              transaction._onPhaseInit();

              expect(transaction.__finalizeCommitInitQueue).toHaveBeenCalledTimes(1);

              expect(transaction.isRejected).toBe(true);
              expect(transaction.error).toBe(cancelReason);
            });

            it("should not call any more changesets", function() {

              // even those already in the queue (as is the case of person2, below)!

              var neighborhood = scenarioNeighborhood();

              spyOn(transaction, "__finalizeCommitInitQueue");

              var cancelReason = new Error();

              neighborhood.graph1.dog2.on("change", {init: jasmine.createSpy("change:init")});

              // => 7 changesets (net order 4)
              neighborhood.graph1.dog2.name = "wilde2";

              // Person1 was created first and will be the first to add an iref in dog2 (through its pets list).
              // So it will be placed in the queue before Person2.
              spyOn(neighborhood.graph1.dog2, "_onChangeInit");
              spyOn(neighborhood.graph1.person1.pets, "_onChangeInit");
              spyOn(neighborhood.graph1.person1, "_onChangeInit")
                .and.callFake(function(actionExecution) {
                  actionExecution.reject(cancelReason);
                });

              spyOn(neighborhood.graph1.person2.pets, "_onChangeInit");
              spyOn(neighborhood.graph1.person2, "_onChangeInit");

              spyOn(neighborhood.graph1.house1.residents, "_onChangeInit");
              spyOn(neighborhood.graph1.house1, "_onChangeInit");

              transaction._onPhaseInit();

              expect(neighborhood.graph1.dog2._onChangeInit).toHaveBeenCalledTimes(1);
              expect(neighborhood.graph1.person1.pets._onChangeInit).toHaveBeenCalledTimes(1);
              expect(neighborhood.graph1.person2.pets._onChangeInit).toHaveBeenCalledTimes(1);
              expect(neighborhood.graph1.person1._onChangeInit).toHaveBeenCalledTimes(1);

              expect(neighborhood.graph1.person2._onChangeInit).not.toHaveBeenCalled();
              expect(neighborhood.graph1.house1.residents._onChangeInit).not.toHaveBeenCalled();
              expect(neighborhood.graph1.house1._onChangeInit).not.toHaveBeenCalled();
            });
          });

          describe("when no changeset target cancels the event", function() {

            describe("when there are multiple paths to a changeset", function() {

              it("should call _onChangeInit on its target only once " +
                "if no additional changes occur", function() {

                var neighborhood = scenarioNeighborhood();

                neighborhood.graph2.cat1.on("change", {init: jasmine.createSpy("change:init")});

                // => 5 changesets (net order 4)
                neighborhood.graph2.cat1.name = "felix2";

                spyOn(neighborhood.graph2.cat1, "_onChangeInit");
                spyOn(neighborhood.graph2.person1.pets, "_onChangeInit");
                spyOn(neighborhood.graph2.person1, "_onChangeInit");
                spyOn(neighborhood.graph2.house1.residents, "_onChangeInit");
                spyOn(neighborhood.graph2.house1, "_onChangeInit");

                transaction._onPhaseInit();

                expect(neighborhood.graph2.cat1._onChangeInit).toHaveBeenCalledTimes(1);
                expect(neighborhood.graph2.person1._onChangeInit).toHaveBeenCalledTimes(1);
                expect(neighborhood.graph2.person1.pets._onChangeInit).toHaveBeenCalledTimes(1);
                expect(neighborhood.graph2.house1.residents._onChangeInit).toHaveBeenCalledTimes(1);
                expect(neighborhood.graph2.house1._onChangeInit).toHaveBeenCalledTimes(1);
              });
            });

            it("should call __finalizeCommitInitQueue and return not rejected", function() {

              var neighborhood = scenarioNeighborhood();

              spyOn(transaction, "__finalizeCommitInitQueue");

              neighborhood.graph3.dog1.on("change", {init: jasmine.createSpy("change:init")});

              // => 3 changesets (net order 2)
              neighborhood.graph3.dog1.name = "can2";

              spyOn(neighborhood.graph3.dog1, "_onChangeInit");
              spyOn(neighborhood.graph3.person1.pets, "_onChangeInit");
              spyOn(neighborhood.graph3.person1, "_onChangeInit");

              transaction._onPhaseInit();

              expect(transaction.__finalizeCommitInitQueue).toHaveBeenCalledTimes(1);

              expect(transaction.isRejected).toBe(false);
            });

            describe("when a changeset which is after the current one in the graph is locally changed", function() {

              it("should be added to the queue and still only be executed once if no other changes occur", function() {

                var neighborhood = scenarioNeighborhood();

                neighborhood.graph3.dog1.on("change", {init: jasmine.createSpy("change:init")});

                // => 3 changesets (net order 2)
                neighborhood.graph3.dog1.name = "can2";

                var order = 1;
                var dog1Order;
                var petsOrder;
                var person1Order;

                // Set after the set above of dog1 name!
                spyOn(transaction, "__onChangesetLocalVersionChangeDid").and.callThrough();

                spyOn(transaction, "__addToCommitInitQueue").and.callThrough();

                spyOn(neighborhood.graph3.dog1, "_onChangeInit").and.callFake(function() {
                  dog1Order = order++;
                  neighborhood.graph3.person1.age = 35;
                });

                spyOn(neighborhood.graph3.person1.pets, "_onChangeInit").and.callFake(function() {
                  petsOrder = order++;
                });

                spyOn(neighborhood.graph3.person1, "_onChangeInit").and.callFake(function() {
                  person1Order = order++;
                });

                transaction._onPhaseInit();

                expect(neighborhood.graph3.dog1._onChangeInit).toHaveBeenCalledTimes(1);
                expect(neighborhood.graph3.person1._onChangeInit).toHaveBeenCalledTimes(1);
                expect(neighborhood.graph3.person1.pets._onChangeInit).toHaveBeenCalledTimes(1);

                expect(dog1Order).toBe(1);
                expect(petsOrder).toBe(2);
                expect(person1Order).toBe(3);

                expect(transaction.__onChangesetLocalVersionChangeDid).toHaveBeenCalledTimes(1);
                expect(transaction.__onChangesetLocalVersionChangeDid)
                  .toHaveBeenCalledWith(neighborhood.graph3.person1.$changeset);
                expect(transaction.__addToCommitInitQueue).toHaveBeenCalledTimes(4);
              });
            });

            describe("when a changeset which is before the current one in the graph is locally changed", function() {

              it("should not be added to the queue and be executed again if it already ran once", function() {

                var neighborhood = scenarioNeighborhood();

                neighborhood.graph3.dog1.on("change", {init: jasmine.createSpy("change:init")});

                // => 3 changesets (net order 2)
                neighborhood.graph3.dog1.name = "can2";

                spyOn(neighborhood.graph3.dog1, "_onChangeInit");
                spyOn(neighborhood.graph3.person1.pets, "_onChangeInit").and.callFake(function() {
                  neighborhood.graph3.dog1.name = "can3";
                });
                spyOn(neighborhood.graph3.person1, "_onChangeInit");

                transaction._onPhaseInit();

                expect(neighborhood.graph3.dog1._onChangeInit).toHaveBeenCalledTimes(1);
                expect(neighborhood.graph3.person1.pets._onChangeInit).toHaveBeenCalledTimes(1);

                expect(neighborhood.graph3.person1._onChangeInit).toHaveBeenCalledTimes(1);
              });

              it("should be added to the queue and be executed if it did not yet ran", function() {

                var neighborhood = scenarioNeighborhood();

                neighborhood.graph3.person1.on("change", {init: jasmine.createSpy("change:init")});

                spyOn(neighborhood.graph3.dog1, "_onChangeInit");
                spyOn(neighborhood.graph3.person1.pets, "_onChangeInit");
                spyOn(neighborhood.graph3.person1, "_onChangeInit").and.callFake(function() {
                  // => 3 changesets (net order 2)
                  neighborhood.graph3.dog1.name = "can2";
                });

                neighborhood.graph3.person1.name = "Trash2";

                transaction._onPhaseInit();

                expect(neighborhood.graph3.dog1._onChangeInit).toHaveBeenCalledTimes(1);
                expect(neighborhood.graph3.person1.pets._onChangeInit).toHaveBeenCalledTimes(1);

                // _onChangeInit called twice, but listener only once.
                expect(neighborhood.graph3.person1._onChangeInit).toHaveBeenCalledTimes(2);
              });

              it("should not call the listener that changed the before changeset twice " +
                "if no other changes occurred", function() {

                var neighborhood = scenarioNeighborhood();

                // => 3 changesets (net order 2)
                neighborhood.graph3.dog1.name = "can2";

                var person1PetsChangeInit = jasmine.createSpy("change:init").and.callFake(function() {
                  neighborhood.graph3.dog1.name = "can3";
                });
                neighborhood.graph3.person1.pets.on("change", {init: person1PetsChangeInit});

                spyOn(neighborhood.graph3.dog1, "_onChangeInit");
                spyOn(neighborhood.graph3.person1, "_onChangeInit");

                transaction._onPhaseInit();

                expect(person1PetsChangeInit).toHaveBeenCalledTimes(1);
              });
            });
          });
        });
      });
    });

    describe(".current", function() {

      it("should have a null transaction by default", function() {

        return require.using(["pentaho/type/action/Transaction"], function(Transaction) {
          expect(Transaction.current).toBe(null);
        });
      });
    });

    describe(".enter()", function() {

      it("should return a TransactionScope instance", function() {

        return require.using([
          "pentaho/type/action/Transaction",
          "pentaho/type/action/TransactionScope"
        ], function(Transaction, TransactionScope) {

          var txnScope = Transaction.enter();

          expect(txnScope instanceof TransactionScope).toBe(true);

          txnScope.exit();
        });
      });

      it("should return a TransactionScope instance whose transaction is now the ambient transaction", function() {

        return require.using(["pentaho/type/action/Transaction"], function(Transaction) {

          var txnScope = Transaction.enter();

          expect(txnScope.transaction).toBe(Transaction.current);

          txnScope.exit();
        });
      });

      it("should return a new TransactionScope instance each time", function() {

        return require.using(["pentaho/type/action/Transaction"], function(Transaction) {

          var txnScope1 = Transaction.enter();
          var txnScope2 = Transaction.enter();

          expect(txnScope1).not.toBe(txnScope2);
        });
      });

      it("should return a new TransactionScope of the same transaction, each time", function() {

        return require.using(["pentaho/type/action/Transaction"], function(Transaction) {

          var txnScope1 = Transaction.enter();
          var txnScope2 = Transaction.enter();

          expect(txnScope1.transaction).toBe(txnScope2.transaction);
        });
      });

      it("should call the new ambient transaction's #__enteringAmbient method", function() {

        return require.using([
          "pentaho/type/action/Transaction",
          "pentaho/type/action/TransactionScope"
        ], function(Transaction, TransactionScope) {

          var txn = new Transaction();

          spyOn(txn, "__enteringAmbient");

          var scope = new TransactionScope(txn);

          expect(txn.__enteringAmbient).toHaveBeenCalled();

          scope.exit();
        });
      });

      it("should call the suspending ambient transaction's __exitingAmbient, when a null scope enters", function() {

        return require.using([
          "pentaho/type/action/Transaction",
          "pentaho/type/action/TransactionScope",
          "pentaho/type/action/CommittedScope"
        ], function(Transaction, TransactionScope, CommittedScope) {

          var txn = new Transaction();
          var scope = new TransactionScope(txn);

          spyOn(txn, "__exitingAmbient");

          var scopeNull = new CommittedScope();

          expect(txn.__exitingAmbient).toHaveBeenCalled();

          scopeNull.exit();
          scope.exit();
        });
      });
    });
  });
});
