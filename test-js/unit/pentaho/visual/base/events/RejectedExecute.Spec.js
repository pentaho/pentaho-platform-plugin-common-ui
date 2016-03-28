/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "pentaho/visual/base/events/RejectedExecute",
  "tests/pentaho/util/errorMatch"
], function(Event, RejectedExecute, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.visual.base.events.RejectedExecute -", function() {
    var type = "execute";

    it("should extend Event", function() {
      expect(RejectedExecute.prototype instanceof Event).toBe(true);
    });

    it("static property type should return full type name", function() {
      expect(RejectedExecute.type).toBe("rejected:" + type);
    });

    it("static property type should be read-only", function() {
      expect(function() {
        RejectedExecute.type = "New Name";
      }).toThrowError(TypeError);
    });

    describe("instances -", function() {
      var event;

      var error = "no go!";
      var will = {dataFilter: {}};

      beforeEach(function() {
        event = new RejectedExecute({}, error, will);
      });

      it("should extend Event", function() {
        expect(event instanceof Event).toBe(true);
      });

      it("error property should be the same than received in the constructor", function() {
        expect(event.error).toBe(error);
      });

      it("dataFilter property should be the same than received in the constructor", function() {
        expect(event.dataFilter).toBe(will.dataFilter);
      });

      it("dataFilter property should be immutable", function() {
        expect(function() {
          event.dataFilter = "other";
        }).toThrowError(TypeError);
      });
    });

    it("should throw if empty error parameter", function() {
      expect(function() {
        return new RejectedExecute({}, undefined, {dataFilter: {}});
      }).toThrow(errorMatch.argRequired("error"));
    });

    it("should throw if empty dataFilter parameter", function() {
      expect(function() {
        return new RejectedExecute({}, "no go!");
      }).toThrow(errorMatch.argRequired("will"));
    });

  }); // #pentaho.visual.base.eventsRejectedExecute
});
