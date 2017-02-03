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
define(['common-ui/prompting/builders/MultiButtonBuilder', 'common-ui/jquery-clean'], function(MultiButtonBuilder, $) {

  describe("MultiButtonBuilder", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { },
        getParameterName: function() { }
      }, 
      param:  {
        values: { },
        attributes: { }
      }
    };

    var multiButtonBuilder

    beforeEach(function() {
      multiButtonBuilder = new MultiButtonBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(multiButtonBuilder.build).toThrow();
    });

    it("should return a MultiButtonComponent", function() {
      var component = multiButtonBuilder.build(args);
      expect(component.type).toBe('MultiButtonComponent');
      expect(component.expression).toBeDefined();
      expect(component.postExecution).toBeDefined();
    });

    it("should add class on postExecution", function() {
      var component = multiButtonBuilder.build(args);
      spyOn($.fn, 'addClass');
      component.postExecution();
      expect($.fn.addClass).toHaveBeenCalled();
    });

    it("should return parameter value on expression", function() {
      var component = multiButtonBuilder.build(args);
      component.dashboard = {};
      component.dashboard.getParameterValue = function() { };

      spyOn(component.dashboard, 'getParameterValue').and.callThrough();
      
      component.expression();
      expect(component.dashboard.getParameterValue).toHaveBeenCalled();
    });

  });

});