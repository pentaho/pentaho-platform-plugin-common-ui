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

define(['common-ui/prompting/builders/PromptPanelBuilder'], function(PromptPanelBuilder) {

  describe("PromptPanelBuilder", function() {

    var args;

    var promptPanelBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { },
          buildPanelComponents: function() { },
          _ready: function() { }
        }
      };
      promptPanelBuilder = new PromptPanelBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(promptPanelBuilder.build).toThrow();
    });

    it("should return a ScrollingPromptPanelLayoutComponent", function() {
      var component = promptPanelBuilder.build(args.promptPanel);
      expect(component.type).toBe('ScrollingPromptPanelLayoutComponent');
      expect(component.postExecution).toBeDefined();
    });

    it("should execute _ready on postExecution", function() {
      var component = promptPanelBuilder.build(args.promptPanel);
      spyOn(args.promptPanel, '_ready').and.callThrough();
      component.postExecution();
      expect(args.promptPanel._ready).toHaveBeenCalled();
    });

  });

});
