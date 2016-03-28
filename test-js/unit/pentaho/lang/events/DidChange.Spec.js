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
    var type = "change";

    it("should extend Event", function() {
      expect(DidChange.prototype instanceof Event).toBe(true);
    });

    it("static property type should return full type name", function() {
      expect(DidChange.type).toBe("did:" + type);
    });

    it("static property type should be read-only", function() {
      expect(function() {
        DidChange.type = "New Name";
      }).toThrowError(TypeError);
    });

    describe("instances -", function() {
      var event;

      var value = 123;
      var will = {dataFilter: {}};

      beforeEach(function() {
        event = new DidChange({}, value, will);
      });

      it("should extend Event", function() {
        expect(event instanceof Event).toBe(true);
      });

      it("value property should be the same than received in the constructor", function() {
        expect(event.value).toBe(value);
      });

      it("property property should be the same than received in the constructor", function() {
        expect(event.property).toBe(will.property);
      });

      it("value property should be immutable", function() {
        expect(function() {
          event.value = "other";
        }).toThrowError(TypeError);
      });
    });

    it("should throw if empty will parameter", function() {
      expect(function() {
        return new DidChange({});
      }).toThrow(errorMatch.argRequired("will"));
    });

  }); // #pentaho.lang.events.DidChange
});
