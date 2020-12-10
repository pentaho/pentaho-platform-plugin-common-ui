/*!
 * Copyright 2010 - 2020 Hitachi Vantara.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
