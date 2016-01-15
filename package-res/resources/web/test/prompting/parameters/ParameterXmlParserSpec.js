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

define(['common-ui/prompting/parameters/ParameterXmlParser'], function (ParameterXmlParser) {

  describe("ParameterXmlParser", function () {
    var parameterXmlParser;

    beforeEach(function () {
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
                "<values><value encoded='true' label='dGVzdCBsYWJlbA==' null='false' selected='true' value='dGVzdCBsYWJlbA=='/></values>" +
              "</parameter>" +
              "<parameter is-list='true' is-mandatory='false' timezone-hint='timezone-hint' is-multi-select='true' is-strict='false' name='test_parameter_name' type='test type 2'>" +
                "<attribute name='test name' namespace='http://corp.name.org/namespaces/parameter-attributes' value='0'/>" +
                "<values><value encoded='true' label='dGVzdCBsYWJlbA==' null='true' selected='true' value='dGVzdCBsYWJlbA=='/></values>" +
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
    });
  });
});
