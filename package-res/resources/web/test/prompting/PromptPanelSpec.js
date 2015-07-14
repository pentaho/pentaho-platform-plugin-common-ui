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

define([ 'dojo/number', 'dojo/i18n', 'common-ui/prompting/PromptPanel',
  'common-ui/prompting/parameters/ParameterDefinition', 'common-ui/prompting/parameters/ParameterGroup',
  'common-ui/prompting/parameters/Parameter', 'common-ui/prompting/parameters/ParameterValue' ], function(DojoNumber,
  i18n, PromptPanel, ParameterDefinition, ParameterGroup, Parameter, ParameterValue) {

  describe("PromptPanel", function() {

    var testId = "test_id";
    describe("constructor", function() {
      it("should not create prompt panel without destination id", function() {
        var fn = function() {
          new PromptPanel();
        };
        expect(fn).toThrow('destinationId is required');
      });

      it("should not create prompt panel without paramDefn", function() {
        var fn = function() {
          new PromptPanel(testId);
        };
        expect(fn).toThrow('paramDefn is required');
      });

      it("should create prompt panel", function() {
        var paramDefn = jasmine.createSpyObj("paramDefn", [ "allowAutoSubmit" ]);
        paramDefn.allowAutoSubmit.and.returnValue(true);
        var panel = new PromptPanel(testId, paramDefn);
        expect(panel.destinationId).toBe(testId);
        expect(panel.paramDefn).toBe(paramDefn);
        expect(panel.autoSubmit).toBeTruthy();
        expect(panel.guid).toBeDefined();
        expect(panel.dashboard).toBeDefined();
        expect(panel.promptGUIDHelper).toBeDefined();
        expect(panel.parametersChanged).toBeFalsy();
      });
    });

    describe("functions", function() {
      var panel;
      var paramDefn;
      var dashboardSpy;
      beforeEach(function() {
        paramDefn = jasmine.createSpyObj("paramDefn", [ "allowAutoSubmit" ]);
        paramDefn.allowAutoSubmit.and.returnValue(true);
        dashboardSpy = jasmine.createSpyObj("dashboardSpy", [ "setParameter", "getParameterValue" ]);
        panel = new PromptPanel(testId, paramDefn);
        panel.dashboard = dashboardSpy;
      });

      it("getAutoSubmitSetting", function() {
        var autoSubmit = panel.getAutoSubmitSetting();
        expect(panel.autoSubmit).toBeTruthy();
      });

      describe("getString", function() {
        var defaultStr = "default";
        var key = "key";
        it("should return default string", function() {
          var str = panel.getString(key, defaultStr);
          expect(str).toBe(defaultStr);
        });

        it("should return key string", function() {
          var str = panel.getString(key);
          expect(str).toBe("!" + key + "!");
        });
      });

      it("getParameterName", function() {
        var parameter = {
          name : "test_name"
        };
        var name = panel.getParameterName(parameter);
        expect(name).toBe(panel.guid + parameter.name);
      });

      describe("getParameterValues", function() {
        var testVal = 100;
        var paramDefn;
        beforeEach(function() {
          var stringParam = new Parameter();
          stringParam.multiSelect = false;
          stringParam.type = "java.lang.String";
          stringParam.name = "string_test_param";

          var numberParam = new Parameter();
          numberParam.multiSelect = true;
          numberParam.type = "java.lang.Number";
          numberParam.name = "number_test_param";

          paramDefn = new ParameterDefinition();
          var group = new ParameterGroup();
          group.name = "test_group";
          group.label = "test_group_label";
          paramDefn.parameterGroups.push(group);
          group.parameters.push(stringParam);
          group.parameters.push(numberParam);

          spyOn(panel, "getParameterName");
          spyOn(DojoNumber, "parse").and.callFake(function(val) {
            return parseInt(val) + 10;
          });
          panel.paramDefn = paramDefn;
        });

        it("should return empty object for empty value", function() {
          spyOn(panel, "getParameterValue").and.returnValue("");
          var params = panel.getParameterValues();
          expect(params).toEqual({});
          expect(panel.getParameterName).toHaveBeenCalled();
          expect(panel.getParameterValue).toHaveBeenCalled();
          expect(DojoNumber.parse).not.toHaveBeenCalled();
        });

        it("should return empty object for undefined value", function() {
          spyOn(panel, "getParameterValue");
          var params = panel.getParameterValues();
          expect(params).toEqual({});
          expect(panel.getParameterName).toHaveBeenCalled();
          expect(panel.getParameterValue).toHaveBeenCalled();
          expect(DojoNumber.parse).not.toHaveBeenCalled();
        });

        it("should return params", function() {
          spyOn(panel, "getParameterValue").and.returnValue(testVal);
          var params = panel.getParameterValues();
          expect(params).toEqual({
            string_test_param : testVal,
            number_test_param : testVal + 10
          });
          expect(panel.getParameterName).toHaveBeenCalled();
          expect(panel.getParameterValue).toHaveBeenCalled();
          expect(DojoNumber.parse).not.toHaveBeenCalledWith(testVal, {
            locale : 'en'
          });
          expect(DojoNumber.parse).toHaveBeenCalledWith([ testVal ], {
            locale : 'en'
          });
        });

        it("should return params with origin values if throw expection", function() {
          spyOn(panel, "getParameterValue").and.returnValue(testVal);
          DojoNumber.parse.and.callFake(function() {
            throw "Test expection";
          });
          var params = panel.getParameterValues();
          expect(params).toEqual({
            string_test_param : testVal,
            number_test_param : [ testVal ]
          });
          expect(panel.getParameterName).toHaveBeenCalled();
          expect(panel.getParameterValue).toHaveBeenCalled();
          expect(DojoNumber.parse).not.toHaveBeenCalledWith(testVal, {
            locale : 'en'
          });
          expect(DojoNumber.parse).toHaveBeenCalledWith([ testVal ], {
            locale : 'en'
          });
        });

        it("should return params with localization", function() {
          var testArr = [ 10, 20, 30 ];
          var localization = jasmine.createSpy("localization");
          localization.decimal = 20;
          spyOn(panel, "getParameterValue").and.returnValue(testArr);
          spyOn(i18n, "getLocalization").and.callFake(function(arg1, arg2, locale) {
            return locale ? localization : null;
          });
          var params = panel.getParameterValues();
          expect(params).toEqual({
            string_test_param : testArr,
            number_test_param : testArr
          });
          expect(panel.getParameterName).toHaveBeenCalled();
          expect(panel.getParameterValue).toHaveBeenCalled();
          expect(DojoNumber.parse).toHaveBeenCalledWith(testArr, {
            locale : 'en'
          });
        });

        it("should return params with default localization", function() {
          var testArr = [ 10, 20, 30, 50 ];
          var localization = jasmine.createSpy("localization");
          localization.decimal = 20;
          var defaultLocalization = jasmine.createSpy("defaultLocalization");
          defaultLocalization.decimal = 35;
          defaultLocalization.group = "|";
          spyOn(panel, "getParameterValue").and.returnValue(testArr);
          spyOn(i18n, "getLocalization").and.callFake(function(arg1, arg2, locale) {
            return locale ? localization : defaultLocalization;
          });
          spyOn(DojoNumber, "format").and.callFake(function(val) {
            return "|" + val + "|";
          });

          var params = panel.getParameterValues();
          expect(params).toEqual({
            string_test_param : testArr,
            number_test_param : "20"
          });
          expect(panel.getParameterName).toHaveBeenCalled();
          expect(panel.getParameterValue).toHaveBeenCalled();
          expect(DojoNumber.parse).toHaveBeenCalledWith(testArr, {
            locale : 'en'
          });
        });
      });

      it("createDataTransportFormatter", function() {
        expect(panel.createDataTransportFormatter()).not.toBeDefined();
      });

      it("createFormatter", function() {
        expect(panel.createFormatter()).not.toBeDefined();
      });

      it("generateWidgetGUID", function() {
        var widgetGuid = panel.generateWidgetGUID();
        expect(widgetGuid).toBeDefined();
        expect(widgetGuid).toContain(panel.guid + "-");
      });

      describe("_initializeParameterValue", function() {
        var testValue = 100;
        var param;
        beforeEach(function() {
          spyOn(panel, "setParameterValue");
          param = jasmine.createSpyObj("param", [ "getSelectedValuesValue" ]);
        });
        it("should set empty string for empty array values", function() {
          param.getSelectedValuesValue.and.returnValue([]);
          panel._initializeParameterValue(paramDefn, param);
          expect(panel.setParameterValue).toHaveBeenCalledWith(param, "");
        });

        it("should set value from array", function() {
          param.getSelectedValuesValue.and.returnValue([ testValue ]);
          panel._initializeParameterValue(paramDefn, param);
          expect(panel.setParameterValue).toHaveBeenCalledWith(param, testValue);
        });

        it("should set simple value", function() {
          param.getSelectedValuesValue.and.returnValue(testValue);
          panel._initializeParameterValue(paramDefn, param);
          expect(panel.setParameterValue).toHaveBeenCalledWith(param, testValue);
        });
      });

      it("setParameterValue", function() {
        var param = {};
        var name = "param_name";
        var value = 100;
        spyOn(panel, "getParameterName").and.returnValue(name);
        panel.setParameterValue(param, value);
        expect(panel.getParameterName).toHaveBeenCalledWith(param);
        expect(dashboardSpy.setParameter).toHaveBeenCalledWith(name, value);
      });

      describe("getParameterValue", function() {
        var testVal = 100;
        it("should return value by string param", function() {
          var param = "param";
          spyOn(panel, "getParameterName");
          dashboardSpy.getParameterValue.and.returnValue(testVal);
          var value = panel.getParameterValue(param);
          expect(value).toBe(testVal);
          expect(panel.getParameterName).not.toHaveBeenCalled();
          expect(dashboardSpy.getParameterValue).toHaveBeenCalledWith(param);
        });

        it("should return value by param object", function() {
          var paramName = "param";
          var param = {};
          spyOn(panel, "getParameterName").and.returnValue(paramName);
          dashboardSpy.getParameterValue.and.returnValue(testVal);
          var value = panel.getParameterValue(param);
          expect(value).toBe(testVal);
          expect(panel.getParameterName).toHaveBeenCalledWith(param);
          expect(dashboardSpy.getParameterValue).toHaveBeenCalledWith(paramName);
        });
      });

      it("_ready", function() {
        spyOn(panel, "ready");
        panel._ready();
        expect(panel.ready).toHaveBeenCalledWith(panel);
      });

      it("_submit", function() {
        var options = [];
        spyOn(panel, "submit");
        panel._submit(options);
        expect(panel.submit).toHaveBeenCalledWith(panel, options);
      });

      it("_submitStart", function() {
        spyOn(panel, "submitStart");
        panel._submitStart();
        expect(panel.submitStart).toHaveBeenCalledWith(panel);
      });

      it("ready", function() {
        panel.ready();
      });

      it("submit", function() {
        panel.submit();
        expect(panel.forceAutoSubmit).toBeFalsy();
      });

      it("submitStart", function() {
        panel.submitStart();
      });

      it("parameterChanged", function() {
        var param = {};
        var name = "name";
        var value = 100;
        spyOn(panel, "refreshPrompt");
        panel.parameterChanged(param, name, value);
        expect(panel.parametersChanged).toBeTruthy();
        expect(panel.refreshPrompt).toHaveBeenCalled();
      });

      it("getParameterDefinition", function() {
        var promptPanel = {};
        var fn = jasmine.createSpyObj("callbackObj", [ "test" ]);
        panel.getParameterDefinition(promptPanel, fn.test);
        expect(fn.test).toHaveBeenCalled();
      });

      describe("refreshPrompt", function() {
        beforeEach(function() {
          spyOn(window, "alert");
          spyOn(panel, "getParameterDefinition");
        });

        it("should refresh", function() {
          panel.refreshPrompt();
          expect(panel.getParameterDefinition).toHaveBeenCalled();
          expect(window.alert).not.toHaveBeenCalled();
        });

        it("should show alert msg", function() {
          panel.getParameterDefinition.and.callFake(function() {
            throw "Test error";
          });
          panel.refreshPrompt();
          expect(panel.getParameterDefinition).toHaveBeenCalled();
          expect(window.alert).toHaveBeenCalledWith('Exception caught attempting to execute refreshCallback');
        });
      });

      describe("refresh", function() {
        beforeEach(function() {
          spyOn(panel, "init");
          spyOn(panel, "removeDashboardComponents");
          spyOn(window, "setTimeout");
        });

        it("should not refresh if exists waitingForInit parameter", function() {
          var dash = jasmine.createSpy("dashSpy");
          dash.waitingForInit = [ 1, 2 ];
          panel.dashboard = dash;

          panel.refresh();
          expect(window.setTimeout).toHaveBeenCalled();
          expect(panel.init).not.toHaveBeenCalled();
          expect(panel.removeDashboardComponents).not.toHaveBeenCalled();
        });

        it("should not refresh without paramDefn parameter", function() {
          panel.refresh();
          expect(window.setTimeout).not.toHaveBeenCalled();
          expect(panel.init).not.toHaveBeenCalled();
          expect(panel.removeDashboardComponents).not.toHaveBeenCalled();
        });

        it("should init also without components", function() {
          var noAutoAutoSubmit = true;
          var paramDefn = jasmine.createSpy("paramDefnSpy");
          panel.refresh(paramDefn, noAutoAutoSubmit);
          expect(panel.paramDefn).toBe(paramDefn);
          expect(window.setTimeout).not.toHaveBeenCalled();
          expect(panel.init).toHaveBeenCalledWith(noAutoAutoSubmit);
          expect(panel.removeDashboardComponents).not.toHaveBeenCalled();
        });

        it("should init also with components", function() {
          var paramDefn = jasmine.createSpyObj("paramDefnSpy", [ "showParameterUI" ]);
          var comp = jasmine.createSpy("compSpy");
          var components = [ comp ];
          panel.components = components;
          panel.refresh(paramDefn);
          expect(panel.paramDefn).toBe(paramDefn);
          expect(window.setTimeout).not.toHaveBeenCalled();
          expect(panel.init).toHaveBeenCalledWith(undefined);
          expect(panel.removeDashboardComponents).toHaveBeenCalled();
          expect(panel._focusedParam).not.toBeDefined();
        });

        it("should init also with components and find focused param", function() {
          var paramDefn = jasmine.createSpyObj("paramDefnSpy", [ "showParameterUI" ]);
          var comp = jasmine.createSpyObj("compSpy", [ "placeholder", "topValue" ]);
          comp.topValue.and.returnValue(100);
          comp.param = {
            name : "test_param_name"
          };
          comp.promptType = "prompt";
          comp.type = "SelectMultiComponent";
          spyOn(window, "$").and.returnValue([ {} ]);
          var components = [ comp ];
          panel.components = components;
          panel.refresh(paramDefn);
          expect(panel.paramDefn).toBe(paramDefn);
          expect(window.setTimeout).not.toHaveBeenCalled();
          expect(panel.init).toHaveBeenCalledWith(undefined);
          expect(panel.removeDashboardComponents).toHaveBeenCalled();
          expect(panel._focusedParam).toBe(comp.param.name);
          expect(comp.placeholder).toHaveBeenCalled();
          expect(window.$).toHaveBeenCalled();
        });

        it("should init also with components for ScrollingPromptPanelLayoutComponent", function() {
          var paramDefn = jasmine.createSpyObj("paramDefnSpy", [ "showParameterUI" ]);
          var comp = jasmine.createSpyObj("compSpy", [ "placeholder", "topValue" ]);
          comp.placeholder.and.returnValue({
            children : function() {
              return {
                scrollTop : function() {
                  return 100;
                }
              };
            }
          });
          comp.type = "ScrollingPromptPanelLayoutComponent";
          spyOn(window, "$");
          var components = [ comp ];
          panel.components = components;
          panel.refresh(paramDefn);
          expect(panel.paramDefn).toBe(paramDefn);
          expect(window.setTimeout).not.toHaveBeenCalled();
          expect(panel.init).toHaveBeenCalledWith(undefined);
          expect(panel.removeDashboardComponents).toHaveBeenCalled();
          expect(panel._focusedParam).not.toBeDefined();
          expect(comp.placeholder).toHaveBeenCalled();
          expect(window.$).not.toHaveBeenCalled();
        });
      });

      describe("init", function() {
        var dash;
        var paramDefn;
        beforeEach(function() {
          paramDefn = jasmine.createSpyObj("paramDefn", [ "mapParameters", "showParameterUI" ]);
          dash = jasmine.createSpyObj("dashSpy", [ "addComponents", "init" ]);
          spyOn(panel, "_initializeParameterValue");
          spyOn(panel, "submit");
          panel.paramDefn = paramDefn;
          panel.dashboard = dash;
        });

        it("should not init dashboard without showing panel and without submitting", function() {
          panel.init(true);
          expect(panel.components).not.toBeDefined();
          expect(paramDefn.showParameterUI).toHaveBeenCalled();
          expect(paramDefn.mapParameters).toHaveBeenCalled();
          expect(dash.addComponents).not.toHaveBeenCalled();
          expect(dash.init).not.toHaveBeenCalled();
          expect(panel._initializeParameterValue).not.toHaveBeenCalled();
          expect(panel.submit).not.toHaveBeenCalled();
        });

        it("should not init dashboard without showing panel and with submitting", function() {
          panel.init();
          expect(panel.components).not.toBeDefined();
          expect(paramDefn.showParameterUI).toHaveBeenCalled();
          expect(paramDefn.mapParameters).toHaveBeenCalled();
          expect(dash.addComponents).not.toHaveBeenCalled();
          expect(dash.init).not.toHaveBeenCalled();
          expect(panel._initializeParameterValue).not.toHaveBeenCalled();
          expect(panel.submit).toHaveBeenCalledWith(panel, {
            isInit : true
          });
        });

        it("should init dashboard", function() {
          paramDefn.showParameterUI.and.returnValue(true);
          panel._multiListBoxTopValuesByParam = {};
          panel._focusedParam = "test";
          spyOn(panel, "buildPanelComponents");

          panel.init(true);
          expect(panel._multiListBoxTopValuesByParam).not.toBeDefined();
          expect(panel._focusedParam).not.toBeDefined();
          expect(panel.components.length > 0).toBeTruthy();
          expect(paramDefn.showParameterUI).toHaveBeenCalled();
          expect(paramDefn.mapParameters).not.toHaveBeenCalled();
          expect(dash.addComponents).toHaveBeenCalled();
          expect(dash.init).toHaveBeenCalled();
          expect(panel._initializeParameterValue).not.toHaveBeenCalled();
          expect(panel.submit).toHaveBeenCalledWith(panel, {
            isInit : true
          });
        });
      });

      it("hide", function() {
        var spyElem = jasmine.createSpyObj("spyElem", [ "css" ]);
        spyOn(window, "$").and.returnValue(spyElem);
        panel.hide();
        expect(window.$).toHaveBeenCalledWith("#" + panel.destinationId);
        expect(spyElem.css).toHaveBeenCalledWith('display', 'none');
      });

      describe("_buildPanelForParameter", function() {
        var paramDefn;
        beforeEach(function() {
          paramDefn = jasmine.createSpy("paramDefn");
          paramDefn.errors = {};
          spyOn(panel, "_initializeParameterValue");
          panel.paramDefn = paramDefn;
        });

        it("should not create panel widget", function() {
          var param = {};
          param.name = "test_name";
          param.attributes = {};
          param.values = [];
          param.strict = true;
          var paramPanel = panel._buildPanelForParameter(param);
          expect(paramPanel).not.toBeDefined();
          expect(panel._initializeParameterValue).toHaveBeenCalledWith(panel.paramDefn, param);
        });

        it("should create panel widget", function() {
          var param = {};
          param.values = [ "val1", "val2" ];
          param.name = "test_name";
          param.attributes = {
            label : "test label"
          };
          panel.paramDefn.errors[param.name] = [ "Error 1" ];
          var paramPanel = panel._buildPanelForParameter(param);
          expect(paramPanel).toBeDefined();
          expect(panel._initializeParameterValue).toHaveBeenCalledWith(panel.paramDefn, param);
          expect(paramPanel.cssClass).toBe(' error');
          expect(paramPanel.components.length).toBe(3);
          expect(paramPanel.components[0].type).toBe("TextComponent");
          expect(paramPanel.components[1].type).toBe("StaticAutocompleteBoxComponent");
          expect(paramPanel.components[2].type).toBe("TextComponent");
          expect(paramPanel.components[0].promptType).toBe("label");
          expect(paramPanel.components[1].promptType).toBe("prompt");
          expect(paramPanel.components[2].promptType).toBe("label");
        });
      });

      it("createWidgetForSubmitComponent", function() {
        var widget = panel.createWidgetForSubmitComponent();
        expect(widget).toBeDefined();
        expect(widget.type).toBe("SubmitPromptComponent");
        expect(widget.promptType).toBe("submit");
      });

      describe("buildPanelComponents", function() {
        it("should return empty array for empty groups", function() {
          var paramDefn = {
            parameterGroups : []
          };
          panel.paramDefn = paramDefn;
          var components = panel.buildPanelComponents();
          expect(components.length).toBe(0);
        });

        it("should return empty array for empty parameters", function() {
          var group = {
            parameters : []
          };
          var paramDefn = {
            parameterGroups : [ group ]
          };
          panel.paramDefn = paramDefn;
          var components = panel.buildPanelComponents();
          expect(components.length).toBe(0);
        });

        it("should return generated components", function() {
          var compSpy = jasmine.createSpy("compSpy");
          spyOn(panel, "_buildPanelForParameter").and.returnValue(compSpy);
          var hiddenParam = {
            name : "hidden_param",
            attributes : {
              hidden : 'true'
            }
          };
          var visibleParam = {
            name : "param_0",
            attributes : {
              hidden : 'false'
            }
          };
          var group = {
            parameters : [ hiddenParam, visibleParam ]
          };
          var paramDefn = {
            parameterGroups : [ group ]
          };
          panel.paramDefn = paramDefn;
          var components = panel.buildPanelComponents();
          expect(panel._buildPanelForParameter).toHaveBeenCalledWith(visibleParam);
          expect(components.length).toBe(2);
          expect(components[0].type).toEqual("VerticalTableBasedPromptLayoutComponent");
          expect(components[1].type).toEqual("FlowPromptLayoutComponent");
        });
      });

      describe("removeDashboardComponents", function() {
        var dash;
        var comp;
        beforeEach(function() {
          var listener = {
            name : "test_name"
          };
          comp = jasmine.createSpyObj("compSpy", [ "clear" ]);
          comp.name = "0";
          comp.parameter = listener;
          var components = [ comp ];
          dash = jasmine.createSpyObj("dashboard", [ "removeComponent" ]);
          dash.removeComponent.and.callFake(function(name) {
            return components[parseInt(name)];
          });
          var paramComp = jasmine.createSpyObj("compSpy", [ "clear" ]);
          paramComp.listeners = [ listener ];
          dash.components = [ paramComp ];
          panel.dashboard = dash;
        });

        it("should remove components without postpone clear", function() {
          panel.removeDashboardComponents([ comp ]);
          expect(dash.removeComponent).toHaveBeenCalledWith(comp.name);
          expect(comp.clear).toHaveBeenCalled();
          expect(panel.dashboard.components[0].listeners.length).toBe(0);
        });

        it("should remove components with postpone clear", function() {
          panel.removeDashboardComponents([ comp ], true);
          expect(dash.removeComponent).toHaveBeenCalledWith(comp.name);
          expect(comp.clear).not.toHaveBeenCalled();
          expect(panel.dashboard.components[0].listeners.length).toBe(0);
        });
      });
    });
  });
});