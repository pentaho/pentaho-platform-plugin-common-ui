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
], function() {
  "use strict";

  describe("pentaho.lang.EventSource -", function() {

    describe("#on(type, listener, keyArgs) -", function() {

      xit("should not yet notify a listener if is being registered during an emit cycle", function() {
        expect(true).toBe(false);
      });

      xit("should only notify a listener in the emit cycles that take place after registering the listener", function() {
        expect(true).toBe(false);
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

    describe("#_hasListeners() -", function() {

      xit("should return `true` if there are registered listeners", function() {
        expect(true).toBe(false);
      });

      xit("should return `false` if there are no registered listeners", function() {
        expect(true).toBe(false);
      });

    }); // #_hasListeners

    describe("#_emit(event) -", function() {

      xit("should notify a listener registered for the same event type as the event being emitted", function() {
        expect(true).toBe(false);
      });

      xit("should not notify a listener registered for a different event type as the event being emitted", function() {
        expect(true).toBe(false);
      });

      xit("should respect the priority with which the event listeners are registered", function() {
        expect(true).toBe(false);
      });

      xit("should skip the execution of event listeners with lower priority when an event is canceled by a higher-priority event listener", function() {
        expect(true).toBe(false);
      });

    }); // #_emit



  }); // #pentaho.lang.EventListener
});