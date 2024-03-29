/*!
 * Copyright 2022 Hitachi Vantara.  All rights reserved.
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
  "pentaho/visual/action/Base",
  "pentaho/visual/action/Message",
  "tests/pentaho/util/errorMatch"
], function (BaseAction, MessageAction, errorMatch) {

  "use strict";

  describe("pentaho.visual.action.Message", function () {

    it("should be defined", function () {

      expect(typeof MessageAction).toBe("function");
    });

    it("should extend visual.action.Base", function () {

      expect(MessageAction.prototype instanceof BaseAction).toBe(true);
    });

    describe("#code", function () {

      it("should throw when setting a non string value", function () {

        expect(function () {
          var messageAction = new MessageAction({code: 1, description: "XPTO"});
        }).toThrow(errorMatch.argInvalidType("code", ["string"], "number"));
      });

      it("should return null when setting empty string", function () {
        var messageAction = new MessageAction({code: "", description: "XPTO"});
        expect(messageAction.code).toBe(null);
      });

      it("should return the set value", function () {
        var messageAction = new MessageAction({code: "XPTO", description: "OTPX"});
        expect(messageAction.code).toBe("XPTO");
      });
    });

    describe("#description", function () {

      it("should throw when setting a non string value", function () {

        expect(function () {
          var messageAction = new MessageAction({code: "XPTO", description: 1});
        }).toThrow(errorMatch.argInvalidType("description", ["string"], "number"));
      });

      it("should return null when setting empty string", function () {
        var messageAction = new MessageAction({code: "XPTO", description: ""});
        expect(messageAction.description).toBe(null);
      });

      it("should return the set value", function () {
        var messageAction = new MessageAction({code: "XPTO", description: "OTPX"});
        expect(messageAction.description).toBe("OTPX");
      });
    });

  });
});