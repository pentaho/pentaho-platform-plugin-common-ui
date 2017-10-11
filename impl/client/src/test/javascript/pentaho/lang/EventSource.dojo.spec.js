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
  "dojo/on"
], function(Event, EventSource, dojoOn) {
  "use strict";

  /* global jasmine:false, describe:false, it:false, expect:false, beforeEach:false, spyOn: false */

  describe("pentaho.lang.EventSource", function() {
    var eventSource;

    beforeEach(function() {
      eventSource = new EventSource();
    });

    describe("dojo/on(type, listener)", function() {
      it("calls the event source's on method", function() {
        spyOn(eventSource, "on").and.callThrough();

        var listener = function() {};
        dojoOn(eventSource, "foo", listener);

        expect(eventSource.on).toHaveBeenCalledWith("foo", listener);

        expect(eventSource._hasListeners("foo")).toBe(true);
      });

      it("returns an object compliant with pentaho.lang.IEventRegistrationHandle", function() {
        var listener = function() {};
        var handle = dojoOn(eventSource, "foo", listener);

        expect(typeof handle).toBe("object");
        expect(typeof handle.dispose).toBe("function");
        expect(typeof handle.remove).toBe("function");
      });

      it("can use on.once to automatically unregister after first event", function() {
        var listener = jasmine.createSpy("listener");
        var event = new Event("foo", eventSource, true);

        var handle = dojoOn.once(eventSource, "foo", listener);

        spyOn(handle, "remove").and.callThrough();

        expect(eventSource._hasListeners("foo")).toBe(true);

        eventSource._emit(event);

        expect(listener).toHaveBeenCalledWith(event);
        expect(handle.remove).toHaveBeenCalled();
        expect(eventSource._hasListeners("foo")).toBe(false);
      });
    }); // dojo/on
  }); // #pentaho.lang.EventSource

});
