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

