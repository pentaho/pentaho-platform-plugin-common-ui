/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file expect in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

define(["common-ui/prompting/api/PromptingAPI"], function (PromptingAPI) {
  describe("PromptingAPI unit tests", function () {
    var api;
    var testLogMsg = "Test log message";

    it("should fail creating a Prompting API", function() {
      expect(function() {
        new PromptingAPI();
      }).toThrow(PromptingAPI._msgs.NO_ID);
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
        }).toThrow(testLogMsg);
      });
    });
  });
});
