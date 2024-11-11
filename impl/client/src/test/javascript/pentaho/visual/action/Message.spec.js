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