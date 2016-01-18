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

define(['common-ui/prompting/parameters/ParameterXmlParser', 'cdf/Logger'], function (ParameterXmlParser, Logger) {

  describe("ParameterXmlParser", function () {
    var parameterXmlParser;

    beforeEach(function () {
      spyOn(Logger, "warn");
      parameterXmlParser = new ParameterXmlParser();
    });

    describe("parseParameterXml", function () {
      it("should parse parameter xml", function () {
        var paramDefn = parameterXmlParser.parseParameterXml(
            "<parameters autoSubmitUI='false' autoSubmit='false' paginate='false' accepted-page='1' page-count='2' ignore-biserver-5538='false' is-prompt-needed='false' layout='test-layout'>" +
              "<parameter is-list='true' is-mandatory='false' timezone-hint='timezone-hint' is-multi-select='true' is-strict='false' name='test_parameter_name' type='test type'>" +
                "<attribute name='test name' namespace='http://corp.name.org/namespaces/parameter-attributes' value='0'/>" +
                "<values><value encoded='false' label='test label' null='false' selected='true' type='test type' value='test label'/></values>" +
              "</parameter>" +
              "<parameter is-list='true' is-mandatory='false' timezone-hint='timezone-hint' is-multi-select='true' is-strict='false' name='test_parameter_name' type='test type 2'>" +
                "<attribute name='test name' namespace='http://corp.name.org/namespaces/parameter-attributes' value='0'/>" +
                "<values><value encoded='true' label='dGVzdCBsYWJlbA==' null='false' selected='true' type='test type 2' value='dGVzdCBsYWJlbA=='/></values>" +
              "</parameter>" +
              "<parameter is-list='true' is-mandatory='false' timezone-hint='timezone-hint' is-multi-select='true' is-strict='false' name='test_parameter_name' type='test type 2'>" +
                "<attribute name='test name' namespace='http://corp.name.org/namespaces/parameter-attributes' value='0'/>" +
                "<values><value encoded='true' label='dGVzdCBsYWJlbA==' null='true' selected='true' type='test type 2' value='dGVzdCBsYWJlbA=='/></values>" +
              "</parameter>" +
              "<error parameter='test_parameter_name' message='test error message'></error>" +
              "<global-error message='test global-error message'></global-error>" +
            "</parameters>");
        expect(paramDefn['autoSubmitUI']).toEqual(false);
        expect(paramDefn['autoSubmit']).toEqual(false);
        expect(paramDefn['paginate']).toEqual(false);
        expect(paramDefn['page']).toEqual(1);
        expect(paramDefn['totalPages']).toEqual(2);
        expect(paramDefn['ignoreBiServer5538']).toEqual(false);
        expect(paramDefn['promptNeeded']).toEqual(false);
        expect(paramDefn['layout']).toEqual('test-layout');
        expect(paramDefn.parameterGroups.length).toEqual(1);
        expect(paramDefn.parameterGroups[0].parameters.length).toEqual(3);
        expect(paramDefn.parameterGroups[0].parameters[0]['name']).toEqual('test_parameter_name');
        expect(paramDefn.parameterGroups[0].parameters[0]['list']).toEqual(true);
        expect(paramDefn.parameterGroups[0].parameters[0]['mandatory']).toEqual(false);
        expect(paramDefn.parameterGroups[0].parameters[0]['multiSelect']).toEqual(true);
        expect(paramDefn.parameterGroups[0].parameters[0]['strict']).toEqual(false);
        expect(paramDefn.parameterGroups[0].parameters[0]['type']).toEqual('test type');
        expect(paramDefn.parameterGroups[0].parameters[0]['timezoneHint']).toEqual('timezone-hint');
        expect(paramDefn.parameterGroups[0].parameters[0]['attributes']['test name']).toEqual('0');
        expect(paramDefn.parameterGroups[0].parameters[0]['values'].length).toEqual(1);
        expect(paramDefn.parameterGroups[0].parameters[0]['values'][0]['label']).toEqual('test label');
        expect(paramDefn.parameterGroups[0].parameters[0]['values'][0]['selected']).toEqual(true);
        expect(paramDefn.parameterGroups[0].parameters[0]['values'][0]['type']).toEqual('test type');
        expect(paramDefn.parameterGroups[0].parameters[0]['values'][0]['value']).toEqual('test label');
        expect(paramDefn.parameterGroups[0].parameters[1]['values'].length).toEqual(1);
        expect(paramDefn.parameterGroups[0].parameters[1]['values'][0]['label']).toEqual('test label');
        expect(paramDefn.parameterGroups[0].parameters[1]['values'][0]['selected']).toEqual(true);
        expect(paramDefn.parameterGroups[0].parameters[1]['values'][0]['type']).toEqual(paramDefn.parameterGroups[0].parameters[1]['type']);
        expect(paramDefn.parameterGroups[0].parameters[1]['values'][0]['value']).toEqual('test label');
        expect(paramDefn.parameterGroups[0].parameters[2]['values'][0]['value']).toEqual('');
        expect(paramDefn['errors']['null'][0]).toEqual("test global-error message");
        expect(paramDefn['errors']['test_parameter_name'][0]).toEqual("test error message");
        expect(Logger.warn).not.toHaveBeenCalled();
      });

      it("fails parse if invalid xml string is used", function () {
        expect(function(){
          parameterXmlParser.parseParameterXml();
        }).toThrow();
        expect(function(){
          parameterXmlParser.parseParameterXml("");
        }).toThrow();
        expect(function(){
          parameterXmlParser.parseParameterXml(
              "<parameters autoSubmitUI='false' autoSubmit='false' paginate='false' accepted-page='1' page-count='2' ignore-biserver-5538='false' is-prompt-needed='false' layout='test-layout'>" +
              "</parameters");
        }).toThrow();
      });

      it("should throw error if no attribute: _getAttributeFromXmlNode", function() {
        expect(function() {
          var xml = "<parameters autoSubmitUI='false' autoSubmit='false' paginate='false' accepted-page='1' page-count='2' ignore-biserver-5538='false' is-prompt-needed='false' layout='test-layout'>" +
                        "<parameter is-list='true' is-mandatory='false' timezone-hint='timezone-hint' is-multi-select='true' is-strict='false' type='test type'>" +
                          "<attribute name='test name' namespace='http://corp.name.org/namespaces/parameter-attributes' value='0'/>" +
                          "<values><value encoded='false' label='test label' null='false' selected='true' value='test label'/></values>" +
                        "</parameter>" +
                      "</parameters>";
          var paramDefn = parameterXmlParser.parseParameterXml(xml);
        }).toThrow("ParameterDefinition: no attribute 'name' found");

        expect(function() {
          var xml = "<parameters autoSubmitUI='false' autoSubmit='false' paginate='false' accepted-page='1' page-count='2' ignore-biserver-5538='false' is-prompt-needed='false' layout='test-layout'>" +
                        "<parameter is-list='true' is-mandatory='false' timezone-hint='timezone-hint' is-multi-select='true' is-strict='false' name='test_parameter_name'>" +
                          "<attribute name='test name' namespace='http://corp.name.org/namespaces/parameter-attributes' value='0'/>" +
                          "<values><value encoded='false' label='test label' null='false' selected='true' value='test label'/></values>" +
                        "</parameter>" +
                      "</parameters>";
          var paramDefn = parameterXmlParser.parseParameterXml(xml);
        }).toThrow("ParameterDefinition: no attribute 'type' found");
      });

      it("should log warning if no attrs: _getAttributeFromXmlNode", function() {
        var xml = "<parameters autoSubmitUI='false' _autoSubmit='false' paginate='false' _accepted-page='1' _page-count='2' ignore-biserver-5538='false' is-prompt-needed='false' _layout='test-layout'>" +
                      "<parameter is-list='true' is-mandatory='false' timezone-hint='timezone-hint' is-multi-select='true' is-strict='false' name='test_parameter_name' type='test type'>" +
                        "<attribute name='test name' namespace='http://corp.name.org/namespaces/parameter-attributes' value='0'/>" +
                        "<values><value encoded='false' _label='test label' _null='false' selected='true' _value='test label'/></values>" +
                      "</parameter>" +
                      "<error _parameter='test_parameter_name' _message='test error message'></error>" +
                      "<global-error _message='test global-error message'></global-error>" +
                    "</parameters>";
        var paramDefn = parameterXmlParser.parseParameterXml(xml);
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: no attribute 'parameter' found");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: no attribute 'message' found");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: no attribute 'label' found");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: no attribute 'null' found");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: no attribute 'value' found");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: no attribute 'type' found");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: no attribute 'layout' found");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: no attribute 'accepted-page' found");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: no attribute 'page-count' found");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: no attribute 'autoSubmit' found");
      });

      it("should log warning if no boolean value: _getBooleanFromXmlNode", function() {
        var xml = "<parameters autoSubmitUI='test' autoSubmit='false' paginate='test' accepted-page='1' page-count='2' ignore-biserver-5538='test' is-prompt-needed='test' layout='test-layout'>" +
                      "<parameter is-list='test' is-mandatory='test' timezone-hint='timezone-hint' is-multi-select='test' is-strict='test' name='test_parameter_name' type='test type'>" +
                        "<attribute name='test name' namespace='http://corp.name.org/namespaces/parameter-attributes' value='0'/>" +
                        "<values><value encoded='false' label='test label' null='false' selected='test' value='test label'/></values>" +
                      "</parameter>" +
                      "<error parameter='test_parameter_name' message='test error message'></error>" +
                      "<global-error message='test global-error message'></global-error>" +
                    "</parameters>";
        var paramDefn = parameterXmlParser.parseParameterXml(xml);
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: expected 'is-mandatory' to be boolean, got 'test' instead");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: expected 'is-strict' to be boolean, got 'test' instead");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: expected 'is-list' to be boolean, got 'test' instead");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: expected 'is-multi-select' to be boolean, got 'test' instead");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: expected 'selected' to be boolean, got 'test' instead");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: expected 'is-prompt-needed' to be boolean, got 'test' instead");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: expected 'ignore-biserver-5538' to be boolean, got 'test' instead");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: expected 'paginate' to be boolean, got 'test' instead");
        expect(Logger.warn).toHaveBeenCalledWith("ParameterDefinition: expected 'autoSubmitUI' to be boolean, got 'test' instead");
      });
    });
  });
});
