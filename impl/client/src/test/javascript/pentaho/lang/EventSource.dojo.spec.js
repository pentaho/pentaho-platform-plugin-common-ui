/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

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
