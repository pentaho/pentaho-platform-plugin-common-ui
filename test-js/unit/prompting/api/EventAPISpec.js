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

define([
      "cdf/Dashboard.Clean",
      "common-ui/prompting/PromptPanel",
      "common-ui/prompting/parameters/ParameterXmlParser",
      "common-ui/prompting/api/EventAPI",
      "text!./parameterDefinition.xml!strip"],
    function (Dashboard, PromptPanel, ParameterXmlParser, EventAPI, parameterDefinitionXml) {

      describe("EventAPI unit tests", function () {
        var eventApi, apiSpy, promptPanelSpy, dashboardSpy, callback;
        beforeEach(function () {
          dashboardSpy = jasmine.createSpyObj("Dashboard", ["on"]);

          promptPanelSpy = jasmine.createSpyObj("PromptPanel", ["onPostInit"]);
          promptPanelSpy.dashboard = dashboardSpy;

          apiSpy = jasmine.createSpy("PromptingAPI");
          apiSpy.operation = jasmine.createSpyObj("OperationAPI", ["_getPromptPanel"]);
          apiSpy.operation._getPromptPanel.and.returnValue(promptPanelSpy);

          eventApi = new EventAPI(apiSpy);

          callback = jasmine.createSpy("Callback");
        });

        afterEach(function () {
          expect(apiSpy.operation._getPromptPanel).toHaveBeenCalled();
        });

        it("should register a beforeRender event", function () {
          eventApi.beforeRender(callback);
          expect(promptPanelSpy.onBeforeRender).toBeDefined();
          expect(promptPanelSpy.onBeforeRender).toBe(callback);
        });

        it("should register a afterRender event", function () {
          eventApi.afterRender(callback);
          expect(promptPanelSpy.onAfterRender).toBeDefined();
          expect(promptPanelSpy.onAfterRender).toBe(callback);
        });

        it("should register a beforeUpdate event", function () {
          eventApi.beforeUpdate(callback);
          expect(promptPanelSpy.onBeforeUpdate).toBeDefined();
          expect(promptPanelSpy.onBeforeUpdate).toBe(callback);
        });

        it("should register a afterUpdate event", function () {
          eventApi.afterUpdate(callback);
          expect(promptPanelSpy.onAfterUpdate).toBeDefined();
          expect(promptPanelSpy.onAfterUpdate).toBe(callback);
        });

        it("should register a parameterChanged event", function () {
          eventApi.parameterChanged(callback);
          expect(promptPanelSpy.onParameterChanged).toBeDefined();
          expect(promptPanelSpy.onParameterChanged['']).toBe(callback);
        });

        it("should clear callbacks if passed null", function () {
          eventApi.parameterChanged(null);
          expect(promptPanelSpy.onParameterChanged).toBe(null);
        });

        it("should assign overall callback if parameter name is null or empty", function () {
          var parameterCallback = function() {};
          eventApi.parameterChanged(parameterCallback);
          eventApi.parameterChanged(parameterCallback, '');          
          expect(promptPanelSpy.onParameterChanged).toBeDefined();
          expect(promptPanelSpy.onParameterChanged['']).toBe(parameterCallback);
        });

        it("should register a parameterChanged event for a specific parameter", function() {
          var parameterCallback = function() {};
          eventApi.parameterChanged(parameterCallback, 'param');
          expect(promptPanelSpy.onParameterChanged).toBeDefined();
          expect(promptPanelSpy.onParameterChanged['param']).toBe(parameterCallback);
        });

        it("should register a parameterChanged event for multiple parameter", function() {
          var parameterCallback1 = function() {};
          var parameterCallback2 = function() {};
          eventApi.parameterChanged(parameterCallback1, 'param1');
          eventApi.parameterChanged(parameterCallback2, 'param2');
          expect(promptPanelSpy.onParameterChanged).toBeDefined();
          expect(promptPanelSpy.onParameterChanged['param1']).toBe(parameterCallback1);
          expect(promptPanelSpy.onParameterChanged['param2']).toBe(parameterCallback2);
        });

        it("should register a parameterChanged event for a specific parameter and another for all parameters", function() {
          var parameterCallback1 = function() {};
          var parameterCallback2 = function() {};
          eventApi.parameterChanged(parameterCallback1, 'param1');
          eventApi.parameterChanged(parameterCallback2, '');
          expect(promptPanelSpy.onParameterChanged).toBeDefined();
          expect(promptPanelSpy.onParameterChanged['param1']).toBe(parameterCallback1);
          expect(promptPanelSpy.onParameterChanged['']).toBe(parameterCallback2);
        });

        it("should register a postInit event", function () {
          eventApi.postInit(callback);
          expect(promptPanelSpy.onPostInit).toHaveBeenCalledWith(callback);
        });

        it("should register a ready event", function () {
          eventApi.ready(callback);
          expect(promptPanelSpy.ready).toBeDefined();
          expect(promptPanelSpy.ready).toBe(callback);
        });

        it("should register a submit event callback", function () {
          eventApi.submit(callback);
          expect(promptPanelSpy.onSubmit).toBeDefined();
          expect(promptPanelSpy.onSubmit).toBe(callback);
        });

        it("should unregister a submit event callback", function () {
          eventApi.submit(callback);
          expect(promptPanelSpy.onSubmit).toBe(callback);
          eventApi.submit(null);
          expect(promptPanelSpy.onSubmit).toBeDefined();
          expect(promptPanelSpy.onSubmit).toBe(null);
        });

        it("should register a stateChanged event", function() {
          eventApi.stateChanged(callback);
          expect(promptPanelSpy.onStateChanged).toBe(callback);

          eventApi.stateChanged("test");
          expect(promptPanelSpy.onStateChanged).toBe(null);

          eventApi.stateChanged(null);
          expect(promptPanelSpy.onStateChanged).toBe(null);
        });
      });

      describe("EventAPI Tests with PromptPanel updates", function(){
        var eventApi, apiSpy, promptPanel, dashboard;
        var beforeRenderCallback, afterRenderCallback,
            beforeUpdateCallback, afterUpdateCallback,
            readyCallback;
        var parameterParser, initialParameterDefinition;

        beforeEach(function () {
          dashboard = new Dashboard();

          parameterParser = new ParameterXmlParser();
          initialParameterDefinition = parameterParser.parseParameterXml(parameterDefinitionXml);
          promptPanel = new PromptPanel('promptPanel', initialParameterDefinition);
          promptPanel.guid = "1";
          promptPanel.dashboard = dashboard;

          apiSpy = jasmine.createSpy("PromptingAPI");
          apiSpy.operation = jasmine.createSpyObj("OperationAPI", ["_getPromptPanel"]);
          apiSpy.operation._getPromptPanel.and.returnValue(promptPanel);

          eventApi = new EventAPI(apiSpy);

          beforeRenderCallback = jasmine.createSpy("beforeRender");
          afterRenderCallback = jasmine.createSpy("beforeRender");
          beforeUpdateCallback = jasmine.createSpy("beforeRender");
          afterUpdateCallback = jasmine.createSpy("beforeRender");
          readyCallback = jasmine.createSpy("ready");

          eventApi.beforeRender(beforeRenderCallback);
          eventApi.afterRender(afterRenderCallback);
          eventApi.beforeUpdate(beforeUpdateCallback);
          eventApi.afterUpdate(afterUpdateCallback);
          eventApi.ready(readyCallback);
        });

        it("should call update always and render events if a change is needed", function (done) {
          promptPanel.paramDefn = $.extend(true, {}, initialParameterDefinition);

          eventApi.postInit(function(){
            initialParameterDefinition.parameterGroups[0].parameters.splice(1);
            promptPanel.refresh(initialParameterDefinition);
            expect(promptPanel.onBeforeRender.calls.count()).toEqual(2);
            expect(promptPanel.onAfterRender.calls.count()).toEqual(2);
            expect(promptPanel.onBeforeUpdate.calls.count()).toEqual(2);
            expect(promptPanel.onAfterUpdate.calls.count()).toEqual(2);
            expect(promptPanel.ready.calls.count()).toEqual(1);
            done();
          });

          promptPanel.init();
          expect(promptPanel.onBeforeRender.calls.count()).toEqual(1);
          expect(promptPanel.onAfterRender.calls.count()).toEqual(1);
          expect(promptPanel.onBeforeUpdate.calls.count()).toEqual(1);
          expect(promptPanel.onAfterUpdate.calls.count()).toEqual(1);
        });

        it("should call update, but not render events if a change is not needed", function (done) {
          promptPanel.paramDefn = $.extend(true, {}, initialParameterDefinition);

          eventApi.postInit(function(){
            promptPanel.refresh(initialParameterDefinition);
            expect(promptPanel.onBeforeRender.calls.count()).toEqual(1);
            expect(promptPanel.onAfterRender.calls.count()).toEqual(1);
            expect(promptPanel.onBeforeUpdate.calls.count()).toEqual(2);
            expect(promptPanel.onAfterUpdate.calls.count()).toEqual(2);
            expect(promptPanel.ready.calls.count()).toEqual(1);
            done();
          });

          promptPanel.init();
          expect(promptPanel.onBeforeRender.calls.count()).toEqual(1);
          expect(promptPanel.onAfterRender.calls.count()).toEqual(1);
          expect(promptPanel.onBeforeUpdate.calls.count()).toEqual(1);
          expect(promptPanel.onAfterUpdate.calls.count()).toEqual(1);
        });
      });
    });
