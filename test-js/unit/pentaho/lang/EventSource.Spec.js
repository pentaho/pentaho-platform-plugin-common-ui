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
  ""
], function(Event, EventSource) {
  "use strict";

  describe("pentaho.lang.EventSource -", function() {
    var eventSource;
    beforeEach(function() {
      eventSource = new EventSource();
    });

    xdescribe("#on(type, listener, keyArgs) -", function() {
      var event, state;
      beforeEach(function() {
        event = new Event("foo");
        state = "";
        eventSource.on("foo", function() {
          eventSource.on("foo", function(){
            state = "third";
          });
          state = "first";
        });
        eventSource.on("foo", function() {
          state = "second";
        });
      });

      it("should not yet notify a listener if is being registered during an emit cycle", function() {
        eventSource._emit(event);
        expect(state).toBe("second");
      });

      xit("should only notify a listener in the emit cycles that take place after registering the listener", function() {
        eventSource._emit(event);
        expect(state).toBe("second");
        eventSource._emit(event);
        expect(state).toBe("third");
      });


    }); // on#

    describe("#off(type, listener) -", function() {

      xit("should still notify a listener if it is unregistered during an emit cycle", function() {
        expect(true).toBe(false);
      });

      xit("should only stop notifying a listener in the emit cycles that take place after unregistering the listener", function() {
        expect(true).toBe(false);
      });

    }); // #off

    describe("#_hasListeners(type) -", function() {

      xit("should return `true` if there are registered listeners", function() {
        expect(eventSource._hasListeners("foo")).toBe(false);
        eventSource.on("foo", function() {
        });
        expect(eventSource._hasListeners("foo")).toBe(true);
      });

      xit("should return `false` if there are no registered listeners", function() {
        expect(eventSource._hasListeners("foo")).toBe(false);

        var fooListener = function() {
        };
        eventSource.on("foo", fooListener);
        expect(eventSource._hasListeners("foo")).toBe(true);
        eventSource.off("foo", fooListener);
        expect(eventSource._hasListeners("foo")).toBe(false);
      });

    }); // #_hasListeners

    xdescribe("#_emit(event) -", function() {
      var event;
      beforeEach(function() {
        event = new Event("foo");
      });

      it("should notify a listener registered for the same event type as the event being emitted", function() {
        var state = "";
        eventSource.on("foo", function() {
          state = "foo";
        });
        eventSource.on("bar", function() {
          state = "bar";
        });

        eventSource._emit(event);
        expect(state).toBe("foo");
      });

      it("should not notify a listener registered for a different event type as the event being emitted", function() {
        var state = "";
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
        var state = "";
        eventSource.on("foo", function() {
          state = "first";
        }, {
          priority: 0
        });
        eventSource.on("foo", function() {
          state = "second";
        }, {
          priority: -1
        });

        eventSource._emit(event);
        expect(state).toBe("second");
      });

      it("should handle listerners registered with a priority of `Infinity`", function() {
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

      it("should respect the insertion order, if the priority of the registered event listeners is the same", function() {
        var state = "original";
        eventSource.on("foo", function() {
          state = state + " first";
        }, {
          priority: 0
        });
        eventSource.on("foo", function() {
          state = state + " second";
        }, {
          priority: 0
        });

        eventSource._emit(event);
        expect(state).toBe("original first second");
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
        expect(state).toBe("original second first");
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
        expect(state).toBe(1);
      });

      it("should interrupt the event being processed if a listener throws an exception", function() {
        var state = "original";
        eventSource.on("foo", function() {
          state = "first";
          throw new Error("Stirb!");
        });
        eventSource.on("foo", function() {
          state = "second";
        });

        expect(function() {
          eventSource._emit(event);
        }).toThrowError("Stirb!");

        expect(state).toBe("first");
      });

    }); // #_emit

  }); // #pentaho.lang.EventListener
});