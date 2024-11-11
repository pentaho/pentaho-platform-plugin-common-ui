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

define(['common-ui/prompting/builders/ToggleButtonBaseBuilder'], function(ToggleButtonBaseBuilder) {

  describe("ToggleButtonBaseBuilder", function() {

    var args;

    var toggleButtonBaseBuilder;

    beforeEach(function() {
      args = {
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
