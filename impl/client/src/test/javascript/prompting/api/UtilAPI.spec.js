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


define(["common-ui/prompting/api/UtilAPI"], function(UtilAPI) {

  describe("UtilAPI unit tests", function() {
    var utilApi, apiSpy;
    beforeEach(function() {
      apiSpy = jasmine.createSpy("PromptingAPI");
      utilApi = new UtilAPI(apiSpy);
    });

    it("test parseParameterXml", function() {
      var paramDefnSpy = jasmine.createSpy("ParamDefn");
      spyOn(utilApi._parameterXmlParser, "parseParameterXml").and.returnValue(paramDefnSpy);
      var paramDefn = utilApi.parseParameterXml("test str");
      expect(utilApi._parameterXmlParser.parseParameterXml).toHaveBeenCalled();
      expect(paramDefn).toBe(paramDefnSpy);
    });
  });
});
