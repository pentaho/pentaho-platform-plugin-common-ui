/*!
 * Copyright 2010 - 2017 Hitachi Vantara. All rights reserved.
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
  "pentaho/visual/base/events/RejectedUpdate",
  "tests/pentaho/util/errorMatch"
], function(Event, RejectedUpdate, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.visual.base.events.RejectedUpdate -", function() {

    it("should extend Event", function() {
      expect(RejectedUpdate.prototype instanceof Event).toBe(true);
    });

    it("static property type should return full type name", function() {
      expect(RejectedUpdate.type).toBe("rejected:update");
    });

    it("static property type should be read-only", function() {
      expect(function() {
        RejectedUpdate.type = "New Name";
      }).toThrowError(TypeError);
    });

    describe("instances -", function() {
      var event;

      var error = "no go!";

      beforeEach(function() {
        event = new RejectedUpdate({}, error);
      });

      it("should extend Event", function() {
        expect(event instanceof Event).toBe(true);
      });

      it("should not be cancelable", function() {
        expect(event.isCancelable).toBe(false);
      });

      it("error property should be the same than received in the constructor", function() {
        expect(event.error).toBe(error);
      });

      it("should throw if empty error parameter", function() {
        expect(function() {
          return new RejectedUpdate({});
        }).toThrow(errorMatch.argRequired("error"));
      });

    });

  }); // #pentaho.visual.base.events.RejectedUpdate

});
