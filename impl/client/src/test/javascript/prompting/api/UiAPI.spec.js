/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
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

define(["common-ui/prompting/api/UiAPI"], function(UiAPI) {

  describe("UiAPI unit tests", function() {
    var uiApi;
    var apiSpy;
    var promptPanelSpy;
    var dashboardSpy;

    beforeEach(function() {
      promptPanelSpy = jasmine.createSpyObj("PromptPanel", [
        "showProgressIndicator",
        "hideProgressIndicator",
        "getDashboard",
        "setBlockUiOptions",
        "setDisabledSubmitButton"
      ]);
      dashboardSpy = jasmine.createSpyObj("Dashboard", ["_setBlockUiOptions"]);
      promptPanelSpy.getDashboard.and.returnValue(dashboardSpy);

      apiSpy = jasmine.createSpy("PromptingAPI");
      apiSpy.operation = jasmine.createSpyObj("OperationAPI", ["_getPromptPanel"]);
      apiSpy.operation._getPromptPanel.and.returnValue(promptPanelSpy);

      uiApi = new UiAPI(apiSpy);
    });

    it("should show progress indicator", function() {
      uiApi.showProgressIndicator();
      expect(apiSpy.operation._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.showProgressIndicator).toHaveBeenCalled();
    });

    it("should hide progress indicator", function() {
      uiApi.hideProgressIndicator();
      expect(apiSpy.operation._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.hideProgressIndicator).toHaveBeenCalled();
    });

    it("should set the block ui options", function() {
      var optionsSpy = jasmine.createSpy("Options");
      uiApi.setBlockUiOptions(optionsSpy);
      expect(apiSpy.operation._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.setBlockUiOptions).toHaveBeenCalledWith(optionsSpy);
    });

    it("should disable submit button", function() {
      uiApi.setDisabledSubmitButton(true);
      expect(apiSpy.operation._getPromptPanel).toHaveBeenCalled();
      expect(promptPanelSpy.setDisabledSubmitButton).toHaveBeenCalledWith(true);
    });
  });
});

