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

define(['common-ui/prompting/WidgetBuilder', 'common-ui/prompting/parameters/Parameter'],  function (WidgetBuilder, Parameter) {

  describe("WidgetBuilder", function() {

    it("should have mappings array", function() {
      expect(WidgetBuilder.mapping).toBeDefined();
    });

    it("should throw an error trying to build a prompt-panel with no arguments", function() {
      expect(WidgetBuilder.build).toThrowError();
    });

    it("should successfully build a prompt panel", function() {
      var buildPanelComponentsFn = jasmine.createSpy('buildPanelComponents');
      var args = {
        buildPanelComponents: buildPanelComponentsFn
      };

      var panel = WidgetBuilder.build(args, 'prompt-panel');
      expect(panel.type).toEqual('ScrollingPromptPanelLayoutComponent');
      expect(buildPanelComponentsFn).toHaveBeenCalled();
      expect(panel.promptPanel).toBeDefined();
    });

    it("should call parameterChanged with isSuppressSubmit a true if component has needsUpdateOnNextRefresh set", function() {
      var buildPanelComponentsFn = jasmine.createSpy('buildPanelComponents');
      var parameterChangedFn = jasmine.createSpy("parameterChanged");
      var args = {
        buildPanelComponents: buildPanelComponentsFn,
        promptPanel: {
          parameterChanged: parameterChangedFn
        }
      };

      var customComponentObject = {
        needsUpdateOnNextRefresh: true,
        parameter: 'parameter',
        param: 'param',
        getValue: function() {
          return "value";
        }
      }
      var customComponent = {
        build: function () {
          return customComponentObject;
        }
      };

      spyOn(WidgetBuilder, '_findBuilderFor').and.returnValue(customComponent);
      var panel = WidgetBuilder.build(args, 'custom-component');
      panel.postChange();
      expect(args.promptPanel.parameterChanged).toHaveBeenCalledWith(
          customComponentObject.param, customComponentObject.parameter, customComponentObject.getValue(), {isSuppressSubmit:true});
    });

    it("distinguishes textbox and autocompletebox properly", function() {
      var promptPanel = jasmine.createSpyObj('promptPanel', ['generateWidgetGUID', 'getParameterName']);

      var param = new Parameter(),
          type = "textbox";
      param.type = type;
      param.list = false;
      var args = {
        param: param,
        promptPanel: promptPanel
      };
      var panel = WidgetBuilder.build(args, type);
      expect(panel.type).toEqual("TextInputComponent");

      args.param.list = true;
      panel = WidgetBuilder.build(args, type);
      expect(panel.type).toEqual("StaticAutocompleteBoxComponent");

      args.param.type = "";
      args.param.list = false;
      type = "";
      panel = WidgetBuilder.build(args, type);
      expect(panel.type).toEqual("TextInputComponent");
    });

  });

});
