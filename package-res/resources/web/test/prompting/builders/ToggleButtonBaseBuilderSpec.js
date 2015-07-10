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
define(['common-ui/prompting/builders/ToggleButtonBaseBuilder'], function(ToggleButtonBaseBuilder) {

  describe("ToggleButtonBaseBuilder", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { },
        getParameterName: function() { }
      }, 
      param:  {
        values: { },
        attributes: {
          'parameter-layout': 'vertical'
        }
      }
    };

    var toggleButtonBaseBuilder;

    beforeEach(function() {
      toggleButtonBaseBuilder = new ToggleButtonBaseBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(toggleButtonBaseBuilder.build).toThrow();
    });

    it("should return a ToggleButtonBaseBuilder with verticalOrientation set to true when parameter-layout is set to 'vertical'", function() {
      var component = toggleButtonBaseBuilder.build(args);
      expect(component.type).toBe(undefined);
      expect(component.verticalOrientation).toBeTruthy();
    });

    it("should return a ToggleButtonBaseBuilder with verticalOrientation set to false when parameter-layout is set to other than 'vertical'", function() {
      args.param.attributes['parameter-layout'] = '';
      var component = toggleButtonBaseBuilder.build(args);
      expect(component.type).toBe(undefined);
      expect(component.verticalOrientation).toBeFalsy();
    });

  });

});