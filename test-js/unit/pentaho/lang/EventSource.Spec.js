/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "pentaho/util/error"
], function(Event, EventSource, error) {
  "use strict";

  describe("pentaho.lang.EventSource -", function() {
    var eventSource;
    beforeEach(function() {
      eventSource = new EventSource();
    });

    describe("#on and #off -", function() {
      var event1, event2, source, listener, state;
      beforeEach(function() {
        source = {};
        event1 = new Event("foo", source, true);
        event2 = new Event("bar", source, true);
        state = 0;
        listener = function() {
          state = state + 1;
        };
      });

      it("both #on and #off should accept a csv string of types and register the given listener function", function() {
        eventSource.on("foo,bar", listener);
        eventSource._emit(event1);
        eventSource._emit(event2);
        expect(state).toBe(2);

        eventSource.off("foo,bar", listener);
        eventSource._emit(event1);
        eventSource._emit(event2);
        expect(state).toBe(2);
      });

      it("both #on and #off should accept an array of strings of types and register the given listener function", function() {
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

      it("should not yet notify a listener if is being registered during an emit cycle", function() {
        eventSource.on("foo", function() {
          eventSource.on("foo", function() {
            state = state + " third";
          });
          state = state + " first";
        });
        eventSource.on("foo", function() {
          state = state + " second";
        });
        eventSource._emit(event);
        expect(state).toBe("original first second");
      });

      it("should only notify a listener in the emit cycles that take place after registering the listener", function() {
        eventSource.on("foo", function() {
          eventSource.on("foo", function() {
            state = state + " third";
          });
          state = state + " first";
        });
        eventSource.on("foo", function() {
          state = state + " second";
        });
        eventSource._emit(event);
        expect(state).toBe("original first second");
        eventSource._emit(event);
        expect(state).toBe("original first second first second third");
      });

      it("should throw an error when no parameters provided.", function() {
        expect(function() {
          eventSource.on();
        }).toThrowError(error.argRequired("type").message);
        expect(function() {
          eventSource.on(null);
        }).toThrowError(error.argRequired("type").message);
        expect(function() {
          eventSource.on(undefined);
        }).toThrowError(error.argRequired("type").message);
      });

      it("should throw an error when type parameter is set but the listener parameter is not provided.", function() {
        expect(function() {
          eventSource.on("test");
        }).toThrowError(error.argRequired("listener").message);
        expect(function() {
          eventSource.on("test", null);
        }).toThrowError(error.argRequired("listener").message);
        expect(function() {
          eventSource.on("test", undefined);
        }).toThrowError(error.argRequired("listener").message);
      });
    }); // on#

    describe("#off(type, listener) -", function() {
      var event, source, state;
      beforeEach(function() {
        source = {};
        event = new Event("foo", source, true);
        state = "original";
      });

      it("should still notify a listener if it is unregistered during an emit cycle", function() {
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

      it("should only stop notifying a listener in the emit cycles that take place after unregistering the listener", function() {
        var handle;

        eventSource.on("foo", function() {
          eventSource.off(handle);
          state = state + " first";
        });

        handle = eventSource.on("foo", function() {
          state = state + " second";
        });

        eventSource._emit(event);
        eventSource._emit(event);

        expect(state).toBe("original first second first");
      });

      it("should throw an error when no parameters provided.", function() {
        expect(function() {
          eventSource.off();
        }).toThrowError(error.argRequired("typeOrHandle").message);
        expect(function() {
          eventSource.off(null);
        }).toThrowError(error.argRequired("typeOrHandle").message);
        expect(function() {
          eventSource.off(undefined);
        }).toThrowError(error.argRequired("typeOrHandle").message);
      });

      it("should throw an error when the typeOrHandle is a string but no listerner is provided.", function() {
        expect(function() {
          eventSource.off("test");
        }).toThrowError(error.argRequired("listener").message);
        expect(function() {
          eventSource.off("test", null);
        }).toThrowError(error.argRequired("listener").message);
        expect(function() {
          eventSource.off("test", undefined);
        }).toThrowError(error.argRequired("listener").message);
      });

    }); // #off

    describe("#_hasListeners(type) -", function() {

      it("should return `true` if there are registered listeners", function() {
        expect(eventSource._hasListeners("foo")).toBe(false);
        eventSource.on("foo", function() {
        });
        expect(eventSource._hasListeners("foo")).toBe(true);
      });

      it("should return `false` if there are no registered listeners", function() {
        expect(eventSource._hasListeners("foo")).toBe(false);

        var fooListener = function() {
        };
        eventSource.on("foo", fooListener);
        expect(eventSource._hasListeners("foo")).toBe(true);
        eventSource.off("foo", fooListener);
        expect(eventSource._hasListeners("foo")).toBe(false);
      });

    }); // #_hasListeners

    describe("#_emit(event) -", function() {
      var event, source;
      beforeEach(function() {
        source = {};
        event = new Event("foo", source, true);
      });

      it("should throw an error when no parameters provided.", function() {
        expect(function() {
          eventSource._emit();
        }).toThrowError(error.argRequired("event").message);
        expect(function() {
          eventSource._emit(null);
        }).toThrowError(error.argRequired("event").message);
        expect(function() {
          eventSource._emit(undefined);
        }).toThrowError(error.argRequired("event").message);
        expect(function() {
          eventSource._emit({});
        }).toThrowError(error.argInvalidType("event", "pentaho.type.Event").message);
      });

      it("should notify a listener registered for the same event type as the event being emitted", function() {
        var state = "original";
        eventSource.on("foo", function() {
          state = state + " foo";
        });
        eventSource.on("bar", function() {
          state = state + " bar";
        });

        eventSource._emit(event);
        expect(state).toBe("original foo");
      });

      it("should not notify a listener registered for a different event type as the event being emitted", function() {
        var state = "original";
        eventSource.on("bar", function() {
          state = "bar";
        });
        eventSource.on("foo", function() {
          state = "foo";
        });
        eventSource.on("spam", function() {
          state = "spam";
        });

        eventSource._emit(event);
        expect(state).not.toBe("bar");
        expect(state).not.toBe("spam");
      });

      it("should respect the priority with which the event listeners are registered", function() {
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

      it("should handle listeners registered with a priority of `Infinity`", function() {
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

      it("should handle listeners registered with a priority of Number.MAX_VALUE before `Infinity` and `Number.MIN_VALUE` after 0", function() {
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

      it("should respect the insertion order, if the priority of the registered event listeners is the same", function() {
        [
          10, 1, 0, -1, 10
        ].forEach(function(p) {
          var eventSource = new EventSource();
          var event = new Event("foo", {}, true);

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

      it("should convert `nully` priorities to 0", function() {
        [
          null, undefined, false, ""
        ].forEach(function(p) {
          var eventSource = new EventSource();
          var event = new Event("foo", {}, true);
          var state = "original";

          eventSource.on("foo", function() {
            state = state + " first";
          }, {
            priority: 0
          });
          eventSource.on("foo", function() {
            state = state + " second";
          }, {
            priority: p
          });
          eventSource.on("foo", function() {
            state = state + " third";
          }, {
            priority: 0
          });

          eventSource._emit(event);
          expect(state).toBe("original first second third");
        });
      });

      it("should skip the execution of event listeners with lower priority when an event is canceled by a higher-priority event listener", function() {
        var state = "original";
        eventSource.on("foo", function(event) {
          event.cancel();
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
        expect(state).toBe("original first");
      });

      it("should only invoke a listener once even if it is registered multiple times", function() {
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

      it("should interrupt the event being processed if a listener throws an exception", function() {
        var state = "original";
        eventSource.on("foo", function() {
          state = state + " first";
          throw new Error("Stirb!");
        });
        eventSource.on("foo", function() {
          state = state + " second";
        });

        expect(function() {
          eventSource._emit(event);
        }).toThrowError("Stirb!");

        expect(state).toBe("original first");
      });

    }); // #_emit

  }); // #pentaho.lang.EventListener
});
