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
  describe("OperationAPI unit tests", function() {
    var operationApi, apiSpy, promptPanelSpy, xmlStr, xmlStr1, htmlId, paramDefnSpy;
    beforeEach(function() {

      promptPanelSpy = jasmine.createSpyObj("PromptPanel", ["refresh", "init", "getParameterValues", "getParameterDefinition"]);

      apiSpy = jasmine.createSpy("PromptingAPI");
      apiSpy.log = jasmine.createSpyObj("Log", ["info", "warn", "error"]);

      apiSpy.log.error.and.callFake(function(msg, throwErr) {
        if (throwErr) {
          throw msg;
        }
      });

      operationApi = new OperationAPI(apiSpy);

      paramDefnSpy = jasmine.createSpyObj("ParameterDefinition", ["allowAutoSubmit"]);
      spyOn(operationApi._parameterParser, "parseParameterXml").and.returnValue(paramDefnSpy);

      xmlStr = "<XML></XML>";
      xmlStr1 = "<XML1></XML1>";
      htmlId = "ID!";

      spyOn(operationApi, "_getPromptPanel").and.returnValue(promptPanelSpy);
    });

    afterEach(function() {
      expect(operationApi._parameterParser).toBeDefined();
    });

    it("should test private _getPromptPanel and fail", function() {
      operationApi._getPromptPanel.and.callThrough();
      expect(function() {
        operationApi._getPromptPanel();
      }).toThrow(operationApi._msgs.PROMPT_PANEL_NOT_FOUND);

      expect(apiSpy.log.error).toHaveBeenCalledWith(operationApi._msgs.PROMPT_PANEL_NOT_FOUND, true);
    });

    it("should test private _getPromptPanel and succeed", function() {
      operationApi._promptPanel = promptPanelSpy;
      operationApi._getPromptPanel.and.callThrough();

      var promptPanel = operationApi._getPromptPanel();

      expect(promptPanel).toBeDefined();
      expect(promptPanel).toBe(promptPanelSpy);
    });

    describe("render tests", function() {
      var verifyAfter = true;

      afterEach(function() {
        if (verifyAfter) {
          expect(operationApi._parameterParser.parseParameterXml).toHaveBeenCalledWith(xmlStr);
          expect(operationApi._promptPanel).toBeDefined();
          expect(operationApi._promptPanel.destinationId).toBe(htmlId);
          expect(operationApi._promptPanel.paramDefn).toBe(paramDefnSpy);
        }

        verifyAfter = true;
      });

      it("should test render with null getParameterXml callback", function() {
        expect(function() {
          operationApi.render(htmlId, null);
        }).toThrow(operationApi._msgs.NO_PARAM_XML_FUNC);

        verifyAfter = false;
        expect(operationApi._parameterParser.parseParameterXml).not.toHaveBeenCalledWith(xmlStr);
        expect(operationApi._promptPanel).toBeNull();
        expect(apiSpy.log.error).toHaveBeenCalledWith(operationApi._msgs.NO_PARAM_XML_FUNC, true);
      });

      it("should test render with valid getParameterXml callback that returns null", function() {
        var getParameterXml = function(api) {
          expect(api).toBe(apiSpy);
          return null;
        };

        expect(function() {
          operationApi.render(htmlId, getParameterXml);
        }).toThrow(operationApi._msgs.NO_PARAM_XML);
        verifyAfter = false;

        expect(apiSpy.log.error).toHaveBeenCalledWith(operationApi._msgs.NO_PARAM_XML, true);
      });

      it("should test render with valid getParameterXml callback that returns valid results first, then null", function() {
        var getParameterXml = function(api) {
          expect(api).toBe(apiSpy);

          return !operationApi._promptPanel ? xmlStr : null;
        };

        operationApi.render(htmlId, getParameterXml);

        var paramDefnVal;
        operationApi._promptPanel.getParameterDefinition(promptPanelSpy, function(paramDefn) {
          paramDefnVal = paramDefn;
        });

        expect(paramDefnVal).toBeNull();
        expect(apiSpy.log.error).toHaveBeenCalledWith(operationApi._msgs.NO_PARAM_XML);
      });

      it("should test render with valid getParameterXml callback that returns appropriate value", function() {
        var getParameterXml = function(api) {
          expect(api).toBe(apiSpy);
          return !operationApi._promptPanel ? xmlStr : xmlStr1;
        };

        operationApi.render(htmlId, getParameterXml);

        var paramDefnValue;
        operationApi._promptPanel.getParameterDefinition(promptPanelSpy, function(paramDefn) {
          paramDefnValue = paramDefn;
        });

        expect(operationApi._parameterParser.parseParameterXml).toHaveBeenCalledWith(xmlStr1);
        expect(paramDefnValue).toBe(paramDefnSpy);
      });
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