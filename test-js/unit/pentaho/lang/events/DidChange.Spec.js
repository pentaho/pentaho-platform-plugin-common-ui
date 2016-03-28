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
  "pentaho/lang/events/DidChange",
  "tests/pentaho/util/errorMatch"
], function(Event, DidChange, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.lang.events.DidChange -", function() {

    it("should extend Event", function() {
      expect(DidChange.prototype instanceof Event).toBe(true);
    });

    describe("instances -", function() {
      var event;

      var changeset = { mock: "I am a mock" };

      beforeEach(function() {
        event = new DidChange({}, changeset);
      });

      it("should extend Event", function() {
        expect(event instanceof Event).toBe(true);
      });

      it("changeset property should be the same than received in the constructor", function() {
        expect(event.changeset).toBe(changeset);
      });

      it("DidChange events should not be cancelable", function() {
        expect(event.isCancelable).toBe(false);
      });

      it("changeset property should be immutable", function() {
        expect(function() {
          event.changeset = "other";
        }).toThrowError(TypeError);
      });
    });

  }); // #pentaho.lang.events.DidChange
});
