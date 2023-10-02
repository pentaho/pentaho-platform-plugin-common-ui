/*!
 * Copyright 2010 - 2023 Hitachi Vantara.  All rights reserved.
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

define([ 'common-ui/prompting/parameters/ParameterDefinition',  'common-ui/prompting/parameters/Parameter'  ], function(ParameterDefinition, Parameter) {

  describe("ParameterDefinition", function() {
    var parameterDefinition, parameter;

    beforeEach(function() {
      parameterDefinition = ParameterDefinition();
    });

    describe("getParameterGroup", function() {

      it("should return empty group by default", function() {
        var group = parameterDefinition.getParameterGroup("test-group");
        expect(group).not.toBeDefined();
      });

      it("should return group name", function() {
        parameterDefinition.parameterGroups.push({'name': "test-group"});
        var group = parameterDefinition.getParameterGroup("test-group");
        expect(group).toEqual({'name': "test-group"});
      });
    });

    describe("allowAutoSubmit", function() {

      it("should return autoSubmitUI when autoSubmit is undefined", function() {
        parameterDefinition.autoSubmitUI = true;
        var bool = parameterDefinition.allowAutoSubmit();
        expect(bool).toEqual(true);
      });

      it("should return autoSubmit bool when defined", function() {
        parameterDefinition.autoSubmit = true;
        var bool = parameterDefinition.allowAutoSubmit();
        expect(bool).toEqual(true);
      });
    });

    describe("showParameterUI", function() {

      it("should return false by default", function() {
        var bool = parameterDefinition.showParameterUI();
        expect(bool).toEqual(false);
      });

      it("should return false if selected value is false", function() {
        parameter = Parameter();
        var testValue = {
          selected: true,
          value: "false"
        };
        parameter.values.push(testValue);
        parameter.name = "showParameters";
        parameterDefinition.parameterGroups.push({'name': "test-parameterGroup", 'parameters': [parameter]});
        var bool = parameterDefinition.showParameterUI();
        expect(bool).toEqual(false);
      });

      it("should return true if selected attribute is false", function() {
        parameter = Parameter();
        var testValue = {
          selected: false,
          value: "false"
        };
        parameter.values.push(testValue);
        parameter.name = "showParameters";
        parameterDefinition.parameterGroups.push({'name': "test-parameterGroup", 'parameters': [parameter]});
        var bool = parameterDefinition.showParameterUI();
        expect(bool).toEqual(true);
      });

      it("should return true if selected attribute is true but selected value is not false", function() {
        parameter = Parameter();
        var testValue = {
          selected: true,
          value: "anything-but-false"
        };
        parameter.values.push(testValue);
        parameter.name = "showParameters";
        parameterDefinition.parameterGroups.push({'name': "test-parameterGroup", 'parameters': [parameter]});
        var bool = parameterDefinition.showParameterUI();
        expect(bool).toEqual(true);
      });
    });

    describe("getParameter", function() {

      it("should return empty ParameterDefinition by default", function() {
        var param = parameterDefinition.getParameter("test-parameterName");
        expect(param).not.toBeDefined();
      });

      it("should get the ParameterDefinition by name from the group of parameters", function() {
        parameterDefinition.parameterGroups.push({'name': "test-parameterGroup", 'parameters': [{'name': "test-parameterName"}]});
        var param = parameterDefinition.getParameter("test-parameterName");
        expect(param).toEqual({'name': "test-parameterName"});
      });

      it("should return empty ParameterDefinition if named Parameter does not exist in the group of parameters", function() {
        parameterDefinition.parameterGroups.push({'name': "test-parameterGroup", 'parameters': [{'name': "test-parameterName"}]});
        var param = parameterDefinition.getParameter("not-test-parameterName");
        expect(param).not.toBeDefined();
      });
    });

    describe("updateParameter", function() {
      it("should update the previous parameter to have a new timezone hint if the new parameter has one", function() {
        parameterDefinition.parameterGroups.push({'name': "test-parameterGroup", 'parameters': [{'name': "param-to-update"}]});
        var param = {'name': "param-to-update", 'timezoneHint': "0400"};
        parameterDefinition.updateParameterValue(param);
        var newParam = parameterDefinition.getParameter("param-to-update");
        expect(newParam.timezoneHint).toBe("0400");
      });

      it("should update the previous parameter to have a new attribute value if the new parameter has one", function() {
        testParam = Parameter();
        testParam.name = "param-to-update";
        testParam.attributes.hidden = false;
        testParam.attributes.anotherAttribute = "red";
        testParam.attributes.attributeNotUpdated = 42;

        parameterDefinition.parameterGroups.push({'name': "test-parameterGroup", 'parameters': [ testParam ] });
        var paramUpdate = {'name': "param-to-update", 'attributes': { anotherAttribute: "blue", yetAnotherAttribute: 7, hidden: true } };
        parameterDefinition.updateParameterAttribute(paramUpdate);
        var newParam = parameterDefinition.getParameter("param-to-update");
        expect(newParam.attributes.hidden).toBe(true);
        expect(newParam.attributes.anotherAttribute).toBe("blue");
        expect(newParam.attributes.attributeNotUpdated).toBe(42);
        expect(newParam.attributes.yetAnotherAttribute).toBe(undefined);
      });
    });
  });
});
