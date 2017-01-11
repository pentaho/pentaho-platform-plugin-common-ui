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
  "tests/pentaho/util/errorMatch"
], function(Event, errorMatch) {
  "use strict";

  /* global jasmine:false, describe:false, it:false, expect:false, beforeEach:false, spyOn: false */

  describe("pentaho.lang.Event -", function() {
    var event, nc_event, source;

    beforeEach(function() {
      source = {}; // mock for `new EventSource(); `
      event = new Event("foo", source, true);
      nc_event = new Event("bar", source, false);
    });

    it("should be defined.", function() {
      expect(typeof Event).toBeDefined();
    });

    describe("the constructor -", function() {
      it("should throw an `argRequired` error if the `type` argument is omitted.", function() {
        expect(function() {
          new Event();
        }).toThrow(errorMatch.argRequired("type"));
      });

      it("should throw an `argRequired` error if the `source` argument is omitted.", function() {
        expect(function() {
          new Event("foo");
        }).toThrow(errorMatch.argRequired("source"));
      });
    });

    describe("#type -", function() {
      it("should return the proper type when constructing an event of a type.", function() {
        expect(event.type).toBe("foo");
      });
    }); // #type

    describe("#source -", function() {
      it("should return the object where the event was initially emitted.", function() {
        expect(event.source).toBe(source);
      });
    }); // #source

    describe("#isCancelable -", function() {
      it("should return `true` if the event is cancelable.", function() {
        expect(event.isCancelable).toBe(true);
      });

      it("should return `false` if the event isn't cancelable.", function() {
        expect(nc_event.isCancelable).toBe(false);
      });
    }); // #isCancelable

    describe("#cancel() -", function() { //and #isCanceled()
      var expectCancelEvent = function(e, initial, final) {
        expect(e.isCanceled).toBe(initial);
        e.cancel();
        expect(e.isCanceled).toBe(final);
      };

      it("should mark the event as canceled if the event is cancelable.", function() {
        expectCancelEvent(event, false, true);
      });

      it("should have no effect if the event is cancelable.", function() {
        expectCancelEvent(nc_event, false, false);
      });

      it("should have no effect if the event is already canceled.", function() {
        expectCancelEvent(event, false, true);
        expectCancelEvent(event, true, true);
      });

      it("should provide a reason for the failure.", function() {
        expect(event.cancelReason).toBeNull();
        event.cancel("just because");
        expect(event.cancelReason.message).toBe("just because");
      });

    }); // #cancel()

    describe("#clone -", function() {
      var clone;

      beforeEach(function() {
        clone = event.clone();
      });

      it("should return an event that is distinct from the original", function() {
        expect(clone).not.toBe(event);
      });

      it("should return an event that has the same `type` as the original", function() {
        expect(clone.type).toBe(event.type);
      });

      it("should return an event that has the same `source` as the original", function() {
        expect(clone.source).toBe(event.source);
      });

      it("should return an event that has the same `isCancelable` as the original", function() {
        expect(clone.isCancelable).toBe(event.isCancelable);
      });

      it("should not cancel the clone event if the original event was cancelled.", function() {
        event.cancel();
        expect(event.isCanceled).toBe(true);
        expect(clone.isCanceled).toBe(false);
      });

      it("should preserve properties if the event is an instance of a subclass of `pentaho.lang.Event`", function(){
        var DerivedEvent = Event.extend({
          extraProperty: "extraProperty",
          extraMethod: function(){
            return "extraMethod";
          }
        });

        var type = "foo";
        var derivedEvent = new DerivedEvent(type, {}, true);
        var clone = derivedEvent.clone();

        expect(clone instanceof DerivedEvent).toBe(true);
        expect(clone.type).toBe(type);
        expect(clone.extraProperty).toBe("extraProperty");
        expect(clone.extraMethod()).toBe("extraMethod");
      });
    }); // #clone()

  }); // #pentaho.lang.Event
});
