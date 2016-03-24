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
  "pentaho/lang/events/WillChange"
], function(Event, WillChange) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.lang.events.WillChange -", function() {
    var type = "change";

    it("should extend Event", function() {
      expect(WillChange.prototype instanceof Event).toBe(true);
    });

    it("static property type should return full type name", function() {
      expect(WillChange.type).toBe("will:" + type);
    });

    it("static property type should be read-only", function() {
      expect(function() {
        WillChange.type = "New Name";
      }).toThrowError(TypeError);
    });

    describe("instances -", function() {
      var event;

      var changeset = { mock: "I am a mock" };

      beforeEach(function() {
        event = new WillChange({}, changeset);
      });

      it("should extend Event", function() {
        expect(event instanceof Event).toBe(true);
      });

      it("changeset should be the same than received in the constructor", function() {
        expect(event.changeset).toBe(changeset);
      });

      it("changeset property should be immutable", function() {
        expect(function() {
          event.changeset = {};
        }).toThrowError(TypeError);

        expect(event.changeset).toBe(changeset);
      });
    });

  }); // #pentaho.lang.events.WillChange
});
