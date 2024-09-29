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

define(['common-ui/prompting/builders/ParameterWidgetBuilderBase', 'common-ui/jquery-clean'], function(ParameterWidgetBuilderBase, $) {

  describe("ParameterWidgetBuilderBase", function() {

    var args;
    var parameterWidgetBuilderBase;
    var component;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { }
        },
        param:  {
          values: [],
          attributes: {}
        }
      };
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
