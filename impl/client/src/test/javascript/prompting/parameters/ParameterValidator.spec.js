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
