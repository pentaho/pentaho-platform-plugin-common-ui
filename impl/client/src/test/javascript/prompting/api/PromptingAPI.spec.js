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


define(["common-ui/prompting/api/PromptingAPI"], function (PromptingAPI) {
  describe("PromptingAPI unit tests", function () {
    var api;
    var testLogMsg = "Test log message";

    it("should fail creating a Prompting API", function() {
      expect(function() {
        new PromptingAPI();
      }).toThrowError(PromptingAPI._msgs.NO_ID);
    });

    describe("successfully create a Prompting API", function () {
      var id = "htmlID";

      beforeEach(function () {
        api = new PromptingAPI(id);
      });

      it("should verify all api classes are created and defined", function () {
        expect(api.operation).toBeDefined();
        expect(api.util).toBeDefined();
        expect(api.ui).toBeDefined();
        expect(api.event).toBeDefined();
        expect(api.log).toBeDefined();
      });

      it("should test log info", function () {
        spyOn(console, "log");
        api.log.info(testLogMsg);
        expect(console.log).toHaveBeenCalledWith(testLogMsg);
      });

      it("should test log warn", function () {
        spyOn(console, "warn");
        api.log.warn(testLogMsg);
        expect(console.warn).toHaveBeenCalledWith(testLogMsg);
      });

      it("should test log error and not throw and exception", function () {
        spyOn(console, "error");
        api.log.error(testLogMsg);
        expect(console.error).toHaveBeenCalledWith(testLogMsg);
      });

      it("should test log error and throw and exception", function () {
        expect(function () {
          api.log.error(testLogMsg, true);
        }).toThrowError(testLogMsg);

        expect(function () {
          api.log.error(new Error(testLogMsg), true);
        }).toThrowError(testLogMsg);
      });
    });
  });
});
