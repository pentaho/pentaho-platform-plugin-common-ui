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


define(['common-ui/prompting/builders/StaticAutocompleteBoxBuilder'], function(StaticAutocompleteBoxBuilder) {

  describe("StaticAutocompleteBoxBuilder", function() {

    var args;

    var staticAutocompleteBoxBuilder;

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
      staticAutocompleteBoxBuilder = new StaticAutocompleteBoxBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(staticAutocompleteBoxBuilder.build).toThrow();
    });

    it("should return a StaticAutocompleteBoxComponent", function() {
      var component = staticAutocompleteBoxBuilder.build(args);
      expect(component.type).toBe('StaticAutocompleteBoxComponent');
    });

  });

});
