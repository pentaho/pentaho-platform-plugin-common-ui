/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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

define([ 'common-ui/prompting/parameters/Parameter', 'common-ui/prompting/parameters/ParameterValue',
    'common-ui/prompting/parameters/ParameterGroup', 'common-ui/prompting/parameters/ParameterDefinition',
    'common-ui/prompting/parameters/ParameterDefinitionDiffer' ], function(Parameter, ParameterValue, ParameterGroup,
                                                                           ParameterDefinition, ParameterDefinitionDiffer) {

    describe("ParameterDefinitionDiffer", function() {
        var parameterDefinitionDiffer;

        var createParam = function(arrayCount, type, list, mandatory, multiSelect, strict) {
            var param = new Parameter();
            for (var i = 0; i < arrayCount; i++) {
                param.attributes['attr' + i] = "attr" + i;
                var value = new ParameterValue();
                value.type = type;
                value.label = "label" + i;
                value.value = "label" + i;
                value.selected = false;
                param.values.push(value);
            }
            param.type = type;
            param.list = list;
            param.mandatory = mandatory;
            param.multiSelect = multiSelect;
            param.strict = strict;
            return param;
        };

        var createParamDefn = function(paramName, arrayCount) {
            var paramDefn = new ParameterDefinition();
            paramDefn.errors[paramName] = [];
            for (var i = 0; i < arrayCount; i++) {
                paramDefn.errors[paramName].push("error" + i);
            }
            var group = new ParameterGroup();
            var param = createParam(arrayCount, "String", true, true, true, true);
            param.name = paramName;
            group.parameters.push(param);
            paramDefn.parameterGroups.push(group);
            return paramDefn;
        };

        beforeEach(function() {
            parameterDefinitionDiffer = new ParameterDefinitionDiffer();
        });

        describe("_isBehavioralAttrsChanged", function() {
            var paramOld, paramNew;

            beforeEach(function() {
                paramOld = createParam(2, "String", true, true, true, true);
                paramNew = createParam(2, "String", true, true, true, true);
            });

            it("should return false for parameters with equal attributes and properties", function() {
                var result = parameterDefinitionDiffer._isBehavioralAttrsChanged(paramOld, paramNew);
                expect(result).toBeFalsy();
            });

            it("should return true for different attributes", function() {
                paramNew.attributes.attr0 = "new";
                var result = parameterDefinitionDiffer._isBehavioralAttrsChanged(paramOld, paramNew);
                expect(result).toBeTruthy();
            });

            it("should return true for different type property", function() {
                paramNew.type = "Number";
                var result = parameterDefinitionDiffer._isBehavioralAttrsChanged(paramOld, paramNew);
                expect(result).toBeTruthy();
            });

            it("should return true for different list property", function() {
                paramNew.list = false;
                var result = parameterDefinitionDiffer._isBehavioralAttrsChanged(paramOld, paramNew);
                expect(result).toBeTruthy();
            });

            it("should return true for different mandatory property", function() {
                paramNew.mandatory = false;
                var result = parameterDefinitionDiffer._isBehavioralAttrsChanged(paramOld, paramNew);
                expect(result).toBeTruthy();
            });

            it("should return true for different multiSelect property", function() {
                paramNew.multiSelect = false;
                var result = parameterDefinitionDiffer._isBehavioralAttrsChanged(paramOld, paramNew);
                expect(result).toBeTruthy();
            });

            it("should return true for different strict property", function() {
                paramNew.strict = false;
                var result = parameterDefinitionDiffer._isBehavioralAttrsChanged(paramOld, paramNew);
                expect(result).toBeTruthy();
            });
        });

        describe("_isDataChanged", function() {
            var paramOld, paramNew;

            beforeEach(function() {
                paramOld = createParam(2, "String", true, true, true, true);
                paramNew = createParam(2, "String", true, true, true, true);
            });

            it("should return false for equal values", function() {
                var result = parameterDefinitionDiffer._isDataChanged(paramOld, paramNew);
                expect(result).toBeFalsy();
            });

            it("should return true for diffrenet values", function() {
                paramNew.values[0].selected = true;
                var result = parameterDefinitionDiffer._isDataChanged(paramOld, paramNew);
                expect(result).toBeTruthy();
            });
        });

        describe("_isErrorsChanged", function() {
            var paramName = "paramName";
            var paramDefnOld, paramDefnNew;

            beforeEach(function() {
                paramDefnOld = createParamDefn(paramName, 2);
                paramDefnNew = createParamDefn(paramName, 2);
            });

            it("should return false for equal errors", function() {
                var result = parameterDefinitionDiffer._isErrorsChanged(paramName, paramDefnOld, paramDefnNew);
                expect(result).toBeFalsy();
            });

            it("should return true for diffrenet errors", function() {
                paramDefnNew.errors[paramName].push("new error");
                var result = parameterDefinitionDiffer._isErrorsChanged(paramName, paramDefnOld, paramDefnNew);
                expect(result).toBeTruthy();
            });
        });

        describe("diff", function() {
            var paramName = "paramName";
            var paramDefnOld, paramDefnNew;

            beforeEach(function() {
                paramDefnOld = createParamDefn(paramName, 2);
                paramDefnNew = createParamDefn(paramName, 2);
            });

            describe("should return false result", function() {
                var result;

                it("if first param is undefined", function() {
                    result = parameterDefinitionDiffer.diff(undefined, {});
                });

                it("if second param is undefined", function() {
                    result = parameterDefinitionDiffer.diff({});
                });

                it("if both parameters are undefined", function() {
                    result = parameterDefinitionDiffer.diff();
                });

                afterEach(function() {
                    expect(result).toBeFalsy();
                });
            });

            it("should return result with added and removed parameters", function() {
                spyOn(paramDefnNew, "getParameter").and.returnValue(false);
                spyOn(paramDefnOld, "getParameter").and.returnValue(false);
                spyOn(parameterDefinitionDiffer, "_isBehavioralAttrsChanged").and.returnValue(false);
                spyOn(parameterDefinitionDiffer, "_isErrorsChanged").and.returnValue(false);
                spyOn(parameterDefinitionDiffer, "_isDataChanged").and.returnValue(false);

                var result = parameterDefinitionDiffer.diff(paramDefnOld, paramDefnNew);

                expect(parameterDefinitionDiffer._isBehavioralAttrsChanged).not.toHaveBeenCalled();
                expect(parameterDefinitionDiffer._isErrorsChanged).not.toHaveBeenCalled();
                expect(parameterDefinitionDiffer._isDataChanged).not.toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(Object.keys(result.toAdd).length).toBe(1);
                expect(Object.keys(result.toChangeData).length).toBe(0);
                expect(Object.keys(result.toRemove).length).toBe(1);
            });

            it("should return result with added and removed parameters by changed attributes", function() {
                var paramSpy = jasmine.createSpy("paramSpy");
                paramSpy.attributes = {
                    hidden : true
                };

                spyOn(paramDefnNew, "getParameter").and.returnValue(paramSpy);
                spyOn(paramDefnOld, "getParameter").and.returnValue(paramSpy);
                spyOn(parameterDefinitionDiffer, "_isBehavioralAttrsChanged").and.returnValue(true);
                spyOn(parameterDefinitionDiffer, "_isErrorsChanged").and.returnValue(false);
                spyOn(parameterDefinitionDiffer, "_isDataChanged").and.returnValue(false);

                var result = parameterDefinitionDiffer.diff(paramDefnOld, paramDefnNew);

                expect(parameterDefinitionDiffer._isBehavioralAttrsChanged).toHaveBeenCalled();
                expect(parameterDefinitionDiffer._isErrorsChanged).not.toHaveBeenCalled();
                expect(parameterDefinitionDiffer._isDataChanged).not.toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(Object.keys(result.toAdd).length).toBe(1);
                expect(Object.keys(result.toChangeData).length).toBe(0);
                expect(Object.keys(result.toRemove).length).toBe(1);
            });

            it("should return result with added and removed parameters by changed errors", function() {
                var paramSpy = jasmine.createSpy("paramSpy");
                paramSpy.attributes = {
                    hidden : true
                };

                spyOn(paramDefnNew, "getParameter").and.returnValue(paramSpy);
                spyOn(paramDefnOld, "getParameter").and.returnValue(paramSpy);
                spyOn(parameterDefinitionDiffer, "_isBehavioralAttrsChanged").and.returnValue(false);
                spyOn(parameterDefinitionDiffer, "_isErrorsChanged").and.returnValue(true);
                spyOn(parameterDefinitionDiffer, "_isDataChanged").and.returnValue(true);

                var result = parameterDefinitionDiffer.diff(paramDefnOld, paramDefnNew);

                expect(parameterDefinitionDiffer._isBehavioralAttrsChanged).toHaveBeenCalled();
                expect(parameterDefinitionDiffer._isErrorsChanged).toHaveBeenCalled();
                expect(parameterDefinitionDiffer._isDataChanged).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(Object.keys(result.toAdd).length).toBe(0);
                expect(Object.keys(result.toChangeData).length).toBe(1);
                expect(Object.keys(result.toRemove).length).toBe(0);
            });

            it("should return result with changed parameters by changed values", function() {
                var paramSpy = jasmine.createSpy("paramSpy");
                paramSpy.attributes = {
                    hidden : true
                };

                spyOn(paramDefnNew, "getParameter").and.returnValue(paramSpy);
                spyOn(paramDefnOld, "getParameter").and.returnValue(paramSpy);
                spyOn(parameterDefinitionDiffer, "_isBehavioralAttrsChanged").and.returnValue(false);
                spyOn(parameterDefinitionDiffer, "_isErrorsChanged").and.returnValue(false);
                spyOn(parameterDefinitionDiffer, "_isDataChanged").and.returnValue(true);

                var result = parameterDefinitionDiffer.diff(paramDefnOld, paramDefnNew);

                expect(parameterDefinitionDiffer._isBehavioralAttrsChanged).toHaveBeenCalled();
                expect(parameterDefinitionDiffer._isErrorsChanged).toHaveBeenCalled();
                expect(parameterDefinitionDiffer._isDataChanged).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(Object.keys(result.toAdd).length).toBe(0);
                expect(Object.keys(result.toChangeData).length).toBe(1);
                expect(Object.keys(result.toRemove).length).toBe(0);
            });

            it("should return result without changes", function() {
                var paramSpy = jasmine.createSpy("paramSpy");
                paramSpy.attributes = {
                    hidden : true
                };

                spyOn(paramDefnNew, "getParameter").and.returnValue(paramSpy);
                spyOn(paramDefnOld, "getParameter").and.returnValue(paramSpy);
                spyOn(parameterDefinitionDiffer, "_isBehavioralAttrsChanged").and.returnValue(false);
                spyOn(parameterDefinitionDiffer, "_isErrorsChanged").and.returnValue(false);
                spyOn(parameterDefinitionDiffer, "_isDataChanged").and.returnValue(false);

                var result = parameterDefinitionDiffer.diff(paramDefnOld, paramDefnNew);

                expect(parameterDefinitionDiffer._isBehavioralAttrsChanged).toHaveBeenCalled();
                expect(parameterDefinitionDiffer._isErrorsChanged).not.toHaveBeenCalled();
                expect(parameterDefinitionDiffer._isDataChanged).toHaveBeenCalled();
                expect(result).toBeDefined();
                expect(Object.keys(result.toAdd).length).toBe(0);
                expect(Object.keys(result.toChangeData).length).toBe(0);
                expect(Object.keys(result.toRemove).length).toBe(0);
            });
        });
    });
});