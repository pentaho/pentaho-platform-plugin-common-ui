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
  "pentaho/lang/EventSource"
], function() {
  "use strict";

  describe("pentaho.lang.Event -", function(Event, EventSource) {
    var event, nc_event, source;
    beforeEach(function() {
      source = new EventSource();

      event = new Event("foo", source, true);
      nc_event = new Event("bar", source, false);
    });

    xit("should be defined.", function() {
      expect(typeof Event).toBeDefined();
    });

    describe("#type -", function() {
      xit("should return the proper type when constructing an event of a type.", function() {
        expect(event.type()).toBe("foo");
      });
    }); // #type

    describe("#source -", function() {
      xit("should return the object where the event was initially emitted.", function() {
        expect(event.source).toBe(source);
      });
    }); // #source

    describe("#isCancelable -", function() {
      xit("should return `true` if the event is cancelable.", function() {
        expect(event.isCancelable()).toBe(true);
      });

      xit("should return `false` if the event isn't cancelable.", function() {
        expect(nc_event.isCancelable()).toBe(false);
      });
    }); // #isCancelable

    describe("#cancel() -", function() { //and #isCanceled()
      var expectCancelEvent = function(e, initial, final) {
        expect(e.isCanceled()).toBe(initial);
        e.cancel();
        expect(e.isCanceled()).toBe(final);
      };

      xit("should mark the event as canceled if the event is cancelable.", function() {
        expectCancelEvent(event, false, true);
      });

      xit("should have no effect if the event is cancelable.", function() {
        expectCancelEvent(nc_event, false, false);
      });

      xit("should have no effect if the event is already canceled.", function() {
        expectCancelEvent(event, false, true);
        expectCancelEvent(event, true, true);
      });
    }); // #cancel()

    describe("#clone -", function() {
      var clone = event.clone();

      xit("the cloned event should not be the same as the original", function() {
        expect(clone).not.toBe(event);
      });

      xit("The cloned event should have the same properties values as the original", function() {
        expect(clone.type).toBe(event.type);
        expect(clone.source).toBe(event.source);
        expect(clone.isCancelable()).toBe(event.isCancelable());
      });

      xit("should not be canceled.", function() {
        event.cancel();
        expect(event.isCanceled()).toBe(true);
        clone = event.clone();
        expect(clone.isCanceled()).toBe(false);
      })
    }); // #clone()

  }); // #pentaho.lang.Event
});
