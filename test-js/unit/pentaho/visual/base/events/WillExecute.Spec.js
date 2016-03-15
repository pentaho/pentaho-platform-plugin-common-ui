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
  "pentaho/visual/base/events/WillExecute",
  "tests/pentaho/util/errorMatch"
], function(Event, WillExecute, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.events.WillExecute -", function() {
    var type = "execute";

    it("should extend Event", function() {
      expect(WillExecute.prototype instanceof Event).toBe(true);
    });

    it("static property type should return full type name", function() {
      expect(WillExecute.type).toBe("will:" + type);
    });

    it("static property type should be read-only", function() {
      expect(function() {
        WillExecute.type = "New Name";
      }).toThrowError(TypeError);
    });

    describe("instances -", function() {
      var event;

      var filter = {};
      var mode = function() {};

      beforeEach(function() {
        event = new WillExecute({}, filter, mode);
      });

      it("should extend Event", function() {
        expect(event instanceof Event).toBe(true);
      });

      it("dataFilter property should be the same than received in the constructor", function() {
        expect(event.dataFilter).toBe(filter);
      });

      it("doExecute property should be the same than received in the constructor", function() {
        expect(event.doExecute).toBe(mode);
      });

      it("dataFilter property should not be immutable", function() {
        var newFilter = "other";

        expect(function() {
          event.dataFilter = newFilter;
        }).not.toThrow();

        expect(event.dataFilter).toBe(newFilter);
      });

      it("doExecute property should only accept functions", function() {
        expect(function() {
          event.doExecute = null;
        }).toThrow(errorMatch.argInvalidType("doExecute", "function", "object"));

        var newMode = "no function";

        expect(function() {
          event.doExecute = newMode;
        }).toThrow(errorMatch.argInvalidType("doExecute", "function", "string"));

        newMode = function otherFunction() {};

        event.doExecute = newMode;

        expect(event.doExecute).not.toBe(mode);
        expect(event.doExecute).toBe(newMode);
      });
    });

    it("should throw if empty doExecute parameter", function() {
      expect(function() {
        return new WillExecute({}, {});
      }).toThrow(errorMatch.argRequired("doExecute"));
    });

    it("should throw if doExecute parameter is not a function", function() {
      expect(function() {
        return new WillExecute({}, {}, "no function");
      }).toThrow(errorMatch.argInvalidType("doExecute", "function", "string"));
    });

  }); // #pentaho.events.WillExecute
});
