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

define(['common-ui/prompting/builders/ParameterPanelBuilder'], function(ParameterPanelBuilder) {

  describe("ParameterPanelBuilder", function() {

    var args;

    var parameterPanelBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { },
          buildPanelComponents: function() { }
        }
      };

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
