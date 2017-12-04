/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
  "pentaho/lang/Event",
  "pentaho/lang/EventSource",
  "tests/pentaho/util/errorMatch",
  "tests/test-utils"
], function(Event, EventSource, errorMatch, testUtils) {

  "use strict";

  /* global jasmine:false, describe:false, it:false, expect:false, beforeEach:false, spyOn: false */

  // Use alternate, promise-aware version of `it`.
  var it = testUtils.itAsync;

  describe("pentaho.lang.EventSource -", function() {

    var eventSource;

    var eventIsCanceled = function(event) {
      return event.isCanceled;
    };

    var eventCancellationReason = function(event) {
      return event.cancelReason;
    };

    beforeEach(function() {
      eventSource = new EventSource();
    });

    // region Registration
    describe("both #on and #off", function() {

      describe("unstructured events", function() {

        var event1;
        var event2;
        var source;
        var listener;
        var state;

        beforeEach(function() {
          source = {};
          event1 = new Event("foo", source, true);
          event2 = new Event("bar", source, true);
          state = 0;
          listener = function() {
            state += 1;
          };
        });

        it("should accept a csv string of event types and register/unregister " +
           "the given listener function.", function() {

          eventSource.on("foo,bar", listener);
          eventSource._emit(event1);
          eventSource._emit(event2);
          expect(state).toBe(2);

          eventSource.off("foo,bar", listener);
          eventSource._emit(event1);
          eventSource._emit(event2);
          expect(state).toBe(2);
        });

        it("should accept an array of strings containing event types and " +
           "register/unregister the given listener function.", function() {

          eventSource.on(["foo", "bar"], listener);
          eventSource._emit(event1);
          eventSource._emit(event2);
          expect(state).toBe(2);

          eventSource.off(["foo", "bar"], listener);
          eventSource._emit(event1);
          eventSource._emit(event2);
          expect(state).toBe(2);
        });
      });

      describe("structured events", function() {

        var event1;
        var event2;
        var source;
        var observer;
        var state;

        beforeEach(function() {
          source = {};
          event1 = new Event("foo", source, true);
          event2 = new Event("bar", source, true);
          state = 0;
          observer = {
            "phase1": function() {
              state += 1;
            }
          };
        });

        it("should accept a csv string of event types and register/unregister " +
            "the given observer.", function() {

          eventSource.on("foo,bar", observer);
          eventSource._emitGeneric(eventSource, [event1], "foo", "phase1");
          eventSource._emitGeneric(eventSource, [event2], "bar", "phase1");
          expect(state).toBe(2);

          eventSource.off("foo,bar", observer);
          eventSource._emitGeneric(eventSource, [event1], "foo", "phase1");
          eventSource._emitGeneric(eventSource, [event2], "bar", "phase1");
          expect(state).toBe(2);
        });

        it("should accept an array of strings containing event types and " +
            "register/unregister the given observer.", function() {

          eventSource.on(["foo", "bar"], observer);
          eventSource._emitGeneric(eventSource, [event1], "foo", "phase1");
          eventSource._emitGeneric(eventSource, [event2], "bar", "phase1");
          expect(state).toBe(2);

          eventSource.off(["foo", "bar"], observer);
          eventSource._emitGeneric(eventSource, [event1], "foo", "phase1");
          eventSource._emitGeneric(eventSource, [event2], "bar", "phase1");
          expect(state).toBe(2);
        });
      });
    }); // on# and off# CSV/Array

    describe("#on(type, observer, keyArgs)", function() {
      var event;
      var source;

      beforeEach(function() {
        source = {};
        event = new Event("foo", source, true);
      });

      it("should throw an `argRequired` error when no parameters are provided", function() {
        expect(function() {
          eventSource.on();
        }).toThrow(errorMatch.argRequired("type"));

        expect(function() {
          eventSource.on(null);
        }).toThrow(errorMatch.argRequired("type"));

        expect(function() {
          eventSource.on(undefined);
        }).toThrow(errorMatch.argRequired("type"));
      });

      it("should throw an `argRequired` error when the `type` argument is set " +
         "but the `observer` argument is not provided", function() {

        expect(function() {
          eventSource.on("test");
        }).toThrow(errorMatch.argRequired("observer"));

        expect(function() {
          eventSource.on("test", null);
        }).toThrow(errorMatch.argRequired("observer"));

        expect(function() {
          eventSource.on("test", undefined);
        }).toThrow(errorMatch.argRequired("observer"));
      });

      describe("should return", function() {

        it("`null` if `type` is []", function() {
          var output = eventSource.on([], function() {});
          expect(output).toBeNull();
        });

        function expectIEventRegistrationHandle(output) {
          expect(typeof output).toBe("object");
          expect(typeof output.dispose).toBe("function");
          expect(typeof output.remove).toBe("function");
        }

        it("an object compliant with pentaho.lang.IEventRegistrationHandle` " +
           "when registering a single event", function() {
          var output = eventSource.on("foo", function() {});
          expectIEventRegistrationHandle(output);
        });

        it("an object compliant with pentaho.lang.IEventRegistrationHandle` " +
           "when registering a multiple event", function() {
          var output = eventSource.on("spam,eggs", function() {});
          expectIEventRegistrationHandle(output);
        });
      });

      it("should not yet notify a listener if is being registered during an emit cycle", function() {

        var listeners = {
          first: function() {
            eventSource.on("foo", listeners.intruder);
          },
          second: function() {},
          intruder: function() {}
        };

        spyOn(listeners, "first").and.callThrough();
        spyOn(listeners, "second").and.callThrough();
        spyOn(listeners, "intruder").and.callThrough();

        eventSource.on("foo", listeners.first);
        eventSource.on("foo", listeners.second);

        eventSource._emit(event);
        expect(listeners.intruder).not.toHaveBeenCalled();
      });

      it("should only notify a listener in the emit cycles that " +
         "take place after registering the listener", function() {

        var listeners = {
          first: function() {
            eventSource.on("foo", listeners.intruder);
          },
          second: function() {},
          intruder: function() {}
        };

        spyOn(listeners, "first").and.callThrough();
        spyOn(listeners, "second").and.callThrough();
        spyOn(listeners, "intruder").and.callThrough();

        eventSource.on("foo", listeners.first);
        eventSource.on("foo", listeners.second);

        eventSource._emit(event);
        expect(listeners.intruder).not.toHaveBeenCalled();
        eventSource._emit(event);
        expect(listeners.intruder).toHaveBeenCalled();
      });
    }); // #on

    describe("#off(type, observer)", function() {
      var event;
      var source;
      var state;

      beforeEach(function() {
        source = {};
        event = new Event("foo", source, true);
        state = "original";
      });

      it("should remove a listener when given a dispose handle", function() {
        var handle;

        eventSource.on("foo", function() {
          state += " first";
        });

        handle = eventSource.on("foo", function() {
          state += " second";
        });

        eventSource._emit(event);
        eventSource.off(handle);
        eventSource._emit(event);

        expect(state).toBe("original first second first");
      });

      it("should remove a listener when given the type and the listener", function() {

        eventSource.on("foo", function() {
          state += " first";
        });

        var secondListener = function() {
          state += " second";
        };

        eventSource.on("foo", secondListener);

        eventSource._emit(event);
        eventSource.off("foo", secondListener);
        eventSource._emit(event);

        expect(state).toBe("original first second first");
      });

      it("should not prevent its listener from being called " +
         "when it is invoked during the execution of the event", function() {

        var handle;

        eventSource.on("foo", function() {
          eventSource.off(handle);
          state += " first";
        });

        handle = eventSource.on("foo", function() {
          state += " second";
        });

        eventSource._emit(event);
        expect(state).toBe("original first second");
      });

      it("should throw an error when no parameters provided", function() {
        expect(function() {
          eventSource.off();
        }).toThrow(errorMatch.argRequired("typeOrHandle"));

        expect(function() {
          eventSource.off(null);
        }).toThrow(errorMatch.argRequired("typeOrHandle"));

        expect(function() {
          eventSource.off(undefined);
        }).toThrow(errorMatch.argRequired("typeOrHandle"));
      });

      it("should throw an error when the typeOrHandle is a string but no listener is provided", function() {
        expect(function() {
          eventSource.off("test");
        }).toThrow(errorMatch.argRequired("observer"));

        expect(function() {
          eventSource.off("test", null);
        }).toThrow(errorMatch.argRequired("observer"));

        expect(function() {
          eventSource.off("test", undefined);
        }).toThrow(errorMatch.argRequired("observer"));
      });

    }); // #off

    describe("#_hasListeners(type[, phase])", function() {

      describe("unstructured events", function() {

        it("should return `false` if there are no registered listeners", function() {

          expect(eventSource._hasListeners("foo")).toBe(false);
        });

        it("should return `true` if there are registered listeners", function() {

          expect(eventSource._hasListeners("foo")).toBe(false);

          eventSource.on("foo", function() {});

          expect(eventSource._hasListeners("foo")).toBe(true);
        });

        it("should return `false` if the registered listeners are removed", function() {

          expect(eventSource._hasListeners("foo")).toBe(false);

          var fooListener = function() {};

          eventSource.on("foo", fooListener);
          expect(eventSource._hasListeners("foo")).toBe(true);

          eventSource.off("foo", fooListener);
          expect(eventSource._hasListeners("foo")).toBe(false);
        });
      });

      describe("structured events", function() {

        it("should return `true` if there are registered listeners for the event type for any phases", function() {

          expect(eventSource._hasListeners("foo")).toBe(false);

          eventSource.on("foo", {"will": function() {}, "finally": function() {}});

          expect(eventSource._hasListeners("foo")).toBe(true);
        });

        it("should return `false` after registered listeners for " +
           "the event type and any phases are removed", function() {

          expect(eventSource._hasListeners("foo")).toBe(false);

          var observer = {"will": function() {}, "finally": function() {}};

          eventSource.on("foo", observer);

          expect(eventSource._hasListeners("foo")).toBe(true);

          eventSource.off("foo", observer);

          expect(eventSource._hasListeners("foo")).toBe(false);
        });

        it("should return `true` if there are registered listeners for the event type and phase", function() {

          expect(eventSource._hasListeners("foo", "phase1")).toBe(false);

          eventSource.on("foo", {"phase1": function() {}});

          expect(eventSource._hasListeners("foo", "phase1")).toBe(true);
        });

        it("should return `false` if there are registered listeners " +
           "for the event type, but not for the phase", function() {

          expect(eventSource._hasListeners("foo", "phase1")).toBe(false);

          eventSource.on("foo", {"phase2": function() {}});

          expect(eventSource._hasListeners("foo", "phase1")).toBe(false);
        });
      });
    }); // #_hasListeners
    // endregion

    // region Emission
    describe("#_emitGeneric(source, eventArgs, type, [phase], [{isCanceled, errorHandler}])", function() {

      var event;
      var eventType = "foo";

      beforeEach(function() {
        event = new Event(eventType, eventSource, true);
      });

      it("should throw an error when no parameters provided", function() {
        expect(function() {
          eventSource._emitGeneric();
        }).toThrow(errorMatch.argRequired("source"));

        expect(function() {
          eventSource._emitGeneric(null);
        }).toThrow(errorMatch.argRequired("source"));

        expect(function() {
          eventSource._emitGeneric(undefined);
        }).toThrow(errorMatch.argRequired("source"));
      });

      it("should throw an error if only `source` is specified but `eventArgs` is not", function() {

        expect(function() {
          eventSource._emitGeneric(eventSource);
        }).toThrow(errorMatch.argRequired("eventArgs"));

        expect(function() {
          eventSource._emitGeneric(eventSource, null);
        }).toThrow(errorMatch.argRequired("eventArgs"));

        expect(function() {
          eventSource._emitGeneric(eventSource, undefined);
        }).toThrow(errorMatch.argRequired("eventArgs"));
      });

      it("should throw an error if `source` and `eventArgs` are specified but `type` is not", function() {

        expect(function() {
          eventSource._emitGeneric(eventSource, [event]);
        }).toThrow(errorMatch.argRequired("type"));

        expect(function() {
          eventSource._emitGeneric(eventSource, [event], null);
        }).toThrow(errorMatch.argRequired("type"));

        expect(function() {
          eventSource._emitGeneric(eventSource, [event], undefined);
        }).toThrow(errorMatch.argRequired("type"));
      });

      it("should notify a listener registered for the same event type and " +
          "as the event type being emitted (default phase)", function() {

        var listener = jasmine.createSpy(eventType);

        eventSource.on(eventType, listener);

        eventSource._emitGeneric(eventSource, [event], eventType);

        expect(listener).toHaveBeenCalled();
      });

      it("should notify a listener registered for the same event type and " +
          "phase as the event type and phase being emitted", function() {

        var listener = jasmine.createSpy(eventType);

        eventSource.on(eventType, {"phase1": listener});

        eventSource._emitGeneric(eventSource, [event], eventType, "phase1");

        expect(listener).toHaveBeenCalled();
      });

      it("should not notify a listener registered for a different event type as the event being emitted", function() {

        var listeners = jasmine.createSpyObj("listeners", ["foo", "bar"]);

        eventSource.on(eventType, listeners.foo);
        eventSource.on("bar", listeners.bar);

        eventSource._emitGeneric(eventSource, [event], eventType);

        expect(listeners.bar).not.toHaveBeenCalled();
      });

      it("should not notify a listener registered for a different phase as the event being emitted", function() {

        var listeners = jasmine.createSpyObj("listeners", ["foo", "bar"]);

        eventSource.on(eventType, {"phase1": listeners.foo});
        eventSource.on(eventType, {"phase2": listeners.bar});

        eventSource._emitGeneric(eventSource, [event], eventType, "phase1");

        expect(listeners.foo).toHaveBeenCalled();
        expect(listeners.bar).not.toHaveBeenCalled();
      });

      it("should return `false` and not process an event that was previously canceled", function() {

        var listeners = jasmine.createSpyObj("listeners", ["foo"]);

        eventSource.on(eventType, listeners.foo);

        event.cancel();

        var result = eventSource._emitGeneric(eventSource, [event], eventType, null, {isCanceled: eventIsCanceled});

        expect(listeners.foo).not.toHaveBeenCalled();
        expect(result).toBe(false);
      });

      it("should return `true` if no listener canceled the execution", function() {

        var listener = function() {};

        eventSource.on(eventType, listener);

        var result = eventSource._emitGeneric(eventSource, [event], eventType);

        expect(result).toBe(true);
      });

      it("should return `true` if there are no listeners", function() {

        var result = eventSource._emitGeneric(eventSource, [event], eventType);

        expect(result).toBe(true);
      });

      it("should call listeners with `this` being the given source", function() {

        var listener = jasmine.createSpy();

        eventSource.on(eventType, listener);

        var source = {};
        eventSource._emitGeneric(source, [event], eventType);

        expect(listener.calls.first().object).toBe(source);
      });

      it("should return `false` if the event was canceled by some listener", function() {

        var listener = function(event) {
          event.cancel();
        };

        eventSource.on(eventType, listener);

        var result = eventSource._emitGeneric(eventSource, [event], eventType, null, {isCanceled: eventIsCanceled});

        expect(result).toBe(false);
      });

      describe("when keyArgs.errorHandler === null", function() {

        it("should throw back an error thrown by a listener", function() {

          var thrower = function() {
            throw new Error("Stirb!");
          };

          eventSource.on(eventType, thrower);

          expect(function() {
            eventSource._emitGeneric(eventSource, [event], eventType, null, {errorHandler: null});
          }).toThrowError("Stirb!");
        });

        it("should interrupt the event being processed", function() {

          var listeners = {
            firstAndThrow: function() {
              throw new Error("Stirb!");
            },
            second: function() {}
          };

          spyOn(listeners, "firstAndThrow").and.callThrough();
          spyOn(listeners, "second").and.callThrough();

          eventSource.on(eventType, listeners.firstAndThrow);
          eventSource.on(eventType, listeners.second);

          try {
            eventSource._emitGeneric(eventSource, [event], eventType, null, {errorHandler: null});
          } catch(ex) {

          }

          expect(listeners.firstAndThrow).toHaveBeenCalled();
          expect(listeners.second).not.toHaveBeenCalled();
        });
      });

      describe("when keyArgs.errorHandler === undefined or is unspecified", function() {

        it("should log an error thrown by a listener", function() {

          var thrower = function() {
            throw new Error("Stirb!");
          };

          spyOn(console, "log");

          eventSource.on(eventType, thrower);

          eventSource._emitGeneric(eventSource, [event], eventType);

          expect(console.log).toHaveBeenCalledTimes(1);
        });

        it("should not interrupt the event being processed if" +
            "a listener throws an error", function() {

          var listeners = {
            firstAndThrow: function() {
              throw new Error("Stirb!");
            },
            second: function() {}
          };

          spyOn(listeners, "second").and.callThrough();

          eventSource.on(eventType, listeners.firstAndThrow);
          eventSource.on(eventType, listeners.second);

          eventSource._emitGeneric(eventSource, [event], eventType);

          expect(listeners.second).toHaveBeenCalled();
        });

        it("should return `true` when a listener throws an error", function() {

          var thrower = function() {
            throw new Error("Stirb!");
          };

          eventSource.on(eventType, thrower);

          var result = eventSource._emitGeneric(eventSource, [event], eventType);

          expect(result).toBe(true);
        });
      });

      describe("when keyArgs.errorHandler is a function(error, eventArgs, type, phase)", function() {

        it("should be able to cancel the received event, " +
            "causing processing to stop and `false` being returned", function() {

          var listeners = {
            firstAndThrow: function() {
              throw new Error("Stirb!");
            },
            second: function() {}
          };

          spyOn(listeners, "firstAndThrow").and.callThrough();
          spyOn(listeners, "second").and.callThrough();

          eventSource.on("foo", listeners.firstAndThrow);
          eventSource.on("foo", listeners.second);

          var result = eventSource._emitGeneric(eventSource, [event], eventType, null, {
            errorHandler: function(_error, _eventArgs, _type, _phase) {
              _eventArgs[0].cancel();
            },
            isCanceled: eventIsCanceled
          });

          expect(result).toBe(false);
          expect(event.isCanceled).toBe(true);
          expect(listeners.second).not.toHaveBeenCalled();
        });

        it("should call the errorHandler on the source and " +
            "with error, eventArgs, type and phase as arguments", function() {

          var error = new Error("Stirb!");
          var thrower = function() {
            throw error;
          };

          var errorHandler = jasmine.createSpy("errorHandler");

          eventSource.on(eventType, {"phase1": thrower});

          var source = {};
          var eventArgs = [event];

          eventSource._emitGeneric(source, eventArgs, eventType, "phase1", {
            errorHandler: errorHandler
          });

          expect(errorHandler.calls.first().object).toBe(source);
          expect(errorHandler).toHaveBeenCalledWith(error, eventArgs, eventType, "phase1");
        });

        it("should call the errorHandler on the event source and " +
            "with error, eventArgs, type and null phase when the event is unstructured", function() {

          var error = new Error("Stirb!");
          var thrower = function() {
            throw error;
          };

          var errorHandler = jasmine.createSpy("errorHandler");

          eventSource.on(eventType, thrower);

          var source = {};
          var eventArgs = [event];
          eventSource._emitGeneric(source, eventArgs, eventType, null, {
            errorHandler: errorHandler
          });

          expect(errorHandler.calls.first().object).toBe(source);
          expect(errorHandler).toHaveBeenCalledWith(error, eventArgs, eventType, null);
        });

        it("should call the errorHandler on the event source and " +
            "with error, event, type and null phase when phase is given as '__'", function() {

          var error = new Error("Stirb!");
          var thrower = function() {
            throw error;
          };

          var errorHandler = jasmine.createSpy("errorHandler");

          eventSource.on(eventType, thrower);

          var source = {};
          var eventArgs = [event];
          eventSource._emitGeneric(source, eventArgs, eventType, "__", {
            errorHandler: errorHandler
          });

          expect(errorHandler.calls.first().object).toBe(source);
          expect(errorHandler).toHaveBeenCalledWith(error, eventArgs, eventType, null);
        });
      });

      it("should invoke a listener N times if it is registered N times", function() {
        var state = 0;
        var listener = function() {
          state += 1;
        };

        eventSource.on(eventType, listener);
        eventSource.on(eventType, listener);
        eventSource.on(eventType, listener);

        eventSource._emitGeneric(eventSource, [event], eventType);

        expect(state).toBe(3);
      });

      it("should not process a previously disposed EventRegistrationHandle", function() {

        var listener = jasmine.createSpy();

        var handle = eventSource.on("foo", listener);

        handle.dispose();

        eventSource._emitGeneric(eventSource, [event], eventType);

        expect(listener).not.toHaveBeenCalled();
      });

      describe("should handle priorities, namely it", function() {

        it("should respect the priority with which the event listeners are registered", function() {

          var state = "original";

          eventSource.on(eventType, function() {
            state += " first";
          }, {
            priority: 0
          });

          eventSource.on(eventType, function() {
            state += " second";
          }, {
            priority: -1
          });

          eventSource._emitGeneric(eventSource, [event], eventType);
          expect(state).toBe("original first second");
        });

        it("should handle listeners registered with a priority of `Infinity`", function() {

          var state = "original";

          eventSource.on(eventType, function() {
            state += " second";
          });

          eventSource.on(eventType, function() {
            state += " first";
          }, {
            priority: Infinity
          });

          eventSource.on(eventType, function() {
            state += " last";
          }, {
            priority: -Infinity
          });

          eventSource._emitGeneric(eventSource, [event], eventType);

          expect(state).toBe("original first second last");
        });

        it("should handle listeners registered with a priority of Number.MAX_VALUE " +
            "before `Infinity` and `Number.MIN_VALUE` after 0", function() {

          var state = "original";

          eventSource.on(eventType, function() {
            state += " fourth";
          });

          eventSource.on(eventType, function() {
            state += " third";
          }, {
            priority: Number.MIN_VALUE
          });

          eventSource.on(eventType, function() {
            state += " last";
          }, {
            priority: -Infinity
          });

          eventSource.on(eventType, function() {
            state += " first";
          }, {
            priority: Infinity
          });

          eventSource.on(eventType, function() {
            state += " second";
          }, {
            priority: Number.MAX_VALUE
          });

          eventSource._emitGeneric(eventSource, [event], eventType);

          expect(state).toBe("original first second third fourth last");
        });

        it("should respect the insertion order, if the priority of " +
            "the registered event listeners is the same", function() {
          [
            -10, 1, 0, -1, 10
          ].forEach(function(p) {

            var eventSource = new EventSource();
            var event = new Event(eventType, eventSource, true);
            var state = "original";

            eventSource.on(eventType, function() {
              state += " first";
            }, {
              priority: p
            });

            eventSource.on(eventType, function() {
              state += " second";
            }, {
              priority: p
            });

            eventSource._emitGeneric(eventSource, [event], eventType);

            expect(state).toBe("original first second");
          });
        });

        it("should convert `nully` priorities to 0", function() {
          [
            null, undefined, false, ""
          ].forEach(function(p) {
            var eventSource = new EventSource();
            var event = new Event(eventType, eventSource, true);
            var state = "original";

            eventSource.on(eventType, function() {
              state += " first";
            }, {
              priority: 0
            });

            eventSource.on(eventType, function() {
              state += " second";
            }, {
              priority: p
            });

            eventSource.on(eventType, function() {
              state += " third";
            }, {
              priority: 0
            });

            eventSource._emitGeneric(eventSource, [event], eventType);

            expect(state).toBe("original first second third");
          });
        });

        it("should skip the execution of event listeners with lower priority " +
            "when an event is canceled by a higher-priority event listener", function() {

          var state = "original";

          eventSource.on(eventType, function(event) {
            event.cancel();
            state += " first"; // note that this code still runs
          }, {
            priority: 0
          });

          eventSource.on(eventType, function() {
            state += " second";
          }, {
            priority: -1
          });

          eventSource._emitGeneric(eventSource, [event], eventType, null, {isCanceled: eventIsCanceled});

          expect(state).toBe("original first");
        });
      });

    }); // #_emitGeneric

    describe("#_emit(event)", function() {

      var event;
      var eventType = "foo";

      beforeEach(function() {
        event = new Event(eventType, eventSource, true);
      });

      it("should throw an error when no parameters are provided", function() {
        expect(function() {
          eventSource._emit();
        }).toThrow(errorMatch.argRequired("event"));

        expect(function() {
          eventSource._emit(null);
        }).toThrow(errorMatch.argRequired("event"));

        expect(function() {
          eventSource._emit(undefined);
        }).toThrow(errorMatch.argRequired("event"));
      });

      it("should throw an error when the argument is of an invalid type", function() {
        expect(function() {
          eventSource._emit({});
        }).toThrow(errorMatch.argInvalidType("event", "pentaho.type.Event"));
      });

      it("should call _emitGeneric(this, eventArgs, event.type, null phase)", function() {

        spyOn(eventSource, "_emitGeneric");

        eventSource._emit(event);

        expect(eventSource._emitGeneric)
            .toHaveBeenCalledWith(eventSource, [event], event.type, null, jasmine.any(Object));
      });

      it("should reject the emission when the event is canceled", function() {

        var listener = function(event) {
          event.cancel();
        };

        eventSource.on(eventType, listener);

        var result = eventSource._emit(event);

        expect(result).toBeNull();
      });

      it("should throw back an error thrown by a listener", function() {

        var listeners = {
          thrower: function() {
            throw new Error("Stirb!");
          }
        };

        spyOn(listeners, "thrower").and.callThrough();

        eventSource.on(eventType, listeners.thrower);

        expect(function() {
          eventSource._emit(event);
        }).toThrowError("Stirb!");
      });

      it("should return the event if calling _emitGeneric returns `true`", function() {

        spyOn(eventSource, "_emitGeneric").and.returnValue(true);

        var result = eventSource._emit(event);

        expect(result).toBe(event);
      });
    }); // #_emit

    describe("#_emitSafe(event)", function() {
      var event;

      beforeEach(function() {
        event = new Event("foo", eventSource, true);
      });

      it("should throw an error when no parameters provided", function() {
        expect(function() {
          eventSource._emitSafe();
        }).toThrow(errorMatch.argRequired("event"));

        expect(function() {
          eventSource._emitSafe(null);
        }).toThrow(errorMatch.argRequired("event"));

        expect(function() {
          eventSource._emitSafe(undefined);
        }).toThrow(errorMatch.argRequired("event"));
      });

      it("should throw an error when the argument is of an invalid type", function() {
        expect(function() {
          eventSource._emitSafe({});
        }).toThrow(errorMatch.argInvalidType("event", "pentaho.type.Event"));
      });

      it("should not throw back the error thrown by a listener, not interrupt the processing, " +
          "log the error and return the event", function() {

        var listeners = {
          firstAndThrow: function() {
            throw new Error("Stirb!");
          },
          second: function() {}
        };

        spyOn(listeners, "firstAndThrow").and.callThrough();
        spyOn(listeners, "second").and.callThrough();

        eventSource.on("foo", listeners.firstAndThrow);
        eventSource.on("foo", listeners.second);

        spyOn(console, "log");

        expect(eventSource._emitSafe(event)).toBe(event);

        expect(listeners.firstAndThrow).toHaveBeenCalled();
        expect(listeners.second).toHaveBeenCalled();

        expect(console.log).toHaveBeenCalledTimes(1);
      });

    }); // #_emitSafe

    describe("_emitGenericAllAsync(source, eventArgs, type, [phase], " +
        "[{isCanceled, getCancellationReason, errorHandler}])", function() {

      var event;
      var eventType = "foo";

      beforeEach(function() {
        event = new Event(eventType, eventSource, true);
      });

      it("should throw an error when no parameters provided", function() {
        expect(function() {
          eventSource._emitGenericAllAsync();
        }).toThrow(errorMatch.argRequired("source"));

        expect(function() {
          eventSource._emitGenericAllAsync(null);
        }).toThrow(errorMatch.argRequired("source"));

        expect(function() {
          eventSource._emitGenericAllAsync(undefined);
        }).toThrow(errorMatch.argRequired("source"));
      });

      it("should throw an error if `source` is specified but `eventArgs` is not", function() {

        expect(function() {
          eventSource._emitGenericAllAsync(eventSource);
        }).toThrow(errorMatch.argRequired("eventArgs"));

        expect(function() {
          eventSource._emitGenericAllAsync(eventSource, null);
        }).toThrow(errorMatch.argRequired("eventArgs"));

        expect(function() {
          eventSource._emitGenericAllAsync(eventSource, undefined);
        }).toThrow(errorMatch.argRequired("eventArgs"));
      });

      it("should throw an error if `source` and `eventArgs` are specified but `type` is not", function() {

        expect(function() {
          eventSource._emitGenericAllAsync(eventSource, [event]);
        }).toThrow(errorMatch.argRequired("type"));

        expect(function() {
          eventSource._emitGenericAllAsync(eventSource, [event], null);
        }).toThrow(errorMatch.argRequired("type"));

        expect(function() {
          eventSource._emitGenericAllAsync(eventSource, [event], undefined);
        }).toThrow(errorMatch.argRequired("type"));
      });

      it("should reject and not process an event that was previously canceled", function() {

        var listeners = jasmine.createSpyObj("listeners", ["foo"]);

        eventSource.on(eventType, listeners.foo);

        event.cancel();

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType, null, {isCanceled: eventIsCanceled})
            .then(null, function() {
              expect(listeners.foo).not.toHaveBeenCalled();
            });
      });

      it("should fulfill with undefined if there are no listeners", function() {

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType).then(function(result) {
          expect(result).toBe(undefined);
        });
      });

      it("should notify a listener registered for the same event type and " +
          "as the event type being emitted (default phase)", function() {

        var listener = jasmine.createSpy(eventType);

        eventSource.on(eventType, listener);

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType).then(function() {
          expect(listener).toHaveBeenCalled();
        });
      });

      it("should notify a listener registered for the same event type and " +
          "phase as the event type and phase being emitted", function() {

        var listener = jasmine.createSpy(eventType);

        eventSource.on(eventType, {"phase1": listener});

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType, "phase1").then(function() {
          expect(listener).toHaveBeenCalled();
        });
      });

      it("should not notify a listener registered for a different event type as the event being emitted", function() {

        var listeners = jasmine.createSpyObj("listeners", ["foo", "bar"]);

        eventSource.on(eventType, listeners.foo);
        eventSource.on("bar", listeners.bar);

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType).then(function() {

          expect(listeners.bar).not.toHaveBeenCalled();
        });
      });

      it("should not notify a listener registered for a different phase as the event being emitted", function() {

        var listeners = jasmine.createSpyObj("listeners", ["foo", "bar"]);

        eventSource.on(eventType, {"phase1": listeners.foo});
        eventSource.on(eventType, {"phase2": listeners.bar});

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType, "phase1").then(function() {

          expect(listeners.foo).toHaveBeenCalled();
          expect(listeners.bar).not.toHaveBeenCalled();
        });
      });

      it("should fulfill with `undefined` if no listener canceled the execution", function() {

        var listener = function() {};

        eventSource.on(eventType, listener);

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType).then(function(result) {

          expect(result).toBe(undefined);
        });
      });

      it("should call listeners with `this` being the given source", function() {

        var listener = jasmine.createSpy();

        eventSource.on(eventType, listener);

        var source = {};
        return eventSource._emitGenericAllAsync(source, [event], eventType).then(function() {

          expect(listener.calls.first().object).toBe(source);
        });
      });

      it("should reject if the event was canceled by some listener", function() {

        var listener = function(event) {
          event.cancel();
        };

        eventSource.on(eventType, listener);

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType, null, {isCanceled: eventIsCanceled})
            .then(function() {
              return Promise.reject(new Error("Expected rejection."));
            }, function() {
              // swallow error
            });
      });

      it("should reject with the cancellation reason if the event was canceled by " +
          "some listener and keyArgs.getCancellationReason is specified", function() {

        var reason = new Error();
        var listener = function(event) {
          event.cancel(reason);
        };

        eventSource.on(eventType, listener);

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType, null, {
          isCanceled: eventIsCanceled,
          getCancellationReason: eventCancellationReason
        }).then(function() {
          return Promise.reject(new Error("Expected rejection."));
        }, function(error) {
          expect(error).toBe(reason);
        });
      });

      it("should reject with undefined if the event was canceled by " +
          "some listener and keyArgs.getCancellationReason is not specified", function() {

        var reason = new Error();
        var listener = function(event) {
          event.cancel(reason);
        };

        eventSource.on(eventType, listener);

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType, null, {
          isCanceled: eventIsCanceled
        }).then(function() {
          return Promise.reject(new Error("Expected rejection."));
        }, function(error) {
          expect(error).toBeUndefined();
        });
      });

      describe("when keyArgs.errorHandler === null", function() {

        it("should reject with the error thrown by a listener", function() {
          var error = new Error("Stirb!");
          var thrower = function() {
            throw error;
          };

          eventSource.on(eventType, thrower);

          eventSource._emitGenericAllAsync(eventSource, [event], eventType, null, {errorHandler: null})
              .then(function() {
                return Promise.reject(new Error("Expected rejection."));
              }, function(_error) {
                expect(_error).toBe(error);
              });
        });

        it("should still call all other listeners, synchronously, but may not wait for their completion", function() {
          var error = new Error("Stirb!");
          var listeners = {
            firstAndThrow: function() {
              throw error;
            },
            second: function() {}
          };

          spyOn(listeners, "firstAndThrow").and.callThrough();
          spyOn(listeners, "second").and.callThrough();

          eventSource.on(eventType, listeners.firstAndThrow);
          eventSource.on(eventType, listeners.second);

          eventSource._emitGenericAllAsync(eventSource, [event], eventType, null, {errorHandler: null})
              .then(function() {
                return Promise.reject(new Error("Expected rejection."));
              }, function(_error) {
                expect(_error).toBe(error);
              });

          expect(listeners.firstAndThrow).toHaveBeenCalled();
          expect(listeners.second).toHaveBeenCalled();
        });
      });

      describe("when keyArgs.errorHandler === undefined or is unspecified", function() {

        it("should log an error thrown by a listener", function() {

          var thrower = function() {
            throw new Error("Stirb!");
          };

          spyOn(console, "log");

          eventSource.on(eventType, thrower);

          return eventSource._emitGenericAllAsync(eventSource, [event], eventType)
              .then(function() {
                expect(console.log).toHaveBeenCalledTimes(1);
              });
        });

        it("should not interrupt the event being processed if" +
            "a listener throws an error", function() {

          var listeners = {
            firstAndThrow: function() {
              throw new Error("Stirb!");
            },
            second: function() {}
          };

          spyOn(listeners, "second").and.callThrough();

          eventSource.on(eventType, listeners.firstAndThrow);
          eventSource.on(eventType, listeners.second);

          return eventSource._emitGenericAllAsync(eventSource, [event], eventType)
              .then(function() {
                expect(listeners.second).toHaveBeenCalled();
              });
        });

        it("should fulfill with undefined when a listener throws an error", function() {

          var thrower = function() {
            throw new Error("Stirb!");
          };

          eventSource.on(eventType, thrower);

          eventSource._emitGenericAllAsync(eventSource, [event], eventType)
              .then(function(result) {
                expect(result).toBe(undefined);
              });
        });
      });

      describe("when keyArgs.errorHandler is a function(error, eventArgs, type, phase)", function() {

        it("should be able to cancel the received event and reject the event emission", function() {

          var listeners = {
            firstAndThrow: function() {
              throw new Error("Stirb!");
            },
            second: function() {}
          };

          spyOn(listeners, "firstAndThrow").and.callThrough();
          spyOn(listeners, "second").and.callThrough();

          eventSource.on("foo", listeners.firstAndThrow);
          eventSource.on("foo", listeners.second);

          return eventSource._emitGenericAllAsync(eventSource, [event], eventType, null, {
            errorHandler: function(_error, _eventArgs, _type, _phase) {
              _eventArgs[0].cancel();
            },
            isCanceled: eventIsCanceled
          }).then(function() {
            return Promise.reject(new Error("Rejection expected"));
          }, function(error) {
            expect(error).toBeUndefined();
            expect(event.isCanceled).toBe(true);
            expect(listeners.second).toHaveBeenCalled();
          });
        });

        it("should call the errorHandler on the event source and " +
            "with error, eventArgs, type and phase as arguments", function() {

          var error = new Error("Stirb!");
          var thrower = function() {
            throw error;
          };

          var errorHandler = jasmine.createSpy("errorHandler");

          eventSource.on(eventType, {"phase1": thrower});

          var source = {};
          var eventArgs = [event];
          return eventSource._emitGenericAllAsync(source, eventArgs, eventType, "phase1", {
            errorHandler: errorHandler
          }).then(function() {
            expect(errorHandler.calls.first().object).toBe(source);
            expect(errorHandler).toHaveBeenCalledWith(error, eventArgs, eventType, "phase1");
          });
        });

        it("should call the errorHandler on the event source and " +
            "with error, eventArgs, type and null phase when the event is unstructured", function() {

          var error = new Error("Stirb!");
          var thrower = function() {
            throw error;
          };

          var errorHandler = jasmine.createSpy("errorHandler");

          eventSource.on(eventType, thrower);

          var source = {};
          var eventArgs = [event];
          return eventSource._emitGenericAllAsync(source, eventArgs, eventType, null, {
            errorHandler: errorHandler
          }).then(function() {
            expect(errorHandler.calls.first().object).toBe(source);
            expect(errorHandler).toHaveBeenCalledWith(error, eventArgs, eventType, null);
          });
        });

        it("should call the errorHandler on the event source and " +
            "with error, event, type and null phase when phase is given as '__'", function() {

          var error = new Error("Stirb!");
          var thrower = function() {
            throw error;
          };

          var errorHandler = jasmine.createSpy("errorHandler");

          eventSource.on(eventType, thrower);

          var source = {};
          var eventArgs = [event];
          return eventSource._emitGenericAllAsync(source, eventArgs, eventType, "__", {
            errorHandler: errorHandler
          }).then(function() {
            expect(errorHandler.calls.first().object).toBe(source);
            expect(errorHandler).toHaveBeenCalledWith(error, eventArgs, eventType, null);
          });
        });
      });

      it("should invoke a listener N times if it is registered N times", function() {
        var state = 0;
        var listener = function() {
          state += 1;
        };

        eventSource.on(eventType, listener);
        eventSource.on(eventType, listener);
        eventSource.on(eventType, listener);

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType)
            .then(function() {
              expect(state).toBe(3);
            });
      });

      it("should not process a previously disposed EventRegistrationHandle", function() {

        var listener = jasmine.createSpy();

        var handle = eventSource.on("foo", listener);

        handle.dispose();

        return eventSource._emitGenericAllAsync(eventSource, [event], eventType)
            .then(function() {
              expect(listener).not.toHaveBeenCalled();
            });

      });

      describe("should handle priorities, namely it", function() {

        it("should respect the priority with which the event listeners are registered", function() {

          var state = "original";

          eventSource.on(eventType, function() {
            state += " first";
          }, {
            priority: 0
          });

          eventSource.on(eventType, function() {
            state += " second";
          }, {
            priority: -1
          });

          return eventSource._emitGenericAllAsync(eventSource, [event], eventType)
              .then(function() {
                expect(state).toBe("original first second");
              });
        });

        it("should handle listeners registered with a priority of `Infinity`", function() {

          var state = "original";

          eventSource.on(eventType, function() {
            state += " second";
          });

          eventSource.on(eventType, function() {
            state += " first";
          }, {
            priority: Infinity
          });

          eventSource.on(eventType, function() {
            state += " last";
          }, {
            priority: -Infinity
          });

          return eventSource._emitGenericAllAsync(eventSource, [event], eventType)
              .then(function() {
                expect(state).toBe("original first second last");
              });
        });
      });

      describe("async listeners", function() {

        it("should fulfill with undefined if the only listener returns a successful promise", function() {

          var listener = jasmine.createSpy(eventType).and.returnValue(Promise.resolve({}));

          eventSource.on(eventType, listener);

          var pWaitAllEvent = eventSource._emitGenericAllAsync(eventSource, [event], eventType);

          // Listeners are called synchronously.
          expect(listener).toHaveBeenCalled();

          return pWaitAllEvent.then(function(result) {
            expect(result).toBe(undefined);
          });
        });

        describe("when keyArgs.errorHandler === null", function() {

          it("should return the rejection error from the first listener returning a rejected promise", function() {

            var error1 = {};
            var listener1 = jasmine.createSpy(eventType + "1").and.returnValue(Promise.reject(error1));

            var error2 = {};
            var listener2 = jasmine.createSpy(eventType + "2").and.returnValue(Promise.reject(error2));

            eventSource.on(eventType, listener1);
            eventSource.on(eventType, listener2);

            var pWaitAllEvent =
                eventSource._emitGenericAllAsync(eventSource, [event], eventType, null, {errorHandler: null});

            // Listeners are called synchronously.
            expect(listener1).toHaveBeenCalled();
            expect(listener2).toHaveBeenCalled();

            return pWaitAllEvent.then(function() {
              return Promise.reject("Expected rejection.");
            }, function(error) {
              expect(error).toBe(error1);
            });
          });

          it("should return a rejection error from the first rejecting listener " +
              "even if other listeners succeed", function() {

            var result1 = {};
            var listener1 = jasmine.createSpy(eventType + "1").and.returnValue(Promise.resolve(result1));

            var error2 = {};
            var listener2 = jasmine.createSpy(eventType + "2").and.returnValue(Promise.reject(error2));

            var result3 = {};
            var listener3 = jasmine.createSpy(eventType + "3").and.returnValue(Promise.resolve(result3));

            eventSource.on(eventType, listener1);
            eventSource.on(eventType, listener2);
            eventSource.on(eventType, listener3);

            var pWaitAllEvent =
                eventSource._emitGenericAllAsync(eventSource, [event], eventType, null, {errorHandler: null});

            // Listeners are called synchronously.
            expect(listener1).toHaveBeenCalled();
            expect(listener2).toHaveBeenCalled();
            expect(listener3).toHaveBeenCalled();

            return pWaitAllEvent.then(function() {
              return Promise.reject("Expected rejection.");
            }, function(error) {
              expect(error).toBe(error2);
            });
          });
        });
      });
    });

    // endregion

  }); // #pentaho.lang.EventSource
});
