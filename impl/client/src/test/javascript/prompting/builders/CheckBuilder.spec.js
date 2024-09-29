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

define(['common-ui/prompting/builders/CheckBuilder'], function(CheckBuilder) {

  describe("CheckBuilder", function() {

    var args;
    var checkBuilder;

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
      checkBuilder = new CheckBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(checkBuilder.build).toThrow();
    });

    it("should return a CheckComponent", function() {
      var component = checkBuilder.build(args);
      expect(component.type).toBe('CheckComponent');
    });

  });

});
