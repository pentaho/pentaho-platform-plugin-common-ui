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
define(['common-ui/prompting/builders/ParameterWidgetBuilderBase', 'common-ui/jquery-clean'], function(ParameterWidgetBuilderBase, $) {

  describe("ParameterWidgetBuilderBase", function() {

    var args = {
      promptPanel: {
        generateWidgetGUID: function() { },
        getParameterName: function() { }
      }, 
      param:  {
        values: [],
        attributes: {}
      }
    };

    var parameterWidgetBuilderBase;
    var component;

    beforeEach(function() {
      parameterWidgetBuilderBase = new ParameterWidgetBuilderBase();
      component = parameterWidgetBuilderBase.build(args);
      component.base = function() {};
    });

    it("should throw an error building component with no parameters", function() {
      expect(parameterWidgetBuilderBase.build).toThrow();
    });

    it("should return build successfully", function() {
      expect(component.postExecution).toBeDefined();
      expect(component.type).toBeUndefined();
      expect(component.promptType).toEqual('prompt');
    });

    it("should not set the tooltip on postExecution if no tooltip is passed", function() {
      spyOn(component, 'postExecution').and.callThrough();
      spyOn(component, 'base').and.callThrough();      
      spyOn($.fn, 'attr'); 

      component.postExecution();
      
      expect(component.postExecution).toHaveBeenCalled();
      expect(component.base).toHaveBeenCalled();
      expect($.fn.attr).not.toHaveBeenCalled();
    });

    it("should set the tooltip on postExecution if any exists", function() {
      args.param.attributes['tooltip'] = 'tooltip';

      spyOn(component, 'postExecution').and.callThrough();
      spyOn(component, 'base').and.callThrough();      
      spyOn($.fn, 'attr');      
      
      component.postExecution();
      
      expect(component.postExecution).toHaveBeenCalled();
      expect(component.base).toHaveBeenCalled();
      expect($.fn.attr).toHaveBeenCalled();
    });
  });

});