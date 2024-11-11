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

define(['common-ui/prompting/builders/MultiButtonBuilder', 'common-ui/jquery-clean'], function(MultiButtonBuilder, $) {

  describe("MultiButtonBuilder", function() {

    var args;

    var multiButtonBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { }
        },
        param:  {
          values: { },
          attributes: { }
        }
      };

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
