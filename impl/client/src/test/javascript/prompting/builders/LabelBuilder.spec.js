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


define(['common-ui/prompting/builders/LabelBuilder'], function(LabelBuilder) {

  describe("LabelBuilder", function() {

    var args;
    var labelBuilder;

    beforeEach(function() {
      args = {
        promptPanel: {
          generateWidgetGUID: function() { },
          getParameterName: function() { }
        },
        param:  {
          values: { },
          attributes: { },
          name: 'label-test'
        }
      };
      labelBuilder = new LabelBuilder();
    });

    it("should throw an error building component with no parameters", function() {
      expect(labelBuilder.build).toThrow();
    });

    it("should return a TextComponent", function() {
      var component = labelBuilder.build(args);
      expect(component.type).toBe('TextComponent');
      expect(component.expression()).toEqual(args.param.name);
    });

  });

});
