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

define(['common-ui/prompting/builders/ErrorLabelBuilder'], function(ErrorLabelBuilder) {

  describe("ErrorLabelBuilder", function() {

    var args;
    var errorLabelBuilder;
    var component;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { }
        },
        param:  {
          values: { },
          attributes: {
            label: 'test-label'
          }
        },
        errorMessage: 'error message'
      };
      errorLabelBuilder = new ErrorLabelBuilder();
      component = errorLabelBuilder.build(args);
    });

    it("should throw an error building component with no parameters", function() {
      expect(errorLabelBuilder.build).toThrow();
    });

    it("should return a TextComponent", function() {
      expect(component.type).toBe('TextComponent');
      expect(component.expression).toBeDefined();
      expect(component.isErrorIndicator).toBeTruthy();
    });

    it("should return the error message on the expression", function() {
      spyOn(component, 'expression').and.callThrough();

      expect(component.expression()).toEqual(args.errorMessage);
      expect(component.expression).toHaveBeenCalled();
    })

  });

});
