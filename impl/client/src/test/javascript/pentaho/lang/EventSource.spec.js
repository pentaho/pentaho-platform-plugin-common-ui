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
  "tests/pentaho/util/errorMatch"
], function(Event, EventSource, errorMatch) {
  "use strict";

  /* global jasmine:false, describe:false, it:false, expect:false, beforeEach:false, spyOn: false */

  describe("pentaho.lang.EventSource -", function() {
    var eventSource;
    beforeEach(function() {
      eventSource = new EventSource();
    });

    describe("both #on and #off -", function() {
      var event1, event2, source, listener, state;
      beforeEach(function() {
        source = {};
        event1 = new Event("foo", source, true);
        event2 = new Event("bar", source, true);
        state = 0;
        listener = function() {
          state += 1;
        };
      });

      it("should accept a csv string of event types and register/unregister the given listener function.", function() {
        eventSource.on("foo,bar", listener);
        eventSource._emit(event1);
        eventSource._emit(event2);
        expect(state).toBe(2);

        eventSource.off("foo,bar", listener);
        eventSource._emit(event1);
        eventSource._emit(event2);
        expect(state).toBe(2);
      });

      it("should accept an array of strings containing event types and register/unregister the given listener function.", function() {
        eventSource.on(["foo", "bar"], listener);
        eventSource._emit(event1);
        eventSource._emit(event2);
        expect(state).toBe(2);

        eventSource.off(["foo", "bar"], listener);
        eventSource._emit(event1);
        eventSource._emit(event2);
        expect(state).toBe(2);
      });
    }); // on# and off# CSV/Array

    describe("#on(type, listener, keyArgs) -", function() {
      var event, source, state;
      beforeEach(function() {
        source = {};
        event = new Event("foo", source, true);
        state = "original";
      });

      it("should throw an `argRequired` error when no parameters are provided.", function() {
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

      it("should throw an `argRequired` error when the `type` argument is set but the `listener` argument is not provided.", function() {
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

      describe("should return -", function() {
        it("`null` if `type` is []", function() {
          var output = eventSource.on([], function() {});
          expect(output).toBeNull();
        });

        function expectIEventRegistrationHandle(output) {
          expect(typeof output).toBe("object");
          expect(typeof output.dispose).toBe("function");
          expect(typeof output.remove).toBe("function");
        }

        it("an object compliant with pentaho.lang.IEventRegistrationHandle` when registering a single event", function() {
          var output = eventSource.on("foo", function() {});
          expectIEventRegistrationHandle(output);
        });

        it("an object compliant with pentaho.lang.IEventRegistrationHandle` when registering a multiple event", function() {
          var output = eventSource.on("spam,eggs", function() {});
          expectIEventRegistrationHandle(output);
        });
      });

      it("should not yet notify a listener if is being registered during an emit cycle.", function() {
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

      it("should only notify a listener in the emit cycles that take place after registering the listener.", function() {
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

    }); // on#

    describe("#off(type, listener) -", function() {
      var event, source, state;

      beforeEach(function() {
        source = {};
        event = new Event("foo", source, true);
        state = "original";
      });

      it("should remove a listener.", function() {
        var handle;

        eventSource.on("foo", function() {
          state = state + " first";
        });

        handle = eventSource.on("foo", function() {
          state = state + " second";
        });

        eventSource._emit(event);
        eventSource.off(handle);
        eventSource._emit(event);

        expect(state).toBe("original first second first");
      });

      it("should not prevent its listener from being called when it is invoked during the execution of the event.", function() {
        var handle;

        eventSource.on("foo", function() {
          eventSource.off(handle);
          state = state + " first";
        });

        handle = eventSource.on("foo", function() {
          state = state + " second";
        });

        eventSource._emit(event);
        expect(state).toBe("original first second");
      });

      it("should throw an error when no parameters provided.", function() {
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

      it("should throw an error when the typeOrHandle is a string but no listener is provided.", function() {
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

    describe("#_hasListeners(type) -", function() {

      it("should return `true` if there are registered listeners.", function() {
        expect(eventSource._hasListeners("foo")).toBe(false);

        eventSource.on("foo", function() {});

        expect(eventSource._hasListeners("foo")).toBe(true);
      });

      it("should return `false` if there are no registered listeners.", function() {
        expect(eventSource._hasListeners("foo")).toBe(false);

        var fooListener = function() {};

        eventSource.on("foo", fooListener);
        expect(eventSource._hasListeners("foo")).toBe(true);

        eventSource.off("foo", fooListener);
        expect(eventSource._hasListeners("foo")).toBe(false);
      });

    }); // #_hasListeners

    describe("#_emit(event) -", function() {
      var event;

      beforeEach(function() {
        event = new Event("foo", eventSource, true);
      });

      it("should throw an error when no parameters provided.", function() {
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

      it("should throw an error when the argument is of an invalid type.", function() {
        expect(function() {
          eventSource._emit({});
        }).toThrow(errorMatch.argInvalidType("event", "pentaho.type.Event"));
      });

      it("should notify a listener registered for the same event type as the event being emitted.", function() {
        var listeners = {
          foo: function() {}
        };
        spyOn(listeners, "foo").and.callThrough();

        eventSource.on("foo", listeners.foo);

        eventSource._emit(event);
        expect(listeners.foo).toHaveBeenCalled();
      });

      it("should not notify a listener registered for a different event type as the event being emitted.", function() {
        var listeners = {
          foo: function() {},
          bar: function() {}
        };

        spyOn(listeners, "bar").and.callThrough();
        eventSource.on("foo", listeners.foo);
        eventSource.on("bar", listeners.bar);

        eventSource._emit(event);
        expect(listeners.bar).not.toHaveBeenCalled();
      });

      it("should return `null` and not process an event that was previously canceled.", function() {
        var listeners = {
          foo: function() {}
        };

        spyOn(listeners, "foo").and.callThrough();
        eventSource.on("foo", listeners.foo);

        event.cancel();
        var result = eventSource._emit(event);

        expect(listeners.foo).not.toHaveBeenCalled();
        expect(result).toBeNull();
      });

      it("should return the event if no listener canceled the execution.", function() {
        var listener = function() {};

        eventSource.on("foo", listener);
        var result = eventSource._emit(event);

        expect(result).toBe(event);
      });

      it("should call listeners with `this` being the event source.", function() {
        var listener = jasmine.createSpy();

        eventSource.on("foo", listener);
        eventSource._emit(event);

        expect(listener.calls.first().object).toBe(eventSource);
      });

      it("should return `null` if the event was canceled by some listener.", function() {
        var listener = function(event) {
          event.cancel();
        };

        eventSource.on("foo", listener);
        var result = eventSource._emit(event);

        expect(result).toBeNull();
      });

      it("should interrupt the event being processed if a listener throws an exception.", function() {
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

        expect(function() {
          eventSource._emit(event);
        }).toThrowError("Stirb!");
        expect(listeners.second).not.toHaveBeenCalled();
      });

      it("should invoke a listener N times if it is registered N times.", function() {
        var state = 0;
        var listener = function() {
          state = state + 1;
        };

        eventSource.on("foo", listener);
        eventSource.on("foo", listener);
        eventSource.on("foo", listener);

        eventSource._emit(event);
        expect(state).toBe(3);
      });

      it("should not process a previously disposed EventRegistrationHandle.", function() {
        var listeners = {
          foo: function() {
          }
        };

        spyOn(listeners, "foo").and.callThrough();

        var handle = eventSource.on("foo", listeners.foo);

        handle.dispose();
        eventSource._emit(event);

        expect(listeners.foo).not.toHaveBeenCalled();
      });

      describe("should handle priorities, namely it -", function() {
        it("should respect the priority with which the event listeners are registered.", function() {
          var state = "original";

          eventSource.on("foo", function() {
            state = state + " first";
          }, {
            priority: 0
          });

          eventSource.on("foo", function() {
            state = state + " second";
          }, {
            priority: -1
          });

          eventSource._emit(event);
          expect(state).toBe("original first second");
        });

        it("should handle listeners registered with a priority of `Infinity`.", function() {
          var state = "original";

          eventSource.on("foo", function() {
            state = state + " second";
          });

          eventSource.on("foo", function() {
            state = state + " first";
          }, {
            priority: Infinity
          });

          eventSource.on("foo", function() {
            state = state + " last";
          }, {
            priority: -Infinity
          });

          eventSource._emit(event);
          expect(state).toBe("original first second last");
        });

        it("should handle listeners registered with a priority of Number.MAX_VALUE before `Infinity` and `Number.MIN_VALUE` after 0.", function() {
          var state = "original";

          eventSource.on("foo", function() {
            state = state + " fourth";
          });

          eventSource.on("foo", function() {
            state = state + " third";
          }, {
            priority: Number.MIN_VALUE
          });

          eventSource.on("foo", function() {
            state = state + " last";
          }, {
            priority: -Infinity
          });

          eventSource.on("foo", function() {
            state = state + " first";
          }, {
            priority: Infinity
          });

          eventSource.on("foo", function() {
            state = state + " second";
          }, {
            priority: Number.MAX_VALUE
          });

          eventSource._emit(event);
          expect(state).toBe("original first second third fourth last");
        });

        it("should respect the insertion order, if the priority of the registered event listeners is the same.", function() {
          [
            -10, 1, 0, -1, 10
          ].forEach(function(p) {
            var eventSource = new EventSource();
            var event = new Event("foo", eventSource, true);
            var state = "original";

            eventSource.on("foo", function() {
              state = state + " first";
            }, {
              priority: p
            });

            eventSource.on("foo", function() {
              state = state + " second";
            }, {
              priority: p
            });

            eventSource._emit(event);
            expect(state).toBe("original first second");
          });
        });

        it("should convert `nully` priorities to 0.", function() {
          [
            null, undefined, false, ""
          ].forEach(function(p) {
            var eventSource = new EventSource();
            var event = new Event("foo", eventSource, true);
            var state = "original";

            eventSource.on("foo", function() {
              state += " first";
            }, {
              priority: 0
            });

            eventSource.on("foo", function() {
              state += " second";
            }, {
              priority: p
            });

            eventSource.on("foo", function() {
              state += " third";
            }, {
              priority: 0
            });

            eventSource._emit(event);
            expect(state).toBe("original first second third");
          });
        });

        it("should skip the execution of event listeners with lower priority when an event is canceled by a higher-priority event listener.", function() {
          var state = "original";

          eventSource.on("foo", function(event) {
            event.cancel();
            state = state + " first"; // note that this code still runs
          }, {
            priority: 0
          });

          eventSource.on("foo", function() {
            state = state + " second";
          }, {
            priority: -1
          });

          eventSource._emit(event);
          expect(state).toBe("original first");
        });
      });

    }); // #_emit

    describe("#_emitSafe(event) -", function() {
      var event;

      beforeEach(function() {
        event = new Event("foo", eventSource, true);
        spyOn(console, 'log');
      });

      it("should throw an error when no parameters provided.", function() {
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

      it("should throw an error when the argument is of an invalid type.", function() {
        expect(function() {
          eventSource._emitSafe({});
        }).toThrow(errorMatch.argInvalidType("event", "pentaho.type.Event"));
      });

      it("should not interrupt the event being processed nor return null if a listener throws an exception.", function() {
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

        expect(eventSource._emitSafe(event)).not.toBeNull();

        expect(listeners.second).toHaveBeenCalled();

        expect(console.log).toHaveBeenCalledTimes(1);
      });

    }); // #_emitSafe

  }); // #pentaho.lang.EventSource
});
