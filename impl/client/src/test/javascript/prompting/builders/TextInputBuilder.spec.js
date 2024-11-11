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

define(['common-ui/prompting/builders/TextInputBuilder', 'dojo/number', 'common-ui/jquery-clean'], function(TextInputBuilder, DojoNumber, $) {

  describe("TextInputBuilder", function() {

    var args;
    var textInputBuilder;
    var component;
    var ph;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { return "12345"; },
          getParameterName: function() { }
        },
        param:  {
          values: { },
          attributes: { }
        }
      };

      textInputBuilder = new TextInputBuilder();
      spyOn(textInputBuilder, '_createFormatter').and.returnValue(null);
      spyOn(textInputBuilder, '_createDataTransportFormatter').and.returnValue(null);

      component = textInputBuilder.build(args);

      ph = $('<div>').attr('id', component.htmlObject);
      $('body').append(ph);
    });

    afterEach(function() {
      ph.remove();
    });

    it("should throw an error building component with no parameters", function() {
      expect(textInputBuilder.build).toThrow();
    });

    it("should return a TextInputComponent", function() {
      expect(component.type).toBe('TextInputComponent');
    });

    /**
    it("should set parameter on prechange", function() {
      var parameterValue = 'test';
      component.dashboard = {
        setParameter: function() { },
        getParameterValue: function() { return parameterValue }
      };

      component.update();
      spyOn(component.dashboard, 'setParameter');
      spyOn(DojoNumber, 'parse').and.callFake(function() { });
      component.preChange();
      expect(component.dashboard.setParameter).toHaveBeenCalled();
    });

    it("should set element value with text parameter", function() {
      component.param.values = [
        {
          label: 'param1',
          selected: true
        }
      ];
      var parameterValue = 'test';
      component.dashboard = {
        setParameter: function() { },
        getParameterValue: function() { return parameterValue }
      };

      component.update();
      spyOn($.fn, 'attr').and.callThrough();
      component.postExecution();
      expect($.fn.attr).toHaveBeenCalled();
    });

    it("should set element value with text parameter and no selected value", function() {
      component.param.values = [
        {
          label: 'param1',
          value: 'param1',
          selected: false
        }
      ];
      var parameterValue = 'test';
      component.dashboard = {
        setParameter: function() { },
        getParameterValue: function() { return parameterValue }
      };

      component.update();
      spyOn($.fn, 'attr').and.callThrough();
      component.postExecution();
      expect($.fn.attr).toHaveBeenCalled();
    });

    it("should set element value with number parameter and with type defined", function() {
      parameterLabel = '1234';
      component.param.values = [
        {
          label: parameterLabel,
          value: parameterLabel,
          selected: true,
          type: 'java.lang.Integer'
        }
      ];
      var parameterValue = 'test';
      component.dashboard = {
        setParameter: function() { },
        getParameterValue: function() { return parameterValue; }
      };
      spyOn(DojoNumber, "format").and.callFake(function(val) { return val; });

      component.update();
      spyOn($.fn, 'attr').and.callThrough();
      component.postExecution();
      expect($.fn.attr).toHaveBeenCalled();
      expect($('input', ph).attr('value')).toBe(parameterLabel);
    });

    it("should set element value with number parameter and with type not defined", function() {
      parameterLabel = '1234';
      component.param.values = [
        {
          label: parameterLabel,
          value: parameterLabel,
          selected: true
        }
      ];
      var parameterValue = 'test';
      component.dashboard = {
        setParameter: function() { },
        getParameterValue: function() { return parameterValue; }
      };

      component.update();
      spyOn($.fn, 'attr').and.callThrough();
      component.postExecution();
      expect($.fn.attr).toHaveBeenCalled();
      expect($('input', ph).attr('value')).toBe(parameterLabel);
    });
     */

  });

});
