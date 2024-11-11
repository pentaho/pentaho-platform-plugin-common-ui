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

define(['common-ui/prompting/builders/ExternalInputBuilder'], function(ExternalInputBuilder) {

  describe("ExternalInputBuilder", function() {

    var args;
    var externalInputBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { },
          createFormatter: function() { },
          createDataTransportFormatter: function() { }
        },
        param:  {
          values: { },
          attributes: { }
        }
      };

      externalInputBuilder = new ExternalInputBuilder();
      spyOn(externalInputBuilder, '_createFormatter').and.returnValue(null);
      spyOn(externalInputBuilder, '_createDataTransportFormatter').and.returnValue(null);
    });

    it("should throw an error building component with no parameters", function() {
      expect(externalInputBuilder.build).toThrow();
    });

    it("should return a ExternalInputComponent", function() {
      var component = externalInputBuilder.build(args);
      expect(component.type).toBe('ExternalInputComponent');
    });

  });
});
