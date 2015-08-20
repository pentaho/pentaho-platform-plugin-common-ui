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

define(["common-ui/prompting/api/OperationAPI"], function(OperationAPI) {
  describe("EventAPI unit tests", function() {
    var operationApi, apiSpy, promptPanelSpy, xmlStr, htmlId, paramDefnSpy;
    beforeEach(function() {

      promptPanelSpy = jasmine.createSpyObj("PromptPanel", ["refresh", "init", "getParameterValues"]);

      apiSpy = jasmine.createSpy("PromptingAPI");
      apiSpy.log = jasmine.createSpyObj("Log", ["info", "warn", "error"]);

      operationApi = new OperationAPI(apiSpy);

      paramDefnSpy = jasmine.createSpyObj("ParameterDefinition", ["allowAutoSubmit"]);
      spyOn(operationApi._parameterParser, "parseParameterXml").and.returnValue(paramDefnSpy);

      xmlStr = "<XML></XML>";
      htmlId = "ID!";

      spyOn(operationApi, "_getPromptPanel").and.returnValue(promptPanelSpy);
    });

    afterEach(function() {
      expect(operationApi._parameterParser).toBeDefined();
    });

    it("should test private _getPromptPanel and fail", function() {
      operationApi._getPromptPanel.and.callThrough();
      operationApi._getPromptPanel();

      expect(apiSpy.log.error).toHaveBeenCalledWith(operationApi._msgs.PROMPT_PANEL_NOT_FOUND, true);
    });

    it("should test private _getPromptPanel and succeed", function() {
      operationApi._promptPanel = promptPanelSpy;
      operationApi._getPromptPanel.and.callThrough();

      var promptPanel = operationApi._getPromptPanel();

      expect(promptPanel).toBeDefined();
      expect(promptPanel).toBe(promptPanelSpy);
    });

    it("should test render", function() {
      operationApi.render(htmlId, xmlStr);

      expect(operationApi._parameterParser.parseParameterXml).toHaveBeenCalledWith(xmlStr);
      expect(operationApi._promptPanel).toBeDefined();
      expect(operationApi._promptPanel.destinationId).toBe(htmlId);
      expect(operationApi._promptPanel.paramDefn).toBe(paramDefnSpy);
    });

    it("should test update", function() {
      operationApi.update(xmlStr);

      expect(operationApi._parameterParser.parseParameterXml).toHaveBeenCalledWith(xmlStr);
      expect(operationApi._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.refresh).toHaveBeenCalledWith(paramDefnSpy);
    });

    it("should test init", function() {
      operationApi.init();

      expect(operationApi._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.init).toHaveBeenCalled();
    });

    it("should test getParameterValues", function() {
      operationApi.getParameterValues();

      expect(operationApi._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.getParameterValues).toHaveBeenCalled();
    });
  });
});