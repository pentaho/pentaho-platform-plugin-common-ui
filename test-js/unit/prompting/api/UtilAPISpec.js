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
