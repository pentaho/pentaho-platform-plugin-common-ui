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

define(['common-ui/prompting/builders/RadioBuilder'], function(RadioBuilder) {

  describe("RadioBuilder", function() {

    var args;

    var radioBuilder;

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
      radioBuilder = new RadioBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(radioBuilder.build).toThrow();
    });

    it("should return a RadioComponent", function() {
      var component = radioBuilder.build(args);
      expect(component.type).toBe('radio');
    });

  });

});
