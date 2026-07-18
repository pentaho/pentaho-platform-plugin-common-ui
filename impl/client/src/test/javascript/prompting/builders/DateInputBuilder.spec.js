/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/


define(['common-ui/prompting/builders/DateInputBuilder'], function(DateInputBuilder) {

  describe("DateInputBuilder", function() {

    var args;
    var dateInputBuilder;

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
      dateInputBuilder = new DateInputBuilder();
      spyOn(dateInputBuilder, '_createFormatter').and.returnValue(null);
      spyOn(dateInputBuilder, '_createDataTransportFormatter').and.returnValue(null);
    });

    it("should throw an error building component with no parameters", function() {
      expect(dateInputBuilder.build).toThrow();
    });

    it("should return a DojoDateTextBoxComponent", function() {
      var component = dateInputBuilder.build(args);
      expect(component.type).toBe('DojoDateTextBoxComponent');
    });

  });

});
