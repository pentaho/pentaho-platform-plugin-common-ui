/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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

define([ 'common-ui/prompting/parameters/ParameterValidator', 'common-ui/prompting/parameters/ParameterXmlParser'], function(ParameterValidator, ParameterXmlParser) {

  describe("ParameterValidator", function() {
    var parameterValidator, parameterXmlParser, paramDefn;

    beforeEach(function() {
      parameterValidator = new ParameterValidator();
      parameterXmlParser = new ParameterXmlParser();

      paramDefn = parameterXmlParser.parseParameterXml(
          "<parameters autoSubmitUI='false' autoSubmit='false' paginate='false' accepted-page='1' page-count='2' ignore-biserver-5538='false' is-prompt-needed='false' layout='test-layout'>" +
            "<parameter is-list='true' is-mandatory='false' timezone-hint='timezone-hint' is-multi-select='false' is-strict='true' name='test_parameter_name' type='test type'>" +
              "<attribute name='test name' namespace='http://corp.name.org/namespaces/parameter-attributes' value='0'/>" +
              "<values>" +
                "<value encoded='false' label='test label' null='false' selected='true' type='test type' value='old value'/>" +
                "<value encoded='false' label='test label' null='false' selected='false' type='test type' value='new value'/>" +
              "</values>" +
            "</parameter>" +              
            "<error parameter='test_parameter_name' message='test error message'></error>" +
          "</parameters>");
    });

    describe("validateSingleParameter", function() {

      it("should validate and set parameter value and remove validation error", function() {
        parameterValidator.validateSingleParameter(paramDefn, "test_parameter_name", "new value");
        expect(paramDefn.getParameter("test_parameter_name").getSelectedValuesValue()).toEqual(["new value"]);
        expect(paramDefn.errors["test_parameter_name"]).not.toBeDefined();
      });
    });

    describe("checkParametersErrors", function() {

      it("should check parameters errors", function() {
        parameterValidator.checkParametersErrors(paramDefn);
        expect(paramDefn.promptNeeded).toEqual(true);
        parameterValidator.validateSingleParameter(paramDefn, "test_parameter_name", "new value");
        parameterValidator.checkParametersErrors(paramDefn);
        expect(paramDefn.promptNeeded).toEqual(false);
      });
    });
  });
});
