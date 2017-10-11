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
  "pentaho/type/events/RejectedChange",
  "tests/pentaho/util/errorMatch"
], function(Event, RejectedChange, errorMatch) {
  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false */

  describe("pentaho.type.events.RejectedChange -", function() {
    
    it("should extend Event", function() {
      expect(RejectedChange.prototype instanceof Event).toBe(true);
    });

    describe("instances -", function() {
      var event;

      var error = "no go!";
      var changeset = {};

      beforeEach(function() {
        event = new RejectedChange({}, changeset, error);
      });

      it("should extend Event", function() {
        expect(event instanceof Event).toBe(true);
      });

      it("error property should be the same as that received in the constructor", function() {
        expect(event.error).toBe(error);
      });

      it("changeset property should be the same as that received in the constructor", function() {
        expect(event.changeset).toBe(changeset);
      });

      it("error property should be immutable", function() {
        expect(function() {
          event.error = new Error("other");
        }).toThrowError(TypeError);
      });
    });

    it("should throw if empty error parameter", function() {
      expect(function() {
        return new RejectedChange({}, {});
      }).toThrow(errorMatch.argRequired("error"));
    });

    it("should throw if empty changeset parameter", function() {
      expect(function() {
        return new RejectedChange({});
      }).toThrow(errorMatch.argRequired("changeset"));
    });

  }); // #pentaho.lang.events.RejectedChange
});
