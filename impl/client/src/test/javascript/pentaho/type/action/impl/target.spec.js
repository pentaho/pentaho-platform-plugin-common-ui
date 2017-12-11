/*!
 * Copyright 2017 Hitachi Vantara.  All rights reserved.
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
  "pentaho/type/action/Execution"
], function(Context, Execution) {

  "use strict";

  describe("pentaho.type.action.impl.Target", function() {

    var ComplexTarget;
    var BaseAction;
    var SyncAction;
    var AsyncAction;

    beforeAll(function(done) {

      Context.createAsync()
          .then(function(context) {
            return context.getDependencyAsync({
              TargetMixin: "pentaho/type/action/impl/target",
              BaseAction: "pentaho/type/action/base",
              Complex: "pentaho/type/complex"
            });
          })
          .then(function(types) {

            BaseAction = types.BaseAction;

            // A derived non-abstract class, adding nothing new.
            SyncAction = types.BaseAction.extend({
              $type: {
                id: "syncAction",
                isSync: true
              }
            });

            // Idem.
            AsyncAction = types.BaseAction.extend({
              $type: {
                id: "asyncAction",
                isSync: false
              }
            });

            // A Complex type with the Target mixin applied.
            ComplexTarget = types.Complex.extend({
              $type: {
                mixins: [types.TargetMixin]
              }
            });
          })
          .then(done, done.fail);
    });

    describe(".GenericActionExecution", function() {

      it("should get the constructor of an Execution subtype", function() {

        expect(typeof ComplexTarget.GenericActionExecution).toBe("function");
        expect(ComplexTarget.GenericActionExecution.prototype instanceof Execution).toBe(true);
      });

      describe("#_onPhaseInit", function() {

        it("should call the associated target's _emitActionPhaseInitEvent method", function() {
          var target = new ComplexTarget();
          var ae = new ComplexTarget.GenericActionExecution(new SyncAction(), target);

          spyOn(target, "_emitActionPhaseInitEvent");

          ae._onPhaseInit();

          expect(target._emitActionPhaseInitEvent).toHaveBeenCalledTimes(1);
          expect(target._emitActionPhaseInitEvent).toHaveBeenCalledWith(ae);
        });
      });

      describe("#_onPhaseWill", function() {

        it("should call the associated target's _emitActionPhaseWillEvent method", function() {
          var target = new ComplexTarget();
          var ae = new ComplexTarget.GenericActionExecution(new SyncAction(), target);

          spyOn(target, "_emitActionPhaseWillEvent");

          ae._onPhaseWill();

          expect(target._emitActionPhaseWillEvent).toHaveBeenCalledTimes(1);
          expect(target._emitActionPhaseWillEvent).toHaveBeenCalledWith(ae);
        });
      });

      describe("#_onPhaseDo", function() {

        it("should call the associated target's _emitActionPhaseDoEvent method", function() {
          var target = new ComplexTarget();
          var ae = new ComplexTarget.GenericActionExecution(new SyncAction(), target);

          spyOn(target, "_emitActionPhaseDoEvent");

          ae._onPhaseDo();

          expect(target._emitActionPhaseDoEvent).toHaveBeenCalledTimes(1);
          expect(target._emitActionPhaseDoEvent).toHaveBeenCalledWith(ae);
        });

        it("should return what _emitActionPhaseDoEvent returns", function() {
          var target = new ComplexTarget();
          var ae = new ComplexTarget.GenericActionExecution(new SyncAction(), target);
          var promise = Promise.resolve();
          spyOn(target, "_emitActionPhaseDoEvent").and.returnValue(promise);

          var result = ae._onPhaseDo();

          expect(result).toBe(promise);
        });
      });

      describe("#_onPhaseFinally", function() {

        it("should call the associated target's _emitActionPhaseFinallyEvent method", function() {
          var target = new ComplexTarget();
          var ae = new ComplexTarget.GenericActionExecution(new SyncAction(), target);

          spyOn(target, "_emitActionPhaseFinallyEvent");

          ae._onPhaseFinally();

          expect(target._emitActionPhaseFinallyEvent).toHaveBeenCalledTimes(1);
          expect(target._emitActionPhaseFinallyEvent).toHaveBeenCalledWith(ae);
        });
      });
    });

    describe("#_createGenericActionExecution(action)", function() {

      it("should return an instance of GenericActionExecution", function() {

        var target = new ComplexTarget();
        var ae = target._createGenericActionExecution(new SyncAction());

        expect(ae instanceof ComplexTarget.GenericActionExecution).toBe(true);
      });

      // should return an action execution with the given action - it's a clone actually.
    });

    describe("#_createActionExecution(action)", function() {

      it("should delegate to _createGenericActionExecution", function() {

        var target = new ComplexTarget();
        var ae = {};
        var action = new SyncAction();

        spyOn(target, "_createGenericActionExecution").and.returnValue(ae);

        var result = target._createActionExecution(action);

        expect(result).toBe(ae);
        expect(target._createGenericActionExecution).toHaveBeenCalledWith(action);
      });

      // should return an action execution with the given action - actually, it will be a clone of the given action.
    });

    describe("#act", function() {

      it("should accept an Action argument", function() {

        var target = new ComplexTarget();
        target.act(new SyncAction());
      });

      it("should create and return an action execution", function() {

        var target = new ComplexTarget();
        var ae = target.act(new SyncAction());

        expect(ae instanceof Execution).toBe(true);
      });

      it("should accept an Action specification argument", function() {

        var target = new ComplexTarget();
        var ae = target.act({
          _: {
            base: "pentaho/type/action/base"
          }
        });

        expect(ae.action instanceof BaseAction).toBe(true);
      });

      it("should create an action execution with itself as target", function() {

        var target = new ComplexTarget();
        var ae = target.act(new SyncAction());

        expect(ae.target).toBe(target);
      });

      it("should call #execute of the created action execution", function() {

        var target = new ComplexTarget();

        var ae = jasmine.createSpyObj("execution", ["execute"]);
        spyOn(target, "_createActionExecution").and.returnValue(ae);

        target.act(new SyncAction());

        expect(ae.execute).toHaveBeenCalled();
      });
    });

    describe("#_emitActionPhaseInitEvent", function() {

      itsEmitActionPhase("init", /* isSync: */ true, /* hasKeyArgs: */true);
    });

    describe("#_emitActionPhaseWillEvent", function() {

      itsEmitActionPhase("will", /* isSync: */ true, /* hasKeyArgs: */true);
    });

    describe("#_emitActionPhaseDoEvent", function() {

      describe("with a synchronous action", function() {

        itsEmitActionPhase("do", /* isSync: */ true, /* hasKeyArgs: */true);

        it("should return null", function() {

          var target = new ComplexTarget();

          spyOn(target, "_emitGeneric");

          var action = new SyncAction();

          var ae = new Execution(action, target);

          // Call the being tested method.
          var result = target._emitActionPhaseDoEvent(ae);

          // Expect the method being delegated to to have been called.
          expect(result).toBe(null);
        });
      });

      describe("with an asynchronous action", function() {

        itsEmitActionPhase("do", /* isSync: */ false, /* hasKeyArgs: */true);

        it("should return the result of #_emitGenericAllAsync", function() {

          var target = new ComplexTarget();
          var promise = Promise.resolve();
          spyOn(target, "_emitGenericAllAsync").and.returnValue(promise);

          var action = new AsyncAction();

          var ae = new Execution(action, target);

          var result = target._emitActionPhaseDoEvent(ae);

          expect(result).toBe(promise);
        });
      });
    });

    describe("#_emitActionPhaseFinallyEvent", function() {

      itsEmitActionPhase("finally", /* isSync: */ true, /* hasKeyArgs: */false);
    });

    function itsEmitActionPhase(phase, isSync, hasKeyArgs) {

      var call;
      var target;
      var ae;

      // The Target method being tested.
      var emitMethodName;
      switch(phase) {
        case "init": emitMethodName = "_emitActionPhaseInitEvent"; break;
        case "will": emitMethodName = "_emitActionPhaseWillEvent"; break;
        case "do": emitMethodName = "_emitActionPhaseDoEvent"; break;
        case "finally": emitMethodName = "_emitActionPhaseFinallyEvent"; break;
        default: throw new Error("Unsupported phase name '" + phase + "'.");
      }

      // The EventSource method that it delegates to.
      var emitGenericMethodName = isSync ? "_emitGeneric" : "_emitGenericAllAsync";

      var ActionClass;

      beforeEach(function() {
        target = new ComplexTarget();

        spyOn(target, emitGenericMethodName);

        ActionClass = isSync ? SyncAction : AsyncAction;

        var action = new ActionClass();

        ae = new Execution(action, target);

        // Call the being tested method.
        target[emitMethodName](ae);

        // Expect the method being delegated to to have been called.
        expect(target[emitGenericMethodName]).toHaveBeenCalledTimes(1);

        // Capture the call, for further testing.
        call = target[emitGenericMethodName].calls.first();
      });

      it("should call #" + emitGenericMethodName + " with target as the event source", function() {

        // Target as event source
        expect(call.args[0]).toBe(target);
      });

      it("should call #" + emitGenericMethodName + " with action execution and " +
          "action as event listener args", function() {
        // ae and action as event listener arguments
        var listenerArgs = call.args[1];
        expect(listenerArgs instanceof Array).toBe(true);
        expect(listenerArgs[0]).toBe(ae);
        expect(listenerArgs[1]).toBe(ae.action);
      });

      it("should call #" + emitGenericMethodName + " with action.$type.id as event type", function() {
        // event type to be $type.id
        expect(call.args[2]).toBe(ActionClass.type.id);
      });

      it("should call #" + emitGenericMethodName + " with phase '" + phase + "'", function() {
        // phase to be ,phase
        expect(call.args[3]).toBe(phase);
      });

      if(hasKeyArgs) {
        it("should call #" + emitGenericMethodName + " with keyArgs " +
            "containing errorHandler and isCanceled", function() {

          var keyArgs = call.args[4];
          expect(keyArgs.constructor).toBe(Object);
          expect(typeof keyArgs.errorHandler).toBe("function");
          expect(typeof keyArgs.isCanceled).toBe("function");
        });

        it("should call #" + emitGenericMethodName + " with an errorHandler that " +
            "calls the actionExecution.fail method with the given error", function() {

          var keyArgs = call.args[4];
          var errorHandler = keyArgs.errorHandler;
          var ae = jasmine.createSpyObj("actionExecution", ["fail"]);
          var error = new Error();

          errorHandler(error, ae);

          expect(ae.fail).toHaveBeenCalledTimes(1);
          expect(ae.fail).toHaveBeenCalledWith(error);
        });

        it("should call #" + emitGenericMethodName + " with an isCanceled that " +
            "returns the isCanceled property of the given actionExecution", function() {

          var keyArgs = call.args[4];
          var isCanceled = keyArgs.isCanceled;

          var ae2 = {};
          var getIsCanceled = jasmine.createSpy("get isCanceled");
          Object.defineProperty(ae2, "isCanceled", {
            get: getIsCanceled
          });

          isCanceled(ae2);

          expect(getIsCanceled).toHaveBeenCalledTimes(1);
        });
      } else {
        // !hasKeyArgs

        it("should call #" + emitGenericMethodName + " without keyArgs", function() {
          expect(call.args.length).toBeLessThan(5);
        });
      }
    }
  });
});
