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
        dashboardSpy = jasmine.createSpyObj("dashboardSpy", [ "setParameter", "getParameterValue", "getComponentByName", "addComponent", "updateComponent" ]);
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
        spyOn(panel, "_setTimeoutRefreshPrompt");

        var parameterChangedSpy = jasmine.createSpy("ParameterChangedSpy");
        panel.onParameterChanged = parameterChangedSpy;

        panel.parameterChanged(param, name, value);
        expect(panel.parametersChanged).toBeTruthy();
        expect(panel._setTimeoutRefreshPrompt).toHaveBeenCalled();
        expect(panel.onParameterChanged).toHaveBeenCalledWith(name, value);
      });

      describe("parameterChanged", function() {
        var param;
        var name;
        beforeEach(function() {
          param = {};
          name = "name";
          spyOn(panel, "_setTimeoutRefreshPrompt");
        });

        describe("for single components (Text Area, Text Box, etc.)", function() {
          beforeEach(function() {
            param.list = false; // means that it is single component
          });

          var assertForSingleComponents = function() {
            expect(panel.nullValueParams).toBeUndefined();
            expect(panel.parametersChanged).toBeTruthy();
            expect(panel._setTimeoutRefreshPrompt).toHaveBeenCalled();
          };

          it("should not fill nullValueParams with undefined value", function() {
            panel.parameterChanged(param, name);
            assertForSingleComponents();
          });

          it("should not fill nullValueParams with null value", function() {
            var value = null;
            panel.parameterChanged(param, name, value);
            assertForSingleComponents();
          });

          it("should not fill nullValueParams with \"null\" value", function() {
            var value = "null";
            panel.parameterChanged(param, name, value);
            assertForSingleComponents();
          });

          it("should not fill nullValueParams with \"\" value", function() {
            var value = "";
            panel.parameterChanged(param, name, value);
            assertForSingleComponents();
          });

          it("should not fill nullValueParams with not empty value", function() {
            var value = "value";
            panel.parameterChanged(param, name, value);
            assertForSingleComponents();
          });
        });

        describe("for multi components (Multi Selection Button, Drop Down, etc.)", function() {
          beforeEach(function() {
            param.list = true; // means that it is multi component
          });

          var assertForMultiComponents = function() {
            expect(panel.nullValueParams).toBeDefined();
            expect(panel.nullValueParams.length).toBe(1);
            expect(panel.nullValueParams[0]).toBe(param);
            expect(panel.parametersChanged).toBeTruthy();
            expect(panel._setTimeoutRefreshPrompt).toHaveBeenCalled();
          };

          it("should fill nullValueParams with undefined value", function() {
            panel.parameterChanged(param, name);
            assertForMultiComponents();
          });

          it("should fill nullValueParams with null value", function() {
            var value = null;
            panel.parameterChanged(param, name, value);
            assertForMultiComponents();
          });

          it("should fill nullValueParams with \"null\" value", function() {
            var value = "null";
            panel.parameterChanged(param, name, value);
            assertForMultiComponents();
          });

          it("should fill nullValueParams with \"\" value", function() {
            var value = "";
            panel.parameterChanged(param, name, value);
            assertForMultiComponents();
          });

          it("should not fill nullValueParams with not empty value", function() {
            var value = "value";
            panel.parameterChanged(param, name, value);
            expect(panel.nullValueParams).toBeUndefined();
            expect(panel.parametersChanged).toBeTruthy();
            expect(panel._setTimeoutRefreshPrompt).toHaveBeenCalled();
          });
        });
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
          spyOn(panel.paramDiffer, "diff");
          spyOn(panel, "update");
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
          expect(panel._focusedParam).not.toBeDefined();
        });

        it("should init also with components and find focused param", function() {
          var paramDefn = jasmine.createSpyObj("paramDefnSpy", [ "showParameterUI", "allowAutoSubmit", "getParameter" ]);
          var param = {
            name : "test_param_name"
          };
          paramDefn.getParameter.and.returnValue(param);
          var comp = jasmine.createSpyObj("compSpy", [ "placeholder", "topValue" ]);
          comp.topValue.and.returnValue(100);
          comp.param = param;
          comp.promptType = "prompt";
          comp.type = "SelectMultiComponent";
          spyOn(window, "$").and.returnValue([ {} ]);
          var components = [ comp ];
          panel.dashboard.components = components;
          panel.refresh(paramDefn);
          expect(panel.paramDefn).toBe(paramDefn);
          expect(window.setTimeout).not.toHaveBeenCalled();
          expect(paramDefn.getParameter).toHaveBeenCalled();
          expect(panel._focusedParam).toBe(param.name);
          expect(panel._multiListBoxTopValuesByParam).toBeDefined();
        });

        it("should init also with components for ScrollingPromptPanelLayoutComponent", function() {
          var paramDefn = jasmine.createSpyObj("paramDefnSpy", [ "showParameterUI" ]);
          var comp = jasmine.createSpyObj("compSpy", [ "placeholder", "topValue" ]);
          comp.name = "compTestName";
          comp.placeholder.and.returnValue();
          comp.placeholder.and.returnValue({
            children : function() {
              return {
                scrollTop : function() {
                  return 100;
                },
                children : comp.placeholder
              };
            },
            scrollLeft : function() {
              return 50;
            }
          });
          comp.type = "ScrollingPromptPanelLayoutComponent";
          spyOn(window, "$");
          var components = [ comp ];
          panel.dashboard.components = components;
          panel.refresh(paramDefn);
          expect(panel.paramDefn).toBe(paramDefn);
          expect(window.setTimeout).not.toHaveBeenCalled();
          expect(panel._focusedParam).not.toBeDefined();
          expect(window.$).not.toHaveBeenCalled();
          expect(panel._multiListBoxTopValuesByParam).toEqual({
            "_compTestName" : {
              "scrollTopValue" : 100,
              "scrollLeftValue" : 50
            }
          });
        });
      });

      describe("init", function() {
        var dash;
        var paramDefn;
        var childElem;
        beforeEach(function() {
          paramDefn = jasmine.createSpyObj("paramDefn", [ "mapParameters", "showParameterUI" ]);
          paramDefn.showParameterUI.and.returnValue(false);
          dash = jasmine.createSpyObj("dashSpy", [ "addComponents", "init", "getComponentByName", "updateComponent", "postInit" ]);
          var submitComponent = {
            promptType : "submit",
            name : "submitCompName"
          };
          var promptComponent = {
            promptType : "prompt",
            param : {
              name : "test"
            },
            type : "SelectMultiComponent",
            name : "promptCompName"
          };
          var scrollComponent = {
            type : "ScrollingPromptPanelLayoutComponent",
            name : "testName"
          };
          var prompt = {
            components : [ submitComponent, promptComponent, scrollComponent ]
          }
          dash.getComponentByName.and.returnValue(prompt);
          spyOn(panel, "_initializeParameterValue");
          spyOn(panel, "submit");
          panel.paramDefn = paramDefn;
          panel.dashboard = dash;
          spyOn(panel, "buildPanelComponents");
          spyOn(panel, "update");
          panel._multiListBoxTopValuesByParam = {
            "_test" : 100,
            "_testName" : {
              scrollTopValue : 100,
              scrollLeftValue : 50
            }
          };
          panel._focusedParam = promptComponent.param.name;
          spyOn(window, "setTimeout");
        });

        it("should not init dashboard without showing panel and without submitting", function() {
          var beforeRenderSpy = jasmine.createSpy("BeforeRenderSpy");
          var afterRenderSpy = jasmine.createSpy("BeforeRenderSpy");
          panel.onBeforeRender = beforeRenderSpy;
          panel.onAfterRender = afterRenderSpy;
          panel.init(true);

          expect(panel.update).not.toHaveBeenCalled();
          expect(paramDefn.showParameterUI).toHaveBeenCalled();
          expect(paramDefn.mapParameters).toHaveBeenCalled();
          expect(dash.addComponents).not.toHaveBeenCalled();
          expect(dash.init).not.toHaveBeenCalled();
          expect(panel._initializeParameterValue).not.toHaveBeenCalled();
          expect(panel.submit).not.toHaveBeenCalled();
          expect(panel.onAfterRender).toHaveBeenCalled();
          expect(panel.onBeforeRender).toHaveBeenCalled();
        });

        it("should not init dashboard without showing panel and with submitting", function() {
          panel.init();
          expect(panel.update).not.toHaveBeenCalled();
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

          panel.init(true);
          expect(panel.update).not.toHaveBeenCalled();
          expect(panel._multiListBoxTopValuesByParam).not.toBeDefined();
          expect(panel._focusedParam).not.toBeDefined();
          expect(paramDefn.showParameterUI).toHaveBeenCalled();
          expect(paramDefn.mapParameters).not.toHaveBeenCalled();
          expect(dash.addComponents).toHaveBeenCalled();
          expect(dash.init).toHaveBeenCalled();
          expect(panel._initializeParameterValue).not.toHaveBeenCalled();
          expect(panel.submit).toHaveBeenCalledWith(panel, {
            isInit : true
          });
          expect(panel.dashboard.updateComponent).not.toHaveBeenCalled();
        });

        it("should update components by diff", function() {
          paramDefn.showParameterUI.and.returnValue(true);
          panel.diff = jasmine.createSpy("diff");
          panel.isRefresh = true;

          panel.init(true);
          expect(panel.update).toHaveBeenCalled();
          expect(panel._multiListBoxTopValuesByParam).not.toBeDefined();
          expect(panel._focusedParam).not.toBeDefined();
          expect(paramDefn.showParameterUI).not.toHaveBeenCalled();
          expect(paramDefn.mapParameters).not.toHaveBeenCalled();
          expect(dash.addComponents).not.toHaveBeenCalled();
          expect(dash.init).not.toHaveBeenCalled();
          expect(panel._initializeParameterValue).not.toHaveBeenCalled();
          expect(panel.submit).not.toHaveBeenCalled();
          expect(panel.isRefresh).toBeNull();
          expect(panel.dashboard.updateComponent).not.toHaveBeenCalled();
          expect(window.setTimeout).toHaveBeenCalled();
        });

        it("should update components if isForceRefresh dy diff", function() {
          paramDefn.showParameterUI.and.returnValue(true);
          panel.diff = jasmine.createSpy("diff");
          panel.isRefresh = true;
          panel.isForceRefresh = true;

          panel.init(true);
          expect(panel.update).toHaveBeenCalled();
          expect(panel._multiListBoxTopValuesByParam).not.toBeDefined();
          expect(panel._focusedParam).not.toBeDefined();
          expect(paramDefn.showParameterUI).not.toHaveBeenCalled();
          expect(paramDefn.mapParameters).not.toHaveBeenCalled();
          expect(dash.addComponents).not.toHaveBeenCalled();
          expect(dash.init).not.toHaveBeenCalled();
          expect(panel._initializeParameterValue).not.toHaveBeenCalled();
          expect(panel.submit).not.toHaveBeenCalled();
          expect(panel.isRefresh).toBeNull();
          expect(panel.isForceRefresh).not.toBeDefined();
          expect(window.setTimeout).toHaveBeenCalled();
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
          spyOn(panel.widgetBuilder.mapping['default'], '_createFormatter').and.returnValue(null);
          spyOn(panel.widgetBuilder.mapping['default'], '_createDataTransportFormatter').and.returnValue(null);
          var paramPanel = panel._buildPanelForParameter(param);
          expect(paramPanel).toBeDefined();
          expect(panel._initializeParameterValue).toHaveBeenCalledWith(panel.paramDefn, param);
          expect(paramPanel.cssClass).toBe(' error');
          expect(paramPanel.components.length).toBe(3);
          expect(paramPanel.components[0].type).toBe("TextComponent");
          expect(paramPanel.components[1].type).toBe("TextComponent");
          expect(paramPanel.components[2].type).toBe("TextInputComponent");
          expect(paramPanel.components[0].promptType).toBe("label");
          expect(paramPanel.components[1].promptType).toBe("label");
          expect(paramPanel.components[2].promptType).toBe("prompt");
        });
      });

      it("createWidgetForSubmitComponent", function() {
        var widget = panel.createWidgetForSubmitComponent();
        expect(widget).toBeDefined();
        expect(widget.type).toBe("SubmitPromptComponent");
        expect(widget.promptType).toBe("submit");
      });

      describe("buildPanelComponents", function() {
        beforeEach(function() {
          spyOn(panel, "_initializeParameterValue");
        });

        it("should return empty array for empty groups", function() {
          var paramDefn = {
            parameterGroups : []
          };
          panel.paramDefn = paramDefn;
          var components = panel.buildPanelComponents();
          expect(components.length).toBe(0);
          expect(panel._initializeParameterValue).not.toHaveBeenCalled();
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
          expect(panel._initializeParameterValue).not.toHaveBeenCalled();
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
          expect(panel._initializeParameterValue).toHaveBeenCalledWith(panel.paramDefn, hiddenParam);
          expect(panel._initializeParameterValue).not.toHaveBeenCalledWith(panel.paramDefn, visibleParam);
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

      describe("update", function() {
        var diffSpy;
        beforeEach(function() {
          diffSpy = jasmine.createSpy("diffSpy");
          diffSpy.toRemove = {};
          diffSpy.toAdd = {};
          diffSpy.toChangeData = {};
        });

        it("should not call every update call", function() {
          spyOn(panel, "_removeComponentsByDiff");
          spyOn(panel, "_addComponentsByDiff");
          spyOn(panel, "_changeComponentsByDiff");

          panel.update(diffSpy);

          expect(panel._removeComponentsByDiff).not.toHaveBeenCalledWith(diffSpy.toRemove);
          expect(panel._addComponentsByDiff).not.toHaveBeenCalledWith(diffSpy.toAdd);
          expect(panel._changeComponentsByDiff).not.toHaveBeenCalledWith(diffSpy.toChangeData);
        });

        it("should call every update call", function() {
          spyOn(panel, "_removeComponentsByDiff");
          spyOn(panel, "_addComponentsByDiff");
          spyOn(panel, "_changeComponentsByDiff");

          diffSpy.toRemove.test = {};
          diffSpy.toAdd.test = {};
          diffSpy.toChangeData.test = {};

          panel.update(diffSpy);

          expect(panel._removeComponentsByDiff).toHaveBeenCalledWith(diffSpy.toRemove);
          expect(panel._addComponentsByDiff).toHaveBeenCalledWith(diffSpy.toAdd);
          expect(panel._changeComponentsByDiff).toHaveBeenCalledWith(diffSpy.toChangeData);
        });

        describe("Add/Remove/Change by diff", function() {
          var componentSpy, paramSpy, groupPanelSpy, promptPanelSpy, submitComponentSpy;
          var paramName = "testParamName";
          var groupParamName = "testGroupName";
          var guid = "guid";

          beforeEach(function() {
            paramSpy = jasmine.createSpyObj("paramSpy", ["getSelectedValuesValue"]);

            componentSpy = jasmine.createSpyObj("componentSpy", [ "clear", "removeErrorClass" ]);
            componentSpy.parameter = paramName;
            componentSpy.type = "TestPanel";

            panel.dashboard.components = [componentSpy];
            panel.guid = guid;

            groupPanelSpy = jasmine.createSpyObj("groupPanelSpy", [ "clear" ]);
            groupPanelSpy.components = [componentSpy];
            spyOn(groupPanelSpy.components, "indexOf").and.callThrough();
            spyOn(groupPanelSpy.components, "splice").and.callThrough();

            promptPanelSpy = jasmine.createSpyObj("promptPanelSpy", [ "clear" ]);
            promptPanelSpy.components = [];

            spyOn(panel, "getParameterName").and.returnValue(paramName);
            panel.dashboard.getComponentByName.and.callFake(function(name) {
              if (name == groupParamName) {
                return groupPanelSpy;
              } else if (name == "prompt" + guid) {
                return promptPanelSpy;
              }
            });

            submitComponentSpy = jasmine.createSpyObj("submitComponentSpy", [ "clear" ]);
            submitComponentSpy.promptType = "submit";
            submitComponentSpy.type = "FlowPromptLayoutComponent";
          });

          describe("_removeComponentsByDiff", function() {
            it ("should successfully remove the provided components", function() {
              diffSpy.toRemove[groupParamName] = {
                params : [paramSpy]
              };

              promptPanelSpy.components = [submitComponentSpy];
              spyOn(promptPanelSpy.components, "splice").and.callThrough();

              spyOn(panel, "removeDashboardComponents");

              panel._removeComponentsByDiff(diffSpy.toRemove);

              expect(panel.getParameterName).toHaveBeenCalledWith(paramSpy);
              expect(panel.dashboard.getComponentByName).toHaveBeenCalledWith(groupParamName);
              expect(panel.dashboard.getComponentByName).toHaveBeenCalledWith("prompt"+guid);
              expect(groupPanelSpy.components.indexOf).toHaveBeenCalledWith(componentSpy);
              expect(groupPanelSpy.components.splice).toHaveBeenCalledWith(0, 1);
              expect(promptPanelSpy.components.splice).toHaveBeenCalledWith(0, 1);
              expect(panel.removeDashboardComponents).toHaveBeenCalled();
            });
          });

          describe("_addComponentsByDiff", function() {
            var panelSpy;
            beforeEach(function() {
              diffSpy.toAdd[groupParamName] = {
                params : [paramSpy]
              };

              panelSpy = jasmine.createSpy("panelSpy");
              spyOn(panel, "_buildPanelForParameter").and.returnValue(panelSpy);
            });

            it("should not find a group panel by name and succeed", function() {
              var widgetSpy = jasmine.createSpy("widgetSpy");
              spyOn(panel.widgetBuilder, "build").and.returnValue(widgetSpy);

              promptPanelSpy.components = [submitComponentSpy];

              panel.dashboard.getComponentByName.and.callFake(function(name) {
                if (name == "prompt" + guid) {
                  return promptPanelSpy;
                }
              });

              promptPanelSpy.components = [submitComponentSpy];

              panel._addComponentsByDiff(diffSpy.toAdd);

              expect(panel.dashboard.addComponent).toHaveBeenCalled();
              expect(panel.dashboard.addComponent.calls.count()).toBe(3);
              expect(panel.dashboard.updateComponent).toHaveBeenCalled();
              expect(panel.dashboard.updateComponent.calls.count()).toBe(3);
              expect(panel.dashboard.getComponentByName).toHaveBeenCalledWith(groupParamName);
              expect(panel.dashboard.getComponentByName).toHaveBeenCalledWith("prompt"+guid);
              expect(panel._buildPanelForParameter).toHaveBeenCalledWith(paramSpy);
              expect(panel.widgetBuilder.build).toHaveBeenCalled();
            });

            it("should find a group panel by name and insert the element at index 0 and succeed", function() {
              promptPanelSpy.components = [componentSpy];

              var widgetSpy = jasmine.createSpy("widgetSpy");
              spyOn(panel.widgetBuilder, "build").and.returnValue(widgetSpy);

              panel._addComponentsByDiff(diffSpy.toAdd);

              expect(panel.dashboard.addComponent).toHaveBeenCalled();
              expect(panel.dashboard.addComponent.calls.count()).toBe(3);
              expect(panel.dashboard.updateComponent).toHaveBeenCalled();
              expect(panel.dashboard.updateComponent.calls.count()).toBe(3);
              expect(panel.dashboard.getComponentByName).toHaveBeenCalledWith(groupParamName);
              expect(panel.dashboard.getComponentByName).toHaveBeenCalledWith("prompt"+guid);
              expect(panel._buildPanelForParameter).toHaveBeenCalledWith(paramSpy);
              expect(panel.widgetBuilder.build).toHaveBeenCalled();
              expect(groupPanelSpy.components.indexOf(panelSpy)).toBe(0);
            });

            it("should preserve the index of the component and succeed", function() {
              paramSpy.after = paramName;

              panel._addComponentsByDiff(diffSpy.toAdd);

              expect(panel.dashboard.addComponent).toHaveBeenCalled();
              expect(panel.dashboard.addComponent.calls.count()).toBe(1);
              expect(groupPanelSpy.components.indexOf(panelSpy)).toBe(1);
            });
          });

          describe("_changeComponentsByDiff", function() {
            var originalParam, change, componentSpy,
                guid = "guid", groupName = "test_group",
                changedParam, value1, value2;

            beforeEach(function() {
              // set up some parameter values
              value1 = new ParameterValue();
              value1.value = "jitsu";
              value1.label = "jitsu";
              value1.type = "java.lang.String";

              value2 = new ParameterValue();
              value2.value = "do";
              value2.label = "dō";
              value2.selected = true;
              value2.type = "java.lang.String";

              var paramDefn;
              // create a parameter
              originalParam = new Parameter();
              originalParam.type = "java.lang.String";
              originalParam.list = true;
              originalParam.name = paramName;
              originalParam.multiSelect = true;
              originalParam.values = [ value1, value2 ];

              paramDefn = new ParameterDefinition();
              var group = new ParameterGroup();
              group.name = groupName;
              group.label = "test_group_label";
              paramDefn.parameterGroups.push(group);
              group.parameters.push(originalParam);

              panel.paramDefn = paramDefn;
              change = {};
              change[groupName] = {
                params: [originalParam]
              };

              spyOn(panel, "setParameterValue");
              spyOn(panel.widgetBuilder.mapping['default'], '_createFormatter').and.returnValue(null);
              spyOn(panel.widgetBuilder.mapping['default'], '_createDataTransportFormatter').and.returnValue(null);

              componentSpy = jasmine.createSpyObj("componentSpy", ["getPanel"]);
              componentSpy.parameter = paramName;
              componentSpy.type = "TestComponent";
              componentSpy.name = "testComponent";

              panel.components = [componentSpy];
              panel.dashboard.components = [componentSpy];
              panel.guid = guid;

              panel.dashboard.getComponentByName.and.returnValue(group);
            });

            it("should handle null param", function() {
              panel._changeComponentsByDiff(null);
            });

            it("should set the selected value", function() {

              panel._changeComponentsByDiff(change);

              expect(panel.setParameterValue).toHaveBeenCalled();
              expect(panel.forceSubmit).toBeDefined();
              expect(panel.forceSubmit).toEqual(true);
            });

            it("should not update the components if old value array differs from new one only with default value", function() {

              spyOn(panel, "_initializeParameterValue");
              panel.dashboard.getParameterValue.and.returnValue("do");

              var valuesArrayWithDefaults = [ ["", ""], ["test1", "test1"], ["test2", "test2"] ];
              componentSpy.valuesArray = valuesArrayWithDefaults;

              var valuesArray = [ ["test1", "test1"], ["test2", "test2"] ];
              spyOn(panel.widgetBuilder, "build").and.callFake(function(obj, type) {
                return { "valuesArray": valuesArray };
              });

              changedParam = new Parameter();
              changedParam.type = "java.lang.String";
              changedParam.name = paramName;
              changedParam.values = [ value1, value2 ];
              change = {};
              change[groupName] = {
                params: [changedParam]
              };

              panel._changeComponentsByDiff(change);

              expect(componentSpy.valuesArray).toBe(valuesArrayWithDefaults);
              expect(panel.widgetBuilder.build).toHaveBeenCalled();
              expect(panel._initializeParameterValue).not.toHaveBeenCalled();
              expect(panel.dashboard.updateComponent).not.toHaveBeenCalled();
            });

            it("should compare the data values to determine if a change was made.", function() {

              var submitComponentSpy = jasmine.createSpy("submitComponentSpy");
              submitComponentSpy.promptType = "submit";
              submitComponentSpy.type = "FlowPromptLayoutComponent";

              var panelSpy = jasmine.createSpy("panelSpy");

              var groupPanelSpy = jasmine.createSpy("groupPanelSpy");
              groupPanelSpy.components = [componentSpy];

              panelSpy.components = [submitComponentSpy, groupPanelSpy];
              spyOn(panelSpy.components, "splice").and.callThrough();

              panel.dashboard.getComponentByName.and.callFake(function(name) {
                if (name == groupName) {
                  return groupPanelSpy;
                } else if (name == "prompt" + guid) {
                  return panelSpy;
                }
              });

              changedParam = new Parameter();
              changedParam.type = "java.lang.String";
              changedParam.name = paramName;
              changedParam.values = [ value1, value2 ];
              var valuesArray = [["jitsu", "dō", "-- no selection --"],["jitsu", "do", "_none_"]];
              spyOn(panel.widgetBuilder, "build").and.callFake(function(obj, type) {
                return { "valuesArray": valuesArray };
              });

              change = {};
              change[groupName] = {
                params: [changedParam]
              };

              panel._changeComponentsByDiff(change);

              expect(panel.dashboard.updateComponent).toHaveBeenCalledWith(componentSpy);
              expect(panel.dashboard.getComponentByName).toHaveBeenCalledWith(groupName);
              expect(groupPanelSpy.components[0]).toBe(componentSpy);
              expect(componentSpy.valuesArray).toBe(valuesArray);
              expect(panel.widgetBuilder.build).toHaveBeenCalled();
              expect(panel.forceSubmit).toBe(true);

              spyOn(changedParam, "getSelectedValuesValue").and.callFake(function(){
                return ["a"];
              });
              panel.dashboard.getParameterValue.and.returnValue("a");
              panel.dashboard.updateComponent.calls.reset();
              panel._changeComponentsByDiff(change);
              expect(panel.dashboard.updateComponent).not.toHaveBeenCalled();

              changedParam.forceUpdate = true;
              panel._changeComponentsByDiff(change);
              expect(panel.dashboard.updateComponent).toHaveBeenCalledWith(componentSpy);

              changedParam.forceUpdate = false;
              panel.dashboard.getParameterValue.and.returnValue("b");
              panel.dashboard.updateComponent.calls.reset();
              panel._changeComponentsByDiff(change);
              expect(panel.dashboard.updateComponent).toHaveBeenCalledWith(componentSpy);
            });


            describe("PromptPanel's update components behaviour in _changeComponentsByDiff()", function() {

              beforeEach(function() {
                spyOn(panel, "_initializeParameterValue");

                var valuesArray = [ ['qwerty', 'qwerty'] ];
                componentSpy.valuesArray = valuesArray;
                spyOn(panel.widgetBuilder, "build").and.callFake(function(obj, type) {
                  return { "valuesArray": valuesArray };
                });
              });


              var doTest = function(currentValue, selectedValue, type, updateIsExpected) {
                panel.dashboard.updateComponent.calls.reset();
                panel.dashboard.getParameterValue.and.returnValue(currentValue);

                var selectedParams = [];
                selectedValue = (type.indexOf("[") === 0 && selectedValue) ? selectedValue : [selectedValue];

                for(var i=0; i < selectedValue.length; i++) {
                  selectedParams[i] = new ParameterValue();
                  selectedParams[i].value = selectedValue[i];
                  selectedParams[i].selected = true;
                }

                var param = new Parameter();
                param.name = 'param';
                param.type = type;
                param.values = selectedParams;

                var toChangeDiff = { groupName: { params: [param] } };
                panel._changeComponentsByDiff(toChangeDiff);

                // should never be called in this test set
                expect(panel._initializeParameterValue).not.toHaveBeenCalled();
                if (updateIsExpected) {
                  expect(panel.dashboard.updateComponent).toHaveBeenCalled();
                } else {
                  expect(panel.dashboard.updateComponent).not.toHaveBeenCalled();
                }
              };

              it("cases for string", function () {
                var stringType = 'java.lang.String';

                doTest('a', 'a', stringType, false);
                doTest('a', 'A', stringType, false);
                doTest('A', 'a', stringType, false);

                doTest('a', 'a ', stringType, true);
                doTest('a', '1', stringType, true);

                doTest(null, null, stringType, false);
                doTest(undefined, null, stringType, false);
                doTest(null, undefined, stringType, false);
                doTest(undefined, undefined, stringType, false);
              });

              it("cases for date", function () {
                var dateType = 'java.sql.Date';

                doTest(new Date(2000, 0, 1), new Date(2000, 0, 1), dateType, false);
                doTest(new Date(2000, 0, 1, 0, 1), new Date(2000, 0, 1, 2, 3), dateType, false);

                doTest(new Date(2000, 0, 1), new Date(2000, 0, 2), dateType, true);
                doTest(new Date(2000, 0, 1, 0, 1), new Date(2000, 0, 2, 2, 3), dateType, true);

                doTest(null, null, dateType, false);
                doTest(undefined, null, dateType, false);
                doTest(null, undefined, dateType, false);
                doTest(undefined, undefined, dateType, false);
              });

              it("cases for arrays", function () {
                var arrayType = '[arrayType'; // Starting with "[" means its an array

                doTest(["a","b"], ["a","b"], arrayType, false);
                doTest(["a","b"], ["b","a"], arrayType, false);
                doTest(["b","a","c"], ["c","b","a"], arrayType, false);

                doTest(["a","b"], ["a"], arrayType, true);
                doTest(["a","b"], ["a","c"], arrayType, true);
                doTest(["a"], ["b","c"], arrayType, true);

                doTest(null, null, arrayType, false);
                doTest(undefined, null, arrayType, false);
                doTest(null, undefined, arrayType, false);
                doTest(undefined, undefined, arrayType, false);
              });

              it("cases for other types", function () {
                var someType  = 'some-type';

                doTest(0, 0, someType, false);
                doTest(0, '0', someType, false);

                doTest('null', null, someType, true);
              });

            });

          });

          describe("_changeErrors", function() {
            beforeEach(function() {
              spyOn(panel, "removeDashboardComponents");
              componentSpy.components = [];

              spyOn(panel.widgetBuilder, "build").and.callFake(function(args) {
                var spy = jasmine.createSpy("errSpy");
                spy.promptType = "label";
                spy.type = "TextComponent";
                spy.isErrorIndicator = true;
                spy.label = args.errorMessage;
                return spy;
              });
            });

            it("should not process errors if it's not changed", function() {
              var panelComponentsCount = componentSpy.components.length;
              paramSpy.isErrorChanged = false;
              paramSpy.getSelectedValuesValue.and.returnValue(null);

              panel._changeErrors(paramSpy);

              expect(componentSpy.components.length).toBe(panelComponentsCount);
              expect(panel.removeDashboardComponents).not.toHaveBeenCalled();
            });

            it("should process existing errors", function() {
              panel.paramDefn = {
                errors : {}
              };
              panel.paramDefn.errors[paramSpy.name] = [ "error_0", "error_1" ];

              var existErrorComponent = jasmine.createSpy("existErrorComponent");
              existErrorComponent.promptType = "label";
              existErrorComponent.type = "TextComponent";
              existErrorComponent.isErrorIndicator = true;
              existErrorComponent.label = "test error";
              var existNotDelErrorComponent = jasmine.createSpy("existNotDelErrorComponent");
              existNotDelErrorComponent.promptType = "label";
              existNotDelErrorComponent.type = "TextComponent";
              existNotDelErrorComponent.isErrorIndicator = true;
              existNotDelErrorComponent.label = "error_1";
              componentSpy.components.push(existErrorComponent);
              componentSpy.components.push(existNotDelErrorComponent);

              paramSpy.isErrorChanged = true;

              panel._changeErrors(paramSpy);

              expect(componentSpy.components.length).toBe(panel.paramDefn.errors[paramSpy.name].length);
              expect(componentSpy.components[0].label).toBe(panel.paramDefn.errors[paramSpy.name][0]);
              expect(componentSpy.components[1].label).toBe(panel.paramDefn.errors[paramSpy.name][1]);
              expect(panel.removeDashboardComponents).toHaveBeenCalled();
              expect(componentSpy.cssClass).toContain("error");
              expect(componentSpy.removeErrorClass).not.toHaveBeenCalled();
            });

            it("should process without errors", function() {
              panel.paramDefn = {
                errors : {}
              };

              paramSpy.isErrorChanged = true;

              panel._changeErrors(paramSpy);

              expect(componentSpy.components.length).toBe(0);
              expect(panel.removeDashboardComponents).not.toHaveBeenCalled();
              expect(componentSpy.cssClass).not.toContain("error");
              expect(componentSpy.removeErrorClass).toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});
