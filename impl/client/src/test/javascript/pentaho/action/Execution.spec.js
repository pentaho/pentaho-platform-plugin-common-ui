/*!
 * Copyright 2017 - 2019 Hitachi Vantara.  All rights reserved.
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
  "pentaho/action/Base",
  "pentaho/action/Execution",
  "pentaho/action/States",
  "pentaho/type/ValidationError",
  "pentaho/lang/UserError",
  "pentaho/lang/RuntimeError",
  "tests/pentaho/util/errorMatch",
  "pentaho/debug",
  "pentaho/debug/Levels",
  "pentaho/util/logger"
], function(BaseAction, Execution, States, ValidationError, UserError, RuntimeError, errorMatch,
            debugMgr, DebugLevels, logger) {

  "use strict";

  /* eslint max-nested-callbacks: 0, require-jsdoc: 0, no-unused-vars: 0,
     default-case: 0, no-fallthrough: 0, dot-notation: 0 */

  describe("pentaho.action.Execution", function() {

    // A derived non-abstract class.
    var SubActionExecution = Execution.extend();
    var SyncAction;
    var AsyncAction;
    var target;

    beforeAll(function() {

      target = Object.freeze({});

      // A derived non-abstract class, adding nothing new.
      SyncAction = BaseAction.extend({}, {
        get isSync() {
          return true;
        }
      });

      // Idem.
      AsyncAction = BaseAction.extend({}, {
        get isSync() {
          return false;
        }
      });
    });

    describe("new (action, target)", function() {

      var action;

      beforeAll(function() {
        action = new SyncAction();
      });

      function expectStateUnstarted(ae) {

        expect(ae.state).toBe(States.unstarted);

        expect(ae.isUnstarted).toBe(true);
        expect(ae.isExecuting).toBe(false);
        expect(ae.isSettled).toBe(false);
        expect(ae.isFinished).toBe(false);
        expect(ae.isRejected).toBe(false);
        expect(ae.isCanceled).toBe(false);
        expect(ae.isFailed).toBe(false);
        expect(ae.isDone).toBe(false);
      }

      it("should throw if action is not specified", function() {
        expect(function() {

          var ae = new SubActionExecution(null, target);

        }).toThrow(errorMatch.argRequired("action"));
      });

      it("should throw if target is not specified", function() {

        var action = new SyncAction();

        expect(function() {

          var ae = new SubActionExecution(action);

        }).toThrow(errorMatch.argRequired("target"));
      });

      it("should not throw if both action and target are specified", function() {

        var ae = new SubActionExecution(action, target);

        expect(ae instanceof SubActionExecution).toBe(true);
      });

      it("should have #action be a clone of the specified action argument", function() {

        spyOn(action, "clone").and.callThrough();

        var ae = new SubActionExecution(action, target);

        expect(action.clone).toHaveBeenCalled();

        expect(ae.action).not.toBe(action);
      });

      it("should have #target be the specified target argument", function() {

        var ae = new SubActionExecution(action, target);

        expect(ae.target).toBe(target);
      });

      it("should have a default #result of `undefined`", function() {

        var ae = new SubActionExecution(action, target);

        expect(ae.result).toBe(undefined);
      });

      it("should have a default #error of `null`", function() {

        var ae = new SubActionExecution(action, target);

        expect(ae.error).toBe(null);
      });

      it("should have a default #state of 'unstarted'", function() {

        var ae = new SubActionExecution(action, target);

        expectStateUnstarted(ae);
      });
    });

    describe("#execute()", function() {

      // Testing mode. Synchronous or asynchronous.
      var isSync;

      describe("synchronous action", function() {

        beforeAll(function() { isSync = true; });

        describe("init phase", function() {
          itsPhaseInitShared();
        });

        describe("will phase", function() {
          itsPhaseWillShared();
        });

        describe("do phase", function() {

          itsPhaseDoShared();

          itsPhaseMethodReturnValueSync("do");
        });

        describe("do default phase", function() {

          itsPhaseDoDefaultShared();

          itsPhaseMethodReturnValueSync("default");
        });

        describe("finally phase", function() {
          itsPhaseFinallyShared();
        });

        describe("calling #execute requires the unstarted state", function() {

          it("should throw when calling #execute after having finished", function() {

            var ae = createExecution();

            ae.execute();

            expect(function() {
              ae.execute();
            }).toThrow(errorMatch.operInvalid());
          });
        });
      });

      describe("asynchronous action", function() {

        beforeAll(function() { isSync = false; });

        describe("init phase", function() {
          itsPhaseInitShared();
        });

        describe("will phase", function() {
          itsPhaseWillShared();
        });

        describe("do phase", function() {

          itsPhaseDoShared();

          itsPhaseMethodReturnValueAsync("do");

          itsPhaseMethodTriesSettleWhenAlreadySettledAsync("do");
        });

        describe("do default phase", function() {

          itsPhaseDoDefaultShared();

          itsPhaseMethodReturnValueAsync("default");

          itsPhaseMethodTriesSettleWhenAlreadySettledAsync("default");
        });

        describe("finally phase", function() {
          itsPhaseFinallyShared();
        });

        describe("calling #execute requires the unstarted state", function() {

          it("should throw when calling #execute from the outside " +
              "after having started but not yet finished", function() {

            var resolve;
            var ae = createExecution({
              "do": function() {
                return new Promise(function(_resolve) {
                  resolve = _resolve;
                });
              }
            });

            ae.execute();

            expect(ae.state).toBe(States["do"]);

            // ---

            expect(function() {
              ae.execute();
            }).toThrow(errorMatch.operInvalid());

            // ---

            resolve();

            return ae.promise;
          });

          it("should throw when calling #execute after having finished", function() {

            var ae = createExecution();

            ae.execute();

            return ae.promise.then(function() {

              expect(function() {
                ae.execute();
              }).toThrow(errorMatch.operInvalid());
            });
          });
        });
      });

      // region helpers

      // ---
      // top level helpers

      function createExecution(spySpec) {
        var action = isSync ? new SyncAction() : new AsyncAction();
        var ae = new SubActionExecution(action, target);

        spyOnActionExecution(ae, spySpec);

        return ae;
      }

      function testExecute(ae, upToPhase, finalExpect) {

        var returnValue = ae.execute();

        expect(returnValue).toBe(ae);

        if(isSync) {
          finalExpectations();
        } else {
          return ae.promise.then(finalExpectations, finalExpectations);
        }

        function finalExpectations() {

          expectRunUpToPhase(ae, upToPhase);

          // Must always finish in the finished state.
          expectStatesSharedFinished(ae);

          if(finalExpect) {
            finalExpect(ae);
          }
        }
      }

      // ---
      // lower level helpers

      function spyOnActionExecution(ae, spySpec) {

        // Init phase always runs.
        spyOn(ae, "_onPhaseInit").and.callFake(function() {

          expectStateInit(this);

          callSpySpecPhase(this, spySpec, "init");
        });

        spyOn(ae, "_onPhaseWill").and.callFake(function() {

          expectStateWill(this);

          callSpySpecPhase(this, spySpec, "will");
        });

        spyOn(ae, "_onPhaseDo").and.callFake(function() {

          expectStateDo(this);

          return callSpySpecPhase(this, spySpec, "do");
        });

        spyOn(ae, "_doDefault").and.callFake(function() {

          expectStateDo(this);

          return callSpySpecPhase(this, spySpec, "default");
        });

        // Finally phase always runs.
        spyOn(ae, "_onPhaseFinally").and.callFake(function() {

          expectStatesSharedSettledUnfinished(this);

          callSpySpecPhase(this, spySpec, "finally");
        });
      }

      function callSpySpecPhase(ae, expectSpec, phase) {
        if(expectSpec && expectSpec[phase]) {
          return expectSpec[phase].call(ae);
        }
      }

      function expectRunUpToPhase(ae, upToPhase) {

        // Finally phase always runs.
        expectPhaseMethodCall(ae, "_onPhaseFinally");

        switch(upToPhase) {
          case "finally":
          case "do":
            expectPhaseMethodCall(ae, "_onPhaseDo");

          case "will":
            expectPhaseMethodCall(ae, "_onPhaseWill");
        }

        // Init phase always runs.
        expectPhaseMethodCall(ae, "_onPhaseInit");
      }

      function expectPhaseMethodCall(ae, methodName) {
        var spy = ae[methodName];
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith();
        expect(spy.calls.first().object).toBe(ae);
      }
      // endregion

      // region expectState* and expectStateShared*
      // State expectations used by several tests.

      function expectStateInit(ae) {

        expect(ae.state).toBe(States.init);

        expect(ae.isUnstarted).toBe(false);
        expect(ae.isExecuting).toBe(true);

        expectStatesSharedUnsettled(ae);
      }

      function expectStateWill(ae) {

        expect(ae.state).toBe(States.will);

        expect(ae.isUnstarted).toBe(false);
        expect(ae.isExecuting).toBe(true);

        expectStatesSharedUnsettled(ae);
      }

      function expectStateDo(ae) {

        expect(ae.state).toBe(States["do"]);

        expect(ae.isUnstarted).toBe(false);
        expect(ae.isExecuting).toBe(true);

        expectStatesSharedUnsettled(ae);
      }

      // finished or not
      function expectStateCanceled(ae, error) {

        expect((ae.state & States.canceled) !== 0).toBe(true);

        expect(ae.isFailed).toBe(false);
        expect(ae.isCanceled).toBe(true);

        expectStatesSharedRejected(ae, error);
      }

      // finished or not
      function expectStateFailed(ae, error) {

        expect((ae.state & States.failed) !== 0).toBe(true);

        expect(ae.isFailed).toBe(true);
        expect(ae.isCanceled).toBe(false);

        expectStatesSharedRejected(ae, error);
      }

      // finished or not
      function expectStateDid(ae, result) {

        expect((ae.state & States.did) !== 0).toBe(true);

        expect(ae.isDone).toBe(true);
        expect(ae.isRejected).toBe(false);
        expect(ae.isFailed).toBe(false);
        expect(ae.isCanceled).toBe(false);

        expect(ae.result).toBe(result);
        expect(ae.error).toBe(null);
      }

      // Shared by several of the expectState* helper methods

      function expectStatesSharedUnsettled(ae) {

        expect(ae.isFinished).toBe(false);
        expect(ae.isSettled).toBe(false);
        expect(ae.isRejected).toBe(false);
        expect(ae.isCanceled).toBe(false);
        expect(ae.isFailed).toBe(false);
        expect(ae.isDone).toBe(false);

        expect(ae.result).toBe(undefined);
        expect(ae.error).toBe(null);
      }

      function expectStatesSharedSettledUnfinished(ae) {

        expect(ae.isUnstarted).toBe(false);
        expect(ae.isExecuting).toBe(true);
        expect(ae.isFinished).toBe(false);
        expect(ae.isSettled).toBe(true);
        expect(ae.isRejected || ae.isDone).toBe(true);
      }

      function expectStatesSharedRejected(ae, error) {

        expect(ae.isRejected).toBe(true);
        expect(ae.isDone).toBe(false);

        expect(ae.result).toBe(undefined);
        if(error) {
          expect(ae.error).toBe(error);
        } else {
          expect(ae.error instanceof Error).toBe(true);
        }
      }

      function expectStatesSharedFinished(ae) {

        expect(ae.isUnstarted).toBe(false);
        expect(ae.isExecuting).toBe(false);
        expect(ae.isSettled).toBe(true);
        expect(ae.isFinished).toBe(true);
      }
      // endregion

      // region itsPhase*Shared
      // Jasmine `it` tests that are used by both the sync and the async mode test suites.
      // These are sensitive to the `isSync` mode variable, which is in scope.

      function itsPhaseInitShared() {

        var phase = "init";

        // region modify action succeeds
        it("should be possible to modify the action's #label", function() {

          var label;
          var upToPhase = "do";

          var spySpec = {};
          spySpec[phase] = function() {
            // NOTE: action !== this.action
            this.action.label = label + "a";
          };

          spySpec["finally"] = function() {

            expect(this.action.label).toBe(label + "a");

            expectStateDid(this, undefined);
          };

          var ae = createExecution(spySpec);
          label = ae.action.label;

          return testExecute(ae, upToPhase);
        });

        it("should be possible to modify the action's #description", function() {

          var description;
          var upToPhase = "do";

          var spySpec = {};
          spySpec[phase] = function() {
            // NOTE: action !== this.action
            this.action.description = description + "a";
          };

          spySpec["finally"] = function() {

            expect(this.action.description).toBe(description + "a");

            expectStateDid(this, undefined);
          };

          var ae = createExecution(spySpec);
          description = ae.action.description;

          return testExecute(ae, upToPhase);
        });
        // endregion

        // region action invalid cancels
        it("should cancel when the action is invalid", function() {

          var error = new ValidationError("Foo is required");
          var upToPhase = phase;

          var spySpec = {};
          spySpec["finally"] = function() {
            expectStateCanceled(this, error);
          };

          var ae = createExecution(spySpec);

          spyOn(ae.action, "validate").and.returnValue([error]);

          return testExecute(ae, upToPhase);
        });

        it("should not validate the action if already rejected", function() {

          var error = new UserError("Not now");
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            this.reject(error);
          };

          spySpec["finally"] = function() {
            expectStateCanceled(this, error);
          };

          var ae = createExecution(spySpec);

          spyOn(ae.action, "validate").and.returnValue([error]);

          return testExecute(ae, upToPhase, function() {
            expect(ae.action.validate).not.toHaveBeenCalled();
          });
        });
        // endregion

        itsPhaseMethodThrowsOrRejects(phase);

        itsPhaseMethodCallsDoneAndFails(phase);

        itsPhaseMethodCallsExecuteAndFails(phase);
      }

      function itsPhaseWillShared() {

        var phase = "will";

        itsPhaseMethodModifiesActionAndFails(phase);

        itsPhaseMethodThrowsOrRejects(phase);

        itsPhaseMethodCallsDoneAndFails(phase);

        itsPhaseMethodCallsExecuteAndFails(phase);
      }

      function itsPhaseDoShared() {

        var phase = "do";

        itsPhaseMethodCallsDoneAndSucceeds(phase);

        itsPhaseMethodModifiesActionAndFails(phase);

        itsPhaseMethodThrowsOrRejects(phase);

        itsPhaseMethodCallsExecuteAndFails(phase);

        itsPhaseMethodTriesSettleWhenAlreadySettled(phase);
      }

      function itsPhaseDoDefaultShared() {

        var phase = "default";

        it("should be called when the do phase method does not settle", function() {

          var upToPhase = phase;

          var spySpec = {};

          spySpec["finally"] = function() {

            expectPhaseMethodCall(this, "_doDefault");

            expectStateDid(this);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });

        itsPhaseMethodCallsDoneAndSucceeds(phase);

        itsPhaseMethodModifiesActionAndFails(phase);

        itsPhaseMethodThrowsOrRejects(phase);

        itsPhaseMethodCallsExecuteAndFails(phase);

        itsPhaseMethodTriesSettleWhenAlreadySettled(phase);
      }

      function itsPhaseFinallyShared() {

        var phase = "finally";

        it("should log and ignore when marked done and remain successful", function() {

          var result = {};
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {
            this.done(result);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {
            expectStateDid(ae);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore a thrown error and remain successful", function() {

          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};

          spySpec["finally"] = function() {

            expectStateDid(this);

            throw new Error("Cabum!");
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expect(logger.warn).toHaveBeenCalledTimes(1);
            expect(logger.warn.calls.first().args[0].indexOf("Cabum!") >= 0).toBe(true);

            expectStateDid(ae);
          });
        });

        it("should log and ignore when marked rejected and remain successful", function() {

          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {
            this.reject(new Error("Just because!"));
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {
            expectStateDid(ae);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore when trying to modify the action's #label and remain successful", function() {

          var label;
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {
            // NOTE: action !== this.action
            this.action.label = label + "a";
          };

          var ae = createExecution(spySpec);

          label = ae.action.label;

          return testExecute(ae, upToPhase, function() {

            expect(ae.action.label).toBe(label);

            expectStateDid(ae);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore when trying to modify the action's #description and remain successful", function() {

          var description;
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {
            // NOTE: action !== this.action
            this.action.description = "a";
          };

          var ae = createExecution(spySpec);

          description = ae.action.description;

          return testExecute(ae, upToPhase, function() {

            expect(ae.action.description).toBe(description);

            expectStateDid(ae);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        // ---

        it("should log and ignore when marked done and preserve existing error", function() {

          var error = new Error("Oh no!");
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {
            "do": function() {
              this.reject(error);
            },
            "finally": function() {
              this.done();
            }
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expectStateFailed(ae, error);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore a thrown error and preserve existing error", function() {

          var error = new Error("Oh no!");
          var error2Text = "Another error!";

          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {
            "do": function() {
              this.reject(error);
            },
            "finally": function() {
              throw new Error(error2Text);
            }
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expectStateFailed(ae, error);

            expect(logger.warn).toHaveBeenCalledTimes(1);
            expect(logger.warn.calls.first().args[0].indexOf(error2Text) >= 0).toBe(true);
          });
        });

        it("should log and ignore when marked rejected and preserve existing error", function() {

          var error = new Error("Oh no!");
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {
            "do": function() {
              this.reject(error);
            },
            "finally": function() {
              this.reject(new Error("Another error!"));
            }
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expectStateFailed(ae, error);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore when trying to modify the action's #label and preserve existing error", function() {

          var error = new Error("Oh no!");
          var label;
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {
            "do": function() {
              this.reject(error);
            },
            "finally": function() {
              // NOTE: action !== this.action
              this.action.label = label + "a";
            }
          };

          var ae = createExecution(spySpec);

          label = ae.action.label;

          return testExecute(ae, upToPhase, function() {

            expect(ae.action.label).toBe(label);

            expectStateFailed(ae, error);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore when trying to modify the action's #description " +
            "and preserve existing error", function() {

          var error = new Error("Oh no!");
          var description;
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {
            "do": function() {
              this.reject(error);
            },
            "finally": function() {
              // NOTE: action !== this.action
              this.action.description = "a";
            }
          };

          var ae = createExecution(spySpec);

          description = ae.action.description;

          return testExecute(ae, upToPhase, function() {

            expect(ae.action.description).toBe(description);

            expectStateFailed(ae, error);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });
      }
      // endregion

      // region itsPhaseMethod*
      // Jasmine `it` tests used by more than one of the itsPhase*Shared helper methods.
      // These test what happens when certain things are done from within the protected phase methods.

      function itsPhaseMethodModifiesActionAndFails(phase) {

        it("should fail when trying to modify the action's #label", function() {

          var label;
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            // NOTE: action !== this.action
            this.action.label = label + "a";
          };

          var ae = createExecution(spySpec);

          label = ae.action.label;

          return testExecute(ae, upToPhase, function() {

            expect(ae.action.label).toBe(label);

            expectStateFailed(ae);
          });
        });

        it("should fail when trying to modify the action's #description", function() {

          var description;
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            // NOTE: action !== this.action
            this.action.description = "a";
          };

          var ae = createExecution(spySpec);

          description = ae.action.description;

          return testExecute(ae, upToPhase, function() {

            expect(ae.action.description).toBe(description);

            expectStateFailed(ae);
          });
        });
      }

      function itsPhaseMethodThrowsOrRejects(phase) {

        // region throw
        it("should fail when a direct instance of Error is thrown", function() {

          var error = new Error("Cabum!");
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            throw error;
          };

          spySpec["finally"] = function() {
            expectStateFailed(this, error);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });

        it("should fail when an instance of RuntimeError is thrown", function() {

          var error = new RuntimeError("No network");
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            throw error;
          };

          spySpec["finally"] = function() {
            expectStateFailed(this, error);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });

        it("should cancel when a string is thrown", function() {

          var error = "Not now.";
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            throw error;
          };

          spySpec["finally"] = function() {
            expectStateCanceled(this);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });

        it("should cancel when an instance of UserError is thrown", function() {

          var error = new UserError("Not now.");
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            throw error;
          };

          spySpec["finally"] = function() {
            expectStateCanceled(this, error);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });
        // endregion

        // region #reject(.)
        it("should fail when rejected with a direct instance of Error", function() {

          var error = new Error("Cabum!");
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            this.reject(error);
          };

          spySpec["finally"] = function() {
            expectStateFailed(this, error);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });

        it("should fail when rejected with an instance of RuntimeError", function() {

          var error = new RuntimeError("No network");
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            this.reject(error);
          };

          spySpec["finally"] = function() {
            expectStateFailed(this, error);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });

        it("should cancel when rejected with a string", function() {

          var error = "Not now.";
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            this.reject(error);
          };

          spySpec["finally"] = function() {
            expectStateCanceled(this);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });

        it("should cancel when rejected with an instance of UserError", function() {

          var error = new UserError("Not now.");
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            this.reject(error);
          };

          spySpec["finally"] = function() {
            expectStateCanceled(this);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });
        // endregion
      }

      function itsPhaseMethodCallsDoneAndFails(phase) {

        it("should fail if marked done", function() {

          var result = {};
          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            this.done(result);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {
            expectStateFailed(ae);
          });
        });
      }

      function itsPhaseMethodCallsDoneAndSucceeds(phase) {

        it("should allow marking done with no value, causing a result of undefined", function() {

          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            this.done();
          };

          spySpec["finally"] = function() {
            expectStateDid(this, undefined);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });

        it("should allow marking done with a value, causing a result of that value", function() {

          var upToPhase = phase;

          var result = {};
          var spySpec = {};
          spySpec[phase] = function() {
            this.done(result);
          };

          spySpec["finally"] = function() {
            expectStateDid(this, result);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });
      }

      function itsPhaseMethodCallsExecuteAndFails(phase) {

        it("should fail if #execute is called", function() {

          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            this.execute();
          };

          spySpec["finally"] = function() {
            expectStateFailed(this);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });
      }

      function itsPhaseMethodReturnValueAsync(phase) {

        // phase must be one of "do" or "default"

        it("should continue if no promise is returned", function() {

          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
          };

          spySpec["finally"] = function() {
            expectStateDid(this, undefined);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });

        it("should await the returned promise", function() {

          var resolvePhase;

          var spySpec = {};
          spySpec[phase] = function() {
            return new Promise(function(_resolve) {
              resolvePhase = _resolve;
            });
          };

          spySpec["finally"] = function() {
            expectStateDid(this, undefined);
          };

          var ae = createExecution(spySpec);

          ae.execute();

          var resolveFinal;
          var promiseFinal = new Promise(function(_resolve) {
            resolveFinal = _resolve;
          });

          setTimeout(function() {

            expect(ae.state).toBe(States["do"]);

            resolvePhase();

            ae.promise.then(resolveFinal);
          }, 0);

          return promiseFinal.then(function() {
            expect(ae.isFinished).toBe(true);
          });
        });

        it("should ignore the fulfillment value of the returned promise", function() {

          var upToPhase = phase;
          var result = {};

          var spySpec = {};
          spySpec[phase] = function() {
            return Promise.resolve(result);
          };

          spySpec["finally"] = function() {
            expectStateDid(this, undefined);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });

        it("should reject with the rejection reason of the returned promise", function() {

          var upToPhase = phase;
          var error = new Error("Oh no!");

          var spySpec = {};
          spySpec[phase] = function() {
            return Promise.reject(error);
          };

          spySpec["finally"] = function() {
            expectStateFailed(this, error);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });
      }

      function itsPhaseMethodReturnValueSync(phase) {

        it("should ignore a returned value", function() {

          var upToPhase = phase;

          var spySpec = {};
          spySpec[phase] = function() {
            return Promise.reject();
          };

          spySpec["finally"] = function() {
            expectStateDid(this, undefined);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase);
        });
      }

      function itsPhaseMethodTriesSettleWhenAlreadySettled(phase) {

        // assumes phase is one of 'do' or 'default'

        it("should log and ignore when marked done and remain successful", function() {

          var result = {};
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.done(result);

            this.done({});
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expectStateDid(ae, result);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore a thrown error and remain successful", function() {

          var result = {};
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.done(result);

            throw new Error("Cabum!");
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expect(logger.warn).toHaveBeenCalledTimes(1);
            expect(logger.warn.calls.first().args[0].indexOf("Cabum!") >= 0).toBe(true);

            expectStateDid(ae, result);
          });
        });

        it("should log and ignore when marked rejected and remain successful", function() {

          var result = {};
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.done(result);

            this.reject(new Error("Just because!"));
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expectStateDid(ae, result);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore when trying to modify the action's #label and remain successful", function() {

          var result = {};
          var label;
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.done(result);

            // NOTE: action !== this.action
            this.action.label = label + "a";
          };

          var ae = createExecution(spySpec);

          label = ae.action.label;

          return testExecute(ae, upToPhase, function() {

            expect(ae.action.label).toBe(label);

            expectStateDid(ae, result);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore when trying to modify the action's #description and remain successful", function() {

          var result = {};
          var description;
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.done(result);

            // NOTE: action !== this.action
            this.action.description = "a";
          };

          var ae = createExecution(spySpec);

          description = ae.action.description;

          return testExecute(ae, upToPhase, function() {

            expect(ae.action.description).toBe(description);

            expectStateDid(ae, result);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        // ---

        it("should log and ignore when marked done and preserve existing error", function() {

          var error = new Error("Oh no!");
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {
            this.reject(error);
            this.done();
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expectStateFailed(ae, error);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore a thrown error and preserve existing error", function() {

          var error = new Error("Oh no!");
          var error2Text = "Another error!";

          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {
            this.reject(error);
            throw new Error(error2Text);
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expectStateFailed(ae, error);

            expect(logger.warn).toHaveBeenCalledTimes(1);
            expect(logger.warn.calls.first().args[0].indexOf(error2Text) >= 0).toBe(true);
          });
        });

        it("should log and ignore when marked rejected and preserve existing error", function() {

          var error = new Error("Oh no!");
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {
            this.reject(error);
            this.reject(new Error("Another error!"));
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expectStateFailed(ae, error);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore when trying to modify the action's #label and preserve existing error", function() {

          var error = new Error("Oh no!");
          var label;
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.reject(error);

            // NOTE: action !== this.action
            this.action.label = label + "a";
          };

          var ae = createExecution(spySpec);

          label = ae.action.label;

          return testExecute(ae, upToPhase, function() {

            expect(ae.action.label).toBe(label);

            expectStateFailed(ae, error);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });

        it("should log and ignore when trying to modify the action's #description " +
            "and preserve existing error", function() {

          var error = new Error("Oh no!");
          var description;
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.reject(error);

            // NOTE: action !== this.action
            this.action.description = "a";
          };

          var ae = createExecution(spySpec);

          description = ae.action.description;

          return testExecute(ae, upToPhase, function() {

            expect(ae.action.description).toBe(description);

            expectStateFailed(ae, error);

            expect(logger.warn).toHaveBeenCalledTimes(1);
          });
        });
      }

      function itsPhaseMethodTriesSettleWhenAlreadySettledAsync(phase) {

        it("should ignore a returned rejected promise and remain successful", function() {

          var result = {};
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.done(result);

            return Promise.reject(new Error("Cabum!"));
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expect(logger.warn).not.toHaveBeenCalled();

            expectStateDid(ae, result);
          });
        });

        it("should ignore a returned fulfilled promise and remain successful", function() {

          var result = {};
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.done(result);

            return Promise.resolve({});
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expect(logger.warn).not.toHaveBeenCalled();

            expectStateDid(ae, result);
          });
        });

        it("should ignore a returned rejected promise and preserve existing error", function() {

          var error = new Error("Oh no!");
          var error2Text = "Another error!";

          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.reject(error);

            return Promise.reject(new Error(error2Text));
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expectStateFailed(ae, error);

            expect(logger.warn).not.toHaveBeenCalled();
          });
        });

        it("should ignore a returned fulfilled promise and preserve existing error", function() {

          var error = new Error("Oh no!");
          var upToPhase = phase;

          spyOn(debugMgr, "testLevel").and.returnValue(true);
          spyOn(logger, "warn");

          var spySpec = {};
          spySpec[phase] = function() {

            this.reject(error);

            return Promise.resolve({});
          };

          var ae = createExecution(spySpec);

          return testExecute(ae, upToPhase, function() {

            expectStateFailed(ae, error);

            expect(logger.warn).not.toHaveBeenCalled();
          });
        });
      }
      // endregion
    });
  });
});
