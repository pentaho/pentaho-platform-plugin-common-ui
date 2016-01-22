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
    var operationApi, apiSpy, promptPanelSpy, htmlId, paramDefnSpy;
    beforeEach(function() {

      promptPanelSpy = jasmine.createSpyObj("PromptPanel", ["refresh", "init", "getParameterValues", "getParameterDefinition", "setParamDefn", "setParameterValue", "refreshPrompt", "getState", "setState"]);

      apiSpy = jasmine.createSpy("PromptingAPI");
      apiSpy.log = jasmine.createSpyObj("Log", ["info", "warn", "error"]);

      apiSpy.log.error.and.callFake(function(msg, throwErr) {
        if (throwErr) {
          throw msg;
        }
      });

      htmlId = "ID!";
      operationApi = new OperationAPI(apiSpy, htmlId);

      paramDefnSpy = jasmine.createSpyObj("ParameterDefinition", ["allowAutoSubmit"]);

      spyOn(operationApi, "_getPromptPanel").and.returnValue(promptPanelSpy);
    });

    it("should test private _getPromptPanel and succeed", function() {
      operationApi._promptPanel = promptPanelSpy;
      operationApi._getPromptPanel.and.callThrough();

      var promptPanel = operationApi._getPromptPanel();

      expect(promptPanel).toBeDefined();
      expect(promptPanel).toBe(promptPanelSpy);
    });

    describe("render tests", function() {
      it("should test render with null getParameterDefinitionCallback callback", function() {
        expect(function() {
          operationApi.render(null);
        }).toThrow(operationApi._msgs.NO_PARAM_DEFN_FUNC);

        expect(operationApi._promptPanel).toBeDefined();
        expect(apiSpy.log.error).toHaveBeenCalledWith(operationApi._msgs.NO_PARAM_DEFN_FUNC, true);
      });

      it("should test render with valid getParameterDefinitionCallback callback that returns null", function() {
        var getParameterDefinitionCallback = function(api, callback) {
          expect(api).toBe(apiSpy);
          callback(null);
        };

        expect(function() {
          operationApi.render(getParameterDefinitionCallback);
        }).toThrow(operationApi._msgs.NO_PARAM_DEFN);

        expect(apiSpy.log.error).toHaveBeenCalledWith(operationApi._msgs.NO_PARAM_DEFN, true);
      });

      it("should test render with valid getParameterDefinitionCallback callback that returns appropriate value", function() {
        var getParameterDefinitionCallback = function(api, callback) {
          expect(api).toBe(apiSpy);
          callback(paramDefnSpy);
        };

        operationApi.render(getParameterDefinitionCallback);

        var paramDefnValue;
        operationApi._promptPanel.getParameterDefinition(promptPanelSpy, function(paramDefn) {
          paramDefnValue = paramDefn;
        });

        expect(paramDefnValue).toBe(paramDefnSpy);
        expect(operationApi._promptPanel).toBeDefined();
        expect(operationApi._promptPanel.destinationId).toBe(htmlId);
        expect(operationApi._promptPanel.paramDefn).toBe(paramDefnSpy);
      });

      it("should test render with valid getParameterDefinitionCallback callback async that returns null", function() {
        var count = 0;
        var getParamDefn = function(callback) {
          count++;
          var p = count == 1 ? paramDefnSpy : null;
          callback(p);
        };
        var getParameterDefinitionCallback = function(api, callback) {
          expect(api).toBe(apiSpy);
          getParamDefn(callback);
        };

        operationApi.render(getParameterDefinitionCallback);

        var paramDefnValue;
        operationApi._promptPanel.getParameterDefinition(promptPanelSpy, function(paramDefn) {
          paramDefnValue = paramDefn;
        });

        expect(apiSpy.log.error).toHaveBeenCalledWith(operationApi._msgs.NO_PARAM_DEFN);
        expect(paramDefnValue).toBeNull();
      });
    });

    describe("init tests", function() {
      it("should success init", function() {

        operationApi.init();

        expect(operationApi._getPromptPanel).toHaveBeenCalled();
        expect(promptPanelSpy.init).toHaveBeenCalled();
      });

      it("should warn about duplicate component name", function() {
        promptPanelSpy.init.and.callFake(function() {
          throw {
            message: "addComponent: duplicate component name"
          }
        });
        operationApi.init();

        expect(operationApi._getPromptPanel).toHaveBeenCalled();
        expect(promptPanelSpy.init).toHaveBeenCalled();
        expect(apiSpy.log.warn).toHaveBeenCalledWith("Prompt Panel has been initialized already");
      });

      it("should throw an exception", function() {
        promptPanelSpy.init.and.callThrough();
        operationApi.init();

        expect(operationApi._getPromptPanel).toHaveBeenCalled();
        expect(promptPanelSpy.init).toHaveBeenCalled();
        expect(operationApi.init).toThrow();
      });
    });

    it("should test getParameterValues", function() {
      operationApi.getParameterValues();

      expect(operationApi._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.getParameterValues).toHaveBeenCalled();
    });

    it("should test setParameterValue", function() {
      operationApi.setParameterValue("param", "value");

      expect(operationApi._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.setParameterValue).toHaveBeenCalledWith("param", "value");
    });

    describe("refreshPrompt tests", function() {
      it("should refresh prompt without parameter", function() {
        operationApi.refreshPrompt();
        expect(promptPanelSpy.refreshPrompt).toHaveBeenCalled();
      });

      it("should refresh prompt with parameter", function() {
        var forceUpdate = true;
        operationApi.refreshPrompt(forceUpdate);
        expect(promptPanelSpy.refreshPrompt).toHaveBeenCalledWith(forceUpdate);
      });

      afterEach(function() {
        expect(operationApi._getPromptPanel).toHaveBeenCalled();
      });
    });

    describe("state tests", function() {
      var fakeState = jasmine.createSpy("state");
      beforeEach(function() {
        promptPanelSpy.getState.and.returnValue(fakeState);
      });

      it("should return state without input parameter", function() {
        var result = operationApi.state();
        expect(result).toBe(fakeState);
        expect(promptPanelSpy.setState).not.toHaveBeenCalled();
        expect(promptPanelSpy.getState).toHaveBeenCalled();
      });

      it("should return modified state", function() {
        var state = {
          "parametersChanged": false
        };
        var result = operationApi.state(state);
        expect(result).toBe(fakeState);
        expect(promptPanelSpy.setState).toHaveBeenCalledWith(state);
        expect(promptPanelSpy.getState).toHaveBeenCalled();
      });
    });
  });
});
