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


define(["common-ui/prompting/api/OperationAPI"], function(OperationAPI) {
  describe("OperationAPI unit tests", function() {
    var operationApi, apiSpy, promptPanelSpy, htmlId, paramDefnSpy;
    beforeEach(function() {

      promptPanelSpy = jasmine.createSpyObj("PromptPanel", ["refresh", "init", "getParameterValues", "getParameterDefinition", "setParamDefn", "setParameterValue", "refreshPrompt", "getState", "setState", "submit"]);

      apiSpy = jasmine.createSpy("PromptingAPI");
      apiSpy.log = jasmine.createSpyObj("Log", ["info", "warn", "error"]);

      apiSpy.log.error.and.callFake(function(msg, throwErr) {
        if (throwErr) {
          throw (msg instanceof Error) ? msg : new Error(msg);
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
        }).toThrowError(operationApi._msgs.NO_PARAM_DEFN_FUNC);

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
        }).toThrowError(operationApi._msgs.NO_PARAM_DEFN);

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
        expect(operationApi.init).toThrowError();
      });
    });

    describe("should test getParameterValues", function() {
      it("should return getParameterValues", function() {
        var fakeValues = jasmine.createSpy("parameterValues");
        promptPanelSpy.getParameterValues.and.returnValue(fakeValues);
        var values = operationApi.getParameterValues();

        expect(operationApi._getPromptPanel).toHaveBeenCalled();
        expect(promptPanelSpy.getParameterValues).toHaveBeenCalled();
        expect(values).toBe(fakeValues);
      });

      it("should return empty result if thrown an exception", function() {
        var errorMsg = "test error";
        promptPanelSpy.getParameterValues.and.throwError(errorMsg);
        var values = operationApi.getParameterValues();

        expect(operationApi._getPromptPanel).toHaveBeenCalled();
        expect(promptPanelSpy.getParameterValues).toHaveBeenCalled();
        expect(values).toEqual({});
        expect(apiSpy.log.error).toHaveBeenCalledWith(new Error(errorMsg));
      });
    });

    it("should test setParameterValue", function() {
      operationApi.setParameterValue("param", "value");

      expect(operationApi._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.setParameterValue).toHaveBeenCalledWith("param", "value");
    });

    it("should test submit", function() {
      var options = {isInit: true};
      operationApi.submit(options);

      expect(operationApi._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.submit).toHaveBeenCalledWith(promptPanelSpy, options);
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

      it("should return current state if happened an exception during setting state", function() {
        var state = {
          "parametersChanged": false
        };
        var errorMsg = "test error";
        promptPanelSpy.setState.and.throwError(errorMsg);
        var result = operationApi.state(state);
        expect(result).toBe(fakeState);
        expect(apiSpy.log.error).toHaveBeenCalledWith(new Error(errorMsg));
        expect(promptPanelSpy.setState).toHaveBeenCalledWith(state);
        expect(promptPanelSpy.getState).toHaveBeenCalled();
      });

      it("should return empty JSON if happened an exception during getting state", function() {
        var state = {
          "parametersChanged": false
        };
        var errorMsg = "test error";
        promptPanelSpy.getState.and.throwError(errorMsg);
        var result = operationApi.state(state);
        expect(result).toEqual({});
        expect(apiSpy.log.error).toHaveBeenCalledWith(new Error(errorMsg));
        expect(promptPanelSpy.setState).toHaveBeenCalledWith(state);
        expect(promptPanelSpy.getState).toHaveBeenCalled();
      });
    });
  });
});
