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
define(['common-ui/prompting/builders/ParameterPanelBuilder'], function(ParameterPanelBuilder) {

  describe("ParameterPanelBuilder", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { },
        getParameterName: function() { },
        buildPanelComponents: function() { }
      }
    };

    var parameterPanelBuilder;

    beforeEach(function() {
      parameterPanelBuilder = new ParameterPanelBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(parameterPanelBuilder.build).toThrow();
    });

    it("should return a ParameterPanelComponent", function() {
      var component = parameterPanelBuilder.build(args);
      expect(component.type).toBe('ParameterPanelComponent');
      expect(component.name.indexOf('panel-') == 0).toBeTruthy();
    });

  });

});